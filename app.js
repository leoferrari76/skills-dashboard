// Merge all category data files into one array
const SKILLS = [...SKILLS_PD, ...SKILLS_FIGMA, ...SKILLS_DEV, ...SKILLS_SISTEMA, ...SKILLS_MEMORIA];

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────
let activeFilter = 'all';
let activeSkill  = null;
let currentView  = 'list';
let searchQuery  = '';
let graphInstance = null;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const CAT_COLORS = { pd: '#15803d', figma: '#1d4ed8', dev: '#be185d', sistema: '#c2410c', memoria: '#a16207' };

function typeLabel(t) {
  return { orquestrador:'Orquestrador', especialista:'Especialista', util:'Utilitário', memoria:'Memória' }[t] || t;
}
function badgeClass(t) {
  return { orquestrador:'badge-orq', especialista:'badge-esp', util:'badge-util', memoria:'badge-mem' }[t] || 'badge-util';
}

function filteredSkills() {
  const q = searchQuery.toLowerCase();
  return SKILLS.filter(s => {
    const matchCat = activeFilter === 'all' || s.category === activeFilter;
    const matchQ   = !q || s.name.toLowerCase().includes(q) || s.command.toLowerCase().includes(q)
      || s.description.toLowerCase().includes(q) || s.triggers.some(t => t.toLowerCase().includes(q));
    return matchCat && matchQ;
  });
}

function groupedSkills(skills) {
  const labels = { pd:'Product Design', figma:'Figma', dev:'Interface & Frontend', sistema:'Sistema', memoria:'Memória' };
  const g = {};
  skills.forEach(s => { (g[s.category] = g[s.category] || []).push(s); });
  return Object.entries(g).map(([cat, items]) => ({ label: labels[cat] || cat, items }));
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER CARDS (horizontal list)
// ─────────────────────────────────────────────────────────────────────────────
function renderCards() {
  const area = document.getElementById('cards-area');
  const noR  = document.getElementById('no-results');
  const skills = filteredSkills();

  document.getElementById('stat-total').textContent   = SKILLS.length;
  document.getElementById('stat-visible').textContent = skills.length;

  Array.from(area.children).forEach(c => { if (c.id !== 'no-results') c.remove(); });

  if (!skills.length) { noR.classList.add('visible'); return; }
  noR.classList.remove('visible');

  groupedSkills(skills).forEach(({ label, items }) => {
    const lbl = document.createElement('div');
    lbl.className = 'section-label';
    lbl.textContent = label;
    area.appendChild(lbl);

    items.forEach(skill => {
      const card = document.createElement('div');
      card.className = `card cat-${skill.category}${activeSkill?.id === skill.id ? ' active' : ''}`;
      card.dataset.id = skill.id;

      const relLabel = skill.relations.length
        ? `<span class="rel-count">${skill.relations.length} relação${skill.relations.length > 1 ? 'ões' : ''}</span>`
        : '';

      card.innerHTML = `
        <div class="card-icon">${getIcon(skill.icon, 18)}</div>
        <div class="card-left">
          <div class="card-name">${skill.name}</div>
          <div class="card-command">${skill.command}</div>
        </div>
        <div class="card-desc">${skill.description}</div>
        <div class="card-right">
          <span class="badge ${badgeClass(skill.type)}">${typeLabel(skill.type)}</span>
          ${relLabel}
          <button class="copy-btn" title="Copiar comando">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      `;

      card.addEventListener('click', e => {
        if (e.target.closest('.copy-btn')) return;
        selectSkill(skill);
      });
      card.querySelector('.copy-btn').addEventListener('click', e => {
        e.stopPropagation();
        copyText(skill.command, e.currentTarget);
      });

      area.appendChild(card);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────
function selectSkill(skill) {
  activeSkill = skill;

  document.querySelectorAll('.card').forEach(c => c.classList.toggle('active', c.dataset.id === skill.id));

  if (graphInstance) graphInstance.selectBySkillId(skill.id);

  document.getElementById('detail-empty').style.display   = 'none';
  const content = document.getElementById('detail-content');
  content.style.display = 'flex';

  const relHTML = skill.relations.map(r => {
    const s = SKILLS.find(x => x.id === r.id);
    if (!s) return '';
    const c = CAT_COLORS[s.category] || '#888';
    return `<div class="rel-item" data-id="${s.id}">
      <div class="rel-icon" style="background:${c}18; color:${c}">${getIcon(s.icon, 13)}</div>
      <div class="rel-text">
        <div class="rel-name">${s.name}</div>
        <div class="rel-desc">${r.rel}</div>
      </div>
      <div class="rel-arrow"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></div>
    </div>`;
  }).join('');

  const triggersHTML = skill.triggers.map(t => `<span class="trigger-tag">${t}</span>`).join('');

  content.innerHTML = `
    <div class="detail-top cat-${skill.category}">
      <div class="detail-icon">${getIcon(skill.icon, 22)}</div>
      <div class="detail-title">
        <h2>${skill.name}</h2>
        <div class="detail-cmd-row">
          <span class="detail-cmd" title="Clique para copiar" data-cmd="${skill.command}">${skill.command}</span>
          <span class="badge ${badgeClass(skill.type)}">${typeLabel(skill.type)}</span>
        </div>
      </div>
    </div>

    <div class="ds">
      <h3>O que faz</h3>
      <p>${skill.description}</p>
    </div>

    <div class="ds">
      <h3>Outcome</h3>
      <div class="outcome-box"><p>${skill.outcome}</p></div>
    </div>

    ${triggersHTML ? `<div class="ds"><h3>Gatilhos</h3><div class="triggers-list">${triggersHTML}</div></div>` : ''}

    ${relHTML ? `<div class="ds"><h3>Relações</h3><div class="relations-list">${relHTML}</div></div>` : ''}

    <div class="ds">
      <h3>Texto original</h3>
      <div class="fulltext-box">${skill.fullText}</div>
    </div>
  `;

  content.querySelector('.detail-cmd').addEventListener('click', e => copyText(skill.command, e.currentTarget));
  content.querySelectorAll('.rel-item').forEach(el => {
    el.addEventListener('click', () => {
      const s = SKILLS.find(x => x.id === el.dataset.id);
      if (s) selectSkill(s);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COPY
// ─────────────────────────────────────────────────────────────────────────────
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copiado!');
    if (btn) { btn.classList.add('copied'); setTimeout(() => btn.classList.remove('copied'), 1400); }
  });
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

// ─────────────────────────────────────────────────────────────────────────────
// FORCE-DIRECTED GRAPH
// ─────────────────────────────────────────────────────────────────────────────
class ForceGraph {
  constructor(canvas, skills, onSelect) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.skills   = skills;
    this.onSelect = onSelect;
    this.running  = true;
    this.alpha    = 1;
    this.dragging = null;
    this.hovered  = null;
    this.selected = null;
    this.mouseDownPos = null;

    this._resize();
    this._init();
    this._preloadIcons();
    this._bindEvents();
    this._tick();
  }

  _resize() {
    const c = this.canvas, p = c.parentElement;
    c.width  = p.clientWidth;
    c.height = p.clientHeight;
  }

  _init() {
    const W = this.canvas.width, H = this.canvas.height;
    const cx = W / 2, cy = H / 2;

    this.nodes = this.skills.map((skill, i) => {
      const angle = (i / this.skills.length) * Math.PI * 2;
      const r = 140 + (i % 3) * 50;
      return {
        skill,
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 40,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
        vx: 0, vy: 0,
        r: skill.type === 'orquestrador' ? 26 : 20,
      };
    });

    const edgeSet = new Set();
    this.edges = [];
    this.skills.forEach(skill => {
      skill.relations.forEach(rel => {
        const from = this.nodes.find(n => n.skill.id === skill.id);
        const to   = this.nodes.find(n => n.skill.id === rel.id);
        if (!from || !to) return;
        const key = [skill.id, rel.id].sort().join('|');
        if (edgeSet.has(key)) return;
        edgeSet.add(key);
        this.edges.push({ from, to, label: rel.rel });
      });
    });
  }

  _preloadIcons() {
    this.iconImages = {};
    this.skills.forEach(s => {
      const col = CAT_COLORS[s.category] || '#888888';
      this.iconImages[s.id] = makeIconImage(s.icon, col, 48);
    });
  }

  _update() {
    if (this.alpha < 0.002) return;
    const W = this.canvas.width, H = this.canvas.height;
    const cx = W / 2, cy = H / 2;

    const REPULSION   = 4000;
    const SPRING_K    = 0.06;
    const REST_LEN    = 160;
    const GRAVITY     = 0.015;
    const DAMPING     = 0.82;

    this.nodes.forEach(n => {
      if (n === this.dragging) return;
      let fx = 0, fy = 0;

      this.nodes.forEach(other => {
        if (other === n) return;
        const dx = n.x - other.x, dy = n.y - other.y;
        const d  = Math.max(Math.hypot(dx, dy), 25);
        const f  = REPULSION / (d * d);
        fx += (dx / d) * f;
        fy += (dy / d) * f;
      });

      this.edges.forEach(e => {
        let other = null;
        if (e.from === n) other = e.to;
        if (e.to   === n) other = e.from;
        if (!other) return;
        const dx = other.x - n.x, dy = other.y - n.y;
        const d  = Math.max(Math.hypot(dx, dy), 1);
        const f  = SPRING_K * (d - REST_LEN);
        fx += (dx / d) * f;
        fy += (dy / d) * f;
      });

      fx += (cx - n.x) * GRAVITY;
      fy += (cy - n.y) * GRAVITY;

      n.vx = (n.vx + fx) * DAMPING;
      n.vy = (n.vy + fy) * DAMPING;
      n.x  = Math.max(n.r + 20, Math.min(W - n.r - 20, n.x + n.vx));
      n.y  = Math.max(n.r + 24, Math.min(H - n.r - 24, n.y + n.vy));
    });

    this.alpha *= 0.992;
  }

  _draw() {
    const ctx = this.ctx;
    const W = this.canvas.width, H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    const isConnected = (n) => this.hovered &&
      this.edges.some(e => (e.from === this.hovered || e.to === this.hovered) && (e.from === n || e.to === n));

    this.edges.forEach(e => {
      const highlighted = this.hovered && (e.from === this.hovered || e.to === this.hovered);
      ctx.beginPath();
      ctx.moveTo(e.from.x, e.from.y);
      ctx.lineTo(e.to.x, e.to.y);
      ctx.strokeStyle = highlighted ? 'rgba(91,77,232,0.65)' : 'rgba(0,0,0,0.1)';
      ctx.lineWidth   = highlighted ? 1.8 : 1;
      ctx.stroke();

      if (highlighted) {
        const mx = (e.from.x + e.to.x) / 2;
        const my = (e.from.y + e.to.y) / 2;
        const angle = Math.atan2(e.to.y - e.from.y, e.to.x - e.from.x);
        ctx.beginPath();
        ctx.moveTo(mx + 8 * Math.cos(angle), my + 8 * Math.sin(angle));
        ctx.lineTo(mx + 8 * Math.cos(angle) - 10 * Math.cos(angle - 0.45), my + 8 * Math.sin(angle) - 10 * Math.sin(angle - 0.45));
        ctx.lineTo(mx + 8 * Math.cos(angle) - 10 * Math.cos(angle + 0.45), my + 8 * Math.sin(angle) - 10 * Math.sin(angle + 0.45));
        ctx.closePath();
        ctx.fillStyle = 'rgba(91,77,232,0.65)';
        ctx.fill();
      }
    });

    this.nodes.forEach(n => {
      const col       = CAT_COLORS[n.skill.category] || '#888';
      const isSelected= n === this.selected;
      const isHovered = n === this.hovered;
      const connected = isConnected(n);
      const dimmed    = this.hovered && !isHovered && !connected;

      ctx.globalAlpha = dimmed ? 0.3 : 1;

      if (isSelected || isHovered) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3.2);
        g.addColorStop(0, col + '50');
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? col + '18' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth   = isSelected ? 2.5 : isHovered ? 2 : 1.5;
      ctx.stroke();

      const img = this.iconImages[n.skill.id];
      if (img && img.complete && img.naturalWidth > 0) {
        const iconSize = Math.round(n.r * 1.1);
        ctx.drawImage(img, n.x - iconSize / 2, n.y - iconSize / 2, iconSize, iconSize);
      }

      ctx.font          = `${isHovered || isSelected ? '600 ' : ''}11px -apple-system, sans-serif`;
      ctx.fillStyle     = isHovered || isSelected ? '#18182a' : '#9090a8';
      ctx.textBaseline  = 'top';
      ctx.fillText(n.skill.name, n.x, n.y + n.r + 5);

      ctx.globalAlpha = 1;
    });

    const cats = [...new Set(this.skills.map(s => s.category))];
    const catLabels = { pd:'Product Design', figma:'Figma', dev:'Interface', sistema:'Sistema', memoria:'Memória' };
    let lx = 14, ly = H - 14 - cats.length * 18;
    cats.forEach(cat => {
      ctx.beginPath();
      ctx.arc(lx + 5, ly + 5, 5, 0, Math.PI * 2);
      ctx.fillStyle = CAT_COLORS[cat] || '#888';
      ctx.fill();
      ctx.font      = '11px -apple-system, sans-serif';
      ctx.fillStyle = '#62627a';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(catLabels[cat] || cat, lx + 14, ly + 5);
      ly += 18;
    });

    ctx.font      = '11px -apple-system, sans-serif';
    ctx.fillStyle = '#aaaabf';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Arraste os nós · Clique para detalhar', W - 14, H - 10);
  }

  _tick() {
    if (!this.running) return;
    this._update();
    this._draw();
    requestAnimationFrame(() => this._tick());
  }

  _bindEvents() {
    const c = this.canvas;
    c.addEventListener('mousedown', e => {
      const p = this._pos(e);
      this.mouseDownPos = p;
      const hit = this._hit(p);
      if (hit) { this.dragging = hit; hit.vx = 0; hit.vy = 0; this.alpha = Math.max(this.alpha, 0.4); }
    });
    c.addEventListener('mousemove', e => {
      const p = this._pos(e);
      this.hovered = this._hit(p);
      c.style.cursor = this.hovered ? 'pointer' : 'default';
      if (this.dragging) {
        this.dragging.x = p.x; this.dragging.y = p.y;
        this.dragging.vx = 0;  this.dragging.vy = 0;
      }
    });
    c.addEventListener('mouseup', e => {
      const p = this._pos(e);
      const moved = this.mouseDownPos && Math.hypot(p.x - this.mouseDownPos.x, p.y - this.mouseDownPos.y) > 5;
      if (!moved && this.dragging) {
        this.selected = this.dragging;
        this.onSelect(this.dragging.skill);
      }
      this.dragging = null; this.mouseDownPos = null;
    });
    c.addEventListener('mouseleave', () => { this.dragging = null; this.hovered = null; c.style.cursor = 'default'; });
  }

  _pos(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  _hit(p) { return this.nodes.find(n => Math.hypot(p.x - n.x, p.y - n.y) < n.r + 5) || null; }

  selectBySkillId(id) {
    const n = this.nodes.find(n => n.skill.id === id);
    if (n) this.selected = n;
  }

  destroy() { this.running = false; }
}

// ─────────────────────────────────────────────────────────────────────────────
// VIEW SWITCHING
// ─────────────────────────────────────────────────────────────────────────────
function showList() {
  document.getElementById('cards-area').style.display = 'flex';
  document.getElementById('graph-area').classList.remove('active');
  if (graphInstance) { graphInstance.destroy(); graphInstance = null; }
}

function showGraph() {
  document.getElementById('cards-area').style.display = 'none';
  const ga = document.getElementById('graph-area');
  ga.classList.add('active');

  setTimeout(() => {
    const canvas = document.getElementById('graph-canvas');
    graphInstance = new ForceGraph(canvas, SKILLS, skill => {
      selectSkill(skill);
      document.querySelectorAll('.card').forEach(c => c.classList.toggle('active', c.dataset.id === skill.id));
    });
  }, 50);
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────────────────────
document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value;
  if (currentView === 'list') renderCards();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    if (currentView === 'list') renderCards();
  });
});

document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    if (currentView === 'list') showList();
    else showGraph();
  });
});

window.addEventListener('resize', () => {
  if (graphInstance) graphInstance._resize();
});

// ── RESIZABLE PANEL ──────────────────────────────────────────────────────────
(function () {
  const handle = document.getElementById('resize-handle');
  const panel  = document.getElementById('detail-panel');
  let dragging = false, startX = 0, startW = 0;

  handle.addEventListener('mousedown', e => {
    dragging = true;
    startX   = e.clientX;
    startW   = panel.offsetWidth;
    handle.classList.add('dragging');
    document.body.style.cursor     = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const delta = startX - e.clientX;
    const newW  = Math.min(Math.max(startW + delta, 220), window.innerWidth * 0.6);
    panel.style.width = newW + 'px';
    if (graphInstance) graphInstance._resize();
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
    document.body.style.cursor     = '';
    document.body.style.userSelect = '';
  });
})();

// ─────────────────────────────────────────────────────────────────────────────
// COMMAND PALETTE
// ─────────────────────────────────────────────────────────────────────────────
(function () {
  const overlay  = document.getElementById('palette-overlay');
  const input    = document.getElementById('palette-input');
  const results  = document.getElementById('palette-results');
  let selectedIdx = 0;
  let matches     = [];

  function open() {
    overlay.classList.add('open');
    input.value = '';
    input.focus();
    renderResults('');
  }

  function close() {
    overlay.classList.remove('open');
    input.blur();
  }

  function score(skill, q) {
    if (!q) return 1;
    const lq   = q.toLowerCase();
    const name = skill.name.toLowerCase();
    const cmd  = skill.command.toLowerCase();
    const desc = skill.description.toLowerCase();
    const trigs = skill.triggers.join(' ').toLowerCase();
    if (cmd.includes(lq))  return 100;
    if (name.startsWith(lq)) return 90;
    if (name.includes(lq))   return 70;
    if (desc.includes(lq))   return 40;
    if (trigs.includes(lq))  return 30;
    let i = 0;
    for (const c of name) { if (c === lq[i]) i++; if (i === lq.length) return 15; }
    return 0;
  }

  function highlight(text, q) {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx)
      + `<mark>${text.slice(idx, idx + q.length)}</mark>`
      + text.slice(idx + q.length);
  }

  function catColor(cat) { return CAT_COLORS[cat] || '#888'; }
  const catBg = { pd: 'var(--green-soft)', figma: 'var(--blue-soft)', dev: 'var(--pink-soft)', sistema: 'var(--orange-soft)', memoria: 'var(--yellow-soft)' };

  function renderResults(q) {
    matches = SKILLS
      .map(s => ({ skill: s, sc: score(s, q) }))
      .filter(x => x.sc > 0)
      .sort((a, b) => b.sc - a.sc)
      .map(x => x.skill);

    if (!matches.length) {
      results.innerHTML = `<div class="palette-empty">Nenhuma skill encontrada para "<strong>${q}</strong>"</div>`;
      return;
    }

    selectedIdx = 0;
    results.innerHTML = matches.map((s, i) => `
      <div class="palette-item${i === 0 ? ' selected' : ''}" data-idx="${i}">
        <div class="palette-item-icon" style="background:${catBg[s.category]};color:${catColor(s.category)}">${getIcon(s.icon, 16)}</div>
        <div class="palette-item-body">
          <div class="palette-item-name">${highlight(s.name, q)}</div>
          <div class="palette-item-desc">${s.description.slice(0, 72)}…</div>
        </div>
        <div class="palette-item-cmd">${s.command}</div>
      </div>
    `).join('');

    results.querySelectorAll('.palette-item').forEach(el => {
      el.addEventListener('mouseenter', () => setSelected(+el.dataset.idx));
      el.addEventListener('click', () => confirm(matches[+el.dataset.idx]));
    });
  }

  function setSelected(idx) {
    selectedIdx = Math.max(0, Math.min(idx, matches.length - 1));
    results.querySelectorAll('.palette-item').forEach((el, i) =>
      el.classList.toggle('selected', i === selectedIdx)
    );
    results.querySelector('.selected')?.scrollIntoView({ block: 'nearest' });
  }

  function confirm(skill) {
    copyText(skill.command, null);
    showToast(`Copiado: ${skill.command}`);
    close();
    selectSkill(skill);
  }

  input.addEventListener('input', () => renderResults(input.value.trim()));

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(selectedIdx + 1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(selectedIdx - 1); }
    if (e.key === 'Enter' && matches[selectedIdx]) confirm(matches[selectedIdx]);
    if (e.key === 'Escape') close();
  });

  overlay.addEventListener('mousedown', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? close() : open();
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
})();

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
renderCards();
