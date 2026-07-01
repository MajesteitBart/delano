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

const repoRoot = path.resolve(process.env.DELANO_VIEWER_ROOT || path.resolve(__dirname, '..', '..'));
const projectRoot = path.join(repoRoot, '.project');
const publicRoot = path.join(__dirname, 'public');
const DEFAULT_PORT = 3977;
const MAX_PORT = 65535;
const MAX_PORT_ATTEMPTS = 100;
const MAX_BODY_BYTES = 512 * 1024;
const MAX_ANNOTATION_QUOTE = 4000;
const MAX_ANNOTATION_COMMENT = 12000;
const MAX_LABELS = 12;
const MAX_HANDOVER_IDS = 200;
const annotationStoreDir = path.join(projectRoot, 'viewer');
const annotationStorePath = path.join(annotationStoreDir, 'annotations.json');
const handoverDir = path.join(annotationStoreDir, 'handovers');
const startPort = normalizePort(process.env.DELANO_VIEWER_PORT || process.env.PORT, DEFAULT_PORT);

let contextReader = null;
try {
  contextReader = require(path.resolve(__dirname, '..', '..', 'src', 'cli', 'lib', 'context-reader'));
} catch {
  contextReader = null;
}

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

function splitFrontmatter(markdown) {
  if (!markdown.startsWith('---\n') && !markdown.startsWith('---\r\n')) return { frontmatter: {}, body: markdown };
  const normalized = markdown.replace(/^---\r?\n/, '');
  const close = normalized.search(/\r?\n---\r?\n/);
  if (close < 0) return { frontmatter: {}, body: markdown };
  const yaml = normalized.slice(0, close);
  const body = normalized.slice(close).replace(/^\r?\n---\r?\n/, '');
  return { frontmatter: parseSimpleYaml(yaml), body };
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
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_`>#\-[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
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

function loadIndex() {
  const docs = walkMarkdown(projectRoot).map((file) => docMeta(file));
  const contextPack = loadContextPack();
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
  return { repo: path.basename(repoRoot), generatedAt: new Date().toISOString(), contextPack, projects, docs };
}

function sendJson(res, data) {
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data, null, 2));
}

function sendJsonStatus(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data, null, 2));
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
  } catch {
    return emptyAnnotationStore();
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
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      size += Buffer.byteLength(chunk, 'utf8');
      if (size > maxBytes) {
        reject(new Error('Request body is too large.'));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function readJsonBody(req) {
  const body = await readRequestBody(req);
  if (!body.trim()) return {};
  return JSON.parse(body);
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
  return agent === 'claude' ? 'claude' : 'codex';
}

function agentDisplayName(agent) {
  return agent === 'claude' ? 'Claude Code' : 'Codex';
}

function shellSingleQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function launchAgentTerminal(agent, prompt) {
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
  return role === 'task' || role === 'workstream' ? role : 'document';
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
    return sendError(res, 400, error.message);
  }
  const agent = payload.agent === 'claude' ? 'claude' : 'codex';
  const action = payload.action === 'launch' ? 'launch' : 'command';
  const intent = payload.intent === 'start' || payload.intent === 'review' ? payload.intent : 'annotations';
  const source = resolveProjectMarkdownPath(String(payload.sourcePath || ''));
  if (!source) return sendError(res, 404, 'Source document not found.');
  const ids = Array.isArray(payload.ids)
    ? payload.ids.slice(0, MAX_HANDOVER_IDS).map((id) => String(id))
    : null;
  const store = readAnnotationStore();
  const annotations = store.annotations.filter((annotation) => (
    annotation.status !== 'deleted' &&
    annotation.sourcePath === source.rel &&
    (!ids || ids.includes(annotation.id))
  ));

  // Work-dispatch handovers reference the contract directly; the annotation
  // file is only written when there is captured feedback to carry along.
  let handoverPath = null;
  if (intent === 'annotations' || (intent === 'review' && annotations.length)) {
    ensureAnnotationStoreDir();
    fs.mkdirSync(handoverDir, { recursive: true });
    const fileName = handoverFileName(source.rel);
    fs.writeFileSync(path.join(handoverDir, fileName), handoverMarkdown(annotations, source), 'utf8');
    handoverPath = `.project/viewer/handovers/${fileName}`;
  }

  const prompt = handoverPrompt(intent, source, handoverPath, annotations.length);
  const command = `${agentCliName(agent)} "${prompt}"`;
  // The Codex desktop app registers the codex:// scheme; path must be the
  // absolute workspace root, so this link is only meaningful on this machine.
  const deepLink = agent === 'codex'
    ? `codex://new?prompt=${encodeURIComponent(prompt)}&path=${encodeURIComponent(repoRoot)}`
    : null;
  const base = { agent, action, intent, file: handoverPath, prompt, command, deepLink, annotationCount: annotations.length };

  if (action === 'launch') {
    const launch = launchAgentTerminal(agent, prompt);
    if (!launch.ok) return sendJsonStatus(res, 400, { ok: false, error: launch.error, ...base });
    return sendJson(res, { ok: true, launched: true, ...base });
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

  if (req.method === 'POST') {
    const payload = await readJsonBody(req);
    let annotation;
    try {
      annotation = normalizeAnnotationInput(payload);
    } catch (error) {
      return sendError(res, 400, error.message);
    }
    store.annotations.push(annotation);
    writeAnnotationStore(store);
    return sendJsonStatus(res, 201, { ok: true, annotation: visibleAnnotation(annotation) });
  }

  if (req.method === 'PATCH') {
    const id = sanitizeString(parsed.query.id, 120, 'id', true);
    const index = store.annotations.findIndex((annotation) => annotation.id === id);
    if (index < 0) return sendError(res, 404, 'Annotation not found.');
    const payload = await readJsonBody(req);
    let annotation;
    try {
      annotation = normalizeAnnotationInput({ ...store.annotations[index], ...payload }, store.annotations[index]);
    } catch (error) {
      return sendError(res, 400, error.message);
    }
    store.annotations[index] = annotation;
    writeAnnotationStore(store);
    return sendJson(res, { ok: true, annotation: visibleAnnotation(annotation) });
  }

  if (req.method === 'DELETE') {
    const ids = String(parsed.query.id || '').split(',').map((id) => id.trim()).filter(Boolean);
    if (!ids.length) return sendError(res, 400, 'Annotation id is required.');
    const before = store.annotations.length;
    const idSet = new Set(ids);
    store.annotations = store.annotations.filter((annotation) => !idSet.has(annotation.id));
    writeAnnotationStore(store);
    return sendJson(res, { ok: true, deleted: before - store.annotations.length });
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
  const payload = await readJsonBody(req);
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
  fs.writeFileSync(source.file, replacementMarkdown, 'utf8');
  const nextBaseline = fileBaseline(source.file);
  const store = readAnnotationStore();
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
    const parsed = parseRequestUrl(req.url);
    if (parsed.pathname === '/api/index') return sendJson(res, loadIndex());
    if (parsed.pathname === '/api/doc') {
      const rel = String(parsed.query.path || '');
      const source = resolveProjectMarkdownPath(rel);
      if (!source) {
        res.writeHead(404); res.end('Document not found'); return;
      }
      const markdown = readText(source.file);
      const meta = docMeta(source.file, source.rel);
      return sendJson(res, { ...meta, markdown, body: splitFrontmatter(markdown).body, baseline: fileBaseline(source.file) });
    }
    if (parsed.pathname === '/api/annotations') {
      return handleAnnotations(req, res, parsed);
    }
    if (parsed.pathname === '/api/annotations/export') {
      return handleAnnotationExport(req, res, parsed);
    }
    if (parsed.pathname === '/api/apply/preview') {
      return handleApplyPreview(req, res, false);
    }
    if (parsed.pathname === '/api/apply') {
      return handleApplyPreview(req, res, true);
    }
    if (parsed.pathname === '/api/handover') {
      return handleHandover(req, res);
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
    sendError(res, message.includes('too large') ? 413 : 500, message);
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
  };

  server.on('listening', onListening);
  listen();
}

listenWithPortFallback(server, startPort);
