import { existsSync, mkdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const notices = new Set();

export function resolveCoordinationStatePath(repoRoot, options = {}) {
  const root = path.resolve(repoRoot);
  const commonDir = resolveGitCommonDir(root, options.git || "git");
  const target = path.join(commonDir, "delano", "leases", "active-leases.json");
  if (options.migrate !== false) migrateLegacyState(root, target, options);
  return target;
}

export function resolveGitCommonDir(repoRoot, git = "git") {
  const result = spawnSync(git, ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.error || result.status !== 0) {
    const detail = result.error?.message || result.stderr?.trim() || "git rev-parse failed";
    throw new Error(`Could not resolve Delano coordination storage: ${detail}`);
  }
  return path.resolve(result.stdout.trim());
}

export function recognizedLegacyStatePaths(repoRoot) {
  return [path.join(path.resolve(repoRoot), ".agents", "leases", "active-leases.json")];
}

export function migrateLegacyState(repoRoot, targetPath, options = {}) {
  const legacyPaths = recognizedLegacyStatePaths(repoRoot);
  for (const legacyPath of legacyPaths) {
    if (!existsSync(legacyPath)) continue;
    mkdirSync(path.dirname(targetPath), { recursive: true });
    if (existsSync(targetPath)) {
      const legacyContent = readFileSync(legacyPath);
      const targetContent = readFileSync(targetPath);
      if (legacyContent.equals(targetContent)) {
        rmSync(legacyPath);
        emitNotice(targetPath, options);
        continue;
      }
      throw new Error(
        `Legacy Delano coordination state collides with shared state; both files were preserved. Reconcile ${legacyPath} and ${targetPath}, then retry.`
      );
    }

    try {
      renameSync(legacyPath, targetPath);
    } catch (error) {
      throw new Error(
        `Could not migrate legacy Delano coordination state; the source was preserved at ${legacyPath}. ${error.message}`
      );
    }
    emitNotice(targetPath, options);
  }
}

function emitNotice(targetPath, options) {
  if (notices.has(targetPath)) return;
  notices.add(targetPath);
  const notice = options.notice || ((message) => console.error(message));
  notice(`Migrated legacy Delano coordination state to the shared Git common directory.`);
}
