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
const readline = require("node:readline");
const { stdin, stdout } = require("node:process");

const { CliError } = require("./errors");
const { getPackageRoot, getPathType } = require("./runtime");

const SUPPORTED_AGENTS = ["claude", "codex", "opencode", "pi"];
const INSTALL_CATEGORIES = [
  {
    name: "agent-runtime",
    description: ".agents runtime except skills",
    matches: (target) => target.startsWith(".agents/") && !target.startsWith(".agents/skills/")
  },
  {
    name: "skills",
    description: ".agents/skills",
    matches: (target) => target.startsWith(".agents/skills/")
  },
  {
    name: "viewer",
    description: ".delano viewer files",
    matches: (target) => target.startsWith(".delano/")
  },
  {
    name: "project-context",
    description: ".project/context starter templates",
    matches: (target) => target.startsWith(".project/context/")
  },
  {
    name: "project-templates",
    description: ".project/templates",
    matches: (target) => target.startsWith(".project/templates/")
  },
  {
    name: "project-registry",
    description: ".project/registry",
    matches: (target) => target.startsWith(".project/registry/")
  },
  {
    name: "project-projects",
    description: ".project/projects seed files",
    matches: (target) => target.startsWith(".project/projects/")
  },
  {
    name: "handbook",
    description: "HANDBOOK.md",
    matches: (target) => target === "HANDBOOK.md"
  },
  {
    name: "legacy-installer",
    description: "install-delano.sh",
    matches: (target) => target === "install-delano.sh"
  }
];

const INSTALL_CATEGORY_ALIASES = new Map([
  ["agent-skills", "skills"],
  ["agents", "agent-runtime"],
  ["runtime", "agent-runtime"],
  ["context", "project-context"],
  ["templates", "project-templates"],
  ["project-state", "project-projects"],
  ["projects", "project-projects"],
  ["registry", "project-registry"],
  ["delano", "viewer"],
  ["installer", "legacy-installer"]
]);

const INSTALL_CATEGORY_NAMES = INSTALL_CATEGORIES.map((category) => category.name);
const PROJECT_STATE_CATEGORIES = ["project-context", "project-projects", "project-registry"];
const INSTALL_PRESETS = [
  {
    id: "update-safe",
    label: "Update Delano runtime, preserve project state",
    description: "Refresh runtime files while excluding .project/context, .project/projects, and .project/registry.",
    only: null,
    exclude: PROJECT_STATE_CATEGORIES,
    force: true
  },
  {
    id: "skills-templates",
    label: "Update skills and project templates",
    description: "Refresh .agents/skills and .project/templates only.",
    only: ["skills", "project-templates"],
    exclude: [],
    force: true
  },
  {
    id: "full",
    label: "Full install or repair",
    description: "Install every allowlisted category. This includes project starter state.",
    only: null,
    exclude: [],
    force: false
  },
  {
    id: "custom",
    label: "Choose categories",
    description: "Pick exact categories and force behavior.",
    only: null,
    exclude: [],
    force: false
  }
];

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

function parseCategoryList(rawValue, optionName) {
  if (!rawValue) {
    throw new CliError(`Missing value for ${optionName}.`, 1);
  }

  const selected = [];
  for (const chunk of rawValue.split(",")) {
    const value = chunk.trim().toLowerCase();
    if (!value) {
      continue;
    }

    const categoryName = INSTALL_CATEGORY_ALIASES.get(value) || value;
    if (!INSTALL_CATEGORY_NAMES.includes(categoryName)) {
      throw new CliError(
        `Unknown install category '${value}'. Supported values: ${INSTALL_CATEGORY_NAMES.join(", ")}.`,
        1
      );
    }

    if (!selected.includes(categoryName)) {
      selected.push(categoryName);
    }
  }

  if (selected.length === 0) {
    throw new CliError(`No install categories selected for ${optionName}.`, 1);
  }

  return selected;
}

function parseInstallArgs(args) {
  const options = {
    target: process.cwd(),
    force: false,
    yes: false,
    interactive: false,
    agents: [...SUPPORTED_AGENTS],
    only: null,
    exclude: []
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

    if (arg === "--only") {
      index += 1;
      options.only = parseCategoryList(args[index], "--only");
      continue;
    }

    if (arg.startsWith("--only=")) {
      options.only = parseCategoryList(arg.slice("--only=".length), "--only");
      continue;
    }

    if (arg === "--exclude") {
      index += 1;
      options.exclude = parseCategoryList(args[index], "--exclude");
      continue;
    }

    if (arg.startsWith("--exclude=")) {
      options.exclude = parseCategoryList(arg.slice("--exclude=".length), "--exclude");
      continue;
    }

    if (arg === "--no-project-context") {
      options.exclude = mergeCategoryLists(options.exclude, ["project-context"]);
      continue;
    }

    if (arg === "--no-project-state") {
      options.exclude = mergeCategoryLists(options.exclude, [
        "project-context",
        "project-projects",
        "project-registry"
      ]);
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

    if (arg === "--interactive" || arg === "--tui") {
      options.interactive = true;
      continue;
    }

    throw new CliError(`Unknown install option: ${arg}`, 1);
  }

  options.target = path.resolve(options.target);
  return options;
}

function applyInstallPreset(options, presetId) {
  const preset = INSTALL_PRESETS.find((candidate) => candidate.id === presetId);
  if (!preset) {
    throw new CliError(`Unknown install preset: ${presetId}`, 1);
  }

  return {
    ...options,
    only: preset.only ? [...preset.only] : null,
    exclude: [...preset.exclude],
    force: preset.force
  };
}

async function configureInteractiveInstall(options) {
  const prompt = createPrompter(stdin, stdout);
  try {
    console.log("Delano install");
    console.log("==============");
    console.log("");
    console.log("Choose what to install:");
    INSTALL_PRESETS.forEach((preset, index) => {
      console.log(`  ${index + 1}. ${preset.label}`);
      console.log(`     ${preset.description}`);
    });
    console.log("");

    const presetAnswer = await prompt.ask("Selection [1]: ");
    const presetIndex = parseSelectionNumber(presetAnswer, 1, INSTALL_PRESETS.length, 1) - 1;
    const preset = INSTALL_PRESETS[presetIndex];
    let configured = applyInstallPreset(options, preset.id);

    const targetAnswer = await prompt.ask(`Target [${configured.target}]: `);
    if (targetAnswer.trim()) {
      configured.target = path.resolve(targetAnswer.trim());
    }

    if (preset.id === "custom") {
      configured = await configureCustomInstallSelection(configured, prompt);
    } else {
      const forceDefault = configured.force ? "Y/n" : "y/N";
      const forceAnswer = await prompt.ask(`Overwrite selected existing files with --force? [${forceDefault}] `);
      configured.force = parseYesNo(forceAnswer, configured.force);
    }

    return configured;
  } finally {
    prompt.close();
  }
}

async function configureCustomInstallSelection(options, prompt) {
  console.log("");
  console.log("Categories:");
  INSTALL_CATEGORIES.forEach((category, index) => {
    console.log(`  ${index + 1}. ${category.name} - ${category.description}`);
  });
  console.log("");
  console.log("Enter category numbers or names separated by commas.");
  console.log("Use 'all' for every category.");

  const categoryAnswer = await prompt.ask("Categories [all]: ");
  const only = parseInteractiveCategorySelection(categoryAnswer);
  const forceAnswer = await prompt.ask("Overwrite selected existing files with --force? [y/N] ");

  return {
    ...options,
    only,
    exclude: [],
    force: parseYesNo(forceAnswer, false)
  };
}

function createPrompter(input, output) {
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  const iterator = rl[Symbol.asyncIterator]();

  return {
    async ask(promptText) {
      output.write(promptText);
      const next = await iterator.next();
      const answer = next.done ? "" : next.value;
      output.write("\n");
      return answer;
    },
    close() {
      rl.close();
    }
  };
}


function parseSelectionNumber(rawValue, min, max, defaultValue) {
  const value = rawValue.trim();
  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new CliError(`Selection must be a number from ${min} to ${max}.`, 1);
  }
  return parsed;
}

function parseYesNo(rawValue, defaultValue) {
  const value = rawValue.trim().toLowerCase();
  if (!value) {
    return defaultValue;
  }
  if (value === "y" || value === "yes") {
    return true;
  }
  if (value === "n" || value === "no") {
    return false;
  }
  throw new CliError("Answer must be yes or no.", 1);
}

function parseInteractiveCategorySelection(rawValue) {
  const value = rawValue.trim();
  if (!value || value.toLowerCase() === "all") {
    return null;
  }

  const selected = [];
  for (const chunk of value.split(",")) {
    const token = chunk.trim();
    if (!token) {
      continue;
    }

    const numeric = Number(token);
    const categoryName = Number.isInteger(numeric)
      ? INSTALL_CATEGORIES[numeric - 1]?.name
      : (INSTALL_CATEGORY_ALIASES.get(token.toLowerCase()) || token.toLowerCase());

    if (!categoryName || !INSTALL_CATEGORY_NAMES.includes(categoryName)) {
      throw new CliError(
        `Unknown install category '${token}'. Supported values: ${INSTALL_CATEGORY_NAMES.join(", ")}.`,
        1
      );
    }

    if (!selected.includes(categoryName)) {
      selected.push(categoryName);
    }
  }

  if (selected.length === 0) {
    throw new CliError("No install categories selected.", 1);
  }

  return selected;
}

function buildInstallPlan(options) {
  const { manifest, entries, payloadRoot } = readInstallManifest();
  const selectedEntries = filterManifestEntries(entries, options);
  if (selectedEntries.length === 0) {
    throw new CliError("Install selection matched no files.", 1);
  }

  const items = selectedEntries.map((entry) => {
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
    selectedEntries,
    skippedCount: entries.length - selectedEntries.length,
    items,
    targetRoot: options.target
  };
}

function mergeCategoryLists(left, right) {
  const merged = [...left];
  for (const item of right) {
    if (!merged.includes(item)) {
      merged.push(item);
    }
  }
  return merged;
}

function getInstallCategory(target) {
  const normalizedTarget = target.replace(/\\/g, "/");
  return INSTALL_CATEGORIES.find((category) => category.matches(normalizedTarget))?.name || "uncategorized";
}

function filterManifestEntries(entries, options) {
  const only = options.only ? new Set(options.only) : null;
  const exclude = new Set(options.exclude || []);

  return entries.filter((entry) => {
    const category = getInstallCategory(entry.target);
    if (only && !only.has(category)) {
      return false;
    }
    return !exclude.has(category);
  });
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
  if (plan.skippedCount > 0) {
    console.log(`Skipped by selection: ${plan.skippedCount}`);
  }
  console.log(`Agents: ${options.agents.join(", ")}`);
  console.log(`Only: ${options.only ? options.only.join(", ") : "all categories"}`);
  if (options.exclude.length > 0) {
    console.log(`Exclude: ${options.exclude.join(", ")}`);
  }
  console.log(`Force: ${options.force ? "yes" : "no"}`);
  console.log("");
  console.log("Note: --agents is accepted now for forward compatibility, but v1 base install still excludes top-level adapter entry docs by default.");
  console.log("Note: .project/context, .project/projects, and .project/registry are repo-owned after install; use --no-project-state or --only for update-safe refreshes.");
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
    console.error("Install aborted before writing files. Re-run with --force to overwrite only selected allowlisted target paths, or narrow the plan with --only/--exclude.");
  }
}

async function confirmInstall(plan, options) {
  if (options.yes) {
    return true;
  }

  const prompt = createPrompter(stdin, stdout);
  try {
    const promptText = options.force
      ? `Proceed with force-installing ${plan.items.length} files into ${options.target}? [y/N] `
      : `Proceed with installing ${plan.items.length} files into ${options.target}? [y/N] `;
    const answer = await prompt.ask(promptText);
    return /^[Yy](es)?$/.test(answer.trim());
  } finally {
    prompt.close();
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
  INSTALL_CATEGORIES,
  INSTALL_PRESETS,
  SUPPORTED_AGENTS,
  applyInstallPlan,
  applyInstallPreset,
  buildInstallPlan,
  collectConflicts,
  confirmInstall,
  configureInteractiveInstall,
  createPrompter,
  filterManifestEntries,
  getInstallCategory,
  normalizeManifestEntries,
  parseInteractiveCategorySelection,
  parseCategoryList,
  parseAgentList,
  parseInstallArgs,
  printConflicts,
  printPlanSummary,
  readInstallManifest,
  getMissingPackagedAssetMessage
};
