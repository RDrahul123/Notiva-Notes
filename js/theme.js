/* ═══════════════════════════════════════════════
   js/theme.js  —  Light / dark theme toggle
   ═══════════════════════════════════════════════ */
'use strict';

(function(){
  let theme=localStorage.getItem('notiva_theme')||'dark';

  function applyTheme(t){
    theme=t;
    document.documentElement.setAttribute('data-theme',t);
    localStorage.setItem('notiva_theme',t);
    const m=document.getElementById('meta-theme-color');
    if(m) m.setAttribute('content',t==='dark'?'#111114':'#ffffff');
    const p=document.getElementById('theme-pill');
    if(p) p.setAttribute('aria-checked',t==='light'?'true':'false');
  }

  applyTheme(theme);

  document.addEventListener('DOMContentLoaded',function(){
    const pill=document.getElementById('theme-pill');
    if(!pill) return;
    pill.addEventListener('click',function(){
      const next=theme==='dark'?'light':'dark';
      applyTheme(next);
      showToast(next==='light'?'☀️ Light mode':'🌙 Dark mode');
      if(typeof graphAnim!=='undefined' && document.getElementById('graph-view') &&
         document.getElementById('graph-view').style.display!=='none'){
        cancelAnimationFrame(graphAnim); setTimeout(initGraph,60);
      }
    });
  });
})();
