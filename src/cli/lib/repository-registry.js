const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { CliError } = require("./errors");
const { comparisonPath, resolveRepository } = require("./git-repository");

const REGISTRY_VERSION = 1;

function getDelanoHome(env = process.env) {
  return path.resolve(env.DELANO_HOME || path.join(os.homedir(), ".delano"));
}

function getRegistryPath(env = process.env) {
  return path.join(getDelanoHome(env), "repositories.json");
}

function emptyRegistry() {
  return { version: REGISTRY_VERSION, repositories: [] };
}

function validateRegistry(value, registryPath) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CliError(`Repository registry is malformed: ${registryPath}`, 1);
  }
  if (value.version !== REGISTRY_VERSION) {
    throw new CliError(
      `Unsupported repository registry version ${String(value.version)} in ${registryPath}; expected ${REGISTRY_VERSION}.`,
      1
    );
  }
  if (!Array.isArray(value.repositories)) {
    throw new CliError(`Repository registry is malformed: repositories must be an array in ${registryPath}`, 1);
  }

  for (const repository of value.repositories) {
    const keys = Object.keys(repository).sort();
    const expected = ["displayName", "id", "lastSeen", "primaryPath"];
    if (JSON.stringify(keys) !== JSON.stringify(expected) || expected.some((key) => typeof repository[key] !== "string" || !repository[key])) {
      throw new CliError(`Repository registry contains an invalid entry in ${registryPath}`, 1);
    }
  }
  return value;
}

function writeRegistry(registry, options = {}) {
  const registryPath = options.registryPath || getRegistryPath(options.env);
  const directory = path.dirname(registryPath);
  fs.mkdirSync(directory, { recursive: true });
  const tempPath = path.join(
    directory,
    `.${path.basename(registryPath)}.${process.pid}.${Date.now()}.tmp`
  );
  const content = `${JSON.stringify(registry, null, 2)}\n`;

  try {
    fs.writeFileSync(tempPath, content, { encoding: "utf8", flag: "wx" });
    fs.renameSync(tempPath, registryPath);
  } catch (error) {
    try { fs.rmSync(tempPath, { force: true }); } catch {}
    throw new CliError(`Could not write repository registry ${registryPath}: ${error.message}`, 1);
  }
  return registry;
}

function readRegistry(options = {}) {
  const registryPath = options.registryPath || getRegistryPath(options.env);
  if (!fs.existsSync(registryPath)) return emptyRegistry();

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  } catch (error) {
    throw new CliError(`Could not read repository registry ${registryPath}: ${error.message}`, 1);
  }
  const registry = validateRegistry(parsed, registryPath);
  const repositories = registry.repositories.filter((repository) => fs.existsSync(repository.primaryPath));
  if (repositories.length !== registry.repositories.length) {
    writeRegistry({ version: REGISTRY_VERSION, repositories }, { ...options, registryPath });
  }
  return { version: REGISTRY_VERSION, repositories };
}

function registerRepository(startDir = process.cwd(), options = {}) {
  const repository = resolveRepository(startDir, options);
  const registry = readRegistry(options);
  const now = options.now ? options.now() : new Date().toISOString();
  const entry = {
    id: repository.id,
    primaryPath: repository.primaryPath,
    displayName: repository.displayName,
    lastSeen: now
  };
  const repositories = registry.repositories.filter((candidate) => candidate.id !== entry.id);
  repositories.push(entry);
  repositories.sort(compareRepositories);
  writeRegistry({ version: REGISTRY_VERSION, repositories }, options);
  return { entry, repository };
}

function forgetRepository(inputPath, options = {}) {
  let repository;
  try {
    repository = resolveRepository(inputPath, options);
  } catch {
    repository = null;
  }
  const registry = readRegistry(options);
  const inputComparison = comparisonPath(inputPath);
  const index = registry.repositories.findIndex((entry) =>
    (repository && entry.id === repository.id) || comparisonPath(entry.primaryPath) === inputComparison
  );
  if (index === -1) return null;
  const [removed] = registry.repositories.splice(index, 1);
  writeRegistry(registry, options);
  return removed;
}

function compareRepositories(left, right) {
  return left.displayName.localeCompare(right.displayName, undefined, { sensitivity: "base" })
    || left.primaryPath.localeCompare(right.primaryPath);
}

module.exports = {
  REGISTRY_VERSION,
  emptyRegistry,
  forgetRepository,
  getDelanoHome,
  getRegistryPath,
  readRegistry,
  registerRepository,
  validateRegistry,
  writeRegistry
};
