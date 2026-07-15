const { existsSync, lstatSync } = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { CliError } = require("./errors");

const BASH_PROBE_MARKER = "__delano_bash_probe_ok__";

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

function resolveBash(options = {}) {
  const platform = options.platform || process.platform;
  const env = options.env || process.env;
  const spawn = options.spawnSync || spawnSync;
  const candidates = discoverBashCandidates({ platform, env, spawnSync: spawn });
  const failures = [];

  for (const candidate of candidates) {
    const probe = probeBashCandidate(candidate, { env, spawnSync: spawn });
    if (probe.ok) {
      return candidate;
    }
    failures.push({ candidate, reason: probe.reason });
  }

  const diagnostics = failures.length > 0
    ? failures.map(({ candidate, reason }) => `- ${formatDiagnosticCandidate(candidate)}: ${reason}`)
    : ["- No Bash candidates were discovered."];

  throw new CliError([
    "Could not find a usable Bash runtime.",
    "Candidates checked:",
    ...diagnostics,
    platform === "win32"
      ? "Install Git Bash or set DELANO_BASH to the full path of a working bash.exe."
      : "Install Bash or set DELANO_BASH to the full path of a working executable."
  ].join("\n"), 1);
}

function discoverBashCandidates({ platform, env, spawnSync: spawn }) {
  const candidates = [];
  if (env.DELANO_BASH) {
    candidates.push(env.DELANO_BASH);
  }

  if (platform === "win32") {
    const whereResult = spawn("where.exe", ["bash"], {
      encoding: "utf8",
      env,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 5000,
      windowsHide: true
    });
    if (whereResult.status === 0 && whereResult.stdout) {
      candidates.push(...whereResult.stdout
        .split(/\r?\n/)
        .filter((candidate) => !isWindowsSystemBash(candidate)));
    }

    const programRoots = [
      env.ProgramW6432,
      env.ProgramFiles,
      env["ProgramFiles(x86)"],
      "C:\\Program Files",
      "C:\\Program Files (x86)"
    ].filter(Boolean);

    for (const root of programRoots) {
      candidates.push(
        path.win32.join(root, "Git", "bin", "bash.exe"),
        path.win32.join(root, "Git", "usr", "bin", "bash.exe")
      );
    }

    if (env.LOCALAPPDATA) {
      candidates.push(
        path.win32.join(env.LOCALAPPDATA, "Programs", "Git", "bin", "bash.exe"),
        path.win32.join(env.LOCALAPPDATA, "Programs", "Git", "usr", "bin", "bash.exe")
      );
    }
  } else {
    const whichResult = spawn("which", ["-a", "bash"], {
      encoding: "utf8",
      env,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 5000
    });
    if (whichResult.status === 0 && whichResult.stdout) {
      candidates.push(...whichResult.stdout.split(/\r?\n/));
    }
    candidates.push("bash", "/usr/local/bin/bash", "/opt/homebrew/bin/bash", "/usr/bin/bash", "/bin/bash");
  }

  return dedupeCandidates(candidates, platform);
}

function isWindowsSystemBash(candidate) {
  return /^[a-z]:[\\/]windows[\\/]system32[\\/]bash\.exe$/i.test(String(candidate).trim());
}

function dedupeCandidates(candidates, platform) {
  const seen = new Set();
  const unique = [];

  for (const rawCandidate of candidates) {
    const candidate = typeof rawCandidate === "string" ? rawCandidate.trim() : "";
    if (!candidate) {
      continue;
    }

    const key = platform === "win32" ? candidate.toLowerCase() : candidate;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(candidate);
    }
  }

  return unique;
}

function formatDiagnosticCandidate(candidate) {
  return `"${candidate
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")}"`;
}

function probeBashCandidate(candidate, { env, spawnSync: spawn }) {
  const spawnOptions = {
    encoding: "utf8",
    env,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 5000,
    windowsHide: true
  };

  const versionResult = spawn(candidate, ["--version"], spawnOptions);
  const versionFailure = describeProcessFailure(versionResult, "--version");
  if (versionFailure) {
    return { ok: false, reason: versionFailure };
  }

  const shellResult = spawn(candidate, [
    "-lc",
    `printf '%s' '${BASH_PROBE_MARKER}'`
  ], spawnOptions);
  const shellFailure = describeProcessFailure(shellResult, "-lc capability probe");
  if (shellFailure) {
    return { ok: false, reason: shellFailure };
  }

  if (!(shellResult.stdout || "").includes(BASH_PROBE_MARKER)) {
    return {
      ok: false,
      reason: `-lc capability probe returned unexpected output${formatProcessDetail(shellResult)}`
    };
  }

  return { ok: true };
}

function describeProcessFailure(result, label) {
  if (result.error) {
    return `${label} failed to start: ${result.error.message}`;
  }
  if (result.signal) {
    return `${label} terminated by signal ${result.signal}${formatProcessDetail(result)}`;
  }
  if (result.status !== 0) {
    const status = typeof result.status === "number" ? result.status : "unknown";
    return `${label} exited with code ${status}${formatProcessDetail(result)}`;
  }
  return null;
}

function formatProcessDetail(result) {
  const detail = String(result.stderr || result.stdout || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!detail) {
    return "";
  }
  const truncated = detail.length > 240 ? `${detail.slice(0, 237)}...` : detail;
  return `: ${truncated}`;
}

function normalizeBashScriptPath(scriptPath, platform = process.platform) {
  if (platform !== "win32") {
    return scriptPath;
  }

  return scriptPath.replace(/\\/g, "/");
}

function runBashScript(scriptPath, args, options = {}) {
  const platform = options.platform || process.platform;
  const env = options.env || process.env;
  const spawn = options.spawnSync || spawnSync;
  const stderr = options.stderr || process.stderr;
  const bashPath = resolveBash({ platform, env, spawnSync: spawn });
  if (platform === "win32" && options.reportBashSelection !== false) {
    stderr.write(`Using Bash runtime: ${bashPath}\n`);
  }
  const normalizedScriptPath = normalizeBashScriptPath(scriptPath, platform);
  const result = spawn(bashPath, [normalizedScriptPath, ...args], {
    cwd: options.cwd || process.cwd(),
    stdio: "inherit",
    env
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
  normalizeBashScriptPath,
  resolveBash,
  runBashScript
};
