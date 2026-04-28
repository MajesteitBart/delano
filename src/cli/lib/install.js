const {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
} = require("node:fs");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

const { CliError } = require("./errors");
const { getPackageRoot, getPathType } = require("./runtime");

const SUPPORTED_AGENTS = ["claude", "codex", "opencode", "pi"];

function getMissingPackagedAssetMessage(relativePath) {
  return [
    `Packaged asset missing for '${relativePath}'.`,
    "If you are running from a source checkout, run 'npm run build:assets' first.",
    "If you installed the published npm package, the package is incomplete and needs to be rebuilt and republished."
  ].join(" ");
}

function readInstallManifest() {
  const manifestPath = path.join(getPackageRoot(), "assets", "install-manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  return {
    manifestPath,
    manifest,
    entries: normalizeManifestEntries(manifest),
    payloadRoot: path.join(getPackageRoot(), "assets", "payload")
  };
}

function parseAgentList(rawValue) {
  if (!rawValue) {
    return [...SUPPORTED_AGENTS];
  }

  const selected = [];
  for (const chunk of rawValue.split(",")) {
    const value = chunk.trim().toLowerCase();
    if (!value) {
      continue;
    }
    if (!SUPPORTED_AGENTS.includes(value)) {
      throw new CliError(
        `Unknown agent '${value}'. Supported values: ${SUPPORTED_AGENTS.join(", ")}.`,
        1
      );
    }
    if (!selected.includes(value)) {
      selected.push(value);
    }
  }

  if (selected.length === 0) {
    throw new CliError("No agents selected. Pass --agents claude,codex,opencode,pi or omit the flag.", 1);
  }

  return selected;
}

function parseInstallArgs(args) {
  const options = {
    target: process.cwd(),
    force: false,
    yes: false,
    agents: [...SUPPORTED_AGENTS]
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--target") {
      index += 1;
      if (!args[index]) {
        throw new CliError("Missing value for --target.", 1);
      }
      options.target = args[index];
      continue;
    }

    if (arg.startsWith("--target=")) {
      options.target = arg.slice("--target=".length);
      continue;
    }

    if (arg === "--agents") {
      index += 1;
      if (!args[index]) {
        throw new CliError("Missing value for --agents.", 1);
      }
      options.agents = parseAgentList(args[index]);
      continue;
    }

    if (arg.startsWith("--agents=")) {
      options.agents = parseAgentList(arg.slice("--agents=".length));
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--yes") {
      options.yes = true;
      continue;
    }

    throw new CliError(`Unknown install option: ${arg}`, 1);
  }

  options.target = path.resolve(options.target);
  return options;
}

function buildInstallPlan(options) {
  const { manifest, entries, payloadRoot } = readInstallManifest();
  const items = entries.map((entry) => {
    const sourcePath = path.join(payloadRoot, entry.target);
    if (!existsSync(sourcePath)) {
      throw new CliError(getMissingPackagedAssetMessage(entry.target), 1);
    }

    return {
      relativePath: entry.target,
      sourcePath,
      targetPath: path.join(options.target, entry.target)
    };
  });

  return {
    manifest,
    items,
    targetRoot: options.target
  };
}

function collectConflicts(plan) {
  const conflicts = [];

  for (const item of plan.items) {
    let current = path.dirname(item.targetPath);
    const targetRoot = path.parse(item.targetPath).root;

    while (current && current !== targetRoot) {
      const parentType = getPathType(current);
      if (parentType && parentType !== "directory") {
        conflicts.push({
          relativePath: item.relativePath,
          conflictPath: path.relative(plan.targetRoot, current) || current,
          targetPath: current,
          pathType: parentType,
          reason: "a parent path exists as a non-directory and blocks install",
          forceable: false
        });
        break;
      }
      current = path.dirname(current);
    }

    const exactType = getPathType(item.targetPath);
    if (exactType) {
      conflicts.push({
        relativePath: item.relativePath,
        conflictPath: item.relativePath,
        targetPath: item.targetPath,
        pathType: exactType,
        reason: "target already exists and install would overwrite it",
        forceable: true
      });
    }
  }

  return conflicts.sort((left, right) => {
    if (left.relativePath === right.relativePath) {
      return left.targetPath.localeCompare(right.targetPath);
    }
    return left.relativePath.localeCompare(right.relativePath);
  });
}

function printPlanSummary(plan, options) {
  console.log("Install plan");
  console.log("------------");
  console.log(`Target: ${options.target}`);
  console.log(`Files: ${plan.items.length}`);
  console.log(`Agents: ${options.agents.join(", ")}`);
  console.log(`Force: ${options.force ? "yes" : "no"}`);
  console.log("");
  console.log("Note: --agents is accepted now for forward compatibility, but v1 base install still excludes top-level adapter entry docs by default.");
}

function printConflicts(conflicts, options) {
  console.error("");
  console.error("Conflicts");
  console.error("---------");
  for (const conflict of conflicts) {
    const forceLabel = conflict.forceable ? "forceable" : "not forceable";
    console.error(
      `- ${conflict.conflictPath} [${conflict.pathType}; ${forceLabel}]: ${conflict.reason} (target: ${conflict.relativePath})`
    );
  }
  console.error("");
  if (options.force) {
    console.error("Install cannot continue because at least one conflict is not forceable.");
  } else {
    console.error("Install aborted before writing files. Re-run with --force to overwrite only allowlisted target paths.");
  }
}

async function confirmInstall(plan, options) {
  if (options.yes) {
    return true;
  }

  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const prompt = options.force
      ? `Proceed with force-installing ${plan.items.length} files into ${options.target}? [y/N] `
      : `Proceed with installing ${plan.items.length} files into ${options.target}? [y/N] `;
    const answer = await rl.question(prompt);
    return /^[Yy](es)?$/.test(answer.trim());
  } finally {
    rl.close();
  }
}

function applyInstallPlan(plan, options) {
  for (const item of plan.items) {
    const existingType = getPathType(item.targetPath);
    if (existingType) {
      rmSync(item.targetPath, { recursive: true, force: true });
    }

    mkdirSync(path.dirname(item.targetPath), { recursive: true });
    copyFileSync(item.sourcePath, item.targetPath);
    const sourceMode = statSync(item.sourcePath).mode & 0o777;
    try {
      chmodSync(item.targetPath, sourceMode);
    } catch {
      // Ignore mode-setting failures on platforms that do not preserve POSIX modes.
    }
  }

  console.log("");
  console.log(`Installed ${plan.items.length} files into ${options.target}.`);
  console.log("Recommended next step: run 'delano onboarding' to review AGENTS.md. The command asks for explicit approval before analysis.");
}

function normalizeManifestEntries(rawManifest) {
  const entries = Array.isArray(rawManifest.files) ? rawManifest.files : rawManifest.paths;
  if (!Array.isArray(entries)) {
    throw new CliError("Install manifest is missing a files array.", 1);
  }

  const seenTargets = new Set();
  return entries.map((entry) => {
    const normalized = typeof entry === "string"
      ? { source: entry, target: entry }
      : entry;

    if (!normalized || typeof normalized.source !== "string" || typeof normalized.target !== "string") {
      throw new CliError("Install manifest entries must be strings or { source, target } objects.", 1);
    }

    validateManifestPath(normalized.source, "source");
    validateManifestPath(normalized.target, "target");

    if (seenTargets.has(normalized.target)) {
      throw new CliError(`Install manifest target is duplicated: ${normalized.target}`, 1);
    }
    seenTargets.add(normalized.target);

    return normalized;
  });
}

function validateManifestPath(relativePath, fieldName) {
  if (path.isAbsolute(relativePath)) {
    throw new CliError(`Install manifest ${fieldName} must be relative: ${relativePath}`, 1);
  }

  const normalizedPath = path.normalize(relativePath);
  if (normalizedPath.startsWith("..") || normalizedPath === "..") {
    throw new CliError(`Install manifest ${fieldName} must stay inside the package root: ${relativePath}`, 1);
  }
}

module.exports = {
  SUPPORTED_AGENTS,
  applyInstallPlan,
  buildInstallPlan,
  collectConflicts,
  confirmInstall,
  normalizeManifestEntries,
  parseAgentList,
  parseInstallArgs,
  printConflicts,
  printPlanSummary,
  readInstallManifest,
  getMissingPackagedAssetMessage
};
