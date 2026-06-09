import { readFileSync, readdirSync, statSync, lstatSync, realpathSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const selfTest = process.argv.includes("--self-test");

if (selfTest) {
  runSelfTest();
} else {
  runParityCheck(path.join(repoRoot, ".agents"), path.join(repoRoot, ".claude"));
}

function runParityCheck(canonicalRoot, mirrorRoot) {
  if (!existsSync(canonicalRoot)) {
    console.error("Claude mirror parity check failed:");
    console.error(`- Canonical runtime directory is missing: ${path.relative(repoRoot, canonicalRoot)}`);
    process.exit(1);
  }

  if (!existsSync(mirrorRoot)) {
    console.error("Claude mirror parity check failed:");
    console.error(`- Mirror directory is missing: ${path.relative(repoRoot, mirrorRoot)}. Run 'npm run sync:claude-mirror'.`);
    process.exit(1);
  }

  if (lstatSync(mirrorRoot).isSymbolicLink()) {
    if (realpathSync(mirrorRoot) === realpathSync(canonicalRoot)) {
      console.log("Claude mirror parity check passed: .claude is a symlink to .agents.");
      return;
    }
    console.error("Claude mirror parity check failed:");
    console.error(`- .claude is a symlink but does not resolve to .agents.`);
    process.exit(1);
  }

  const drift = compareTrees(canonicalRoot, mirrorRoot);

  if (drift.missing.length > 0 || drift.extra.length > 0 || drift.mismatched.length > 0) {
    console.error("Claude mirror parity check failed:");
    for (const file of drift.missing) {
      console.error(`- Missing from mirror: .claude/${file}`);
    }
    for (const file of drift.extra) {
      console.error(`- Extra in mirror: .claude/${file}`);
    }
    for (const file of drift.mismatched) {
      console.error(`- Content differs: .claude/${file}`);
    }
    console.error("Run 'npm run sync:claude-mirror' to regenerate .claude from .agents.");
    process.exit(1);
  }

  console.log(`Claude mirror parity check passed for ${drift.checked} mirrored file(s).`);
}

function compareTrees(canonicalRoot, mirrorRoot) {
  const canonicalFiles = listFiles(canonicalRoot);
  const mirrorFiles = new Set(listFiles(mirrorRoot));

  const missing = [];
  const mismatched = [];

  for (const file of canonicalFiles) {
    if (!mirrorFiles.has(file)) {
      missing.push(file);
      continue;
    }
    mirrorFiles.delete(file);
    const canonicalContent = readFileSync(path.join(canonicalRoot, file));
    const mirrorContent = readFileSync(path.join(mirrorRoot, file));
    if (!canonicalContent.equals(mirrorContent)) {
      mismatched.push(file);
    }
  }

  return {
    checked: canonicalFiles.length,
    missing,
    extra: [...mirrorFiles].sort(),
    mismatched
  };
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

function runSelfTest() {
  const errors = [];
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), "delano-mirror-parity-"));

  try {
    const canonical = path.join(tempRoot, "canonical");
    const mirror = path.join(tempRoot, "mirror");
    mkdirSync(path.join(canonical, "nested"), { recursive: true });
    mkdirSync(path.join(mirror, "nested"), { recursive: true });

    writeFileSync(path.join(canonical, "same.md"), "same\n");
    writeFileSync(path.join(mirror, "same.md"), "same\n");
    writeFileSync(path.join(canonical, "nested", "only-canonical.md"), "canonical\n");
    writeFileSync(path.join(mirror, "nested", "only-mirror.md"), "mirror\n");
    writeFileSync(path.join(canonical, "drifted.md"), "new content\n");
    writeFileSync(path.join(mirror, "drifted.md"), "old content\n");

    const drift = compareTrees(canonical, mirror);
    if (drift.missing.join(",") !== "nested/only-canonical.md") {
      errors.push(`self-test missing detection failed: ${drift.missing.join(",")}`);
    }
    if (drift.extra.join(",") !== "nested/only-mirror.md") {
      errors.push(`self-test extra detection failed: ${drift.extra.join(",")}`);
    }
    if (drift.mismatched.join(",") !== "drifted.md") {
      errors.push(`self-test mismatch detection failed: ${drift.mismatched.join(",")}`);
    }

    writeFileSync(path.join(mirror, "nested", "only-canonical.md"), "canonical\n");
    rmSync(path.join(mirror, "nested", "only-mirror.md"));
    writeFileSync(path.join(mirror, "drifted.md"), "new content\n");

    const clean = compareTrees(canonical, mirror);
    if (clean.missing.length !== 0 || clean.extra.length !== 0 || clean.mismatched.length !== 0) {
      errors.push("self-test clean comparison reported drift");
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }

  if (errors.length > 0) {
    console.error("Claude mirror parity self-test failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Claude mirror parity self-test passed.");
}
