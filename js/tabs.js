/* ═══════════════════════════════════════════════
   js/tabs.js  —  Multi-tab note management
   ═══════════════════════════════════════════════ */

'use strict';

function renderTabs() {
  const bar = document.getElementById('tabs-bar');
  if (!bar) return;
  bar.innerHTML = openTabs.map(t => {
    const n = getNote(t.id);
    if (!n) return '';
    return `
      <div class="tab ${t.id === activeTabId ? 'active' : ''}"
           onclick="switchTab('${t.id}')"
           role="tab"
           aria-selected="${t.id === activeTabId}"
           aria-label="${escHtml(n.title || 'Untitled')}">
        <span>${escHtml((n.title || 'Untitled').slice(0, 22))}</span>
        ${t.dirty ? '<span style="color:var(--gold);margin-left:2px" aria-hidden="true">●</span>' : ''}
        <span class="tab-close" onclick="closeTab(event,'${t.id}')" aria-label="Close tab">✕</span>
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
  if (activeTabId) loadNote(activeTabId);
  else showWelcome();
}
