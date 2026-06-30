const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

function listen(server, port = 0) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.removeListener("error", reject);
      resolve(server.address().port);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

function readJson(requestUrl) {
  return new Promise((resolve, reject) => {
    http.get(requestUrl, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode !== 200) {
          reject(new Error(`Expected 200 from ${requestUrl}, got ${response.statusCode}: ${body}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    }).on("error", reject);
  });
}

function postJson(requestUrl, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const parsed = new URL(requestUrl);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: `${parsed.pathname}${parsed.search}`,
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": Buffer.byteLength(body),
      },
    }, (response) => {
      let text = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        text += chunk;
      });
      response.on("end", () => {
        let json = {};
        try {
          json = text ? JSON.parse(text) : {};
        } catch (error) {
          reject(error);
          return;
        }
        resolve({ statusCode: response.statusCode, body: json });
      });
    });
    req.on("error", reject);
    req.end(body);
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getOpenPort() {
  const server = net.createServer();
  const port = await listen(server);
  await close(server);
  return port;
}

function writeAgentFixtureRepo() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-agent-fixture-"));
  const contextDir = path.join(repo, ".project", "context");
  const projectDir = path.join(repo, ".project", "projects", "demo");
  const taskDir = path.join(projectDir, "tasks");
  fs.mkdirSync(contextDir, { recursive: true });
  fs.mkdirSync(taskDir, { recursive: true });
  fs.writeFileSync(
    path.join(contextDir, "README.md"),
    "# Context Pack\n\nRequired context files:\n\n- `project-overview.md`\n",
    "utf8"
  );
  fs.writeFileSync(path.join(contextDir, "project-overview.md"), "# Demo context\n", "utf8");
  fs.writeFileSync(
    path.join(projectDir, "spec.md"),
    "---\nname: Demo\nstatus: planned\n---\n\n# Spec: Demo\n",
    "utf8"
  );
  fs.writeFileSync(path.join(projectDir, "plan.md"), "---\nname: Demo\n---\n\n# Plan\n", "utf8");
  fs.writeFileSync(
    path.join(taskDir, "T-001-do-thing.md"),
    "---\nid: T-001\nname: Do thing\nstatus: blocked\nworkstream: WS-A\nblocked_owner: dependency\nblocked_check_back: 2026-07-01\n---\n\n# Task: Do thing\n\nPrivate raw task details should stay in the file.\n",
    "utf8"
  );
  return repo;
}

function waitForViewer(child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Timed out waiting for viewer server startup output."));
    }, 5000);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    let settled = false;
    const handleStdout = (chunk) => {
      if (!chunk.includes("Delano read-only viewer:")) return;
      settled = true;
      clearTimeout(timeout);
      child.stderr.off("data", handleStderr);
      resolve(chunk);
    };
    const handleStderr = (chunk) => {
      if (settled) return;
      clearTimeout(timeout);
      child.kill();
      reject(new Error(chunk));
    };
    child.stdout.on("data", handleStdout);
    child.stderr.on("data", handleStderr);
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

test("viewer server starts on the next port when the requested port is occupied", async (t) => {
  const blocker = net.createServer();
  const occupiedPort = await listen(blocker);
  t.after(async () => {
    if (blocker.listening) await close(blocker);
  });

  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_PORT: String(occupiedPort)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  t.after(() => {
    if (!child.killed) child.kill();
  });

  const output = await waitForViewer(child);

  const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  assert.ok(match, output);
  assert.ok(Number(match[1]) > occupiedPort, output);
  assert.match(output, new RegExp(`\\(${occupiedPort} was unavailable\\)`));

  const index = await readJson(`http://127.0.0.1:${match[1]}/api/index`);
  assert.equal(index.contextPack.root, ".project/context");
  assert.equal(index.contextPack.orderSource, "readme");
  assert.ok(index.contextPack.files.some((file) => file.path === ".project/context/project-overview.md"));
  assert.ok(index.contextPack.profiles.some((profile) => profile.command === "delano context read --profile implementation"));
  assert.equal(index.projects.find((project) => project.slug === "context").contextPack.root, ".project/context");
});

test("viewer index falls back when context metadata cannot be listed", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-context-"));
  const contextDir = path.join(repo, ".project", "context");
  fs.mkdirSync(contextDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "projects"), { recursive: true });
  fs.writeFileSync(
    path.join(contextDir, "README.md"),
    "# Context Pack\n\nRequired context files:\n\n- `../outside.md`\n",
    "utf8"
  );

  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const port = await getOpenPort();
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_ROOT: repo,
      DELANO_VIEWER_PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  t.after(() => {
    if (!child.killed) child.kill();
  });

  const output = await waitForViewer(child);
  const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  assert.ok(match, output);

  const index = await readJson(`http://127.0.0.1:${match[1]}/api/index`);
  assert.equal(index.contextPack.root, ".project/context");
  assert.equal(index.contextPack.orderSource, "viewer-index-fallback");
  assert.deepEqual(index.contextPack.files, []);
  assert.ok(index.contextPack.profiles.some((profile) => profile.command === "delano context read --profile implementation"));
  assert.ok(index.contextPack.warnings.some((warning) => warning.includes("Shared context reader failed")));
});

test("viewer agent endpoint builds local provider links without adding repo root to index", async (t) => {
  const repo = writeAgentFixtureRepo();
  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const port = await getOpenPort();
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_ROOT: repo,
      DELANO_VIEWER_PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  t.after(() => {
    if (!child.killed) child.kill();
  });

  const output = await waitForViewer(child);
  const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  assert.ok(match, output);
  const baseUrl = `http://127.0.0.1:${match[1]}`;

  const result = await postJson(`${baseUrl}/api/agent-link`, {
    provider: "codex",
    actionType: "carry-task-forward",
    projectSlug: "demo",
    sourcePath: "projects/demo/tasks/T-001-do-thing.md",
    workstreamId: "WS-A",
    taskId: "T-001",
    status: "In Progress Δ"
  });

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.provider, "codex");
  assert.match(result.body.url, /^codex:\/\/threads\/new\?/);
  const agentUrl = new URL(result.body.url);
  assert.equal(agentUrl.searchParams.get("path"), repo);
  assert.equal(agentUrl.searchParams.get("prompt"), result.body.prompt);
  assert.match(result.body.prompt, /node bin\/delano\.js context read --profile implementation/);
  assert.match(result.body.prompt, /T-001/);
  assert.match(result.body.prompt, /\.project\/projects\/demo\/tasks\/T-001-do-thing\.md/);
  assert.match(result.body.prompt, /do not edit task\/status frontmatter directly/);
  assert.doesNotMatch(result.body.prompt, /Private raw task details/);

  const index = await readJson(`${baseUrl}/api/index`);
  assert.doesNotMatch(JSON.stringify(index), new RegExp(escapeRegExp(repo)));
});

test("viewer agent endpoint rejects unsupported providers and unsafe source paths", async (t) => {
  const repo = writeAgentFixtureRepo();
  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const port = await getOpenPort();
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_ROOT: repo,
      DELANO_VIEWER_PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  t.after(() => {
    if (!child.killed) child.kill();
  });

  const output = await waitForViewer(child);
  const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  assert.ok(match, output);
  const baseUrl = `http://127.0.0.1:${match[1]}`;

  const badProvider = await postJson(`${baseUrl}/api/agent-link`, {
    provider: "shell",
    actionType: "carry-project-forward",
    projectSlug: "demo",
    sourcePath: "projects/demo/spec.md"
  });
  assert.equal(badProvider.statusCode, 400);
  assert.match(badProvider.body.error, /provider/);

  const traversal = await postJson(`${baseUrl}/api/agent-link`, {
    provider: "codex",
    actionType: "carry-project-forward",
    projectSlug: "demo",
    sourcePath: "../outside.md"
  });
  assert.equal(traversal.statusCode, 400);
  assert.match(traversal.body.error, /sourcePath/);
});

test("viewer agent endpoint falls back to copy-only for incomplete blocker metadata and long prompts", async (t) => {
  const repo = writeAgentFixtureRepo();
  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const port = await getOpenPort();
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_ROOT: repo,
      DELANO_VIEWER_PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  t.after(() => {
    if (!child.killed) child.kill();
  });

  const output = await waitForViewer(child);
  const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
  assert.ok(match, output);
  const baseUrl = `http://127.0.0.1:${match[1]}`;

  const blocker = await postJson(`${baseUrl}/api/agent-link`, {
    provider: "codex",
    actionType: "investigate-blocker",
    projectSlug: "demo",
    sourcePath: "projects/demo/tasks/T-001-do-thing.md",
    workstreamId: "WS-A",
    taskId: "T-001"
  });
  assert.equal(blocker.statusCode, 200);
  assert.equal(blocker.body.copyOnly, true);
  assert.equal(blocker.body.url, null);
  assert.match(blocker.body.warnings.join("\n"), /Blocker metadata is incomplete/);
  assert.match(blocker.body.prompt, /blocked owner: missing/);

  const longPrompt = await postJson(`${baseUrl}/api/agent-link`, {
    provider: "claude",
    actionType: "carry-project-forward",
    projectSlug: "demo",
    sourcePath: "projects/demo/spec.md",
    status: "x".repeat(6000)
  });
  assert.equal(longPrompt.statusCode, 200);
  assert.equal(longPrompt.body.copyOnly, true);
  assert.equal(longPrompt.body.url, null);
  assert.match(longPrompt.body.warnings.join("\n"), /too long/);
});
