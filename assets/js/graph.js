/**
 * graph.js — Force-directed knowledge graph
 * Supports mouse drag and touch interactions.
 */

let graphAnim  = null;
let graphNodes = [];
let graphEdges = [];
let graphDrag  = null;
let graphTouch = null; // for touch drag

function showGraph() {
  saveEditorToNote();
  document.getElementById('welcome-screen').style.display = 'none';
  document.getElementById('note-view').style.display      = 'none';
  document.getElementById('graph-view').style.display     = 'flex';
  document.getElementById('btn-graph').classList.add('active');
  setTimeout(initGraph, 60);
}

function hideGraph() {
  document.getElementById('graph-view').style.display = 'none';
  document.getElementById('btn-graph').classList.remove('active');
  cancelAnimationFrame(graphAnim);
  graphAnim = null;
  if (activeTabId) document.getElementById('note-view').style.display = 'flex';
  else             document.getElementById('welcome-screen').style.display = '';
}

function initGraph() {
  const canvas = document.getElementById('graph-canvas');
  const cont   = document.getElementById('graph-container');
  if (!canvas || !cont) return;

  canvas.width  = cont.clientWidth;
  canvas.height = cont.clientHeight;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;

  // Build nodes
  graphNodes = vault.notes.map((n, i) => {
    const angle = (i / Math.max(vault.notes.length, 1)) * Math.PI * 2;
    const r = Math.min(W, H) * 0.3;
    return {
      id: n.id, title: n.title,
      x: cx + r * Math.cos(angle) + (Math.random() - 0.5) * 80,
      y: cy + r * Math.sin(angle) + (Math.random() - 0.5) * 80,
      vx: 0, vy: 0,
      r: n.id === activeTabId ? 11 : 7,
    };
  });

  // Build edges from wikilinks
  graphEdges = [];
  vault.notes.forEach(n => {
    getWikilinks(n.content).forEach(lt => {
      const target = vault.notes.find(x => x.title.toLowerCase() === lt.toLowerCase());
      if (target) graphEdges.push({ from: n.id, to: target.id });
    });
  });

  // ── Mouse events ──
  canvas.onmousedown = e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    graphDrag = graphNodes.find(n => Math.hypot(n.x - mx, n.y - my) < n.r + 8) || null;
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
      if (Math.hypot(graphDrag.x - mx, graphDrag.y - my) < 4) {
        openNote(graphDrag.id);
      }
      graphDrag = null;
    }
  };

  // ── Touch events ──
  canvas.ontouchstart = e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    const tx = t.clientX - rect.left, ty = t.clientY - rect.top;
    graphTouch = {
      node: graphNodes.find(n => Math.hypot(n.x - tx, n.y - ty) < n.r + 16) || null,
      startX: tx, startY: ty
    };
    if (graphTouch.node) {
      graphDrag = graphTouch.node;
    }
  };
  canvas.ontouchmove = e => {
    e.preventDefault();
    if (!graphDrag) return;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches[0];
    graphDrag.x = t.clientX - rect.left;
    graphDrag.y = t.clientY - rect.top;
    graphDrag.vx = 0; graphDrag.vy = 0;
  };
  canvas.ontouchend = e => {
    if (graphDrag && graphTouch) {
      const rect = canvas.getBoundingClientRect();
      const t = e.changedTouches[0];
      const ex = t.clientX - rect.left, ey = t.clientY - rect.top;
      if (Math.hypot(ex - graphTouch.startX, ey - graphTouch.startY) < 8) {
        openNote(graphDrag.id);
      }
    }
    graphDrag = null;
    graphTouch = null;
  };

  // ── Animation loop ──
  cancelAnimationFrame(graphAnim);

  function tick() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Physics
    graphNodes.forEach(a => {
      graphNodes.forEach(b => {
        if (a === b) return;
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const f = 2600 / (d * d);
        a.vx += dx / d * f;
        a.vy += dy / d * f;
      });
      // Gravity toward center
      a.vx += (cx - a.x) * 0.003;
      a.vy += (cy - a.y) * 0.003;
    });

    graphEdges.forEach(e => {
      const a = graphNodes.find(n => n.id === e.from);
      const b = graphNodes.find(n => n.id === e.to);
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const d  = Math.max(1, Math.hypot(dx, dy));
      const f  = (d - 130) * 0.03;
      a.vx += dx / d * f; a.vy += dy / d * f;
      b.vx -= dx / d * f; b.vy -= dy / d * f;
    });

    graphNodes.forEach(n => {
      if (n === graphDrag) return;
      n.vx *= 0.84; n.vy *= 0.84;
      n.x += n.vx; n.y += n.vy;
      // Clamp to canvas
      n.x = Math.max(20, Math.min(W - 20, n.x));
      n.y = Math.max(20, Math.min(H - 20, n.y));
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
    graphEdges.forEach(e => {
      const a = graphNodes.find(n => n.id === e.from);
      const b = graphNodes.find(n => n.id === e.to);
      if (!a || !b) return;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = dark ? 'rgba(157,122,255,0.22)' : 'rgba(107,79,216,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Nodes
    graphNodes.forEach(n => {
      const isActive = n.id === activeTabId;

      // Glow for active node
      if (isActive) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 10, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r + 10);
        g.addColorStop(0, 'rgba(157,122,255,0.35)');
        g.addColorStop(1, 'rgba(157,122,255,0)');
        ctx.fillStyle = g; ctx.fill();
      }

      // Node circle
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle   = isActive ? '#9d7aff' : (dark ? '#2e2e48' : '#d0cce8');
      ctx.strokeStyle = isActive ? '#c4a6ff' : (dark ? '#5a5670' : '#a8a0c8');
      ctx.lineWidth   = 1.5;
      ctx.fill(); ctx.stroke();

      // Label
      ctx.fillStyle  = isActive ? (dark ? '#e8e6f0' : '#1a1825') : (dark ? '#9490a8' : '#4e4868');
      ctx.font       = (isActive ? '600 ' : '') + '11px Syne,sans-serif';
      ctx.textAlign  = 'center';
      const label    = n.title.slice(0, 22) + (n.title.length > 22 ? '…' : '');
      ctx.fillText(label, n.x, n.y + n.r + 14);
    });

    graphAnim = requestAnimationFrame(tick);
  }

  tick();
}
