#!/usr/bin/env node
/*
 * Delano guarded markdown viewer.
 * Serves .project markdown contracts and writes only constrained review artifacts.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn, spawnSync } = require('node:child_process');

const launchRoot = path.resolve(process.env.DELANO_VIEWER_ROOT || path.resolve(__dirname, '..', '..'));
let repoRoot = launchRoot;
let projectRoot = path.join(repoRoot, '.project');
const publicRoot = path.join(__dirname, 'public');
const DEFAULT_PORT = 3977;
const MAX_PORT = 65535;
const MAX_PORT_ATTEMPTS = 100;
const MAX_BODY_BYTES = 512 * 1024;
const MAX_ANNOTATION_QUOTE = 4000;
const MAX_ANNOTATION_COMMENT = 12000;
const MAX_LABELS = 12;
const MAX_HANDOVER_IDS = 200;
const HANDOVER_AGENTS = new Set([
  'chatgpt',
  'codex',
  'claude-code',
  'claude',
  't3code',
]);
const WATCH_DEBOUNCE_MS = 250;
const FALLBACK_RESCAN_MS = 2000;
const WATCHER_RESTART_MS = 1000;
const SSE_HEARTBEAT_MS = 25000;
const MAX_ACTIVITY_EVENTS = 200;
let annotationStoreDir = path.join(projectRoot, 'viewer');
let annotationStorePath = path.join(annotationStoreDir, 'annotations.json');
let handoverDir = path.join(annotationStoreDir, 'handovers');
const startPort = normalizePort(process.env.DELANO_VIEWER_PORT || process.env.PORT, DEFAULT_PORT);
const activityEvents = [];
const sseClients = new Set();

let markdownSnapshot = new Map();
let projectWatcher = null;
let rescanTimer = null;
let fallbackRescanTimer = null;
let watcherRestartTimer = null;
let watcherErrorLogged = false;
let liveUpdatesStarted = false;
let liveUpdatesStopping = false;
let contextGeneration = 1;
let contextSwitching = false;
let activeContext = null;

class HttpRequestError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'HttpRequestError';
    this.statusCode = statusCode;
  }
}

let contextReader = null;
let repositoryDomain = null;
try {
  contextReader = require(path.resolve(__dirname, '..', '..', 'src', 'cli', 'lib', 'context-reader'));
} catch {
  contextReader = null;
}
try {
  repositoryDomain = {
    git: require(path.resolve(__dirname, '..', '..', 'src', 'cli', 'lib', 'git-repository')),
    registry: require(path.resolve(__dirname, '..', '..', 'src', 'cli', 'lib', 'repository-registry')),
    state: require(path.resolve(__dirname, '..', '..', 'src', 'cli', 'lib', 'worktree-state')),
  };
} catch {
  repositoryDomain = null;
}

function legacyRepositoryContext(root) {
  const canonical = path.resolve(root);
  const id = sha256(`legacy-repository:${canonical}`);
  const worktreeId = sha256(`legacy-worktree:${canonical}`);
  return {
    repository: { id, primaryPath: canonical, displayName: path.basename(canonical), worktrees: [] },
    worktree: {
      id: worktreeId,
      path: canonical,
      head: null,
      branch: null,
      detached: false,
      role: 'primary',
      primary: true,
      available: true,
      projectAvailable: fs.existsSync(path.join(canonical, '.project')),
      projectState: {
        status: fs.existsSync(path.join(canonical, '.project')) ? 'clean' : 'unavailable',
        available: fs.existsSync(path.join(canonical, '.project')),
        diverged: false,
        dirty: false,
        dirtyFiles: [],
        reason: fs.existsSync(path.join(canonical, '.project')) ? null : '.project is missing',
      },
    },
    legacy: true,
  };
}

function resolveLaunchContext() {
  if (!repositoryDomain) return legacyRepositoryContext(launchRoot);
  try {
    const registered = repositoryDomain.registry.registerRepository(launchRoot);
    const repository = registered.repository;
    const worktrees = repositoryDomain.state.classifyRepositoryWorktrees(repository);
    const launchReal = realpathSafe(launchRoot) || path.resolve(launchRoot);
    const worktree = worktrees.find((candidate) => {
      const candidateReal = realpathSafe(candidate.path) || path.resolve(candidate.path);
      return sameFilesystemPath(candidateReal, launchReal);
    });
    if (!worktree) return legacyRepositoryContext(launchRoot);
    return { repository: { ...repository, worktrees }, worktree, legacy: false };
  } catch {
    return legacyRepositoryContext(launchRoot);
  }
}

function setActiveRoot(context) {
  repoRoot = path.resolve(context.worktree.path);
  projectRoot = path.join(repoRoot, '.project');
  annotationStoreDir = path.join(projectRoot, 'viewer');
  annotationStorePath = path.join(annotationStoreDir, 'annotations.json');
  handoverDir = path.join(annotationStoreDir, 'handovers');
  activeContext = context;
}

setActiveRoot(resolveLaunchContext());

function normalizePort(value, fallback) {
  const parsed = Number(value || fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_PORT) return fallback;
  return parsed;
}

function parseRequestUrl(requestUrl) {
  const parsed = new URL(requestUrl || '/', 'http://127.0.0.1');
  return {
    pathname: parsed.pathname,
    query: Object.fromEntries(parsed.searchParams.entries()),
  };
}

function isInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel === '' || (!!rel && !rel.startsWith('..') && !path.isAbsolute(rel));
}

function realpathSafe(file) {
  try {
    return fs.realpathSync.native(file);
  } catch {
    return null;
  }
}

function sameFilesystemPath(left, right) {
  const normalize = (value) => {
    const resolved = path.resolve(String(value || ''));
    const canonical = realpathSafe(resolved) || resolved;
    return process.platform === 'win32' ? canonical.toLowerCase() : canonical;
  };
  return normalize(left) === normalize(right);
}

function sha256(text) {
  return crypto.createHash('sha256').update(String(text || ''), 'utf8').digest('hex');
}

function fileBaseline(file) {
  const markdown = readText(file);
  const stat = fs.statSync(file);
  return {
    hash: sha256(markdown),
    size: stat.size,
    mtimeMs: stat.mtimeMs,
    updated: stat.mtime.toISOString(),
  };
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function walkMarkdown(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(full));
    if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function markdownPath(file) {
  return path.relative(projectRoot, file).replace(/\\/g, '/');
}

function buildMarkdownSnapshot() {
  const snapshot = new Map();
  for (const file of walkMarkdown(projectRoot)) {
    try {
      const stat = fs.statSync(file);
      snapshot.set(markdownPath(file), { mtimeMs: stat.mtimeMs, size: stat.size });
    } catch (error) {
      if (!error || error.code !== 'ENOENT') throw error;
    }
  }
  return snapshot;
}

function diffMarkdownSnapshots(previous, next, at) {
  const events = [];
  for (const [rel, current] of next) {
    const prior = previous.get(rel);
    if (!prior) {
      events.push({ kind: 'created', path: rel, at });
    } else if (prior.mtimeMs !== current.mtimeMs || prior.size !== current.size) {
      events.push({ kind: 'modified', path: rel, at });
    }
  }
  for (const rel of previous.keys()) {
    if (!next.has(rel)) events.push({ kind: 'deleted', path: rel, at });
  }
  return events.sort((a, b) => a.path.localeCompare(b.path) || a.kind.localeCompare(b.kind));
}

function removeSseClient(client) {
  if (!sseClients.delete(client)) return;
  clearInterval(client.heartbeat);
}

function writeSseEvent(client, event, data) {
  if (client.response.destroyed || client.response.writableEnded) {
    removeSseClient(client);
    return;
  }
  try {
    client.response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  } catch {
    removeSseClient(client);
  }
}

function publishFileEvents(events, at) {
  activityEvents.push(...events);
  if (activityEvents.length > MAX_ACTIVITY_EVENTS) {
    activityEvents.splice(0, activityEvents.length - MAX_ACTIVITY_EVENTS);
  }

  for (const client of sseClients) {
    writeSseEvent(client, 'index-changed', { at, count: events.length });
    for (const event of events) writeSseEvent(client, 'doc-changed', event);
  }
}

function logWatcherError(error) {
  if (watcherErrorLogged) return;
  watcherErrorLogged = true;
  const message = error && error.message ? error.message : String(error);
  console.error(`Delano viewer watcher error; live updates will retry or use polling: ${message}`);
}

function rescanMarkdown(generation = contextGeneration) {
  if (generation !== contextGeneration) return;
  try {
    const next = buildMarkdownSnapshot();
    const at = new Date().toISOString();
    const events = diffMarkdownSnapshots(markdownSnapshot, next, at);
    markdownSnapshot = next;
    if (events.length) publishFileEvents(events, at);
  } catch (error) {
    logWatcherError(error);
  }
}

function scheduleRescan(generation = contextGeneration) {
  if (liveUpdatesStopping || generation !== contextGeneration) return;
  clearTimeout(rescanTimer);
  rescanTimer = setTimeout(() => {
    rescanTimer = null;
    rescanMarkdown(generation);
  }, WATCH_DEBOUNCE_MS);
  rescanTimer.unref();
}

function isRecursiveWatchUnsupported(error) {
  const message = error && error.message ? error.message : '';
  return error && error.code === 'ERR_FEATURE_UNAVAILABLE_ON_PLATFORM'
    || /recursive.+(unavailable|unsupported|not supported)/i.test(message);
}

function startFallbackRescan() {
  if (fallbackRescanTimer || liveUpdatesStopping) return;
  const generation = contextGeneration;
  fallbackRescanTimer = setInterval(() => rescanMarkdown(generation), FALLBACK_RESCAN_MS);
  fallbackRescanTimer.unref();
}

function scheduleWatcherRestart() {
  if (watcherRestartTimer || fallbackRescanTimer || liveUpdatesStopping) return;
  const generation = contextGeneration;
  watcherRestartTimer = setTimeout(() => {
    if (generation !== contextGeneration) return;
    watcherRestartTimer = null;
    rescanMarkdown(generation);
    startProjectWatcher();
  }, WATCHER_RESTART_MS);
  watcherRestartTimer.unref();
}

function handleWatcherFailure(watcher, error) {
  if (projectWatcher !== watcher) return;
  logWatcherError(error);
  projectWatcher = null;
  try {
    watcher.close();
  } catch {
    // The watcher may already be closed after an error.
  }
  if (isRecursiveWatchUnsupported(error)) startFallbackRescan();
  else scheduleWatcherRestart();
}

function startProjectWatcher() {
  if (projectWatcher || fallbackRescanTimer || liveUpdatesStopping) return;
  let watcher;
  const generation = contextGeneration;
  try {
    watcher = fs.watch(realpathSafe(projectRoot) || projectRoot, { recursive: true }, () => scheduleRescan(generation));
  } catch (error) {
    logWatcherError(error);
    if (isRecursiveWatchUnsupported(error)) startFallbackRescan();
    else scheduleWatcherRestart();
    return;
  }

  projectWatcher = watcher;
  watcher.on('error', (error) => handleWatcherFailure(watcher, error));
  watcher.on('close', () => {
    if (generation !== contextGeneration) return;
    if (projectWatcher === watcher) projectWatcher = null;
    if (!liveUpdatesStopping && !projectWatcher && !fallbackRescanTimer) scheduleWatcherRestart();
  });
}

function startLiveUpdates() {
  if (liveUpdatesStarted) return;
  liveUpdatesStarted = true;
  try {
    markdownSnapshot = buildMarkdownSnapshot();
  } catch (error) {
    logWatcherError(error);
    markdownSnapshot = new Map();
  }
  startProjectWatcher();
  rescanMarkdown();
}

function stopLiveUpdates() {
  if (liveUpdatesStopping) return;
  liveUpdatesStopping = true;
  clearTimeout(rescanTimer);
  clearTimeout(watcherRestartTimer);
  clearInterval(fallbackRescanTimer);
  rescanTimer = null;
  watcherRestartTimer = null;
  fallbackRescanTimer = null;
  if (projectWatcher) {
    const watcher = projectWatcher;
    projectWatcher = null;
    watcher.close();
  }
  for (const client of [...sseClients]) {
    removeSseClient(client);
    client.response.destroy();
  }
}

function splitFrontmatter(markdown) {
  if (!markdown.startsWith('---\n') && !markdown.startsWith('---\r\n')) return { frontmatter: {}, body: markdown };
  const normalized = markdown.replace(/^---\r?\n/, '');
  const close = normalized.search(/\r?\n---\r?\n/);
  if (close < 0) return { frontmatter: {}, body: markdown };
  const yaml = normalized.slice(0, close);
  const body = normalized.slice(close).replace(/^\r?\n---\r?\n/, '');
  let frontmatter;
  try {
    frontmatter = yaml.trimStart().startsWith('{') ? JSON.parse(yaml) : parseSimpleYaml(yaml);
  } catch {
    frontmatter = {};
  }
  return { frontmatter, body };
}

function parseScalar(raw) {
  const value = raw.trim().replace(/^['"]|['"]$/g, '');
  if (value === '') return '';
  if (/^(true|false)$/i.test(value)) return value.toLowerCase() === 'true';
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map((item) => parseScalar(item)).filter((item) => item !== '');
  }
  return value;
}

function parseSimpleYaml(yaml) {
  const data = {};
  let currentKey = null;
  for (const line of yaml.split(/\r?\n/)) {
    const list = line.match(/^\s*-\s+(.*)$/);
    if (list && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = data[currentKey] ? [data[currentKey]] : [];
      data[currentKey].push(parseScalar(list[1]));
      continue;
    }
    const pair = line.match(/^([^:#][^:]*):\s*(.*)$/);
    if (!pair) continue;
    currentKey = pair[1].trim();
    data[currentKey] = pair[2] ? parseScalar(pair[2]) : [];
  }
  return data;
}

function firstHeading(body) {
  const heading = body.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : null;
}

function snippet(body) {
  const lines = body.replace(/```[\s\S]*?```/g, '').split(/\r?\n/);
  const paragraph = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (paragraph.length) break;
      continue;
    }
    if (
      /^#{1,6}\s/.test(trimmed) ||
      /^(?:[-*+]\s|\d+[.)]\s|>\s?|\|)/.test(trimmed) ||
      /^(?:-{3,}|_{3,}|\*{3,})$/.test(trimmed)
    ) {
      if (paragraph.length) break;
      continue;
    }
    paragraph.push(trimmed);
  }

  const text = paragraph
    .join(' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= 180) return text;

  const candidate = text.slice(0, 179).trimEnd();
  const boundary = candidate.lastIndexOf(' ');
  const truncated = boundary >= 120 ? candidate.slice(0, boundary) : candidate;
  return `${truncated}…`;
}

function relationshipFields(frontmatter) {
  const result = {};
  for (const [key, value] of Object.entries(frontmatter)) {
    const text = Array.isArray(value) ? value.join(' ') : String(value ?? '');
    const links = [...text.matchAll(/\[\[([^\]]+)\]\]/g)].map((m) => m[1]);
    if (links.length) result[key] = links;
  }
  return result;
}

function projectSlugFor(rel) {
  const match = rel.match(/^projects\/([^/]+)\//);
  return match ? match[1] : null;
}

function artifactRoleFor(rel) {
  if (rel.startsWith('context/')) return rel.endsWith('/progress.md') || rel.endsWith('progress.md') ? 'progress' : 'context';
  if (rel.startsWith('templates/')) return 'template';
  if (/^reviews\/[^/]+\.md$/.test(rel)) return 'review';
  if (/^projects\/[^/]+\/research\//.test(rel)) return 'research';
  if (/\/spec\.md$/.test(rel)) return 'spec';
  if (/\/plan\.md$/.test(rel)) return 'plan';
  if (/\/decisions\.md$/.test(rel)) return 'decision';
  if (/\/progress\.md$/.test(rel) || /\/updates\//.test(rel) || /\/completion-summary\.md$/.test(rel)) return 'progress';
  if (/\/workstreams\/[^/]+\.md$/.test(rel)) return 'workstream';
  if (/\/tasks\/[^/]+\.md$/.test(rel)) return 'task';
  return 'context';
}

function codeFromFilename(rel, prefix) {
  const base = path.basename(rel, '.md');
  const match = base.match(new RegExp(`^(${prefix}-[A-Za-z0-9]+)`));
  return match ? match[1] : null;
}

function normalizeWorkstreamId(value) {
  if (!value) return null;
  const normalized = String(value).trim().toUpperCase();
  return /^WS-[A-Z0-9]+$/.test(normalized) ? normalized : null;
}

function csvArray(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return [];
  return [String(value)];
}

function docMeta(file, relOverride = null) {
  const markdown = readText(file);
  const { frontmatter, body } = splitFrontmatter(markdown);
  const rel = relOverride || path.relative(projectRoot, file).replace(/\\/g, '/');
  const stat = fs.statSync(file);
  const role = artifactRoleFor(rel);
  const reviewOpenFindings = role === 'review' && Array.isArray(frontmatter.findings)
    ? frontmatter.status === 'archived' ? 0 : frontmatter.findings.filter((finding) => finding?.status === 'open').length
    : null;
  return {
    path: rel,
    title: frontmatter.name || firstHeading(body) || path.basename(file, '.md'),
    status: frontmatter.status || null,
    type: rel.startsWith('context/') ? 'context' : rel.split('/')[0],
    project: projectSlugFor(rel),
    role,
    artifactRole: role,
    workstreamId: role === 'workstream' ? codeFromFilename(rel, 'WS') : (role === 'task' ? normalizeWorkstreamId(frontmatter.workstream) : null),
    taskId: role === 'task' ? frontmatter.id || codeFromFilename(rel, 'T') : null,
    dependsOn: role === 'task' ? csvArray(frontmatter.depends_on) : [],
    updated: frontmatter.updated || frontmatter.timestamp || stat.mtime.toISOString(),
    frontmatter,
    relationships: relationshipFields(frontmatter),
    snippet: snippet(body),
    size: stat.size,
    baselineHash: sha256(markdown),
    reviewId: role === 'review' ? frontmatter.review_id || null : null,
    sourcePath: role === 'review' ? frontmatter.source?.path || null : null,
    openFindingCount: reviewOpenFindings,
  };
}

function words(text) {
  return new Set(String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !['and', 'the', 'for', 'with', 'docs'].includes(w)));
}

function overlapScore(a, b) {
  let score = 0;
  for (const word of a) if (b.has(word)) score += 1;
  return score;
}

function relateTasksToWorkstreams(projectDocs) {
  const workstreams = projectDocs.filter((doc) => doc.role === 'workstream');
  const tasks = projectDocs.filter((doc) => doc.role === 'task');
  const wsById = new Map(workstreams.map((ws) => [ws.workstreamId, ws]));
  const wsWords = new Map(workstreams.map((ws) => [ws.path, words(`${ws.workstreamId} ${ws.title} ${ws.snippet}`)]));
  for (const task of tasks) {
    if (task.workstreamId && wsById.has(task.workstreamId)) {
      task.workstreamPath = wsById.get(task.workstreamId).path;
      continue;
    }
    const taskWords = words(`${task.taskId} ${task.title} ${task.snippet}`);
    let best = null;
    for (const ws of workstreams) {
      const score = overlapScore(taskWords, wsWords.get(ws.path));
      if (!best || score > best.score) best = { ws, score };
    }
    task.workstreamId = best && best.score > 0 ? best.ws.workstreamId : null;
    task.workstreamPath = best && best.score > 0 ? best.ws.path : null;
  }
}

function projectOutline(projectDocs) {
  relateTasksToWorkstreams(projectDocs);
  const byRole = (role) => projectDocs.filter((doc) => doc.role === role);
  const byName = (docs) => docs.slice().sort((a, b) => a.path.localeCompare(b.path));
  const tasks = byName(byRole('task'));
  return {
    spec: byRole('spec')[0]?.path || null,
    plan: byRole('plan')[0]?.path || null,
    research: byName(byRole('research')).map((doc) => doc.path),
    progress: byRole('progress').map((doc) => doc.path),
    decisions: byRole('decision').map((doc) => doc.path),
    workstreams: byName(byRole('workstream')).map((ws) => ({
      path: ws.path,
      id: ws.workstreamId,
      title: ws.title,
      status: ws.status,
      tasks: tasks.filter((task) => task.workstreamPath === ws.path).map((task) => task.path),
    })),
    unassignedTasks: tasks.filter((task) => !task.workstreamPath).map((task) => task.path),
  };
}

function contextPackProfiles() {
  return [
    ['overview', 'High-level project, product, and progress context.'],
    ['implementation', 'Technical and structural context for coding tasks.'],
    ['ui', 'Product, style, and GUI testing context for interface work.'],
    ['all', 'Every discovered markdown file in the context pack.']
  ].map(([name, description]) => ({
    name,
    description,
    command: `delano context read --profile ${name}`
  }));
}

function fallbackContextPack(warning, profiles = []) {
  return {
    root: '.project/context',
    orderSource: 'viewer-index-fallback',
    required: [],
    files: [],
    missing: [],
    warnings: [warning],
    profiles
  };
}

function loadContextPack() {
  if (!contextReader) {
    return fallbackContextPack('Shared context reader helper is unavailable to this viewer runtime.');
  }

  try {
    const pack = contextReader.listContextFiles({ repoRoot });
    return {
      root: pack.root,
      orderSource: pack.orderSource,
      required: pack.required,
      files: pack.files,
      missing: pack.missing,
      warnings: pack.warnings,
      profiles: contextPackProfiles()
    };
  } catch (error) {
    return fallbackContextPack(
      `Shared context reader failed while building viewer context metadata: ${error.message}`,
      contextPackProfiles()
    );
  }
}

function loadSchemaOptions() {
  const schemaRoot = path.join(repoRoot, '.agents', 'schemas', 'artifacts');
  try {
    if (!fs.existsSync(schemaRoot)) {
      throw new Error(`Artifact schema directory is missing: ${path.join('.agents', 'schemas', 'artifacts')}`);
    }
    const options = {};
    for (const entry of fs.readdirSync(schemaRoot, { withFileTypes: true }).filter((item) => item.isFile() && item.name.endsWith('.schema.json')).sort((a, b) => a.name.localeCompare(b.name))) {
      const artifact = entry.name.replace(/\.schema\.json$/, '');
      const schemaPath = path.join(schemaRoot, entry.name);
      let schema;
      try {
        schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      } catch (error) {
        throw new Error(`Artifact schema is malformed: ${entry.name} (${error.message})`);
      }
      const fields = {};
      for (const [field, definition] of Object.entries(schema.properties || {})) {
        if (Array.isArray(definition.enum)) fields[field] = [...definition.enum];
      }
      options[artifact] = fields;
    }
    return { options, error: null };
  } catch (error) {
    return { options: null, error: error.message };
  }
}

function loadReviewSchema() {
  const schemaPath = path.join(repoRoot, '.agents', 'schemas', 'artifacts', 'review.schema.json');
  try {
    return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  } catch (error) {
    throw new HttpRequestError(`Review schema is unavailable or malformed: ${error.message}`, 500);
  }
}

function reviewSchemaOptions() {
  try {
    const schema = loadReviewSchema();
    return {
      status: [...schema.properties.status.enum],
      findingStatus: [...schema.$defs.finding.properties.status.enum],
      kind: [...schema.$defs.finding.properties.kind.enum],
      severity: [...schema.$defs.finding.properties.severity.enum],
      anchorState: [...schema.$defs.anchor.properties.state.enum],
      hashAlgorithm: schema.$defs.source.properties.hash_algorithm.const,
    };
  } catch {
    return null;
  }
}

function normalizeSourceText(file) {
  const bytes = fs.readFileSync(file);
  let decoded;
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new HttpRequestError('Review source must be valid UTF-8.', 400);
  }
  if (decoded.startsWith('\uFEFF')) decoded = decoded.slice(1);
  return decoded.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function normalizeReviewQuote(value) {
  return String(value ?? '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function normalizedContentHash(file) {
  return sha256(normalizeSourceText(file));
}

function gitSourceProvenance(source) {
  const status = spawnSync('git', ['status', '--porcelain=v1', '--untracked-files=all', '--', source.repoPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const tracked = spawnSync('git', ['ls-files', '--error-unmatch', '--', source.repoPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const committed = status.status === 0 && tracked.status === 0 && !String(status.stdout || '').trim();
  let blob = null;
  if (committed && activeContext.worktree.head) {
    const blobResult = spawnSync('git', ['rev-parse', `${activeContext.worktree.head}:${source.repoPath}`], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
    if (blobResult.status === 0) blob = String(blobResult.stdout || '').trim() || null;
  }
  return {
    contentState: committed ? 'committed' : 'uncommitted',
    commit: committed ? activeContext.worktree.head : null,
    blob: committed ? blob : null,
  };
}

function schemaAllowsOnly(value, definition, label, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${label} must be an object`);
    return;
  }
  const allowed = new Set(Object.keys(definition.properties || {}));
  for (const field of definition.required || []) {
    if (!(field in value)) errors.push(`${label}.${field} is required`);
  }
  for (const field of Object.keys(value)) {
    if (!allowed.has(field)) errors.push(`${label}.${field} is unsupported`);
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validDateTime(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function validDisplayName(value) {
  return typeof value === 'string' && value.length >= 1 && value.length <= 100 && !/[@\r\n]/.test(value);
}

function validGitObjectId(value) {
  return typeof value === 'string' && /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(value);
}

function reviewValidationErrors(review, schema = loadReviewSchema()) {
  const errors = [];
  if (!isRecord(review)) return ['review must be an object'];
  schemaAllowsOnly(review, schema, 'review', errors);
  if (review.schema_version !== schema.properties.schema_version.const) errors.push('review.schema_version is invalid');
  if (!schema.properties.status.enum.includes(review?.status)) errors.push('review.status is invalid');
  if (!new RegExp(schema.properties.review_id.pattern).test(review?.review_id || '')) errors.push('review.review_id is invalid');
  if (typeof review.name !== 'string' || review.name.length < 1 || review.name.length > schema.properties.name.maxLength) errors.push('review.name is invalid');
  if (!validDateTime(review.created_at) || !validDateTime(review.updated_at)) errors.push('review timestamps are invalid');
  if ('author_display_name' in review && !validDisplayName(review.author_display_name)) errors.push('review author display name is invalid');

  const sourceDef = schema.$defs.source;
  schemaAllowsOnly(review.source, sourceDef, 'review.source', errors);
  if (isRecord(review.source)) {
    const branch = review.source.branch_at_creation;
    if (!new RegExp(schema.$defs.repositoryProjectPath.pattern).test(review.source.path || '')) errors.push('review.source.path is invalid');
    if (branch !== null && (typeof branch !== 'string' || branch.length < 1 || branch.length > 255 || !/^(?![A-Za-z]:)(?!\/)(?!.*\\).+$/.test(branch))) errors.push('review.source.branch_at_creation is invalid');
    if (!sourceDef.properties.content_state.enum.includes(review.source.content_state)) errors.push('review.source.content_state is invalid');
    if (review.source.commit !== null && !validGitObjectId(review.source.commit)) errors.push('review.source.commit is invalid');
    if (review.source.blob !== null && !validGitObjectId(review.source.blob)) errors.push('review.source.blob is invalid');
    if (review.source.hash_algorithm !== sourceDef.properties.hash_algorithm.const) errors.push('review.source.hash_algorithm is invalid');
    if (!new RegExp(schema.$defs.contentHash.pattern).test(review.source.content_hash || '')) errors.push('review.source.content_hash is invalid');
    if (review.source.content_state === 'uncommitted' && (review.source.commit !== null || review.source.blob !== null)) errors.push('uncommitted review source cannot contain Git objects');
    if (review.source.content_state === 'committed' && !validGitObjectId(review.source.commit)) errors.push('committed review source requires a commit');
  }

  if (!Array.isArray(review.findings) || review.findings.length < 1 || review.findings.length > schema.properties.findings.maxItems) {
    errors.push('review.findings must contain 1-500 findings');
    return errors;
  }
  const findingIds = new Set();
  for (const finding of review.findings) {
    if (!isRecord(finding)) {
      errors.push('review finding must be an object');
      continue;
    }
    schemaAllowsOnly(finding, schema.$defs.finding, `finding ${finding?.id || '?'}`, errors);
    if (!new RegExp(schema.$defs.finding.properties.id.pattern).test(finding.id || '') || findingIds.has(finding.id)) errors.push(`finding id ${finding.id || '?'} is invalid or duplicated`);
    findingIds.add(finding.id);
    if (!schema.$defs.finding.properties.kind.enum.includes(finding.kind)) errors.push(`finding ${finding.id} kind is invalid`);
    if (!schema.$defs.finding.properties.severity.enum.includes(finding.severity)) errors.push(`finding ${finding.id} severity is invalid`);
    if (!schema.$defs.finding.properties.status.enum.includes(finding.status)) errors.push(`finding ${finding.id} status is invalid`);
    if (
      typeof finding.quote !== 'string'
      || finding.quote.length > 20000
      || finding.quote !== normalizeReviewQuote(finding.quote)
      || (finding.anchor?.state !== 'unanchored' && finding.quote.length === 0)
    ) errors.push(`finding ${finding.id} quote is invalid`);
    schemaAllowsOnly(finding.anchor, schema.$defs.anchor, `finding ${finding.id}.anchor`, errors);
    if (!schema.$defs.anchor.properties.state.enum.includes(finding.anchor?.state)) errors.push(`finding ${finding.id} anchor state is invalid`);
    if (finding.anchor?.state === 'unanchored') {
      for (const field of ['line_start', 'line_end', 'start_offset', 'end_offset']) if (finding.anchor[field] !== null) errors.push(`finding ${finding.id} unanchored range must be null`);
    } else {
      for (const field of ['line_start', 'line_end']) if (!Number.isInteger(finding.anchor?.[field]) || finding.anchor[field] < 1) errors.push(`finding ${finding.id} ${field} is invalid`);
      for (const field of ['start_offset', 'end_offset']) if (!Number.isInteger(finding.anchor?.[field]) || finding.anchor[field] < 0) errors.push(`finding ${finding.id} ${field} is invalid`);
    }
    if (finding.anchor?.block_id !== null && finding.anchor?.block_id !== undefined && (typeof finding.anchor.block_id !== 'string' || finding.anchor.block_id.length > 100)) errors.push(`finding ${finding.id} block_id is invalid`);
    if (!Array.isArray(finding.labels) || finding.labels.length > 20 || new Set(finding.labels).size !== finding.labels.length || finding.labels.some((label) => typeof label !== 'string' || label.length < 1 || label.length > 50)) errors.push(`finding ${finding.id} labels are invalid`);
    if (!Array.isArray(finding.thread) || finding.thread.length < 1 || finding.thread.length > 200) errors.push(`finding ${finding.id} thread is required`);
    const messageIds = new Set();
    for (const message of finding.thread || []) {
      if (!isRecord(message)) {
        errors.push(`finding ${finding.id} message must be an object`);
        continue;
      }
      schemaAllowsOnly(message, schema.$defs.message, `finding ${finding.id} message`, errors);
      if (!new RegExp(schema.$defs.message.properties.id.pattern).test(message.id || '') || messageIds.has(message.id)) errors.push(`finding ${finding.id} message id is invalid or duplicated`);
      messageIds.add(message.id);
      if (typeof message.body !== 'string' || message.body.length < 1 || message.body.length > 20000 || !validDateTime(message.created_at)) errors.push(`finding ${finding.id} message is invalid`);
      if ('author_display_name' in message && !validDisplayName(message.author_display_name)) errors.push(`finding ${finding.id} message author is invalid`);
    }
    if (finding.status === 'open' && finding.resolution !== null) errors.push(`finding ${finding.id} open resolution must be null`);
    if (finding.status !== 'open') {
      schemaAllowsOnly(finding.resolution, schema.$defs.resolution, `finding ${finding.id}.resolution`, errors);
      if (!isRecord(finding.resolution) || typeof finding.resolution.summary !== 'string' || finding.resolution.summary.length < 1 || finding.resolution.summary.length > 20000 || !validDateTime(finding.resolution.resolved_at)) errors.push(`finding ${finding.id} resolution is invalid`);
      if (isRecord(finding.resolution) && 'resolved_by_display_name' in finding.resolution && !validDisplayName(finding.resolution.resolved_by_display_name)) errors.push(`finding ${finding.id} resolver is invalid`);
    }
  }
  if ('migration' in review) {
    const migration = review.migration;
    schemaAllowsOnly(migration, schema.$defs.migration, 'review.migration', errors);
    if (isRecord(migration)) {
      if (!schema.$defs.migration.properties.source_kind.enum.includes(migration.source_kind)) errors.push('review.migration.source_kind is invalid');
      if (!Array.isArray(migration.legacy_ids) || migration.legacy_ids.length < 1 || new Set(migration.legacy_ids).size !== migration.legacy_ids.length || migration.legacy_ids.some((id) => typeof id !== 'string' || id.length < 1 || id.length > 200)) errors.push('review.migration.legacy_ids are invalid');
      if ('warnings' in migration && (!Array.isArray(migration.warnings) || migration.warnings.some((warning) => typeof warning !== 'string' || warning.length < 1 || warning.length > 500))) errors.push('review.migration.warnings are invalid');
    }
  }
  const openCount = review.findings.filter((finding) => finding?.status === 'open').length;
  if (review.status === 'open' && openCount === 0) errors.push('open review requires an open finding');
  if (review.status === 'resolved' && openCount > 0) errors.push('resolved review cannot contain open findings');
  return errors;
}

function reviewBody(review) {
  const findings = [...review.findings].sort((a, b) => a.id.localeCompare(b.id));
  const openCount = review.status === 'archived' ? 0 : findings.filter((finding) => finding.status === 'open').length;
  const sourceCommit = review.source.commit || 'uncommitted';
  const lines = [
    `# Review: ${review.name.replace(/^Review of\s+/i, '')}`,
    '',
    `- Source: \`${review.source.path}\``,
    `- Source content: \`${review.source.content_hash}\` (\`${review.source.hash_algorithm}\`)`,
    `- Source commit: \`${sourceCommit}\``,
    `- Status: \`${review.status}\``,
    `- Findings: ${findings.length} total, ${openCount} open`,
    '',
  ];
  if (review.source.content_state === 'uncommitted') {
    lines.push('> [!WARNING]', '> This review was published from uncommitted source content; `source.commit` is null.', '');
  }
  for (const finding of findings) {
    const quoteBlock = finding.quote
      ? `> ${String(finding.quote).replace(/\n/g, '\n> ')}`
      : '> _(No source quote; global comment.)_';
    lines.push(`## ${finding.id} · ${finding.severity} · ${finding.status}`, '', quoteBlock, '');
    const firstMessage = [...finding.thread].sort((a, b) => a.id.localeCompare(b.id))[0];
    lines.push(firstMessage.body, '', '### Thread', '');
    for (const message of [...finding.thread].sort((a, b) => a.id.localeCompare(b.id))) {
      lines.push(`- \`${message.created_at}\` — **${message.author_display_name || 'Reviewer'}**: ${message.body}`);
    }
    lines.push('', '### Resolution', '');
    if (finding.resolution) {
      const actor = finding.resolution.resolved_by_display_name ? ` by **${finding.resolution.resolved_by_display_name}**` : '';
      lines.push(`Resolved \`${finding.resolution.resolved_at}\`${actor}: ${finding.resolution.summary}`);
    } else {
      lines.push('Unresolved.');
    }
    lines.push('');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

function serializeReview(review) {
  const canonical = {
    ...review,
    findings: [...review.findings]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((finding) => ({ ...finding, thread: [...finding.thread].sort((a, b) => a.id.localeCompare(b.id)) })),
  };
  return `---\n${JSON.stringify(canonical, null, 2)}\n---\n\n${reviewBody(canonical)}`;
}

function privacyViolation(serialized) {
  const checks = [
    /[A-Za-z]:[\\/]/,
    /\\\\[^\\\s]+\\/,
    /file:\/\//i,
    /(?:^|[\s"'`(])\/(?:home|Users|tmp|var\/tmp)\//m,
  ];
  const localRoots = [repoRoot, osHomeDirectory(), require('node:os').tmpdir()].filter(Boolean);
  for (const root of localRoots) {
    const variants = [String(root), String(root).replace(/\\/g, '/'), String(root).replace(/\//g, '\\')];
    if (variants.some((candidate) => candidate && serialized.includes(candidate))) return 'tracked review contains a machine-local path';
  }
  return checks.some((pattern) => pattern.test(serialized)) ? 'tracked review contains an absolute or machine-local path' : null;
}

function osHomeDirectory() {
  try {
    return require('node:os').homedir();
  } catch {
    return null;
  }
}

const CAPABILITY_NAMES = ['dispatch', 'review', 'publishReview', 'applyContract'];

function selectedContextRisk(worktree) {
  const indicators = [];
  if (!worktree.primary) indicators.push('linked_worktree');
  if (worktree.detached) indicators.push('detached_head');
  if (worktree.projectState?.diverged) indicators.push('diverged_project_state');
  if (worktree.projectState?.dirty) indicators.push('dirty_project_state');
  return {
    level: indicators.length ? 'elevated' : 'normal',
    indicators,
  };
}

function resolveFreshSelectedContext(expected = activeContext) {
  if (!repositoryDomain || expected.legacy) {
    const rootReal = realpathSafe(expected.worktree.path);
    const projectReal = realpathSafe(path.join(expected.worktree.path, '.project'));
    if (!rootReal || !projectReal || !isInside(rootReal, projectReal)) {
      throw new HttpRequestError('Selected worktree is unavailable or no longer contains .project.', 409);
    }
    return expected;
  }

  const registry = repositoryDomain.registry.readRegistry();
  const entry = registry.repositories.find((candidate) => candidate.id === expected.repository.id);
  if (!entry) throw new HttpRequestError('Selected repository is no longer registered; refresh the Viewer context.', 409);

  let repository;
  try {
    repository = repositoryDomain.git.resolveRepository(entry.primaryPath);
  } catch (error) {
    throw new HttpRequestError(`Selected repository is unavailable: ${error.message}`, 409);
  }
  if (repository.id !== expected.repository.id) {
    throw new HttpRequestError('Selected repository identity changed; refresh the Viewer context.', 409);
  }

  const worktrees = repositoryDomain.state.classifyRepositoryWorktrees(repository);
  const worktree = worktrees.find((candidate) => candidate.id === expected.worktree.id);
  if (!worktree) throw new HttpRequestError('Selected worktree was removed or is no longer registered by Git.', 409);
  if (!worktree.available || !worktree.projectAvailable || !worktree.projectState?.available) {
    throw new HttpRequestError(`Selected worktree is unavailable: ${worktree.projectState?.reason || worktree.unavailableReason || '.project is missing'}`, 409);
  }

  const expectedRoot = realpathSafe(expected.worktree.path);
  const freshRoot = realpathSafe(worktree.path);
  const freshProject = realpathSafe(path.join(worktree.path, '.project'));
  if (!expectedRoot || !freshRoot || !sameFilesystemPath(expectedRoot, freshRoot)) {
    throw new HttpRequestError('Selected worktree root changed; refresh the Viewer context.', 409);
  }
  if (!sameFilesystemPath(freshRoot, repoRoot)) {
    throw new HttpRequestError('Viewer root no longer matches the selected Git worktree.', 409);
  }
  if (!freshProject || !isInside(freshRoot, freshProject)) {
    throw new HttpRequestError('Selected .project path escapes the Git-reported worktree.', 409);
  }
  if (Boolean(worktree.detached) !== Boolean(expected.worktree.detached) || (worktree.branch || null) !== (expected.worktree.branch || null)) {
    throw new HttpRequestError('Selected worktree branch changed; refresh the Viewer context before continuing.', 409);
  }
  if ((worktree.head || null) !== (expected.worktree.head || null)) {
    throw new HttpRequestError('Selected worktree HEAD changed; refresh the Viewer context before continuing.', 409);
  }
  return { repository: { ...repository, worktrees }, worktree, legacy: false };
}

function capabilityState() {
  let denial = null;
  try {
    resolveFreshSelectedContext();
  } catch (error) {
    denial = {
      code: 'stale_selected_context',
      message: error.message,
    };
  }
  if (contextSwitching) {
    denial = {
      code: 'context_switching',
      message: 'Viewer context is switching; retry the request.',
    };
  }
  return {
    capabilities: Object.fromEntries(CAPABILITY_NAMES.map((name) => [name, denial === null])),
    capabilityDenials: Object.fromEntries(CAPABILITY_NAMES.map((name) => [name, denial])),
  };
}

function visibleContext() {
  const repository = activeContext.repository;
  const worktree = activeContext.worktree;
  const capability = capabilityState();
  return {
    generation: contextGeneration,
    switching: contextSwitching,
    repository: {
      id: repository.id,
      name: repository.displayName,
      primaryPath: repository.primaryPath,
    },
    worktree: {
      id: worktree.id,
      path: worktree.path,
      branch: worktree.branch,
      detached: worktree.detached,
      head: worktree.head,
      role: worktree.role,
      primary: worktree.primary,
      available: worktree.available,
      projectAvailable: worktree.projectAvailable,
      projectState: worktree.projectState,
    },
    projectRoot,
    risk: selectedContextRisk(worktree),
    ...capability,
  };
}

function contextInventory() {
  if (!repositoryDomain || activeContext.legacy) {
    return {
      repositories: [{
        id: activeContext.repository.id,
        name: activeContext.repository.displayName,
        primaryPath: activeContext.repository.primaryPath,
        available: true,
        worktrees: [activeContext.worktree],
      }],
      active: visibleContext(),
    };
  }

  const registry = repositoryDomain.registry.readRegistry();
  const repositories = registry.repositories.map((entry) => {
    try {
      const repository = repositoryDomain.git.resolveRepository(entry.primaryPath);
      const worktrees = repositoryDomain.state.classifyRepositoryWorktrees(repository);
      return {
        id: repository.id,
        name: repository.displayName,
        primaryPath: repository.primaryPath,
        lastSeen: entry.lastSeen,
        available: true,
        error: null,
        worktrees,
      };
    } catch (error) {
      return {
        id: entry.id,
        name: entry.displayName,
        primaryPath: entry.primaryPath,
        lastSeen: entry.lastSeen,
        available: false,
        error: error.message,
        worktrees: [],
      };
    }
  });
  return { repositories, active: visibleContext() };
}

function resetRootScopedState() {
  stopLiveUpdates();
  activityEvents.length = 0;
  markdownSnapshot = new Map();
  watcherErrorLogged = false;
  liveUpdatesStarted = false;
  liveUpdatesStopping = false;
  contextGeneration += 1;
}

function resolveSwitchSelection(repositoryId, worktreeId) {
  if (!repositoryDomain || activeContext.legacy) {
    throw new HttpRequestError('Repository switching is unavailable because Git repository services could not be loaded.', 503);
  }
  const registry = repositoryDomain.registry.readRegistry();
  const entry = registry.repositories.find((candidate) => candidate.id === repositoryId);
  if (!entry) throw new HttpRequestError('Repository selection is stale or unregistered.', 409);
  let repository;
  try {
    repository = repositoryDomain.git.resolveRepository(entry.primaryPath);
  } catch (error) {
    throw new HttpRequestError(`Repository is unavailable: ${error.message}`, 409);
  }
  if (repository.id !== repositoryId) throw new HttpRequestError('Repository identity changed; refresh the inventory.', 409);
  const worktrees = repositoryDomain.state.classifyRepositoryWorktrees(repository);
  const worktree = worktrees.find((candidate) => candidate.id === worktreeId);
  if (!worktree) throw new HttpRequestError('Worktree selection is stale or does not belong to this repository.', 409);
  if (!worktree.available || !worktree.projectAvailable || !worktree.projectState.available) {
    throw new HttpRequestError(`Worktree project state is unavailable: ${worktree.projectState.reason || worktree.unavailableReason || '.project is missing'}`, 409);
  }
  const worktreeReal = realpathSafe(worktree.path);
  const projectReal = realpathSafe(path.join(worktree.path, '.project'));
  if (!worktreeReal || !projectReal || !isInside(worktreeReal, projectReal)) {
    throw new HttpRequestError('Selected .project path escapes the Git-reported worktree.', 400);
  }
  return { repository: { ...repository, worktrees }, worktree, legacy: false };
}

async function handleContext(req, res) {
  if (req.method === 'GET') return sendJson(res, contextInventory());
  if (req.method !== 'POST') {
    res.writeHead(405); res.end('Use GET or POST'); return;
  }
  if (contextSwitching) throw new HttpRequestError('Viewer context is switching; retry the request.', 503);
  contextSwitching = true;
  try {
    const payload = await readJsonBody(req);
    const repositoryId = sanitizeString(payload.repositoryId, 128, 'repositoryId', true);
    const worktreeId = sanitizeString(payload.worktreeId, 128, 'worktreeId', true);
    const next = resolveSwitchSelection(repositoryId, worktreeId);
    resetRootScopedState();
    setActiveRoot(next);
    startLiveUpdates();
    contextSwitching = false;
    return sendJson(res, { ok: true, context: visibleContext(), index: loadIndex() });
  } finally {
    contextSwitching = false;
  }
}

function ensureRequestContext(req) {
  if (contextSwitching) throw new HttpRequestError('Viewer context is switching; retry the request.', 503);
  if (req.delanoGeneration !== undefined && req.delanoGeneration !== contextGeneration) {
    throw new HttpRequestError('Viewer context changed while the request was running; retry the request.', 409);
  }
}

function ensureCapability(req, capability) {
  ensureRequestContext(req);
  if (!CAPABILITY_NAMES.includes(capability)) {
    throw new HttpRequestError(`Unknown Viewer capability: ${capability}`, 500);
  }
  const fresh = resolveFreshSelectedContext(req.delanoContext || activeContext);
  if (req.delanoContext && req.delanoContext.generation !== contextGeneration) {
    throw new HttpRequestError('Viewer context changed while the request was running; retry the request.', 409);
  }
  return fresh;
}

function ensureFreshSource(req, capability, source, expectedHash = null) {
  ensureCapability(req, capability);
  const freshSource = resolveProjectMarkdownPath(source.rel);
  if (!freshSource || !sameFilesystemPath(freshSource.file, source.file)) {
    throw new HttpRequestError('Selected source is unavailable or no longer contained in this worktree.', 409);
  }
  const current = fileBaseline(freshSource.file);
  const baselineHash = expectedHash || source.baselineHash;
  if (baselineHash && current.hash !== baselineHash) {
    throw new HttpRequestError('Selected source changed; refresh it before dispatching the handover.', 409);
  }
  return current;
}

function loadIndex() {
  const docs = walkMarkdown(projectRoot).map((file) => docMeta(file));
  const contextPack = loadContextPack();
  const annotationSummaryResult = annotationSummary();
  const projectSlugs = fs.existsSync(path.join(projectRoot, 'projects'))
    ? fs.readdirSync(path.join(projectRoot, 'projects'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
    : [];
  const fixed = [
    {
      slug: 'context',
      title: 'Project',
      status: null,
      created: null,
      pinned: true,
      docs: docs.filter((doc) => doc.path.startsWith('context/')).map((doc) => doc.path),
      contextPack,
    },
    {
      slug: 'templates',
      title: 'Templates',
      status: null,
      created: null,
      pinned: true,
      docs: docs.filter((doc) => doc.path.startsWith('templates/')).map((doc) => doc.path),
    },
  ];
  const projectEntries = projectSlugs.map((slug) => {
    const projectDocs = docs.filter((doc) => doc.path.startsWith(`projects/${slug}/`));
    const spec = projectDocs.find((doc) => doc.path.endsWith('/spec.md'));
    const plan = projectDocs.find((doc) => doc.path.endsWith('/plan.md'));
    const outline = projectOutline(projectDocs);
    return {
      slug,
      title: spec?.frontmatter.name || plan?.frontmatter.name || slug.replace(/-/g, ' '),
      status: spec?.frontmatter.status || plan?.frontmatter.status || null,
      created: spec?.frontmatter.created || plan?.frontmatter.created || null,
      pinned: false,
      docs: projectDocs.map((doc) => doc.path),
      outline,
    };
  });
  // Sort non-pinned project entries by `created` desc; entries without `created` keep their relative order at the end.
  projectEntries.sort((a, b) => {
    if (!a.created && !b.created) return 0;
    if (!a.created) return 1;
    if (!b.created) return -1;
    return String(b.created).localeCompare(String(a.created));
  });
  const projects = [...fixed, ...projectEntries];
  const schema = loadSchemaOptions();
  return {
    repo: path.basename(repoRoot),
    generatedAt: new Date().toISOString(),
    context: visibleContext(),
    schemaOptions: schema.options,
    schemaOptionsError: schema.error,
    reviewOptions: reviewSchemaOptions(),
    reviewSummary: reviewSummary(),
    contextPack,
    annotationSummary: annotationSummaryResult,
    projects,
    docs,
  };
}

function sendJson(res, data) {
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data, null, 2));
}

function sendJsonStatus(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data, null, 2));
}

function handleSse(req, res) {
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });
  res.write('retry: 3000\n\n');

  const client = { response: res, heartbeat: null };
  client.heartbeat = setInterval(() => {
    if (res.destroyed || res.writableEnded) {
      removeSseClient(client);
      return;
    }
    res.write(': ping\n\n');
  }, SSE_HEARTBEAT_MS);
  client.heartbeat.unref();
  sseClients.add(client);

  const cleanup = () => removeSseClient(client);
  req.on('close', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
}

function sendError(res, status, message, details = {}) {
  return sendJsonStatus(res, status, { ok: false, error: message, ...details });
}

function projectFileFromRequest(rel) {
  const resolved = resolveProjectMarkdownPath(rel);
  return resolved ? resolved.file : null;
}

function normalizeProjectMarkdownPath(input) {
  let raw = String(input || '').trim().replace(/\\/g, '/');
  if (raw.startsWith('.project/')) raw = raw.slice('.project/'.length);
  if (!raw || raw.includes('\0') || raw.startsWith('/') || path.isAbsolute(raw)) return null;
  const normalized = path.posix.normalize(raw);
  if (
    normalized === '.' ||
    normalized.startsWith('../') ||
    normalized === '..' ||
    !normalized.endsWith('.md')
  ) {
    return null;
  }
  return normalized;
}

function knownMarkdownPaths() {
  return new Set(walkMarkdown(projectRoot).map((file) => path.relative(projectRoot, file).replace(/\\/g, '/')));
}

function resolveProjectMarkdownPath(input) {
  const rel = normalizeProjectMarkdownPath(input);
  if (!rel) return null;
  if (!knownMarkdownPaths().has(rel)) return null;
  const file = path.resolve(projectRoot, rel);
  const projectReal = realpathSafe(projectRoot);
  const fileReal = realpathSafe(file);
  if (!projectReal || !fileReal || !isInside(projectReal, fileReal) || !fs.existsSync(fileReal)) return null;
  if (!fs.statSync(fileReal).isFile()) return null;
  return { rel, repoPath: `.project/${rel}`, file: fileReal };
}

function ensureAnnotationStoreDir() {
  fs.mkdirSync(annotationStoreDir, { recursive: true });
}

function emptyAnnotationStore() {
  return { version: 1, annotations: [], applyAudit: [] };
}

function readAnnotationStore() {
  if (!fs.existsSync(annotationStorePath)) return emptyAnnotationStore();
  try {
    const parsed = JSON.parse(readText(annotationStorePath));
    return {
      version: 1,
      annotations: Array.isArray(parsed.annotations) ? parsed.annotations : [],
      applyAudit: Array.isArray(parsed.applyAudit) ? parsed.applyAudit : [],
    };
  } catch (error) {
    throw new HttpRequestError(
      `.project/viewer/annotations.json is malformed or unreadable. Repair or restore it before using viewer annotations.`,
      500
    );
  }
}

function writeAnnotationStore(store) {
  ensureAnnotationStoreDir();
  fs.writeFileSync(annotationStorePath, `${JSON.stringify({
    version: 1,
    annotations: store.annotations || [],
    applyAudit: store.applyAudit || [],
  }, null, 2)}\n`, 'utf8');
}

function sanitizeString(value, maxLength, field, required = false) {
  const text = String(value ?? '').replace(/\0/g, '').trim();
  if (required && !text) throw new Error(`${field} is required.`);
  if (text.length > maxLength) throw new Error(`${field} is too long.`);
  return text;
}

function sanitizeRawString(value, maxLength, field, required = false) {
  const text = String(value ?? '').replace(/\0/g, '');
  if (required && !text.trim()) throw new Error(`${field} is required.`);
  if (text.length > maxLength) throw new Error(`${field} is too long.`);
  return text;
}

function sanitizeLabels(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((label) => sanitizeString(label, 64, 'label', false))
    .filter(Boolean)
    .slice(0, MAX_LABELS);
}

function sanitizeAuthor(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    name: sanitizeString(source.name || 'viewer', 80, 'author.name', false) || 'viewer',
  };
}

function sanitizeHighlightMeta(value, field) {
  if (!value || typeof value !== 'object') return null;
  const parentIndex = Number(value.parentIndex);
  const textOffset = Number(value.textOffset);
  if (!Number.isInteger(parentIndex) || parentIndex < -2 || parentIndex > 100000) return null;
  if (!Number.isInteger(textOffset) || textOffset < 0 || textOffset > MAX_ANNOTATION_QUOTE) return null;
  const parentTagName = sanitizeString(value.parentTagName, 64, `${field}.parentTagName`, true).toUpperCase();
  return {
    parentTagName,
    parentIndex,
    textOffset,
  };
}

function sanitizeHighlightSource(value) {
  if (!value || typeof value !== 'object') return null;
  const startMeta = sanitizeHighlightMeta(value.startMeta, 'anchor.highlightSource.startMeta');
  const endMeta = sanitizeHighlightMeta(value.endMeta, 'anchor.highlightSource.endMeta');
  const text = sanitizeRawString(value.text, MAX_ANNOTATION_QUOTE, 'anchor.highlightSource.text', true);
  const id = sanitizeString(value.id, 120, 'anchor.highlightSource.id', true);
  if (!startMeta || !endMeta || !text || !id) return null;
  return { startMeta, endMeta, text, id };
}

function sanitizeAnchor(value) {
  const source = value && typeof value === 'object' ? value : {};
  const anchor = {};
  if (source.blockId) anchor.blockId = sanitizeString(source.blockId, 120, 'anchor.blockId', false);
  if (source.kind) anchor.kind = sanitizeString(source.kind, 40, 'anchor.kind', false);
  const lineStart = Number(source.lineStart);
  const lineEnd = Number(source.lineEnd);
  if (Number.isInteger(lineStart) && lineStart > 0) anchor.lineStart = lineStart;
  if (Number.isInteger(lineEnd) && lineEnd >= (anchor.lineStart || 1)) anchor.lineEnd = lineEnd;
  const highlightSource = sanitizeHighlightSource(source.highlightSource);
  if (highlightSource) anchor.highlightSource = highlightSource;
  return anchor;
}

function normalizeAnnotationInput(payload, existing = null) {
  if (!payload || typeof payload !== 'object') throw new Error('Annotation payload must be an object.');
  const source = resolveProjectMarkdownPath(payload.sourcePath || existing?.sourcePath);
  if (!source) throw new Error('sourcePath must point at a known .project markdown document.');
  const type = sanitizeString(payload.type || existing?.type || 'comment', 40, 'type', false) || 'comment';
  const comment = sanitizeString(payload.comment ?? existing?.comment, MAX_ANNOTATION_COMMENT, 'comment', true);
  const quote = sanitizeString(payload.quote ?? existing?.quote, MAX_ANNOTATION_QUOTE, 'quote', type !== 'global-comment');
  const now = new Date().toISOString();
  return {
    id: existing?.id || crypto.randomUUID(),
    sourcePath: source.rel,
    repoPath: source.repoPath,
    type,
    quote,
    comment,
    labels: sanitizeLabels(payload.labels ?? existing?.labels),
    anchor: sanitizeAnchor(payload.anchor ?? existing?.anchor),
    author: sanitizeAuthor(payload.author ?? existing?.author),
    status: sanitizeString(payload.status || existing?.status || 'open', 32, 'status', false) || 'open',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    baseline: fileBaseline(source.file),
  };
}

function visibleAnnotation(annotation) {
  return {
    id: annotation.id,
    sourcePath: annotation.sourcePath,
    repoPath: annotation.repoPath || `.project/${annotation.sourcePath}`,
    type: annotation.type || 'comment',
    quote: annotation.quote || '',
    comment: annotation.comment || '',
    labels: Array.isArray(annotation.labels) ? annotation.labels : [],
    anchor: annotation.anchor || {},
    author: annotation.author || { name: 'viewer' },
    status: annotation.status || 'open',
    createdAt: annotation.createdAt,
    updatedAt: annotation.updatedAt,
    baseline: annotation.baseline || null,
  };
}

function sortedVisibleAnnotations(annotations) {
  return annotations.map(visibleAnnotation).sort((a, b) => (
    String(a.sourcePath).localeCompare(String(b.sourcePath)) ||
    Number(a.anchor?.lineStart || 0) - Number(b.anchor?.lineStart || 0) ||
    String(a.createdAt || '').localeCompare(String(b.createdAt || ''))
  ));
}

function annotationSummary() {
  try {
    const annotations = sortedVisibleAnnotations(readAnnotationStore().annotations)
      .filter((annotation) => annotation.status !== 'deleted');
    const bySource = new Map();
    let updatedAt = null;

    for (const annotation of annotations) {
      const sourcePath = annotation.sourcePath;
      const current = bySource.get(sourcePath) || {
        sourcePath,
        repoPath: annotation.repoPath || `.project/${sourcePath}`,
        count: 0,
        updatedAt: null,
      };
      current.count += 1;
      if (annotation.updatedAt && (!current.updatedAt || annotation.updatedAt > current.updatedAt)) {
        current.updatedAt = annotation.updatedAt;
      }
      if (annotation.updatedAt && (!updatedAt || annotation.updatedAt > updatedAt)) {
        updatedAt = annotation.updatedAt;
      }
      bySource.set(sourcePath, current);
    }

    return {
      storePath: '.project/viewer/annotations.json',
      total: annotations.length,
      open: annotations.filter((annotation) => !['closed', 'done', 'resolved'].includes(String(annotation.status || '').toLowerCase())).length,
      updatedAt,
      bySource: [...bySource.values()].sort((a, b) => (
        String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')) ||
        String(a.sourcePath).localeCompare(String(b.sourcePath))
      )),
      warnings: [],
    };
  } catch (error) {
    return {
      storePath: '.project/viewer/annotations.json',
      total: 0,
      open: 0,
      updatedAt: null,
      bySource: [],
      warnings: [error.message],
    };
  }
}

function reviewDirectory() {
  return path.join(projectRoot, 'reviews');
}

function canonicalReviewDirectory() {
  const projectReal = realpathSafe(projectRoot);
  const reviewReal = realpathSafe(reviewDirectory());
  if (!projectReal || !reviewReal || !isInside(projectReal, reviewReal)) {
    throw new HttpRequestError('Review directory is not contained in the selected .project directory.', 400);
  }
  return reviewReal;
}

function reviewFiles() {
  const directory = reviewDirectory();
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^review-[A-Za-z0-9-]+\.md$/.test(entry.name))
    .map((entry) => path.join(directory, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function readReviewFile(file) {
  const reviewRoot = realpathSafe(reviewDirectory());
  const fileReal = realpathSafe(file);
  if (!reviewRoot || !fileReal || !isInside(reviewRoot, fileReal)) throw new HttpRequestError('Review artifact is not contained in .project/reviews.', 400);
  const markdown = readText(fileReal);
  const parsed = splitFrontmatter(markdown);
  const errors = reviewValidationErrors(parsed.frontmatter);
  if (errors.length) throw new HttpRequestError(`Review artifact is invalid: ${errors.join('; ')}`, 422);
  if (serializeReview(parsed.frontmatter) !== markdown) throw new HttpRequestError('Review Markdown projection does not match canonical frontmatter.', 422);
  return { file: fileReal, markdown, review: parsed.frontmatter };
}

function reviewFileForId(reviewId, mustExist = true) {
  const schema = loadReviewSchema();
  const id = sanitizeString(reviewId, 80, 'reviewId', true);
  if (!new RegExp(schema.properties.review_id.pattern).test(id)) throw new HttpRequestError('reviewId is invalid.', 400);
  const root = canonicalReviewDirectory();
  const file = path.join(root, `${id}.md`);
  if (!isInside(root, path.resolve(file))) throw new HttpRequestError('Review path escapes .project/reviews.', 400);
  if (mustExist && (!fs.existsSync(file) || !fs.statSync(file).isFile())) throw new HttpRequestError('Review artifact not found.', 404);
  return file;
}

function runtimeReviewState(review) {
  const source = resolveProjectMarkdownPath(review.source.path);
  if (!source) return { freshness: 'unavailable', currentContentHash: null, findings: review.findings.map((finding) => ({ id: finding.id, anchorState: 'unanchored' })) };
  const content = normalizeSourceText(source.file);
  const currentContentHash = sha256(content);
  const freshness = currentContentHash === review.source.content_hash ? 'exact' : 'stale';
  const findings = review.findings.map((finding) => {
    if (freshness === 'exact') return { id: finding.id, anchorState: finding.anchor.state };
    if (!finding.quote) return { id: finding.id, anchorState: 'unanchored' };
    let count = 0;
    let offset = 0;
    while ((offset = content.indexOf(finding.quote, offset)) >= 0) {
      count += 1;
      offset += Math.max(1, finding.quote.length);
      if (count > 1) break;
    }
    return { id: finding.id, anchorState: count === 1 ? 'reanchored' : 'unanchored' };
  });
  return { freshness, currentContentHash, findings };
}

function reviewSummary() {
  const reviews = [];
  const warnings = [];
  for (const file of reviewFiles()) {
    try {
      const { review } = readReviewFile(file);
      const runtime = runtimeReviewState(review);
      const openFindings = review.status === 'archived' ? 0 : review.findings.filter((finding) => finding.status === 'open').length;
      reviews.push({
        reviewId: review.review_id,
        path: `.project/reviews/${path.basename(file)}`,
        name: review.name,
        status: review.status,
        sourcePath: review.source.path,
        openFindings,
        freshness: runtime.freshness,
        updatedAt: review.updated_at,
      });
    } catch (error) {
      warnings.push(`${path.basename(file)}: ${error.message}`);
    }
  }
  reviews.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)) || a.reviewId.localeCompare(b.reviewId));
  return {
    root: '.project/reviews',
    total: reviews.length,
    open: reviews.filter((review) => review.status !== 'archived' && review.openFindings > 0).length,
    openFindings: reviews.reduce((sum, review) => sum + review.openFindings, 0),
    reviews,
    warnings,
  };
}

function normalizeDisplayName(value, field) {
  if (value == null || String(value).trim() === '') return undefined;
  const name = sanitizeString(value, 100, field, true);
  if (name.includes('@')) throw new HttpRequestError(`${field} must be a display name, not an email or account id.`, 400);
  return name;
}

function normalizeLegacyDisplayName(value, field) {
  try {
    return normalizeDisplayName(value, field);
  } catch {
    return undefined;
  }
}

function normalizePublishedFindings(input, now, schema, defaultAuthor) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 500) throw new HttpRequestError('findings must contain 1-500 entries.', 400);
  return input.map((raw, index) => {
    if (!raw || typeof raw !== 'object') throw new HttpRequestError(`finding ${index + 1} must be an object.`, 400);
    const status = raw.status == null ? 'open' : String(raw.status);
    const kind = raw.kind == null ? 'comment' : String(raw.kind);
    const severity = raw.severity == null ? 'note' : String(raw.severity);
    if (!schema.$defs.finding.properties.status.enum.includes(status)) throw new HttpRequestError(`finding ${index + 1} status is invalid.`, 400);
    if (!schema.$defs.finding.properties.kind.enum.includes(kind)) throw new HttpRequestError(`finding ${index + 1} kind is invalid.`, 400);
    if (!schema.$defs.finding.properties.severity.enum.includes(severity)) throw new HttpRequestError(`finding ${index + 1} severity is invalid.`, 400);
    const anchorInput = raw.anchor && typeof raw.anchor === 'object' ? raw.anchor : {};
    const state = anchorInput.state == null ? 'unanchored' : String(anchorInput.state);
    if (!schema.$defs.anchor.properties.state.enum.includes(state)) throw new HttpRequestError(`finding ${index + 1} anchor state is invalid.`, 400);
    const anchored = state !== 'unanchored';
    const quote = normalizeReviewQuote(sanitizeString(raw.quote, 20000, `finding ${index + 1} quote`, anchored));
    const integer = (value, minimum, field) => {
      if (!Number.isInteger(value) || value < minimum) throw new HttpRequestError(`finding ${index + 1} ${field} is invalid.`, 400);
      return value;
    };
    const threadInput = Array.isArray(raw.thread) && raw.thread.length
      ? raw.thread
      : [{ body: raw.comment, author_display_name: raw.author_display_name || defaultAuthor }];
    if (threadInput.length > schema.$defs.finding.properties.thread.maxItems) {
      throw new HttpRequestError(`finding ${index + 1} thread must contain at most ${schema.$defs.finding.properties.thread.maxItems} messages.`, 400);
    }
    const thread = threadInput.map((message, messageIndex) => {
      if (!message || typeof message !== 'object') {
        throw new HttpRequestError(`finding ${index + 1} message ${messageIndex + 1} must be an object.`, 400);
      }
      return {
        id: `M-${String(messageIndex + 1).padStart(3, '0')}`,
        created_at: message.created_at && Number.isFinite(Date.parse(message.created_at)) ? new Date(message.created_at).toISOString() : now,
        ...(normalizeDisplayName(message.author_display_name || defaultAuthor, `finding ${index + 1} message author`) ? { author_display_name: normalizeDisplayName(message.author_display_name || defaultAuthor, `finding ${index + 1} message author`) } : {}),
        body: sanitizeString(message.body, 20000, `finding ${index + 1} message body`, true),
      };
    });
    let resolution = null;
    if (status !== 'open') {
      const resolutionInput = raw.resolution && typeof raw.resolution === 'object' ? raw.resolution : {};
      resolution = {
        resolved_at: resolutionInput.resolved_at && Number.isFinite(Date.parse(resolutionInput.resolved_at)) ? new Date(resolutionInput.resolved_at).toISOString() : now,
        ...(normalizeDisplayName(resolutionInput.resolved_by_display_name, `finding ${index + 1} resolver`) ? { resolved_by_display_name: normalizeDisplayName(resolutionInput.resolved_by_display_name, `finding ${index + 1} resolver`) } : {}),
        summary: sanitizeString(resolutionInput.summary, 20000, `finding ${index + 1} resolution summary`, true),
      };
    }
    return {
      id: `F-${String(index + 1).padStart(3, '0')}`,
      kind,
      severity,
      status,
      quote,
      anchor: {
        state,
        line_start: anchored ? integer(anchorInput.line_start, 1, 'line_start') : null,
        line_end: anchored ? integer(anchorInput.line_end, 1, 'line_end') : null,
        start_offset: anchored ? integer(anchorInput.start_offset, 0, 'start_offset') : null,
        end_offset: anchored ? integer(anchorInput.end_offset, 0, 'end_offset') : null,
        block_id: anchorInput.block_id == null ? null : sanitizeString(anchorInput.block_id, 100, `finding ${index + 1} block_id`, false),
      },
      labels: sanitizeLabels(raw.labels).slice(0, 20),
      thread,
      resolution,
    };
  });
}

function makeReviewId(sessionSlug = null) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const rawSlug = sessionSlug == null ? crypto.randomBytes(6).toString('hex') : String(sessionSlug).toLowerCase();
  const slug = rawSlug.replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 63);
  if (!slug) throw new HttpRequestError('sessionSlug must contain a letter or number.', 400);
  return `review-${stamp}-${slug}`;
}

function ensureNormalizedReviewSource(req, source, expectedHash) {
  ensureCapability(req, 'publishReview');
  const fresh = resolveProjectMarkdownPath(source.rel);
  if (!fresh || !sameFilesystemPath(fresh.file, source.file)) throw new HttpRequestError('Review source is unavailable or escaped the selected worktree.', 409);
  const currentHash = normalizedContentHash(fresh.file);
  if (currentHash !== expectedHash) throw new HttpRequestError('Review source content changed; refresh the draft before publishing.', 409);
  return currentHash;
}

function reviewTimestampId(dateValue) {
  const parsed = new Date(dateValue);
  const date = Number.isFinite(parsed.getTime()) ? parsed : new Date(0);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function legacyFindingAnchor(annotation, sourceText) {
  const quote = normalizeReviewQuote(annotation.quote).trim();
  const first = quote ? sourceText.indexOf(quote) : -1;
  const unique = first >= 0 && sourceText.indexOf(quote, first + 1) < 0;
  if (!unique) {
    return {
      state: 'unanchored',
      line_start: null,
      line_end: null,
      start_offset: null,
      end_offset: null,
      block_id: annotation.anchor?.blockId || null,
    };
  }
  const lineStart = sourceText.slice(0, first).split('\n').length;
  return {
    state: 'exact',
    line_start: lineStart,
    line_end: lineStart + quote.split('\n').length - 1,
    start_offset: first,
    end_offset: first + quote.length,
    block_id: annotation.anchor?.blockId || null,
  };
}

function stableLegacyReview(source, annotations) {
  const schema = loadReviewSchema();
  const ordered = [...annotations].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const legacyIds = ordered.map((annotation) => String(annotation.id));
  const fingerprint = sha256(`${source.repoPath}\n${legacyIds.join('\n')}`).slice(0, 16);
  const created = ordered.map((annotation) => annotation.createdAt).filter((value) => Number.isFinite(Date.parse(value))).sort()[0] || new Date(0).toISOString();
  const updated = ordered.map((annotation) => annotation.updatedAt || annotation.createdAt).filter((value) => Number.isFinite(Date.parse(value))).sort().at(-1) || created;
  const reviewId = `review-${reviewTimestampId(created)}-legacy-${fingerprint}`;
  const sourceText = normalizeSourceText(source.file);
  const provenance = gitSourceProvenance(source);
  const findings = ordered.map((annotation, index) => {
    const resolved = ['closed', 'done', 'resolved'].includes(String(annotation.status || '').toLowerCase());
    const author = normalizeLegacyDisplayName(annotation.author?.name, `legacy annotation ${annotation.id} author`);
    return {
      id: `F-${String(index + 1).padStart(3, '0')}`,
      kind: schema.$defs.finding.properties.kind.enum.includes(annotation.type) ? annotation.type : 'comment',
      severity: 'note',
      status: resolved ? 'resolved' : 'open',
      quote: normalizeReviewQuote(sanitizeString(annotation.quote, 20000, `legacy annotation ${annotation.id} quote`, annotation.type !== 'global-comment')),
      anchor: legacyFindingAnchor(annotation, sourceText),
      labels: sanitizeLabels(annotation.labels).slice(0, 20),
      thread: [{
        id: 'M-001',
        created_at: Number.isFinite(Date.parse(annotation.createdAt)) ? new Date(annotation.createdAt).toISOString() : new Date(0).toISOString(),
        ...(author ? { author_display_name: author } : {}),
        body: sanitizeString(annotation.comment, 20000, `legacy annotation ${annotation.id} comment`, true),
      }],
      resolution: resolved ? {
        resolved_at: Number.isFinite(Date.parse(annotation.updatedAt || annotation.createdAt)) ? new Date(annotation.updatedAt || annotation.createdAt).toISOString() : new Date(0).toISOString(),
        summary: 'Resolved in the legacy annotation store before migration.',
      } : null,
    };
  });
  return {
    schema_version: 1,
    review_id: reviewId,
    name: `Migrated review of ${source.repoPath}`,
    status: findings.some((finding) => finding.status === 'open') ? 'open' : 'resolved',
    created_at: new Date(created).toISOString(),
    updated_at: new Date(updated).toISOString(),
    source: {
      path: source.repoPath,
      branch_at_creation: activeContext.worktree.detached ? null : (activeContext.worktree.branch || null),
      content_state: provenance.contentState,
      commit: provenance.commit,
      blob: provenance.blob,
      hash_algorithm: schema.$defs.source.properties.hash_algorithm.const,
      content_hash: sha256(sourceText),
    },
    findings,
    migration: {
      source_kind: 'legacy-annotations',
      legacy_ids: legacyIds,
      warnings: findings.some((finding) => finding.anchor.state === 'unanchored')
        ? ['One or more legacy anchors could not be verified exactly.']
        : [],
    },
  };
}

function writeApplyAuditReceipts(entries, report) {
  if (!entries.length) return;
  const common = spawnSync('git', ['rev-parse', '--git-common-dir'], { cwd: repoRoot, encoding: 'utf8' });
  if (common.status !== 0) {
    report.ambiguous.push({ kind: 'apply-audit', reason: 'Git common directory is unavailable.' });
    return;
  }
  const commonPath = path.resolve(repoRoot, String(common.stdout || '').trim());
  const receiptRoot = path.join(commonPath, 'delano', 'review-migration');
  fs.mkdirSync(receiptRoot, { recursive: true });
  for (const entry of entries) {
    const id = entry && entry.id ? String(entry.id) : null;
    const target = normalizeProjectMarkdownPath(entry?.sourcePath || entry?.target || '');
    if (!id || !target) {
      report.ambiguous.push({ kind: 'apply-audit', id, reason: 'Missing id or safe repository-relative target.' });
      continue;
    }
    const base = {
      id,
      timestamp: Number.isFinite(Date.parse(entry.appliedAt || entry.timestamp)) ? new Date(entry.appliedAt || entry.timestamp).toISOString() : null,
      target: `.project/${target}`,
      outcome: String(entry.outcome || 'applied'),
    };
    const receiptChecksum = sha256(JSON.stringify(base));
    const receipt = { ...base, receipt_checksum: receiptChecksum };
    const receiptFile = path.join(receiptRoot, `apply-audit-${sha256(id).slice(0, 20)}.json`);
    if (!fs.existsSync(receiptFile)) fs.writeFileSync(receiptFile, `${JSON.stringify(receipt, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    report.applyAudit.push({ id, outcome: base.outcome, receipt_checksum: receiptChecksum });
  }
}

async function handleReviewMigration(req, res) {
  if (req.method !== 'POST') return sendError(res, 405, 'Use POST');
  ensureCapability(req, 'publishReview');
  const payload = await readJsonBody(req);
  ensureCapability(req, 'publishReview');
  if (payload.confirm !== true) return sendError(res, 400, 'confirm:true is required for explicit legacy migration.');
  const report = { migrated: [], existing: [], ambiguous: [], applyAudit: [], handovers: [] };
  if (!fs.existsSync(annotationStorePath)) return sendJson(res, { ok: true, ...report });
  let store;
  try {
    store = JSON.parse(readText(annotationStorePath));
  } catch (error) {
    report.ambiguous.push({ kind: 'store', reason: `Legacy annotation store is malformed: ${error.message}` });
    return sendJson(res, { ok: true, ...report });
  }
  const annotations = Array.isArray(store.annotations) ? store.annotations : [];
  const duplicateIds = new Set();
  const byId = new Map();
  for (const annotation of annotations) {
    const id = annotation?.id ? String(annotation.id) : null;
    if (!id) continue;
    if (byId.has(id) && JSON.stringify(byId.get(id)) !== JSON.stringify(annotation)) duplicateIds.add(id);
    else byId.set(id, annotation);
  }
  const groups = new Map();
  const acceptedIds = new Set();
  for (const annotation of annotations) {
    const id = annotation?.id ? String(annotation.id) : null;
    if (!id || duplicateIds.has(id)) {
      report.ambiguous.push({ kind: 'annotation', id, reason: id ? 'Duplicate id has conflicting content.' : 'Annotation id is missing.' });
      continue;
    }
    if (acceptedIds.has(id)) continue;
    acceptedIds.add(id);
    const source = resolveProjectMarkdownPath(annotation.sourcePath);
    if (!source || artifactRoleFor(source.rel) === 'review') {
      report.ambiguous.push({ kind: 'annotation', id, reason: 'Source path is missing, unsafe, or unavailable.' });
      continue;
    }
    const group = groups.get(source.rel) || { source, annotations: [] };
    group.annotations.push(annotation);
    groups.set(source.rel, group);
  }
  fs.mkdirSync(reviewDirectory(), { recursive: true });
  for (const group of groups.values()) {
    try {
      const review = stableLegacyReview(group.source, group.annotations);
      const errors = reviewValidationErrors(review);
      if (errors.length) throw new Error(errors.join('; '));
      const serialized = serializeReview(review);
      const privacy = privacyViolation(serialized);
      if (privacy) throw new Error(privacy);
      const target = reviewFileForId(review.review_id, false);
      if (fs.existsSync(target)) {
        const existing = readReviewFile(target).review;
        if (JSON.stringify(existing.migration?.legacy_ids || []) !== JSON.stringify(review.migration.legacy_ids)) {
          throw new Error('Stable migration target exists with different legacy ids.');
        }
        report.existing.push({ reviewId: review.review_id, path: `.project/reviews/${path.basename(target)}` });
        continue;
      }
      ensureNormalizedReviewSource(req, group.source, review.source.content_hash);
      fs.writeFileSync(target, serialized, { encoding: 'utf8', flag: 'wx' });
      report.migrated.push({ reviewId: review.review_id, path: `.project/reviews/${path.basename(target)}`, legacyIds: review.migration.legacy_ids });
    } catch (error) {
      report.ambiguous.push({ kind: 'annotation-group', sourcePath: `.project/${group.source.rel}`, reason: error.message });
    }
  }
  writeApplyAuditReceipts(Array.isArray(store.applyAudit) ? store.applyAudit : [], report);
  if (fs.existsSync(handoverDir)) {
    for (const entry of fs.readdirSync(handoverDir, { withFileTypes: true }).filter((item) => item.isFile() && item.name.endsWith('.md'))) {
      report.handovers.push({ name: path.basename(entry.name), status: 'retained-legacy-evidence' });
    }
  }
  return sendJson(res, { ok: true, ...report });
}

async function handleReviews(req, res, parsed) {
  if (req.method === 'GET') {
    const reviewId = parsed.query.id || null;
    if (!reviewId) return sendJson(res, { ok: true, ...reviewSummary() });
    const artifact = readReviewFile(reviewFileForId(reviewId));
    return sendJson(res, {
      ok: true,
      path: `.project/reviews/${path.basename(artifact.file)}`,
      review: artifact.review,
      markdown: artifact.markdown,
      runtime: runtimeReviewState(artifact.review),
    });
  }
  if (req.method === 'POST') {
    ensureCapability(req, 'publishReview');
    const payload = await readJsonBody(req);
    ensureCapability(req, 'publishReview');
    const source = resolveProjectMarkdownPath(payload.sourcePath);
    if (!source || artifactRoleFor(source.rel) === 'review') return sendError(res, 400, 'sourcePath must identify a non-review .project Markdown artifact.');
    const initialHash = normalizedContentHash(source.file);
    if (payload.expectedContentHash != null && sanitizeString(payload.expectedContentHash, 128, 'expectedContentHash', true) !== initialHash) {
      return sendError(res, 409, 'Review draft baseline does not match the selected source content.');
    }
    const provenance = gitSourceProvenance(source);
    if (provenance.contentState === 'uncommitted' && payload.confirmUncommitted !== true) {
      return sendError(res, 409, 'Publishing a review of uncommitted source requires confirmUncommitted:true.');
    }
    const schema = loadReviewSchema();
    const now = new Date().toISOString();
    const author = normalizeDisplayName(payload.authorDisplayName, 'authorDisplayName');
    const findings = normalizePublishedFindings(payload.findings, now, schema, author);
    const reviewId = makeReviewId(payload.sessionSlug);
    const review = {
      schema_version: 1,
      review_id: reviewId,
      name: sanitizeString(payload.name || `Review of ${source.repoPath}`, 200, 'name', true),
      status: findings.some((finding) => finding.status === 'open') ? 'open' : 'resolved',
      created_at: now,
      updated_at: now,
      ...(author ? { author_display_name: author } : {}),
      source: {
        path: source.repoPath,
        branch_at_creation: activeContext.worktree.detached ? null : (activeContext.worktree.branch || null),
        content_state: provenance.contentState,
        commit: provenance.commit,
        blob: provenance.blob,
        hash_algorithm: schema.$defs.source.properties.hash_algorithm.const,
        content_hash: initialHash,
      },
      findings,
    };
    const errors = reviewValidationErrors(review, schema);
    if (errors.length) return sendError(res, 422, 'Review artifact failed schema validation.', { errors });
    const serialized = serializeReview(review);
    const privacy = privacyViolation(serialized);
    if (privacy) return sendError(res, 422, privacy);
    ensureNormalizedReviewSource(req, source, initialHash);
    fs.mkdirSync(reviewDirectory(), { recursive: true });
    const target = reviewFileForId(reviewId, false);
    try {
      fs.writeFileSync(target, serialized, { encoding: 'utf8', flag: 'wx' });
    } catch (error) {
      if (error.code === 'EEXIST') return sendError(res, 409, 'Review id already exists; retry publication with a unique session slug.');
      throw error;
    }
    return sendJsonStatus(res, 201, {
      ok: true,
      path: `.project/reviews/${path.basename(target)}`,
      review,
      runtime: runtimeReviewState(review),
    });
  }
  if (req.method === 'PATCH') {
    ensureCapability(req, 'publishReview');
    const payload = await readJsonBody(req);
    ensureCapability(req, 'publishReview');
    const artifact = readReviewFile(reviewFileForId(payload.reviewId || parsed.query.id));
    const review = structuredClone(artifact.review);
    const schema = loadReviewSchema();
    const now = new Date().toISOString();
    if (payload.status != null) {
      const status = String(payload.status);
      if (!schema.properties.status.enum.includes(status)) return sendError(res, 400, 'Review status is invalid.');
      review.status = status;
    }
    if (payload.findingId != null) {
      const finding = review.findings.find((candidate) => candidate.id === String(payload.findingId));
      if (!finding) return sendError(res, 404, 'Review finding not found.');
      const status = String(payload.findingStatus || '');
      if (!schema.$defs.finding.properties.status.enum.includes(status)) return sendError(res, 400, 'Finding status is invalid.');
      finding.status = status;
      if (status === 'open') {
        finding.resolution = null;
      } else {
        finding.resolution = {
          resolved_at: now,
          ...(normalizeDisplayName(payload.resolvedByDisplayName, 'resolvedByDisplayName') ? { resolved_by_display_name: normalizeDisplayName(payload.resolvedByDisplayName, 'resolvedByDisplayName') } : {}),
          summary: sanitizeString(payload.resolutionSummary, 20000, 'resolutionSummary', true),
        };
      }
      if (review.status !== 'archived') review.status = review.findings.some((candidate) => candidate.status === 'open') ? 'open' : 'resolved';
    }
    review.updated_at = now;
    const errors = reviewValidationErrors(review, schema);
    if (errors.length) return sendError(res, 422, 'Review artifact failed schema validation.', { errors });
    const serialized = serializeReview(review);
    const privacy = privacyViolation(serialized);
    if (privacy) return sendError(res, 422, privacy);
    const temporary = `${artifact.file}.${crypto.randomUUID()}.tmp`;
    fs.writeFileSync(temporary, serialized, { encoding: 'utf8', flag: 'wx' });
    try {
      fs.renameSync(temporary, artifact.file);
    } finally {
      if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
    }
    return sendJson(res, {
      ok: true,
      path: `.project/reviews/${path.basename(artifact.file)}`,
      review,
      runtime: runtimeReviewState(review),
    });
  }
  return sendError(res, 405, 'Use GET, POST, or PATCH');
}

function annotationSectionLines(selected) {
  const lines = [];
  selected.forEach((annotation, index) => {
    const line = annotation.anchor?.lineStart ? `line ${annotation.anchor.lineStart}` : 'no line anchor';
    lines.push(`## ${index + 1}. ${annotation.type || 'comment'} on \`${annotation.repoPath}\``);
    lines.push('');
    lines.push(`- Annotation ID: \`${annotation.id}\``);
    lines.push(`- Anchor: ${line}${annotation.anchor?.blockId ? `, block \`${annotation.anchor.blockId}\`` : ''}`);
    if (annotation.labels?.length) lines.push(`- Labels: ${annotation.labels.map((label) => `\`${label}\``).join(', ')}`);
    lines.push('');
    if (annotation.quote) {
      lines.push('Selected quote:');
      lines.push('>');
      annotation.quote.split(/\r?\n/).forEach((lineText) => lines.push(`> ${lineText}`));
      lines.push('');
    }
    lines.push('Comment:');
    lines.push('');
    lines.push(annotation.comment || '(empty)');
    lines.push('');
  });
  return lines;
}

function annotationMarkdown(annotations, options = {}) {
  const sourcePath = options.sourcePath || null;
  const selected = sortedVisibleAnnotations(annotations);
  const lines = [
    '# Delano Viewer Annotations',
    '',
    'Agent instruction: run `delano context read --profile implementation` first, then use these annotation attachments as scoped review feedback.',
    '',
    sourcePath ? `Source filter: \`.project/${sourcePath}\`` : 'Source filter: all annotation records',
    `Annotation count: ${selected.length}`,
    '',
    ...annotationSectionLines(selected),
  ];
  return lines.join('\n').trimEnd() + '\n';
}

function handoverMarkdown(annotations, source) {
  const selected = sortedVisibleAnnotations(annotations);
  const lines = [
    '# Delano Review Handover',
    '',
    'You are picking up human review feedback captured in the Delano viewer.',
    '',
    `- Source document: \`${source.repoPath}\``,
    `- Annotation count: ${selected.length}`,
    '',
    'Instructions:',
    '',
    '1. Read the source document first, then address every annotation below.',
    '2. Follow `AGENTS.md`: smallest task-safe change, record evidence, run the smallest meaningful validation.',
    '3. When an annotation is unclear or conflicts with the contract, say so instead of guessing.',
    '',
    ...annotationSectionLines(selected),
  ];
  return lines.join('\n').trimEnd() + '\n';
}

function diffLines(oldText, newText) {
  const oldLines = String(oldText || '').split(/\r?\n/);
  const newLines = String(newText || '').split(/\r?\n/);
  const max = Math.max(oldLines.length, newLines.length);
  const lines = [];
  for (let index = 0; index < max; index += 1) {
    if (oldLines[index] === newLines[index]) continue;
    if (oldLines[index] !== undefined) lines.push({ type: 'remove', line: index + 1, text: oldLines[index] });
    if (newLines[index] !== undefined) lines.push({ type: 'add', line: index + 1, text: newLines[index] });
  }
  return lines.slice(0, 500);
}

function readRequestBody(req, maxBytes = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    let tooLarge = false;
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      if (tooLarge) return;
      size += Buffer.byteLength(chunk, 'utf8');
      if (size > maxBytes) {
        tooLarge = true;
        reject(new HttpRequestError('Request body is too large.', 413));
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      if (!tooLarge) resolve(body);
    });
    req.on('error', (error) => {
      if (!tooLarge) reject(error);
    });
  });
}

async function readJsonBody(req) {
  const body = await readRequestBody(req);
  if (!body.trim()) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new HttpRequestError('Malformed JSON request body.', 400);
  }
}

function statusCodeForError(error) {
  if (error && Number.isInteger(error.statusCode)) return error.statusCode;
  const message = error && error.message ? error.message : String(error);
  return message.includes('too large') ? 413 : 500;
}

function handoverFileName(sourceRel) {
  const base = path.basename(String(sourceRel || 'document'))
    .replace(/\.md$/i, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .slice(0, 60) || 'document';
  const stamp = new Date().toISOString().replace(/\..+$/, '').replace(/:/g, '').replace('T', '-');
  return `handover-${stamp}-${base}.md`;
}

function agentCliName(agent) {
  if (agent === 't3code') return 't3code';
  if (agent === 'claude-code' || agent === 'claude') return 'claude';
  return 'codex';
}

function agentDisplayName(agent) {
  if (agent === 't3code') return 'T3 Code';
  if (agent === 'chatgpt') return 'ChatGPT';
  if (agent === 'claude-code') return 'Claude Code';
  if (agent === 'claude') return 'Claude';
  return 'Codex';
}

function shellSingleQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function handoverCommand(agent, prompt) {
  if (agent === 't3code') {
    return `t3code handover --cwd ${shellSingleQuote(repoRoot)} --prompt ${shellSingleQuote(prompt)}`;
  }
  return `${agentCliName(agent)} ${shellSingleQuote(prompt)}`;
}

function handoverDeepLink(agent, prompt) {
  const encodedPrompt = encodeURIComponent(prompt);
  const encodedRepo = encodeURIComponent(repoRoot);
  if (agent === 'chatgpt') {
    return `codex://new?prompt=${encodedPrompt}&path=${encodedRepo}`;
  }
  if (agent === 'claude-code') {
    return `claude://code/new?q=${encodedPrompt}&folder=${encodedRepo}`;
  }
  if (agent === 'claude') {
    return `claude://claude.ai/new?q=${encodedPrompt}`;
  }
  return null;
}

function launchT3CodeHandover(prompt) {
  const resolved = resolveCommand('t3code');
  if (!resolved) {
    return Promise.resolve({ ok: false, error: 'T3 Code CLI `t3code` was not found on PATH. Copy the command instead.' });
  }

  return new Promise((resolve) => {
    const args = [
      ...resolved.argsPrefix,
      '--json',
      'handover',
      '--cwd',
      repoRoot,
      '--stdin',
      '--open',
      'auto',
    ];
    const child = spawn(resolved.path, args, {
      cwd: repoRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };
    const timeout = setTimeout(() => {
      child.kill();
      finish({ ok: false, error: 'T3 Code handover timed out after 60 seconds.' });
    }, 60000);
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => finish({ ok: false, error: `Failed to start T3 Code CLI: ${error.message}` }));
    child.on('close', (code) => {
      if (settled) return;
      let payload = null;
      try {
        payload = JSON.parse(code === 0 ? stdout : stderr || stdout);
      } catch {
        // The CLI normally returns JSON; keep a bounded diagnostic if it did not.
      }
      if (code !== 0 || !payload?.ok) {
        const message = payload?.error?.message || String(stderr || stdout || `T3 Code CLI exited with code ${code}.`).trim();
        return finish({ ok: false, error: message.slice(0, 1000) });
      }
      return finish({
        ok: true,
        threadId: payload.data?.thread?.id || null,
        projectId: payload.data?.project?.id || null,
        opened: payload.data?.opened || null,
      });
    });
    child.stdin.end(prompt);
  });
}

async function launchAgentTerminal(agent, prompt) {
  if (agent === 't3code') {
    return launchT3CodeHandover(prompt);
  }
  const cliName = agentCliName(agent);
  if (!commandExists(cliName)) {
    return { ok: false, error: `${agentDisplayName(agent)} CLI \`${cliName}\` was not found on PATH. Copy the command instead.` };
  }
  if (/["\r\n]/.test(prompt)) {
    return { ok: false, error: 'Handover prompt contains unsupported characters.' };
  }
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (isWin) {
    const line = `start "Delano handover" /D "${repoRoot}" cmd /k ${cliName} "${prompt}"`;
    spawn('cmd.exe', ['/d', '/s', '/c', line], {
      detached: true,
      stdio: 'ignore',
      windowsVerbatimArguments: true,
    }).unref();
    return { ok: true };
  }

  const shellLine = `cd ${shellSingleQuote(repoRoot)} && ${cliName} ${shellSingleQuote(prompt)}`;
  if (isMac) {
    const appleScript = `tell application "Terminal" to do script "${shellLine.replace(/([\\"])/g, '\\$1')}"`;
    spawn('osascript', ['-e', appleScript, '-e', 'tell application "Terminal" to activate'], {
      detached: true,
      stdio: 'ignore',
    }).unref();
    return { ok: true };
  }

  const candidates = [
    ['x-terminal-emulator', ['-e', 'bash', '-lc', shellLine]],
    ['gnome-terminal', ['--', 'bash', '-lc', shellLine]],
    ['konsole', ['-e', 'bash', '-lc', shellLine]],
    ['xterm', ['-e', 'bash', '-lc', shellLine]],
  ];
  for (const [command, args] of candidates) {
    if (commandExists(command)) {
      spawn(command, args, { detached: true, stdio: 'ignore' }).unref();
      return { ok: true };
    }
  }
  return { ok: false, error: 'No terminal emulator was found. Copy the command instead.' };
}

function handoverRoleName(rel) {
  const role = artifactRoleFor(rel);
  return role === 'task' || role === 'workstream' || role === 'review' ? role : 'document';
}

function handoverPrompt(intent, source, handoverPath, annotationCount) {
  const role = handoverRoleName(source.rel);
  if (intent === 'start') {
    if (role === 'workstream') {
      return `Work the Delano workstream ${source.repoPath}. Read AGENTS.md and the owning project spec and plan first, pick up its dependency-safe open tasks, record evidence, and update lifecycle state with the delano CLI.`;
    }
    return `Work the Delano ${role} ${source.repoPath}. Read AGENTS.md and the owning project spec and plan first, implement the acceptance criteria, record evidence, and update lifecycle state with the delano CLI.`;
  }
  if (intent === 'review') {
    if (role === 'review') {
      return `Review the tracked Delano review ${source.repoPath}. Read its source provenance and every open finding, verify the current source state, and record resolution evidence per AGENTS.md.`;
    }
    const feedback = handoverPath && annotationCount > 0
      ? ` Reviewer annotations are in ${handoverPath}; address every one of them.`
      : '';
    return `Review the delivered work for the Delano ${role} ${source.repoPath}. Verify each acceptance criterion and the evidence log against the actual implementation, run the smallest meaningful validation, and record findings with the delano CLI.${feedback}`;
  }
  return `Address the Delano review handover in ${handoverPath}. Read ${source.repoPath} and resolve every annotation listed, then record evidence per AGENTS.md.`;
}

async function handleHandover(req, res) {
  if (req.method !== 'POST') return sendError(res, 405, 'Use POST');
  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    return sendError(res, statusCodeForError(error), error.message);
  }
  const agent = payload.agent == null ? 'chatgpt' : String(payload.agent);
  if (!HANDOVER_AGENTS.has(agent)) {
    return sendError(res, 400, 'Unsupported handover agent.');
  }
  const action = payload.action === 'launch' ? 'launch' : 'command';
  const intent = payload.intent === 'start' || payload.intent === 'review' ? payload.intent : 'annotations';
  const capability = intent === 'start' ? 'dispatch' : 'review';
  ensureCapability(req, capability);
  const source = resolveProjectMarkdownPath(String(payload.sourcePath || ''));
  if (!source) return sendError(res, 404, 'Source document not found.');
  source.baselineHash = fileBaseline(source.file).hash;
  const expectedSourceHash = payload.expectedSourceHash == null
    ? null
    : sanitizeString(payload.expectedSourceHash, 128, 'expectedSourceHash', true);
  ensureFreshSource(req, capability, source, expectedSourceHash);
  const ids = Array.isArray(payload.ids)
    ? payload.ids.slice(0, MAX_HANDOVER_IDS).map((id) => String(id))
    : null;
  const sourceRole = artifactRoleFor(source.rel);
  const annotations = sourceRole === 'review' ? [] : readAnnotationStore().annotations.filter((annotation) => (
    annotation.status !== 'deleted' &&
    annotation.sourcePath === source.rel &&
    (!ids || ids.includes(annotation.id))
  ));

  // Work-dispatch handovers reference the contract directly; the annotation
  // file is only written when there is captured feedback to carry along.
  let handoverPath = sourceRole === 'review' ? source.repoPath : null;
  if (sourceRole !== 'review' && intent === 'annotations') {
    ensureFreshSource(req, capability, source, expectedSourceHash);
    ensureAnnotationStoreDir();
    fs.mkdirSync(handoverDir, { recursive: true });
    const fileName = handoverFileName(source.rel);
    fs.writeFileSync(path.join(handoverDir, fileName), handoverMarkdown(annotations, source), 'utf8');
    handoverPath = `.project/viewer/handovers/${fileName}`;
  }

  const prompt = handoverPrompt(intent, source, handoverPath, annotations.length);
  const command = handoverCommand(agent, prompt);
  const copyKind = 'command';
  const copyValue = command;
  // Desktop links are machine-local. ChatGPT desktop still registers codex://.
  const deepLink = handoverDeepLink(agent, prompt);
  const base = {
    agent,
    action,
    intent,
    file: handoverPath,
    prompt,
    command,
    copyKind,
    copyValue,
    deepLink,
    annotationCount: annotations.length,
  };

  if (action === 'launch') {
    ensureFreshSource(req, capability, source, expectedSourceHash);
    const launch = await launchAgentTerminal(agent, prompt);
    ensureFreshSource(req, capability, source, expectedSourceHash);
    if (!launch.ok) return sendJsonStatus(res, 400, { ok: false, error: launch.error, ...base });
    return sendJson(res, { ok: true, launched: true, ...base, ...launch });
  }
  return sendJson(res, { ok: true, launched: false, ...base });
}

function windowsPath(file) {
  const converted = spawnSync('wslpath', ['-w', file], { encoding: 'utf8' });
  return converted.status === 0 ? converted.stdout.trim() : file;
}

function commandExists(command) {
  const check = spawnSync(process.platform === 'win32' ? 'where' : 'which', [command], { stdio: 'ignore' });
  return check.status === 0;
}

function resolveCommand(command) {
  const check = spawnSync(process.platform === 'win32' ? 'where' : 'which', [command], { encoding: 'utf8' });
  if (check.status !== 0) return null;
  const paths = String(check.stdout || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!paths.length) return null;
  const executable = paths.find((item) => /\.exe$/i.test(item));
  const cmd = paths.find((item) => /\.cmd$/i.test(item));
  const extensionless = paths.find((item) => !path.extname(item));
  const selected = process.platform === 'win32'
    ? executable || cmd || extensionless || paths[0]
    : executable || extensionless || cmd || paths[0];
  if (process.platform === 'win32' && /\.cmd$/i.test(selected)) {
    return { path: 'cmd.exe', argsPrefix: ['/d', '/s', '/c', selected] };
  }
  return { path: selected, argsPrefix: [] };
}

function openTarget(target, file) {
  const isWin = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (target === 'code') {
    if (!commandExists('code')) return { ok: false, error: 'VS Code CLI `code` was not found on PATH.' };
    // On Windows the CLI is `code.cmd`; spawn requires shell:true to resolve PATHEXT.
    spawn('code', ['-g', file], { detached: true, stdio: 'ignore', shell: isWin }).unref();
    return { ok: true, target, opened: file };
  }

  if (target === 'explorer') {
    const dir = path.dirname(file);

    // Native Windows: launch explorer.exe directly with the directory.
    if (isWin) {
      spawn('explorer.exe', [dir], { detached: true, stdio: 'ignore' }).unref();
      return { ok: true, target, opened: dir };
    }

    // WSL: explorer.exe is reachable through the mounted Windows path.
    const wslExplorer = '/mnt/c/Windows/explorer.exe';
    if (fs.existsSync(wslExplorer)) {
      spawn(wslExplorer, [windowsPath(dir)], { detached: true, stdio: 'ignore' }).unref();
      return { ok: true, target, opened: dir };
    }

    // macOS / Linux fall back to `open` / `xdg-open`.
    const opener = isMac ? 'open' : 'xdg-open';
    if (!commandExists(opener)) return { ok: false, error: `System opener \`${opener}\` was not found.` };
    spawn(opener, [dir], { detached: true, stdio: 'ignore' }).unref();
    return { ok: true, target, opened: dir };
  }

  return { ok: false, error: 'Unknown open target.' };
}

function sendStatic(res, pathname) {
  if (pathname === '/favicon.ico') {
    const faviconPath = path.join(publicRoot, 'favicon.png');
    if (fs.existsSync(faviconPath)) {
      res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'max-age=86400' });
      res.end(fs.readFileSync(faviconPath));
      return;
    }
    res.writeHead(204, { 'cache-control': 'max-age=86400' });
    res.end();
    return;
  }
  const file = pathname === '/' ? path.join(publicRoot, 'index.html') : path.join(publicRoot, pathname);
  const resolved = path.resolve(file);
  if (!isInside(publicRoot, resolved) || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const ext = path.extname(resolved).toLowerCase();
  const mimeMap = {
    '.js': 'text/javascript',
    '.jsx': 'text/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };
  const isText = ext === '.js' || ext === '.jsx' || ext === '.css' || ext === '.svg' || ext === '' || ext === '.html';
  const type = mimeMap[ext] || 'text/html';
  const headers = isText
    ? { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' }
    : { 'content-type': type, 'cache-control': 'no-store' };
  res.writeHead(200, headers);
  res.end(fs.readFileSync(resolved));
}

async function handleAnnotations(req, res, parsed) {
  const store = readAnnotationStore();
  const source = parsed.query.path || parsed.query.sourcePath || null;
  const sourcePath = source ? resolveProjectMarkdownPath(source)?.rel : null;

  if ((source || parsed.query.sourcePath) && !sourcePath) {
    return sendError(res, 400, 'Invalid annotation source path.');
  }

  if (req.method === 'GET') {
    const annotations = store.annotations
      .map(visibleAnnotation)
      .filter((annotation) => !sourcePath || annotation.sourcePath === sourcePath);
    return sendJson(res, {
      ok: true,
      storePath: '.project/viewer/annotations.json',
      sourcePath,
      annotations,
    });
  }

  if (['POST', 'PATCH', 'DELETE'].includes(req.method)) {
    return sendError(res, 405, 'Legacy annotations are read-only. Use browser-local drafts and publish tracked reviews instead.');
  }

  return sendError(res, 405, 'Unsupported method.');
}

async function handleAnnotationExport(req, res, parsed) {
  if (req.method !== 'GET' && req.method !== 'POST') return sendError(res, 405, 'Use GET or POST');
  const body = req.method === 'POST' ? await readJsonBody(req) : {};
  const source = parsed.query.path || parsed.query.sourcePath || body.sourcePath || null;
  const sourcePath = source ? resolveProjectMarkdownPath(source)?.rel : null;
  if (source && !sourcePath) return sendError(res, 400, 'Invalid annotation source path.');
  const queryIds = String(parsed.query.ids || '').split(',').map((id) => id.trim()).filter(Boolean);
  const bodyIds = Array.isArray(body.ids) ? body.ids.map(String).filter(Boolean) : [];
  const ids = new Set([...queryIds, ...bodyIds]);
  const store = readAnnotationStore();
  const annotations = store.annotations
    .map(visibleAnnotation)
    .filter((annotation) => !sourcePath || annotation.sourcePath === sourcePath)
    .filter((annotation) => !ids.size || ids.has(annotation.id));
  const markdown = annotationMarkdown(annotations, { sourcePath });
  return sendJson(res, {
    ok: true,
    markdown,
    json: {
      version: 1,
      contextProfile: 'implementation',
      sourcePath,
      annotations,
    },
  });
}

async function handleApplyPreview(req, res, shouldWrite) {
  if (req.method !== 'POST') return sendError(res, 405, 'Use POST');
  if (shouldWrite) ensureCapability(req, 'applyContract');
  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    return sendError(res, statusCodeForError(error), error.message);
  }
  if (shouldWrite) ensureCapability(req, 'applyContract');
  else ensureRequestContext(req);
  const source = resolveProjectMarkdownPath(payload.sourcePath);
  if (!source) return sendError(res, 400, 'sourcePath must point at a known .project markdown document.');
  const replacementMarkdown = String(payload.replacementMarkdown ?? '');
  if (!replacementMarkdown.trim()) return sendError(res, 400, 'replacementMarkdown is required.');
  const current = readText(source.file);
  const baseline = fileBaseline(source.file);
  const expectedHash = sanitizeString(payload.expectedHash, 128, 'expectedHash', true);
  if (expectedHash !== baseline.hash) {
    return sendError(res, 409, 'Current file baseline does not match expectedHash.', {
      currentBaseline: baseline,
    });
  }
  const diff = diffLines(current, replacementMarkdown);
  if (!shouldWrite) {
    return sendJson(res, {
      ok: true,
      sourcePath: source.rel,
      repoPath: source.repoPath,
      baseline,
      diff,
      writes: false,
    });
  }
  if (payload.confirm !== true) return sendError(res, 400, 'confirm:true is required before writing.');
  const store = readAnnotationStore();
  fs.writeFileSync(source.file, replacementMarkdown, 'utf8');
  const nextBaseline = fileBaseline(source.file);
  store.applyAudit.push({
    id: crypto.randomUUID(),
    sourcePath: source.rel,
    repoPath: source.repoPath,
    annotationIds: Array.isArray(payload.annotationIds) ? payload.annotationIds.map(String).filter(Boolean) : [],
    reason: sanitizeString(payload.reason, 500, 'reason', false),
    previousHash: baseline.hash,
    nextHash: nextBaseline.hash,
    appliedAt: new Date().toISOString(),
  });
  writeAnnotationStore(store);
  return sendJson(res, {
    ok: true,
    sourcePath: source.rel,
    repoPath: source.repoPath,
    previousBaseline: baseline,
    baseline: nextBaseline,
    diff,
    writes: true,
  });
}

const server = http.createServer(async (req, res) => {
  try {
    req.delanoGeneration = contextGeneration;
    req.delanoContext = {
      repository: { id: activeContext.repository.id },
      worktree: {
        id: activeContext.worktree.id,
        path: activeContext.worktree.path,
        branch: activeContext.worktree.branch || null,
        detached: Boolean(activeContext.worktree.detached),
        head: activeContext.worktree.head || null,
      },
      legacy: activeContext.legacy,
      generation: contextGeneration,
    };
    const parsed = parseRequestUrl(req.url);
    if (parsed.pathname === '/api/context') return await handleContext(req, res);
    if (contextSwitching && parsed.pathname.startsWith('/api/')) {
      throw new HttpRequestError('Viewer context is switching; retry the request.', 503);
    }
    if (parsed.pathname === '/api/events') {
      if (req.method !== 'GET') {
        res.writeHead(405); res.end('Use GET'); return;
      }
      return handleSse(req, res);
    }
    if (parsed.pathname === '/api/activity') {
      if (req.method !== 'GET') {
        res.writeHead(405); res.end('Use GET'); return;
      }
      return sendJson(res, { ok: true, events: [...activityEvents].reverse() });
    }
    if (parsed.pathname === '/api/index') return sendJson(res, loadIndex());
    if (parsed.pathname === '/api/doc') {
      const rel = String(parsed.query.path || '');
      const source = resolveProjectMarkdownPath(rel);
      if (!source) {
        res.writeHead(404); res.end('Document not found'); return;
      }
      const markdown = readText(source.file);
      const meta = docMeta(source.file, source.rel);
      let reviewRuntime = null;
      if (meta.role === 'review') {
        reviewRuntime = runtimeReviewState(readReviewFile(source.file).review);
      }
      return sendJson(res, {
        ...meta,
        markdown,
        body: splitFrontmatter(markdown).body,
        baseline: fileBaseline(source.file),
        contentHash: normalizedContentHash(source.file),
        reviewRuntime,
      });
    }
    if (parsed.pathname === '/api/annotations') {
      return await handleAnnotations(req, res, parsed);
    }
    if (parsed.pathname === '/api/annotations/export') {
      return await handleAnnotationExport(req, res, parsed);
    }
    if (parsed.pathname === '/api/reviews/migrate') {
      return await handleReviewMigration(req, res);
    }
    if (parsed.pathname === '/api/reviews') {
      return await handleReviews(req, res, parsed);
    }
    if (parsed.pathname === '/api/apply/preview') {
      return await handleApplyPreview(req, res, false);
    }
    if (parsed.pathname === '/api/apply') {
      return await handleApplyPreview(req, res, true);
    }
    if (parsed.pathname === '/api/handover') {
      return await handleHandover(req, res);
    }
    if (parsed.pathname === '/api/open') {
      if (req.method !== 'POST') {
        res.writeHead(405); res.end('Use POST'); return;
      }
      const rel = String(parsed.query.path || '');
      const file = projectFileFromRequest(rel);
      if (!file) {
        res.writeHead(404); res.end('Document not found'); return;
      }
      const result = openTarget(String(parsed.query.target || ''), file);
      if (!result.ok) {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result, null, 2)); return;
      }
      return sendJson(res, result);
    }
    return sendStatic(res, decodeURIComponent(parsed.pathname));
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    sendError(res, statusCodeForError(error), message);
  }
});

function listenWithPortFallback(server, firstPort, host = '127.0.0.1') {
  let port = firstPort;
  let attempts = 0;

  const listen = () => {
    server.once('error', onError);
    server.listen(port, host);
  };

  const onError = (error) => {
    if (error.code === 'EADDRINUSE' && port < MAX_PORT && attempts < MAX_PORT_ATTEMPTS) {
      attempts += 1;
      port += 1;
      listen();
      return;
    }

    console.error(`Failed to start Delano viewer on ${host}:${port}: ${error.message}`);
    process.exitCode = 1;
  };

  const onListening = () => {
    server.removeListener('error', onError);
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : port;
    const skipped = actualPort !== firstPort ? ` (${firstPort} was unavailable)` : '';
    console.log(`Delano guarded viewer: http://${host}:${actualPort}${skipped}`);
    startLiveUpdates();
  };

  server.on('listening', onListening);
  listen();
}

const closeServer = server.close.bind(server);
server.close = function closeViewerServer(callback) {
  stopLiveUpdates();
  return closeServer(callback);
};
server.on('close', stopLiveUpdates);
process.once('SIGINT', () => server.close());
process.once('SIGTERM', () => server.close());

listenWithPortFallback(server, startPort);
