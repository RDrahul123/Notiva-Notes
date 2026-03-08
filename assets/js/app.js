/**
 * app.js — Application bootstrap
 * Wires up all event listeners and initialises the app.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Theme toggle ── */
  const themePill = document.getElementById('theme-pill');
  if (themePill) {
    themePill.addEventListener('click', toggleTheme);
    themePill.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTheme(); }
    });
  }

  /* ── Sidebar toggle (desktop) ── */
  const btnSidebar = document.getElementById('btn-toggle-sidebar');
  if (btnSidebar) {
    btnSidebar.addEventListener('click', () => {
      const s = document.getElementById('sidebar');
      s.classList.toggle('collapsed');
      btnSidebar.classList.toggle('active', !s.classList.contains('collapsed'));
    });
  }

  /* ── Properties panel toggle ── */
  const btnPanel = document.getElementById('btn-toggle-panel');
  if (btnPanel) {
    btnPanel.addEventListener('click', () => {
      const rp = document.getElementById('right-panel');
      if (!rp) return;
      const isMobile = window.matchMedia('(max-width: 900px)').matches;
      if (isMobile) {
        rp.classList.toggle('open');
        const o = document.getElementById('mobile-overlay');
        if (o) o.classList.toggle('visible', rp.classList.contains('open'));
      } else {
        rp.classList.toggle('collapsed');
        btnPanel.classList.toggle('active', !rp.classList.contains('collapsed'));
      }
    });
  }

  /* ── Graph view button ── */
  const btnGraph = document.getElementById('btn-graph');
  if (btnGraph) {
    btnGraph.addEventListener('click', () => {
      const gv = document.getElementById('graph-view');
      if (gv && gv.style.display !== 'none') hideGraph();
      else showGraph();
    });
  }

  /* ── New note button ── */
  document.getElementById('btn-new-note')?.addEventListener('click', openNewNoteModal);

  /* ── New folder button ── */
  document.getElementById('btn-new-folder')?.addEventListener('click', () => {
    document.getElementById('new-folder-name').value = '';
    openModal('modal-folder');
    setTimeout(() => document.getElementById('new-folder-name')?.focus(), 120);
  });

  /* ── Modal: click outside to close ── */
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m) m.classList.remove('open');
    });
  });

  /* ── Modal: enter key ── */
  document.getElementById('new-note-name')?.addEventListener('keydown', e => { if (e.key === 'Enter') createNote(); });
  document.getElementById('new-folder-name')?.addEventListener('keydown', e => { if (e.key === 'Enter') createFolder(); });
  document.getElementById('new-tag-val')?.addEventListener('keydown', e => { if (e.key === 'Enter') addTag(); });
  document.getElementById('rename-val')?.addEventListener('keydown', e => { if (e.key === 'Enter') doRename(); });

  /* ── Context menu: click/touch outside ── */
  document.addEventListener('click', hideCtx);
  document.addEventListener('touchstart', e => {
    const menu = document.getElementById('ctx-menu');
    if (menu && !menu.contains(e.target)) hideCtx();
  });

  /* ── Escape key ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      hideCtx();
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      closeMobileSidebar();
      const rp = document.getElementById('right-panel');
      if (rp && rp.classList.contains('open')) {
        rp.classList.remove('open');
        const o = document.getElementById('mobile-overlay');
        if (o) o.classList.remove('visible');
      }
    }
  });

  /* ── Keyboard shortcuts ── */
  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey)) return;
    switch (e.key.toLowerCase()) {
      case 'n':
        e.preventDefault();
        openNewNoteModal();
        break;
      case 'k':
        e.preventDefault();
        document.getElementById('global-search')?.focus();
        break;
      case 'e':
        e.preventDefault();
        {
          const modes = ['edit', 'split', 'preview'];
          setMode(modes[(modes.indexOf(currentMode) + 1) % modes.length]);
        }
        break;
      case 'g':
        e.preventDefault();
        {
          const gv = document.getElementById('graph-view');
          if (gv && gv.style.display !== 'none') hideGraph();
          else showGraph();
        }
        break;
      case 's':
        e.preventDefault();
        saveEditorToNote();
        saveVault();
        showToast('✦ Saved!');
        break;
    }
  });

  /* ── Mobile overlay click ── */
  const overlay = document.getElementById('mobile-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeMobileSidebar();
      const rp = document.getElementById('right-panel');
      if (rp && rp.classList.contains('open')) {
        rp.classList.remove('open');
        overlay.classList.remove('visible');
      }
    });
  }

  /* ── Resize: reinit graph if open ── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const gv = document.getElementById('graph-view');
      if (gv && gv.style.display !== 'none') {
        cancelAnimationFrame(graphAnim);
        initGraph();
      }
    }, 200);
  });

  /* ── Prevent pull-to-refresh on mobile (body scroll locked) ── */
  document.body.addEventListener('touchmove', e => {
    // Allow scroll inside overflow elements
    if (!e.target.closest('.sidebar-content, .note-editor, .preview-area, .panel-body, .graph-container')) {
      e.preventDefault();
    }
  }, { passive: false });

  /* ── Initialise ── */
  renderSidebar();
  updatePanel();

  // Open first note
  if (vault.notes.length) {
    openNote(vault.notes[0].id);
  }

  console.log(
    '%c✦ Notiva%c loaded — %d notes',
    'color:#9d7aff;font-weight:bold;font-size:14px',
    'color:gray;font-size:12px',
    vault.notes.length
  );
});
