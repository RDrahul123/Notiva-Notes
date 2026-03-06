/* ═══════════════════════════════════════════════
   js/sidebar.js  —  Sidebar: file tree, search, tags
   ═══════════════════════════════════════════════ */

'use strict';

// ─── RENDER SIDEBAR ───
function renderSidebar() {
  renderTree();
  renderAllTags();
}

// ─── FILE TREE ───
function renderTree() {
  const el = document.getElementById('tab-files');
  if (!el) return;

  let html = vault.folders.map(f => {
    const notes = vault.notes.filter(n => n.folderId === f.id);
    return `
      <div class="tree-section">
        <div class="tree-folder ${f.open ? 'open' : ''}" onclick="toggleFolder('${f.id}')" role="button" tabindex="0" aria-expanded="${f.open}">
          <span class="tree-folder-icon" aria-hidden="true">▶</span>
          <span aria-hidden="true">${f.open ? '📂' : '📁'}</span>
          <span style="flex:1">${escHtml(f.name)}</span>
          <span style="font-size:10px;color:var(--text-muted)">${notes.length}</span>
        </div>
        ${f.open ? `<div class="tree-children">${notes.map(noteTreeItem).join('')}</div>` : ''}
      </div>`;
  }).join('');

  // Uncategorized
  const uncat = vault.notes.filter(n => !vault.folders.find(f => f.id === n.folderId));
  if (uncat.length) {
    html += `
      <div class="tree-section">
        <div class="tree-folder open" role="button" tabindex="0">
          <span class="tree-folder-icon" style="transform:rotate(90deg)" aria-hidden="true">▶</span>
          <span aria-hidden="true">📄</span>
          <span>Uncategorized</span>
        </div>
        <div class="tree-children">${uncat.map(noteTreeItem).join('')}</div>
      </div>`;
  }

  el.innerHTML = html || '<div class="empty-state">No notes yet. Create your first note!</div>';
}

function noteTreeItem(n) {
  return `
    <div class="tree-item ${n.id === activeTabId ? 'active' : ''}"
         onclick="openNote('${n.id}')"
         oncontextmenu="showCtx(event,'${n.id}')"
         role="button" tabindex="0"
         aria-label="${escHtml(n.title || 'Untitled')}">
      <div class="tree-dot" aria-hidden="true"></div>
      <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(n.title || 'Untitled')}</span>
    </div>`;
}

function toggleFolder(fid) {
  const f = getFolder(fid);
  if (f) { f.open = !f.open; saveVault(); renderTree(); }
}

// ─── SIDEBAR TABS ───
function switchSideTab(tab, btn) {
  document.querySelectorAll('.sidebar-tab').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');

  ['files', 'search', 'tags'].forEach(t => {
    const el = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? '' : 'none';
  });

  if (tab === 'tags') renderAllTags();
  if (tab === 'search') {
    const inp = document.getElementById('side-search');
    if (inp) setTimeout(() => inp.focus(), 50);
  }
}

// ─── TAGS LIST ───
function renderAllTags() {
  const tc = {};
  vault.notes.forEach(n => (n.tags || []).forEach(t => { tc[t] = (tc[t] || 0) + 1; }));
  const el = document.getElementById('all-tags');
  if (!el) return;
  const keys = Object.keys(tc);
  el.innerHTML = keys.length
    ? keys.map(t =>
        `<div class="tree-item" onclick="filterTag('${escAttr(t)}')" role="button" tabindex="0">
          <span style="color:var(--accent)" aria-hidden="true">#</span>
          ${escHtml(t)}
          <span style="margin-left:auto;font-size:10px;color:var(--text-muted)">${tc[t]}</span>
        </div>`
      ).join('')
    : '<div class="empty-state">No tags yet.</div>';
}

function filterTag(tag) {
  switchSideTab('search', document.querySelectorAll('.sidebar-tab')[1]);
  const si = document.getElementById('side-search');
  if (si) { si.value = '#' + tag; doSearch(); }
}

// ─── SEARCH ───
document.addEventListener('DOMContentLoaded', function () {
  const si = document.getElementById('side-search');
  if (si) si.addEventListener('input', doSearch);
});

function doSearch() {
  const inp = document.getElementById('side-search');
  const res = document.getElementById('search-results');
  if (!inp || !res) return;
  const q = inp.value.toLowerCase().trim();
  if (!q) { res.innerHTML = ''; return; }

  let matches;
  if (q.startsWith('#')) {
    const tag = q.slice(1);
    matches = vault.notes.filter(n => (n.tags || []).some(t => t.toLowerCase().includes(tag)));
  } else {
    matches = vault.notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      (n.content || '').replace(/<[^>]+>/g, '').toLowerCase().includes(q)
    );
  }

  if (!matches.length) {
    res.innerHTML = '<div class="empty-state">No results found.</div>';
    return;
  }

  res.innerHTML = matches.map(n => {
    const excerpt = (n.content || '').replace(/<[^>]+>/g, '').slice(0, 80);
    return `<div class="tree-item" onclick="openNote('${n.id}')" role="button" tabindex="0">
      <div class="tree-dot"></div>
      <div style="min-width:0">
        <div style="font-size:12px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${hlText(n.title, q)}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${hlText(excerpt, q)}</div>
      </div>
    </div>`;
  }).join('');
}

function hlText(txt, q) {
  if (!q || q.startsWith('#')) return escHtml(txt);
  const escaped = escHtml(txt);
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escaped.replace(re, '<mark>$1</mark>');
}

// Global search bar wires into sidebar search
document.addEventListener('DOMContentLoaded', function () {
  const gs = document.getElementById('global-search');
  if (gs) {
    gs.addEventListener('input', function (e) {
      const q = e.target.value;
      if (!q) return;
      switchSideTab('search', document.querySelectorAll('.sidebar-tab')[1]);
      const si = document.getElementById('side-search');
      if (si) { si.value = q; doSearch(); }
      // Open sidebar if collapsed
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        document.getElementById('btn-toggle-sidebar').classList.add('active');
      }
    });
  }
});

// ─── CREATE / DELETE / RENAME ───
function openNewNoteModal() {
  const sel = document.getElementById('new-note-folder');
  if (sel) sel.innerHTML = vault.folders.map(f => `<option value="${f.id}">${escHtml(f.name)}</option>`).join('');
  const inp = document.getElementById('new-note-name');
  if (inp) inp.value = '';
  const modal = document.getElementById('modal-new');
  if (modal) {
    modal.classList.add('open');
    setTimeout(() => inp && inp.focus(), 120);
  }
}

function createNote() {
  const nameEl = document.getElementById('new-note-name');
  const folderEl = document.getElementById('new-note-folder');
  const title = (nameEl ? nameEl.value.trim() : '') || 'Untitled Note';
  const folderId = folderEl ? folderEl.value : (vault.folders[0] ? vault.folders[0].id : null);
  const note = { id: uid(), folderId, title, content: '', tags: [], created: Date.now(), modified: Date.now() };
  vault.notes.push(note);
  saveVault();
  closeModal('modal-new');
  renderSidebar();
  openNote(note.id);
  setTimeout(() => { const t = document.getElementById('note-title'); if (t) t.focus(); }, 150);
  showToast('✦ Note created!');
}

function createFolder() {
  const nameEl = document.getElementById('new-folder-name');
  const name = nameEl ? nameEl.value.trim() : '';
  if (!name) return;
  vault.folders.push({ id: uid(), name, open: true });
  saveVault();
  closeModal('modal-folder');
  renderSidebar();
  showToast('📁 Folder created!');
}

// Context menu
function showCtx(e, id) {
  e.preventDefault();
  ctxTargetId = id;
  const menu = document.getElementById('ctx-menu');
  if (!menu) return;
  // Position carefully to avoid going off-screen
  const x = Math.min(e.clientX, window.innerWidth - 180);
  const y = Math.min(e.clientY, window.innerHeight - 140);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
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
  const inp = document.getElementById('rename-val');
  if (inp) inp.value = n.title;
  const modal = document.getElementById('modal-rename');
  if (modal) {
    modal.classList.add('open');
    setTimeout(() => inp && inp.focus(), 120);
  }
  hideCtx();
}

function doRename() {
  if (!ctxTargetId) return;
  const n = getNote(ctxTargetId);
  if (!n) return;
  const inp = document.getElementById('rename-val');
  n.title = (inp ? inp.value.trim() : '') || 'Untitled';
  n.modified = Date.now();
  saveVault();
  closeModal('modal-rename');
  renderSidebar();
  renderTabs();
  const titleEl = document.getElementById('note-title');
  if (activeTabId === ctxTargetId && titleEl) titleEl.value = n.title;
  updateBreadcrumb(n);
  showToast('✎ Renamed!');
}

function ctxDelete() {
  if (!ctxTargetId) return;
  if (!confirm('Delete this note? This cannot be undone.')) { hideCtx(); return; }
  vault.notes = vault.notes.filter(n => n.id !== ctxTargetId);
  openTabs = openTabs.filter(t => t.id !== ctxTargetId);
  if (activeTabId === ctxTargetId) {
    activeTabId = openTabs.length ? openTabs[openTabs.length - 1].id : null;
  }
  saveVault();
  hideCtx();
  renderSidebar();
  renderTabs();
  if (activeTabId) loadNote(activeTabId);
  else showWelcome();
  showToast('Note deleted');
}

// ─── HELPERS ───
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str).replace(/'/g, "\\'");
}
