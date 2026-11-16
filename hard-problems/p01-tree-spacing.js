/* ==========================================================================
   難題解說 第 1 題：長方形周圍種樹（康軒 1上 2-2 例8）
   長 315、寬 135 的長方形周長，從左上角剪開、逐個頂點拉直成 900 公尺的直線，
   在直線上找間距（最大公因數 45）、種樹（20 棵），再折回長方形。
   畫布邏輯座標 1000×520，1 公尺 = 1 單位。
   ========================================================================== */
(function () {
  'use strict';

  const LEN = 315, WID = 135, PERI = (LEN + WID) * 2;          // 900
  const SEGS = [LEN, WID, LEN, WID];                             // 上、右、下、左（順時針）
  const SEG_START = [0, LEN, LEN + WID, LEN * 2 + WID];          // 0、315、450、765
  const CORNERS = [LEN, LEN + WID, LEN * 2 + WID];               // 剪開點以外的三個頂點
  const COL_LEN = '#38bdf8', COL_WID = '#fbbf24';
  const SEG_COL = [COL_LEN, COL_WID, COL_LEN, COL_WID];
  const W = 1000, H = 520;
  const O_RECT = { x: W / 2 - LEN / 2, y: 160 };                 // 長方形置中時的左上角
  const O_LINE = { x: 50, y: 100 };                              // 拉直後的起點
  const BEST = 45;
  const CHIPS = [9, 15, 27, 45, 60, 90];

  const STEPS = [
    {
      name: '① 看懂題目',
      html: `<h3>① 看懂題目</h3>
        在長方形<strong>周圍</strong>種樹：相鄰兩棵距離<strong>相等</strong>、<strong>四個頂點都種</strong>。
        要找「最大的距離」和「總棵數」。<br>
        樹圍成一圈不好想，我們把周長<span class="hl-key">剪開、拉成一直線</span>來看。`
    },
    {
      name: '② 剪開',
      html: `<h3>② 從頂點剪開</h3>
        左上角一定有樹，就從這裡剪一刀。長方形的周長變成一條「繩子」，
        繩子的頭和尾都是這個剪開的點。`
    },
    {
      name: '③ 拉直',
      html: `<h3>③ 拉成一直線</h3>
        一個頂點一個頂點拉直，周長
        \\((315+135)\\times 2=900\\) 公尺。<br>
        四個頂點落在直線上的 <span class="hl-key">0、315、450、765</span> 公尺處；
        終點 900 就是剪開的那一點，和 0 是<strong>同一棵樹</strong>。`
    },
    {
      name: '④ 找間距',
      html: `<h3>④ 間距最大是多少？</h3>
        從 0 開始每隔相同距離種一棵，
        間距要同時整除<span class="hl-len">長 315</span>和<span class="hl-wid">寬 135</span>，也就是 315 和 135 的<strong>公因數</strong>。
        要最大，就取<span class="hl-key">最大公因數</span>：
        <div class="short-div">
          <span class="d">5</span><span class="u">315</span><span class="u">135</span>
          <span class="d">3</span><span class="u">63</span><span class="u">27</span>
          <span class="d">3</span><span class="u">21</span><span class="u">9</span>
          <span></span><span>7</span><span>3</span>
        </div><br>
        \\((315,135)=5\\times 3\\times 3=45\\)，相鄰兩棵樹最大相距 <span class="hl-key">45 公尺</span>。`
    },
    {
      name: '⑤ 數棵數',
      html: `<h3>⑤ 數棵數</h3>
        \\(900\\div 45=20\\)，直線被分成 20 段。直線上看起來有 21 個點，
        但最後一點就是剪開的起點，折回去後是同一棵樹。<br>
        所以圍成一圈時：<span class="hl-key">棵數 = 間隔數 = 20 棵</span>。
        （一直線兩端都種時才是「間隔數 + 1」。）`
    },
    {
      name: '⑥ 折回檢查',
      html: `<h3>⑥ 折回長方形檢查</h3>
        <span class="hl-len">長邊</span> \\(315\\div 45=7\\) 段，<span class="hl-wid">寬邊</span> \\(135\\div 45=3\\) 段，
        \\((7+3)\\times 2=20\\) 段，一段配一棵樹，共 20 棵 ✓<br>
        答：相鄰兩棵樹最大相距 <span class="hl-key">45 公尺</span>，總共要種 <span class="hl-key">20 棵</span>。`
    }
  ];

  const canvas = document.getElementById('p1-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const explain = document.getElementById('p1-explain');
  const dotsBox = document.getElementById('p1-dots');
  const btnPrev = document.getElementById('p1-prev');
  const btnNext = document.getElementById('p1-next');
  const btnReplay = document.getElementById('p1-replay');
  const tryBox = document.getElementById('p1-try');
  const chipsBox = document.getElementById('p1-chips');
  const tryNote = document.getElementById('p1-try-note');

  const st = { step: 0, d: BEST, anim: 1, animStart: 0, animDur: 0 };
  let rafId = 0;

  /* ---------- 小工具 ---------- */
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const isValid = d => LEN % d === 0 && WID % d === 0;
  const missingCorners = d => CORNERS.filter(c => c % d !== 0);

  /* u：0 = 長方形（置中），1 = 拉直。先平移，再依序拉直三個轉角 */
  function chain(u) {
    const tMove = ease(clamp01(u / 0.18));
    const seg = j => ease(clamp01((u - 0.18 - (j - 1) * 0.2733) / 0.2733));
    const s = [0, seg(1), seg(2), seg(3)];
    const O = { x: O_RECT.x + (O_LINE.x - O_RECT.x) * tMove, y: O_RECT.y + (O_LINE.y - O_RECT.y) * tMove };
    const heads = [];
    const pts = [O];
    let unbent = 0;
    for (let k = 0; k < 4; k++) {
      if (k > 0) unbent += s[k];
      const h = (Math.PI / 2) * (k - unbent);
      heads.push(h);
      const p = pts[k];
      pts.push({ x: p.x + SEGS[k] * Math.cos(h), y: p.y + SEGS[k] * Math.sin(h) });
    }
    return { pts, heads };
  }

  function posAt(ch, s) {
    let k = 0;
    while (k < 3 && s > SEG_START[k] + SEGS[k]) k++;
    const t = s - SEG_START[k];
    const p = ch.pts[k], h = ch.heads[k];
    return { x: p.x + t * Math.cos(h), y: p.y + t * Math.sin(h) };
  }

  function wrapLines(text, maxW) {
    const lines = [];
    let cur = '';
    for (const chr of text) {
      if (ctx.measureText(cur + chr).width > maxW && cur) { lines.push(cur); cur = chr; }
      else cur += chr;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------- 繪圖元件 ---------- */
  function drawTree(p, size, ghost) {
    const r = size;
    ctx.save();
    if (ghost) { ctx.globalAlpha = 0.85; ctx.setLineDash([3, 3]); }
    ctx.fillStyle = '#a16207';
    if (!ghost) ctx.fillRect(p.x - r * 0.2, p.y - r * 0.9, r * 0.4, r * 0.9);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - r * 3);
    ctx.lineTo(p.x + r, p.y - r * 0.8);
    ctx.lineTo(p.x - r, p.y - r * 0.8);
    ctx.closePath();
    if (ghost) { ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2; ctx.stroke(); }
    else { ctx.fillStyle = '#22c55e'; ctx.fill(); ctx.strokeStyle = '#14532d'; ctx.lineWidth = 1.5; ctx.stroke(); }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  function drawCross(p) {
    ctx.save();
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const r = 9;
    ctx.beginPath();
    ctx.moveTo(p.x - r, p.y - r); ctx.lineTo(p.x + r, p.y + r);
    ctx.moveTo(p.x + r, p.y - r); ctx.lineTo(p.x - r, p.y + r);
    ctx.stroke();
    ctx.restore();
  }

  function drawScissors(p, pulse) {
    ctx.save();
    ctx.font = '700 30px "Segoe UI Symbol", "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f87171';
    ctx.globalAlpha = 0.6 + 0.4 * pulse;
    ctx.fillText('✂', p.x - 26, p.y - 26);
    ctx.restore();
  }

  function drawBanner(text, color) {
    ctx.font = '700 22px "Noto Sans TC", sans-serif';
    const lines = wrapLines(text, W - 120);
    const lh = 32;
    const bh = lines.length * lh + 18;
    const by = H - bh - 14;
    roundRect(40, by, W - 80, bh, 14);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fill();
    ctx.strokeStyle = color || 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach((ln, i) => ctx.fillText(ln, W / 2, by + 9 + lh * i + lh / 2));
  }

  /* ---------- 依狀態重畫 ---------- */
  function currentU() {
    const a = ease(st.anim);
    if (st.step < 2) return 0;
    if (st.step === 2) return a;
    if (st.step === 5) return 1 - a;
    return 1;
  }

  function treePositions() {
    // 回傳 { solid: [s...], ghost: [s...] }；虛線樹與實心樹重疊時不畫
    if (st.step < 2) return { solid: [0, ...CORNERS], ghost: [] };
    // ③④ 拉直後：剪開點那棵樹跟著繩尾走到 900，起點只留虛線
    if (st.step === 2 || st.step === 3) return { solid: [...CORNERS, PERI], ghost: [0] };
    // ⑤⑥：從第一個間距開始種到 900（起點不種，900 就是起點那棵）
    const d = st.d;
    const all = [];
    for (let s = d; s <= PERI; s += d) all.push(s);
    let solid = all;
    if (st.step === 4) solid = all.slice(0, Math.floor(all.length * st.anim + 1e-9));
    return { solid, ghost: [] };
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = canvas.width / W;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const u = currentU();
    const ch = chain(u);
    const cut = st.step >= 1;
    const gap = cut ? 10 * (st.step === 1 ? ease(st.anim) : 1) : 0;
    const flat = u > 0.999;
    const folded = u < 0.001;

    // 周長四段
    ctx.lineCap = 'round';
    for (let k = 0; k < 4; k++) {
      const a = Math.max(SEG_START[k], gap), b = Math.min(SEG_START[k] + SEGS[k], PERI - gap);
      const p = posAt(ch, a + 0.001), q = posAt(ch, b - 0.001);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.strokeStyle = SEG_COL[k];
      ctx.lineWidth = 6;
      ctx.stroke();
    }

    // 邊長標籤：沿外側法向量
    ctx.font = '700 20px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let k = 0; k < 4; k++) {
      if (folded && (k === 0 || k === 3)) continue;   // 長方形只標下、右兩邊，避免擁擠
      const m = posAt(ch, SEG_START[k] + SEGS[k] / 2);
      const h = ch.heads[k];
      const off = flat ? 48 : 22;
      const nx = Math.sin(h), ny = -Math.cos(h);
      ctx.fillStyle = SEG_COL[k];
      ctx.textAlign = nx > 0.5 ? 'left' : nx < -0.5 ? 'right' : 'center';
      const label = folded ? `${SEGS[k]} 公尺` : `${SEGS[k]}`;
      ctx.fillText(label, m.x + nx * off, m.y + ny * (flat ? off : off + 6));
    }
    ctx.textAlign = 'center';

    // 拉直後：刻度（頂點位置）
    const showTicks = flat && (st.step >= 3 || (st.step === 2 && st.anim >= 1));
    if (showTicks) {
      ctx.font = '700 19px "Outfit", "Noto Sans TC", sans-serif';
      [0, ...CORNERS, PERI].forEach(s => {
        const p = posAt(ch, s);
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y + 6); ctx.lineTo(p.x, p.y + 18); ctx.stroke();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(String(s), p.x, p.y + 32);
      });
      if (st.step === 3) {
        [0, ...CORNERS, PERI].forEach(s => {
          const p = posAt(ch, s);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
          ctx.strokeStyle = '#fb923c';
          ctx.lineWidth = 3;
          ctx.stroke();
        });
        ctx.fillStyle = '#fb923c';
        ctx.font = '700 18px "Noto Sans TC", sans-serif';
        ctx.fillText('頂點', posAt(ch, 0).x + 4, O_LINE.y + 62);
      }
      // 周長總長
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 20px "Noto Sans TC", sans-serif';
      ctx.fillText(`周長 = ${PERI} 公尺`, W / 2, O_LINE.y + 92);
    }

    // 間距刻度弧（種樹步驟，拉直時）
    const tp = treePositions();
    if (flat && st.step === 4) {
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.55)';
      ctx.lineWidth = 1.5;
      const marks = [0, ...tp.solid];
      for (let i = 1; i < marks.length; i++) {
        const a = posAt(ch, marks[i - 1]), b = posAt(ch, marks[i]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y + 44);
        ctx.quadraticCurveTo((a.x + b.x) / 2, a.y + 58, b.x, b.y + 44);
        ctx.stroke();
      }
    }

    // 樹
    const size = Math.max(3, Math.min(9, st.d * 0.33));
    const treeSize = st.step < 4 ? 9 : size;
    const solidP = tp.solid.map(s => posAt(ch, s));
    solidP.forEach(p => drawTree(p, treeSize, false));
    tp.ghost.forEach(s => {
      const p = posAt(ch, s);
      if (solidP.every(q => Math.hypot(p.x - q.x, p.y - q.y) > 6)) drawTree(p, treeSize, true);
    });
    const endP = posAt(ch, PERI), startP = posAt(ch, 0);
    const endHasTree = tp.solid.includes(PERI) || tp.ghost.includes(PERI);
    if (endHasTree) {
      if (flat) {
        ctx.fillStyle = '#4ade80';
        ctx.font = '700 17px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('（＝起點那棵）', endP.x + 10, endP.y + 68);
        ctx.textAlign = 'center';
      }
    }

    // 不合適的間距：頂點打叉
    if (st.step >= 4 && !isValid(st.d)) {
      missingCorners(st.d).forEach(c => drawCross(posAt(ch, c)));
    }

    // 剪刀
    if (cut) {
      const pulse = st.step === 1 ? 0.5 + 0.5 * Math.sin(st.anim * Math.PI * 4) : 1;
      drawScissors(startP, pulse);
    }

    drawBanner(bannerText(flat), (st.step >= 4 && !isValid(st.d)) ? 'rgba(248, 113, 113, 0.8)' : null);
  }

  function bannerText(flat) {
    const d = st.d;
    switch (st.step) {
      case 0: return '長方形周圍種樹：相鄰距離相等、四個頂點都種，距離最大是多少？共幾棵？';
      case 1: return '從左上角（有樹的頂點）剪一刀，周長變成一條繩子';
      case 2: return flat ? '拉直後：周長 (315 + 135) × 2 = 900 公尺' : '一個轉角一個轉角拉直……';
      case 3: return '間距要整除 315 和 135 → 取 (315, 135) = 45';
      case 4:
        if (!isValid(d)) return bad(d);
        return `每 ${d} 公尺種一棵：900 ÷ ${d} = ${PERI / d} 段，頭尾是同一棵 → 共 ${PERI / d} 棵` + (d === BEST ? '（間距最大）' : '');
      case 5:
        if (!isValid(d)) return '折回長方形：有頂點沒種到樹（紅色 ✗），不合題意';
        return `折回長方形：共 ${PERI / d} 棵樹，四個頂點都有樹` + (d === BEST ? '，相鄰最大相距 45 公尺' : '');
    }
    return '';
  }

  function bad(d) {
    const miss = missingCorners(d);
    const which = LEN % d !== 0 && WID % d !== 0 ? '315 和 135 都不能被整除'
      : LEN % d !== 0 ? `315 ÷ ${d} 除不盡` : `135 ÷ ${d} 除不盡`;
    return `間距 ${d}：${which}，頂點 ${miss.join('、')} 公尺處種不到樹 ✗`;
  }

  /* ---------- 步驟與動畫 ---------- */
  const STEP_DUR = [0, 1400, 3600, 0, 0, 3200];

  function stepDuration() {
    if (st.step === 4) {
      const n = Math.ceil(PERI / st.d);
      return Math.min(3600, n * 160);
    }
    return STEP_DUR[st.step];
  }

  function tick(now) {
    st.anim = st.animDur ? clamp01((now - st.animStart) / st.animDur) : 1;
    draw();
    if (st.anim < 1) rafId = requestAnimationFrame(tick);
    else rafId = 0;
  }

  function play() {
    cancelAnimationFrame(rafId);
    st.animDur = stepDuration();
    st.animStart = performance.now();
    st.anim = st.animDur ? 0 : 1;
    rafId = requestAnimationFrame(tick);
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
    chipsBox.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', +c.dataset.d === st.d));
    renderTryNote();
  }

  function renderTryNote() {
    const d = st.d;
    if (isValid(d)) {
      tryNote.innerHTML = `<span class="ok">✓ ${d} 是 315 和 135 的公因數</span>，頂點都種得到，共 ${PERI / d} 棵。` +
        (d === BEST ? '45 是最大公因數，所以間距最大就是 45 公尺。' : '但它比 45 小，不是最大的間距。');
    } else {
      tryNote.innerHTML = `<span class="bad">✗ ${d} 不是 315 和 135 的公因數</span>，頂點 ${missingCorners(d).join('、')} 公尺處種不到樹。`;
    }
  }

  function goStep(i) {
    st.step = Math.max(0, Math.min(STEPS.length - 1, i));
    if (st.step < 5) st.d = BEST;       // 試間距只在最後一步；回到前面時恢復正解
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
  CHIPS.forEach(d => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip';
    c.dataset.d = d;
    c.textContent = `${d} 公尺`;
    c.addEventListener('click', () => {
      st.d = d;
      renderUi();
      play();
    });
    chipsBox.appendChild(c);
  });
  btnPrev.addEventListener('click', () => goStep(st.step - 1));
  btnNext.addEventListener('click', () => goStep(st.step + 1));
  btnReplay.addEventListener('click', () => play());

  // 高解析度畫布
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

  // 字型到齊後重畫
  if (document.fonts) {
    document.fonts.ready.then(draw);
    document.fonts.addEventListener('loadingdone', draw);
  }

  renderUi();
  fitCanvas();

  window.HardProblems = window.HardProblems || { _pending: {} };
  window.HardProblems._pending.p1 = { onShow: fitCanvas };
})();
