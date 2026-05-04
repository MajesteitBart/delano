import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const requiredDocs = [
  {
    file: "AGENTS.md",
    patterns: [
      /First-turn workflow/i,
      /Source-of-truth map/i,
      /Core commands/i,
      /Completion rule/i,
      /Safety boundaries/i,
      /bash \.agents\/scripts\/pm\/validate\.sh/,
      /npm test/,
      /npm run build:assets/,
      /npm run check:package-manifest/
    ]
  },
  {
    file: ".agents/README.md",
    patterns: [
      /Source-of-truth map/i,
      /Required first-turn behavior/i,
      /Core validation commands/i,
      /Completion rule/i,
      /Safety boundaries/i
    ]
  },
  ...["claude", "codex", "opencode", "pi"].map((adapter) => ({
    file: `.agents/adapters/${adapter}/README.md`,
    patterns: [
      /Read root `AGENTS\.md` first/i,
      /git status --short --branch/,
      /assigned `\.project` contract/i,
      /bash \.agents\/scripts\/pm\/validate\.sh/,
      /npm test/,
      /Completion and safety/i
    ]
  })),
  ...["CLAUDE.md", "CODEX.md", "OPENCODE.md", "PI.md"].map((file) => ({
    file,
    patterns: [
      /Read `AGENTS\.md` first/i,
      /source-of-truth map/i,
      /completion rule/i,
      /safety boundaries/i,
      /Keep this file thin/i
    ]
  }))
];

const errors = [];

for (const doc of requiredDocs) {
  const text = readText(doc.file);
  if (text === null) {
    continue;
  }

  for (const pattern of doc.patterns) {
    if (!pattern.test(text)) {
      errors.push(`${doc.file} is missing required guidance matching ${pattern}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Agent entry doc check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Agent entry doc check passed for ${requiredDocs.length} documents.`);

function readText(relativePath) {
  try {
    return readFileSync(path.join(repoRoot, relativePath), "utf8");
  } catch (error) {
    errors.push(`${relativePath} could not be read: ${error.message}`);
    return null;
  }
}
