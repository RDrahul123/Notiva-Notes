/* ═══════════════════════════════════════════════
   js/panel.js  —  Right properties panel
   ═══════════════════════════════════════════════ */

'use strict';

function switchPanelTab(tab, btn) {
  panelTab = tab;
  document.querySelectorAll('.ptab').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  updatePanel();
}

function updatePanel() {
  const body = document.getElementById('panel-body');
  if (!body) return;

  if (!activeTabId) {
    body.innerHTML = '<div class="empty-state">Open a note to view properties.</div>';
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
          ${propRow('Folder', f ? f.name : '—')}
          ${propRow('Created', new Date(n.created).toLocaleDateString())}
          ${propRow('Modified', new Date(n.modified).toLocaleDateString())}
          ${propRow('ID', `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text-muted)">${n.id}</span>`)}
        </div>
      </div>
      <div class="panel-section">
        <div class="panel-section-title">Tags</div>
        <div class="tag-cloud">
          ${(n.tags || []).map(t => `<span class="tag-chip" onclick="filterTag('${escAttr(t)}')">#${escHtml(t)}</span>`).join('') ||
            '<span style="font-size:11px;color:var(--text-muted);font-style:italic">No tags yet</span>'}
        </div>
      </div>`;

  } else if (panelTab === 'links') {
    const wikilinks = [...(n.content || '').matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]);
    const incoming = vault.notes.filter(o => o.id !== n.id && (o.content || '').includes(`[[${n.title}]]`));

    body.innerHTML = `
      <div class="panel-section">
        <div class="panel-section-title">Outgoing Links (${wikilinks.length})</div>
        ${wikilinks.length
          ? wikilinks.map(w => {
              const target = vault.notes.find(x => x.title.toLowerCase() === w.toLowerCase());
              return `<div class="linked-note" onclick="${target ? `openNote('${target.id}')` : ''}" role="button" tabindex="0">
                <div class="linked-dot"></div>
                ${escHtml(w)}
                ${!target ? '<span style="color:var(--text-muted);font-size:10px;margin-left:4px">(missing)</span>' : ''}
              </div>`;
            }).join('')
          : '<div class="empty-state">No outgoing links</div>'}
      </div>
      <div class="panel-section">
        <div class="panel-section-title">Backlinks (${incoming.length})</div>
        ${incoming.length
          ? incoming.map(ln =>
              `<div class="linked-note" onclick="openNote('${ln.id}')" role="button" tabindex="0">
                <div class="linked-dot" style="background:var(--accent-2)"></div>
                ${escHtml(ln.title)}
              </div>`
            ).join('')
          : '<div class="empty-state">No backlinks yet</div>'}
      </div>`;

  } else { // stats
    const txt = (n.content || '').replace(/<[^>]+>/g, '');
    const words = txt.trim() ? txt.trim().split(/\s+/).length : 0;
    const chars = txt.length;
    const links = [...(n.content || '').matchAll(/\[\[/g)].length;
    const readTime = Math.max(1, Math.round(words / 200));

    body.innerHTML = `
      <div class="panel-section">
        <div class="panel-section-title">Note Statistics</div>
        <div class="stats-grid">
          <div class="stat-box"><div class="stat-val">${words}</div><div class="stat-label">Words</div></div>
          <div class="stat-box"><div class="stat-val">${chars}</div><div class="stat-label">Chars</div></div>
          <div class="stat-box"><div class="stat-val">${links}</div><div class="stat-label">Links</div></div>
          <div class="stat-box"><div class="stat-val">${readTime}m</div><div class="stat-label">Read Time</div></div>
        </div>
      </div>
      <div class="panel-section">
        <div class="panel-section-title">Vault Overview</div>
        <div class="stats-grid">
          <div class="stat-box"><div class="stat-val" style="color:var(--accent-3)">${vault.notes.length}</div><div class="stat-label">Notes</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--accent-2)">${vault.folders.length}</div><div class="stat-label">Folders</div></div>
        </div>
      </div>`;
  }
}

function propRow(label, value) {
  return `<div style="display:flex;gap:8px;align-items:baseline">
    <span style="color:var(--text-muted);font-family:'JetBrains Mono',monospace;font-size:10px;min-width:64px;flex-shrink:0">${label}</span>
    <span>${value}</span>
  </div>`;
}
