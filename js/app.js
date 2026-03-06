/* ═══════════════════════════════════════════════
   js/app.js  —  App init, keyboard shortcuts, glue
   ═══════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', function () {

  // ─── MODAL DISMISS ───
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', function (e) {
      if (e.target === m) m.classList.remove('open');
    });
  });

  // ─── MODAL ENTER KEY ───
  const enterPairs = [
    ['new-note-name', createNote],
    ['new-folder-name', createFolder],
    ['new-tag-val', addTag],
    ['rename-val', doRename]
  ];
  enterPairs.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') fn(); });
  });

  // ─── NEW NOTE / FOLDER BUTTONS ───
  const btnNewNote = document.getElementById('btn-new-note');
  if (btnNewNote) btnNewNote.addEventListener('click', openNewNoteModal);

  const btnNewFolder = document.getElementById('btn-new-folder');
  if (btnNewFolder) {
    btnNewFolder.addEventListener('click', function () {
      const inp = document.getElementById('new-folder-name');
      if (inp) inp.value = '';
      const modal = document.getElementById('modal-folder');
      if (modal) {
        modal.classList.add('open');
        setTimeout(() => inp && inp.focus(), 120);
      }
    });
  }

  // ─── CONTEXT MENU DISMISS ───
  document.addEventListener('click', hideCtx);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      hideCtx();
      // Close any open modal
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      // Close mobile sidebar
      closeMobileSidebar();
      closeMobilePanel();
    }
  });

  // ─── KEYBOARD SHORTCUTS ───
  document.addEventListener('keydown', function (e) {
    const ctrl = e.ctrlKey || e.metaKey;
    if (!ctrl) return;

    switch (e.key.toLowerCase()) {
      case 'n':
        e.preventDefault();
        openNewNoteModal();
        break;

      case 'k':
        e.preventDefault();
        const gs = document.getElementById('global-search');
        if (gs) gs.focus();
        break;

      case 'e':
        e.preventDefault();
        const modes = ['edit', 'split', 'preview'];
        const next = modes[(modes.indexOf(currentMode) + 1) % modes.length];
        setMode(next);
        break;

      case 'g':
        e.preventDefault();
        const gv = document.getElementById('graph-view');
        if (gv && gv.style.display !== 'none') hideGraph();
        else showGraph();
        break;

      case 's':
        e.preventDefault();
        saveEditorToNote();
        saveVault();
        showToast('✦ Saved!');
        break;

      case '\\':
        e.preventDefault();
        if (!isMobile()) {
          const sidebar = document.getElementById('sidebar');
          if (sidebar) sidebar.classList.toggle('collapsed');
          const btn = document.getElementById('btn-toggle-sidebar');
          if (btn) btn.classList.toggle('active', !sidebar.classList.contains('collapsed'));
        }
        break;
    }
  });

  // ─── KEYBOARD ACCESSIBILITY: tree items ───
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.classList.contains('tree-item')) {
      e.target.click();
    }
    if (e.key === 'Enter' && e.target.classList.contains('tree-folder')) {
      e.target.click();
    }
  });

  // ─── INIT ───
  renderSidebar();
  updatePanel();

  // Open first note on load
  if (vault.notes.length > 0) {
    openNote(vault.notes[0].id);
  }

  // On mobile, start on notes list view
  if (isMobile()) {
    mobileSwitchView('notes');
  }

  console.info('Notiva loaded. %d notes, %d folders.', vault.notes.length, vault.folders.length);
});
