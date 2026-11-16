/* ==========================================================================
   動畫解題 第 4 題：果汁連瓶重（康軒 1上 2-3 p.142 例11 隨堂練習）
   連瓶 930 公克，喝掉 2/3 瓶果汁後連瓶 430 公克，求空瓶重。
   左：果汁瓶在秤上，液面下降、讀數跟著變；右上：果汁條切 3 份；
   右下：重量線段圖，用掉 500 → 果汁 750 → 空瓶 180。
   畫布邏輯座標 1000×560。
   ========================================================================== */
(function () {
  'use strict';

  const TOTAL = 930, BOTTLE = 180, JUICE = 750, K0 = 2;   // K：喝掉幾個 1/3
  const W = 1000, H = 560;
  const BX = 510, TW = 450;
  const PX = 0.38;                // 重量條：1 公克 = 0.38 px
  const ROW_J = 92, ROW_C1 = 248, ROW_C2 = 330;
  const COL_JUICE = '#fbbf24', COL_BOTTLE = '#a78bfa', COL_USED = '#f87171';
  const CHIPS = [1, 2, 3];

  const STEPS = [
    {
      name: '① 看懂題目',
      html: `<h3>① 看懂題目</h3>
        930 公克是 <span class="hl-drone">空瓶</span> ＋ <span class="hl-wid">整瓶果汁</span> 的重量，兩個都不知道。<br>
        喝掉的是「<strong>果汁</strong>的 \\(\\frac{2}{3}\\)」，不是 930 的 \\(\\frac{2}{3}\\)。`
    },
    {
      name: '② 喝掉果汁',
      html: `<h3>② 喝掉 \\(\\frac{2}{3}\\) 瓶果汁</h3>
        剩下連瓶 430 公克。瓶子沒變，少掉的都是果汁：<br>
        \\(930-430=500\\)，喝掉了 <span class="hl-used">500 公克</span>果汁。`
    },
    {
      name: '③ 500 是幾分之幾',
      html: `<h3>③ 500 公克是果汁的幾分之幾？</h3>
        把整瓶果汁切成 3 等份，喝掉 \\(\\frac{2}{3}\\) 就是喝掉其中 <span class="hl-used">2 份</span>。<br>
        所以 <span class="hl-used">2 份 = 500 公克</span>。`
    },
    {
      name: '④ 果汁原重',
      html: `<h3>④ 整瓶果汁有多重？</h3>
        2 份 500 公克，1 份 \\(500\\div 2=250\\) 公克，3 份 \\(250\\times 3=750\\) 公克。<br>
        寫成一個算式：\\(500\\div\\dfrac{2}{3}=500\\times\\dfrac{3}{2}=750\\)，果汁原重 <span class="hl-wid">750 公克</span>。`
    },
    {
      name: '⑤ 空瓶重',
      html: `<h3>⑤ 空瓶多重？</h3>
        \\(930-750=180\\)，空瓶重 <span class="hl-drone">180 公克</span>。<br>
        驗算：剩下 1 份果汁 250 公克，\\(180+250=430\\) ✓<br>
        答：<span class="hl-key">180 公克</span>。`
    }
  ];

  const canvas = document.getElementById('p4-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const explain = document.getElementById('p4-explain');
  const dotsBox = document.getElementById('p4-dots');
  const btnPrev = document.getElementById('p4-prev');
  const btnNext = document.getElementById('p4-next');
  const btnReplay = document.getElementById('p4-replay');
  const tryBox = document.getElementById('p4-try');
  const chipsBox = document.getElementById('p4-chips');
  const tryNote = document.getElementById('p4-try-note');

  const st = { step: 0, k: K0, anim: 1, animStart: 0, animDur: 0 };
  let rafId = 0;

  /* ---------- 小工具 ---------- */
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const fmt = v => String(Math.round(v));
  const drunkG = k => JUICE * k / 3;
  const FONT = '"Noto Sans TC", sans-serif';

  function text(s, x, y, color, size, align, weight) {
    ctx.font = `${weight || 700} ${size || 20}px "Outfit", ${FONT}`;
    ctx.fillStyle = color || '#e2e8f0';
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }

  function roundRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function seg(x, y, w, h, color, dashed) {
    if (w <= 0.5) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    if (dashed) {
      ctx.fillStyle = 'rgba(248, 113, 113, 0.10)';
      ctx.fill();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = COL_USED;
    } else {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
    }
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  /* 一行混排：字串與分數 {n, d} */
  function mixed(parts, x, y, color, size) {
    size = size || 20;
    const fs = size * 0.8;
    const widths = parts.map(p => {
      if (typeof p === 'string') { ctx.font = `700 ${size}px "Outfit", ${FONT}`; return ctx.measureText(p).width; }
      ctx.font = `700 ${fs}px "Outfit", ${FONT}`;
      return Math.max(ctx.measureText(String(p.n)).width, ctx.measureText(String(p.d)).width) + 8;
    });
    let cx = x - widths.reduce((a, b) => a + b, 0) / 2;
    parts.forEach((p, i) => {
      if (typeof p === 'string') text(p, cx, y, color, size, 'left');
      else {
        const mid = cx + widths[i] / 2;
        text(String(p.n), mid, y - fs * 0.62, color, fs);
        text(String(p.d), mid, y + fs * 0.68, color, fs);
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx + 2, y); ctx.lineTo(cx + widths[i] - 2, y); ctx.stroke();
      }
      cx += widths[i];
    });
  }

  function drawBanner(s) {
    ctx.font = `700 22px ${FONT}`;
    const lines = [];
    let cur = '';
    for (const ch of s) {
      if (ctx.measureText(cur + ch).width > W - 120 && cur) { lines.push(cur); cur = ch; } else cur += ch;
    }
    if (cur) lines.push(cur);
    const lh = 32, bh = lines.length * lh + 18, by = H - bh - 12;
    roundRect(40, by, W - 80, bh, 14);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    lines.forEach((ln, i) => text(ln, W / 2, by + 9 + lh * i + lh / 2, '#f8fafc', 22));
  }

  /* ---------- 狀態：已喝掉幾個 1/3（可為小數，動畫用） ---------- */
  function drunkNow() {
    if (st.step === 0) return 0;
    if (st.step === 1) return st.k * ease(clamp01((st.anim - 0.1) / 0.8));
    return st.k;
  }

  /* ---------- 左：果汁瓶與秤 ---------- */
  function drawLeft(d) {
    const cx = 210, ground = 400;
    const fill = 1 - d / 3;

    // 秤
    roundRect(cx - 110, ground, 220, 14, 5);
    ctx.fillStyle = '#475569'; ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 8, ground + 14, 16, 12);
    roundRect(cx - 85, ground + 24, 170, 44, 9);
    ctx.fillStyle = '#1e293b'; ctx.fill();
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.stroke();
    text(`${fmt(TOTAL - drunkG(d))} 公克`, cx, ground + 46, '#4ade80', 24);

    // 瓶身
    const bw = 120, bh = 240, bx = cx - bw / 2, by = ground - bh;
    const bodyTop = by + 60;        // 肩部以下為液體區
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 20, by + 8);
    ctx.lineTo(cx - 20, by + 30);
    ctx.quadraticCurveTo(bx, by + 40, bx, bodyTop);
    ctx.lineTo(bx, ground - 10);
    ctx.quadraticCurveTo(bx, ground, bx + 10, ground);
    ctx.lineTo(bx + bw - 10, ground);
    ctx.quadraticCurveTo(bx + bw, ground, bx + bw, ground - 10);
    ctx.lineTo(bx + bw, bodyTop);
    ctx.quadraticCurveTo(bx + bw, by + 40, cx + 20, by + 30);
    ctx.lineTo(cx + 20, by + 8);
    ctx.closePath();
    ctx.fillStyle = 'rgba(226, 232, 240, 0.08)';
    ctx.fill();
    ctx.save();
    ctx.clip();
    const liqH = (ground - bodyTop) * fill;
    if (liqH > 0.5) {
      ctx.fillStyle = COL_JUICE;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(bx, ground - liqH, bw, liqH);
    }
    ctx.restore();
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
    // 瓶蓋
    roundRect(cx - 24, by - 6, 48, 16, 4);
    ctx.fillStyle = '#4ade80'; ctx.fill();

    // 三等份刻度
    if (st.step >= 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.6)';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      for (let k = 1; k < 3; k++) {
        const y = ground - (ground - bodyTop) * k / 3;
        ctx.beginPath(); ctx.moveTo(bx + 4, y); ctx.lineTo(bx + bw - 4, y); ctx.stroke();
      }
      ctx.restore();
    }

    if (st.step === 0) text('整瓶果汁', cx, 52, COL_JUICE, 22);
    else if (st.step === 1 && st.anim < 1) text('喝果汁中……', cx, 52, COL_USED, 22);
    else mixed(['喝掉 ', { n: st.k, d: 3 }, ' 瓶果汁'], cx, 52, COL_USED, 22);
    if (st.step === 4) {
      ctx.globalAlpha = ease(st.anim);
      text(`空瓶 ${BOTTLE} 公克`, cx + 72, by + 20, COL_BOTTLE, 20, 'left');
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- 右上：果汁條（3 等份） ---------- */
  function drawJuiceRow(d, divide, labelCount) {
    const y = ROW_J, h = 38;
    text('果汁', BX - 14, y + h / 2, COL_JUICE, 20, 'right');
    const uw = TW * d / 3;
    seg(BX + uw, y, TW - uw, h, COL_JUICE);
    seg(BX, y, uw, h, null, true);
    if (st.step === 0) text('整瓶果汁', BX + TW / 2, y + h / 2, '#1f1300', 19);
    if (divide) {
      ctx.save();
      ctx.globalAlpha = divide;
      for (let k = 1; k < 3; k++) {
        const x = BX + k * TW / 3;
        ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + h + 6); ctx.stroke();
      }
      for (let k = 0; k < 3; k++) mixed([{ n: 1, d: 3 }], BX + (k + 0.5) * TW / 3, y - 26, '#cbd5e1', 18);
      ctx.restore();
    }
    for (let k = 0; k < labelCount; k++) {
      text('250 公克', BX + (k + 0.5) * TW / 3, y + h / 2, k < st.k ? COL_USED : '#1f1300', 18);
    }
    if (uw > 60 && !labelCount) text(st.step >= 2 ? '喝掉 2 份 = 500 公克' : '喝掉', BX + uw / 2, y + h / 2, COL_USED, 18);

    const ty = y + h + 30;
    if (st.step === 3) {
      ctx.globalAlpha = clamp01(st.anim * 1.5 - 0.5);
      text('2 份 = 500 → 1 份 = 250 → 3 份 = 750 公克', BX + TW / 2, ty, '#f8fafc', 19);
      ctx.globalAlpha = 1;
    } else if (st.step === 2) {
      ctx.globalAlpha = ease(st.anim);
      mixed(['喝掉的 500 公克 = 果汁的 ', { n: 2, d: 3 }], BX + TW / 2, ty + 4, '#f8fafc', 19);
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- 右下：重量線段圖 ---------- */
  function drawWeightRow(y, label, juiceG, goneG, bottleKnown, juiceLabel, total, check, alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const h = 40;
    text(label, BX - 14, y + h / 2, '#e2e8f0', 19, 'right');
    const dw = BOTTLE * PX, jw = juiceG * PX, gw = goneG * PX;
    seg(BX, y, dw, h, COL_BOTTLE);
    seg(BX + dw, y, jw, h, COL_JUICE);
    seg(BX + dw + jw, y, gw, h, null, true);
    if (st.step >= 3) {   // 果汁 3 等份
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)'; ctx.lineWidth = 2;
      for (let k = 1; k < 3; k++) {
        const x = BX + dw + k * JUICE / 3 * PX;
        if (x < BX + dw + jw + gw - 1) {
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 9); ctx.moveTo(x, y + h - 9); ctx.lineTo(x, y + h); ctx.stroke();
        }
      }
    }
    text(bottleKnown ? `瓶 ${BOTTLE}` : '瓶 ?', BX + dw / 2, y + h / 2, '#1e1b4b', 17);
    if (jw >= 40) text(juiceLabel, BX + dw + jw / 2, y + h / 2, '#1f1300', 18);
    if (gw >= 60) text(`喝掉 ${fmt(goneG)}`, BX + dw + jw + gw / 2, y + h / 2, COL_USED, 17);
    text(`= ${fmt(total)} 公克${check ? ' ✓' : ''}`, BX + TOTAL * PX + 10, y + h / 2,
      check ? '#4ade80' : '#f8fafc', 20, 'left');
    ctx.restore();
  }

  function drawWeights() {
    const s = st.step, k = st.k;
    const juiceKnown = s >= 3, bottleKnown = s >= 4;
    drawWeightRow(ROW_C1, '原本', JUICE, 0, bottleKnown, juiceKnown ? `果汁 ${JUICE}` : '果汁 ?', TOTAL, false, 1);

    const a2 = s === 1 ? clamp01((st.anim - 0.85) / 0.15) : s >= 2 ? 1 : 0;
    const gone = drunkG(k), left = JUICE - gone;
    drawWeightRow(ROW_C2, '喝完後', left, gone, bottleKnown, juiceKnown ? `剩 ${fmt(left)}` : '剩 ?',
      TOTAL - gone, s === 4, a2);

    if (a2 > 0 && s <= 2) {
      ctx.globalAlpha = a2;
      const gx = BX + (TOTAL - gone) * PX, gw = gone * PX;
      ctx.strokeStyle = COL_USED; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx, ROW_C2 + 48); ctx.lineTo(gx, ROW_C2 + 54); ctx.lineTo(gx + gw, ROW_C2 + 54); ctx.lineTo(gx + gw, ROW_C2 + 48);
      ctx.stroke();
      text('930 − 430 = 500 公克', gx + gw / 2, ROW_C2 + 72, COL_USED, 18);
      ctx.globalAlpha = 1;
    }
    if (s === 4) {
      ctx.globalAlpha = ease(st.anim);
      text('930 − 750 = 180', BX, ROW_C1 - 18, COL_BOTTLE, 19, 'left');
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- 重畫 ---------- */
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = canvas.width / W;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const d = drunkNow();
    drawLeft(d);
    const divide = st.step === 2 ? ease(clamp01(st.anim * 1.6)) : st.step >= 2 ? 1 : 0;
    const labels = st.step === 3 ? Math.ceil(3 * clamp01(st.anim / 0.7) - 1e-9) : st.step === 4 ? 3 : 0;
    drawJuiceRow(d, divide, labels);
    drawWeights();
    drawBanner(bannerText());
  }

  function bannerText() {
    const k = st.k;
    switch (st.step) {
      case 0: return '連瓶 930 公克＝空瓶＋整瓶果汁；喝掉 2/3 瓶果汁後剩 430 公克。空瓶多重？';
      case 1: return st.anim < 1 ? '喝果汁中……' : '少掉的 930 − 430 = 500 公克，全部是喝掉的果汁';
      case 2: return '喝掉 2/3 瓶 → 500 公克是果汁的 2/3（3 份中的 2 份）';
      case 3: return '果汁原重 = 500 ÷ 2/3 = 750 公克';
      case 4:
        if (k === K0) return '空瓶 = 930 − 750 = 180 公克；驗算 180 + 250 = 430 ✓';
        return `喝掉 ${k}/3 瓶：少 ${fmt(drunkG(k))} 公克，秤得 ${fmt(TOTAL - drunkG(k))} 公克，空瓶還是 180 公克`;
    }
    return '';
  }

  /* ---------- 步驟與動畫 ---------- */
  const STEP_DUR = [0, 4500, 1600, 2400, 1400];

  function tick(now) {
    st.anim = st.animDur ? clamp01((now - st.animStart) / st.animDur) : 1;
    draw();
    if (st.anim < 1) rafId = requestAnimationFrame(tick);
    else rafId = 0;
  }

  function play() {
    cancelAnimationFrame(rafId);
    st.animDur = STEP_DUR[st.step];
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
    tryBox.hidden = st.step < 4;
    chipsBox.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', +c.dataset.k === st.k));
    const k = st.k, g = drunkG(k);
    tryNote.innerHTML = `喝掉 \\(\\frac{${k}}{3}\\) 瓶 → 少 ${fmt(g)} 公克，秤得 ${fmt(TOTAL - g)} 公克。` +
      `<span class="ok">空瓶一樣是 180 公克</span>` + (k === 3 ? '（喝光了，秤到的就是空瓶）' : '');
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([explain, tryNote]).catch(() => {});
  }

  function goStep(i) {
    st.step = Math.max(0, Math.min(STEPS.length - 1, i));
    if (st.step < 4) st.k = K0;
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
  CHIPS.forEach(k => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip';
    c.dataset.k = k;
    c.textContent = k === 3 ? '全部喝光' : `喝掉 ${k}/3`;
    c.addEventListener('click', () => { st.k = k; renderUi(); play(); });
    chipsBox.appendChild(c);
  });
  btnPrev.addEventListener('click', () => goStep(st.step - 1));
  btnNext.addEventListener('click', () => goStep(st.step + 1));
  btnReplay.addEventListener('click', () => play());

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
  window.HardProblems._pending.p4 = { onShow: fitCanvas };
})();
