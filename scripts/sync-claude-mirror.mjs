import { chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, rmdirSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const canonicalRoot = path.join(repoRoot, ".agents");
const mirrorRoot = path.join(repoRoot, ".claude");

if (process.argv.includes("--self-test")) {
  runSelfTest();
} else {
  syncMirror(canonicalRoot, mirrorRoot);
}

function syncMirror(canonicalRoot, mirrorRoot) {
  if (!existsSync(canonicalRoot)) {
    console.error("Claude mirror sync failed:");
    console.error("- Canonical runtime directory is missing: .agents");
    process.exit(1);
  }

  if (existsSync(mirrorRoot) && lstatSync(mirrorRoot).isSymbolicLink()) {
    if (realpathSync(mirrorRoot) === realpathSync(canonicalRoot)) {
      console.log("Claude mirror sync skipped: .claude is already a symlink to .agents.");
      return { copied: 0, removed: 0, unchanged: 0 };
    }
    console.error("Claude mirror sync failed:");
    console.error("- .claude is a symlink that does not resolve to .agents. Remove it before syncing.");
    process.exit(1);
  }

  let copied = 0;
  let removed = 0;
  let unchanged = 0;

  const canonicalFiles = listFiles(canonicalRoot);
  const canonicalSet = new Set(canonicalFiles);

  if (existsSync(mirrorRoot)) {
    for (const file of listFiles(mirrorRoot)) {
      if (!canonicalSet.has(file)) {
        rmSync(path.join(mirrorRoot, file), { force: true, recursive: true });
        removed += 1;
      }
    }
    pruneEmptyDirectories(mirrorRoot, mirrorRoot);
  }

  for (const file of canonicalFiles) {
    const source = path.join(canonicalRoot, file);
    const target = path.join(mirrorRoot, file);

    if (targetMatchesSource(source, target)) {
      unchanged += 1;
      continue;
    }

    prepareTargetPath(target, mirrorRoot);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(source, target);
    chmodSync(target, statSync(source).mode);
    copied += 1;
  }

  console.log(`Claude mirror sync complete: ${copied} copied, ${removed} removed, ${unchanged} unchanged.`);
  return { copied, removed, unchanged };
}

function targetMatchesSource(source, target) {
  if (!existsSync(target)) return false;
  if (!lstatSync(target).isFile()) return false;
  return readFileSync(source).equals(readFileSync(target));
}

function prepareTargetPath(target, root) {
  const relativePath = path.relative(root, target);
  const parts = relativePath.split(path.sep);
  let current = root;

  for (const part of parts.slice(0, -1)) {
    current = path.join(current, part);
    if (existsSync(current) && !lstatSync(current).isDirectory()) {
      rmSync(current, { force: true, recursive: true });
    }
  }

  if (existsSync(target) && !lstatSync(target).isFile()) {
    rmSync(target, { force: true, recursive: true });
  }
}

function listFiles(root, prefix = "") {
  const entries = readdirSync(path.join(root, prefix), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...listFiles(root, relativePath));
    } else {
      files.push(relativePath);
    }
  }
  return files.sort();
}

function pruneEmptyDirectories(root, stopRoot) {
  const entries = readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      pruneEmptyDirectories(path.join(root, entry.name), stopRoot);
    }
  }
  if (root !== stopRoot && readdirSync(root).length === 0) {
    rmdirSync(root);
  }
}

function runSelfTest() {
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "delano-mirror-sync-"));

  try {
    const canonical = path.join(tempRoot, "canonical");
    const mirror = path.join(tempRoot, "mirror");

    mkdirSync(path.join(canonical, "foo"), { recursive: true });
    mkdirSync(mirror, { recursive: true });
    writeFileSync(path.join(canonical, "foo", "bar.md"), "canonical nested\n");
    writeFileSync(path.join(canonical, "dir-to-file.md"), "canonical file\n");

    writeFileSync(path.join(mirror, "foo"), "stale parent file\n");
    mkdirSync(path.join(mirror, "dir-to-file.md"), { recursive: true });
    writeFileSync(path.join(mirror, "dir-to-file.md", "old.md"), "stale child file\n");
    writeFileSync(path.join(mirror, "extra.md"), "extra\n");

    syncMirror(canonical, mirror);

    const files = listFiles(mirror);
    const expected = ["dir-to-file.md", "foo/bar.md"];
    const errors = [];
    if (JSON.stringify(files) !== JSON.stringify(expected)) {
      errors.push(`expected mirrored files ${expected.join(",")}, got ${files.join(",")}`);
    }
    if (readFileSync(path.join(mirror, "foo", "bar.md"), "utf8") !== "canonical nested\n") {
      errors.push("nested file was not copied through stale parent repair");
    }
    if (readFileSync(path.join(mirror, "dir-to-file.md"), "utf8") !== "canonical file\n") {
      errors.push("file target was not copied through stale directory repair");
    }

    if (errors.length > 0) {
      console.error("Claude mirror sync self-test failed:");
      for (const error of errors) {
        console.error(`- ${error}`);
      }
      process.exit(1);
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }

  console.log("Claude mirror sync self-test passed.");
}
