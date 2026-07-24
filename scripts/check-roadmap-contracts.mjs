import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { deriveClosureEligibility, parseRoadmapSections } = require("../src/cli/lib/roadmap-projection");
const { parseFrontmatter } = require("../src/cli/lib/project-state");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REQUIRED_FIELDS = ["id", "name", "status", "horizon", "created", "updated"];
const REQUIRED_SECTIONS = ["Strategic intent", "Outcome signal", "Boundaries", "Closure evidence"];
const ITEM_STATUSES = new Set(["planned", "active", "done", "deferred"]);
const HORIZONS = new Set(["now", "next", "later"]);

export function checkRoadmapContracts(root) {
  return validateRoadmapState(loadRoadmapState(root));
}

export function loadRoadmapState(root) {
  const roadmapDir = path.join(root, ".project", "roadmap");
  const projectsDir = path.join(root, ".project", "projects");
  const items = [];
  const projects = [];

  if (existsSync(roadmapDir)) {
    for (const name of readdirSync(roadmapDir).sort()) {
      const absolutePath = path.join(roadmapDir, name);
      if (name === "README.md" || !name.toLowerCase().endsWith(".md")) continue;
      if (!existsSync(absolutePath)) continue;
      const text = readFileSync(absolutePath, "utf8").replace(/\r\n/g, "\n");
      items.push(toItemRecord(`.project/roadmap/${name}`, text));
    }
  }

  if (existsSync(projectsDir)) {
    for (const slug of readdirSync(projectsDir).sort()) {
      const specPath = path.join(projectsDir, slug, "spec.md");
      if (!existsSync(specPath)) continue;
      const text = readFileSync(specPath, "utf8").replace(/\r\n/g, "\n");
      projects.push({
        slug,
        path: `.project/projects/${slug}/spec.md`,
        frontmatter: parseFrontmatter(text)
      });
    }
  }

  return { items, projects };
}

export function toItemRecord(repoPath, text) {
  const headings = [...text.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1].trim());
  return {
    path: toRepoPath(repoPath),
    frontmatter: parseFrontmatter(text),
    headings,
    sections: parseRoadmapSections(text)
  };
}

export function validateRoadmapState(state) {
  const errors = [];
  const itemsById = new Map();

  for (const item of state.items || []) {
    validateItem(item, errors);
    const id = String(item.frontmatter?.id || "");
    if (!itemsById.has(id)) itemsById.set(id, []);
    itemsById.get(id).push(item);
  }

  for (const [id, items] of itemsById) {
    if (id && items.length > 1) {
      for (const item of items) {
        addError(errors, item.path, "duplicate-item-id", `${id} resolves to ${items.length} roadmap items.`);
      }
    }
  }

  for (const project of state.projects || []) {
    const reference = String(project.frontmatter?.roadmap_item || "").trim();
    if (!reference) continue;
    if (!/^RM-[0-9]{3}$/.test(reference)) {
      addError(errors, project.path, "invalid-project-reference", `roadmap_item must use RM-### form; received ${reference}.`);
      continue;
    }
    const matches = itemsById.get(reference) || [];
    if (matches.length !== 1) {
      addError(errors, project.path, "unresolved-project-reference", `roadmap_item ${reference} resolves to ${matches.length} items; expected exactly one.`);
    }
  }

  for (const item of state.items || []) {
    const id = String(item.frontmatter?.id || "");
    if (!id || (itemsById.get(id) || []).length !== 1) continue;
    const linkedProjects = (state.projects || [])
      .filter((project) => project.frontmatter?.roadmap_item === id)
      .map((project) => ({
        slug: project.slug,
        status: String(project.frontmatter?.status || ""),
        updated: String(project.frontmatter?.updated || ""),
        path: project.path,
        roadmapItem: id
      }));
    if (item.frontmatter.status === "active" && !linkedProjects.some((project) => project.status === "active")) {
      addError(errors, item.path, "active-without-active-project", "active roadmap items require at least one linked active project.");
    }
    if (item.frontmatter.status === "done") {
      const closure = deriveClosureEligibility({
        closureEvidence: item.sections["Closure evidence"] || ""
      }, linkedProjects);
      const ruleByReason = {
        "missing-closure-evidence": "done-missing-closure-evidence",
        "no-complete-linked-project": "done-without-complete-project",
        "non-terminal-linked-projects": "done-with-non-terminal-project"
      };
      for (const reason of closure.reasons) {
        addError(errors, item.path, ruleByReason[reason], `done roadmap item violates closure gate: ${reason}.`);
      }
    }
  }

  return errors.sort((left, right) => left.path.localeCompare(right.path) || left.rule.localeCompare(right.rule));
}

function validateItem(item, errors) {
  const frontmatter = item.frontmatter || {};
  const pathMatch = /^\.project\/roadmap\/(RM-[0-9]{3})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.exec(item.path);
  if (!pathMatch) {
    addError(errors, item.path, "invalid-item-path", "roadmap item path must match .project/roadmap/RM-###-<slug>.md.");
  } else if (frontmatter.id && pathMatch[1] !== frontmatter.id) {
    addError(errors, item.path, "item-id-mismatch", `frontmatter id ${frontmatter.id} must match filename prefix ${pathMatch[1]}.`);
  }

  for (const field of REQUIRED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(frontmatter, field) || String(frontmatter[field]).trim() === "") {
      addError(errors, item.path, "missing-required-field", `roadmap item requires non-empty frontmatter field ${field}.`);
    }
  }
  for (const field of Object.keys(frontmatter)) {
    if (!REQUIRED_FIELDS.includes(field)) {
      addError(errors, item.path, "unsupported-frontmatter-field", `roadmap item frontmatter does not allow ${field}.`);
    }
  }
  if (frontmatter.id && !/^RM-[0-9]{3}$/.test(frontmatter.id)) {
    addError(errors, item.path, "invalid-item-id", `id must use RM-### form; received ${frontmatter.id}.`);
  }
  if (frontmatter.status && !ITEM_STATUSES.has(frontmatter.status)) {
    addError(errors, item.path, "invalid-item-status", `status must be planned, active, done, or deferred; received ${frontmatter.status}.`);
  }
  if (frontmatter.horizon && !HORIZONS.has(frontmatter.horizon)) {
    addError(errors, item.path, "invalid-item-horizon", `horizon must be now, next, or later; received ${frontmatter.horizon}.`);
  }
  if (frontmatter.status === "active" && frontmatter.horizon !== "now") {
    addError(errors, item.path, "active-horizon", "active roadmap items require horizon: now.");
  }

  for (const field of ["created", "updated"]) {
    if (frontmatter[field] && !validUtcIso(frontmatter[field])) {
      addError(errors, item.path, "invalid-timestamp", `${field} must be a real UTC ISO8601 timestamp using YYYY-MM-DDTHH:MM:SSZ.`);
    }
  }
  if (validUtcIso(frontmatter.created) && validUtcIso(frontmatter.updated)
    && Date.parse(frontmatter.created) > Date.parse(frontmatter.updated)) {
    addError(errors, item.path, "created-after-updated", "created is immutable and cannot be later than updated.");
  }

  const positions = [];
  for (const section of REQUIRED_SECTIONS) {
    const occurrences = item.headings.filter((heading) => heading === section).length;
    if (occurrences !== 1) {
      addError(errors, item.path, "invalid-body-sections", `body requires exactly one ## ${section} section; found ${occurrences}.`);
    }
    positions.push(item.headings.indexOf(section));
  }
  if (positions.every((position) => position >= 0)
    && positions.some((position, index) => index > 0 && position < positions[index - 1])) {
    addError(errors, item.path, "invalid-body-section-order", `body sections must appear in order: ${REQUIRED_SECTIONS.join(", ")}.`);
  }
}

function addError(errors, artifactPath, rule, message) {
  errors.push({ path: toRepoPath(artifactPath), rule, message });
}

function validUtcIso(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString().replace(".000Z", "Z") === value;
}

function toRepoPath(value) {
  return String(value || "").replace(/\\/g, "/");
}

function resolveRoot() {
  const rootIndex = process.argv.indexOf("--root");
  if (rootIndex >= 0) return path.resolve(process.argv[rootIndex + 1] || "");
  return path.resolve(__dirname, "..");
}

function main() {
  const root = resolveRoot();
  const errors = checkRoadmapContracts(root);
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ ok: errors.length === 0, errors }, null, 2));
  } else if (errors.length === 0) {
    console.log("Roadmap contract check passed.");
  } else {
    console.error("Roadmap contract check failed:");
    for (const error of errors) console.error(`- ${error.path} [${error.rule}]: ${error.message}`);
  }
  if (errors.length > 0) process.exitCode = 1;
}

if (path.resolve(process.argv[1] || "") === __filename) main();
