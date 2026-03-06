/* ═══════════════════════════════════════════════
   js/graph.js  —  Interactive force-directed graph
   ═══════════════════════════════════════════════ */

'use strict';

let graphAnim = null;
let graphNodes = [];
let graphEdges = [];
let graphDrag = null;
let graphTouch = null; // for touch drag

function showGraph() {
  saveEditorToNote();
  document.getElementById('welcome-screen').style.display = 'none';
  document.getElementById('note-view').style.display = 'none';
  document.getElementById('graph-view').style.display = 'flex';
  document.getElementById('btn-graph').classList.add('active');
  setTimeout(initGraph, 60);
}

function hideGraph() {
  document.getElementById('graph-view').style.display = 'none';
  document.getElementById('btn-graph').classList.remove('active');
  if (graphAnim) { cancelAnimationFrame(graphAnim); graphAnim = null; }
  if (activeTabId) document.getElementById('note-view').style.display = 'flex';
  else document.getElementById('welcome-screen').style.display = '';
}

function initGraph() {
  const canvas = document.getElementById('graph-canvas');
  const container = document.getElementById('graph-container');
  if (!canvas || !container) return;

  // Set canvas pixel size
  const dpr = window.devicePixelRatio || 1;
  const W = container.clientWidth;
  const H = container.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const cx = W / 2, cy = H / 2;

  // Build nodes
  graphNodes = vault.notes.map((n, i) => {
    const angle = (i / vault.notes.length) * Math.PI * 2;
    const r = Math.min(W, H) * 0.3;
    return {
      id: n.id,
      title: n.title,
      x: cx + r * Math.cos(angle) + (Math.random() - 0.5) * 60,
      y: cy + r * Math.sin(angle) + (Math.random() - 0.5) * 60,
      vx: 0, vy: 0,
      r: n.id === activeTabId ? 11 : 7
    };
  });

  // Build edges from wikilinks
  graphEdges = [];
  vault.notes.forEach(n => {
    const links = [...(n.content || '').matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]);
    links.forEach(lt => {
      const target = vault.notes.find(x => x.title.toLowerCase() === lt.toLowerCase());
      if (target) graphEdges.push({ from: n.id, to: target.id });
    });
  });

  // ─── Mouse events ───
  canvas.onmousedown = e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    graphDrag = graphNodes.find(n => Math.hypot(n.x - mx, n.y - my) < n.r + 6) || null;
  };
  canvas.onmousemove = e => {
    if (!graphDrag) return;
    const rect = canvas.getBoundingClientRect();
    graphDrag.x = e.clientX - rect.left;
    graphDrag.y = e.clientY - rect.top;
    graphDrag.vx = 0; graphDrag.vy = 0;
  };
  canvas.onmouseup = e => {
    if (graphDrag) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      if (Math.hypot(graphDrag.x - mx, graphDrag.y - my) < 4) openNote(graphDrag.id);
      graphDrag = null;
    }
  };
  canvas.onmouseleave = () => { graphDrag = null; };

  // ─── Touch events ───
  canvas.ontouchstart = e => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const mx = touch.clientX - rect.left, my = touch.clientY - rect.top;
    graphTouch = { startX: mx, startY: my, time: Date.now() };
    graphDrag = graphNodes.find(n => Math.hypot(n.x - mx, n.y - my) < n.r + 10) || null;
  };
  canvas.ontouchmove = e => {
    e.preventDefault();
    if (!graphDrag) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    graphDrag.x = touch.clientX - rect.left;
    graphDrag.y = touch.clientY - rect.top;
    graphDrag.vx = 0; graphDrag.vy = 0;
  };
  canvas.ontouchend = e => {
    e.preventDefault();
    if (graphDrag && graphTouch) {
      const elapsed = Date.now() - graphTouch.time;
      const touch = e.changedTouches[0];
      const rect = canvas.getBoundingClientRect();
      const mx = touch.clientX - rect.left, my = touch.clientY - rect.top;
      const moved = Math.hypot(graphDrag.x - mx, graphDrag.y - my);
      // Tap (not drag): open note
      if (moved < 8 && elapsed < 400) openNote(graphDrag.id);
    }
    graphDrag = null;
    graphTouch = null;
  };

  if (graphAnim) cancelAnimationFrame(graphAnim);

  function tick() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Physics
    graphNodes.forEach(a => {
      graphNodes.forEach(b => {
        if (a === b) return;
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const f = 2400 / (d * d);
        a.vx += (dx / d) * f;
        a.vy += (dy / d) * f;
      });
      a.vx += (cx - a.x) * 0.003;
      a.vy += (cy - a.y) * 0.003;
    });

    graphEdges.forEach(edge => {
      const a = graphNodes.find(n => n.id === edge.from);
      const b = graphNodes.find(n => n.id === edge.to);
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      const f = (d - 120) * 0.03;
      a.vx += (dx / d) * f; a.vy += (dy / d) * f;
      b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
    });

    graphNodes.forEach(n => {
      if (n === graphDrag) return;
      n.vx *= 0.84; n.vy *= 0.84;
      n.x += n.vx; n.y += n.vy;
      // Clamp to canvas
      n.x = Math.max(n.r + 2, Math.min(W - n.r - 2, n.x));
      n.y = Math.max(n.r + 2, Math.min(H - n.r - 2, n.y));
    });

    // Draw
    ctx.clearRect(0, 0, W, H);

    // Grid dots
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
    for (let gx = 0; gx < W; gx += 40) {
      for (let gy = 0; gy < H; gy += 40) {
        ctx.beginPath(); ctx.arc(gx, gy, 1.2, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Edges
    graphEdges.forEach(edge => {
      const a = graphNodes.find(n => n.id === edge.from);
      const b = graphNodes.find(n => n.id === edge.to);
      if (!a || !b) return;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = dark ? 'rgba(157,122,255,0.2)' : 'rgba(107,79,216,0.18)';
      ctx.lineWidth = 1; ctx.stroke();
    });

    // Nodes
    graphNodes.forEach(n => {
      // Glow for active node
      if (n.id === activeTabId) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 10, 0, Math.PI * 2);
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r + 10);
        grd.addColorStop(0, 'rgba(157,122,255,0.35)');
        grd.addColorStop(1, 'rgba(157,122,255,0)');
        ctx.fillStyle = grd; ctx.fill();
      }

      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.id === activeTabId ? '#9d7aff' : (dark ? '#2e2e48' : '#d0cce8');
      ctx.strokeStyle = n.id === activeTabId ? '#c4a6ff' : (dark ? '#5a5670' : '#a8a0c8');
      ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();

      // Label
      const label = n.title.slice(0, 20) + (n.title.length > 20 ? '…' : '');
      ctx.fillStyle = n.id === activeTabId
        ? (dark ? '#e8e6f0' : '#1a1825')
        : (dark ? '#9490a8' : '#4e4868');
      ctx.font = (n.id === activeTabId ? '600 ' : '') + '11px Syne, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, n.x, n.y + n.r + 14);
    });

    graphAnim = requestAnimationFrame(tick);
  }

  tick();
}
