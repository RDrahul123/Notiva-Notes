/**
 * editor.js — Note editor logic
 * Opening/loading notes, formatting, preview modes, wikilinks.
 */

let currentMode = 'edit';
let mobilePreviewOn = false;

/* ── Open / Load ── */
function openNote(id) {
  saveEditorToNote();
  if (!openTabs.find(t => t.id === id)) openTabs.push({ id, dirty: false });
  activeTabId = id;
  renderTabs();
  loadNote(id);
  renderTree();
  hideGraph();
  closeMobileSidebar();
  // close mobile panel if open
  const rp = document.getElementById('right-panel');
  if (rp && rp.classList.contains('open')) {
    rp.classList.remove('open');
    const o = document.getElementById('mobile-overlay');
    if (o) o.classList.remove('visible');
  }
}

function loadNote(id) {
  const n = getNote(id);
  if (!n) return;

  document.getElementById('welcome-screen').style.display = 'none';
  document.getElementById('graph-view').style.display = 'none';
  document.getElementById('note-view').style.display = 'flex';

  document.getElementById('note-title').value = n.title || '';
  document.getElementById('note-editor').innerHTML = n.content || '';
  document.getElementById('note-date').textContent = 'Modified ' + new Date(n.modified).toLocaleDateString();

  const f = getFolder(n.folderId);
  document.getElementById('bc-folder').textContent = f ? f.name : 'notiva';
  document.getElementById('bc-note').textContent = n.title || 'Untitled';

  renderNoteTags(n);
  updateWC();
  if (currentMode !== 'edit') updatePreview();
  updatePanel();

  // Reset mobile preview
  if (mobilePreviewOn) {
    mobilePreviewOn = false;
    const ed = document.getElementById('note-editor');
    const pre = document.getElementById('preview-pane');
    if (ed) ed.style.display = '';
    if (pre) pre.style.display = 'none';
    const btn = document.getElementById('mobile-preview-btn');
    if (btn) btn.textContent = '👁';
  }
}

/* ── Save ── */
function saveEditorToNote() {
  if (!activeTabId) return;
  const n = getNote(activeTabId);
  if (!n) return;
  const ed = document.getElementById('note-editor');
  const ti = document.getElementById('note-title');
  if (ed) updateNoteContent(activeTabId, ed.innerHTML, ti ? ti.value : undefined);
}

/* ── Editor events ── */
document.addEventListener('DOMContentLoaded', () => {
  const ed = document.getElementById('note-editor');
  if (ed) {
    ed.addEventListener('input', () => {
      if (!activeTabId) return;
      const n = getNote(activeTabId);
      if (n) {
        n.content = ed.innerHTML;
        n.modified = Date.now();
      }
      markDirty();
      updateWC();
      if (currentMode !== 'edit') updatePreview();
      const t = openTabs.find(t => t.id === activeTabId);
      if (t) { t.dirty = true; renderTabs(); }
    });

    // Wikilink autocomplete (basic) — type [[ and it opens wiki link insert
    ed.addEventListener('keyup', e => {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const node = sel.anchorNode;
      if (node && node.textContent) {
        const text = node.textContent.slice(0, sel.anchorOffset);
        // If user just closed ]] — nothing needed
      }
    });
  }

  const ti = document.getElementById('note-title');
  if (ti) {
    ti.addEventListener('input', () => {
      if (!activeTabId) return;
      const n = getNote(activeTabId);
      if (n) { n.title = ti.value; n.modified = Date.now(); }
      markDirty();
      renderTabs();
      renderTree();
      document.getElementById('bc-note').textContent = ti.value || 'Untitled';
      const t = openTabs.find(t => t.id === activeTabId);
      if (t) { t.dirty = true; renderTabs(); }
    });
    // Enter in title moves focus to editor
    ti.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('note-editor')?.focus();
      }
    });
  }
});

/* ── Word count ── */
function updateWC() {
  const ed = document.getElementById('note-editor');
  const wc = document.getElementById('word-count');
  if (!ed || !wc) return;
  const txt = ed.innerText || '';
  const words = txt.trim() ? txt.trim().split(/\s+/).length : 0;
  wc.textContent = words + ' words';
}

/* ── Formatting commands ── */
function fmt(cmd) {
  document.getElementById('note-editor')?.focus();
  document.execCommand(cmd, false, null);
}

function iBlock(type) {
  const ed = document.getElementById('note-editor');
  if (!ed) return;
  ed.focus();
  const sel = window.getSelection();
  const selText = sel ? sel.toString() : '';
  const text = selText || 'text';
  switch (type) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'blockquote':
      document.execCommand('formatBlock', false, type); break;
    case 'ul':
      document.execCommand('insertUnorderedList'); break;
    case 'ol':
      document.execCommand('insertOrderedList'); break;
    case 'code':
      document.execCommand('insertHTML', false, `<code>${text}</code>`); break;
  }
}

function insertWikiLink() {
  const target = prompt('Link to note (type the title):');
  if (!target) return;
  const ed = document.getElementById('note-editor');
  if (!ed) return;
  ed.focus();
  document.execCommand('insertHTML', false,
    `<span class="wikilink" onclick="openByTitle('${target.replace(/'/g,"\\'")}')">[[${target}]]</span>`
  );
}

function insertHR() {
  document.getElementById('note-editor')?.focus();
  document.execCommand('insertHTML', false, '<hr>');
}

function openByTitle(title) {
  const note = vault.notes.find(n => n.title.toLowerCase() === title.toLowerCase());
  if (note) openNote(note.id);
  else showToast(`"${title}" not found`);
}

/* ── View modes ── */
function setMode(mode) {
  currentMode = mode;
  const ed = document.getElementById('note-editor');
  const pre = document.getElementById('preview-pane');

  ['edit', 'split', 'preview'].forEach(m => {
    const btn = document.getElementById('m-' + m);
    if (btn) btn.classList.toggle('active', m === mode);
  });

  if (!ed || !pre) return;

  if (mode === 'edit') {
    ed.style.display = '';
    pre.style.display = 'none';
  } else if (mode === 'split') {
    ed.style.display = '';
    pre.style.display = '';
    pre.style.flex = '1';
    pre.style.borderLeft = '1px solid var(--border)';
    updatePreview();
  } else {
    ed.style.display = 'none';
    pre.style.display = '';
    pre.style.flex = '1';
    updatePreview();
  }
}

function updatePreview() {
  const ed = document.getElementById('note-editor');
  const pre = document.getElementById('preview-pane');
  if (!ed || !pre) return;
  const processed = ed.innerHTML.replace(/\[\[([^\]]+)\]\]/g, (_, t) =>
    `<span class="wikilink" onclick="openByTitle('${t.replace(/'/g,"\\'")}')">[[${t}]]</span>`
  );
  pre.innerHTML = processed;
}

/* ── Mobile preview toggle ── */
function toggleMobilePreview() {
  mobilePreviewOn = !mobilePreviewOn;
  const ed = document.getElementById('note-editor');
  const pre = document.getElementById('preview-pane');
  const btn = document.getElementById('mobile-preview-btn');

  if (mobilePreviewOn) {
    updatePreview();
    if (ed) ed.style.display = 'none';
    if (pre) { pre.style.display = ''; pre.style.flex = '1'; }
    if (btn) btn.textContent = '✏️';
  } else {
    if (ed) ed.style.display = '';
    if (pre) pre.style.display = 'none';
    if (btn) btn.textContent = '👁';
    setTimeout(() => ed?.focus(), 50);
  }
}
