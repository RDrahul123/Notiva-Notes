/**
 * ui.js — UI rendering and interactions
 * Sidebar, tabs, right panel, search, modals, theme, toasts.
 */

/* ── State ── */
let openTabs     = [];   // [{id, dirty}]
let activeTabId  = null;
let ctxTargetId  = null;
let panelTab     = 'info';
let currentTheme = localStorage.getItem('notiva_theme') || 'dark';

/* ── Theme ── */
(function initTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeMetaColor();
})();

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('notiva_theme', currentTheme);
  updateThemeMetaColor();
  showToast(currentTheme === 'light' ? '☀️ Light mode' : '🌙 Dark mode');
  // Redraw graph if visible
  const gv = document.getElementById('graph-view');
  if (gv && gv.style.display !== 'none') {
    cancelAnimationFrame(graphAnim);
    setTimeout(initGraph, 60);
  }
}

function updateThemeMetaColor() {
  const meta = document.getElementById('meta-theme-color');
  if (meta) meta.content = currentTheme === 'dark' ? '#111114' : '#ffffff';
}

/* ── Toast ── */
let _toastTimer;
function showToast(msg) {
  clearTimeout(_toastTimer);
  const el = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  el.classList.add('show');
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ── Sidebar tabs ── */
function switchSideTab(tab, btn) {
  document.querySelectorAll('.sidebar-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  ['files', 'search', 'tags'].forEach(t => {
    const el = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? '' : 'none';
  });
  if (tab === 'tags') renderAllTags();
}

function filterTag(tag) {
  switchSideTab('search', document.querySelectorAll('.sidebar-tab')[1]);
  const si = document.getElementById('side-search');
  if (si) { si.value = '#' + tag; doSearch(); }
}

/* ── Sidebar rendering ── */
function renderSidebar() {
  renderTree();
  renderAllTags();
}

function renderTree() {
  const el = document.getElementById('tab-files');
  if (!el) return;

  let html = vault.folders.map(f => {
    const notes = vault.notes.filter(n => n.folderId === f.id);
    return `<div class="tree-section">
      <div class="tree-folder ${f.open ? 'open' : ''}" onclick="toggleFolder('${f.id}')">
        <span class="tree-folder-icon">▶</span>
        <span>${f.open ? '📂' : '📁'}</span>
        <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(f.name)}</span>
        <span style="font-size:10px;color:var(--text-muted);flex-shrink:0">${notes.length}</span>
      </div>
      ${f.open ? `<div class="tree-children">${notes.map(noteTreeItem).join('')}</div>` : ''}
    </div>`;
  }).join('');

  const uncat = vault.notes.filter(n => !vault.folders.find(f => f.id === n.folderId));
  if (uncat.length) {
    html += `<div class="tree-section">
      <div class="tree-folder open">
        <span class="tree-folder-icon" style="transform:rotate(90deg)">▶</span>
        <span>📄</span><span>Uncategorized</span>
      </div>
      <div class="tree-children">${uncat.map(noteTreeItem).join('')}</div>
    </div>`;
  }

  el.innerHTML = html || '<div class="empty-state">No notes yet. Create your first note!</div>';
}

function noteTreeItem(n) {
  return `<div class="tree-item ${n.id === activeTabId ? 'active' : ''}"
    onclick="openNote('${n.id}')"
    oncontextmenu="showCtx(event,'${n.id}')"
    ontouchstart="handleLongPress('${n.id}', this)"
    ontouchend="cancelLongPress()">
    <div class="tree-dot"></div>
    <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(n.title || 'Untitled')}</span>
  </div>`;
}

function toggleFolder(id) {
  toggleFolderOpen(id);
  renderTree();
}

function renderAllTags() {
  const el = document.getElementById('all-tags');
  if (!el) return;
  const tc = getAllTags();
  const keys = Object.keys(tc);
  if (!keys.length) { el.innerHTML = '<div class="empty-state">No tags yet.</div>'; return; }
  el.innerHTML = keys.map(t =>
    `<div class="tree-item" onclick="filterTag('${escHtml(t)}')">
      <span style="color:var(--accent)">#</span>
      <span style="flex:1">${escHtml(t)}</span>
      <span style="font-size:10px;color:var(--text-muted)">${tc[t]}</span>
    </div>`
  ).join('');
}

/* ── Tabs ── */
function renderTabs() {
  const bar = document.getElementById('tabs-bar');
  if (!bar) return;
  bar.innerHTML = openTabs.map(t => {
    const n = getNote(t.id);
    if (!n) return '';
    return `<div class="tab ${t.id === activeTabId ? 'active' : ''}" onclick="switchTab('${t.id}')">
      <span>${escHtml(n.title || 'Untitled')}</span>
      ${t.dirty ? '<span style="color:var(--gold);margin-left:2px;font-size:10px">●</span>' : ''}
      <span class="tab-close" onclick="closeTab(event,'${t.id}')">✕</span>
    </div>`;
  }).join('');
}

function switchTab(id) {
  saveEditorToNote();
  activeTabId = id;
  renderTabs();
  loadNote(id);
  renderTree();
}

function closeTab(e, id) {
  e.stopPropagation();
  openTabs = openTabs.filter(t => t.id !== id);
  if (activeTabId === id) {
    activeTabId = openTabs.length ? openTabs[openTabs.length - 1].id : null;
  }
  renderTabs();
  activeTabId ? loadNote(activeTabId) : showWelcome();
}

/* ── Right Panel ── */
function switchPanelTab(tab, btn) {
  panelTab = tab;
  document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updatePanel();
}

function updatePanel() {
  const body = document.getElementById('panel-body');
  if (!body) return;
  if (!activeTabId) {
    body.innerHTML = '<div class="empty-state">Open a note to see properties.</div>';
    return;
  }
  const n = getNote(activeTabId);
  if (!n) return;

  if (panelTab === 'info') {
    const f = getFolder(n.folderId);
    body.innerHTML = `
      <div class="panel-section">
        <div class="panel-section-title">Properties</div>
        <div style="font-size:11px;color:var(--text-secondary);line-height:2.2">
          <div style="display:flex;gap:8px"><span style="color:var(--text-muted);font-family:'JetBrains Mono',monospace;font-size:10px;min-width:62px">Folder</span><span>${escHtml(f ? f.name : '—')}</span></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text-muted);font-family:'JetBrains Mono',monospace;font-size:10px;min-width:62px">Created</span><span>${new Date(n.created).toLocaleDateString()}</span></div>
          <div style="display:flex;gap:8px"><span style="color:var(--text-muted);font-family:'JetBrains Mono',monospace;font-size:10px;min-width:62px">Modified</span><span>${new Date(n.modified).toLocaleDateString()}</span></div>
        </div>
      </div>
      <div class="panel-section">
        <div class="panel-section-title">Tags</div>
        <div class="tag-cloud">
          ${(n.tags || []).map(t => `<span class="tag-chip">#${escHtml(t)}</span>`).join('') || '<span style="font-size:11px;color:var(--text-muted)">No tags</span>'}
        </div>
      </div>`;
  } else if (panelTab === 'links') {
    const wl = getWikilinks(n.content);
    const inc = getBacklinks(n.id);
    body.innerHTML = `
      <div class="panel-section">
        <div class="panel-section-title">Outgoing (${wl.length})</div>
        ${wl.length ? wl.map(w => {
          const t = vault.notes.find(x => x.title.toLowerCase() === w.toLowerCase());
          return `<div class="linked-note" onclick="${t ? `openNote('${t.id}')` : ''}">
            <div class="linked-dot"></div>${escHtml(w)}
            ${!t ? '<span style="color:var(--text-muted);font-size:10px;margin-left:4px">(missing)</span>' : ''}
          </div>`;
        }).join('') : '<div class="empty-state">No outgoing links</div>'}
      </div>
      <div class="panel-section">
        <div class="panel-section-title">Backlinks (${inc.length})</div>
        ${inc.length ? inc.map(x =>
          `<div class="linked-note" onclick="openNote('${x.id}')">
            <div class="linked-dot" style="background:var(--accent-2)"></div>${escHtml(x.title)}
          </div>`
        ).join('') : '<div class="empty-state">No backlinks</div>'}
      </div>`;
  } else {
    const txt = (n.content || '').replace(/<[^>]+>/g, '');
    const words = txt.trim() ? txt.trim().split(/\s+/).length : 0;
    const links = (n.content || '').split('[[').length - 1;
    body.innerHTML = `
      <div class="panel-section">
        <div class="panel-section-title">Note Stats</div>
        <div class="stats-grid">
          <div class="stat-box"><div class="stat-val">${words}</div><div class="stat-label">Words</div></div>
          <div class="stat-box"><div class="stat-val">${txt.length}</div><div class="stat-label">Chars</div></div>
          <div class="stat-box"><div class="stat-val">${links}</div><div class="stat-label">Links</div></div>
          <div class="stat-box"><div class="stat-val">${Math.max(1,Math.round(words/200))}m</div><div class="stat-label">Read</div></div>
        </div>
      </div>
      <div class="panel-section">
        <div class="panel-section-title">Vault</div>
        <div class="stats-grid">
          <div class="stat-box"><div class="stat-val" style="color:var(--accent-3)">${vault.notes.length}</div><div class="stat-label">Notes</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--accent-2)">${vault.folders.length}</div><div class="stat-label">Folders</div></div>
        </div>
      </div>`;
  }
}

/* ── Note Tags display ── */
function renderNoteTags(n) {
  const el = document.getElementById('tags-display');
  if (!el) return;
  el.innerHTML = (n.tags || []).map(t =>
    `<span class="note-tag" onclick="removeTag('${escHtml(t)}')" title="Remove">#${escHtml(t)}</span>`
  ).join('');
}

/* ── Note display ── */
function showWelcome() {
  const ws = document.getElementById('welcome-screen');
  const nv = document.getElementById('note-view');
  const gv = document.getElementById('graph-view');
  if (ws) ws.style.display = '';
  if (nv) nv.style.display = 'none';
  if (gv) gv.style.display = 'none';
  document.getElementById('bc-folder').textContent = '—';
  document.getElementById('bc-note').textContent = 'No file open';
}

/* ── Search ── */
document.addEventListener('DOMContentLoaded', () => {
  const ss = document.getElementById('side-search');
  if (ss) ss.addEventListener('input', doSearch);

  const gs = document.getElementById('global-search');
  if (gs) gs.addEventListener('input', e => {
    const q = e.target.value;
    if (!q) return;
    switchSideTab('search', document.querySelectorAll('.sidebar-tab')[1]);
    const si = document.getElementById('side-search');
    if (si) { si.value = q; doSearch(); }
    // open sidebar on desktop if collapsed
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.remove('collapsed');
    const btn = document.getElementById('btn-toggle-sidebar');
    if (btn) btn.classList.add('active');
  });

  const ms = document.getElementById('mobile-search-input');
  if (ms) ms.addEventListener('input', e => {
    const q = e.target.value;
    if (!q) return;
    switchSideTab('search', document.querySelectorAll('.sidebar-tab')[1]);
    const si = document.getElementById('side-search');
    if (si) { si.value = q; doSearch(); }
    openMobileSidebar();
  });
});

function doSearch() {
  const q = document.getElementById('side-search')?.value || '';
  const results = searchNotes(q);
  const el = document.getElementById('search-results');
  if (!el) return;
  if (!q.trim()) { el.innerHTML = ''; return; }
  if (!results.length) { el.innerHTML = '<div class="empty-state">No results.</div>'; return; }
  el.innerHTML = results.map(n => {
    const ex = (n.content || '').replace(/<[^>]+>/g, '').slice(0, 60);
    return `<div class="tree-item" onclick="openNote('${n.id}')">
      <div class="tree-dot"></div>
      <div style="overflow:hidden">
        <div style="font-size:12px;color:var(--text-primary)">${hlText(n.title, q)}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${hlText(ex, q)}</div>
      </div>
    </div>`;
  }).join('');
}

function hlText(text, q) {
  if (!q || q.startsWith('#')) return escHtml(text);
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escHtml(text).replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>');
}

/* ── Modals ── */
function openNewNoteModal() {
  const sel = document.getElementById('new-note-folder');
  sel.innerHTML = vault.folders.map(f => `<option value="${f.id}">${escHtml(f.name)}</option>`).join('');
  document.getElementById('new-note-name').value = '';
  openModal('modal-new');
  setTimeout(() => document.getElementById('new-note-name').focus(), 120);
}

function createNote() {
  const title = document.getElementById('new-note-name').value.trim() || 'Untitled Note';
  const folderId = document.getElementById('new-note-folder').value;
  const note = createNoteRecord(title, folderId);
  closeModal('modal-new');
  renderSidebar();
  openNote(note.id);
  setTimeout(() => document.getElementById('note-title')?.focus(), 100);
  showToast('✦ Note created!');
}

function createFolder() {
  const name = document.getElementById('new-folder-name').value.trim();
  if (!name) return;
  createFolderRecord(name);
  closeModal('modal-folder');
  renderSidebar();
  showToast('📁 Folder created!');
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

/* ── Tags ── */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-add-tag');
  if (btn) {
    btn.addEventListener('click', () => {
      if (!activeTabId) return;
      document.getElementById('new-tag-val').value = '';
      openModal('modal-tag');
      setTimeout(() => document.getElementById('new-tag-val').focus(), 120);
    });
    btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') btn.click(); });
  }
});

function addTag() {
  if (!activeTabId) return;
  const tag = (document.getElementById('new-tag-val').value || '').trim().replace(/\s+/g, '_');
  if (!tag) return;
  if (addTagToNote(activeTabId, tag)) {
    renderNoteTags(getNote(activeTabId));
    showToast('#' + tag + ' added');
  }
  closeModal('modal-tag');
}

function removeTag(tag) {
  if (!activeTabId) return;
  removeTagFromNote(activeTabId, tag);
  renderNoteTags(getNote(activeTabId));
}

/* ── Context menu ── */
let _longPressTimer;
function handleLongPress(id, el) {
  _longPressTimer = setTimeout(() => {
    ctxTargetId = id;
    const menu = document.getElementById('ctx-menu');
    if (menu) menu.classList.add('open');
    if (navigator.vibrate) navigator.vibrate(40);
  }, 550);
}
function cancelLongPress() { clearTimeout(_longPressTimer); }

function showCtx(e, id) {
  e.preventDefault();
  ctxTargetId = id;
  const menu = document.getElementById('ctx-menu');
  if (!menu) return;
  menu.style.left = Math.min(e.clientX, window.innerWidth - 180) + 'px';
  menu.style.top  = Math.min(e.clientY, window.innerHeight - 160) + 'px';
  menu.classList.add('open');
}
function hideCtx() {
  const menu = document.getElementById('ctx-menu');
  if (menu) menu.classList.remove('open');
}

function ctxOpen() { if (ctxTargetId) openNote(ctxTargetId); hideCtx(); }

function ctxRename() {
  if (!ctxTargetId) return;
  const n = getNote(ctxTargetId);
  if (!n) return;
  document.getElementById('rename-val').value = n.title;
  openModal('modal-rename');
  setTimeout(() => document.getElementById('rename-val').focus(), 120);
  hideCtx();
}

function doRename() {
  if (!ctxTargetId) return;
  const newTitle = (document.getElementById('rename-val').value || '').trim() || 'Untitled';
  renameNoteRecord(ctxTargetId, newTitle);
  closeModal('modal-rename');
  renderSidebar();
  renderTabs();
  if (activeTabId === ctxTargetId) {
    const inp = document.getElementById('note-title');
    if (inp) inp.value = newTitle;
    document.getElementById('bc-note').textContent = newTitle;
  }
  showToast('✎ Renamed!');
}

function ctxDelete() {
  if (!ctxTargetId) return;
  if (!confirm('Delete this note? This cannot be undone.')) { hideCtx(); return; }
  deleteNoteRecord(ctxTargetId);
  openTabs = openTabs.filter(t => t.id !== ctxTargetId);
  if (activeTabId === ctxTargetId) {
    activeTabId = openTabs.length ? openTabs[openTabs.length - 1].id : null;
  }
  hideCtx();
  renderSidebar();
  renderTabs();
  activeTabId ? loadNote(activeTabId) : showWelcome();
  showToast('Note deleted');
}

/* ── Mobile drawer ── */
function openMobileSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('mobile-overlay');
  if (s) s.classList.add('mobile-open');
  if (o) o.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeMobileSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('mobile-overlay');
  if (s) s.classList.remove('mobile-open');
  if (o) o.classList.remove('visible');
  document.body.style.overflow = '';
}

function toggleMobileSearch() {
  const bar = document.getElementById('mobile-search-bar');
  if (!bar) return;
  const visible = bar.classList.toggle('visible');
  if (visible) setTimeout(() => document.getElementById('mobile-search-input')?.focus(), 80);
}

/* ── Mobile bottom sheet panel ── */
function toggleMobilePanel() {
  const p = document.getElementById('right-panel');
  if (!p) return;
  p.classList.toggle('open');
  // Show overlay
  const o = document.getElementById('mobile-overlay');
  if (p.classList.contains('open') && o) o.classList.add('visible');
  else if (o) o.classList.remove('visible');
}

/* ── Utils ── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
