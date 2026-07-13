const { createHash } = require("node:crypto");
const { existsSync, realpathSync } = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { CliError } = require("./errors");

function runGit(args, options = {}) {
  const result = spawnSync(options.git || "git", args, {
    cwd: options.cwd || process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (result.error) {
    throw new CliError(`Could not run Git: ${result.error.message}`, 1);
  }
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || "Git command failed.").trim();
    throw new CliError(detail, 1);
  }
  return result.stdout;
}

function canonicalPath(value) {
  const resolved = path.resolve(value);
  try {
    return realpathSync.native(resolved);
  } catch {
    return resolved;
  }
}

function comparisonPath(value) {
  const normalized = canonicalPath(value).replace(/\\/g, "/").replace(/\/$/, "");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function deriveRepositoryId(commonDir) {
  return createHash("sha256").update(comparisonPath(commonDir)).digest("hex");
}

function parseWorktreePorcelain(output, options = {}) {
  const records = [];
  let record = null;
  const fields = String(output || "").split(output.includes("\0") ? "\0" : /\r?\n/);

  for (const rawField of fields) {
    const field = rawField.trimEnd();
    if (!field) {
      if (record) {
        records.push(finalizeWorktree(record, records.length, options));
        record = null;
      }
      continue;
    }

    const separator = field.indexOf(" ");
    const key = separator === -1 ? field : field.slice(0, separator);
    const value = separator === -1 ? "" : field.slice(separator + 1);
    if (key === "worktree") {
      if (record) records.push(finalizeWorktree(record, records.length, options));
      record = { path: value };
      continue;
    }
    if (!record) continue;
    if (key === "HEAD") record.head = value;
    else if (key === "branch") record.branchRef = value;
    else if (key === "detached") record.detached = true;
    else if (key === "bare") record.bare = true;
    else if (key === "locked") record.locked = value || true;
    else if (key === "prunable") record.prunable = value || true;
  }

  if (record) records.push(finalizeWorktree(record, records.length, options));
  return records;
}

function finalizeWorktree(record, index, options) {
  const worktreePath = canonicalPath(record.path);
  const pathExists = (options.exists || existsSync)(worktreePath);
  const projectAvailable = pathExists && (options.exists || existsSync)(path.join(worktreePath, ".project"));
  const branch = record.branchRef
    ? record.branchRef.replace(/^refs\/heads\//, "")
    : null;
  const unavailableReason = record.prunable
    ? String(record.prunable === true ? "prunable worktree" : record.prunable)
    : pathExists
      ? null
      : "worktree path is missing";

  return {
    id: createHash("sha256").update(comparisonPath(worktreePath)).digest("hex"),
    path: worktreePath,
    head: record.head || null,
    branch,
    detached: Boolean(record.detached || (!branch && !record.bare)),
    role: index === 0 ? "primary" : "linked",
    primary: index === 0,
    bare: Boolean(record.bare),
    locked: record.locked || false,
    prunable: record.prunable || false,
    available: !unavailableReason,
    unavailableReason,
    projectAvailable
  };
}

function discoverWorktrees(startDir, options = {}) {
  const output = runGit(["worktree", "list", "--porcelain", "-z"], {
    ...options,
    cwd: startDir
  });
  const worktrees = parseWorktreePorcelain(output, options);
  if (worktrees.length === 0) {
    throw new CliError("Git reported no worktrees for this repository.", 1);
  }
  return worktrees;
}

function resolveRepository(startDir = process.cwd(), options = {}) {
  const cwd = canonicalPath(startDir);
  const commonDirOutput = runGit(["rev-parse", "--path-format=absolute", "--git-common-dir"], {
    ...options,
    cwd
  }).trim();
  const commonDir = canonicalPath(commonDirOutput);
  const worktrees = discoverWorktrees(cwd, options);
  const primary = worktrees.find((worktree) => worktree.primary);
  if (!primary) {
    throw new CliError("Could not resolve the primary Git worktree.", 1);
  }

  return {
    id: deriveRepositoryId(commonDir),
    commonDir,
    primaryPath: primary.path,
    displayName: path.basename(primary.path),
    worktrees
  };
}

module.exports = {
  canonicalPath,
  comparisonPath,
  deriveRepositoryId,
  discoverWorktrees,
  parseWorktreePorcelain,
  resolveRepository,
  runGit
};
