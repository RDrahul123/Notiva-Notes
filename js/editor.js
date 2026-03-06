/* ═══════════════════════════════════════════════
   js/editor.js  —  Note editor, formatting, preview
   ═══════════════════════════════════════════════ */

'use strict';

// ─── OPEN / LOAD ───
function openNote(id) {
  saveEditorToNote();
  if (!openTabs.find(t => t.id === id)) openTabs.push({ id, dirty: false });
  activeTabId = id;
  renderTabs();
  loadNote(id);
  renderTree();
  hideGraph();

  // On mobile: switch to editor view
  if (window.innerWidth <= 640) mobileSwitchView('editor');
}

function loadNote(id) {
  const n = getNote(id);
  if (!n) return;

  document.getElementById('welcome-screen').style.display = 'none';
  document.getElementById('note-view').style.display = 'flex';

  const titleEl = document.getElementById('note-title');
  const editorEl = document.getElementById('note-editor');
  const dateEl = document.getElementById('note-date');

  if (titleEl) titleEl.value = n.title || '';
  if (editorEl) editorEl.innerHTML = n.content || '';
  if (dateEl) dateEl.textContent = 'Modified ' + new Date(n.modified).toLocaleDateString();

  updateBreadcrumb(n);
  renderNoteTags(n);
  updateWC();
  updatePreview();
  updatePanel();
}

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

function updateBreadcrumb(n) {
  const f = getFolder(n.folderId);
  const bcFolder = document.getElementById('bc-folder');
  const bcNote = document.getElementById('bc-note');
  if (bcFolder) bcFolder.textContent = f ? f.name : 'notiva';
  if (bcNote) bcNote.textContent = n.title || 'Untitled';
}

// ─── SAVE ───
function saveEditorToNote() {
  if (!activeTabId) return;
  const n = getNote(activeTabId);
  if (!n) return;
  const editorEl = document.getElementById('note-editor');
  const titleEl = document.getElementById('note-title');
  if (editorEl) n.content = editorEl.innerHTML;
  if (titleEl) n.title = titleEl.value || 'Untitled';
  n.modified = Date.now();
}

// ─── AUTO-SAVE LISTENERS ───
document.addEventListener('DOMContentLoaded', function () {
  const editor = document.getElementById('note-editor');
  const titleInput = document.getElementById('note-title');

  if (editor) {
    editor.addEventListener('input', function () {
      if (!activeTabId) return;
      const n = getNote(activeTabId);
      if (n) { n.content = editor.innerHTML; n.modified = Date.now(); }
      markDirty();
      updateWC();
      if (currentMode !== 'edit') updatePreview();
      const tab = openTabs.find(t => t.id === activeTabId);
      if (tab) { tab.dirty = true; renderTabs(); }
    });
  }

  if (titleInput) {
    titleInput.addEventListener('input', function () {
      if (!activeTabId) return;
      const n = getNote(activeTabId);
      if (n) { n.title = titleInput.value; n.modified = Date.now(); }
      markDirty();
      renderTabs();
      renderTree();
      updateBreadcrumb(n || { title: titleInput.value });
      const tab = openTabs.find(t => t.id === activeTabId);
      if (tab) { tab.dirty = true; renderTabs(); }
    });
  }
});

// ─── WORD COUNT ───
function updateWC() {
  const el = document.getElementById('note-editor');
  const wc = document.getElementById('word-count');
  if (!el || !wc) return;
  const txt = el.innerText || '';
  const count = txt.trim() ? txt.trim().split(/\s+/).length : 0;
  wc.textContent = count + ' words';
}

// ─── FORMATTING ───
function fmt(cmd) {
  const ed = document.getElementById('note-editor');
  if (ed) ed.focus();
  document.execCommand(cmd, false, null);
}

function iBlock(type) {
  const ed = document.getElementById('note-editor');
  if (ed) ed.focus();
  const sel = window.getSelection ? window.getSelection().toString() : '';
  const text = sel || 'text';
  switch (type) {
    case 'h1': case 'h2': case 'h3': case 'blockquote':
      document.execCommand('formatBlock', false, type); break;
    case 'ul': document.execCommand('insertUnorderedList'); break;
    case 'ol': document.execCommand('insertOrderedList'); break;
    case 'code':
      document.execCommand('insertHTML', false, `<code>${text}</code>`); break;
  }
}

function insertWikiLink() {
  const title = prompt('Link to note (enter title):');
  if (!title) return;
  const ed = document.getElementById('note-editor');
  if (ed) ed.focus();
  document.execCommand('insertHTML', false,
    `<span class="wikilink" onclick="openByTitle('${escAttr(title)}')">[[${title}]]</span>`);
}

function insertHR() {
  const ed = document.getElementById('note-editor');
  if (ed) ed.focus();
  document.execCommand('insertHTML', false, '<hr>');
}

function openByTitle(title) {
  const note = vault.notes.find(n => n.title.toLowerCase() === title.toLowerCase());
  if (note) openNote(note.id);
  else showToast(`Note "${title}" not found`);
}

// ─── PREVIEW MODE ───
function setMode(mode) {
  currentMode = mode;
  const ed = document.getElementById('note-editor');
  const pre = document.getElementById('preview-pane');
  if (!ed || !pre) return;

  ['edit', 'split', 'preview'].forEach(m => {
    const btn = document.getElementById('m-' + m);
    if (btn) {
      btn.classList.toggle('active', m === mode);
      btn.setAttribute('aria-pressed', m === mode ? 'true' : 'false');
    }
  });

  if (mode === 'edit') {
    ed.style.display = '';
    pre.style.display = 'none';
  } else if (mode === 'split') {
    ed.style.display = '';
    pre.style.display = '';
    pre.style.flex = '1';
    pre.style.borderLeft = '1px solid var(--border)';
    updatePreview();
  } else { // preview
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
  const html = ed.innerHTML.replace(/\[\[([^\]]+)\]\]/g, (_, t) =>
    `<span class="wikilink" onclick="openByTitle('${escAttr(t)}')">[[${t}]]</span>`
  );
  pre.innerHTML = html;
}

// ─── TAGS ───
function renderNoteTags(n) {
  const el = document.getElementById('tags-display');
  if (!el) return;
  el.innerHTML = (n.tags || []).map(t =>
    `<span class="note-tag" onclick="removeTag('${escAttr(t)}')" title="Click to remove" role="button">#${escHtml(t)}</span>`
  ).join('');
}

document.addEventListener('DOMContentLoaded', function () {
  const addTagBtn = document.getElementById('btn-add-tag');
  if (addTagBtn) {
    addTagBtn.addEventListener('click', function () {
      const inp = document.getElementById('new-tag-val');
      if (inp) inp.value = '';
      const modal = document.getElementById('modal-tag');
      if (modal) {
        modal.classList.add('open');
        setTimeout(() => inp && inp.focus(), 120);
      }
    });
  }
});

function addTag() {
  if (!activeTabId) return;
  const inp = document.getElementById('new-tag-val');
  const tag = inp ? inp.value.trim().replace(/\s+/g, '_').toLowerCase() : '';
  if (!tag) return;
  const n = getNote(activeTabId);
  if (!n) return;
  if (!n.tags) n.tags = [];
  if (!n.tags.includes(tag)) n.tags.push(tag);
  saveVault();
  renderNoteTags(n);
  renderAllTags();
  closeModal('modal-tag');
  showToast('#' + tag + ' added');
}

function removeTag(tag) {
  if (!activeTabId) return;
  const n = getNote(activeTabId);
  if (!n) return;
  n.tags = (n.tags || []).filter(t => t !== tag);
  saveVault();
  renderNoteTags(n);
  renderAllTags();
}
