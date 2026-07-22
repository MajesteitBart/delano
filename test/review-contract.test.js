const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.resolve(__dirname, "..");
const schema = readJson(path.join(repoRoot, ".agents", "schemas", "artifacts", "review.schema.json"));
const fixtureRoot = path.join(repoRoot, ".agents", "validation-fixtures", "reviews");
const manifest = readJson(path.join(fixtureRoot, "manifest.json"));
const canonicalMarkdown = fs.readFileSync(path.join(fixtureRoot, manifest.canonical_artifact), "utf8");
const canonical = parseReviewMarkdown(canonicalMarkdown);

test("review schema owns strict provenance and lifecycle vocabulary", () => {
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.properties.status.enum, ["open", "resolved", "archived"]);
  assert.deepEqual(schema.$defs.finding.properties.status.enum, ["open", "resolved", "wont-fix"]);
  assert.deepEqual(schema.$defs.anchor.properties.state.enum, ["exact", "reanchored", "unanchored"]);
  assert.equal(schema.$defs.source.properties.hash_algorithm.const, "sha256-utf8-lf-v1");
  assert.equal(schema.$defs.source.additionalProperties, false);
  assert.equal(schema.$defs.finding.additionalProperties, false);
  assert.ok(schema.required.includes("source"));
  assert.ok(schema.required.includes("findings"));
});

test("review Markdown JSON frontmatter round-trips and exposes every finding to readers", () => {
  const validation = validateReview(canonical.frontmatter);
  assert.deepEqual(validation, []);
  assert.equal(`${JSON.stringify(canonical.frontmatter, null, 2)}\n`, canonical.rawFrontmatter);
  for (const finding of canonical.frontmatter.findings) {
    assert.match(canonical.body, new RegExp(escapeRegex(finding.id)));
    assert.match(canonical.body, new RegExp(escapeRegex(finding.quote)));
    for (const message of finding.thread) {
      assert.match(canonical.body, new RegExp(escapeRegex(message.body)));
    }
  }
});

test("sha256-utf8-lf-v1 has cross-platform line-ending fixtures", () => {
  assert.equal(manifest.hash_cases.length, 5);
  for (const fixture of manifest.hash_cases) {
    assert.equal(normalizedHash(fixture.input), fixture.expected, fixture.name);
  }
  assert.equal(normalizeSource("\uFEFFa\r\nb\rc"), "a\nb\nc");
});

test("only unanchored findings may omit a source quote", () => {
  const unanchored = structuredClone(canonical.frontmatter);
  unanchored.findings[0].quote = "";
  unanchored.findings[0].anchor = {
    state: "unanchored",
    line_start: null,
    line_end: null,
    start_offset: null,
    end_offset: null,
    block_id: null
  };
  assert.deepEqual(validateReview(unanchored), []);

  const exact = structuredClone(unanchored);
  exact.findings[0].anchor = structuredClone(canonical.frontmatter.findings[0].anchor);
  assert.ok(validateReview(exact).some((error) => error.includes("quote")));
});

test("review fixtures cover committed, uncommitted, stale, resolved, archived, and privacy-invalid cases", () => {
  const seen = new Set();
  for (const fixture of manifest.review_cases) {
    const artifact = expandFixtureTokens(deepMerge(canonical.frontmatter, fixture.patch));
    const errors = validateReview(artifact);
    if (fixture.kind === "invalid") {
      assert.ok(errors.some((error) => error.includes(fixture.expected_error)), `${fixture.name}: ${errors.join("; ")}`);
      continue;
    }

    assert.deepEqual(errors, [], fixture.name);
    const currentHash = normalizedHash(fixture.current_content);
    const freshness = currentHash === artifact.source.content_hash ? "exact" : "stale";
    assert.equal(freshness, fixture.expected_freshness, fixture.name);
    assert.equal(resolveAnchorState(artifact.findings[0], fixture.current_content, freshness), fixture.expected_anchor_state, fixture.name);
    assert.equal(openFindingCount(artifact), fixture.expected_open_count, fixture.name);
    seen.add(fixture.name.split("-")[0]);
  }
  assert.deepEqual([...seen].sort(), ["archived", "committed", "resolved", "stale", "uncommitted"]);
});

function validateReview(review) {
  const errors = [];
  const allowedTop = new Set(Object.keys(schema.properties));
  for (const field of schema.required) {
    if (!(field in review)) errors.push(`missing ${field}`);
  }
  for (const field of Object.keys(review)) {
    if (!allowedTop.has(field)) errors.push(`unsupported field ${field}`);
  }
  if (!schema.properties.status.enum.includes(review.status)) errors.push("status");

  const pathPattern = new RegExp(schema.$defs.repositoryProjectPath.pattern);
  if (!pathPattern.test(review.source?.path || "")) errors.push("source.path");
  if (review.source?.hash_algorithm !== schema.$defs.source.properties.hash_algorithm.const) errors.push("source.hash_algorithm");
  if (!new RegExp(schema.$defs.contentHash.pattern).test(review.source?.content_hash || "")) errors.push("source.content_hash");
  if (review.source?.content_state === "uncommitted" && (review.source.commit !== null || review.source.blob !== null)) {
    errors.push("uncommitted source provenance");
  }
  if (review.source?.content_state === "committed" && !isGitObjectId(review.source.commit)) errors.push("committed source.commit");

  const findingIds = new Set();
  for (const finding of review.findings || []) {
    if (findingIds.has(finding.id)) errors.push(`duplicate finding ${finding.id}`);
    findingIds.add(finding.id);
    if (!schema.$defs.finding.properties.status.enum.includes(finding.status)) errors.push(`finding status ${finding.id}`);
    if (typeof finding.quote !== "string" || finding.quote.length > 20000 || (finding.anchor?.state !== "unanchored" && finding.quote.length === 0)) {
      errors.push(`finding quote ${finding.id}`);
    }
    if (finding.status === "open" && finding.resolution !== null) errors.push(`open resolution ${finding.id}`);
    if (finding.status !== "open" && !finding.resolution) errors.push(`missing resolution ${finding.id}`);
    const messageIds = new Set();
    for (const message of finding.thread || []) {
      if (messageIds.has(message.id)) errors.push(`duplicate message ${message.id}`);
      messageIds.add(message.id);
    }
  }

  const aggregate = (review.findings || []).some((finding) => finding.status === "open") ? "open" : "resolved";
  if (review.status !== "archived" && review.status !== aggregate) errors.push("review aggregate status");
  if (privacyLeak(review)) errors.push("privacy");
  return errors;
}

function normalizeSource(value) {
  const decoded = String(value);
  const withoutBom = decoded.startsWith("\uFEFF") ? decoded.slice(1) : decoded;
  return withoutBom.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function normalizedHash(value) {
  return createHash("sha256").update(normalizeSource(value), "utf8").digest("hex");
}

function resolveAnchorState(finding, currentContent, freshness) {
  if (freshness === "exact") return finding.anchor.state === "unanchored" ? "unanchored" : "exact";
  if (!finding.quote) return "unanchored";
  const normalized = normalizeSource(currentContent);
  let count = 0;
  let cursor = 0;
  while ((cursor = normalized.indexOf(finding.quote, cursor)) !== -1) {
    count += 1;
    cursor += Math.max(1, finding.quote.length);
  }
  return count === 1 ? "reanchored" : "unanchored";
}

function openFindingCount(review) {
  if (review.status === "archived") return 0;
  return review.findings.filter((finding) => finding.status === "open").length;
}

function privacyLeak(value) {
  const serialized = JSON.stringify(value);
  return /(?:[A-Za-z]:\\\\|\\\\\\\\|file:\/\/|\/(?:Users|home|tmp)\/)/.test(serialized);
}

function isGitObjectId(value) {
  return typeof value === "string" && /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(value);
}

function parseReviewMarkdown(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)---\r?\n([\s\S]*)$/);
  assert.ok(match, "review fixture must contain frontmatter");
  return {
    frontmatter: JSON.parse(match[1]),
    rawFrontmatter: match[1],
    body: match[2]
  };
}

function deepMerge(base, patch) {
  if (Array.isArray(patch)) return structuredClone(patch);
  if (!patch || typeof patch !== "object") return patch;
  const result = structuredClone(base);
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === "object" && !Array.isArray(value) && result[key] && typeof result[key] === "object") {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = structuredClone(value);
    }
  }
  return result;
}

function expandFixtureTokens(value) {
  if (Array.isArray(value)) return value.map(expandFixtureTokens);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, expandFixtureTokens(entry)]));
  }
  if (typeof value !== "string") return value;
  return value
    .replace("PATH_LEAK_TOKEN(home::reviewer::repo::.project::spec.md)", "/home/reviewer/repo/.project/spec.md")
    .replace("PATH_LEAK_TOKEN(windows-drive::reviewer::repo::.project::spec.md)", "C:\\Users\\reviewer\\repo\\.project\\spec.md")
    .replace("PATH_LEAK_TOKEN(windows-drive::reviewer::repo)", "C:\\Users\\reviewer\\repo");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
