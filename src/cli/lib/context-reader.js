const fs = require("node:fs");
const path = require("node:path");

const { CliError } = require("./errors");
const { findDelanoRoot } = require("./runtime");

const CONTEXT_ROOT = ".project/context";
const README_FILE = "README.md";
const DEFAULT_MAX_CHARS = 20000;
const ALL_PROFILE_MAX_CHARS = 40000;
const PER_FILE_MAX_CHARS = 12000;

const FALLBACK_ORDER = [
  "project-overview.md",
  "project-brief.md",
  "product-context.md",
  "tech-context.md",
  "project-structure.md",
  "system-patterns.md",
  "project-style-guide.md",
  "gui-testing.md",
  "progress.md"
];

const PROFILES = {
  overview: [
    "project-overview.md",
    "project-brief.md",
    "product-context.md",
    "progress.md"
  ],
  implementation: [
    "project-overview.md",
    "project-brief.md",
    "tech-context.md",
    "project-structure.md",
    "system-patterns.md",
    "progress.md"
  ],
  ui: [
    "project-overview.md",
    "project-brief.md",
    "product-context.md",
    "project-style-guide.md",
    "gui-testing.md",
    "progress.md"
  ]
};

class ContextReaderError extends CliError {
  constructor(message, code = "context-reader-error") {
    super(message, 1);
    this.code = code;
  }
}

function requireContextRoot(startDir = process.cwd()) {
  const repoRoot = findDelanoRoot(startDir);
  if (!repoRoot) {
    throw new ContextReaderError(
      "Could not find a Delano repository from the current working directory. Run this inside a repo containing .project/ and .agents/scripts/pm/.",
      "repo-not-found"
    );
  }
  return repoRoot;
}

function getContextPaths(repoRoot) {
  const contextDir = path.join(repoRoot, ".project", "context");
  const contextReal = fs.existsSync(contextDir) ? fs.realpathSync.native(contextDir) : contextDir;
  return { contextDir, contextReal };
}

function toPosix(value) {
  return value.replace(/\\/g, "/");
}

function contextRepoPath(contextPath) {
  return `${CONTEXT_ROOT}/${toPosix(contextPath)}`;
}

function compareContextPaths(a, b) {
  return a.localeCompare(b, "en", { sensitivity: "base" });
}

function isMarkdownPath(contextPath) {
  return contextPath.toLowerCase().endsWith(".md");
}

function hasTraversalSegment(value) {
  return toPosix(value).split("/").some((segment) => segment === "..");
}

function decodeSelector(selector) {
  try {
    return decodeURIComponent(selector);
  } catch {
    throw new ContextReaderError("Context selector contains invalid percent encoding.", "unsafe-selector");
  }
}

function normalizeSelector(selector) {
  if (typeof selector !== "string" || selector.trim() === "") {
    throw new ContextReaderError("Context selector must be a non-empty markdown path.", "unsafe-selector");
  }

  const raw = selector.trim();
  if (raw.includes("\0")) {
    throw new ContextReaderError("Context selector contains an invalid null byte.", "unsafe-selector");
  }
  if (path.isAbsolute(raw) || /^[A-Za-z]:[\\/]/.test(raw) || raw.startsWith("/") || raw.startsWith("\\")) {
    throw new ContextReaderError("Context selector must be relative to .project/context.", "unsafe-selector");
  }

  let normalized = toPosix(decodeSelector(raw)).replace(/^\.\//, "");
  if (path.posix.isAbsolute(normalized) || normalized.startsWith("/") || normalized.startsWith("\\")) {
    throw new ContextReaderError("Context selector must be relative to .project/context.", "unsafe-selector");
  }
  if (normalized === CONTEXT_ROOT || normalized === `${CONTEXT_ROOT}/`) {
    throw new ContextReaderError("Context selector must reference a markdown file, not the context directory.", "unsafe-selector");
  }
  if (normalized.startsWith(`${CONTEXT_ROOT}/`)) {
    normalized = normalized.slice(CONTEXT_ROOT.length + 1);
  } else if (normalized.startsWith(".project/")) {
    throw new ContextReaderError("Context selector must stay below .project/context.", "unsafe-selector");
  }
  if (hasTraversalSegment(normalized)) {
    throw new ContextReaderError("Context selector must not contain path traversal.", "unsafe-selector");
  }

  normalized = path.posix.normalize(normalized);
  if (normalized === "." || normalized === ".." || normalized.startsWith("../")) {
    throw new ContextReaderError("Context selector must reference a markdown file below .project/context.", "unsafe-selector");
  }
  if (!isMarkdownPath(normalized)) {
    throw new ContextReaderError("Context selector must reference a markdown file.", "unsafe-selector");
  }
  return normalized;
}

function ensureInsideContext(repoRoot, contextPath) {
  const { contextDir, contextReal } = getContextPaths(repoRoot);
  const nativePath = path.join(contextDir, ...contextPath.split("/"));
  const resolved = fs.existsSync(nativePath) ? fs.realpathSync.native(nativePath) : path.resolve(nativePath);
  const relative = path.relative(contextReal, resolved);

  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    return nativePath;
  }

  throw new ContextReaderError(
    `Context selector escapes .project/context: ${contextRepoPath(contextPath)}`,
    "unsafe-selector"
  );
}

function parseRequiredFilesFromReadme(text) {
  const lines = text.split(/\r?\n/);
  const required = [];
  let inRequired = false;
  let sawList = false;

  for (const line of lines) {
    if (!inRequired) {
      if (/^\s*Required context files:\s*$/i.test(line)) {
        inRequired = true;
      }
      continue;
    }

    if (/^\s*$/.test(line)) {
      if (sawList) break;
      continue;
    }
    if (!/^\s*[-*]\s+/.test(line)) {
      if (sawList) break;
      continue;
    }

    sawList = true;
    const match = line.match(/`([^`]+\.md)`/i);
    if (!match) continue;
    const candidate = normalizeSelector(match[1]);
    if (!required.includes(candidate)) {
      required.push(candidate);
    }
  }

  return required;
}

function discoverMarkdownFiles(repoRoot) {
  const { contextDir, contextReal } = getContextPaths(repoRoot);
  const files = [];
  const warnings = [];

  if (!fs.existsSync(contextDir)) {
    return { files, warnings: [`${CONTEXT_ROOT} is missing.`] };
  }

  function visit(currentDir, prefix = "") {
    let entries = [];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      warnings.push(`Unable to read ${CONTEXT_ROOT}${prefix ? `/${prefix}` : ""}.`);
      return;
    }

    for (const entry of entries) {
      const contextPath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isSymbolicLink()) {
        let realTarget = "";
        try {
          realTarget = fs.realpathSync.native(absolutePath);
        } catch {
          warnings.push(`Unable to resolve symlink ${contextRepoPath(contextPath)}.`);
          continue;
        }
        const relative = path.relative(contextReal, realTarget);
        if (relative.startsWith("..") || path.isAbsolute(relative)) {
          warnings.push(`Symlink escapes .project/context and was skipped: ${contextRepoPath(contextPath)}.`);
          if (isMarkdownPath(contextPath)) files.push(contextPath);
          continue;
        }
        const stat = fs.statSync(absolutePath);
        if (stat.isDirectory()) {
          visit(absolutePath, contextPath);
        } else if (stat.isFile() && isMarkdownPath(contextPath)) {
          files.push(contextPath);
        }
        continue;
      }

      if (entry.isDirectory()) {
        visit(absolutePath, contextPath);
      } else if (entry.isFile() && isMarkdownPath(contextPath)) {
        files.push(contextPath);
      }
    }
  }

  visit(contextDir);
  return { files: [...new Set(files)].sort(compareContextPaths), warnings };
}

function readRequiredOrder(repoRoot) {
  const readmePath = path.join(repoRoot, ".project", "context", README_FILE);
  if (!fs.existsSync(readmePath)) {
    return {
      orderSource: "fallback",
      required: [...FALLBACK_ORDER],
      warnings: [`${contextRepoPath(README_FILE)} is missing; using fallback context order.`]
    };
  }

  try {
    const required = parseRequiredFilesFromReadme(fs.readFileSync(readmePath, "utf8"));
    if (required.length > 0) {
      return { orderSource: "readme", required, warnings: [] };
    }
    return {
      orderSource: "fallback-with-readme-warning",
      required: [...FALLBACK_ORDER],
      warnings: [`${contextRepoPath(README_FILE)} did not contain a parseable required context file list; using fallback context order.`]
    };
  } catch (error) {
    if (error instanceof ContextReaderError) throw error;
    return {
      orderSource: "fallback-with-readme-warning",
      required: [...FALLBACK_ORDER],
      warnings: [`Unable to read ${contextRepoPath(README_FILE)}; using fallback context order.`]
    };
  }
}

function orderContextFiles(required, discovered) {
  const ordered = [];
  const seen = new Set();
  const discoveredSet = new Set(discovered);

  function add(contextPath, includeMissing = false) {
    if (seen.has(contextPath)) return;
    if (includeMissing || discoveredSet.has(contextPath)) {
      ordered.push(contextPath);
      seen.add(contextPath);
    }
  }

  for (const contextPath of required) add(contextPath, true);
  for (const contextPath of FALLBACK_ORDER) add(contextPath, false);
  add(README_FILE, false);
  for (const contextPath of discovered) add(contextPath, false);

  return ordered;
}

function readTitle(text, contextPath) {
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : path.posix.basename(contextPath, ".md");
}

function buildMetadata(repoRoot, contextPath, requiredSet, profile) {
  const repoPath = contextRepoPath(contextPath);
  const required = requiredSet.has(contextPath);
  const exists = fs.existsSync(path.join(repoRoot, ".project", "context", ...contextPath.split("/")));
  const warnings = [];

  if (!exists) {
    if (required) warnings.push(`Required context file is missing: ${repoPath}.`);
    return {
      path: repoPath,
      title: "",
      profile,
      required,
      exists: false,
      missing: true,
      bytes: 0,
      chars: 0,
      truncated: false,
      warnings
    };
  }

  let absolutePath;
  try {
    absolutePath = ensureInsideContext(repoRoot, contextPath);
  } catch (error) {
    warnings.push(error.message);
    return {
      path: repoPath,
      title: "",
      profile,
      required,
      exists: true,
      missing: false,
      bytes: 0,
      chars: 0,
      truncated: false,
      warnings
    };
  }

  try {
    const stat = fs.statSync(absolutePath);
    const text = fs.readFileSync(absolutePath, "utf8");
    return {
      path: repoPath,
      title: readTitle(text, contextPath),
      profile,
      required,
      exists: true,
      missing: false,
      bytes: stat.size,
      chars: text.length,
      truncated: false,
      warnings
    };
  } catch {
    warnings.push(`Unable to read context file: ${repoPath}.`);
    return {
      path: repoPath,
      title: "",
      profile,
      required,
      exists: true,
      missing: false,
      bytes: 0,
      chars: 0,
      truncated: false,
      warnings
    };
  }
}

function listContextFiles(options = {}) {
  const repoRoot = options.repoRoot || requireContextRoot(options.startDir);
  const { files: discovered, warnings: discoveryWarnings } = discoverMarkdownFiles(repoRoot);
  const order = readRequiredOrder(repoRoot);
  const requiredSet = new Set(order.required);
  const orderedPaths = orderContextFiles(order.required, discovered);
  const files = orderedPaths.map((contextPath) => {
    const profile = requiredSet.has(contextPath)
      ? "required"
      : contextPath === README_FILE
        ? "manifest"
        : "custom";
    return buildMetadata(repoRoot, contextPath, requiredSet, profile);
  });
  const missing = files.filter((file) => file.missing && file.required).map((file) => file.path);
  const warnings = [
    ...order.warnings,
    ...discoveryWarnings,
    ...files.flatMap((file) => file.warnings)
  ];

  return {
    root: CONTEXT_ROOT,
    orderSource: order.orderSource,
    required: order.required.map(contextRepoPath),
    files,
    missing,
    warnings: [...new Set(warnings)]
  };
}

function resolveReadSelection(repoRoot, options) {
  const list = listContextFiles({ repoRoot });
  if (options.selectors && options.selectors.length > 0) {
    const selected = [];
    const seen = new Set();
    for (const selector of options.selectors) {
      const contextPath = normalizeSelector(selector);
      ensureInsideContext(repoRoot, contextPath);
      if (!seen.has(contextPath)) {
        selected.push(contextPath);
        seen.add(contextPath);
      }
    }
    return { list, mode: "selectors", profile: "selected", selected };
  }

  const profile = options.profile || "overview";
  if (profile === "all") {
    return {
      list,
      mode: "profile",
      profile,
      selected: list.files.filter((file) => file.exists).map((file) => file.path.slice(`${CONTEXT_ROOT}/`.length))
    };
  }
  if (!Object.prototype.hasOwnProperty.call(PROFILES, profile)) {
    throw new ContextReaderError(`Unknown context profile: ${profile}.`, "unknown-profile");
  }
  return {
    list,
    mode: "profile",
    profile,
    selected: [...PROFILES[profile]]
  };
}

function parseMaxChars(value, profile) {
  if (value === undefined || value === null || value === "") {
    return profile === "all" ? ALL_PROFILE_MAX_CHARS : DEFAULT_MAX_CHARS;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new ContextReaderError("--max-chars must be a positive integer.", "invalid-max-chars");
  }
  return parsed;
}

function truncateContent(text, limit) {
  if (text.length <= limit) {
    return { content: text, truncated: false, omitted: 0 };
  }
  const omitted = text.length - limit;
  return {
    content: `${text.slice(0, limit)}\n\n[Truncated: ${omitted} characters omitted]`,
    truncated: true,
    omitted
  };
}

function readContext(options = {}) {
  const repoRoot = options.repoRoot || requireContextRoot(options.startDir);
  const selection = resolveReadSelection(repoRoot, options);
  const maxChars = parseMaxChars(options.maxChars, selection.profile);
  const strict = Boolean(options.strict);
  const requiredSet = new Set(selection.list.required.map((repoPath) => repoPath.slice(`${CONTEXT_ROOT}/`.length)));
  const warnings = [...selection.list.warnings];
  const files = [];
  let remaining = maxChars;
  let totalChars = 0;
  let truncated = false;

  for (const contextPath of selection.selected) {
    const metadataProfile = selection.mode === "selectors" ? "selected" : selection.profile;
    const metadata = buildMetadata(repoRoot, contextPath, requiredSet, metadataProfile);

    if (metadata.missing) {
      const message = `Context file is missing: ${metadata.path}.`;
      metadata.warnings.push(message);
      warnings.push(message);
      files.push({ ...metadata, content: "" });
      if (strict || selection.mode === "selectors") {
        throw new ContextReaderError(message, "missing-context-file");
      }
      continue;
    }

    if (metadata.warnings.length > 0) {
      warnings.push(...metadata.warnings);
      files.push({ ...metadata, content: "" });
      if (strict || selection.mode === "selectors") {
        throw new ContextReaderError(metadata.warnings[0], "unreadable-context-file");
      }
      continue;
    }

    const absolutePath = ensureInsideContext(repoRoot, contextPath);
    const text = fs.readFileSync(absolutePath, "utf8");
    if (remaining <= 0) {
      const message = `Content budget exhausted before ${metadata.path}.`;
      metadata.truncated = true;
      metadata.warnings.push(message);
      warnings.push(message);
      files.push({ ...metadata, content: "" });
      truncated = true;
      continue;
    }

    const fileLimit = Math.min(PER_FILE_MAX_CHARS, remaining);
    const chunk = truncateContent(text, fileLimit);
    if (chunk.truncated) {
      const reason = text.length > PER_FILE_MAX_CHARS && PER_FILE_MAX_CHARS <= remaining
        ? "per-file"
        : "total";
      const message = `Context file was truncated by the ${reason} character budget: ${metadata.path}.`;
      metadata.truncated = true;
      metadata.warnings.push(message);
      warnings.push(message);
      truncated = true;
    }
    totalChars += Math.min(text.length, fileLimit);
    remaining -= Math.min(text.length, fileLimit);
    files.push({ ...metadata, content: chunk.content });
  }

  if (files.length === 0 || files.every((file) => !file.content)) {
    throw new ContextReaderError("No readable context files matched the request.", "empty-context-selection");
  }

  return {
    root: CONTEXT_ROOT,
    profile: selection.profile,
    selectors: selection.mode === "selectors"
      ? selection.selected.map(contextRepoPath)
      : [],
    maxChars,
    totalChars,
    truncated,
    warnings: [...new Set(warnings)],
    files
  };
}

function formatContextMarkdown(result) {
  const sections = [];
  if (result.warnings.length > 0) {
    sections.push(["Warnings:", ...result.warnings.map((warning) => `- ${warning}`)].join("\n"));
  }

  for (const file of result.files) {
    if (!file.content) continue;
    sections.push(`## ${file.path}\n\n${file.content}`);
  }

  return `${sections.join("\n\n")}\n`;
}

module.exports = {
  ALL_PROFILE_MAX_CHARS,
  CONTEXT_ROOT,
  ContextReaderError,
  DEFAULT_MAX_CHARS,
  FALLBACK_ORDER,
  PER_FILE_MAX_CHARS,
  PROFILES,
  formatContextMarkdown,
  listContextFiles,
  normalizeSelector,
  parseRequiredFilesFromReadme,
  readContext
};
