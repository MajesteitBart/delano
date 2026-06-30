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

async function getOpenPort() {
  const server = net.createServer();
  const port = await listen(server);
  await close(server);
  return port;
}

function waitForViewer(child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error("Timed out waiting for viewer server startup output."));
    }, 5000);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      if (!chunk.includes("Delano read-only viewer:")) return;
      clearTimeout(timeout);
      resolve(chunk);
    });
    child.stderr.on("data", (chunk) => {
      clearTimeout(timeout);
      child.kill();
      reject(new Error(chunk));
    });
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
