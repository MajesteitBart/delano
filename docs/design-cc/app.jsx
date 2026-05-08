const { useState, useEffect, useMemo } = React;

/* ---------------- Icons (hairline, 1.4px stroke) ---------------- */
const Icon = ({ d, size = 16, fill = "none", stroke = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
       strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const I = {
  home:      <><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></>,
  list:      <><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>,
  block:     <><circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/></>,
  trend:     <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
  check:     <><rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M8 12.5l3 3 5-6"/></>,
  warn:      <><path d="M12 3.5 21 19H3z"/><path d="M12 10v4.5"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></>,
  doc:       <><path d="M6 3.5h8l4 4V20.5H6z"/><path d="M14 3.5V8h4"/></>,
  plan:      <><path d="M4 5.5h16"/><path d="M4 12h16"/><path d="M4 18.5h10"/></>,
  scale:     <><path d="M12 4v16"/><path d="M5 8h14"/><path d="M5 8 3 13h4z"/><path d="M19 8l-2 5h4z"/></>,
  clock:     <><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>,
  grid:      <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>,
  task:      <><rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M7 8.5h10"/><path d="M7 13h7"/></>,
  folder:    <><path d="M3.5 6.5a2 2 0 0 1 2-2h3.5l2 2h7.5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/></>,
  gear:      <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
  code:      <><path d="m9 8-5 4 5 4"/><path d="m15 8 5 4-5 4"/></>,
  folderOpen:<><path d="M3 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v1H3z"/><path d="M3 10h18l-2 8a2 2 0 0 1-2 1.5H5a2 2 0 0 1-2-1.5z"/></>,
  user:      <><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/></>,
  chevR:     <path d="m9 6 6 6-6 6"/>,
  chevD:     <path d="m6 9 6 6 6-6"/>,
  chevU:     <path d="m6 15 6-6 6 6"/>,
  arrowL:    <><path d="M19 12H5"/><path d="m12 5-7 7 7 7"/></>,
  lock:      <><rect x="4.5" y="10.5" width="15" height="10" rx="1.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/></>,
  search:    <><circle cx="11" cy="11" r="6"/><path d="m20 20-4.3-4.3"/></>,
  dot:       <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/>,
};

/* ---------------- Status chip ---------------- */
const STATUS_TONE = {
  "Planned":     { dot: "var(--ink-40)" },
  "In Progress": { dot: "var(--accent)" },
  "Complete":    { dot: "var(--ok)" },
  "Blocked":     { dot: "var(--warn)" },
};
const StatusChip = ({ children }) => {
  const tone = STATUS_TONE[children] || STATUS_TONE["Planned"];
  return (
    <span className="chip">
      <span className="chip-dot" style={{ background: tone.dot }} />
      {children}
    </span>
  );
};

/* ---------------- Sidebar ---------------- */
const NAV = [
  { id: "overview",   label: "Overview",     icon: I.home, route: "overview" },
  { id: "current",    label: "Current Work", icon: I.list },
  { id: "blockers",   label: "Blockers",     icon: I.block },
  { id: "progress",   label: "Progress",     icon: I.trend },
  { id: "validation", label: "Validation",   icon: I.check },
  { id: "warnings",   label: "Warnings",     icon: I.warn },
];
const CONTRACTS = [
  { id: "spec",      label: "Spec",         icon: I.doc },
  { id: "plan",      label: "Plan",         icon: I.plan },
  { id: "decisions", label: "Decisions",    icon: I.scale },
  { id: "log",       label: "Progress log", icon: I.clock },
  { id: "ws",        label: "Workstreams",  icon: I.grid, route: "workstream" },
  { id: "tasks",     label: "Tasks",        icon: I.task },
  { id: "evidence",  label: "Evidence",     icon: I.folder },
];

function Sidebar({ route, onNavigate }) {
  const item = (it) => {
    const active = route === it.route;
    return (
      <button
        key={it.id}
        className={"nav-item" + (active ? " is-active" : "")}
        onClick={() => it.route && onNavigate(it.route)}
        type="button"
      >
        <span className="nav-ico"><Icon d={it.icon} size={16} /></span>
        <span>{it.label}</span>
      </button>
    );
  };
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Icon d={<><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 8h6a4 4 0 0 1 0 8H8z"/></>} size={18} stroke="currentColor" /></div>
        <span className="brand-name">Delano</span>
      </div>

      <nav className="nav">
        {NAV.map(item)}
      </nav>

      <div className="nav-section">Source contracts</div>
      <nav className="nav">
        {CONTRACTS.map(item)}
      </nav>

      <div className="sidebar-foot">
        <button className="nav-item" type="button">
          <span className="nav-ico"><Icon d={I.gear} size={16} /></span>
          <span>Project settings</span>
        </button>
      </div>
    </aside>
  );
}

/* ---------------- Topbar ---------------- */
function Topbar() {
  return (
    <header className="topbar">
      <div className="tb-project">
        <span className="tb-title">Keendoc UI Refinement Rollout</span>
        <StatusChip>Planned</StatusChip>
      </div>
      <div className="tb-meta">
        <span>Last updated <strong>May 14, 2025 · 10:24 AM PDT</strong></span>
        <span className="tb-sep" />
        <span className="tb-readonly">
          <Icon d={I.lock} size={13} /> Read-only
        </span>
      </div>
      <div className="tb-actions">
        <button className="btn"><Icon d={I.code} size={14} /> Open in IDE</button>
        <button className="btn"><Icon d={I.folderOpen} size={14} /> Open folder</button>
        <button className="btn btn-primary"><Icon d={I.user} size={14} /> Agent handoff</button>
      </div>
    </header>
  );
}

/* ---------------- Reusable bits ---------------- */
const Field = ({ label, children, mono }) => (
  <div className="field">
    <div className="field-label">{label}</div>
    <div className={"field-value" + (mono ? " mono" : "")}>{children}</div>
  </div>
);

const SectionHeader = ({ title, count, right, collapsible, open, onToggle }) => (
  <div className={"section-head" + (collapsible ? " is-collapsible" : "")}
       onClick={collapsible ? onToggle : undefined}
       role={collapsible ? "button" : undefined}>
    <div className="section-title">
      <span>{title}</span>
      {count != null && <span className="count">{count}</span>}
    </div>
    <div className="section-right">
      {right}
      {collapsible && (
        <span className="caret"><Icon d={open ? I.chevU : I.chevD} size={16} /></span>
      )}
    </div>
  </div>
);

/* ---------------- Overview ---------------- */
const CURRENT_WORK = [
  {
    task: "Implement refined document list and filters",
    workstream: "UI Refinement",
    owner: "Alex Chen",
    status: "In Progress",
    next: "Complete component integration and run visual regression",
    source: "tasks/WS-UI-03-12.md",
  },
  {
    task: "Standardize validation messaging and error states",
    workstream: "UI Refinement",
    owner: "Alex Chen",
    status: "Planned",
    next: "Draft canonical copy with platform writing",
    source: "tasks/WS-UI-04-02.md",
  },
  {
    task: "Search API v2 rate limit policy",
    workstream: "Search & Filtering",
    owner: "Priya Raman",
    status: "Blocked",
    next: "Awaiting platform sign-off on tier limits",
    source: "tasks/WS-SF-01-08.md",
  },
];

const BLOCKERS = [
  {
    blocker: "Design token updates pending from design system team",
    workstream: "UI Refinement",
    impact: "Blocks final visual QA and component theming",
  },
  {
    blocker: "Search API v2 rate limiting not finalized",
    workstream: "Search & Filtering",
    impact: "Limits testing of infinite scroll and bulk actions",
  },
];

const VALIDATION_ITEMS = [
  { name: "Component visual regression suite", workstream: "UI Refinement",     state: "Incomplete" },
  { name: "Accessibility audit (WCAG 2.2 AA)",  workstream: "UI Refinement",     state: "Incomplete" },
  { name: "Empty / no-results state coverage",  workstream: "UI Refinement",     state: "Pass" },
  { name: "Search latency benchmarks",          workstream: "Search & Filtering", state: "Incomplete" },
];

const PROGRESS_ITEMS = [
  { date: "May 14", note: "Refined document list shipped behind feature flag",  by: "Alex Chen" },
  { date: "May 12", note: "Component integration draft reviewed",               by: "Alex Chen" },
  { date: "May 10", note: "Filter control specs approved",                       by: "Priya Raman" },
];

const WARNING_ITEMS = [
  { sev: "Medium", note: "Spec references icon set v1; viewer is on v2",        ws: "UI Refinement" },
  { sev: "Low",    note: "Three subtasks lack source file references",          ws: "UI Refinement" },
  { sev: "Low",    note: "Decision log entry 5/7 missing approver",             ws: "Workstreams"  },
  { sev: "Medium", note: "Search rate limits not finalized",                    ws: "Search & Filtering" },
  { sev: "Low",    note: "Evidence folder contains untracked draft",            ws: "Evidence" },
];

function Overview({ onOpenWorkstream }) {
  const [open, setOpen] = useState({ blockers: true, validation: false, progress: false, warnings: false });
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  return (
    <div className="page">
      <h1 className="page-title">Overview</h1>

      {/* Summary strip */}
      <section className="summary">
        <Field label="Project">Keendoc UI Refinement Rollout</Field>
        <Field label="Status"><StatusChip>Planned</StatusChip></Field>
        <Field label="Health">
          <span className="health">
            <span className="health-bar"><span className="health-fill" style={{ width: "62%" }} /></span>
            <span className="health-label">Incomplete validation evidence</span>
          </span>
        </Field>
        <Field label="Next action">Address validation evidence gaps</Field>
      </section>

      {/* Current Work */}
      <section className="block">
        <SectionHeader title="Current Work" right={<span className="link-muted">View all <Icon d={I.chevR} size={13} /></span>} />
        <div className="table">
          <div className="tr th">
            <div>Task</div>
            <div>Workstream</div>
            <div>Owner</div>
            <div>Status</div>
            <div>Next action</div>
            <div>Source</div>
          </div>
          {CURRENT_WORK.map((row, i) => (
            <div className="tr" key={i}>
              <div className="td-primary">{row.task}</div>
              <div>
                <button className="link" onClick={() => onOpenWorkstream(row.workstream)}>{row.workstream}</button>
              </div>
              <div>
                <span className="avatar">{row.owner.split(" ").map(n=>n[0]).join("")}</span>
                <span className="td-muted-inline">{row.owner}</span>
              </div>
              <div><StatusChip>{row.status}</StatusChip></div>
              <div className="td-muted">{row.next}</div>
              <div className="mono td-muted">{row.source}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Blockers */}
      <section className="block">
        <SectionHeader
          title="Blockers" count={BLOCKERS.length}
          collapsible open={open.blockers} onToggle={() => toggle("blockers")}
        />
        {open.blockers && (
          <div className="table table-3">
            <div className="tr th">
              <div>Blocker</div>
              <div>Workstream</div>
              <div>Impact</div>
            </div>
            {BLOCKERS.map((b, i) => (
              <div className="tr" key={i}>
                <div className="td-primary">
                  <span className="dot dot-warn" /> {b.blocker}
                </div>
                <div>
                  <button className="link" onClick={() => onOpenWorkstream(b.workstream)}>{b.workstream}</button>
                </div>
                <div className="td-muted">{b.impact}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Validation */}
      <section className="block">
        <SectionHeader
          title="Validation" count={VALIDATION_ITEMS.length}
          collapsible open={open.validation} onToggle={() => toggle("validation")}
        />
        {open.validation && (
          <div className="table table-3">
            <div className="tr th">
              <div>Check</div>
              <div>Workstream</div>
              <div>State</div>
            </div>
            {VALIDATION_ITEMS.map((v, i) => (
              <div className="tr" key={i}>
                <div className="td-primary">{v.name}</div>
                <div><button className="link" onClick={() => onOpenWorkstream(v.workstream)}>{v.workstream}</button></div>
                <div>
                  <span className={"chip " + (v.state === "Pass" ? "chip-ok" : "chip-warn")}>
                    <span className="chip-dot" /> {v.state}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Progress */}
      <section className="block">
        <SectionHeader
          title="Progress" count={PROGRESS_ITEMS.length}
          collapsible open={open.progress} onToggle={() => toggle("progress")}
        />
        {open.progress && (
          <div className="timeline">
            {PROGRESS_ITEMS.map((p, i) => (
              <div className="tl-row" key={i}>
                <div className="tl-date mono">{p.date}</div>
                <div className="tl-bullet"><span /></div>
                <div className="tl-body">
                  <div>{p.note}</div>
                  <div className="td-muted small">by {p.by}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Warnings */}
      <section className="block">
        <SectionHeader
          title="Warnings" count={WARNING_ITEMS.length}
          collapsible open={open.warnings} onToggle={() => toggle("warnings")}
        />
        {open.warnings && (
          <div className="table table-3">
            <div className="tr th">
              <div>Severity</div>
              <div>Note</div>
              <div>Source</div>
            </div>
            {WARNING_ITEMS.map((w, i) => (
              <div className="tr" key={i}>
                <div>
                  <span className={"chip " + (w.sev === "Medium" ? "chip-warn" : "chip-low")}>
                    <span className="chip-dot" /> {w.sev}
                  </span>
                </div>
                <div className="td-primary">{w.note}</div>
                <div className="td-muted">{w.ws}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="page-foot mono">
        viewer · read-only · generated from contracts at <span>2025-05-14T10:24-07:00</span>
      </div>
    </div>
  );
}

/* ---------------- Workstream Detail ---------------- */
const SUBTASKS = [
  { name: "Implement refined document list and filters",       status: "In Progress" },
  { name: "Complete component integration and run visual regression", status: "In Progress" },
  { name: "Standardize validation messaging and error states", status: "Planned" },
  { name: "Update empty and no-results states",                status: "Planned" },
  { name: "Accessibility audit and fixes",                     status: "Planned" },
];
const RELATED_WARNINGS = [
  { name: "Search API v2 rate limiting not finalized" },
  { name: "Incomplete validation evidence" },
];
const RELATED_EVIDENCE = [
  { name: "Validation test plan draft" },
];

function WorkstreamDetail({ onBack }) {
  return (
    <div className="page">
      <button className="back" onClick={onBack}>
        <Icon d={I.arrowL} size={14} /> Back to Overview
      </button>
      <div className="ws-eyebrow">Workstream</div>
      <h1 className="page-title">UI Refinement</h1>

      <section className="summary summary-tight">
        <Field label="Status"><StatusChip>In Progress</StatusChip></Field>
        <Field label="Owner">
          <span className="avatar">AC</span>
          <span className="td-muted-inline">Alex Chen</span>
        </Field>
        <Field label="Created">May 5, 2025</Field>
        <Field label="Last updated">May 14, 2025 · 10:24 AM PDT</Field>
      </section>

      <div className="two-col">
        <div className="col-main">
          <Block title="Summary">
            <p>Improve the clarity and consistency of key UI patterns in Keendoc to reduce cognitive load and support faster task completion for operators. Focus on document list, filtering, validation feedback, and empty states.</p>
          </Block>

          <Block title="Goal">
            <p>Deliver a refined, consistent UI that improves operator efficiency and reduces validation errors.</p>
          </Block>

          <Block title="Scope">
            <ul className="bullets">
              <li>Refine document list layout, columns, and filter controls</li>
              <li>Standardize validation feedback and error messaging</li>
              <li>Improve loading, empty, and no-results states</li>
              <li>Update component library for consistent spacing and typography</li>
              <li>Ensure accessibility guidelines (WCAG 2.2 AA)</li>
            </ul>
          </Block>

          <Block title="Tasks">
            <ul className="checklist">
              <li className="done"><span className="cb"><Icon d={<path d="M5 12.5l4 4 10-11"/>} size={11} /></span>Implement refined document list and filters</li>
              <li className="done"><span className="cb"><Icon d={<path d="M5 12.5l4 4 10-11"/>} size={11} /></span>Complete component integration and run visual regression</li>
              <li><span className="cb" /> Standardize validation messaging and error states</li>
              <li><span className="cb" /> Update empty and no-results states</li>
              <li><span className="cb" /> Accessibility audit and fixes</li>
            </ul>
          </Block>

          <Block title="Notes">
            <ul className="bullets">
              <li>Waiting on final validation copy for "Address validation evidence gaps".</li>
              <li>Design system tokens update is in progress (see blocker).</li>
            </ul>
          </Block>

          <Block title="Decisions">
            <ul className="decisions">
              <li>
                <div>Use compact table density for document list</div>
                <div className="td-muted small mono">approved · 2025-05-07</div>
              </li>
              <li>
                <div>Retain icon set v2 for status and validation indicators</div>
                <div className="td-muted small mono">approved · 2025-05-09</div>
              </li>
              <li>
                <div>Do not introduce row reordering in this iteration</div>
                <div className="td-muted small mono">approved · 2025-05-12</div>
              </li>
            </ul>
          </Block>
        </div>

        <aside className="col-side">
          <div className="side-block">
            <div className="side-head">Details</div>
            <dl className="dl">
              <dt>Status</dt><dd><StatusChip>In Progress</StatusChip></dd>
              <dt>Owner</dt><dd><span className="avatar">AC</span><span className="td-muted-inline">Alex Chen</span></dd>
              <dt>Created</dt><dd>May 5, 2025</dd>
              <dt>Updated</dt><dd>May 14, 2025 · 10:24 AM PDT</dd>
              <dt>Source path</dt><dd className="mono small">tasks/WS-UI-03-12.md</dd>
              <dt>Dependencies</dt><dd>Design tokens, API v2 rate limiting</dd>
              <dt>Validation</dt><dd>Incomplete <span className="td-muted-inline">(2 of 4)</span></dd>
            </dl>
          </div>

          <div className="side-block">
            <div className="side-head">
              Subtasks <span className="count">{SUBTASKS.length}</span>
              <span className="link-muted side-link">View all</span>
            </div>
            <ul className="side-list">
              {SUBTASKS.map((s, i) => (
                <li key={i}>
                  <span className="sl-name">{s.name}</span>
                  <span className="sl-right">
                    <StatusChip>{s.status}</StatusChip>
                    <Icon d={I.chevR} size={13} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="side-block">
            <div className="side-head">
              Related warnings <span className="count">{RELATED_WARNINGS.length}</span>
              <span className="link-muted side-link">View all</span>
            </div>
            <ul className="side-list">
              {RELATED_WARNINGS.map((w, i) => (
                <li key={i}>
                  <span className="sl-name"><Icon d={I.warn} size={14} /> {w.name}</span>
                  <Icon d={I.chevR} size={13} />
                </li>
              ))}
            </ul>
          </div>

          <div className="side-block">
            <div className="side-head">
              Related evidence <span className="count">{RELATED_EVIDENCE.length}</span>
              <span className="link-muted side-link">View all</span>
            </div>
            <ul className="side-list">
              {RELATED_EVIDENCE.map((e, i) => (
                <li key={i}>
                  <span className="sl-name"><Icon d={I.doc} size={14} /> {e.name}</span>
                  <Icon d={I.chevR} size={13} />
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

const Block = ({ title, children }) => (
  <section className="ws-block">
    <h3 className="ws-h">{title}</h3>
    <div className="ws-body">{children}</div>
  </section>
);

/* ---------------- App ---------------- */
function App() {
  const [route, setRoute] = useState("overview");
  useEffect(() => { window.scrollTo(0, 0); }, [route]);

  return (
    <div className="app" data-screen-label={route === "overview" ? "01 Overview" : "02 Workstream Detail"}>
      <Sidebar route={route} onNavigate={setRoute} />
      <div className="main">
        <Topbar />
        <div className="content">
          {route === "overview"
            ? <Overview onOpenWorkstream={() => setRoute("workstream")} />
            : <WorkstreamDetail onBack={() => setRoute("overview")} />
          }
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
