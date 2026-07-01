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

test("viewer chat API streams AI SDK UI message chunks and validates payloads", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-chat-"));
  const projectDir = path.join(repo, ".project", "projects", "demo");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "context"), { recursive: true });
  fs.writeFileSync(path.join(repo, ".project", "context", "README.md"), "# Context\n", "utf8");
  const specPath = path.join(projectDir, "spec.md");
  const original = "# Demo\n\nReview this paragraph before implementation.\n";
  fs.writeFileSync(specPath, original, "utf8");

  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const port = await getOpenPort();
  const envWithoutPath = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.toUpperCase() !== "PATH"));
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...envWithoutPath,
      DELANO_VIEWER_ROOT: repo,
      DELANO_VIEWER_PORT: String(port),
      PATH: ""
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

  const streamed = await requestRaw(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    body: {
      messages: [
        {
          id: "u1",
          role: "user",
          parts: [{ type: "text", text: "Review this annotation." }]
        }
      ],
      sourcePath: "projects/demo/spec.md",
      annotations: [
        {
          id: "a1",
          sourcePath: "projects/demo/spec.md",
          repoPath: ".project/projects/demo/spec.md",
          type: "comment",
          quote: "Review this paragraph",
          comment: "Clarify implementation scope.",
          labels: ["clarify"],
          status: "open",
          anchor: { lineStart: 3 }
        }
      ],
      contextProfile: "implementation"
    }
  });
  assert.equal(streamed.status, 200);
  assert.match(streamed.headers["content-type"], /text\/event-stream/);
  assert.match(streamed.raw, /"type":"text-start"/);
  assert.match(streamed.raw, /"type":"text-delta"/);
  assert.match(streamed.raw, /Codex CLI[\s\S]*not found/);
  assert.match(streamed.raw, /\[DONE\]/);
  assert.doesNotMatch(streamed.raw, /^event:\s*delta/m);
  assert.equal(fs.readFileSync(specPath, "utf8"), original);

  const rejected = await requestJson(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    body: {
      sourcePath: "projects/demo/spec.md",
      annotations: []
    }
  });
  assert.equal(rejected.status, 400);
  assert.match(rejected.json.error, /message is required/);
});

test("viewer chat API can stream local Codex CLI subscription-auth output", async (t) => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), "delano-viewer-chat-codex-"));
  const projectDir = path.join(repo, ".project", "projects", "demo");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(repo, ".project", "context"), { recursive: true });
  fs.writeFileSync(path.join(repo, ".project", "context", "README.md"), "# Context\n", "utf8");
  const specPath = path.join(projectDir, "spec.md");
  const original = "# Demo\n\nReview this paragraph before implementation.\n";
  fs.writeFileSync(specPath, original, "utf8");

  const stubPath = path.join(repo, "codex-stub.cjs");
  fs.writeFileSync(stubPath, [
    "let prompt = '';",
    "process.stdin.setEncoding('utf8');",
    "process.stdin.on('data', (chunk) => { prompt += chunk; });",
    "process.stdin.on('end', () => {",
    "  if (!prompt.includes('Annotation attachments:')) process.exit(2);",
    "  console.log(JSON.stringify({ type: 'thread.started', thread_id: 'test-thread' }));",
    "  console.log(JSON.stringify({ type: 'agent_message_delta', delta: 'Fake Codex CLI ' }));",
    "  console.log(JSON.stringify({ type: 'item.completed', item: { id: 'item_0', type: 'agent_message', text: 'Fake Codex CLI subscription response.' } }));",
    "  console.log(JSON.stringify({ type: 'turn.completed', usage: { input_tokens: 1, output_tokens: 1 } }));",
    "});",
  ].join("\n"), "utf8");

  const serverPath = path.join(__dirname, "..", ".delano", "viewer", "server.js");
  const port = await getOpenPort();
  const child = spawn(process.execPath, [serverPath], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DELANO_VIEWER_ROOT: repo,
      DELANO_VIEWER_PORT: String(port),
      DELANO_VIEWER_CODEX_COMMAND: process.execPath,
      DELANO_VIEWER_CODEX_COMMAND_ARGS: JSON.stringify([stubPath])
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

  const streamed = await requestRaw(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    body: {
      messages: [
        {
          id: "u1",
          role: "user",
          parts: [{ type: "text", text: "Review this annotation." }]
        }
      ],
      sourcePath: "projects/demo/spec.md",
      annotations: [
        {
          id: "a1",
          sourcePath: "projects/demo/spec.md",
          repoPath: ".project/projects/demo/spec.md",
          type: "comment",
          quote: "Review this paragraph",
          comment: "Clarify implementation scope.",
          labels: ["clarify"],
          status: "open",
          anchor: { lineStart: 3 }
        }
      ],
      contextProfile: "implementation"
    }
  });

  assert.equal(streamed.status, 200);
  assert.match(streamed.raw, /"type":"text-delta"/);
  assert.match(streamed.raw, /Fake Codex CLI /);
  assert.match(streamed.raw, /subscription response\./);
  assert.doesNotMatch(streamed.raw, /"delta":"Fake Codex CLI subscription response\."/);
  assert.doesNotMatch(streamed.raw, /Codex CLI disabled/);
  assert.equal(fs.readFileSync(specPath, "utf8"), original);
});
