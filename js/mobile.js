/* ═══════════════════════════════════════════════
   js/mobile.js  —  Mobile UX: nav, drawers, touch
   ═══════════════════════════════════════════════ */

'use strict';

let mobileView = 'notes'; // 'notes' | 'editor' | 'graph' | 'info'

function isMobile() {
  return window.innerWidth <= 640;
}

// ─── BOTTOM NAV VIEW SWITCHER ───
function mobileSwitchView(view) {
  if (!isMobile()) return;
  mobileView = view;

  // Update nav button states
  ['notes', 'editor', 'graph', 'info'].forEach(v => {
    const btn = document.getElementById('mbn-' + v);
    if (btn) btn.classList.toggle('active', v === view);
  });

  // Close sidebar overlay when switching away from notes
  if (view !== 'notes') closeMobileSidebar();

  switch (view) {
    case 'notes':
      openMobileSidebar();
      break;

    case 'editor':
      closeMobileSidebar();
      closeMobilePanel();
      hideGraph();
      if (activeTabId) {
        document.getElementById('note-view').style.display = 'flex';
        document.getElementById('welcome-screen').style.display = 'none';
      } else {
        document.getElementById('welcome-screen').style.display = '';
        document.getElementById('note-view').style.display = 'none';
      }
      break;

    case 'graph':
      closeMobileSidebar();
      closeMobilePanel();
      showGraph();
      break;

    case 'info':
      closeMobileSidebar();
      openMobilePanel();
      break;
  }
}

// ─── SIDEBAR DRAWER ───
function openMobileSidebar() {
  if (!isMobile()) return;
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.add('mobile-open');
  if (overlay) {
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (overlay) {
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
  }
}

// ─── RIGHT PANEL BOTTOM SHEET ───
function openMobilePanel() {
  if (!isMobile()) return;
  const panel = document.getElementById('right-panel');
  if (panel) panel.classList.add('mobile-open');
  updatePanel();
}

function closeMobilePanel() {
  const panel = document.getElementById('right-panel');
  if (panel) panel.classList.remove('mobile-open');
}

// ─── MOBILE SEARCH BAR ───
document.addEventListener('DOMContentLoaded', function () {
  const btnSearch = document.getElementById('btn-mobile-search');
  const searchBar = document.getElementById('mobile-search-bar');
  const closeSearch = document.getElementById('btn-close-mobile-search');
  const mobileInput = document.getElementById('mobile-search-input');

  if (btnSearch) {
    btnSearch.addEventListener('click', function () {
      if (!searchBar) return;
      searchBar.classList.add('open');
      searchBar.setAttribute('aria-hidden', 'false');
      if (mobileInput) setTimeout(() => mobileInput.focus(), 100);
    });
  }

  if (closeSearch) {
    closeSearch.addEventListener('click', function () {
      if (searchBar) {
        searchBar.classList.remove('open');
        searchBar.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (mobileInput) {
    mobileInput.addEventListener('input', function () {
      const q = mobileInput.value;
      // Mirror to sidebar search
      const sideSearch = document.getElementById('side-search');
      const gs = document.getElementById('global-search');
      if (sideSearch) { sideSearch.value = q; doSearch(); }
      if (gs) gs.value = q;
      // Open sidebar search tab
      if (q) switchSideTab('search', document.querySelectorAll('.sidebar-tab')[1]);
    });

    mobileInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (searchBar) {
          searchBar.classList.remove('open');
          searchBar.setAttribute('aria-hidden', 'true');
        }
      }
    });
  }

  // Overlay closes sidebar on mobile
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }

  // Panel close on swipe down (touch)
  const panel = document.getElementById('right-panel');
  if (panel) {
    let touchStartY = 0;
    panel.addEventListener('touchstart', function (e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    panel.addEventListener('touchmove', function (e) {
      const dy = e.touches[0].clientY - touchStartY;
      if (dy > 60) closeMobilePanel();
    }, { passive: true });
  }

  // Sidebar toggle on desktop (existing button)
  const btnSidebar = document.getElementById('btn-toggle-sidebar');
  if (btnSidebar) {
    btnSidebar.addEventListener('click', function () {
      if (isMobile()) {
        // Toggle mobile drawer
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('mobile-open')) {
          closeMobileSidebar();
        } else {
          openMobileSidebar();
        }
      } else {
        // Desktop collapse
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('collapsed');
        btnSidebar.classList.toggle('active', !sidebar.classList.contains('collapsed'));
      }
    });
  }

  // Right panel toggle
  const btnPanel = document.getElementById('btn-toggle-panel');
  if (btnPanel) {
    btnPanel.addEventListener('click', function () {
      if (isMobile()) {
        const panel = document.getElementById('right-panel');
        if (panel && panel.classList.contains('mobile-open')) {
          closeMobilePanel();
        } else {
          openMobilePanel();
          mobileView = 'info';
          document.querySelectorAll('.mbn-btn').forEach(b => b.classList.remove('active'));
          const infoBtn = document.getElementById('mbn-info');
          if (infoBtn) infoBtn.classList.add('active');
        }
      } else {
        const panel = document.getElementById('right-panel');
        if (panel) panel.classList.toggle('collapsed');
        btnPanel.classList.toggle('active');
      }
    });
  }

  // Graph toggle button
  const btnGraph = document.getElementById('btn-graph');
  if (btnGraph) {
    btnGraph.addEventListener('click', function () {
      const gv = document.getElementById('graph-view');
      if (gv && gv.style.display !== 'none') {
        hideGraph();
        if (isMobile()) {
          mobileView = 'editor';
          mobileSwitchView('editor');
        }
      } else {
        showGraph();
        if (isMobile()) {
          mobileView = 'graph';
          document.querySelectorAll('.mbn-btn').forEach(b => b.classList.remove('active'));
          const graphBtn = document.getElementById('mbn-graph');
          if (graphBtn) graphBtn.classList.add('active');
        }
      }
    });
  }

  // Handle resize: clean up mobile state when going back to desktop
  window.addEventListener('resize', function () {
    if (!isMobile()) {
      closeMobileSidebar();
      closeMobilePanel();
      // Restore sidebar default
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.remove('mobile-open');
        if (!sidebar.classList.contains('collapsed')) {
          sidebar.style.transform = '';
        }
      }
    }
  });

  // Welcome "Create First Note" button
  const wBtn = document.getElementById('welcome-new-btn');
  if (wBtn) wBtn.addEventListener('click', openNewNoteModal);
});
