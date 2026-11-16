/* ==========================================================================
   動畫解題 第 3 題：農用無人機噴農藥（康軒 1上 2-3 p.142 例11）
   滿載 45 公斤，50 分鐘噴完；飛 20 分鐘後秤得 37 公斤，求無人機本身重。
   左：無人機在秤上起飛、噴灑、降落；右：時間條與農藥條對齊（20/50 = 2/5），
   下方重量線段圖：裝滿 = 無人機 + 農藥，用掉 8 公斤 → 農藥 20 → 無人機 25。
   畫布邏輯座標 1000×560。
   ========================================================================== */
(function () {
  'use strict';

  const TOTAL = 45, DRONE = 25, FULL = 20, TMAX = 50, T0 = 20;
  const W = 1000, H = 560;
  const BX = 510;                 // 右側各條的起點
  const TW = 450;                 // 時間條、農藥條寬（50 分鐘 → 每分鐘 9 px）
  const PPM = TW / TMAX;
  const PX = 8;                   // 重量條：1 公斤 = 8 px
  const ROW_T = 62, ROW_P = 160, ROW_C1 = 272, ROW_C2 = 350;
  const COL_TIME = '#fb923c', COL_PEST = '#2dd4bf', COL_DRONE = '#a78bfa', COL_USED = '#f87171';
  const CHIPS = [10, 20, 30, 40, 50];

  const STEPS = [
    {
      name: '① 看懂題目',
      html: `<h3>① 看懂題目</h3>
        裝滿農藥時秤得 <strong>45 公斤</strong>，這是
        <span class="hl-drone">無人機</span> ＋ <span class="hl-pest">滿桶農藥</span> 的重量，兩個都不知道。<br>
        另一個線索：每分鐘噴一樣多，<span class="hl-time">50 分鐘</span>剛好噴完一桶。`
    },
    {
      name: '② 飛 20 分鐘',
      html: `<h3>② 飛 20 分鐘後再秤</h3>
        秤得 37 公斤。無人機沒變，少掉的只有農藥：<br>
        \\(45-37=8\\)，這 20 分鐘用掉 <span class="hl-used">8 公斤</span>農藥。`
    },
    {
      name: '③ 用掉幾分之幾',
      html: `<h3>③ 用掉了一桶的幾分之幾？</h3>
        每分鐘噴一樣多，所以「用掉的農藥」占全桶的比例＝「飛的時間」占全部時間的比例：
        \\[\\frac{20}{50}=\\frac{2}{5}\\]
        把 50 分鐘切成 5 份（每份 10 分鐘），農藥也跟著切成 5 份，20 分鐘用掉其中 <span class="hl-used">2 份</span>。`
    },
    {
      name: '④ 滿桶農藥',
      html: `<h3>④ 滿桶農藥有多重？</h3>
        2 份是 8 公斤，1 份就是 \\(8\\div 2=4\\) 公斤，5 份是 \\(4\\times 5=20\\) 公斤。<br>
        寫成一個算式：\\(8\\div\\dfrac{2}{5}=8\\times\\dfrac{5}{2}=20\\)，滿桶農藥 <span class="hl-pest">20 公斤</span>。`
    },
    {
      name: '⑤ 無人機重',
      html: `<h3>⑤ 無人機本身多重？</h3>
        \\(45-20=25\\)，無人機未裝農藥時重 <span class="hl-drone">25 公斤</span>。<br>
        驗算：20 分鐘後剩 \\(20-8=12\\) 公斤農藥，\\(25+12=37\\) ✓<br>
        答：<span class="hl-key">25 公斤</span>。`
    }
  ];

  const canvas = document.getElementById('p3-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const explain = document.getElementById('p3-explain');
  const dotsBox = document.getElementById('p3-dots');
  const btnPrev = document.getElementById('p3-prev');
  const btnNext = document.getElementById('p3-next');
  const btnReplay = document.getElementById('p3-replay');
  const tryBox = document.getElementById('p3-try');
  const chipsBox = document.getElementById('p3-chips');
  const tryNote = document.getElementById('p3-try-note');

  const st = { step: 0, t: T0, anim: 1, animStart: 0, animDur: 0 };
  let rafId = 0;

  /* ---------- 小工具 ---------- */
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const fmt = v => String(Math.round(v * 10) / 10);
  const usedKg = t => FULL * t / TMAX;
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

  /* 一段線段圖；dashed＝已用掉的空格 */
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
  function mixed(parts, x, y, color, size, align) {
    size = size || 20;
    ctx.font = `700 ${size}px "Outfit", ${FONT}`;
    const fs = size * 0.8;
    const widths = parts.map(p => {
      if (typeof p === 'string') { ctx.font = `700 ${size}px "Outfit", ${FONT}`; return ctx.measureText(p).width; }
      ctx.font = `700 ${fs}px "Outfit", ${FONT}`;
      return Math.max(ctx.measureText(String(p.n)).width, ctx.measureText(String(p.d)).width) + 8;
    });
    const total = widths.reduce((a, b) => a + b, 0);
    let cx = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
    parts.forEach((p, i) => {
      if (typeof p === 'string') {
        text(p, cx, y, color, size, 'left');
      } else {
        const mid = cx + widths[i] / 2;
        text(String(p.n), mid, y - fs * 0.62, color, fs);
        text(String(p.d), mid, y + fs * 0.68, color, fs);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx + 2, y); ctx.lineTo(cx + widths[i] - 2, y); ctx.stroke();
      }
      cx += widths[i];
    });
  }

  function drawBanner(s, color) {
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
    ctx.strokeStyle = color || 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    lines.forEach((ln, i) => text(ln, W / 2, by + 9 + lh * i + lh / 2, '#f8fafc', 22));
  }

  /* ---------- 狀態 ---------- */
  function minutesNow() {
    if (st.step === 0) return 0;
    if (st.step === 1) return st.t * clamp01((st.anim - 0.15) / 0.65);
    return st.t;
  }
  function liftNow() {
    if (st.step !== 1) return 0;
    const a = st.anim;
    if (a < 0.15) return ease(a / 0.15);
    if (a < 0.8) return 1;
    return 1 - ease((a - 0.8) / 0.2);
  }

  /* ---------- 左：無人機與秤 ---------- */
  function drawDrone(cx, base, fill, spin) {
    const armY = base - 58;
    ctx.save();
    ctx.lineCap = 'round';
    // 腳架
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 34, base - 48); ctx.lineTo(cx - 52, base);
    ctx.moveTo(cx + 34, base - 48); ctx.lineTo(cx + 52, base);
    ctx.moveTo(cx - 64, base); ctx.lineTo(cx - 40, base);
    ctx.moveTo(cx + 40, base); ctx.lineTo(cx + 64, base);
    ctx.stroke();
    // 機臂
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(cx - 112, armY); ctx.lineTo(cx + 112, armY); ctx.stroke();
    // 旋翼
    [-112, 112, -70, 70].forEach((dx, i) => {
      const x = cx + dx, y = armY - (i < 2 ? 12 : 8);
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, armY); ctx.lineTo(x, y); ctx.stroke();
      const rw = (i < 2 ? 34 : 26) * (0.35 + 0.65 * Math.abs(Math.cos(spin + i)));
      ctx.beginPath();
      ctx.ellipse(x, y, rw, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
      ctx.fill();
    });
    // 機身
    roundRect(cx - 46, base - 70, 92, 22, 8);
    ctx.fillStyle = '#334155'; ctx.fill();
    ctx.strokeStyle = COL_DRONE; ctx.lineWidth = 2.5; ctx.stroke();
    // 藥桶
    const tx = cx - 26, ty = base - 48, tw = 52, th = 40;
    roundRect(tx, ty, tw, th, 7);
    ctx.fillStyle = 'rgba(226, 232, 240, 0.12)'; ctx.fill();
    if (fill > 0.001) {
      ctx.save();
      roundRect(tx, ty, tw, th, 7); ctx.clip();
      ctx.fillStyle = COL_PEST;
      ctx.fillRect(tx, ty + th * (1 - fill), tw, th * fill);
      ctx.restore();
    }
    roundRect(tx, ty, tw, th, 7);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  function drawLeft() {
    const min = minutesNow();
    const lift = liftNow();
    const cx = 210, ground = 392;
    const spray = st.step === 1 && st.anim > 0.15 && st.anim < 0.8;
    const bob = lift > 0.99 ? Math.sin(st.anim * 40) * 4 : 0;
    const base = ground - lift * 170 + bob;
    const fill = 1 - min / TMAX;

    // 農田
    ctx.fillStyle = 'rgba(74, 222, 128, 0.18)';
    ctx.fillRect(20, ground + 66, 380, 10);

    // 秤
    roundRect(cx - 120, ground, 240, 14, 5);
    ctx.fillStyle = '#475569'; ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.fillRect(cx - 8, ground + 14, 16, 12);
    roundRect(cx - 80, ground + 24, 160, 44, 9);
    ctx.fillStyle = '#1e293b'; ctx.fill();
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.stroke();
    const reading = lift > 0.02 ? '0 公斤' : `${fmt(TOTAL - usedKg(min))} 公斤`;
    text(reading, cx, ground + 46, lift > 0.02 ? '#64748b' : '#4ade80', 24);

    // 噴灑水滴
    if (spray) {
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.7)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 14; i++) {
        const ph = (st.anim * 9 + i / 14) % 1;
        const dx = (i - 6.5) * 9 * (0.4 + ph);
        const y0 = base - 6 + ph * 120;
        ctx.beginPath(); ctx.moveTo(cx + dx, y0); ctx.lineTo(cx + dx * 1.06, y0 + 8); ctx.stroke();
      }
    }

    drawDrone(cx, base, fill, st.step === 1 ? st.anim * 90 : 0.6);

    // 計時
    if (st.step >= 1) {
      text(`已飛行 ${Math.round(min)} 分鐘`, cx, 40, COL_TIME, 22);
    } else {
      text('裝滿農藥', cx, 40, COL_PEST, 22);
    }
    if (st.step === 4) {
      ctx.globalAlpha = ease(st.anim);
      text(`無人機本身 ${DRONE} 公斤`, cx, ground - 100, COL_DRONE, 22);
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- 右：時間條、農藥條 ---------- */
  function drawTimeRow(min, divide) {
    const y = ROW_T, h = 28;
    text('時間', BX - 14, y + h / 2 - 8, COL_TIME, 20, 'right');
    text('（分鐘）', BX - 10, y + h / 2 + 14, '#94a3b8', 14, 'right');
    seg(BX, y, min * PPM, h, COL_TIME);
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(BX, y, TW, h);
    if (divide) {
      ctx.save();
      ctx.globalAlpha = divide;
      for (let k = 1; k < 5; k++) {
        const x = BX + k * TW / 5;
        ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + h + 4); ctx.stroke();
      }
      for (let k = 0; k <= 5; k++) text(String(k * 10), BX + k * TW / 5, y + h + 16, '#cbd5e1', 16);
      ctx.restore();
    } else {
      text('0', BX, y + h + 16, '#cbd5e1', 16);
      text('50', BX + TW, y + h + 16, '#cbd5e1', 16);
      if (min > 0.5 && min < TMAX - 4) text(String(Math.round(min)), BX + min * PPM, y + h + 16, COL_TIME, 16);
    }
    if (st.step === 0) text('噴完一整桶要 50 分鐘', BX + TW / 2, y - 18, '#cbd5e1', 18);
    else text(`飛了 ${Math.round(min)} 分鐘`, BX + Math.max(min * PPM, 70) / 2, y - 18, COL_TIME, 18);
  }

  function drawPestRow(min, divide, labelCount) {
    const y = ROW_P, h = 34;
    text('農藥', BX - 14, y + h / 2, COL_PEST, 20, 'right');
    const uw = min * PPM;
    seg(BX + uw, y, TW - uw, h, COL_PEST);
    seg(BX, y, uw, h, null, true);
    if (divide) {
      ctx.save();
      ctx.globalAlpha = divide;
      for (let k = 1; k < 5; k++) {
        const x = BX + k * TW / 5;
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.stroke();
        // 對齊虛線連到時間條
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.25)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(x, ROW_T + 28); ctx.lineTo(x, y); ctx.stroke();
      }
      ctx.restore();
    }
    for (let k = 0; k < labelCount; k++) {
      const used = (k + 0.5) * TW / 5 < uw;
      text('4 公斤', BX + (k + 0.5) * TW / 5, y + h / 2, used ? COL_USED : '#0f172a', 17);
    }
    if (uw > 60 && !labelCount) text('用掉', BX + uw / 2, y + h / 2, COL_USED, 18);

    // 下方說明
    const ty = y + h + 26;
    if (st.step === 2) {
      ctx.globalAlpha = ease(st.anim);
      mixed(['20 分鐘占 ', { n: 20, d: 50 }, ' = ', { n: 2, d: 5 }, ' → 用掉 ', { n: 2, d: 5 }, ' 桶 = 8 公斤'],
        BX + TW / 2, ty + 4, '#f8fafc', 19);
      ctx.globalAlpha = 1;
    } else if (st.step === 3) {
      ctx.globalAlpha = clamp01(st.anim * 1.5 - 0.5);
      text('2 份 = 8 公斤 → 1 份 = 4 公斤 → 5 份 = 20 公斤', BX + TW / 2, ty, '#f8fafc', 19);
      ctx.globalAlpha = 1;
    } else if (st.step === 1 && st.anim < 1) {
      text('飛越久，用掉越多（每分鐘一樣多）', BX + TW / 2, ty, '#94a3b8', 17);
    } else if (st.step === 4 && st.t !== T0) {
      mixed([`${st.t} 分鐘占 `, { n: st.t, d: 50 }, ` → 用掉 ${fmt(usedKg(st.t))} 公斤`], BX + TW / 2, ty + 4, '#f8fafc', 19);
    }
  }

  /* ---------- 右下：重量線段圖 ---------- */
  function drawWeightRow(y, label, pestKg, usedKgV, droneKnown, pestLabel, total, check, alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const h = 40;
    text(label, BX - 14, y + h / 2, '#e2e8f0', 19, 'right');
    const dw = DRONE * PX, pw = pestKg * PX, gw = usedKgV * PX;
    seg(BX, y, dw, h, COL_DRONE);
    seg(BX + dw, y, pw, h, COL_PEST);
    seg(BX + dw + pw, y, gw, h, null, true);
    if (st.step >= 3) {   // 滿桶切 5 份（每份 4 公斤）
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)'; ctx.lineWidth = 1.5;
      for (let k = 1; k < 5; k++) {
        const x = BX + dw + k * FULL / 5 * PX;
        if (x < BX + dw + pw + gw - 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 9); ctx.moveTo(x, y + h - 9); ctx.lineTo(x, y + h); ctx.stroke(); }
      }
    }
    text(droneKnown ? `無人機 ${DRONE}` : '無人機 ?', BX + dw / 2, y + h / 2, '#1e1b4b', 19);
    if (pw >= 34) text(pestLabel, BX + dw + pw / 2, y + h / 2, '#042f2e', 18);
    if (gw >= 50) text(`用掉 ${fmt(usedKgV)}`, BX + dw + pw + gw / 2, y + h / 2, COL_USED, 16);
    text(`= ${fmt(total)} 公斤${check ? ' ✓' : ''}`, BX + (DRONE + FULL) * PX + 10, y + h / 2,
      check ? '#4ade80' : '#f8fafc', 20, 'left');
    ctx.restore();
  }

  function drawWeights() {
    const s = st.step, t = st.t;
    const pestKnown = s >= 3;
    const droneKnown = s >= 4;
    drawWeightRow(ROW_C1, '裝滿', FULL, 0, droneKnown, pestKnown ? `農藥 ${FULL}` : '農藥 ?', TOTAL, false, 1);

    let a2 = 0;
    if (s === 1) a2 = clamp01((st.anim - 0.85) / 0.15);
    else if (s >= 2) a2 = 1;
    const used = usedKg(t), left = FULL - used;
    drawWeightRow(ROW_C2, `${t} 分後`, left, used, droneKnown, pestKnown ? `剩 ${fmt(left)}` : '剩 ?',
      TOTAL - used, s === 4, a2);

    // 兩條相減
    if (a2 > 0 && s <= 2) {
      ctx.globalAlpha = a2;
      const gx = BX + (DRONE + FULL - used) * PX, gw = used * PX;
      ctx.strokeStyle = COL_USED; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx, ROW_C2 + 48); ctx.lineTo(gx, ROW_C2 + 54); ctx.lineTo(gx + gw, ROW_C2 + 54); ctx.lineTo(gx + gw, ROW_C2 + 48);
      ctx.stroke();
      text(`45 − 37 = 8 公斤`, gx + gw / 2, ROW_C2 + 72, COL_USED, 18);
      ctx.globalAlpha = 1;
    }
    if (s === 4) {
      ctx.globalAlpha = ease(st.anim);
      text(`45 − 20 = 25`, BX + DRONE * PX / 2, ROW_C1 - 18, COL_DRONE, 19);
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- 重畫 ---------- */
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = canvas.width / W;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    drawLeft();
    const min = minutesNow();
    const divide = st.step === 2 ? ease(clamp01(st.anim * 1.6)) : st.step >= 2 ? 1 : 0;
    drawTimeRow(min, divide);
    const labels = st.step === 3 ? Math.ceil(5 * clamp01(st.anim / 0.7) - 1e-9) : st.step === 4 ? 5 : 0;
    drawPestRow(min, divide, labels);
    drawWeights();
    drawBanner(bannerText());
  }

  function bannerText() {
    const t = st.t;
    switch (st.step) {
      case 0: return '裝滿秤 45 公斤＝無人機＋滿桶農藥；50 分鐘噴完一桶。無人機本身多重？';
      case 1: return st.anim < 1 ? '起飛噴灑……' : '飛 20 分鐘後秤得 37 公斤：少掉的 45 − 37 = 8 公斤都是農藥';
      case 2: return '20 分鐘是 50 分鐘的 2/5，用掉的 8 公斤就是一桶農藥的 2/5';
      case 3: return '滿桶農藥 = 8 ÷ 2/5 = 20 公斤';
      case 4:
        if (t === T0) return '無人機 = 45 − 20 = 25 公斤；驗算 25 + 12 = 37 ✓';
        return `飛 ${t} 分鐘：用掉 ${fmt(usedKg(t))} 公斤，秤得 ${fmt(TOTAL - usedKg(t))} 公斤，無人機還是 25 公斤`;
    }
    return '';
  }

  /* ---------- 步驟與動畫 ---------- */
  const STEP_DUR = [0, 6500, 1600, 2600, 1400];

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
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([explain]).catch(() => {});
    tryBox.hidden = st.step < 4;
    chipsBox.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', +c.dataset.t === st.t));
    const t = st.t, u = usedKg(t);
    tryNote.innerHTML = `飛 ${t} 分鐘 → 用掉 \\(\\frac{${t}}{50}\\) 桶 = ${fmt(u)} 公斤，秤得 ${fmt(TOTAL - u)} 公斤。` +
      `<span class="ok">無人機一樣是 25 公斤</span>` +
      (t === TMAX ? '（噴完了，秤到的就是無人機本身）' : '');
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([tryNote]).catch(() => {});
  }

  function goStep(i) {
    st.step = Math.max(0, Math.min(STEPS.length - 1, i));
    if (st.step < 4) st.t = T0;
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
  CHIPS.forEach(t => {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'chip';
    c.dataset.t = t;
    c.textContent = `${t} 分鐘`;
    c.addEventListener('click', () => { st.t = t; renderUi(); play(); });
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
  window.HardProblems._pending.p3 = { onShow: fitCanvas };
})();
