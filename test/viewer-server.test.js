const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const { registerRepository } = require("../src/cli/lib/repository-registry");

function listen(server, port = 0) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server.address().port);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function readJson(requestUrl) {
  return new Promise((resolve, reject) => {
    http.get(requestUrl, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode !== 200) {
          reject(new Error(`Expected 200 from ${requestUrl}, got ${response.statusCode}: ${body}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    }).on("error", reject);
  });
}

function requestJson(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(requestUrl);
    const body = options.body ? JSON.stringify(options.body) : "";
    const request = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: `${parsed.pathname}${parsed.search}`,
      method: options.method || "GET",
      headers: {
        "content-type": "application/json",
        ...(body ? { "content-length": Buffer.byteLength(body) } : {})
      }
    }, (response) => {
      let raw = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        raw += chunk;
      });
      response.on("end", () => {
        let json = null;
        try {
          json = raw ? JSON.parse(raw) : null;
        } catch (error) {
          reject(error);
          return;
        }
        resolve({ status: response.statusCode, json, raw });
      });
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

function requestRaw(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(requestUrl);
    const body = Object.prototype.hasOwnProperty.call(options, "rawBody")
      ? String(options.rawBody)
      : options.body ? JSON.stringify(options.body) : "";
    const request = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: `${parsed.pathname}${parsed.search}`,
      method: options.method || "GET",
      headers: {
        "content-type": "application/json",
        ...(options.headers || {}),
        ...(body ? { "content-length": Buffer.byteLength(body) } : {})
      }
    }, (response) => {
      let raw = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        raw += chunk;
      });
      response.on("end", () => {
        resolve({ status: response.statusCode, headers: response.headers, raw });
      });
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

function beginStreamingJson(requestUrl, body) {
  const parsed = new URL(requestUrl);
  const serialized = JSON.stringify(body);
  let request;
  const response = new Promise((resolve, reject) => {
    request = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: `${parsed.pathname}${parsed.search}`,
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(serialized)
      }
    }, (incoming) => {
      let raw = "";
      incoming.setEncoding("utf8");
      incoming.on("data", (chunk) => { raw += chunk; });
      incoming.on("end", () => resolve({ status: incoming.statusCode, json: JSON.parse(raw), raw }));
    });
    request.on("error", reject);
    request.write(serialized.slice(0, 1));
  });
  return {
    response,
    finish() {
      request.end(serialized.slice(1));
    }
  };
}

async function startViewerForRepo(t, repo, environment = {}) {
  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const port = await getOpenPort();
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_ROOT: repo,
      DELANO_VIEWER_PORT: String(port),
      ...environment
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  t.after(() => {
    if (!child.killed) child.kill();
  });

  const output = await waitForViewer(child);
  const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  assert.ok(match, output);
  return `http://127.0.0.1:${match[1]}`;
}

test("viewer switches only across registered Git contexts and isolates root-scoped state", { timeout: 20000 }, async (t) => {
  const first = createGitViewerRepo("delano-viewer-context-a-", "Repository A primary.");
  const second = createGitViewerRepo("delano-viewer-context-b-", "Repository B primary.", { schemas: false });
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-home-"));
  const linked = path.join(path.dirname(first.repo), `${path.basename(first.repo)} linked`);
  const added = spawnSync("git", ["worktree", "add", "-b", "viewer-linked", linked], { cwd: first.repo, encoding: "utf8" });
  assert.equal(added.status, 0, added.stderr || added.stdout);
  fs.writeFileSync(path.join(linked, ".project", "projects", "demo", "spec.md"), "# Demo\n\nRepository A linked.\n", "utf8");
  spawnSync("git", ["add", ".project/projects/demo/spec.md"], { cwd: linked });
  const linkedCommit = spawnSync("git", ["commit", "-m", "diverge linked project"], { cwd: linked, encoding: "utf8" });
  assert.equal(linkedCommit.status, 0, linkedCommit.stderr || linkedCommit.stdout);
  const researchDir = path.join(first.repo, ".project", "projects", "demo", "research", "navigation-study");
  fs.mkdirSync(researchDir, { recursive: true });
  fs.writeFileSync(path.join(researchDir, "findings.md"), "# Findings\n", "utf8");
  fs.writeFileSync(path.join(researchDir, "progress.md"), "# Research progress\n", "utf8");
  fs.writeFileSync(path.join(researchDir, "task_plan.md"), "# Research plan\n", "utf8");

  t.after(() => fs.rmSync(first.repo, { recursive: true, force: true }));
  t.after(() => fs.rmSync(second.repo, { recursive: true, force: true }));
  t.after(() => fs.rmSync(linked, { recursive: true, force: true }));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));

  const registryOptions = { env: { DELANO_HOME: home } };
  const firstRegistration = registerRepository(first.repo, registryOptions);
  const secondRegistration = registerRepository(second.repo, registryOptions);
  const baseUrl = await startViewerForRepo(t, first.repo, { DELANO_HOME: home });
  const linkedBaseUrl = await startViewerForRepo(t, linked, { DELANO_HOME: home });
  const linkedLaunchContext = await readJson(`${linkedBaseUrl}/api/context`);
  assert.equal(linkedLaunchContext.active.worktree.role, "linked");
  assert.equal(
    fs.realpathSync.native(linkedLaunchContext.active.worktree.path).toLowerCase(),
    fs.realpathSync.native(linked).toLowerCase()
  );
  assert.equal(linkedLaunchContext.active.capabilities.dispatch, true);

  const inventory = await readJson(`${baseUrl}/api/context`);
  assert.equal(inventory.repositories.length, 2);
  assert.equal(inventory.active.repository.id, firstRegistration.entry.id);
  assert.equal(inventory.active.worktree.role, "primary");
  assert.deepEqual(inventory.active.capabilities, {
    dispatch: true,
    review: true,
    publishReview: true,
    applyContract: true
  });
  assert.equal(inventory.active.risk.level, "elevated");
  assert.ok(inventory.active.risk.indicators.includes("dirty_project_state"));
  const firstInventory = inventory.repositories.find((repository) => repository.id === firstRegistration.entry.id);
  assert.equal(firstInventory.worktrees.length, 2);
  assert.equal(firstInventory.worktrees[1].projectState.status, "diverged");

  const initialIndex = await readJson(`${baseUrl}/api/index`);
  const taskSchema = JSON.parse(fs.readFileSync(path.join(__dirname, "..", ".agents", "schemas", "artifacts", "task.schema.json"), "utf8"));
  assert.deepEqual(initialIndex.schemaOptions.task.status, taskSchema.properties.status.enum);
  assert.equal(initialIndex.schemaOptionsError, null);
  const demoProject = initialIndex.projects.find((project) => project.slug === "demo");
  assert.deepEqual(demoProject.outline.research, [
    "projects/demo/research/navigation-study/findings.md",
    "projects/demo/research/navigation-study/progress.md",
    "projects/demo/research/navigation-study/task_plan.md"
  ]);
  assert.deepEqual(
    initialIndex.docs
      .filter((doc) => doc.path.startsWith("projects/demo/research/"))
      .map((doc) => doc.role),
    ["research", "research", "research"]
  );
  assert.match((await readJson(`${baseUrl}/api/doc?path=projects%2Fdemo%2Fspec.md`)).markdown, /Repository A primary/);

  const linkedAnnotation = await requestJson(`${baseUrl}/api/annotations`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      quote: "Repository A primary.",
      comment: "Root A only",
      anchor: { start: 8, end: 29 }
    }
  });
  assert.equal(linkedAnnotation.status, 405, linkedAnnotation.raw);
  assert.match(linkedAnnotation.json.error, /read-only/i);
  const oldStream = await connectSse(`${baseUrl}/api/events`);
  const oldStreamClosed = new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), 5000);
    oldStream.response.once("close", () => {
      clearTimeout(timeout);
      resolve(true);
    });
  });

  const arbitrary = await requestJson(`${baseUrl}/api/context`, {
    method: "POST",
    body: { repositoryId: firstRegistration.entry.id, worktreeId: "not-registered" }
  });
  assert.equal(arbitrary.status, 409);

  const secondRepository = inventory.repositories.find((repository) => repository.id === secondRegistration.entry.id);
  const switchedSecond = await requestJson(`${baseUrl}/api/context`, {
    method: "POST",
    body: { repositoryId: secondRepository.id, worktreeId: secondRepository.worktrees[0].id }
  });
  assert.equal(switchedSecond.status, 200, switchedSecond.raw);
  assert.equal(switchedSecond.json.context.repository.id, secondRegistration.entry.id);
  assert.ok(switchedSecond.json.context.generation > initialIndex.context.generation);
  assert.equal(await oldStreamClosed, true);
  assert.match((await readJson(`${baseUrl}/api/doc?path=projects%2Fdemo%2Fspec.md`)).markdown, /Repository B primary/);
  assert.equal((await readJson(`${baseUrl}/api/annotations`)).annotations.length, 0);
  const secondIndex = await readJson(`${baseUrl}/api/index`);
  assert.equal(secondIndex.schemaOptions, null);
  assert.match(secondIndex.schemaOptionsError, /Artifact schema directory is missing/);

  const refreshedInventory = await readJson(`${baseUrl}/api/context`);
  const refreshedFirst = refreshedInventory.repositories.find((repository) => repository.id === firstRegistration.entry.id);
  const switchedLinked = await requestJson(`${baseUrl}/api/context`, {
    method: "POST",
    body: { repositoryId: refreshedFirst.id, worktreeId: refreshedFirst.worktrees[1].id }
  });
  assert.equal(switchedLinked.status, 200, switchedLinked.raw);
  assert.deepEqual(
    switchedLinked.json.context.capabilities,
    inventory.active.capabilities,
    JSON.stringify(switchedLinked.json.context.capabilityDenials)
  );
  assert.equal(switchedLinked.json.context.capabilityDenials.dispatch, null);
  assert.equal(switchedLinked.json.context.worktree.role, "linked");
  assert.equal(switchedLinked.json.context.worktree.projectState.diverged, true);
  assert.ok(switchedLinked.json.context.risk.indicators.includes("linked_worktree"));
  const linkedDoc = await readJson(`${baseUrl}/api/doc?path=projects%2Fdemo%2Fspec.md`);
  assert.match(linkedDoc.markdown, /Repository A linked/);

  for (const intent of ["start", "review"]) {
    const dispatched = await requestJson(`${baseUrl}/api/handover`, {
      method: "POST",
      body: {
        sourcePath: "projects/demo/spec.md",
        expectedSourceHash: linkedDoc.baseline.hash,
        intent,
        agent: "codex"
      }
    });
    assert.equal(dispatched.status, 200, dispatched.raw);
    assert.equal(dispatched.json.intent, intent);
    assert.match(dispatched.json.command, /Repository|review|document|spec/i);
  }

  const annotation = await requestJson(`${baseUrl}/api/annotations`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", quote: "Repository A linked.", comment: "linked review", anchor: { start: 8, end: 28 } }
  });
  assert.equal(annotation.status, 405, annotation.raw);
  assert.match(annotation.json.error, /read-only/i);

  const racing = beginStreamingJson(`${baseUrl}/api/handover`, {
    sourcePath: "projects/demo/spec.md",
    expectedSourceHash: linkedDoc.baseline.hash,
    intent: "start",
    agent: "codex"
  });
  await new Promise((resolve) => setTimeout(resolve, 50));
  const switchedDuringRequest = await requestJson(`${baseUrl}/api/context`, {
    method: "POST",
    body: { repositoryId: secondRepository.id, worktreeId: secondRepository.worktrees[0].id }
  });
  assert.equal(switchedDuringRequest.status, 200, switchedDuringRequest.raw);
  racing.finish();
  const staleRace = await racing.response;
  assert.equal(staleRace.status, 409, staleRace.raw);
  assert.match(staleRace.json.error, /context changed/i);

  const switchedBack = await requestJson(`${baseUrl}/api/context`, {
    method: "POST",
    body: { repositoryId: refreshedFirst.id, worktreeId: refreshedFirst.worktrees[1].id }
  });
  assert.equal(switchedBack.status, 200, switchedBack.raw);
  fs.writeFileSync(path.join(linked, ".project", "projects", "demo", "spec.md"), "# Demo\n\nRepository A linked and changed.\n", "utf8");
  const staleSource = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      expectedSourceHash: linkedDoc.baseline.hash,
      intent: "start",
      agent: "codex"
    }
  });
  assert.equal(staleSource.status, 409, staleSource.raw);
  assert.match(staleSource.json.error, /source changed/i);

  fs.writeFileSync(path.join(linked, ".project", "projects", "demo", "spec.md"), linkedDoc.markdown, "utf8");
  fs.writeFileSync(path.join(linked, "head-change.txt"), "advance HEAD\n", "utf8");
  spawnSync("git", ["add", "head-change.txt"], { cwd: linked });
  const headCommit = spawnSync("git", ["commit", "-m", "advance linked head"], { cwd: linked, encoding: "utf8" });
  assert.equal(headCommit.status, 0, headCommit.stderr || headCommit.stdout);
  const staleHead = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      expectedSourceHash: linkedDoc.baseline.hash,
      intent: "start",
      agent: "codex"
    }
  });
  assert.equal(staleHead.status, 409, staleHead.raw);
  assert.match(staleHead.json.error, /HEAD changed/i);
});

test("viewer snippets use the first regular paragraph and mark truncation", async (t) => {
  const { repo, projectDir, specPath } = createLiveViewerRepo("delano-viewer-snippet-");
  t.after(() => fs.rmSync(repo, { recursive: true, force: true }));
  fs.writeFileSync(
    specPath,
    [
      "# Spec: Demo",
      "",
      "## Executive Summary",
      "",
      "The **first regular paragraph** is the only project brief. It contains enough carefully chosen words to exceed the viewer summary boundary while still ending on a complete word instead of leaving a visibly broken fragment in the interface for operators who scan it.",
      "",
      "This second paragraph must never appear in the project brief.",
    ].join("\n"),
    "utf8"
  );
  fs.writeFileSync(
    path.join(projectDir, "plan.md"),
    "# Plan\n\nA short regular paragraph.\n",
    "utf8"
  );

  const baseUrl = await startViewerForRepo(t, repo);
  const index = await readJson(`${baseUrl}/api/index`);
  const spec = index.docs.find((doc) => doc.path === "projects/demo/spec.md");
  const plan = index.docs.find((doc) => doc.path === "projects/demo/plan.md");

  assert.match(spec.snippet, /^The first regular paragraph is the only project brief\./);
  assert.equal(spec.snippet.endsWith("…"), true);
  assert.ok(spec.snippet.length <= 180);
  assert.doesNotMatch(spec.snippet, /Spec: Demo|Executive Summary|second paragraph/);
  assert.equal(plan.snippet, "A short regular paragraph.");
  assert.equal(plan.snippet.endsWith("…"), false);
});

test("viewer publishes, indexes, resolves, archives, and freshness-checks tracked reviews", { timeout: 15000 }, async (t) => {
  const fixture = createGitViewerRepo("delano-viewer-reviews-", "Repository review backend.");
  t.after(() => fs.rmSync(fixture.repo, { recursive: true, force: true }));
  const baseUrl = await startViewerForRepo(t, fixture.repo);
  const headBefore = spawnSync("git", ["rev-parse", "HEAD"], { cwd: fixture.repo, encoding: "utf8" }).stdout.trim();
  const sourceDoc = await readJson(`${baseUrl}/api/doc?path=projects%2Fdemo%2Fspec.md`);
  const finding = {
    kind: "issue",
    severity: "major",
    quote: "Repository review backend.",
    comment: "Clarify the backend contract.",
    anchor: {
      state: "exact",
      line_start: 3,
      line_end: 3,
      start_offset: 8,
      end_offset: 34,
      block_id: "b3"
    },
    labels: ["contract"]
  };
  const publishBody = {
    sourcePath: "projects/demo/spec.md",
    expectedContentHash: sourceDoc.baseline.hash,
    sessionSlug: "backend-test",
    authorDisplayName: "Reviewer",
    findings: [finding]
  };
  const published = await requestJson(`${baseUrl}/api/reviews`, { method: "POST", body: publishBody });
  assert.equal(published.status, 201, published.raw);
  assert.equal(published.json.review.source.content_state, "committed");
  assert.equal(published.json.review.source.commit, headBefore);
  assert.equal(published.json.runtime.freshness, "exact");
  assert.match(published.json.path, /^\.project\/reviews\/review-.*-backend-test\.md$/);
  const reviewFile = path.join(fixture.repo, published.json.path);
  assert.equal(fs.existsSync(reviewFile), true);
  const reviewMarkdown = fs.readFileSync(reviewFile, "utf8");
  assert.doesNotMatch(reviewMarkdown, /[A-Za-z]:[\\/]|file:\/\//i);
  assert.equal(spawnSync("git", ["rev-parse", "HEAD"], { cwd: fixture.repo, encoding: "utf8" }).stdout.trim(), headBefore);
  const reviewHandover = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: {
      sourcePath: published.json.path.replace(/^\.project\//, ""),
      intent: "review",
      agent: "codex"
    }
  });
  assert.equal(reviewHandover.status, 200, reviewHandover.raw);
  assert.equal(reviewHandover.json.file, published.json.path);
  assert.match(reviewHandover.json.prompt, new RegExp(published.json.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal(fs.existsSync(path.join(fixture.repo, ".project", "viewer", "handovers")), false);

  const concurrentBody = { ...publishBody, sessionSlug: "concurrent-test" };
  const concurrent = await Promise.all([
    requestJson(`${baseUrl}/api/reviews`, { method: "POST", body: concurrentBody }),
    requestJson(`${baseUrl}/api/reviews`, { method: "POST", body: concurrentBody })
  ]);
  assert.ok(concurrent.every((result) => result.status === 201 || result.status === 409));
  const concurrentPaths = concurrent
    .filter((result) => result.status === 201)
    .map((result) => result.json.path);
  assert.ok(concurrentPaths.length >= 1);
  assert.equal(new Set(concurrentPaths).size, concurrentPaths.length);

  const index = await readJson(`${baseUrl}/api/index`);
  const reviewSchema = JSON.parse(fs.readFileSync(path.join(fixture.repo, ".agents", "schemas", "artifacts", "review.schema.json"), "utf8"));
  assert.deepEqual(index.reviewOptions.status, reviewSchema.properties.status.enum);
  assert.deepEqual(index.reviewOptions.severity, reviewSchema.$defs.finding.properties.severity.enum);
  assert.equal(index.docs.find((doc) => doc.path === published.json.path.replace(/^\.project\//, "")).role, "review");
  assert.equal(index.reviewSummary.open, 1 + concurrentPaths.length);
  assert.equal(index.reviewSummary.openFindings, 1 + concurrentPaths.length);

  fs.writeFileSync(fixture.specPath, "# Demo\n\nA prefix. Repository review backend.\n", "utf8");
  const stale = await requestJson(`${baseUrl}/api/reviews?id=${encodeURIComponent(published.json.review.review_id)}`);
  assert.equal(stale.status, 200, stale.raw);
  assert.equal(stale.json.runtime.freshness, "stale");
  assert.equal(stale.json.runtime.findings[0].anchorState, "reanchored");
  const reviewDocument = await readJson(
    `${baseUrl}/api/doc?path=${encodeURIComponent(published.json.path.replace(/^\.project\//, ""))}`
  );
  assert.equal(reviewDocument.role, "review");
  assert.equal(reviewDocument.reviewRuntime.freshness, "stale");
  assert.equal(reviewDocument.reviewRuntime.findings[0].anchorState, "reanchored");
  assert.match(reviewDocument.body, /Source content:/);
  assert.match(reviewDocument.body, /Clarify the backend contract\./);

  const rejectedUncommitted = await requestJson(`${baseUrl}/api/reviews`, {
    method: "POST",
    body: { ...publishBody, expectedContentHash: stale.json.runtime.currentContentHash, sessionSlug: "uncommitted-rejected" }
  });
  assert.equal(rejectedUncommitted.status, 409, rejectedUncommitted.raw);
  assert.match(rejectedUncommitted.json.error, /confirmUncommitted:true/);
  const publishedUncommitted = await requestJson(`${baseUrl}/api/reviews`, {
    method: "POST",
    body: {
      ...publishBody,
      expectedContentHash: stale.json.runtime.currentContentHash,
      sessionSlug: "uncommitted-confirmed",
      confirmUncommitted: true
    }
  });
  assert.equal(publishedUncommitted.status, 201, publishedUncommitted.raw);
  assert.equal(publishedUncommitted.json.review.source.commit, null);
  assert.equal(publishedUncommitted.json.review.source.blob, null);
  assert.match(fs.readFileSync(path.join(fixture.repo, publishedUncommitted.json.path), "utf8"), /published from uncommitted source content/i);

  const resolved = await requestJson(`${baseUrl}/api/reviews`, {
    method: "PATCH",
    body: {
      reviewId: published.json.review.review_id,
      findingId: "F-001",
      findingStatus: "resolved",
      resolutionSummary: "The contract is explicit.",
      resolvedByDisplayName: "Maintainer"
    }
  });
  assert.equal(resolved.status, 200, resolved.raw);
  assert.equal(resolved.json.review.status, "resolved");
  assert.equal(resolved.json.review.findings[0].resolution.summary, "The contract is explicit.");
  assert.equal(resolved.json.path, published.json.path);
  const archived = await requestJson(`${baseUrl}/api/reviews`, {
    method: "PATCH",
    body: { reviewId: published.json.review.review_id, status: "archived" }
  });
  assert.equal(archived.status, 200, archived.raw);
  assert.equal(archived.json.review.status, "archived");
  assert.equal(archived.json.path, published.json.path);

  const malformed = await requestJson(`${baseUrl}/api/reviews`, {
    method: "POST",
    body: {
      ...publishBody,
      expectedContentHash: stale.json.runtime.currentContentHash,
      sessionSlug: "malformed-rejected",
      confirmUncommitted: true,
      findings: [{ ...finding, severity: "catastrophic" }]
    }
  });
  assert.equal(malformed.status, 400, malformed.raw);
  const malformedThread = await requestJson(`${baseUrl}/api/reviews`, {
    method: "POST",
    body: {
      ...publishBody,
      expectedContentHash: stale.json.runtime.currentContentHash,
      sessionSlug: "malformed-thread-rejected",
      confirmUncommitted: true,
      findings: [{ ...finding, thread: [null] }]
    }
  });
  assert.equal(malformedThread.status, 400, malformedThread.raw);
  assert.match(malformedThread.json.error, /message 1 must be an object/i);
  const oversizedThread = await requestJson(`${baseUrl}/api/reviews`, {
    method: "POST",
    body: {
      ...publishBody,
      expectedContentHash: stale.json.runtime.currentContentHash,
      sessionSlug: "oversized-thread-rejected",
      confirmUncommitted: true,
      findings: [{ ...finding, thread: Array.from({ length: 201 }, () => ({ body: "Message" })) }]
    }
  });
  assert.equal(oversizedThread.status, 400, oversizedThread.raw);
  assert.match(oversizedThread.json.error, /at most 200 messages/i);
  const oversized = await requestRaw(`${baseUrl}/api/reviews`, {
    method: "POST",
    rawBody: "x".repeat(512 * 1024 + 1)
  });
  assert.equal(oversized.status, 413, oversized.raw);

  const privatePath = await requestJson(`${baseUrl}/api/reviews`, {
    method: "POST",
    body: {
      ...publishBody,
      expectedContentHash: stale.json.runtime.currentContentHash,
      sessionSlug: "privacy-rejected",
      confirmUncommitted: true,
      findings: [{ ...finding, comment: "See C:\\Users\\reviewer\\notes.txt" }]
    }
  });
  assert.equal(privatePath.status, 422, privatePath.raw);
  assert.match(privatePath.json.error, /machine-local path/i);
});

test("viewer rejects a review directory symlink that escapes the selected project", async (t) => {
  const fixture = createGitViewerRepo("delano-viewer-review-symlink-", "Symlink containment source.");
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-review-outside-"));
  t.after(() => {
    fs.rmSync(fixture.repo, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  });
  fs.symlinkSync(outside, path.join(fixture.repo, ".project", "reviews"), process.platform === "win32" ? "junction" : "dir");
  const baseUrl = await startViewerForRepo(t, fixture.repo);
  const sourceDoc = await readJson(`${baseUrl}/api/doc?path=projects%2Fdemo%2Fspec.md`);
  const response = await requestJson(`${baseUrl}/api/reviews`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      expectedContentHash: sourceDoc.baseline.hash,
      sessionSlug: "escape-rejected",
      findings: [{
        kind: "comment",
        severity: "note",
        quote: "Symlink containment source.",
        comment: "Keep the review inside the selected project.",
        anchor: { state: "unanchored", line_start: null, line_end: null, start_offset: null, end_offset: null, block_id: null }
      }]
    }
  });
  assert.equal(response.status, 400, response.raw);
  assert.match(response.json.error, /not contained in the selected \.project directory/i);
  assert.deepEqual(fs.readdirSync(outside), []);
});

test("viewer migrates legacy review evidence explicitly, idempotently, and non-destructively", async (t) => {
  const fixture = createGitViewerRepo("delano-viewer-review-migration-", "Legacy review source.");
  const viewerDir = path.join(fixture.repo, ".project", "viewer");
  const handoverDir = path.join(viewerDir, "handovers");
  fs.mkdirSync(handoverDir, { recursive: true });
  const legacyPath = path.join(viewerDir, "annotations.json");
  const legacy = {
    version: 1,
    annotations: [
      {
        id: "legacy-open",
        sourcePath: "projects/demo/spec.md",
        type: "question",
        quote: "Legacy review source.",
        comment: "Explain the legacy behavior.",
        labels: ["migration"],
        status: "open",
        createdAt: "2026-07-16T10:00:00Z",
        updatedAt: "2026-07-16T10:01:00Z",
        anchor: { lineStart: 3, blockId: "b3" },
        author: { name: "Reviewer" }
      },
      {
        id: "legacy-resolved",
        sourcePath: "projects/demo/spec.md",
        type: "comment",
        quote: "Legacy review source.",
        comment: "This was resolved already.",
        labels: [],
        status: "resolved",
        createdAt: "2026-07-16T10:02:00Z",
        updatedAt: "2026-07-16T10:03:00Z"
      },
      {
        id: "legacy-global",
        sourcePath: "projects/demo/spec.md",
        type: "global-comment",
        quote: "",
        comment: "This comment applies to the whole document.",
        labels: ["migration"],
        status: "open",
        createdAt: "2026-07-16T10:04:00Z",
        updatedAt: "2026-07-16T10:04:30Z",
        author: { name: "reviewer@example.test" }
      },
      {
        id: "missing-source",
        sourcePath: "projects/demo/missing.md",
        quote: "Missing",
        comment: "Cannot map this.",
        status: "open"
      },
      {
        id: "conflict",
        sourcePath: "projects/demo/spec.md",
        quote: "Legacy review source.",
        comment: "First duplicate.",
        status: "open"
      },
      {
        id: "conflict",
        sourcePath: "projects/demo/spec.md",
        quote: "Legacy review source.",
        comment: "Different duplicate.",
        status: "open"
      }
    ],
    applyAudit: [
      {
        id: "audit-safe",
        sourcePath: "projects/demo/spec.md",
        appliedAt: "2026-07-16T10:05:00Z",
        outcome: "applied"
      },
      { id: "audit-unsafe", sourcePath: "../outside.md", outcome: "rejected" }
    ]
  };
  fs.writeFileSync(legacyPath, `${JSON.stringify(legacy, null, 2)}\n`, "utf8");
  fs.writeFileSync(path.join(handoverDir, "handover-legacy.md"), "# Legacy handover\n", "utf8");
  const originalLegacy = fs.readFileSync(legacyPath, "utf8");
  t.after(() => fs.rmSync(fixture.repo, { recursive: true, force: true }));
  const baseUrl = await startViewerForRepo(t, fixture.repo);

  const unconfirmed = await requestJson(`${baseUrl}/api/reviews/migrate`, { method: "POST", body: {} });
  assert.equal(unconfirmed.status, 400, unconfirmed.raw);
  const first = await requestJson(`${baseUrl}/api/reviews/migrate`, { method: "POST", body: { confirm: true } });
  assert.equal(first.status, 200, first.raw);
  assert.equal(first.json.migrated.length, 1);
  assert.ok(first.json.ambiguous.some((item) => item.id === "missing-source"));
  assert.ok(first.json.ambiguous.some((item) => item.id === "conflict"));
  assert.ok(first.json.ambiguous.some((item) => item.id === "audit-unsafe"));
  assert.equal(first.json.applyAudit.length, 1);
  assert.deepEqual(first.json.handovers, [{ name: "handover-legacy.md", status: "retained-legacy-evidence" }]);
  assert.equal(fs.readFileSync(legacyPath, "utf8"), originalLegacy);
  assert.equal(fs.existsSync(path.join(handoverDir, "handover-legacy.md")), true);
  const migratedText = fs.readFileSync(path.join(fixture.repo, first.json.migrated[0].path), "utf8");
  assert.match(migratedText, /legacy-open/);
  assert.match(migratedText, /legacy-resolved/);
  assert.match(migratedText, /legacy-global/);
  assert.match(migratedText, /No source quote; global comment/);
  assert.match(migratedText, /This comment applies to the whole document/);
  assert.doesNotMatch(migratedText, /reviewer@example\.test/);
  assert.doesNotMatch(migratedText, /[A-Za-z]:[\\/]|file:\/\//i);

  const commonDir = spawnSync("git", ["rev-parse", "--git-common-dir"], { cwd: fixture.repo, encoding: "utf8" }).stdout.trim();
  const receiptRoot = path.join(path.resolve(fixture.repo, commonDir), "delano", "review-migration");
  const receipts = fs.readdirSync(receiptRoot);
  assert.equal(receipts.length, 1);
  const receipt = JSON.parse(fs.readFileSync(path.join(receiptRoot, receipts[0]), "utf8"));
  assert.equal(receipt.target, ".project/projects/demo/spec.md");
  assert.doesNotMatch(JSON.stringify(receipt), /[A-Za-z]:[\\/]|file:\/\//i);

  const second = await requestJson(`${baseUrl}/api/reviews/migrate`, { method: "POST", body: { confirm: true } });
  assert.equal(second.status, 200, second.raw);
  assert.equal(second.json.migrated.length, 0);
  assert.equal(second.json.existing.length, 1);
  assert.equal(reviewFilesOnDisk(fixture.repo).length, 1);
  assert.equal(fs.readFileSync(legacyPath, "utf8"), originalLegacy);
});

test("viewer legacy migration reports empty and corrupt stores without destructive writes", async (t) => {
  const fixture = createGitViewerRepo("delano-viewer-review-migration-errors-", "Migration error source.");
  t.after(() => fs.rmSync(fixture.repo, { recursive: true, force: true }));
  const baseUrl = await startViewerForRepo(t, fixture.repo);
  const empty = await requestJson(`${baseUrl}/api/reviews/migrate`, { method: "POST", body: { confirm: true } });
  assert.equal(empty.status, 200, empty.raw);
  assert.deepEqual(empty.json.migrated, []);
  const viewerDir = path.join(fixture.repo, ".project", "viewer");
  fs.mkdirSync(viewerDir, { recursive: true });
  const storePath = path.join(viewerDir, "annotations.json");
  fs.writeFileSync(storePath, "{not-json", "utf8");
  const corrupt = await requestJson(`${baseUrl}/api/reviews/migrate`, { method: "POST", body: { confirm: true } });
  assert.equal(corrupt.status, 200, corrupt.raw);
  assert.match(corrupt.json.ambiguous[0].reason, /malformed/i);
  assert.equal(fs.readFileSync(storePath, "utf8"), "{not-json");
  assert.equal(reviewFilesOnDisk(fixture.repo).length, 0);
});

test("viewer launches T3 Code handovers through the t3code CLI", async (t) => {
  const { repo } = createLiveViewerRepo("delano-viewer-t3code-");
  const binDir = fs.mkdtempSync(path.join(os.tmpdir(), "delano-t3code-bin-"));
  const recordPath = path.join(binDir, "invocation.json");
  const fakeScript = path.join(binDir, "fake-t3code.js");
  fs.writeFileSync(
    fakeScript,
    `const fs = require("node:fs");
let prompt = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { prompt += chunk; });
process.stdin.on("end", () => {
  fs.writeFileSync(process.env.T3CODE_FAKE_RECORD, JSON.stringify({ args: process.argv.slice(2), prompt }));
  process.stdout.write(JSON.stringify({ ok: true, data: { thread: { id: "thread-test" }, project: { id: "project-test" }, opened: { kind: "desktop-reveal", exactThread: false, url: "t3code://app/" } } }));
});
`,
    "utf8"
  );
  if (process.platform === "win32") {
    fs.writeFileSync(
      path.join(binDir, "t3code.cmd"),
      `@echo off\r\n"${process.execPath}" "%~dp0fake-t3code.js" %*\r\n`,
      "utf8"
    );
  } else {
    const executable = path.join(binDir, "t3code");
    fs.writeFileSync(executable, `#!/bin/sh\nexec "${process.execPath}" "${fakeScript}" "$@"\n`, "utf8");
    fs.chmodSync(executable, 0o755);
  }

  t.after(() => fs.rmSync(repo, { recursive: true, force: true }));
  t.after(() => fs.rmSync(binDir, { recursive: true, force: true }));

  const baseUrl = await startViewerForRepo(t, repo, {
    PATH: `${binDir}${path.delimiter}${process.env.PATH || ""}`,
    T3CODE_FAKE_RECORD: recordPath
  });
  const response = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      agent: "t3code",
      action: "launch",
      intent: "start"
    }
  });

  assert.equal(response.status, 200, response.raw);
  assert.equal(response.json.ok, true);
  assert.equal(response.json.launched, true);
  assert.equal(response.json.threadId, "thread-test");
  assert.equal(response.json.projectId, "project-test");
  assert.equal(response.json.opened.kind, "desktop-reveal");
  const invocation = JSON.parse(fs.readFileSync(recordPath, "utf8"));
  assert.deepEqual(invocation.args, [
    "--json",
    "handover",
    "--cwd",
    repo,
    "--stdin",
    "--open",
    "auto"
  ]);
  assert.match(invocation.prompt, /\.project\/projects\/demo\/spec\.md/);
});

async function getOpenPort() {
  const server = net.createServer();
  const port = await listen(server);
  await close(server);
  return port;
}

function waitForViewer(child) {
  return new Promise((resolve, reject) => {
    let ready = false;
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Timed out waiting for viewer server startup output."));
    }, 5000);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      if (!chunk.includes("Delano guarded viewer:")) return;
      ready = true;
      clearTimeout(timeout);
      resolve(chunk);
    });
    child.stderr.on("data", (chunk) => {
      if (ready) return;
      clearTimeout(timeout);
      child.kill();
      reject(new Error(chunk));
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createLiveViewerRepo(prefix) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const projectDir = path.join(repo, ".project", "projects", "demo");
  const contextDir = path.join(repo, ".project", "context");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(contextDir, { recursive: true });
  fs.writeFileSync(path.join(contextDir, "README.md"), "# Context\n", "utf8");
  const specPath = path.join(projectDir, "spec.md");
  fs.writeFileSync(specPath, "# Demo\n\nOriginal body.\n", "utf8");
  return { repo, projectDir, specPath };
}

function createGitViewerRepo(prefix, body, options = {}) {
  const fixture = createLiveViewerRepo(prefix);
  fs.writeFileSync(fixture.specPath, `# Demo\n\n${body}\n`, "utf8");
  if (options.schemas !== false) {
    const schemaDir = path.join(fixture.repo, ".agents", "schemas", "artifacts");
    fs.mkdirSync(schemaDir, { recursive: true });
    fs.copyFileSync(
      path.join(__dirname, "..", ".agents", "schemas", "artifacts", "task.schema.json"),
      path.join(schemaDir, "task.schema.json")
    );
    fs.copyFileSync(
      path.join(__dirname, "..", ".agents", "schemas", "artifacts", "review.schema.json"),
      path.join(schemaDir, "review.schema.json")
    );
  }
  spawnSync("git", ["init"], { cwd: fixture.repo, stdio: "ignore" });
  spawnSync("git", ["config", "user.email", "viewer@example.invalid"], { cwd: fixture.repo });
  spawnSync("git", ["config", "user.name", "Viewer Tests"], { cwd: fixture.repo });
  spawnSync("git", ["add", "."], { cwd: fixture.repo });
  const committed = spawnSync("git", ["commit", "-m", "viewer fixture"], { cwd: fixture.repo, encoding: "utf8" });
  assert.equal(committed.status, 0, committed.stderr || committed.stdout);
  return fixture;
}

function reviewFilesOnDisk(repo) {
  const directory = path.join(repo, ".project", "reviews");
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory).filter((name) => name.endsWith(".md"));
}

function connectSse(requestUrl) {
  return new Promise((resolve, reject) => {
    let connected = false;
    const request = http.get(requestUrl, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Expected SSE 200 from ${requestUrl}, got ${response.statusCode}`));
        return;
      }

      connected = true;
      response.setEncoding("utf8");
      let buffer = "";
      const events = [];
      const waiters = new Set();

      function rejectWaiters(error) {
        for (const waiter of waiters) {
          clearTimeout(waiter.timer);
          waiter.reject(error);
        }
        waiters.clear();
      }

      function recordEvent(frame) {
        const lines = frame.split("\n");
        const eventLine = lines.find((line) => line.startsWith("event:"));
        if (!eventLine) return;
        const dataText = lines
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice("data:".length).trimStart())
          .join("\n");
        let data = dataText;
        try {
          data = JSON.parse(dataText);
        } catch {
          // Retain non-JSON data so the helper remains a raw SSE parser.
        }
        const item = { event: eventLine.slice("event:".length).trim(), data };
        events.push(item);
        const eventIndex = events.length - 1;
        for (const waiter of waiters) {
          if (eventIndex < waiter.after || !waiter.predicate(item)) continue;
          waiters.delete(waiter);
          clearTimeout(waiter.timer);
          waiter.resolve(item);
        }
      }

      response.on("data", (chunk) => {
        buffer += chunk.replace(/\r\n/g, "\n");
        let boundary = buffer.indexOf("\n\n");
        while (boundary >= 0) {
          recordEvent(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf("\n\n");
        }
      });
      response.on("error", rejectWaiters);
      response.on("close", () => rejectWaiters(new Error("SSE connection closed.")));

      resolve({
        request,
        response,
        events,
        waitFor(predicate, options = {}) {
          const after = options.after || 0;
          const existing = events.slice(after).find(predicate);
          if (existing) return Promise.resolve(existing);
          return new Promise((resolveEvent, rejectEvent) => {
            const waiter = {
              after,
              predicate,
              resolve: resolveEvent,
              reject: rejectEvent,
              timer: null
            };
            waiter.timer = setTimeout(() => {
              waiters.delete(waiter);
              rejectEvent(new Error(`Timed out after ${options.timeout || 5000}ms waiting for SSE event.`));
            }, options.timeout || 5000);
            waiters.add(waiter);
          });
        },
        close() {
          response.destroy();
          request.destroy();
        }
      });
    });
    request.on("error", (error) => {
      if (!connected) reject(error);
    });
  });
}

function waitForChildExit(child, timeout = 3000) {
  if (child.exitCode !== null) return Promise.resolve(child.exitCode);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`Timed out after ${timeout}ms waiting for viewer process to exit.`));
    }, timeout);
    child.once("exit", (code) => {
      clearTimeout(timer);
      resolve(code);
    });
  });
}

test("viewer server starts on the next port when the requested port is occupied", async (t) => {
  const blocker = net.createServer();
  const occupiedPort = await listen(blocker);
  t.after(async () => {
    if (blocker.listening) await close(blocker);
  });

  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_PORT: String(occupiedPort)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  t.after(() => {
    if (!child.killed) child.kill();
  });

  const output = await waitForViewer(child);

  const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  assert.ok(match, output);
  assert.ok(Number(match[1]) > occupiedPort, output);
  assert.match(output, new RegExp(`\\(${occupiedPort} was unavailable\\)`));

  const index = await readJson(`http://127.0.0.1:${match[1]}/api/index`);
  assert.equal(index.contextPack.root, ".project/context");
  assert.equal(index.contextPack.orderSource, "readme");
  assert.ok(index.contextPack.files.some((file) => file.path === ".project/context/project-overview.md"));
  assert.ok(index.contextPack.profiles.some((profile) => profile.command === "delano context read --profile implementation"));
  assert.equal(index.projects.find((project) => project.slug === "context").contextPack.root, ".project/context");
});

test("viewer legacy annotation API is read-only while preserving list and export", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-annotations-"));
  const projectDir = path.join(repo, ".project", "projects", "demo");
  const viewerDir = path.join(repo, ".project", "viewer");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "context"), { recursive: true });
  fs.mkdirSync(viewerDir, { recursive: true });
  fs.writeFileSync(path.join(repo, ".project", "context", "README.md"), "# Context\n", "utf8");
  fs.writeFileSync(path.join(projectDir, "spec.md"), "# Demo\n\nReview this paragraph before implementation.\n", "utf8");
  fs.writeFileSync(path.join(viewerDir, "annotations.json"), `${JSON.stringify({
    version: 1,
    annotations: [{
      id: "legacy-annotation-1",
      sourcePath: "projects/demo/spec.md",
      repoPath: ".project/projects/demo/spec.md",
      quote: "Review this paragraph",
      comment: "Clarify the implementation scope.",
      type: "clarify",
      labels: ["clarify"],
      anchor: { lineStart: 3 },
      status: "open",
      createdAt: "2026-07-16T10:00:00Z",
      updatedAt: "2026-07-16T10:00:00Z",
      author: { name: "test" }
    }],
    applyAudit: []
  }, null, 2)}\n`, "utf8");
  t.after(() => fs.rmSync(repo, { recursive: true, force: true }));

  const baseUrl = await startViewerForRepo(t, repo);
  const listed = await requestJson(`${baseUrl}/api/annotations?path=projects%2Fdemo%2Fspec.md`);
  assert.equal(listed.status, 200, listed.raw);
  assert.equal(listed.json.annotations.length, 1);
  const exported = await requestJson(`${baseUrl}/api/annotations/export?path=projects%2Fdemo%2Fspec.md`);
  assert.equal(exported.status, 200, exported.raw);
  assert.equal(exported.json.json.annotations.length, 1);
  assert.match(exported.json.markdown, /Delano Viewer Annotations/);

  for (const method of ["POST", "PATCH", "DELETE"]) {
    const rejected = await requestJson(`${baseUrl}/api/annotations?id=legacy-annotation-1`, {
      method,
      body: method === "DELETE" ? undefined : { sourcePath: "projects/demo/spec.md" }
    });
    assert.equal(rejected.status, 405, rejected.raw);
    assert.match(rejected.json.error, /read-only/i);
  }
  assert.equal(JSON.parse(fs.readFileSync(path.join(viewerDir, "annotations.json"), "utf8")).annotations.length, 1);
});

test("viewer apply API previews diffs and rejects stale baselines", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-apply-"));
  const projectDir = path.join(repo, ".project", "projects", "demo");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "context"), { recursive: true });
  fs.writeFileSync(path.join(repo, ".project", "context", "README.md"), "# Context\n", "utf8");
  const specPath = path.join(projectDir, "spec.md");
  const original = "---\nname: Demo\n---\n\n# Demo\n\nOriginal body.\n";
  fs.writeFileSync(specPath, original, "utf8");

  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const port = await getOpenPort();
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_ROOT: repo,
      DELANO_VIEWER_PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  t.after(() => {
    if (!child.killed) child.kill();
  });

  const output = await waitForViewer(child);
  const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  assert.ok(match, output);
  const baseUrl = `http://127.0.0.1:${match[1]}`;
  const doc = await readJson(`${baseUrl}/api/doc?path=projects%2Fdemo%2Fspec.md`);

  const preview = await requestJson(`${baseUrl}/api/apply/preview`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      expectedHash: doc.baseline.hash,
      replacementMarkdown: original.replace("Original body.", "Updated body.")
    }
  });
  assert.equal(preview.status, 200);
  assert.equal(preview.json.writes, false);
  assert.ok(preview.json.diff.some((line) => line.type === "add" && line.text.includes("Updated body")));
  assert.equal(fs.readFileSync(specPath, "utf8"), original);

  fs.writeFileSync(specPath, original.replace("Original body.", "Changed elsewhere."), "utf8");
  const stale = await requestJson(`${baseUrl}/api/apply`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      expectedHash: doc.baseline.hash,
      replacementMarkdown: original.replace("Original body.", "Updated body."),
      confirm: true
    }
  });
  assert.equal(stale.status, 409);
  assert.match(stale.json.error, /baseline/);
});

test("viewer write endpoints classify malformed and oversized request bodies", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-body-errors-"));
  const projectDir = path.join(repo, ".project", "projects", "demo");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "context"), { recursive: true });
  fs.writeFileSync(path.join(repo, ".project", "context", "README.md"), "# Context\n", "utf8");
  fs.writeFileSync(path.join(projectDir, "spec.md"), "# Demo\n\nBody.\n", "utf8");

  const baseUrl = await startViewerForRepo(t, repo);

  const malformedPreview = await requestRaw(`${baseUrl}/api/apply/preview`, {
    method: "POST",
    rawBody: "{"
  });
  assert.equal(malformedPreview.status, 400);
  assert.match(JSON.parse(malformedPreview.raw).error, /Malformed JSON/);

  const malformedApply = await requestRaw(`${baseUrl}/api/apply`, {
    method: "POST",
    rawBody: "{"
  });
  assert.equal(malformedApply.status, 400);
  assert.match(JSON.parse(malformedApply.raw).error, /Malformed JSON/);

  const oversized = await requestRaw(`${baseUrl}/api/handover`, {
    method: "POST",
    rawBody: "x".repeat(512 * 1024 + 1)
  });
  assert.equal(oversized.status, 413);
  assert.match(JSON.parse(oversized.raw).error, /too large/);
});

test("viewer guarded apply uses identical safety checks in a selected linked worktree", async (t) => {
  const fixture = createGitViewerRepo("delano-viewer-linked-apply-", "Linked apply source.");
  const linked = path.join(path.dirname(fixture.repo), `${path.basename(fixture.repo)} linked-apply`);
  const added = spawnSync("git", ["worktree", "add", "-b", "linked-apply", linked], { cwd: fixture.repo, encoding: "utf8" });
  assert.equal(added.status, 0, added.stderr || added.stdout);
  t.after(() => fs.rmSync(fixture.repo, { recursive: true, force: true }));
  t.after(() => fs.rmSync(linked, { recursive: true, force: true }));
  const baseUrl = await startViewerForRepo(t, linked);
  const context = await readJson(`${baseUrl}/api/context`);
  assert.equal(context.active.worktree.role, "linked");
  assert.equal(context.active.capabilities.applyContract, true);
  const doc = await readJson(`${baseUrl}/api/doc?path=projects%2Fdemo%2Fspec.md`);
  const replacementMarkdown = doc.markdown.replace("Linked apply source.", "Linked apply completed.");

  const unconfirmed = await requestJson(`${baseUrl}/api/apply`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      expectedHash: doc.baseline.hash,
      replacementMarkdown
    }
  });
  assert.equal(unconfirmed.status, 400, unconfirmed.raw);
  assert.match(unconfirmed.json.error, /confirm:true/);
  const applied = await requestJson(`${baseUrl}/api/apply`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      expectedHash: doc.baseline.hash,
      replacementMarkdown,
      confirm: true
    }
  });
  assert.equal(applied.status, 200, applied.raw);
  assert.match(fs.readFileSync(path.join(linked, ".project", "projects", "demo", "spec.md"), "utf8"), /Linked apply completed/);
  const audit = JSON.parse(fs.readFileSync(path.join(linked, ".project", "viewer", "annotations.json"), "utf8"));
  assert.equal(audit.applyAudit.length, 1);
  assert.equal(audit.applyAudit[0].sourcePath, "projects/demo/spec.md");

  const stale = await requestJson(`${baseUrl}/api/apply`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      expectedHash: doc.baseline.hash,
      replacementMarkdown: `${replacementMarkdown}\nStale overwrite.\n`,
      confirm: true
    }
  });
  assert.equal(stale.status, 409, stale.raw);
  assert.match(stale.json.error, /baseline does not match expectedHash/);
});

test("viewer annotation store parse errors fail fast without overwriting state", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-corrupt-store-"));
  const projectDir = path.join(repo, ".project", "projects", "demo");
  const viewerDir = path.join(repo, ".project", "viewer");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "context"), { recursive: true });
  fs.mkdirSync(viewerDir, { recursive: true });
  fs.writeFileSync(path.join(repo, ".project", "context", "README.md"), "# Context\n", "utf8");
  const specPath = path.join(projectDir, "spec.md");
  const original = "# Demo\n\nOriginal body.\n";
  fs.writeFileSync(specPath, original, "utf8");
  const storePath = path.join(viewerDir, "annotations.json");
  fs.writeFileSync(storePath, "{not-json", "utf8");

  const baseUrl = await startViewerForRepo(t, repo);

  const listed = await requestRaw(`${baseUrl}/api/annotations?path=projects%2Fdemo%2Fspec.md`);
  assert.equal(listed.status, 500);
  assert.match(JSON.parse(listed.raw).error, /annotations\.json is malformed/);

  const created = await requestJson(`${baseUrl}/api/annotations`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      quote: "Original body",
      comment: "Do not overwrite the corrupt store."
    }
  });
  assert.equal(created.status, 500);
  assert.equal(fs.readFileSync(storePath, "utf8"), "{not-json");

  const handover = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md" }
  });
  assert.equal(handover.status, 500);
  assert.equal(fs.existsSync(path.join(viewerDir, "handovers")), false);

  const doc = await requestJson(`${baseUrl}/api/doc?path=projects%2Fdemo%2Fspec.md`);
  assert.equal(doc.status, 200);
  const applied = await requestJson(`${baseUrl}/api/apply`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      expectedHash: doc.json.baseline.hash,
      replacementMarkdown: original.replace("Original body.", "Updated body."),
      confirm: true
    }
  });
  assert.equal(applied.status, 500);
  assert.equal(fs.readFileSync(specPath, "utf8"), original);
});

test("viewer index falls back when context metadata cannot be listed", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-context-"));
  const contextDir = path.join(repo, ".project", "context");
  fs.mkdirSync(contextDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "projects"), { recursive: true });
  fs.writeFileSync(
    path.join(contextDir, "README.md"),
    "# Context Pack\n\nRequired context files:\n\n- `../outside.md`\n",
    "utf8"
  );

  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const port = await getOpenPort();
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_ROOT: repo,
      DELANO_VIEWER_PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  t.after(() => {
    if (!child.killed) child.kill();
  });

  const output = await waitForViewer(child);
  const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  assert.ok(match, output);

  const index = await readJson(`http://127.0.0.1:${match[1]}/api/index`);
  assert.equal(index.contextPack.root, ".project/context");
  assert.equal(index.contextPack.orderSource, "viewer-index-fallback");
  assert.deepEqual(index.contextPack.files, []);
  assert.ok(index.contextPack.profiles.some((profile) => profile.command === "delano context read --profile implementation"));
  assert.ok(index.contextPack.warnings.some((warning) => warning.includes("Shared context reader failed")));
});

test("viewer handover API writes a handover file and returns agent commands", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-handover-"));
  const projectDir = path.join(repo, ".project", "projects", "demo");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "context"), { recursive: true });
  fs.writeFileSync(path.join(repo, ".project", "context", "README.md"), "# Context\n", "utf8");
  const specPath = path.join(projectDir, "spec.md");
  const original = "# Demo\n\nReview this paragraph before implementation.\n";
  fs.writeFileSync(specPath, original, "utf8");
  fs.writeFileSync(path.join(projectDir, "spec$(touch pwned).md"), "# Demo\n\nShell metacharacters stay inert.\n", "utf8");
  const viewerDir = path.join(repo, ".project", "viewer");
  fs.mkdirSync(viewerDir, { recursive: true });
  fs.writeFileSync(path.join(viewerDir, "annotations.json"), `${JSON.stringify({
    version: 1,
    annotations: [{
      id: "legacy-handover-annotation",
      sourcePath: "projects/demo/spec.md",
      repoPath: ".project/projects/demo/spec.md",
      quote: "Review this paragraph",
      comment: "Clarify implementation scope.",
      type: "comment",
      labels: [],
      anchor: { lineStart: 3 },
      status: "open",
      createdAt: "2026-07-16T10:00:00Z",
      updatedAt: "2026-07-16T10:00:00Z",
      author: { name: "Reviewer" }
    }],
    applyAudit: []
  }, null, 2)}\n`, "utf8");
  fs.mkdirSync(path.join(projectDir, "tasks"), { recursive: true });
  fs.writeFileSync(
    path.join(projectDir, "tasks", "T-001-demo-task.md"),
    "---\nid: T-001\nname: Demo task\nstatus: open\nworkstream: WS-A\n---\n\n# Task: Demo task\n",
    "utf8"
  );

  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const port = await getOpenPort();
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_ROOT: repo,
      DELANO_VIEWER_PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  t.after(() => {
    if (!child.killed) child.kill();
  });

  const output = await waitForViewer(child);
  const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  assert.ok(match, output);
  const baseUrl = `http://127.0.0.1:${match[1]}`;

  const annotationId = "legacy-handover-annotation";

  const handover = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md" }
  });
  assert.equal(handover.status, 200);
  assert.equal(handover.json.ok, true);
  assert.equal(handover.json.launched, false);
  assert.equal(handover.json.agent, "chatgpt");
  assert.equal(handover.json.annotationCount, 1);
  assert.match(handover.json.file, /^\.project\/viewer\/handovers\/handover-.*-spec\.md$/);
  assert.ok(handover.json.command.startsWith(`codex '`), handover.json.command);
  assert.ok(handover.json.prompt.includes(handover.json.file), handover.json.prompt);
  assert.ok(handover.json.prompt.includes(".project/projects/demo/spec.md"), handover.json.prompt);
  assert.ok(handover.json.deepLink.startsWith("codex://new?prompt="), handover.json.deepLink);
  assert.ok(handover.json.deepLink.includes(`&path=${encodeURIComponent(repo)}`), handover.json.deepLink);

  const handoverFile = path.join(repo, handover.json.file.replace(/^\.project\//, ".project/"));
  assert.ok(fs.existsSync(handoverFile), handoverFile);
  const handoverText = fs.readFileSync(handoverFile, "utf8");
  assert.match(handoverText, /# Delano Review Handover/);
  assert.match(handoverText, /Clarify implementation scope\./);
  assert.match(handoverText, /\.project\/projects\/demo\/spec\.md/);

  const codex = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", agent: "codex", ids: [annotationId] }
  });
  assert.equal(codex.status, 200);
  assert.equal(codex.json.agent, "codex");
  assert.ok(codex.json.command.startsWith(`codex '`), codex.json.command);
  assert.equal(codex.json.deepLink, null);

  const claudeCode = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", agent: "claude-code", ids: [annotationId] }
  });
  assert.equal(claudeCode.status, 200);
  assert.equal(claudeCode.json.agent, "claude-code");
  assert.equal(claudeCode.json.annotationCount, 1);
  assert.ok(claudeCode.json.command.startsWith(`claude '`), claudeCode.json.command);
  assert.equal(claudeCode.json.copyKind, "command");
  assert.equal(claudeCode.json.copyValue, claudeCode.json.command);
  assert.ok(claudeCode.json.deepLink.startsWith("claude://code/new?q="), claudeCode.json.deepLink);
  assert.ok(claudeCode.json.deepLink.includes(`&folder=${encodeURIComponent(repo)}`), claudeCode.json.deepLink);

  const claude = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", agent: "claude", ids: [annotationId] }
  });
  assert.equal(claude.status, 200);
  assert.equal(claude.json.agent, "claude");
  assert.equal(claude.json.annotationCount, 1);
  assert.ok(claude.json.command.startsWith(`claude '`), claude.json.command);
  assert.equal(claude.json.copyKind, "command");
  assert.equal(claude.json.copyValue, claude.json.command);
  assert.ok(claude.json.deepLink.startsWith("claude://claude.ai/new?q="), claude.json.deepLink);

  const cursor = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", agent: "cursor", ids: [annotationId] }
  });
  assert.equal(cursor.status, 400);

  const t3code = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", agent: "t3code", ids: [annotationId] }
  });
  assert.equal(t3code.status, 200);
  assert.equal(t3code.json.agent, "t3code");
  assert.ok(t3code.json.command.startsWith("t3code handover --cwd "), t3code.json.command);
  assert.match(t3code.json.command, / --prompt '/);
  assert.equal(t3code.json.copyKind, "command");
  assert.equal(t3code.json.copyValue, t3code.json.command);
  assert.equal(t3code.json.deepLink, null);

  const unsupportedAgent = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", agent: "not-an-agent" }
  });
  assert.equal(unsupportedAgent.status, 400);

  const filtered = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", ids: ["missing-id"] }
  });
  assert.equal(filtered.status, 200);
  assert.equal(filtered.json.annotationCount, 0);

  const shellMeta = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec$(touch pwned).md" }
  });
  assert.equal(shellMeta.status, 200);
  assert.ok(shellMeta.json.command.startsWith(`codex '`), shellMeta.json.command);
  assert.match(shellMeta.json.command, /spec\$\(touch pwned\)\.md/);
  assert.doesNotMatch(shellMeta.json.command, /^codex \"/);

  if (process.platform !== "win32") {
    const shellCheck = spawnSync("bash", ["-lc", `codex() { printf '%s' "$1"; }; ${shellMeta.json.command}`], {
      cwd: repo,
      encoding: "utf8"
    });
    assert.equal(shellCheck.status, 0, shellCheck.stderr || shellCheck.stdout);
    assert.match(shellCheck.stdout, /spec\$\(touch pwned\)\.md/);
    assert.equal(fs.existsSync(path.join(repo, "pwned")), false, shellMeta.json.command);
  }

  const startWork = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/tasks/T-001-demo-task.md", intent: "start" }
  });
  assert.equal(startWork.status, 200);
  assert.equal(startWork.json.intent, "start");
  assert.equal(startWork.json.file, null);
  assert.match(startWork.json.prompt, /^Work the Delano task \.project\/projects\/demo\/tasks\/T-001-demo-task\.md/);
  assert.ok(startWork.json.deepLink.startsWith("codex://new?prompt="), startWork.json.deepLink);

  const reviewWork = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", intent: "review" }
  });
  assert.equal(reviewWork.status, 200);
  assert.equal(reviewWork.json.intent, "review");
  assert.match(reviewWork.json.prompt, /^Review the delivered work for the Delano document/);
  assert.doesNotMatch(reviewWork.json.prompt, /Reviewer annotations are in \.project\/viewer\/handovers\//);
  assert.equal(reviewWork.json.file, null, "review dispatch should not generate canonical handover Markdown");

  const reviewNoFeedback = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/tasks/T-001-demo-task.md", intent: "review" }
  });
  assert.equal(reviewNoFeedback.status, 200);
  assert.equal(reviewNoFeedback.json.file, null);
  assert.doesNotMatch(reviewNoFeedback.json.prompt, /Reviewer annotations/);

  const unknown = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/missing.md" }
  });
  assert.equal(unknown.status, 404);

  const wrongMethod = await requestJson(`${baseUrl}/api/handover`, { method: "GET" });
  assert.equal(wrongMethod.status, 405);

  assert.equal(fs.readFileSync(specPath, "utf8"), original);
});

test("viewer SSE reports external markdown changes and debounces burst writes", { timeout: 12000 }, async (t) => {
  const { repo, specPath } = createLiveViewerRepo("delano-viewer-sse-");
  const baseUrl = await startViewerForRepo(t, repo);
  const stream = await connectSse(`${baseUrl}/api/events`);
  t.after(() => stream.close());

  assert.equal(stream.response.headers["content-type"], "text/event-stream");
  assert.equal(stream.response.headers["cache-control"], "no-cache");
  assert.equal(stream.response.headers.connection, "keep-alive");

  const modifiedAt = Date.now();
  fs.writeFileSync(specPath, "# Demo\n\nModified externally with a longer body.\n", "utf8");
  const modified = await stream.waitFor(
    (item) => item.event === "doc-changed"
      && item.data.kind === "modified"
      && item.data.path === "projects/demo/spec.md",
    { timeout: 4000 }
  );
  const deliveryMs = Date.now() - modifiedAt;
  assert.ok(deliveryMs < 2000, `Expected SSE delivery within 2s, got ${deliveryMs}ms.`);
  assert.ok(Number.isFinite(Date.parse(modified.data.at)), modified.data.at);

  await delay(400);
  const burstStart = stream.events.length;
  for (let index = 0; index < 20; index += 1) {
    fs.writeFileSync(specPath, `# Demo\n\nBurst write ${index} ${"x".repeat(index)}\n`, "utf8");
  }
  await stream.waitFor(
    (item) => item.event === "doc-changed"
      && item.data.kind === "modified"
      && item.data.path === "projects/demo/spec.md",
    { after: burstStart, timeout: 4000 }
  );
  await delay(750);

  const burstEvents = stream.events.slice(burstStart).filter(
    (item) => item.event === "doc-changed" && item.data.path === "projects/demo/spec.md"
  );
  assert.ok(burstEvents.length >= 1, "Expected the burst to produce a doc-changed event.");
  assert.ok(burstEvents.length <= 2, `Expected at most 2 burst events, got ${burstEvents.length}.`);
});

test("viewer activity records created and deleted files newest first and caps history", { timeout: 12000 }, async (t) => {
  const { repo, projectDir } = createLiveViewerRepo("delano-viewer-activity-");
  const baseUrl = await startViewerForRepo(t, repo);
  const stream = await connectSse(`${baseUrl}/api/events`);
  t.after(() => stream.close());

  const activityPath = path.join(projectDir, "activity.md");
  const createdStart = stream.events.length;
  fs.writeFileSync(activityPath, "# Activity\n", "utf8");
  const created = await stream.waitFor(
    (item) => item.event === "doc-changed"
      && item.data.kind === "created"
      && item.data.path === "projects/demo/activity.md",
    { after: createdStart, timeout: 4000 }
  );

  const deletedStart = stream.events.length;
  fs.unlinkSync(activityPath);
  const deleted = await stream.waitFor(
    (item) => item.event === "doc-changed"
      && item.data.kind === "deleted"
      && item.data.path === "projects/demo/activity.md",
    { after: deletedStart, timeout: 4000 }
  );

  const activity = await readJson(`${baseUrl}/api/activity`);
  assert.equal(activity.ok, true);
  const tracked = activity.events.filter((event) => event.path === "projects/demo/activity.md");
  assert.deepEqual(tracked.map((event) => event.kind), ["deleted", "created"]);
  assert.ok(Date.parse(tracked[0].at) >= Date.parse(tracked[1].at));
  assert.equal(created.data.kind, "created");
  assert.equal(deleted.data.kind, "deleted");

  const stagingDir = path.join(repo, "bulk-activity-staging");
  fs.mkdirSync(stagingDir);
  for (let index = 0; index < 205; index += 1) {
    fs.writeFileSync(path.join(stagingDir, `event-${String(index).padStart(3, "0")}.md`), `# Event ${index}\n`, "utf8");
  }
  const bulkStart = stream.events.length;
  fs.renameSync(stagingDir, path.join(projectDir, "bulk"));
  await stream.waitFor(
    (item) => item.event === "index-changed" && item.data.count === 205,
    { after: bulkStart, timeout: 5000 }
  );
  const capped = await readJson(`${baseUrl}/api/activity`);
  assert.equal(capped.events.length, 200);
  assert.ok(capped.events.every((event) => event.kind === "created" && event.path.endsWith(".md")));
});

test("viewer remains responsive after SSE disconnect and exits cleanly", { timeout: 10000 }, async (t) => {
  const { repo } = createLiveViewerRepo("delano-viewer-sse-close-");
  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const port = await getOpenPort();
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_ROOT: repo,
      DELANO_VIEWER_PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  t.after(() => {
    if (child.exitCode === null) child.kill();
  });

  const output = await waitForViewer(child);
  const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  assert.ok(match, output);
  const baseUrl = `http://127.0.0.1:${match[1]}`;
  const stream = await connectSse(`${baseUrl}/api/events`);
  stream.close();
  await delay(100);

  const index = await readJson(`${baseUrl}/api/index`);
  assert.equal(index.repo, path.basename(repo));
  child.kill();
  await waitForChildExit(child, 3000);
  assert.ok(child.exitCode !== null || child.signalCode !== null);
});
