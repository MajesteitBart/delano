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

function requestJson(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(requestUrl);
    const body = options.body ? JSON.stringify(options.body) : "";
    const request = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: `${parsed.pathname}${parsed.search}`,
      method: options.method || "GET",
      headers: {
        "content-type": "application/json",
        ...(body ? { "content-length": Buffer.byteLength(body) } : {})
      }
    }, (response) => {
      let raw = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        raw += chunk;
      });
      response.on("end", () => {
        let json = null;
        try {
          json = raw ? JSON.parse(raw) : null;
        } catch (error) {
          reject(error);
          return;
        }
        resolve({ status: response.statusCode, json, raw });
      });
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

function requestRaw(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(requestUrl);
    const body = options.body ? JSON.stringify(options.body) : "";
    const request = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: `${parsed.pathname}${parsed.search}`,
      method: options.method || "GET",
      headers: {
        "content-type": "application/json",
        ...(body ? { "content-length": Buffer.byteLength(body) } : {})
      }
    }, (response) => {
      let raw = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        raw += chunk;
      });
      response.on("end", () => {
        resolve({ status: response.statusCode, headers: response.headers, raw });
      });
    });
    request.on("error", reject);
    if (body) request.write(body);
    request.end();
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
      if (!chunk.includes("Delano guarded viewer:")) return;
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

test("viewer annotation API validates paths and supports CRUD/export", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-annotations-"));
  const projectDir = path.join(repo, ".project", "projects", "demo");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "context"), { recursive: true });
  fs.writeFileSync(path.join(repo, ".project", "context", "README.md"), "# Context\n", "utf8");
  fs.writeFileSync(path.join(projectDir, "spec.md"), [
    "---",
    "name: Demo",
    "status: active",
    "---",
    "",
    "# Demo",
    "",
    "Review this paragraph before implementation.",
    ""
  ].join("\n"), "utf8");

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

  const created = await requestJson(`${baseUrl}/api/annotations`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      quote: "Review this paragraph",
      comment: "Clarify the implementation scope.",
      type: "clarify",
      labels: ["clarify"],
      anchor: {
        blockId: "b8",
        lineStart: 8,
        highlightSource: {
          startMeta: { parentTagName: "P", parentIndex: 0, textOffset: 0 },
          endMeta: { parentTagName: "P", parentIndex: 0, textOffset: 21 },
          text: "Review this paragraph ",
          id: "test-highlight-1"
        }
      },
      author: { name: "test" }
    }
  });
  assert.equal(created.status, 201);
  assert.equal(created.json.annotation.repoPath, ".project/projects/demo/spec.md");
  assert.equal(created.json.annotation.comment, "Clarify the implementation scope.");
  assert.equal(created.json.annotation.anchor.highlightSource.id, "test-highlight-1");
  assert.equal(created.json.annotation.anchor.highlightSource.startMeta.parentTagName, "P");

  const listed = await requestJson(`${baseUrl}/api/annotations?path=projects%2Fdemo%2Fspec.md`);
  assert.equal(listed.status, 200);
  assert.equal(listed.json.annotations.length, 1);

  const doc = await requestJson(`${baseUrl}/api/doc?path=projects%2Fdemo%2Fspec.md`);
  assert.equal(doc.status, 200);
  assert.equal(doc.json.path, "projects/demo/spec.md");

  const updated = await requestJson(`${baseUrl}/api/annotations?id=${created.json.annotation.id}`, {
    method: "PATCH",
    body: { comment: "Clarify the implementation scope and acceptance evidence." }
  });
  assert.equal(updated.status, 200);
  assert.match(updated.json.annotation.comment, /acceptance evidence/);

  const exported = await requestJson(`${baseUrl}/api/annotations/export?path=projects%2Fdemo%2Fspec.md`);
  assert.equal(exported.status, 200);
  assert.match(exported.json.markdown, /Delano Viewer Annotations/);
  assert.match(exported.json.markdown, /delano context read --profile implementation/);
  assert.equal(exported.json.json.annotations.length, 1);
  assert.equal(exported.json.json.annotations[0].anchor.highlightSource.text, "Review this paragraph ");

  const rejected = await requestJson(`${baseUrl}/api/annotations`, {
    method: "POST",
    body: {
      sourcePath: "../outside.md",
      quote: "bad",
      comment: "bad"
    }
  });
  assert.equal(rejected.status, 400);
  assert.match(rejected.json.error, /sourcePath/);

  const deleted = await requestJson(`${baseUrl}/api/annotations?id=${created.json.annotation.id}`, {
    method: "DELETE"
  });
  assert.equal(deleted.status, 200);
  assert.equal(deleted.json.deleted, 1);
});

test("viewer apply API previews diffs and rejects stale baselines", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-apply-"));
  const projectDir = path.join(repo, ".project", "projects", "demo");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "context"), { recursive: true });
  fs.writeFileSync(path.join(repo, ".project", "context", "README.md"), "# Context\n", "utf8");
  const specPath = path.join(projectDir, "spec.md");
  const original = "---\nname: Demo\n---\n\n# Demo\n\nOriginal body.\n";
  fs.writeFileSync(specPath, original, "utf8");

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
  const doc = await readJson(`${baseUrl}/api/doc?path=projects%2Fdemo%2Fspec.md`);

  const preview = await requestJson(`${baseUrl}/api/apply/preview`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      expectedHash: doc.baseline.hash,
      replacementMarkdown: original.replace("Original body.", "Updated body.")
    }
  });
  assert.equal(preview.status, 200);
  assert.equal(preview.json.writes, false);
  assert.ok(preview.json.diff.some((line) => line.type === "add" && line.text.includes("Updated body")));
  assert.equal(fs.readFileSync(specPath, "utf8"), original);

  fs.writeFileSync(specPath, original.replace("Original body.", "Changed elsewhere."), "utf8");
  const stale = await requestJson(`${baseUrl}/api/apply`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      expectedHash: doc.baseline.hash,
      replacementMarkdown: original.replace("Original body.", "Updated body."),
      confirm: true
    }
  });
  assert.equal(stale.status, 409);
  assert.match(stale.json.error, /baseline/);
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

test("viewer handover API writes a handover file and returns agent commands", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-handover-"));
  const projectDir = path.join(repo, ".project", "projects", "demo");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "context"), { recursive: true });
  fs.writeFileSync(path.join(repo, ".project", "context", "README.md"), "# Context\n", "utf8");
  const specPath = path.join(projectDir, "spec.md");
  const original = "# Demo\n\nReview this paragraph before implementation.\n";
  fs.writeFileSync(specPath, original, "utf8");
  fs.mkdirSync(path.join(projectDir, "tasks"), { recursive: true });
  fs.writeFileSync(
    path.join(projectDir, "tasks", "T-001-demo-task.md"),
    "---\nid: T-001\nname: Demo task\nstatus: open\nworkstream: WS-A\n---\n\n# Task: Demo task\n",
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
  const baseUrl = `http://127.0.0.1:${match[1]}`;

  const created = await requestJson(`${baseUrl}/api/annotations`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      quote: "Review this paragraph",
      comment: "Clarify implementation scope.",
      type: "comment",
      anchor: { lineStart: 3 }
    }
  });
  assert.equal(created.status, 201);
  const annotationId = created.json.annotation.id;

  const handover = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md" }
  });
  assert.equal(handover.status, 200);
  assert.equal(handover.json.ok, true);
  assert.equal(handover.json.launched, false);
  assert.equal(handover.json.agent, "codex");
  assert.equal(handover.json.annotationCount, 1);
  assert.match(handover.json.file, /^\.project\/viewer\/handovers\/handover-.*-spec\.md$/);
  assert.ok(handover.json.command.startsWith(`codex "`), handover.json.command);
  assert.ok(handover.json.prompt.includes(handover.json.file), handover.json.prompt);
  assert.ok(handover.json.prompt.includes(".project/projects/demo/spec.md"), handover.json.prompt);
  assert.ok(handover.json.deepLink.startsWith("codex://new?prompt="), handover.json.deepLink);
  assert.ok(handover.json.deepLink.includes(`&path=${encodeURIComponent(repo)}`), handover.json.deepLink);

  const handoverFile = path.join(repo, handover.json.file.replace(/^\.project\//, ".project/"));
  assert.ok(fs.existsSync(handoverFile), handoverFile);
  const handoverText = fs.readFileSync(handoverFile, "utf8");
  assert.match(handoverText, /# Delano Review Handover/);
  assert.match(handoverText, /Clarify implementation scope\./);
  assert.match(handoverText, /\.project\/projects\/demo\/spec\.md/);

  const claude = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", agent: "claude", ids: [annotationId] }
  });
  assert.equal(claude.status, 200);
  assert.equal(claude.json.agent, "claude");
  assert.equal(claude.json.annotationCount, 1);
  assert.ok(claude.json.command.startsWith(`claude "`), claude.json.command);
  assert.equal(claude.json.deepLink, null);

  const filtered = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", ids: ["missing-id"] }
  });
  assert.equal(filtered.status, 200);
  assert.equal(filtered.json.annotationCount, 0);

  const startWork = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/tasks/T-001-demo-task.md", intent: "start" }
  });
  assert.equal(startWork.status, 200);
  assert.equal(startWork.json.intent, "start");
  assert.equal(startWork.json.file, null);
  assert.match(startWork.json.prompt, /^Work the Delano task \.project\/projects\/demo\/tasks\/T-001-demo-task\.md/);
  assert.ok(startWork.json.deepLink.startsWith("codex://new?prompt="), startWork.json.deepLink);

  const reviewWork = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/spec.md", intent: "review" }
  });
  assert.equal(reviewWork.status, 200);
  assert.equal(reviewWork.json.intent, "review");
  assert.match(reviewWork.json.prompt, /^Review the delivered work for the Delano document/);
  assert.match(reviewWork.json.prompt, /Reviewer annotations are in \.project\/viewer\/handovers\//);
  assert.ok(reviewWork.json.file, "review with annotations should write a handover file");

  const reviewNoFeedback = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/tasks/T-001-demo-task.md", intent: "review" }
  });
  assert.equal(reviewNoFeedback.status, 200);
  assert.equal(reviewNoFeedback.json.file, null);
  assert.doesNotMatch(reviewNoFeedback.json.prompt, /Reviewer annotations/);

  const unknown = await requestJson(`${baseUrl}/api/handover`, {
    method: "POST",
    body: { sourcePath: "projects/demo/missing.md" }
  });
  assert.equal(unknown.status, 404);

  const wrongMethod = await requestJson(`${baseUrl}/api/handover`, { method: "GET" });
  assert.equal(wrongMethod.status, 405);

  assert.equal(fs.readFileSync(specPath, "utf8"), original);
});
