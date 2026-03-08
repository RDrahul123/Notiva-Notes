/**
 * vault.js - Data layer
 * Handles all note/folder state and localStorage persistence.
 */
const STORAGE_KEY = 'notiva_v3';

const DEFAULT_VAULT = {
  folders: [
    { id:'f1', name:'Getting Started', open:true },
    { id:'f2', name:'Projects', open:false },
    { id:'f3', name:'Daily Notes', open:false }
  ],
  notes: [
    {
      id:'n1', folderId:'f1', title:'Welcome to Notiva',
      content:`Welcome to <strong>Notiva</strong> — your personal knowledge management system.<br><br>
Notiva is a fully offline note-taking app inspired by Obsidian. All notes are saved automatically to your browser's local storage — no account needed.<br><br>
<h2>Features</h2>
<ul>
<li>Rich text editing with formatting toolbar</li>
<li>Wikilinks with <strong>[[double brackets]]</strong> to connect notes</li>
<li>Folder organisation with collapsible tree</li>
<li>Tags and metadata per note</li>
<li>Graph view to visualise connections (Ctrl+G)</li>
<li>Split edit / preview mode (Ctrl+E)</li>
<li>Full-text search (Ctrl+K)</li>
<li>🌙 Dark mode &amp; ☀️ Light mode toggle</li>
<li>📱 Fully mobile-friendly PWA</li>
</ul>
<br>
<blockquote>Use [[Note Title]] anywhere in a note to create a link. Links appear in the Graph View and the Backlinks panel.</blockquote>
<br>
Try linking to [[My Second Note]] to navigate there.`,
      tags:['welcome','guide'], created:Date.now()-86400000, modified:Date.now()
    },
    {
      id:'n2', folderId:'f1', title:'My Second Note',
      content:`This note is linked from [[Welcome to Notiva]].<br><br>
You can write in <strong>bold</strong>, <em>italic</em>, or add <code>code snippets</code>.<br><br>
<h2>Formatting Tips</h2>
<p>Use the toolbar above to apply formatting. All changes are auto-saved within one second.</p>
<ul>
<li>Use #tags to categorise notes</li>
<li>Use [[wikilinks]] to connect ideas across notes</li>
<li>Right-click (or long-press on mobile) a note to rename or delete it</li>
</ul>`,
      tags:['example'], created:Date.now()-43200000, modified:Date.now()-3600000
    },
    {
      id:'n3', folderId:'f2', title:'Project Ideas',
      content:`<h2>Ideas Backlog</h2>
<ul>
<li>Build a web scraper</li>
<li>Learn Rust</li>
<li>Read [[Welcome to Notiva]]</li>
<li>Explore knowledge graphs</li>
</ul>`,
      tags:['projects','ideas'], created:Date.now()-7200000, modified:Date.now()-1800000
    }
  ]
};

let vault = loadVault();

function loadVault() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_VAULT));
  } catch(e) {
    return JSON.parse(JSON.stringify(DEFAULT_VAULT));
  }
}

function saveVault() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vault)); } catch(e) {}
  const dot = document.getElementById('save-dot');
  const txt = document.getElementById('save-status');
  if(dot) dot.classList.remove('saving');
  if(txt) txt.textContent = 'Saved';
}

let _saveTimer = null;
function markDirty() {
  const dot = document.getElementById('save-dot');
  const txt = document.getElementById('save-status');
  if(dot) dot.classList.add('saving');
  if(txt) txt.textContent = 'Saving…';
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveVault, 800);
}

function uid() { return 'id_' + Math.random().toString(36).slice(2,10); }
function getNote(id) { return vault.notes.find(n => n.id === id) || null; }
function getFolder(id) { return vault.folders.find(f => f.id === id) || null; }

function createNoteRecord(title, folderId) {
  const note = { id:uid(), folderId:folderId||(vault.folders[0]?.id||null), title:title||'Untitled Note', content:'', tags:[], created:Date.now(), modified:Date.now() };
  vault.notes.push(note); saveVault(); return note;
}

function createFolderRecord(name) {
  const folder = { id:uid(), name, open:true };
  vault.folders.push(folder); saveVault(); return folder;
}

function deleteNoteRecord(id) { vault.notes = vault.notes.filter(n => n.id !== id); saveVault(); }

function renameNoteRecord(id, newTitle) {
  const n = getNote(id); if(!n) return;
  n.title = newTitle || 'Untitled'; n.modified = Date.now(); saveVault();
}

function updateNoteContent(id, content, title) {
  const n = getNote(id); if(!n) return;
  n.content = content;
  if(title !== undefined) n.title = title || 'Untitled';
  n.modified = Date.now();
}

function addTagToNote(id, tag) {
  const n = getNote(id); if(!n) return false;
  if(!n.tags) n.tags = [];
  if(n.tags.includes(tag)) return false;
  n.tags.push(tag); saveVault(); return true;
}

function removeTagFromNote(id, tag) {
  const n = getNote(id); if(!n) return;
  n.tags = (n.tags||[]).filter(t => t !== tag); saveVault();
}

function toggleFolderOpen(folderId) {
  const f = getFolder(folderId); if(!f) return;
  f.open = !f.open; saveVault();
}

function searchNotes(query) {
  const q = query.toLowerCase().trim(); if(!q) return [];
  if(q.startsWith('#')) {
    const tag = q.slice(1);
    return vault.notes.filter(n => (n.tags||[]).some(t => t.includes(tag)));
  }
  return vault.notes.filter(n =>
    n.title.toLowerCase().includes(q) ||
    (n.content||'').replace(/<[^>]+>/g,'').toLowerCase().includes(q)
  );
}

function getAllTags() {
  const tc = {};
  vault.notes.forEach(n => (n.tags||[]).forEach(t => { tc[t] = (tc[t]||0)+1; }));
  return tc;
}

function getWikilinks(noteContent) {
  return [...(noteContent||'').matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]);
}

function getBacklinks(noteId) {
  const n = getNote(noteId); if(!n) return [];
  return vault.notes.filter(o => o.id !== noteId && (o.content||'').includes(`[[${n.title}]]`));
}
