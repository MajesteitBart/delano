const test = require("node:test");
const assert = require("node:assert/strict");

const { resolveBash, runBashScript } = require("../src/cli/lib/runtime");

const PROBE_MARKER = "__delano_bash_probe_ok__";

function missing(command) {
  return {
    status: null,
    stdout: "",
    stderr: "",
    error: new Error(`spawn ${command} ENOENT`)
  };
}

test("resolveBash skips an unusable Windows candidate and selects working Git Bash", () => {
  const brokenBash = "C:\\Tools\\bash.exe";
  const gitBash = "C:\\Program Files\\Git\\bin\\bash.exe";
  const calls = [];
  const fakeSpawnSync = (command, args) => {
    calls.push([command, ...args]);
    if (command === "where.exe") {
      return { status: 0, stdout: `${brokenBash}\r\n${gitBash}\r\n`, stderr: "" };
    }
    if (command === brokenBash) {
      return {
        status: 1,
        stdout: "",
        stderr: "WSL execvpe(/bin/bash) failed: No such file or directory"
      };
    }
    if (command === gitBash && args[0] === "--version") {
      return { status: 0, stdout: "GNU bash, version 5.2", stderr: "" };
    }
    if (command === gitBash && args[0] === "-lc") {
      return { status: 0, stdout: PROBE_MARKER, stderr: "" };
    }
    return missing(command);
  };

  const resolved = resolveBash({
    platform: "win32",
    env: {
      ProgramFiles: "C:\\Program Files"
    },
    spawnSync: fakeSpawnSync
  });

  assert.equal(resolved, gitBash);
  assert.ok(calls.some(([command, arg]) => command === brokenBash && arg === "--version"));
  assert.ok(calls.some(([command, arg]) => command === gitBash && arg === "--version"));
  assert.ok(calls.some(([command, arg]) => command === gitBash && arg === "-lc"));
});

test("resolveBash skips a working Windows System32 WSL shim", () => {
  const wslShim = "C:\\Windows\\System32\\bash.exe";
  const gitBash = "C:\\Program Files\\Git\\bin\\bash.exe";
  const calls = [];
  const fakeSpawnSync = (command, args) => {
    calls.push([command, ...args]);
    if (command === "where.exe") {
      return { status: 0, stdout: `${wslShim}\r\n${gitBash}\r\n`, stderr: "" };
    }
    if (command === wslShim) {
      return args[0] === "--version"
        ? { status: 0, stdout: "GNU bash, version 5.2", stderr: "" }
        : { status: 0, stdout: PROBE_MARKER, stderr: "" };
    }
    if (command === gitBash && args[0] === "--version") {
      return { status: 0, stdout: "GNU bash, version 5.2", stderr: "" };
    }
    if (command === gitBash && args[0] === "-lc") {
      return { status: 0, stdout: PROBE_MARKER, stderr: "" };
    }
    return missing(command);
  };

  assert.equal(resolveBash({
    platform: "win32",
    env: { ProgramFiles: "C:\\Program Files" },
    spawnSync: fakeSpawnSync
  }), gitBash);
  assert.ok(!calls.some(([command]) => command === wslShim));
});

test("resolveBash accepts a working shell when login startup writes to stdout", () => {
  const gitBash = "C:\\Program Files\\Git\\bin\\bash.exe";
  const fakeSpawnSync = (command, args) => {
    if (command === "where.exe") {
      return { status: 0, stdout: `${gitBash}\r\n`, stderr: "" };
    }
    if (command === gitBash && args[0] === "--version") {
      return { status: 0, stdout: "GNU bash, version 5.2", stderr: "" };
    }
    if (command === gitBash && args[0] === "-lc") {
      return { status: 0, stdout: `Welcome to Git Bash\n${PROBE_MARKER}`, stderr: "" };
    }
    return missing(command);
  };

  assert.equal(resolveBash({
    platform: "win32",
    env: { ProgramFiles: "C:\\Program Files" },
    spawnSync: fakeSpawnSync
  }), gitBash);
});

test("resolveBash reports every failed Windows candidate with its probe reason", () => {
  const brokenBash = "C:\\Tools\\bash.exe";
  const gitBash = "C:\\Program Files\\Git\\bin\\bash.exe";
  const fakeSpawnSync = (command, args) => {
    if (command === "where.exe") {
      return { status: 0, stdout: `${brokenBash}\r\n${gitBash}\r\n`, stderr: "" };
    }
    if (command === brokenBash) {
      return {
        status: 1,
        stdout: "",
        stderr: "WSL execvpe(/bin/bash) failed: No such file or directory"
      };
    }
    if (command === gitBash && args[0] === "--version") {
      return { status: 0, stdout: "GNU bash, version 5.2", stderr: "" };
    }
    if (command === gitBash && args[0] === "-lc") {
      return { status: 2, stdout: "", stderr: "login shell probe failed" };
    }
    return missing(command);
  };

  let thrown;
  try {
    resolveBash({
      platform: "win32",
      env: {
        ProgramFiles: "C:\\Program Files"
      },
      spawnSync: fakeSpawnSync
    });
  } catch (error) {
    thrown = error;
  }

  assert.ok(thrown);
  assert.match(thrown.message, /Could not find a usable Bash runtime/);
  assert.match(thrown.message, /Candidates checked:/);
  assert.ok(thrown.message.includes(brokenBash));
  assert.ok(thrown.message.includes(gitBash));
  assert.match(thrown.message, /WSL execvpe\(\/bin\/bash\) failed/);
  assert.match(thrown.message, /-lc capability probe exited with code 2: login shell probe failed/);
});

test("runBashScript reports the selected runtime on Windows", () => {
  const gitBash = "C:\\Program Files\\Git\\bin\\bash.exe";
  const scriptPath = "C:\\repo\\.agents\\scripts\\pm\\status.sh";
  const stderr = [];
  const calls = [];
  const fakeSpawnSync = (command, args) => {
    calls.push([command, ...args]);
    if (command === "where.exe") {
      return { status: 0, stdout: `${gitBash}\r\n`, stderr: "" };
    }
    if (command === gitBash && args[0] === "--version") {
      return { status: 0, stdout: "GNU bash, version 5.2", stderr: "" };
    }
    if (command === gitBash && args[0] === "-lc") {
      return { status: 0, stdout: PROBE_MARKER, stderr: "" };
    }
    if (command === gitBash && args[0] === "C:/repo/.agents/scripts/pm/status.sh") {
      return { status: 0, stdout: "", stderr: "" };
    }
    return missing(command);
  };

  const status = runBashScript(scriptPath, ["--brief"], {
    platform: "win32",
    env: { ProgramFiles: "C:\\Program Files" },
    spawnSync: fakeSpawnSync,
    stderr: { write: (message) => stderr.push(message) }
  });

  assert.equal(status, 0);
  assert.deepEqual(stderr, [`Using Bash runtime: ${gitBash}\n`]);
  assert.ok(calls.some((call) => call[0] === gitBash
    && call[1] === "C:/repo/.agents/scripts/pm/status.sh"
    && call[2] === "--brief"));
});

test("resolveBash preserves POSIX discovery while capability-checking the result", () => {
  const bashPath = "/custom/bin/bash";
  const calls = [];
  const fakeSpawnSync = (command, args) => {
    calls.push([command, ...args]);
    if (command === "which") {
      return { status: 0, stdout: `${bashPath}\n`, stderr: "" };
    }
    if (command === bashPath && args[0] === "--version") {
      return { status: 0, stdout: "GNU bash, version 5.2", stderr: "" };
    }
    if (command === bashPath && args[0] === "-lc") {
      return { status: 0, stdout: PROBE_MARKER, stderr: "" };
    }
    return missing(command);
  };

  assert.equal(resolveBash({
    platform: "linux",
    env: {},
    spawnSync: fakeSpawnSync
  }), bashPath);
  assert.deepEqual(calls.slice(0, 3), [
    ["which", "-a", "bash"],
    [bashPath, "--version"],
    [bashPath, "-lc", `printf '%s' '${PROBE_MARKER}'`]
  ]);
});
