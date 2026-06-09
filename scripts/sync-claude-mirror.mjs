import { readFileSync, readdirSync, statSync, lstatSync, realpathSync, existsSync, mkdirSync, copyFileSync, chmodSync, rmSync, rmdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const canonicalRoot = path.join(repoRoot, ".agents");
const mirrorRoot = path.join(repoRoot, ".claude");

if (!existsSync(canonicalRoot)) {
  console.error("Claude mirror sync failed:");
  console.error("- Canonical runtime directory is missing: .agents");
  process.exit(1);
}

if (existsSync(mirrorRoot) && lstatSync(mirrorRoot).isSymbolicLink()) {
  if (realpathSync(mirrorRoot) === realpathSync(canonicalRoot)) {
    console.log("Claude mirror sync skipped: .claude is already a symlink to .agents.");
    process.exit(0);
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

// Remove stale mirror entries before copying so shape changes
// (file <-> directory) cannot collide during the copy pass.
if (existsSync(mirrorRoot)) {
  for (const file of listFiles(mirrorRoot)) {
    if (!canonicalSet.has(file)) {
      rmSync(path.join(mirrorRoot, file));
      removed += 1;
    }
  }
  pruneEmptyDirectories(mirrorRoot);
}

for (const file of canonicalFiles) {
  const source = path.join(canonicalRoot, file);
  const target = path.join(mirrorRoot, file);

  if (existsSync(target) && !statSync(target).isFile()) {
    rmSync(target, { recursive: true, force: true });
  }
  if (existsSync(target) && readFileSync(source).equals(readFileSync(target))) {
    unchanged += 1;
    continue;
  }

  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(source, target);
  chmodSync(target, statSync(source).mode);
  copied += 1;
}

console.log(`Claude mirror sync complete: ${copied} copied, ${removed} removed, ${unchanged} unchanged.`);

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

function pruneEmptyDirectories(root) {
  const entries = readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      pruneEmptyDirectories(path.join(root, entry.name));
    }
  }
  if (root !== mirrorRoot && readdirSync(root).length === 0) {
    rmdirSync(root);
  }
}
