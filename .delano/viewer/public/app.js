const state = { index: null, project: 'context', doc: null, query: '', status: 'all', role: 'all', workstream: null };

const $ = (sel) => document.querySelector(sel);
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const titleCase = (s) => String(s || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function statusClass(status){ return status ? `pill ${String(status).toLowerCase()}` : 'pill'; }
function byPath(path){ return state.index.docs.find((d) => d.path === path); }
function currentProject(){ return state.index.projects.find((p) => p.slug === state.project) || state.index.projects[0]; }
function projectDocs(){ return currentProject().docs.map(byPath).filter(Boolean); }
function isProjectGroup(){ return Boolean(currentProject().outline); }
function availableStatuses(){ return [...new Set(projectDocs().map((d) => d.status).filter(Boolean).map((s) => String(s).toLowerCase()))]; }
function availableRoles(){ return [...new Set(projectDocs().map((d) => d.role).filter(Boolean))]; }

function currentDocs(){
  const docs = projectDocs();
  return docs.filter((doc) => {
    const q = state.query.toLowerCase();
    const matchesQ = !q || [doc.title, doc.path, doc.snippet, doc.role, JSON.stringify(doc.frontmatter)].join(' ').toLowerCase().includes(q);
    const matchesStatus = state.status === 'all' || String(doc.status || '').toLowerCase() === state.status;
    const matchesRole = state.role === 'all' || doc.role === state.role;
    const matchesWorkstream = !state.workstream || doc.path === state.workstream || doc.workstreamPath === state.workstream;
    return matchesQ && matchesStatus && matchesRole && matchesWorkstream;
  });
}

function renderMarkdown(markdown){
  const body = markdown.replace(/^---[\s\S]*?\n---\r?\n/, '');
  const lines = body.split(/\r?\n/);
  let html = '', inCode = false, code = [], inList = false;
  function closeList(){ if(inList){ html += '</ul>'; inList = false; } }
  function inline(text){
    return escapeHtml(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="wikilink" data-target="$1">$1</span>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  }
  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCode) { html += `<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`; code = []; inCode = false; }
      else { closeList(); inCode = true; }
      continue;
    }
    if (inCode) { code.push(line); continue; }
    if (!line.trim()) { closeList(); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { closeList(); html += `<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`; continue; }
    const item = line.match(/^[-*]\s+(.+)$/);
    if (item) { if(!inList){ html += '<ul>'; inList = true; } html += `<li>${inline(item[1])}</li>`; continue; }
    const quote = line.match(/^>\s+(.+)$/);
    if (quote) { closeList(); html += `<blockquote>${inline(quote[1])}</blockquote>`; continue; }
    closeList(); html += `<p>${inline(line)}</p>`;
  }
  closeList();
  return html || '<p class="empty">This document is empty.</p>';
}

async function loadDoc(path){
  const res = await fetch(`/api/doc?path=${encodeURIComponent(path)}`);
  state.doc = await res.json();
  render();
}

function renderSidebar(){
  return `<aside class="sidebar"><div class="brand">Delano</div><div class="subtitle">Read-only .project viewer</div><div class="section-label">Folders & Projects</div>${state.index.projects.map((p) => `<button class="project ${p.slug === state.project ? 'active' : ''}" data-project="${p.slug}"><span>${escapeHtml(p.title)}</span><span class="count">${p.docs.length}</span></button>`).join('')}</aside>`;
}

function renderFilters(){
  const roles = availableRoles();
  const statuses = availableStatuses();
  const roleLabels = { context: 'context', template: 'templates', spec: 'spec', plan: 'plan', workstream: 'workstreams', task: 'tasks', decision: 'decisions', progress: 'progress' };
  return `<div class="filter-group"><span class="filter-label">Show</span><button class="filter ${state.role === 'all' ? 'active' : ''}" data-role="all">all</button>${roles.map((r) => `<button class="filter ${state.role === r ? 'active' : ''}" data-role="${r}">${roleLabels[r] || r}</button>`).join('')}</div>${statuses.length ? `<div class="filter-group"><span class="filter-label">Status</span><button class="filter ${state.status === 'all' ? 'active' : ''}" data-status="all">all</button>${statuses.map((s) => `<button class="filter ${state.status === s ? 'active' : ''}" data-status="${s}">${s}</button>`).join('')}</div>` : '<div class="filter-note">No status filters for this folder.</div>'}${state.workstream ? `<button class="workstream-scope" data-clear-workstream>Showing selected workstream and subtasks ×</button>` : ''}`;
}

function renderList(){
  const docs = currentDocs();
  return `<main class="list"><input class="search" placeholder="Search this ${isProjectGroup() ? 'project' : 'folder'}…" value="${escapeHtml(state.query)}" /><div class="filters">${renderFilters()}</div>${docs.map((doc) => `<article class="doc ${state.doc?.path === doc.path ? 'active' : ''}" data-doc="${doc.path}"><div class="doc-title"><span>${escapeHtml(doc.title)}</span>${doc.status ? `<span class="${statusClass(doc.status)}">${escapeHtml(doc.status)}</span>` : `<span class="pill">${escapeHtml(titleCase(doc.role))}</span>`}</div><div class="doc-path">${escapeHtml(doc.path)}</div><div class="doc-snippet">${escapeHtml(doc.snippet)}</div></article>`).join('') || '<div class="empty">No documents match this filter.</div>'}</main>`;
}

function renderReader(){
  const doc = state.doc;
  if (!doc) return '<section class="reader"><div class="empty">Select a document.</div></section>';
  const props = Object.entries(doc.frontmatter || {});
  return `<section class="reader"><div class="reader-inner"><header class="reader-head"><div class="reader-top"><div><div class="eyebrow">${escapeHtml(titleCase(doc.role))}</div><h1>${escapeHtml(doc.title)}</h1></div><div class="reader-actions"><button class="action" data-open="explorer" title="Open containing folder">Open in system explorer</button><button class="action primary" data-open="code" title="Open this markdown file in VS Code">Open in VS Code</button></div></div><div class="meta"><span class="pill path-pill">${escapeHtml(doc.path)}</span>${doc.status ? `<span class="${statusClass(doc.status)}">${escapeHtml(doc.status)}</span>` : ''}<span class="pill">updated ${escapeHtml(String(doc.updated).slice(0,10))}</span></div><div class="open-feedback" aria-live="polite"></div>${props.length ? `<div class="properties">${props.map(([k,v]) => `<div class="prop-key">${escapeHtml(k)}</div><div class="prop-value">${escapeHtml(Array.isArray(v) ? v.join(', ') : v)}</div>`).join('')}</div>` : ''}</header><article class="markdown">${renderMarkdown(doc.markdown)}</article></div></section>`;
}

async function openCurrentDoc(target){
  if (!state.doc) return;
  const feedback = $('.open-feedback');
  try {
    const res = await fetch(`/api/open?target=${encodeURIComponent(target)}&path=${encodeURIComponent(state.doc.path)}`, { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || 'Open action failed.');
    if (feedback) feedback.textContent = target === 'code' ? 'Opened in VS Code.' : 'Opened in system explorer.';
  } catch (error) {
    if (feedback) feedback.textContent = error.message || String(error);
  }
}

function outlineLink(path, label, extra = ''){
  if (!path) return '';
  const doc = byPath(path);
  const active = state.doc?.path === path ? 'active' : '';
  return `<button class="outline-link ${active}" data-doc="${path}"><span>${escapeHtml(label || doc?.title || path)}</span>${extra}</button>`;
}

function renderProjectOutline(){
  const project = currentProject();
  if (!project.outline) return `<aside class="outline"><div class="outline-title">Folder guide</div><p class="outline-help">${project.slug === 'context' ? 'Context is repo-level background. Status filters stay hidden because these documents are not delivery tasks.' : 'Templates are reusable contracts. Status filters stay hidden unless this folder contains statuses.'}</p></aside>`;
  const outline = project.outline;
  const taskLink = (path) => {
    const task = byPath(path);
    const status = task?.status ? `<span class="${statusClass(task.status)}">${escapeHtml(task.status)}</span>` : '';
    return outlineLink(path, `${task?.taskId ? `${task.taskId} ` : ''}${task?.title || path}`, status);
  };
  return `<aside class="outline"><div class="outline-title">Project outline</div><p class="outline-help">Select a workstream to focus the list and reveal its subtasks.</p><div class="outline-section"><div class="outline-label">Core</div>${outlineLink(outline.spec, 'Spec')}${outlineLink(outline.plan, 'Plan')}${outline.decisions.map((p) => outlineLink(p, byPath(p)?.title || 'Decisions')).join('')}${outline.progress.map((p) => outlineLink(p, byPath(p)?.title || 'Progress')).join('')}</div><div class="outline-section"><div class="outline-label">Workstreams & Tasks</div>${outline.workstreams.map((ws) => `<div class="workstream-block ${state.workstream === ws.path ? 'active' : ''}"><button class="outline-link workstream-pick ${state.doc?.path === ws.path ? 'active' : ''}" data-workstream="${ws.path}" data-doc="${ws.path}"><span>${escapeHtml(ws.id ? `${ws.id} ${ws.title}` : ws.title)}</span>${ws.status ? `<span class="${statusClass(ws.status)}">${escapeHtml(ws.status)}</span>` : `<span class="count">${ws.tasks.length}</span>`}</button>${state.workstream === ws.path ? `<div class="subtasks">${ws.tasks.map(taskLink).join('') || '<div class="empty small">No subtasks linked yet.</div>'}</div>` : ''}</div>`).join('')}${outline.unassignedTasks.length ? `<div class="outline-label">Unassigned tasks</div>${outline.unassignedTasks.map(taskLink).join('')}` : ''}</div></aside>`;
}

function resetGroupFilters(){
  state.status = 'all';
  state.role = 'all';
  state.workstream = null;
}

function render(){
  $('#app').innerHTML = `<div class="shell">${renderSidebar()}${renderList()}${renderReader()}${renderProjectOutline()}</div>`;
  document.querySelectorAll('[data-project]').forEach((el) => el.onclick = () => { state.project = el.dataset.project; state.doc = null; resetGroupFilters(); const first = currentDocs()[0]; if(first) loadDoc(first.path); else render(); });
  document.querySelectorAll('[data-doc]').forEach((el) => el.onclick = () => loadDoc(el.dataset.doc));
  document.querySelectorAll('[data-status]').forEach((el) => el.onclick = () => { state.status = el.dataset.status; render(); });
  document.querySelectorAll('[data-role]').forEach((el) => el.onclick = () => { state.role = el.dataset.role; state.workstream = null; render(); });
  document.querySelectorAll('[data-workstream]').forEach((el) => el.onclick = () => { state.workstream = el.dataset.workstream; state.role = 'all'; loadDoc(el.dataset.doc); });
  document.querySelectorAll('[data-clear-workstream]').forEach((el) => el.onclick = () => { state.workstream = null; render(); });
  document.querySelectorAll('[data-open]').forEach((el) => el.onclick = () => openCurrentDoc(el.dataset.open));
  const search = $('.search'); if (search) search.oninput = (e) => { state.query = e.target.value; render(); const next = $('.search'); if (next) next.focus(); };
  document.querySelectorAll('.wikilink').forEach((el) => el.onclick = () => { state.query = el.dataset.target; render(); });
}

(async function init(){
  const res = await fetch('/api/index');
  state.index = await res.json();
  const first = currentDocs()[0] || state.index.docs[0];
  if (first) await loadDoc(first.path); else render();
})();
