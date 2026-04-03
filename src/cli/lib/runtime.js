const { existsSync, lstatSync } = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { CliError } = require("./errors");

function getPackageRoot() {
  return path.resolve(__dirname, "../../..");
}

function getPathType(targetPath) {
  try {
    const stat = lstatSync(targetPath);
    if (stat.isSymbolicLink()) {
      return "symlink";
    }
    if (stat.isDirectory()) {
      return "directory";
    }
    return "file";
  } catch {
    return null;
  }
}

function findDelanoRoot(startDir = process.cwd()) {
  let current = path.resolve(startDir);
  const { root } = path.parse(current);

  while (true) {
    const hasRuntime = existsSync(path.join(current, ".agents", "scripts", "pm"));
    const hasProject = existsSync(path.join(current, ".project"));
    if (hasRuntime && hasProject) {
      return current;
    }

    if (current === root) {
      return null;
    }

    current = path.dirname(current);
  }
}

function resolveBash() {
  const candidates = [];

  if (process.env.DELANO_BASH) {
    candidates.push(process.env.DELANO_BASH);
  }

  if (process.platform === "win32") {
    const whereResult = spawnSync("where.exe", ["bash"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });

    if (whereResult.status === 0 && whereResult.stdout) {
      for (const line of whereResult.stdout.split(/\r?\n/)) {
        if (line.trim()) {
          candidates.push(line.trim());
        }
      }
    }

    candidates.push(
      "C:\\Program Files\\Git\\usr\\bin\\bash.exe",
      "C:\\Program Files\\Git\\bin\\bash.exe"
    );
  } else {
    const whichResult = spawnSync("which", ["bash"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    if (whichResult.status === 0 && whichResult.stdout.trim()) {
      candidates.push(whichResult.stdout.trim());
    }
    candidates.push("/usr/bin/bash", "/bin/bash");
  }

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      return candidate;
    }
  }

  throw new CliError(
    "Could not find a usable bash runtime. Install bash or set DELANO_BASH to its full path.",
    1
  );
}

function runBashScript(scriptPath, args, options = {}) {
  const bashPath = resolveBash();
  const result = spawnSync(bashPath, [scriptPath, ...args], {
    cwd: options.cwd || process.cwd(),
    stdio: "inherit",
    env: options.env || process.env
  });

  if (result.error) {
    throw new CliError(`Failed to launch bash for ${path.basename(scriptPath)}: ${result.error.message}`, 1);
  }

  return typeof result.status === "number" ? result.status : 1;
}

function ensureDirectoryPath(targetPath) {
  const kind = getPathType(targetPath);
  if (kind && kind !== "directory") {
    throw new CliError(`${targetPath} exists as a ${kind}, but a directory is required.`, 1);
  }
}

module.exports = {
  ensureDirectoryPath,
  findDelanoRoot,
  getPackageRoot,
  getPathType,
  resolveBash,
  runBashScript
};
