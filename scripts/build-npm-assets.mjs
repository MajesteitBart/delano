import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync
} from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const { getPackagedAssetRelativePath } = require("../src/cli/lib/asset-paths");
const repoRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(repoRoot, "assets", "install-manifest.json");
const payloadRoot = path.join(repoRoot, "assets", "payload");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

rmSync(payloadRoot, { recursive: true, force: true });

for (const relativePath of manifest.paths) {
  const sourcePath = path.join(repoRoot, relativePath);
  if (!existsSync(sourcePath)) {
    throw new Error(`Manifest path does not exist in the repository: ${relativePath}`);
  }

  const targetPath = path.join(payloadRoot, getPackagedAssetRelativePath(relativePath));
  mkdirSync(path.dirname(targetPath), { recursive: true });
  cpSync(sourcePath, targetPath, { force: true, recursive: false });

  const mode = statSync(sourcePath).mode & 0o777;
  try {
    chmodSync(targetPath, mode);
  } catch {
    // Ignore mode-setting failures on platforms without POSIX mode support.
  }
}

console.log(`Built npm asset payload with ${manifest.paths.length} files.`);
