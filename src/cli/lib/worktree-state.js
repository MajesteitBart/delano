const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function classifyWorktreeState(repository, worktree, options = {}) {
  if (!worktree || !worktree.available) {
    return unavailable(worktree?.unavailableReason || "worktree is unavailable");
  }
  if (!fs.existsSync(path.join(worktree.path, ".project"))) {
    return unavailable(".project is missing");
  }

  const primary = repository.worktrees.find((candidate) => candidate.primary);
  if (!primary || !primary.head) return unavailable("primary worktree HEAD is unavailable");
  if (!worktree.head) return unavailable("worktree HEAD is unavailable");

  const dirtyResult = runGitStatus(worktree.path, options.git || "git");
  if (!dirtyResult.ok) return unavailable(dirtyResult.error);
  const dirtyFiles = parsePorcelainPaths(dirtyResult.stdout);

  let diverged = false;
  if (!worktree.primary) {
    const diff = spawnSync(options.git || "git", ["diff", "--quiet", primary.head, worktree.head, "--", ".project"], {
      cwd: primary.path,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
    if (diff.error || (diff.status !== 0 && diff.status !== 1)) {
      return unavailable(diff.error?.message || diff.stderr?.trim() || "could not compare committed .project state");
    }
    diverged = diff.status === 1;
  }

  return {
    status: dirtyFiles.length > 0 ? "dirty" : diverged ? "diverged" : "clean",
    available: true,
    diverged,
    dirty: dirtyFiles.length > 0,
    dirtyFiles,
    reason: null
  };
}

function classifyRepositoryWorktrees(repository, options = {}) {
  return repository.worktrees.map((worktree) => ({
    ...worktree,
    projectState: classifyWorktreeState(repository, worktree, options)
  }));
}

function runGitStatus(cwd, git) {
  const result = spawnSync(git, ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ".project"], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.error || result.status !== 0) {
    return { ok: false, error: result.error?.message || result.stderr?.trim() || "could not inspect .project changes" };
  }
  return { ok: true, stdout: result.stdout };
}

function parsePorcelainPaths(output) {
  const entries = String(output || "").split("\0").filter(Boolean);
  const paths = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    const status = entry.slice(0, 2);
    let filePath = entry.slice(3);
    if ((status.includes("R") || status.includes("C")) && entries[index + 1]) {
      filePath = entries[index + 1];
      index += 1;
    }
    paths.push(filePath.replace(/\\/g, "/"));
  }
  return paths.sort();
}

function unavailable(reason) {
  return {
    status: "unavailable",
    available: false,
    diverged: false,
    dirty: false,
    dirtyFiles: [],
    reason
  };
}

module.exports = {
  classifyRepositoryWorktrees,
  classifyWorktreeState,
  parsePorcelainPaths
};
