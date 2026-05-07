"use strict";

// ═══════════════════════════════════════════════════════════════════════════
// AIDLC DOCS VIEWER · refined
// ═══════════════════════════════════════════════════════════════════════════

const PHASE = {
  overview:     { icon: "○", label: "Overview",     order: 0, key: "overview"     },
  inception:    { icon: "◐", label: "Inception",    order: 1, key: "inception"    },
  construction: { icon: "◑", label: "Construction", order: 2, key: "construction" },
  operations:   { icon: "◓", label: "Operations",   order: 3, key: "operations"   },
  other:        { icon: "◇", label: "Other",        order: 4, key: "other"        },
};
function phaseColorVar(key) { return `var(--ph-${key})`; }
function phaseBgVar(key)    { return `var(--ph-${key}-bg)`; }

const SECTION_ORDER = {
  inception:    ["plans","reverse-engineering","requirements","user-stories",
                 "application-design","units-generation","workflow-planning"],
  construction: ["functional-design","nfr-requirements","nfr-design",
                 "infrastructure-design","code","build-and-test"],
};
const SECTION_LABELS = {
  "reverse-engineering": "Reverse Engineering",
  "nfr-requirements":    "NFR Requirements",
  "nfr-design":          "NFR Design",
  "functional-design":   "Functional Design",
  "infrastructure-design":"Infrastructure Design",
  "user-stories":        "User Stories",
  "application-design":  "Application Design",
  "build-and-test":      "Build & Test",
  "code-generation":     "Code Generation",
  "workflow-planning":   "Workflow Planning",
  "workspace-detection": "Workspace Detection",
  "requirements-analysis":"Requirements Analysis",
  "units-generation":    "Units Generation",
};
const AIDLC_STAGE_ORDER = {
  inception: ["Workspace Detection","Reverse Engineering","Requirements Analysis",
              "User Stories","Workflow Planning","Application Design",
              "Units Planning","Units Generation"],
  construction: ["Functional Design","NFR Requirements","NFR Design",
                 "Infrastructure Design","Code Generation","Build and Test"],
  operations: ["Operations"],
};

function toLabel(slug){ return SECTION_LABELS[slug] || slug.replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase()); }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function escRx(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
function normalizePhaseKey(raw){
  const v = String(raw||"").toLowerCase();
  if (v.includes("inception")) return "inception";
  if (v.includes("construction")) return "construction";
  if (v.includes("operation")) return "operations";
  return null;
}

// ─── State ─────────────────────────────────────────────────────────────────
const state = {
  files: [],
  current: null,
  phaseFilter: "all",
  query: "",
  status: null,
  paletteIdx: 0,
  paletteResults: [],
};

// ─── AIDLC status parsing ──────────────────────────────────────────────────
function parseAidlcStatus(files){
  const stateFile = files.find(f=>f.path==="aidlc-state.md");
  if (!stateFile?.content) return null;
  const c = stateFile.content;
  const currentRaw = c.match(/-\s+\*\*Current Stage\*\*:\s*(.+)/i)?.[1]?.trim() || "";
  const phases = parseStageProgress(c);
  for (const [k,defaults] of Object.entries(AIDLC_STAGE_ORDER)){
    if (!phases[k]) phases[k] = defaults.map(label=>({label,status:"pending"}));
    else {
      const seen = new Set(phases[k].map(i=>i.label.toLowerCase()));
      for (const l of defaults) if (!seen.has(l.toLowerCase())) phases[k].push({label:l,status:"pending"});
    }
  }
  return { currentStageRaw: currentRaw, current: parseCurrentStage(currentRaw, phases), phases };
}
function parseStageProgress(content){
  const phases = {};
  let cur = null;
  for (const line of String(content||"").split("\n")){
    const pm = /^###\s+.*?(INCEPTION|CONSTRUCTION|OPERATIONS)\s+PHASE\s*$/i.exec(line.trim());
    if (pm){ cur = normalizePhaseKey(pm[1]); phases[cur] = phases[cur]||[]; continue; }
    if (/^##\s+/.test(line.trim())){ cur=null; continue; }
    if (!cur) continue;
    const im = /^-\s+\[(x| )\]\s+(.+)$/i.exec(line);
    if (!im) continue;
    const checked = im[1].toLowerCase()==="x";
    const raw = im[2].trim();
    const skipped = /\bSKIP\b/i.test(raw);
    const label = raw.replace(/\s*-\s*SKIP\s*$/i,"").trim();
    phases[cur].push({label,status: checked?"completed":(skipped?"skipped":"pending")});
  }
  return phases;
}
function parseCurrentStage(raw, phases){
  if (!raw) return null;
  const parts = raw.split(/\s+-\s+/);
  const phaseKey = normalizePhaseKey(parts[0]);
  const remainder = parts.slice(1).join(" - ").trim();
  const stages = phaseKey ? (phases[phaseKey]||[]) : [];
  let matched = "", detail = remainder;
  for (const s of stages){
    const rx = new RegExp(`\\b${escRx(s.label)}\\b`,"i");
    const m = rx.exec(remainder);
    if (!m) continue;
    if (s.label.length <= matched.length) continue;
    matched = s.label;
    detail = remainder.slice(0,m.index).concat(remainder.slice(m.index+m[0].length))
             .replace(/^\s*[-:]+\s*|\s*[-:]+\s*$/g,"").trim();
  }
  return {
    phaseKey,
    phaseLabel: phaseKey ? PHASE[phaseKey].label : parts[0],
    stageLabel: matched || remainder || raw,
    detail: detail && detail !== matched ? detail : "",
  };
}
function phaseCounts(stages){
  const total = stages.length;
  const done = stages.filter(s=>s.status==="completed").length;
  return { done, total, pct: total ? Math.round(done/total*100) : 0 };
}

// ─── Pending [Answer] marker counts ────────────────────────────────────────
const ANSWER_RE_GLOBAL = /(^|\n)([ \t]*)\[Answer\]:(.*?)(?=\n|$)/g;
function countPending(file){
  if (!file.content) return 0;
  let pending = 0, total = 0;
  file.content.replace(ANSWER_RE_GLOBAL, (_m,_a,_b,answer)=>{
    total++;
    if (!answer.trim()) pending++;
    return _m;
  });
  return pending;
}
function countTotalAnswers(file){
  if (!file.content) return 0;
  return (file.content.match(/(^|\n)[ \t]*\[Answer\]:/g)||[]).length;
}

// ─── Read tracking (localStorage) ──────────────────────────────────────────
function readKey(){ return "aidlc-read-set"; }
function getReadSet(){
  try { return new Set(JSON.parse(localStorage.getItem(readKey())||"[]")); }
  catch(_) { return new Set(); }
}
function markRead(path){
  const s = getReadSet(); s.add(path);
  try { localStorage.setItem(readKey(), JSON.stringify([...s])); } catch(_){}
}

// ─── Theme ─────────────────────────────────────────────────────────────────
function initTheme(){
  const saved = localStorage.getItem("aidlc-theme");
  const t = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = t;
  document.getElementById("theme-toggle").addEventListener("click", ()=>{
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("aidlc-theme", next); } catch(_){}
  });
}

// ─── BOOT ──────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  if (window.mermaid) mermaid.initialize({ startOnLoad:false, theme:"default", securityLevel:"loose" });
  marked.use({ gfm:true, breaks:false });

  if (typeof window.AIDLC_MANIFEST === "undefined"){
    showError("manifest.js not found",
      "Run the generator first:<br><code>python aidlc-docs/_docs-viewer/generate-manifest.py</code>");
    return;
  }
  const M = window.AIDLC_MANIFEST;
  state.files = M.files || [];
  state.status = parseAidlcStatus(state.files);

  document.title = M.title || "AIDLC Docs";
  document.getElementById("site-title").textContent = M.title || "AIDLC Docs";
  document.getElementById("file-count").textContent = state.files.length + " documents";
  if (M.generated){
    const d = new Date(M.generated);
    const time = d.toLocaleString(undefined,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
    document.getElementById("gen-time").textContent = "Updated " + time;
  }

  if (state.files.length === 0){
    showError("No documents found", "The docs folder is empty or no .md files matched.");
    return;
  }

  renderTopbarStatus();
  renderPhaseRail();
  renderNav();
  bindNavScrollSpy();

  const navigate = () => {
    const hash = decodeURIComponent(location.hash.replace(/^#/,""));
    if (!hash || hash === "_home") { renderHome("guide"); return; }
    if (hash === "_status") { renderHome("status"); return; }
    const f = state.files.find(x=>x.path===hash);
    if (f) navigateTo(f); else renderHome("guide");
  };
  window.addEventListener("hashchange", navigate);
  navigate();

  bindPalette();
  bindGlobalShortcuts();
  bindSidebarToggle();
  bindReadProgress();
  bindHomeLink();
  connectLiveReload();
});

// ─── TOPBAR STATUS ─────────────────────────────────────────────────────────
function renderTopbarStatus(){
  const el = document.getElementById("topbar-status");
  if (!state.status?.current){ el.hidden = true; return; }
  const c = state.status.current;
  const k = c.phaseKey || "overview";
  el.hidden = false;
  el.style.setProperty("--ph-color", phaseColorVar(k));
  el.innerHTML =
    `<span class="tb-status-dot"></span>` +
    `<span class="tb-status-text">${esc(c.stageLabel)}</span>` +
    `<span class="tb-status-sub">· ${esc(c.phaseLabel)}</span>`;
}

// ─── PHASE RAIL ────────────────────────────────────────────────────────────
function renderPhaseRail(){
  const rail = document.getElementById("phase-rail");
  rail.innerHTML = "";
  const counts = {};
  for (const f of state.files){
    const k = f.phase || "overview";
    counts[k] = (counts[k]||0) + 1;
  }
  const allBtn = document.createElement("button");
  allBtn.className = "rail-pill" + (state.phaseFilter==="all" ? " active":"");
  allBtn.style.setProperty("--ph-color", "var(--accent)");
  allBtn.style.setProperty("--ph-bg", "var(--accent-soft)");
  allBtn.innerHTML = `<span class="rail-pill-dot"></span>All<span class="rail-pill-count">${state.files.length}</span>`;
  allBtn.onclick = ()=>{ state.phaseFilter="all"; renderPhaseRail(); renderNav(); };
  rail.appendChild(allBtn);

  const sep = document.createElement("div"); sep.className="rail-sep"; rail.appendChild(sep);

  for (const k of ["overview","inception","construction","operations","other"]){
    if (!counts[k]) continue;
    const b = document.createElement("button");
    b.className = "rail-pill" + (state.phaseFilter===k ? " active":"");
    b.style.setProperty("--ph-color", phaseColorVar(k));
    b.style.setProperty("--ph-bg", phaseBgVar(k));
    const stages = state.status?.phases?.[k];
    const pct = stages ? phaseCounts(stages).pct : null;
    const meta = pct !== null ? `${pct}%` : counts[k];
    b.innerHTML = `<span class="rail-pill-dot"></span>${PHASE[k].label}<span class="rail-pill-count">${meta}</span>`;
    b.onclick = ()=>{ state.phaseFilter = state.phaseFilter===k ? "all" : k; renderPhaseRail(); renderNav(); };
    rail.appendChild(b);
  }
}

// ─── NAVIGATION ────────────────────────────────────────────────────────────
function renderNav(){
  const groups = {};
  for (const f of state.files){
    const parts = f.path.split("/");
    const phase = parts.length===1 ? "overview" : parts[0];
    if (state.phaseFilter!=="all" && phase!==state.phaseFilter) continue;
    const sec = parts.length>=3 ? parts[1] : "__root__";
    const sub = parts.length>=4 ? parts[2] : "__root__";
    (groups[phase] = groups[phase]||{});
    (groups[phase][sec] = groups[phase][sec]||{});
    (groups[phase][sec][sub] = groups[phase][sec][sub]||[]).push(f);
  }
  const nav = document.getElementById("nav");
  nav.innerHTML = "";
  const order = ["overview","inception","construction","operations","other"];
  const phases = [...new Set([...order, ...Object.keys(groups)])].filter(p=>groups[p]);
  for (const p of phases) nav.appendChild(buildPhaseEl(p, groups[p]));
  highlightActive();
}

function buildPhaseEl(phase, sections){
  const wrap = document.createElement("div");
  wrap.className = "nav-phase";
  wrap.dataset.phase = phase;
  wrap.style.setProperty("--ph-color", phaseColorVar(phase));
  wrap.style.setProperty("--ph-bg", phaseBgVar(phase));

  const stages = state.status?.phases?.[phase];
  const cnt = stages ? phaseCounts(stages) : null;

  const hd = document.createElement("div");
  hd.className = "nav-phase-hd";
  hd.innerHTML =
    `<span class="nav-phase-icon">${PHASE[phase].icon}</span>` +
    `<span class="nav-phase-label">${PHASE[phase].label}</span>` +
    (cnt ? `<span class="nav-phase-progress"><span class="nav-phase-progress-fill" style="width:${cnt.pct}%"></span></span>` +
           `<span class="nav-phase-progress-meta">${cnt.done}/${cnt.total}</span>` : "") +
    `<span class="nav-phase-arr"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>`;
  hd.onclick = ()=> wrap.classList.toggle("closed");
  wrap.appendChild(hd);

  const bd = document.createElement("div");
  bd.className = "nav-phase-bd";
  wrap.appendChild(bd);

  const root = sections["__root__"];
  if (root && root["__root__"]) for (const f of root["__root__"]) bd.appendChild(makeItem(f));

  const secOrder = SECTION_ORDER[phase] || [];
  const secKeys = [...new Set([...secOrder, ...Object.keys(sections).filter(s=>s!=="__root__")])];
  for (const sec of secKeys){
    if (!sections[sec]) continue;
    bd.appendChild(buildSectionEl(sec, sections[sec]));
  }
  return wrap;
}

function buildSectionEl(sec, subsections){
  const wrap = document.createElement("div");
  wrap.className = "nav-sec";
  wrap.dataset.section = sec;
  const hd = document.createElement("div");
  hd.className = "nav-sec-hd";
  hd.innerHTML =
    `<span class="nav-sec-arr"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>` +
    `<span>${esc(toLabel(sec))}</span>`;
  hd.onclick = ()=> wrap.classList.toggle("closed");
  wrap.appendChild(hd);
  const bd = document.createElement("div");
  bd.className = "nav-sec-bd";
  wrap.appendChild(bd);
  if (subsections["__root__"]) for (const f of subsections["__root__"]) bd.appendChild(makeItem(f));
  for (const [sub,files] of Object.entries(subsections)){
    if (sub==="__root__") continue;
    const subWrap = document.createElement("div");
    subWrap.className = "nav-sec";
    const subHd = document.createElement("div");
    subHd.className = "nav-sec-hd";
    subHd.style.paddingLeft = "36px";
    subHd.innerHTML =
      `<span class="nav-sec-arr"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>` +
      `<span>${esc(toLabel(sub))}</span>`;
    subHd.onclick = ()=> subWrap.classList.toggle("closed");
    subWrap.appendChild(subHd);
    const subBd = document.createElement("div");
    subBd.className = "nav-sec-bd";
    for (const f of files) subBd.appendChild(makeItem(f));
    subWrap.appendChild(subBd);
    bd.appendChild(subWrap);
  }
  return wrap;
}

function makeItem(file){
  const a = document.createElement("a");
  a.className = "nav-item";
  a.href = "#" + encodeURIComponent(file.path);
  a.dataset.path = file.path;
  const pending = countPending(file);
  const isRead = getReadSet().has(file.path);
  if (isRead) a.classList.add("is-read");
  a.innerHTML =
    `<span class="nav-item-read"></span>` +
    `<span class="nav-item-text">${esc(file.title)}</span>` +
    (pending ? `<span class="nav-item-pending" title="${pending} pending answer${pending>1?"s":""}"></span>` : "");
  return a;
}

function highlightActive(){
  const path = state.current?.path;
  document.querySelectorAll(".nav-item").forEach(el=>{
    el.classList.toggle("active", el.dataset.path===path);
  });
  if (!path) return;
  const active = document.querySelector(`.nav-item[data-path="${CSS.escape(path)}"]`);
  if (!active) return;
  let p = active.parentElement;
  while (p && p.id!=="nav"){
    if (p.classList.contains("nav-phase") || p.classList.contains("nav-sec")) p.classList.remove("closed");
    p = p.parentElement;
  }
  active.scrollIntoView({block:"nearest"});
}

// ─── BREADCRUMBS ───────────────────────────────────────────────────────────
function renderBreadcrumbs(file){
  const el = document.getElementById("breadcrumbs");
  if (!file){ el.innerHTML = ""; return; }
  const phase = file.phase || "overview";
  const parts = file.path.split("/");
  const items = [];
  items.push(`<span class="tb-crumb" data-action="home"><span class="tb-crumb-phase-dot"></span>Home</span>`);
  if (parts.length > 1){
    items.push(`<span class="tb-crumb-sep">›</span>`);
    items.push(`<span class="tb-crumb" data-phase="${phase}" style="--phase-color:${phaseColorVar(phase)}"><span class="tb-crumb-phase-dot" style="background:${phaseColorVar(phase)}"></span>${esc(PHASE[phase].label)}</span>`);
    if (parts.length > 2){
      items.push(`<span class="tb-crumb-sep">›</span>`);
      items.push(`<span class="tb-crumb">${esc(toLabel(parts[1]))}</span>`);
    }
  }
  items.push(`<span class="tb-crumb-sep">›</span>`);
  items.push(`<span class="tb-crumb tb-crumb-current">${esc(file.title)}</span>`);
  el.innerHTML = items.join("");
  el.querySelector('[data-action="home"]')?.addEventListener("click", ()=>{ location.hash = "#_home"; });
  el.querySelector('[data-phase]')?.addEventListener("click", (e)=>{
    state.phaseFilter = e.currentTarget.dataset.phase;
    renderPhaseRail(); renderNav();
  });
}

// ─── DOC RENDERING ─────────────────────────────────────────────────────────
function navigateTo(file){
  if (!file) return;
  state.current = file;
  const newHash = "#" + encodeURIComponent(file.path);
  if (location.hash !== newHash) history.replaceState(null,"",newHash);
  highlightActive();
  if (window.innerWidth <= 760){
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebar-backdrop")?.classList.remove("show");
  }
  renderDoc(file);
  setTimeout(()=>{ markRead(file.path); document.querySelector(`.nav-item[data-path="${CSS.escape(file.path)}"]`)?.classList.add("is-read"); }, 1500);
}

function normalizeInlineOptions(md){
  const lines = (md||"").split("\n");
  let inFence = false;
  return lines.map((line, idx)=>{
    if (/^\s*```/.test(line)){ inFence = !inFence; return line; }
    if (inFence) return line;
    const trimmed = line.trimStart();
    if (!/^[A-Z]\)\s+/.test(trimmed)) return line;
    const indent = line.slice(0, line.length-trimmed.length);
    const parts = /\s+[A-Z]\)\s+/.test(trimmed) ? trimmed.split(/\s+(?=[A-Z]\)\s+)/) : [trimmed];
    if (parts.length>1) return parts.map(p=>indent+p+"  ").join("\n");
    const next = lines[idx+1]?.trimStart()||"";
    if (/^[A-Z]\)\s+/.test(next)) return line+"  ";
    return line;
  }).join("\n");
}
const STANDALONE_ANSWER_RE = /(^|\n)([ \t]*)\[Answer\]:(.*?)(?=\n|$)/g;
function extractAnswerFields(md){
  const fields = [];
  md.replace(STANDALONE_ANSWER_RE, (_m,_a,_b,answer)=>{ fields.push({value:answer.trim()}); return _m; });
  return fields;
}
function injectAnswerPlaceholders(md){
  let i=0;
  return md.replace(STANDALONE_ANSWER_RE, (_m,ls)=>{
    const ph = `<div class="answer-field-slot" data-answer-idx="${i}"></div>`;
    i++;
    return `${ls}${ph}`;
  });
}

async function renderDoc(file){
  const phase = file.phase || "overview";
  const normalized = normalizeInlineOptions(file.content || "");
  const answerFields = extractAnswerFields(file.content || "");
  const renderContent = answerFields.length ? injectAnswerPlaceholders(normalized) : normalized;
  const html = marked.parse(renderContent);

  const panel = document.getElementById("doc-panel");
  const idx = state.files.indexOf(file);
  const prev = idx > 0 ? state.files[idx-1] : null;
  const next = idx < state.files.length-1 ? state.files[idx+1] : null;
  const totalAns = countTotalAnswers(file);
  const pendingAns = countPending(file);

  panel.innerHTML =
    `<header class="doc-hdr" style="--ph-color:${phaseColorVar(phase)};--ph-bg:${phaseBgVar(phase)}">
       <div class="doc-hdr-meta">
         <span class="doc-phase-pill"><span class="doc-phase-pill-dot"></span>${esc(PHASE[phase].label)}</span>
         ${totalAns ? `<span class="doc-meta-pill ${pendingAns?"warn":""}">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${pendingAns?'<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/>':'<polyline points="20 6 9 17 4 12"/>'}</svg>
            ${pendingAns?`${pendingAns} pending answer${pendingAns>1?"s":""}`:`${totalAns} answer${totalAns>1?"s":""} complete`}</span>` : ""}
       </div>
       <h1 class="doc-title">${esc(file.title)}</h1>
       <div class="doc-path"><span class="doc-path-icon"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>${esc(file.path)}</div>
       <div class="doc-actions">
         <button class="doc-action-btn" id="doc-prev" ${prev?"":"disabled"}>
           <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Previous
         </button>
         <button class="doc-action-btn" id="doc-next" ${next?"":"disabled"}>
           Next <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
         </button>
       </div>
     </header>
     <article class="doc-body">${html}</article>`;

  document.getElementById("doc-prev")?.addEventListener("click", ()=>{ if (prev) location.hash = "#"+encodeURIComponent(prev.path); });
  document.getElementById("doc-next")?.addEventListener("click", ()=>{ if (next) location.hash = "#"+encodeURIComponent(next.path); });

  if (window.mermaid){
    let i = 0;
    for (const codeEl of [...panel.querySelectorAll("pre code.language-mermaid")]){
      const pre = codeEl.closest("pre");
      const src = codeEl.textContent;
      const wrap = document.createElement("div");
      wrap.className = "mermaid-wrap";
      try {
        const id = "md-" + Date.now() + "-" + (i++);
        const { svg } = await mermaid.render(id, src);
        wrap.innerHTML = svg;
      } catch(e){
        wrap.innerHTML = `<div class="mermaid-err">Diagram parse error</div><pre class="mermaid-src"><code>${esc(src)}</code></pre>`;
      }
      pre.replaceWith(wrap);
    }
  }
  panel.querySelectorAll("pre code:not(.language-mermaid)").forEach(b=>{
    if (!b.classList.contains("hljs")) hljs.highlightElement(b);
  });

  const docBody = panel.querySelector(".doc-body");
  if (docBody && answerFields.length > 0){
    const cnt = processAnswerMarkers(docBody, file, answerFields);
    if (cnt > 0){
      const actions = panel.querySelector(".doc-actions");
      const btn = document.createElement("button");
      btn.className = "doc-action-btn primary";
      const has = /\[Answer\]:\s*\S/.test(file.content||"");
      btn.dataset.label = has ? "Update answers" : "Save answers";
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> ${btn.dataset.label}`;
      btn.onclick = ()=> saveAnswers(file, docBody, btn);
      actions.appendChild(btn);
    }
  }

  renderBreadcrumbs(file);
  document.getElementById("content-wrap").scrollTo({top:0});
  buildTOC(panel);
  state.lastRender = Date.now();
}

// ─── ANSWER FIELDS ─────────────────────────────────────────────────────────
function processAnswerMarkers(docBody, file, answerFields){
  const slots = [...docBody.querySelectorAll(".answer-field-slot")];
  if (!slots.length) return 0;
  let drafts = [];
  try { drafts = JSON.parse(localStorage.getItem("aidlc-ans-"+file.path)||"[]"); } catch(_){}
  slots.forEach((slot, idx)=>{
    const existing = answerFields[idx]?.value || "";
    const value = drafts[idx] !== undefined ? drafts[idx] : existing;
    const field = document.createElement("div");
    field.className = "answer-field" + (value ? " has-value" : "");
    const lbl = document.createElement("div");
    lbl.className = "answer-lbl";
    lbl.innerHTML = `<span class="answer-lbl-svg"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span><span>Your answer</span>`;
    field.appendChild(lbl);
    const ta = document.createElement("textarea");
    ta.className = "answer-ta";
    ta.dataset.idx = idx;
    ta.value = value;
    ta.placeholder = "Type your answer here…";
    ta.rows = Math.max(1, (value||"").split("\n").length);
    const autosize = ()=>{ ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; };
    ta.addEventListener("input", ()=>{
      autosize();
      field.classList.toggle("has-value", ta.value.trim().length > 0);
      persistDrafts(file.path, docBody);
    });
    requestAnimationFrame(autosize);
    field.appendChild(ta);
    slot.replaceWith(field);
  });
  return slots.length;
}
function persistDrafts(path, body){
  const v = [...body.querySelectorAll(".answer-ta")].map(t=>t.value);
  try { localStorage.setItem("aidlc-ans-"+path, JSON.stringify(v)); } catch(_){}
}
function rebuildMarkdown(orig, answers){
  const STANDALONE = /(^|\n)([ \t]*)\[Answer\]:/;
  let out = orig, from = 0;
  for (const a of answers){
    const slice = out.slice(from);
    const m = STANDALONE.exec(slice);
    if (!m) break;
    const pos = from + m.index + m[1].length + m[2].length;
    const lineEnd = out.indexOf("\n", pos);
    const end = lineEnd === -1 ? out.length : lineEnd;
    const newLine = "[Answer]: " + a;
    out = out.slice(0,pos) + newLine + out.slice(end);
    from = pos + newLine.length;
  }
  return out;
}
async function saveAnswers(file, docBody, btn){
  const answers = [...docBody.querySelectorAll(".answer-ta")].map(t=>t.value);
  const updated = rebuildMarkdown(file.content, answers);
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner" style="width:12px;height:12px;border-width:2px"></div> Saving…`;
  try {
    const res = await fetch("/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:file.path,content:updated})});
    if (res.ok){
      try { localStorage.removeItem("aidlc-ans-"+file.path); } catch(_){}
      file.content = updated;
      btn.classList.remove("primary"); btn.classList.add("ok");
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved`;
      docBody.querySelector(".save-notice")?.remove();
      setTimeout(()=>{
        btn.disabled = false; btn.classList.remove("ok"); btn.classList.add("primary");
        btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> ${btn.dataset.label}`;
      }, 2000);
      return;
    }
  } catch(_){}
  btn.disabled = false;
  btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> ${btn.dataset.label}`;
  showSaveNotice(docBody, file, updated);
}
function showSaveNotice(docBody, file, updated){
  if (docBody.querySelector(".save-notice")) return;
  const fname = file.path.split("/").pop();
  const n = document.createElement("div");
  n.className = "save-notice";
  n.innerHTML = `<strong>Para salvar direto no disco</strong>, rode: <code>python aidlc-docs/_docs-viewer/save-server.py</code> e abra <code>http://localhost:8765</code>.
    <div class="save-notice-actions">
      <button class="doc-action-btn" data-act="dl">Baixar arquivo</button>
      <button class="doc-action-btn" data-act="close">Fechar</button>
    </div>`;
  n.querySelector('[data-act="dl"]').onclick = ()=>{
    const blob = new Blob([updated],{type:"text/markdown;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"),{href:url,download:fname}).click();
    URL.revokeObjectURL(url);
    n.remove();
  };
  n.querySelector('[data-act="close"]').onclick = ()=> n.remove();
  docBody.prepend(n);
}

// ─── TOC + scroll spy ─────────────────────────────────────────────────────
function buildTOC(panel){
  const toc = document.getElementById("toc-panel");
  const headings = panel.querySelectorAll(".doc-body h2, .doc-body h3, .doc-body h4");
  if (headings.length < 3){ toc.hidden = true; return; }
  toc.hidden = false;
  toc.innerHTML = `<div class="toc-hd">On this page</div>`;
  headings.forEach((h, i)=>{
    h.id = h.id || ("h-"+i);
    const a = document.createElement("a");
    a.className = "toc-link toc-"+h.tagName.toLowerCase();
    a.textContent = h.textContent;
    a.dataset.target = h.id;
    a.onclick = (e)=>{ e.preventDefault(); h.scrollIntoView({behavior:"smooth",block:"start"}); };
    toc.appendChild(a);
  });
}

let _scrollSpyRaf = null;
function bindNavScrollSpy(){
  const wrap = document.getElementById("content-wrap");
  wrap.addEventListener("scroll", ()=>{
    if (_scrollSpyRaf) cancelAnimationFrame(_scrollSpyRaf);
    _scrollSpyRaf = requestAnimationFrame(()=>{
      const heads = [...document.querySelectorAll(".doc-body h2, .doc-body h3, .doc-body h4")];
      if (!heads.length) return;
      const scrollTop = wrap.scrollTop + 80;
      let active = heads[0];
      for (const h of heads){ if (h.offsetTop <= scrollTop) active = h; else break; }
      document.querySelectorAll(".toc-link").forEach(l=>{
        l.classList.toggle("active", l.dataset.target === active.id);
      });
    });
  });
}

function bindReadProgress(){
  const wrap = document.getElementById("content-wrap");
  const bar = document.getElementById("read-progress-bar");
  wrap.addEventListener("scroll", ()=>{
    const max = wrap.scrollHeight - wrap.clientHeight;
    const pct = max > 0 ? (wrap.scrollTop / max) * 100 : 0;
    bar.style.width = pct + "%";
  });
}

// ─── HOME (Guide + Status views) ───────────────────────────────────────────
function renderHome(view){
  state.current = null;
  highlightActive();
  const v = view || "guide";

  // Breadcrumbs: Home › Guide / Status
  const crumbs = document.getElementById("breadcrumbs");
  crumbs.innerHTML =
    `<span class="tb-crumb tb-crumb-current"><span class="tb-crumb-phase-dot" style="background:var(--accent)"></span>Home</span>` +
    `<span class="tb-crumb-sep">›</span>` +
    `<span class="tb-crumb${v==="guide"?" tb-crumb-current":""}" data-view="guide">Guide</span>` +
    `<span class="tb-crumb-sep">·</span>` +
    `<span class="tb-crumb${v==="status"?" tb-crumb-current":""}" data-view="status">Status</span>`;
  crumbs.querySelectorAll('[data-view]').forEach(el=>{
    el.addEventListener("click", ()=>{ location.hash = el.dataset.view==="guide" ? "#_home" : "#_status"; });
  });

  if (v === "guide") return renderGuide();
  return renderDashboard();
}

function renderGuide(){
  const panel = document.getElementById("doc-panel");
  document.getElementById("toc-panel").hidden = true;
  panel.innerHTML = `
    <div class="home-tabs">
      <a class="home-tab active" href="#_home">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        Guide
      </a>
      <a class="home-tab" href="#_status">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><polyline points="7 14 11 10 14 13 21 6"/></svg>
        Project status
      </a>
    </div>
    <div id="guide-host" class="guide-host"><div class="guide-loading"><div class="spinner"></div><span>Loading guide…</span></div></div>
  `;
  loadGuideShadow();
  document.getElementById("content-wrap").scrollTo({top:0});
}

async function loadGuideShadow(){
  const host = document.getElementById("guide-host");
  if (!host) return;
  try {
    let html = window._guideHTML;
    if (!html){
      const r = await fetch("aidlc-guide.html");
      html = await r.text();
      window._guideHTML = html;
    }
    const doc = new DOMParser().parseFromString(html, "text/html");
    // Scope `:root` to `:host` so custom properties land inside the shadow tree
    const styles = [...doc.querySelectorAll("style")]
      .map(s => s.textContent.replace(/:root\b/g, ":host"))
      .join("\n");
    const bodyHTML = doc.body.innerHTML;
    host.innerHTML = "";
    const shadow = host.attachShadow ? host.attachShadow({mode:"open"}) : host;
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      :host { display: block; }
      /* Override guide nav sticky — let the host scroll naturally */
      nav { position: static !important; }
      .cover { padding: 56px 32px 48px !important; }
      .cover h1 { font-size: 48px !important; }
      ${styles}
    `;
    const themeEl = document.createElement("style");
    themeEl.id = "__guide-theme";
    const wrap = document.createElement("div");
    wrap.innerHTML = bodyHTML;
    shadow.appendChild(styleEl);
    shadow.appendChild(themeEl);
    shadow.appendChild(wrap);
    host._shadow = shadow;
    applyGuideShadowTheme(document.documentElement.dataset.theme || "light");

    // Re-route in-shadow anchor links to scroll within the parent scroll container
    shadow.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener("click",(e)=>{
        const id = a.getAttribute("href").slice(1);
        const target = shadow.getElementById(id) || shadow.querySelector(`[id="${id}"]`);
        if (target){
          e.preventDefault();
          const wrap = document.getElementById("content-wrap");
          const r = target.getBoundingClientRect();
          const hr = host.getBoundingClientRect();
          wrap.scrollTo({ top: wrap.scrollTop + r.top - hr.top - 60, behavior:"smooth" });
        }
      });
    });

    if (!window._guideThemeObs){
      const obs = new MutationObserver(()=>{
        applyGuideShadowTheme(document.documentElement.dataset.theme || "light");
      });
      obs.observe(document.documentElement, { attributes:true, attributeFilter:["data-theme"] });
      window._guideThemeObs = obs;
    }
  } catch(err){
    host.innerHTML = `<div class="guide-loading">Failed to load guide.</div>`;
  }
}

const GUIDE_DARK_CSS = `
  :host, body { background: transparent !important; color: #e8eaf0 !important; }
  body { color: #c9cdd6 !important; }
  nav { background: #11141c !important; border-bottom: 1px solid #2a2f3a; }
  nav strong { color: #e8eaf0 !important; }
  nav a { color: #8fb3ff !important; }
  nav a:hover { color: #fff !important; }
  .cover { background: linear-gradient(135deg, #1a2540 0%, #1e3a72 100%) !important; }
  .badge { background: rgba(255,255,255,.08) !important; border-color: rgba(255,255,255,.15) !important; }
  h2.phase-title.blue { background:#1c2c4a !important; color:#9bbcff !important; border-left-color:#5a8bd6 !important; }
  h2.phase-title.green { background:#163326 !important; color:#7fdca5 !important; border-left-color:#4ea877 !important; }
  h2.phase-title.amber { background:#3a2d12 !important; color:#f0c068 !important; border-left-color:#b8893d !important; }
  h2.phase-title.dark { background:#222630 !important; color:#9bb8de !important; border-left-color:#5a7caa !important; }
  h3.sub-title { color: #9bb8de !important; }
  p, p.intro, li { color: #c9cdd6 !important; }
  .phase-card { border-color:#2a2f3a !important; box-shadow: 0 1px 4px rgba(0,0,0,.4) !important; background:#1c1f27 !important; }
  .phase-card-header.blue { background:#2a52a8 !important; }
  .phase-card-header.green { background:#2d6e4a !important; }
  .phase-card-header.amber { background:#8a6520 !important; }
  .phase-card-header.gray { background:#3a3f4a !important; }
  .card-label { background:#222630 !important; color:#c9cdd6 !important; border-color:#2a2f3a !important; }
  .card-value { background:#1c1f27 !important; color:#dde0e6 !important; border-color:#2a2f3a !important; }
  .card-label.purpose { background:#172238 !important; }
  .card-label.gate-in { background:#2e2818 !important; }
  .card-label.gate-out { background:#2a1f15 !important; }
  .card-label.artifacts { background:#0f2419 !important; }
  .card-label.roles { background:#241c34 !important; }
  .overview-table, .summary-table { box-shadow: 0 1px 3px rgba(0,0,0,.4) !important; }
  .overview-table th, .summary-table th { background:#1a2540 !important; color:#dde0e6 !important; }
  .overview-table td, .summary-table td { background:#1c1f27 !important; color:#c9cdd6 !important; border-color:#2a2f3a !important; }
  .overview-table tr.blue-row td { background:#172238 !important; }
  .overview-table tr.green-row td { background:#0f2419 !important; }
  .overview-table tr.amber-row td { background:#1f1a0d !important; }
  .overview-table tr:hover td, .summary-table tr:hover td { filter: brightness(1.15) !important; }
`;

function applyGuideShadowTheme(theme){
  const host = document.getElementById("guide-host");
  if (!host?._shadow) return;
  const el = host._shadow.getElementById("__guide-theme");
  if (!el) return;
  el.textContent = theme === "dark" ? GUIDE_DARK_CSS : "";
}

function renderDashboard(){
  document.getElementById("breadcrumbs"); // already set by renderHome
  const panel = document.getElementById("doc-panel");
  const toc = document.getElementById("toc-panel");
  toc.hidden = true;

  const status = state.status;
  const cur = status?.current;
  const curKey = cur?.phaseKey || "overview";

  const allStages = status ? Object.values(status.phases).flat() : [];
  const overall = phaseCounts(allStages.length ? allStages : [{status:"completed"}]);

  const totalAnswers = state.files.reduce((s,f)=>s+countTotalAnswers(f),0);
  const pendingAnswers = state.files.reduce((s,f)=>s+countPending(f),0);
  const readSet = getReadSet();
  const readCount = state.files.filter(f=>readSet.has(f.path)).length;

  const recent = [...state.files].slice(0,8);
  const pendingDocs = state.files.filter(f=>countPending(f)>0).slice(0,5);

  panel.innerHTML = `
    <div class="home-tabs">
      <a class="home-tab" href="#_home">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        Guide
      </a>
      <a class="home-tab active" href="#_status">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><polyline points="7 14 11 10 14 13 21 6"/></svg>
        Project status
      </a>
    </div>
    <div class="dash">
      <section class="dash-hero" style="--ph-color:${phaseColorVar(curKey)};--ph-bg:${phaseBgVar(curKey)}">
        <div class="dash-eyebrow"><span class="dash-eyebrow-dot"></span>${cur?`Currently in ${esc(cur.phaseLabel)}`:"AI Development Lifecycle"}</div>
        <h1 class="dash-h1">${cur?esc(cur.stageLabel):"AIDLC Documentation"}</h1>
        <p class="dash-sub">${cur?esc(cur.detail||"Workflow status, generated artifacts, and pending decisions for this project."):"Browse the artifacts produced by your AIDLC workflow — phases, units of work, decisions, and pending answers."}</p>
        ${status?`
          <div class="dash-progress-wrap">
            <div class="dash-progress-track"><div class="dash-progress-fill" style="width:${overall.pct}%"></div></div>
            <div class="dash-progress-meta"><strong>${overall.pct}%</strong> · ${overall.done} of ${overall.total} stages</div>
          </div>`:""}
      </section>

      <div class="dash-stats">
        <div class="dash-stat"><div class="dash-stat-label">Documents</div><div class="dash-stat-value">${state.files.length}</div></div>
        <div class="dash-stat"><div class="dash-stat-label">Read</div><div class="dash-stat-value">${readCount}<span class="dash-stat-value-sub">/ ${state.files.length}</span></div></div>
        <div class="dash-stat"><div class="dash-stat-label">Answers</div><div class="dash-stat-value">${totalAnswers-pendingAnswers}<span class="dash-stat-value-sub">/ ${totalAnswers}</span></div></div>
        <div class="dash-stat"><div class="dash-stat-label">Pending</div><div class="dash-stat-value">${pendingAnswers}</div></div>
      </div>

      ${status ? `<section class="dash-section">
        <div class="dash-section-hd">
          <div class="dash-section-title">AIDLC Journey</div>
          <div class="dash-section-rule"></div>
        </div>
        <div class="dash-timeline">
          ${["inception","construction","operations"].map(k=>renderPhaseCard(k, status.phases[k]||[], cur)).join("")}
        </div>
      </section>` : ""}

      <section class="dash-focus">
        <div class="dash-card">
          <div class="dash-card-title" style="--ph-color:${phaseColorVar(curKey)}">
            <span class="dash-card-title-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
            Recently updated
          </div>
          <div class="dash-recent">
            ${recent.map(f=>{
              const ph = f.phase||"overview";
              return `<a class="dash-recent-item" href="#${encodeURIComponent(f.path)}">
                <span class="dash-recent-dot" style="background:${phaseColorVar(ph)}"></span>
                <span class="dash-recent-title">${esc(f.title)}</span>
                <span class="dash-recent-phase">${esc(PHASE[ph].label)}</span>
              </a>`;
            }).join("")}
          </div>
        </div>
        <div class="dash-card">
          <div class="dash-card-title">
            <span class="dash-card-title-icon" style="color:var(--state-skipped)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><circle cx="12" cy="12" r="10"/><path d="M12 16h.01"/></svg></span>
            Pending answers
          </div>
          ${pendingDocs.length ? `<div class="dash-pending">
            ${pendingDocs.map(f=>`<a class="dash-pending-item" href="#${encodeURIComponent(f.path)}">
              <span class="dash-pending-icon">${countPending(f)}</span>
              <span class="dash-pending-title">${esc(f.title)}</span>
            </a>`).join("")}
          </div>` : `<p style="color:var(--text-muted);font-size:13px">All answers complete. ✓</p>`}
        </div>
      </section>
    </div>
  `;
  document.getElementById("content-wrap").scrollTo({top:0});
}

function renderPhaseCard(key, stages, current){
  if (!stages.length) return "";
  const cnt = phaseCounts(stages);
  const isCurrent = current?.phaseKey === key;
  const isDone = cnt.pct === 100;
  const cardClass = isCurrent ? "is-current" : (isDone ? "is-done" : "");
  return `<div class="dash-phase-card ${cardClass}" style="--ph-color:${phaseColorVar(key)};--ph-bg:${phaseBgVar(key)}">
    <div class="dash-phase-hd">
      <div class="dash-phase-icon">${PHASE[key].icon}</div>
      <div class="dash-phase-name">${esc(PHASE[key].label)}</div>
      <div class="dash-phase-pct">${cnt.pct}%</div>
    </div>
    <div class="dash-phase-bar"><div class="dash-phase-bar-fill" style="width:${cnt.pct}%"></div></div>
    <div class="dash-stages">
      ${stages.map(s=>{
        const isCur = isCurrent && current.stageLabel.toLowerCase() === s.label.toLowerCase();
        const cls = isCur ? "is-current" : (s.status==="completed"?"is-done":(s.status==="skipped"?"is-skipped":""));
        return `<div class="dash-stage ${cls}"><span class="dash-stage-mark"></span><span class="dash-stage-label">${esc(s.label)}</span></div>`;
      }).join("")}
    </div>
  </div>`;
}

// ─── COMMAND PALETTE ───────────────────────────────────────────────────────
function bindPalette(){
  const open = ()=>{
    document.getElementById("palette").hidden = false;
    document.getElementById("palette-input").value = "";
    document.getElementById("palette-input").focus();
    runPaletteSearch("");
  };
  const close = ()=>{
    document.getElementById("palette").hidden = true;
  };
  document.getElementById("open-palette").addEventListener("click", open);
  document.getElementById("palette-backdrop").addEventListener("click", close);
  const input = document.getElementById("palette-input");
  input.addEventListener("input", ()=> runPaletteSearch(input.value));
  input.addEventListener("keydown", (e)=>{
    if (e.key === "Escape"){ close(); return; }
    if (e.key === "ArrowDown"){ e.preventDefault(); state.paletteIdx = Math.min(state.paletteIdx+1, state.paletteResults.length-1); paintPalette(); }
    if (e.key === "ArrowUp"){ e.preventDefault(); state.paletteIdx = Math.max(state.paletteIdx-1, 0); paintPalette(); }
    if (e.key === "Enter"){
      const r = state.paletteResults[state.paletteIdx];
      if (r){ close(); location.hash = "#"+encodeURIComponent(r.file.path); if (r.headingId) setTimeout(()=>document.getElementById(r.headingId)?.scrollIntoView({behavior:"smooth"}), 250); }
    }
  });
  window._openPalette = open;
  window._closePalette = close;
}

function runPaletteSearch(query){
  state.paletteIdx = 0;
  const q = query.trim().toLowerCase();
  const results = [];
  for (const f of state.files){
    if (!q){
      results.push({file: f, kind: "doc", matchText: f.title, snippet: ""});
      if (results.length >= 12) break;
      continue;
    }
    if (f.title.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)){
      results.push({file:f, kind:"doc", matchText:f.title, snippet: snippetFor(f.content, q)});
    } else if (f.content && f.content.toLowerCase().includes(q)){
      results.push({file:f, kind:"content", matchText:f.title, snippet: snippetFor(f.content, q)});
    }
    if (results.length >= 30) break;
  }
  state.paletteResults = results;
  paintPalette();
}

function snippetFor(content, q){
  if (!content || !q) return "";
  const lower = content.toLowerCase();
  const i = lower.indexOf(q);
  if (i < 0) return "";
  const start = Math.max(0, i - 40);
  const end = Math.min(content.length, i + q.length + 60);
  let s = content.slice(start, end).replace(/\s+/g," ");
  if (start > 0) s = "…" + s;
  if (end < content.length) s += "…";
  return s;
}

function paintPalette(){
  const box = document.getElementById("palette-results");
  if (!state.paletteResults.length){
    box.innerHTML = `<div class="pal-empty">No results</div>`;
    return;
  }
  const q = document.getElementById("palette-input").value.trim();
  const rx = q ? new RegExp("("+escRx(q)+")","gi") : null;
  const hl = (s)=> rx ? esc(s).replace(new RegExp("("+escRx(q)+")","gi"),"<mark>$1</mark>") : esc(s);
  box.innerHTML = state.paletteResults.map((r,i)=>{
    const ph = r.file.phase||"overview";
    return `<div class="pal-item ${i===state.paletteIdx?"active":""}" data-i="${i}">
      <div class="pal-item-icon" style="background:${phaseBgVar(ph)};color:${phaseColorVar(ph)}">${PHASE[ph].icon}</div>
      <div class="pal-item-body">
        <div class="pal-item-title">${hl(r.file.title)}</div>
        ${r.snippet?`<div class="pal-item-snippet">${hl(r.snippet)}</div>`:`<div class="pal-item-path">${esc(r.file.path)}</div>`}
      </div>
      <span class="pal-item-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
    </div>`;
  }).join("");
  [...box.querySelectorAll(".pal-item")].forEach(el=>{
    el.addEventListener("mouseenter", ()=>{ state.paletteIdx = +el.dataset.i; paintPalette(); });
    el.addEventListener("click", ()=>{
      const r = state.paletteResults[+el.dataset.i];
      if (!r) return;
      window._closePalette();
      location.hash = "#"+encodeURIComponent(r.file.path);
    });
  });
  const active = box.querySelector(".pal-item.active");
  active?.scrollIntoView({block:"nearest"});
}

// ─── GLOBAL SHORTCUTS ──────────────────────────────────────────────────────
function bindGlobalShortcuts(){
  document.addEventListener("keydown", (e)=>{
    const tag = (document.activeElement?.tagName||"").toLowerCase();
    const inEditable = tag === "input" || tag === "textarea";
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==="k"){
      e.preventDefault(); window._openPalette();
      return;
    }
    if (e.key === "/" && !inEditable){
      e.preventDefault(); window._openPalette();
    }
    if (!inEditable && state.current){
      const idx = state.files.indexOf(state.current);
      if (e.key === "j" && idx < state.files.length-1) location.hash = "#"+encodeURIComponent(state.files[idx+1].path);
      if (e.key === "k" && idx > 0) location.hash = "#"+encodeURIComponent(state.files[idx-1].path);
    }
  });
}

function bindHomeLink(){
  document.getElementById("home-link").addEventListener("click", (e)=>{
    e.preventDefault(); location.hash = "#_home";
  });
}

// ─── SIDEBAR ───────────────────────────────────────────────────────────────
function bindSidebarToggle(){
  const sb = document.getElementById("sidebar");
  let backdrop = document.getElementById("sidebar-backdrop");
  if (!backdrop){
    backdrop = document.createElement("div");
    backdrop.id = "sidebar-backdrop";
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", ()=>{ sb.classList.remove("open"); backdrop.classList.remove("show"); });
  }
  document.getElementById("menu-btn").addEventListener("click", ()=>{
    sb.classList.toggle("open");
    backdrop.classList.toggle("show", sb.classList.contains("open"));
  });
}

// ─── ERROR / LIVE RELOAD ───────────────────────────────────────────────────
function showError(title, body){
  document.getElementById("doc-panel").innerHTML =
    `<div class="dash" style="text-align:center;padding-top:60px"><h1 class="dash-h1">${esc(title)}</h1><p class="dash-sub" style="margin:0 auto">${body}</p></div>`;
  document.getElementById("toc-panel").hidden = true;
}

function connectLiveReload(){
  if (!window.EventSource) return;
  let es;
  try { es = new EventSource("/events"); } catch(_){ return; }
  es.addEventListener("reload", async (e)=>{
    let info = {};
    try { info = JSON.parse(e.data); } catch(_){}
    try {
      const r = await fetch("/manifest.js?t="+Date.now());
      const t = await r.text();
      (0,eval)(t);
    } catch(_){ return; }
    const M = window.AIDLC_MANIFEST;
    if (!M?.files) return;
    state.files = M.files;
    state.status = parseAidlcStatus(state.files);
    renderTopbarStatus();
    renderPhaseRail();
    renderNav();
    if (state.current){
      const f = state.files.find(x=>x.path===state.current.path);
      if (f) navigateTo(f);
    } else {
      const v = location.hash.replace(/^#/,"") === "_status" ? "status" : "guide";
      renderHome(v);
    }
    showToast(info.files ? `${info.files} docs synced` : "Docs updated");
  });
  es.onerror = ()=> es.close();
}

let _toastTimer = null;
function showToast(msg){
  const el = document.getElementById("live-toast");
  if (!el) return;
  el.innerHTML = `<span class="live-toast-dot"></span>${esc(msg)}`;
  el.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(()=> el.classList.remove("show"), 2600);
}
