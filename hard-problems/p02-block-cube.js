/* ==========================================================================
   難題解說 第 2 題：長方體積木拼正方體（1上 2-2 考卷 非選擇題 2）
   積木長 12、寬 8、高 9 公分，同方向堆疊成正方體：
   三個方向各自排 → 邊長是 12、8、9 的公倍數 → 最小 72 →
   鋪一層 6×9=54 塊 → 疊 8 層 → 432 塊。
   以等角投影畫立體積木，可拖曳旋轉。世界座標 x＝長、y＝高、z＝寬（公分）。
   ========================================================================== */
(function () {
  'use strict';

  const SX = 12, SY = 9, SZ = 8;                  // 長、高、寬
  const EDGE = 72;                                // [12, 8, 9]
  const NX = EDGE / SX, NY = EDGE / SY, NZ = EDGE / SZ;   // 6、8、9
  const COL_X = '#38bdf8', COL_Y = '#4ade80', COL_Z = '#fbbf24';
  const W = 1000, H = 560;
  const VIEW0 = { yaw: 0.62, pitch: 0.46 };
  const CHIPS = [24, 36, 48, 72, 144];
  const STEP_DUR = [500, 2800, 900, 3200, 3400, 500];

  const STEPS = [
    {
      name: '① 看懂題目',
      html: `<h3>① 看懂題目</h3>
        一塊積木：<span class="hl-len">長 12 公分</span>、<span class="hl-wid">寬 8 公分</span>、<span class="hl-hei">高 9 公分</span>。
        要用很多塊<strong>同方向</strong>擺好的積木，拼成一個<strong>正方體</strong>（長、寬、高一樣長）。<br>
        問：<span class="hl-key">至少</span>要幾塊？（可以拖曳畫面，把積木轉來轉去看看。）`
    },
    {
      name: '② 三個方向排排看',
      html: `<h3>② 三個方向各自排</h3>
        積木都同方向擺，所以：<br>
        <span class="hl-len">長的方向</span>只能排出 12、24、36、… → <strong>12 的倍數</strong><br>
        <span class="hl-wid">寬的方向</span>只能排出 8、16、24、… → <strong>8 的倍數</strong><br>
        <span class="hl-hei">高的方向</span>只能排出 9、18、27、… → <strong>9 的倍數</strong><br>
        正方體三邊要一樣長，所以邊長必須是 12、8、9 的 <span class="hl-key">公倍數</span>。`
    },
    {
      name: '③ 最小公倍數',
      html: `<h3>③ 邊長最小是多少？</h3>
        要「至少幾塊」，正方體就要最小，邊長取 <span class="hl-key">最小公倍數</span>：
        <div class="short-div c4">
          <span class="d">2</span><span class="u">12</span><span class="u">8</span><span class="u">9</span>
          <span class="d">2</span><span class="u">6</span><span class="u">4</span><span class="u">9</span>
          <span class="d">3</span><span class="u">3</span><span class="u">2</span><span class="u">9</span>
          <span></span><span>1</span><span>2</span><span>3</span>
        </div><br>
        \\([12,8,9]=2\\times 2\\times 3\\times 1\\times 2\\times 3=72\\)，最小的正方體邊長 <span class="hl-key">72 公分</span>（虛線框）。`
    },
    {
      name: '④ 鋪第一層',
      html: `<h3>④ 先鋪滿最底下一層</h3>
        <span class="hl-len">長的方向</span>：\\(72\\div 12=6\\) 塊；
        <span class="hl-wid">寬的方向</span>：\\(72\\div 8=9\\) 塊。<br>
        一層共 \\(6\\times 9=54\\) 塊。`
    },
    {
      name: '⑤ 往上疊',
      html: `<h3>⑤ 一層一層往上疊</h3>
        <span class="hl-hei">高的方向</span>：\\(72\\div 9=8\\) 層。<br>
        共 \\(54\\times 8=432\\) 塊。`
    },
    {
      name: '⑥ 答案與檢查',
      html: `<h3>⑥ 答案與檢查</h3>
        \\(\\dfrac{72}{12}\\times\\dfrac{72}{8}\\times\\dfrac{72}{9}=6\\times 9\\times 8=432\\)（塊）<br>
        用體積檢查：正方體 \\(72\\times72\\times72=373248\\)，一塊積木 \\(12\\times8\\times9=864\\)，
        \\(373248\\div864=432\\) ✓<br>
        答：至少需要 <span class="hl-key">432 塊</span>。`
    }
  ];

  const canvas = document.getElementById('p2-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const explain = document.getElementById('p2-explain');
  const dotsBox = document.getElementById('p2-dots');
  const btnPrev = document.getElementById('p2-prev');
  const btnNext = document.getElementById('p2-next');
  const btnReplay = document.getElementById('p2-replay');
  const btnView = document.getElementById('p2-view');
  const tryBox = document.getElementById('p2-try');
  const chipsBox = document.getElementById('p2-chips');
  const tryNote = document.getElementById('p2-try-note');

  const st = { step: 0, L: EDGE, anim: 1, animStart: 0, animDur: 0, yaw: VIEW0.yaw, pitch: VIEW0.pitch };
  let rafId = 0;

  /* ---------- 小工具 ---------- */
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const fmt = v => Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
  /* 依序出現：第 n 個（共 N 個）在進度 p 時的出現程度，w 為重疊寬度 */
  const seqQ = (p, n, N, w = 3) => clamp01((p * (N + w) - n) / w);

  /* ---------- 投影 ---------- */
  let view = { s: 1, ox: 0, oy: 0 };
  function rot(x, y, z) {
    const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw);
    const cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
    const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
    return { x: x1, y: y * cp - z1 * sp, d: y * sp + z1 * cp };
  }
  function proj(x, y, z) {
    const r = rot(x, y, z);
    return { x: view.ox + r.x * view.s, y: view.oy - r.y * view.s, d: r.d };
  }
  function setView(frame) {
    const E = Math.max(frame.X, frame.Y, frame.Z);
    view.s = 235 / E;
    const c = rot(frame.X / 2, frame.Y / 2, frame.Z / 2);
    view.ox = W / 2 - c.x * view.s;
    view.oy = H / 2 + 12 + c.y * view.s;
  }

  /* ---------- 場景：依步驟與進度產生積木、框線、標籤 ---------- */
  function scene() {
    const p = st.anim, step = st.step;
    const blocks = [];        // {i,j,k,q}  q：0→1 落下出現
    const labels = [];
    let frame = { X: EDGE, Y: EDGE, Z: EDGE }, wire = null, wireA = 1, counter = null;
    const add = (i, j, k, q = 1) => { if (q > 0) blocks.push({ i, j, k, q }); };

    if (step === 0) {
      frame = { X: SX, Y: SY, Z: SZ };
      add(0, 0, 0, easeOut(clamp01(p * 1.2)));
      labels.push({ t: 'dim', ax: 'x', text: '長 12', col: COL_X },
                  { t: 'dim', ax: 'z', text: '寬 8', col: COL_Z },
                  { t: 'dim', ax: 'y', text: '高 9', col: COL_Y });
    } else if (step === 1 || step === 2) {
      const pr = step === 1 ? p : 1;
      add(0, 0, 0);
      let nx = 1, ny = 1, nz = 1;
      for (let i = 1; i < NX; i++) { const q = seqQ(pr, i - 1, NX - 1, 1.5); add(i, 0, 0, q); if (q >= 1) nx = i + 1; }
      for (let k = 1; k < NZ; k++) { const q = seqQ(pr, k - 1, NZ - 1, 1.5); add(0, 0, k, q); if (q >= 1) nz = k + 1; }
      for (let j = 1; j < NY; j++) { const q = seqQ(pr, j - 1, NY - 1, 1.5); add(0, j, 0, q); if (q >= 1) ny = j + 1; }
      labels.push({ t: 'tip', p: [nx * SX, SY / 2, SZ / 2], text: `長 12×${nx}＝${nx * SX}`, col: COL_X },
                  { t: 'tip', p: [SX / 2, SY / 2, nz * SZ], text: `寬 8×${nz}＝${nz * SZ}`, col: COL_Z },
                  { t: 'tip', p: [SX / 2, ny * SY, SZ / 2], text: `高 9×${ny}＝${ny * SY}`, col: COL_Y });
      if (step === 2) {
        wire = EDGE; wireA = ease(clamp01(p * 1.4));
        labels.length = 0;
        labels.push({ t: 'dim', ax: 'x', text: '72', col: COL_X },
                    { t: 'dim', ax: 'z', text: '72', col: COL_Z },
                    { t: 'dim', ax: 'y', text: '72', col: COL_Y });
      }
    } else if (step === 3) {
      wire = EDGE;
      let n = 0, done = 0;
      for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++, n++) {
        const q = seqQ(p, n, NX * NZ, 4); add(i, 0, k, q); if (q >= 1) done++;
      }
      counter = `積木：${done} 塊`;
      labels.push({ t: 'dim', ax: 'x', text: '72÷12＝6 塊', col: COL_X },
                  { t: 'dim', ax: 'z', text: '72÷8＝9 塊', col: COL_Z });
    } else if (step === 4) {
      wire = EDGE; wireA = 1 - clamp01((p - 0.9) / 0.1);   // 疊滿後虛線框淡出
      let layers = 1;
      for (let j = 0; j < NY; j++) {
        const q = j === 0 ? 1 : seqQ(p, j - 1, NY - 1, 1.2);
        if (q >= 1) layers = j + 1;
        for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) add(i, j, k, q);
      }
      counter = `${layers} 層 × 54 塊 ＝ ${layers * 54} 塊`;
      labels.push({ t: 'dim', ax: 'x', text: '6 塊', col: COL_X },
                  { t: 'dim', ax: 'z', text: '9 塊', col: COL_Z },
                  { t: 'dim', ax: 'y', text: '72÷9＝8 層', col: COL_Y });
    } else {
      const L = st.L;
      frame = { X: L, Y: L, Z: L };
      wire = L;
      const nx = Math.floor(L / SX), ny = Math.floor(L / SY), nz = Math.floor(L / SZ);
      const q = easeOut(clamp01(p * 1.5));
      for (let j = 0; j < ny; j++) for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) add(i, j, k, q);
      const ok = L % SX === 0 && L % SY === 0 && L % SZ === 0;
      if (ok) wire = null;                                   // 拼滿就不必再畫框
      counter = ok ? `${nx}×${nz}×${ny} ＝ ${nx * ny * nz} 塊` : '拼不成正方體';
      const t = (d, name) => `${name} ${L}÷${d}＝${fmt(L / d)}${L % d === 0 ? '' : ' ✗'}`;
      labels.push({ t: 'dim', ax: 'x', text: t(SX, '長'), col: L % SX ? '#f87171' : COL_X },
                  { t: 'dim', ax: 'z', text: t(SZ, '寬'), col: L % SZ ? '#f87171' : COL_Z },
                  { t: 'dim', ax: 'y', text: t(SY, '高'), col: L % SY ? '#f87171' : COL_Y });
    }
    return { blocks, labels, frame, wire, wireA, counter };
  }

  /* ---------- 繪圖 ---------- */
  const FACES = [   // 法向量、四角（以 0/1 表示 x,y,z 端點）
    { n: [0, 1, 0], c: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]], shade: 1.0 },
    { n: [0, -1, 0], c: [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0]], shade: 0.5 },
    { n: [0, 0, 1], c: [[0, 0, 1], [0, 1, 1], [1, 1, 1], [1, 0, 1]], shade: 0.82 },
    { n: [0, 0, -1], c: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], shade: 0.82 },
    { n: [1, 0, 0], c: [[1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 0]], shade: 0.66 },
    { n: [-1, 0, 0], c: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]], shade: 0.66 }
  ];
  const BASE = [[167, 139, 250], [129, 140, 248]];

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function pill(x, y, text, col, size = 22, left = false) {
    ctx.font = `700 ${size}px 'Noto Sans TC', 'Outfit', sans-serif`;
    const w = ctx.measureText(text).width + 22, h = size + 14;
    if (left) x += w / 2;           // x 為左緣

    roundRect(x - w / 2, y - h / 2, w, h, 10);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y + 1);
  }

  function drawBlocks(blocks) {
    // 佔位表：完整出現的積木才會遮住鄰居的面
    const key = (i, j, k) => i + ',' + j + ',' + k;
    const occ = new Set();
    blocks.forEach(b => { if (b.q >= 1) occ.add(key(b.i, b.j, b.k)); });
    const vis = FACES.map(f => rot(f.n[0], f.n[1], f.n[2]).d > 1e-6);

    const list = [];
    for (const b of blocks) {
      const x0 = b.i * SX, z0 = b.k * SZ;
      const y0 = b.j * SY + (1 - easeOut(b.q)) * SY * 2.5;
      const faces = [];
      FACES.forEach((f, fi) => {
        if (!vis[fi]) return;
        if (b.q >= 1 && occ.has(key(b.i + f.n[0], b.j + f.n[1], b.k + f.n[2]))) return;
        faces.push(f);
      });
      if (!faces.length) continue;
      list.push({ b, x0, y0, z0, faces, d: proj(x0 + SX / 2, y0 + SY / 2, z0 + SZ / 2).d });
    }
    list.sort((a, b) => a.d - b.d);

    ctx.lineJoin = 'round';
    for (const it of list) {
      const base = BASE[(it.b.i + it.b.j + it.b.k) % 2];
      ctx.globalAlpha = it.b.q >= 1 ? 1 : 0.25 + 0.75 * it.b.q;
      for (const f of it.faces) {
        ctx.beginPath();
        f.c.forEach((c, n) => {
          const pt = proj(it.x0 + c[0] * SX, it.y0 + c[1] * SY, it.z0 + c[2] * SZ);
          n ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y);
        });
        ctx.closePath();
        const s = f.shade;
        ctx.fillStyle = `rgb(${base[0] * s | 0}, ${base[1] * s | 0}, ${base[2] * s | 0})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.lineWidth = Math.max(0.6, Math.min(1.6, view.s * 0.18));
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawWire(L, a) {
    const C = [];
    for (let n = 0; n < 8; n++) C.push(proj((n & 1) * L, (n >> 1 & 1) * L, (n >> 2 & 1) * L));
    const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    ctx.save();
    ctx.globalAlpha = a;
    ctx.setLineDash([8, 7]);
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.7)';
    ctx.lineWidth = 2;
    E.forEach(([u, v]) => { ctx.beginPath(); ctx.moveTo(C[u].x, C[u].y); ctx.lineTo(C[v].x, C[v].y); ctx.stroke(); });
    ctx.restore();
  }

  /* 選出某軸方向最「外側」的那條稜，畫彩色尺寸線與標籤 */
  function drawDim(lb, frame) {
    const { X, Y, Z } = frame;
    let a, b;
    if (lb.ax === 'x') {
      const z = proj(0, 0, 0).y > proj(0, 0, Z).y ? 0 : Z;
      a = [0, 0, z]; b = [X, 0, z];
    } else if (lb.ax === 'z') {
      const x = proj(0, 0, 0).y > proj(X, 0, 0).y ? 0 : X;
      a = [x, 0, 0]; b = [x, 0, Z];
    } else {
      let best = null;
      [[0, 0], [X, 0], [0, Z], [X, Z]].forEach(([x, z]) => {
        const pt = proj(x, 0, z);
        if (!best || pt.x < best.pt.x) best = { x, z, pt };
      });
      a = [best.x, 0, best.z]; b = [best.x, Y, best.z];
    }
    const pa = proj(...a), pb = proj(...b), pc = proj(X / 2, Y / 2, Z / 2);
    const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
    let dx = mx - pc.x, dy = my - pc.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const off = 14;
    ctx.save();
    ctx.strokeStyle = lb.col;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pa.x + dx * off, pa.y + dy * off);
    ctx.lineTo(pb.x + dx * off, pb.y + dy * off);
    ctx.stroke();
    ctx.restore();
    pill(mx + dx * 50, my + dy * 42, lb.text, lb.col);
  }

  function drawTip(lb) {
    const o = proj(0, 0, 0), t = proj(...lb.p);
    let dx = t.x - o.x, dy = t.y - o.y;
    const len = Math.hypot(dx, dy) || 1;
    pill(t.x + dx / len * 80, t.y + dy / len * 34, lb.text, lb.col, 20);
  }

  function draw() {
    const k = canvas.width / W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const sc = scene();
    setView(sc.frame);

    drawBlocks(sc.blocks);
    if (sc.wire) drawWire(sc.wire, sc.wireA);
    sc.labels.forEach(lb => lb.t === 'dim' ? drawDim(lb, sc.frame) : drawTip(lb));
    if (sc.counter) pill(20, 40, sc.counter, '#f8fafc', 22, true);

    ctx.font = `500 16px 'Noto Sans TC', sans-serif`;
    ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('拖曳畫面可旋轉', W - 18, H - 16);
  }

  /* ---------- 動畫與步驟 ---------- */
  function tick(now) {
    st.anim = st.animDur ? clamp01((now - st.animStart) / st.animDur) : 1;
    draw();
    rafId = st.anim < 1 ? requestAnimationFrame(tick) : 0;
  }

  function play() {
    cancelAnimationFrame(rafId);
    st.animDur = STEP_DUR[st.step];
    st.animStart = performance.now();
    st.anim = 0;
    rafId = requestAnimationFrame(tick);
  }

  function renderTryNote() {
    const L = st.L;
    const bad = [[SX, '長', 12], [SZ, '寬', 8], [SY, '高', 9]].filter(([d]) => L % d);
    if (!bad.length) {
      const n = (L / SX) * (L / SZ) * (L / SY);
      tryNote.innerHTML = `<span class="ok">✓ ${L} 是 12、8、9 的公倍數</span>，拼得成正方體，要
        ${L / SX}×${L / SZ}×${L / SY}＝${n} 塊。` +
        (L === EDGE ? '72 是最小公倍數，所以這是最少的塊數。' : '但它比 72 大，用的積木不是最少。');
    } else {
      tryNote.innerHTML = `<span class="bad">✗ ${L} 不是 ${bad.map(b => b[2]).join('、')} 的倍數</span>，` +
        bad.map(([d, name]) => `${name}的方向 ${L}÷${d}＝${fmt(L / d)}，排不剛好`).join('；') + '，虛線框裡留下空隙。';
    }
  }

  function renderUi() {
    dotsBox.querySelectorAll('.step-dot').forEach((b, i) => {
      b.classList.toggle('active', i === st.step);
      b.classList.toggle('done', i < st.step);
    });
    btnPrev.disabled = st.step === 0;
    btnNext.disabled = st.step === STEPS.length - 1;
    explain.innerHTML = STEPS[st.step].html;
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([explain]).catch(() => {});
    tryBox.hidden = st.step < 5;
    chipsBox.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', +c.dataset.l === st.L));
    renderTryNote();
  }

  function goStep(i) {
    st.step = Math.max(0, Math.min(STEPS.length - 1, i));
    if (st.step < 5) st.L = EDGE;
    renderUi();
    play();
  }

  STEPS.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'step-dot';
    b.textContent = s.name;
    b.addEventListener('click', () => goStep(i));
    dotsBox.appendChild(b);
  });
  CHIPS.forEach(L => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip';
    c.dataset.l = L;
    c.textContent = `邊長 ${L}`;
    c.addEventListener('click', () => { st.L = L; renderUi(); play(); });
    chipsBox.appendChild(c);
  });
  btnPrev.addEventListener('click', () => goStep(st.step - 1));
  btnNext.addEventListener('click', () => goStep(st.step + 1));
  btnReplay.addEventListener('click', () => play());
  btnView.addEventListener('click', () => { st.yaw = VIEW0.yaw; st.pitch = VIEW0.pitch; draw(); });

  /* ---------- 拖曳旋轉 ---------- */
  let drag = null;
  canvas.addEventListener('pointerdown', e => {
    drag = { x: e.clientX, y: e.clientY, yaw: st.yaw, pitch: st.pitch };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('dragging');
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return;
    const k = 0.009;
    st.yaw = drag.yaw + (e.clientX - drag.x) * k;
    st.pitch = Math.max(0.08, Math.min(1.35, drag.pitch + (e.clientY - drag.y) * k));
    if (!rafId) draw();
  });
  const endDrag = () => { drag = null; canvas.classList.remove('dragging'); };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  /* ---------- 高解析度畫布 ---------- */
  function fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const target = Math.round(W * Math.max(1, dpr));
    if (canvas.width !== target) {
      canvas.width = target;
      canvas.height = Math.round(target * H / W);
    }
    draw();
  }
  window.addEventListener('resize', fitCanvas);
  if (document.fonts) {
    document.fonts.ready.then(draw);
    document.fonts.addEventListener('loadingdone', draw);
  }

  renderUi();
  fitCanvas();

  window.HardProblems = window.HardProblems || { _pending: {} };
  window.HardProblems._pending.p2 = { onShow: fitCanvas };
})();
