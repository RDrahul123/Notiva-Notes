/* ═══════════════════════════════════════════════
   js/state.js  —  App state, vault data, persistence
   ═══════════════════════════════════════════════ */
'use strict';

const DEFAULT_VAULT = {
  folders: [
    { id: 'f1', name: 'Getting Started', open: true },
    { id: 'f2', name: 'Projects', open: false },
    { id: 'f3', name: 'Daily Notes', open: false }
  ],
  notes: [
    {
      id: 'n1', folderId: 'f1', title: 'Welcome to Notiva',
      content: `Welcome to <strong>Notiva</strong> — your personal knowledge management system.<br><br>
Notiva is a fully offline note-taking app inspired by Obsidian. Notes are saved automatically.<br><br>
<h2>Features</h2>
<ul>
<li>Rich text editing with formatting toolbar</li>
<li>Wikilinks with [[double brackets]] to connect notes</li>
<li>Folder &amp; tag organisation</li>
<li>Interactive graph view (Ctrl+G)</li>
<li>Split edit/preview mode (Ctrl+E)</li>
<li>Full-text search (Ctrl+K)</li>
<li>🌙 Dark &amp; ☀️ Light theme toggle</li>
<li>📱 Fully mobile-friendly</li>
</ul>
<br>
<blockquote>Use [[Note Title]] to create a link to another note. Links show up in the graph view!</blockquote>
<br>Try opening [[My Second Note]] to see connections.`,
      tags: ['welcome', 'guide'], created: Date.now()-86400000, modified: Date.now()
    },
    {
      id: 'n2', folderId: 'f1', title: 'My Second Note',
      content: `This note is linked from [[Welcome to Notiva]].<br><br>
Write in <strong>bold</strong>, <em>italic</em>, or add <code>inline code</code>.<br><br>
<h2>Formatting Tips</h2>
<ul>
<li>Use <strong>#tags</strong> in the tag bar to categorise notes</li>
<li>Use <strong>[[links]]</strong> to connect ideas</li>
<li>Open <strong>Graph View</strong> to explore your knowledge network</li>
</ul>`,
      tags: ['example'], created: Date.now()-43200000, modified: Date.now()-3600000
    },
    {
      id: 'n3', folderId: 'f2', title: 'Project Ideas',
      content: `<h2>Ideas Backlog</h2>
<ul>
<li>Build a web scraper</li>
<li>Learn Rust programming</li>
<li>Read [[Welcome to Notiva]]</li>
<li>Explore knowledge graphs</li>
</ul>`,
      tags: ['projects','ideas'], created: Date.now()-7200000, modified: Date.now()-1800000
    }
  ]
};

let vault = (function(){
  try { const s=localStorage.getItem('notiva_v3'); return s?JSON.parse(s):JSON.parse(JSON.stringify(DEFAULT_VAULT)); }
  catch(e){ return JSON.parse(JSON.stringify(DEFAULT_VAULT)); }
})();

let saveTimer=null;

function saveVault(){
  try{ localStorage.setItem('notiva_v3',JSON.stringify(vault)); }catch(e){}
  const dot=document.getElementById('save-dot');
  const st=document.getElementById('save-status');
  if(dot) dot.classList.remove('saving');
  if(st) st.textContent='Saved';
}

function markDirty(){
  const dot=document.getElementById('save-dot');
  const st=document.getElementById('save-status');
  if(dot) dot.classList.add('saving');
  if(st) st.textContent='Saving…';
  clearTimeout(saveTimer);
  saveTimer=setTimeout(saveVault,800);
}

let openTabs=[], activeTabId=null, ctxTargetId=null, currentMode='edit', panelTab='info';

const uid=()=>'id_'+Math.random().toString(36).slice(2,10);
const getNote=id=>vault.notes.find(n=>n.id===id);
const getFolder=id=>vault.folders.find(f=>f.id===id);

function showToast(msg){
  const t=document.getElementById('toast'), m=document.getElementById('toast-msg');
  if(!t||!m) return;
  m.textContent=msg; t.classList.add('show');
  clearTimeout(t._timer); t._timer=setTimeout(()=>t.classList.remove('show'),2600);
}
const closeModal=id=>{ const e=document.getElementById(id); if(e) e.classList.remove('open'); };
