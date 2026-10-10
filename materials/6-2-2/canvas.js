/* ==========================================================================
   6-2-2（第六冊 2-2）機率 — 互動 Canvas 與隨堂評量
   畫風：桌遊咖啡館・羊毛氈手作公仔風（小棋、阿骰），第六冊第 2 章兩節共用。

   共用工具在 ../math-canvas.js（f／fi／drawTitle／textCenter／textLeft／
   wrapFeedback／wbrEq／typeset／bindPickGroup／drawWithFonts／reduce／
   dk* 一行混排字…）。
   ⚠️ 本頁不修改共用檔；本節自己的工具一律用 ft2 前綴、色票用 FT_ 前綴
   （6-2-1 用 ft1，兩節各自宣告色票）。

   機率一律由「數個數」算出：每個互動都先列出樣本空間（球、籤、骰面、牌、
   樹狀圖的末端），再數出事件包含幾個——分子分母都是整數，最後用 reduce 化簡。
   亂數只出現在「擲硬幣」那張卡的按鈕事件裡；每個 draw 只依目前狀態重畫
   （drawWithFonts 會在字型下載完成時重畫，不可以在 draw 裡產生亂數）。
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initQuizSystem();

  initC1Canvas();
  initC2Canvas();
  initC3Canvas();
  initC4Canvas();
  initC5Canvas();
  initC6Canvas();
  initC7Canvas();
  initC8Canvas();
  initC9Canvas();
  initC10Canvas();
  initC11Canvas();
  initC12Canvas();
});

/* ==========================================================================
   0. 本節色票（羊毛氈：芥末黃、深綠桌布、骰子紅、奶油白）
   ========================================================================== */
const FT_MUSTARD = '#e3b341';
const FT_CREAM = '#f4ead2';
const FT_FELT = '#6fbf7f';
const FT_RED = '#ef6f6c';
const FT_YEL = '#f2c94c';
const FT_GRN = '#6fcf97';
const FT_BLU = '#6cb4ee';
const FT_PUR = '#c9a0f0';
const FT_OK = '#86efac';
const FT_NO = '#fb7185';
const FT_FAINT = 'rgba(244, 234, 210, 0.38)';
const FT_LINE = 'rgba(244, 234, 210, 0.22)';
const FT_TAG_BG = 'rgba(20, 30, 24, 0.9)';

// 12 個重點的標題色（與 style.css 的 #conceptN 一致）
const FT_TONE = ['#7dd3fc', '#67e8f9', '#a5b4fc', '#93c5fd', '#c4b5fd', '#6ee7b7', '#5eead4',
  '#bef264', '#86efac', '#a3e635', '#2dd4bf', '#d8b4fe'];

dkUsePalette({ tagBg: FT_TAG_BG, rim: 'rgba(15, 23, 42, 0.9)' });

/* ==========================================================================
   1. 本節工具（ft2 前綴）
   ========================================================================== */

// 機率的 LaTeX：先寫「事件個數 / 全部個數」，能約分就再接一個最簡結果
function ft2Tex(m, n) {
  const r = reduce(m, n);
  const first = `\\frac{${m}}{${n}}`;
  if (r[1] === 1) return `${first} = ${r[0]}`;
  if (r[0] === m && r[1] === n) return first;
  return `${first} = \\frac{${r[0]}}{${r[1]}}`;
}

// 同一件事的 canvas 字串（給 dkRich）
function ft2Rich(m, n) {
  const r = reduce(m, n);
  const first = `{${m}/${n}}`;
  if (r[1] === 1) return `${first} = ${r[0]}`;
  if (r[0] === m && r[1] === n) return first;
  return `${first} = {${r[0]}/${r[1]}}`;
}

// 只要最簡結果
function ft2Final(m, n) {
  const r = reduce(m, n);
  return r[1] === 1 ? String(r[0]) : `\\frac{${r[0]}}{${r[1]}}`;
}

function ft2Pos(cv, e) {
  const rect = cv.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (cv.width / rect.width),
    y: (e.clientY - rect.top) * (cv.height / rect.height)
  };
}

// 羊毛氈球：徑向漸層＋一圈縫線
function ft2Ball(ctx, x, y, r, color, o) {
  const opt = o || {};
  ctx.save();
  ctx.globalAlpha = opt.dim ? 0.28 : 1;
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.15, x, y, r);
  g.addColorStop(0, 'rgba(255,255,255,0.75)');
  g.addColorStop(0.25, color);
  g.addColorStop(1, color);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30, 30, 30, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([2.5, 2.5]);
  ctx.beginPath();
  ctx.arc(x, y, r - 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  if (opt.label) {
    textCenter(ctx, opt.label, x, y + 1, '#1f2937', f(800, Math.round(r * 0.95)));
  }
  ctx.restore();
  if (opt.hi) {
    ctx.save();
    ctx.strokeStyle = FT_MUSTARD;
    ctx.lineWidth = 3;
    ctx.shadowColor = FT_MUSTARD;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, r + 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  if (opt.cross) {
    ctx.save();
    ctx.strokeStyle = FT_NO;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r);
    ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r);
    ctx.stroke();
    ctx.restore();
  }
}

// 羊毛氈布袋（圓角梯形＋束口縫線）
function ft2Bag(ctx, x, y, w, h, color) {
  ctx.save();
  ctx.fillStyle = color || 'rgba(111, 191, 127, 0.14)';
  ctx.strokeStyle = 'rgba(111, 191, 127, 0.7)';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 22);
  ctx.fill();
  ctx.setLineDash([6, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// 一排排的球：items = [{ color, hi, dim, label, cross }]
function ft2BallGrid(ctx, items, cx, top, perRow, r, gap) {
  const rows = Math.ceil(items.length / perRow);
  for (let i = 0; i < items.length; i++) {
    const row = Math.floor(i / perRow);
    const inRow = row < rows - 1 ? perRow : items.length - perRow * (rows - 1);
    const col = i - row * perRow;
    const x = cx + (col - (inRow - 1) / 2) * gap;
    const y = top + row * gap;
    ft2Ball(ctx, x, y, r, items[i].color, items[i]);
  }
}

// 0～1 的機率尺：0 不可能、1 一定會
function ft2Meter(ctx, y, p, color) {
  const x0 = 70, x1 = 470;
  ctx.save();
  ctx.strokeStyle = FT_LINE;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0) * p, y); ctx.stroke();
  ctx.restore();
  [[0, '0'], [0.5, '{1/2}'], [1, '1']].forEach(([t, s]) => {
    const x = x0 + (x1 - x0) * t;
    ctx.fillStyle = FT_CREAM;
    ctx.fillRect(x - 1, y - 12, 2, 24);
    dkRich(ctx, [[s, FT_CREAM]], x, y + 30, 14);
  });
  textCenter(ctx, '不可能', x0, y - 24, FT_FAINT, f(700, 13));
  textCenter(ctx, '一定會', x1, y - 24, FT_FAINT, f(700, 13));
  const mx = x0 + (x1 - x0) * p;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(mx, y - 8); ctx.lineTo(mx - 9, y - 22); ctx.lineTo(mx + 9, y - 22);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 骰子面（點數 1～6 的點）
const FT_PIPS = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]
};

function ft2Die(ctx, x, y, s, v, o) {
  const opt = o || {};
  ctx.save();
  ctx.globalAlpha = opt.dim ? 0.35 : 1;
  ctx.fillStyle = opt.bg || FT_CREAM;
  roundRect(ctx, x, y, s, s, s * 0.18);
  ctx.fill();
  ctx.strokeStyle = opt.ring || 'rgba(31, 41, 55, 0.5)';
  ctx.lineWidth = opt.ring ? 3.5 : 1.5;
  ctx.stroke();
  ctx.fillStyle = v === 1 ? '#d64545' : '#1f2937';
  const d = s * 0.27;
  FT_PIPS[v].forEach(([a, b]) => {
    ctx.beginPath();
    ctx.arc(x + s / 2 + a * d, y + s / 2 + b * d, s * (v === 1 ? 0.11 : 0.085), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// 一行字太長時自動縮字（中文說明）
function ft2Line(ctx, text, y, color, size, maxW) {
  ctx.save();
  let s = size;
  ctx.font = f(700, s);
  const mw = maxW || ctx.canvas.width - 30;
  while (ctx.measureText(text).width > mw && s > 11) { s -= 0.5; ctx.font = f(700, s); }
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, ctx.canvas.width / 2, y);
  ctx.restore();
}

// 樹狀圖的節點
function ft2Node(ctx, x, y, r, label, color, o) {
  const opt = o || {};
  ctx.save();
  ctx.globalAlpha = opt.dim ? 0.3 : 1;
  ctx.fillStyle = opt.fill || 'rgba(20, 30, 24, 0.92)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = opt.hi ? 3 : 1.6;
  if (opt.hi) { ctx.shadowColor = color; ctx.shadowBlur = 10; }
  ctx.stroke();
  ctx.shadowBlur = 0;
  textCenter(ctx, label, x, y + 1, opt.hi ? '#1f2937' : FT_CREAM, f(800, opt.size || Math.round(r * 1.05)));
  ctx.restore();
}

function ft2Edge(ctx, x1, y1, x2, y2, color, dim) {
  ctx.save();
  ctx.globalAlpha = dim ? 0.25 : 0.85;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.restore();
}

// 標題：太長就縮字（drawTitle 不會縮）
function ft2Title(ctx, text, color) {
  ft2Line(ctx, text, 26, color, 17, ctx.canvas.width - 24);
}

function ft2Set(el, v) {
  if (el) el.textContent = v;
}

/* ==========================================================================
   隨堂評量
   ========================================================================== */
function initQuizSystem() {
  const quizCards = document.querySelectorAll('.quiz-card');

  // 第六冊 2-2 的 24 題正解
  // 正解字母分布：A 6 題、B 6 題、C 6 題、D 6 題（開發約束 36）
  const answers = {
    '2-2-1': 'C',    // 點數大於 6：不可能，機率 0
    '2-2-2': 'A',    // 機率介於 0 與 1：0.6
    '2-2-3': 'D',    // 前 5 次都正面，第 6 次正面機率仍是 1/2
    '2-2-4': 'B',    // 次數愈多，比值通常愈接近 1/2
    '2-2-5': 'C',    // 公正硬幣兩面機會相等
    '2-2-6': 'A',    // 10 等分、紅 4 格：2/5
    '2-2-7': 'B',    // 11 紅 13 黃：11/24
    '2-2-8': 'D',    // 偶數號 3 + 6 = 9 顆，共 14 顆：9/14
    '2-2-9': 'A',    // 24 的因數 8 個：1/3
    '2-2-10': 'C',   // 12 的倍數 12、24、36：3/40
    '2-2-11': 'B',   // 3 或 5：2/6 = 1/3
    '2-2-12': 'D',   // 1、2、2、3、3、3 擲出 3：1/2
    '2-2-13': 'A',   // 紅心或 K：16/52 = 4/13
    '2-2-14': 'C',   // 點數 3、6、9：12/52 = 3/13
    '2-2-15': 'B',   // 剩 7 紅、40 白：7/47
    '2-2-16': 'D',   // 剩 6 顆，號碼 3、4 各 1：1/3
    '2-2-17': 'A',   // 硬幣正面且 3 的倍數：2/12 = 1/6
    '2-2-18': 'C',   // 3 × 2 = 6 種，同色 2 種：1/3
    '2-2-19': 'D',   // 小棋贏 9 種，共 16 種：9/16
    '2-2-20': 'B',   // 平手 2 種：1/8
    '2-2-21': 'C',   // 積為 12：4/36 = 1/9
    '2-2-22': 'A',   // 第一顆大於第二顆：15/36 = 5/12
    '2-2-23': 'B',   // 不放回 6 × 5 = 30，和為 7 有 6 種：1/5
    '2-2-24': 'D'    // 第二次抽到紅球：3/12 = 1/4
  };

  quizCards.forEach(card => {
    const quizId = card.getAttribute('data-quiz');
    const radios = card.querySelectorAll('input[type="radio"]');
    const btn = card.querySelector('.btn-check-ans');
    const explanation = card.querySelector('.explanation-box');
    const expTitle = card.querySelector('.explanation-title');
    const optionLabels = card.querySelectorAll('.option-label');

    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        btn.removeAttribute('disabled');
        optionLabels.forEach(lbl => lbl.classList.remove('selected'));
        radio.closest('.option-label').classList.add('selected');
      });
    });

    btn.addEventListener('click', () => {
      const selectedRadio = card.querySelector('input[type="radio"]:checked');
      if (!selectedRadio) return;

      const userAns = selectedRadio.value;
      const correctAns = answers[quizId];
      const isCorrect = userAns === correctAns;

      radios.forEach(r => r.setAttribute('disabled', true));
      btn.setAttribute('disabled', true);
      btn.textContent = '已完成作答';

      optionLabels.forEach(lbl => {
        const rad = lbl.querySelector('input[type="radio"]');
        if (rad.value === correctAns) {
          lbl.classList.add('correct');
        } else if (rad.checked) {
          lbl.classList.add('incorrect');
        }
      });

      explanation.style.display = 'block';
      if (isCorrect) {
        explanation.className = 'explanation-box correct-feedback';
        expTitle.innerHTML = `<i class="fa-solid fa-circle-check"></i> 回答正確！`;
      } else {
        explanation.className = 'explanation-box incorrect-feedback';
        expTitle.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> 回答錯誤！正確答案是 (${correctAns})`;
      }
      typeset([explanation]);
    });
  });
}

/* ==========================================================================
   重點 1：機率的意義——0 到 1 之間的數
   ========================================================================== */
const FT_C1_EV = {
  red: { name: '抽到紅球', short: '紅球' },
  white: { name: '抽到白球', short: '白球' },
  blue: { name: '抽到藍球', short: '藍球' },
  any: { name: '抽到紅球或白球', short: '紅球或白球' }
};

function initC1Canvas() {
  const cv = hbEl('canvas-c1');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c1-formula'), fb = hbEl('c1-feedback');
  const sr = hbEl('c1-r'), sw = hbEl('c1-w');
  let ev = 'red';

  function draw() {
    const r = hbIv(sr), w = hbIv(sw);
    ft2Set(hbEl('c1-vr'), r);
    ft2Set(hbEl('c1-vw'), w);
    ctx.clearRect(0, 0, W, cv.height);
    ft2Title(ctx, `袋子裡的球：「${FT_C1_EV[ev].name}」的機率是多少？`, FT_TONE[0]);
    const n = r + w;
    ft2Bag(ctx, 60, 48, 420, 168);
    if (n === 0) {
      ft2Line(ctx, '袋子裡一顆球都沒有，抽不出任何一顆（情境不成立）', 300, FT_NO, 17);
      ft2Line(ctx, '把紅球或白球的數量調到至少 1 顆', 340, FT_CREAM, 15);
      out.innerHTML = '袋中沒有球（情境不成立）';
      fb.innerHTML = wrapFeedback('實驗要有可能的結果才能談機率：袋子裡至少要有 1 顆球。');
      typeset([out, fb]);
      return;
    }
    const items = [];
    const isEv = c => ev === 'any' || (ev === 'red' && c === 'r') || (ev === 'white' && c === 'w');
    for (let i = 0; i < r; i++) items.push({ color: FT_RED, hi: isEv('r'), dim: !isEv('r') });
    for (let i = 0; i < w; i++) items.push({ color: FT_CREAM, hi: isEv('w'), dim: !isEv('w') });
    const rows = Math.ceil(n / 9);
    ft2BallGrid(ctx, items, W / 2, 132 - (rows - 1) * 21, 9, 15, 42);
    const m = ev === 'any' ? n : ev === 'red' ? r : ev === 'white' ? w : 0;
    dkRow(ctx, `袋中共 ${n} 顆球，${FT_C1_EV[ev].short}有 ${m} 顆`, 248, FT_CREAM, 17);
    dkRich(ctx, [['P = ', FT_CREAM], [ft2Rich(m, n), FT_MUSTARD]], W / 2, 296, 24);
    ft2Meter(ctx, 372, m / n, FT_MUSTARD);
    let note, col;
    if (m === 0) { note = '這件事不可能發生：機率是 0'; col = FT_NO; }
    else if (m === n) { note = '這件事一定會發生：機率是 1'; col = FT_OK; }
    else { note = '可能發生、也可能不發生：機率在 0 和 1 之間'; col = FT_CREAM; }
    ft2Line(ctx, note, 440, col, 16);

    out.innerHTML = `${FT_C1_EV[ev].name}的機率 ${wbrEq(ft2Tex(m, n))}`;
    out.setAttribute('data-p', `${m}/${n}`);
    let txt;
    if (m === 0) txt = `袋子裡${ev === 'blue' ? '根本沒有藍球' : '沒有這種球'}，這是<strong>不可能事件</strong>，機率是 \\(0\\)。`;
    else if (m === n) txt = '袋子裡每一顆都符合，這是<strong>必然事件</strong>，機率是 \\(1\\)。';
    else txt = `${m} 顆符合、${n - m} 顆不符合，機率介於 \\(0\\) 和 \\(1\\) 之間；符合的愈多，機率愈接近 \\(1\\)。`;
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  [sr, sw].forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c1-ev-group'), 'data-c1-ev', m => { ev = m; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 2：實驗——擲很多次，正面的比值會靠近 1/2
   亂數只在按鈕事件裡產生，結果存在 results，draw 只讀它。
   ========================================================================== */
const FT_C2_CAP = 3000;

function initC2Canvas() {
  const cv = hbEl('canvas-c2');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c2-formula'), fb = hbEl('c2-feedback');
  const results = [];   // 1 = 正面、0 = 反面

  function toss(k) {
    const room = Math.min(k, FT_C2_CAP - results.length);
    for (let i = 0; i < room; i++) results.push(Math.random() < 0.5 ? 1 : 0);
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, W, cv.height);
    ft2Title(ctx, '擲一枚公正硬幣：正面出現的比值', FT_TONE[1]);
    const N = results.length;
    let h = 0;
    for (let i = 0; i < N; i++) h += results[i];

    // 最近 12 次
    const last = results.slice(-12);
    textLeft(ctx, '最近幾次：', 22, 66, FT_FAINT, f(700, 13));
    last.forEach((v, i) => {
      const x = 112 + i * 34;
      ctx.save();
      ctx.fillStyle = v ? FT_MUSTARD : '#9aa5b1';
      ctx.beginPath(); ctx.arc(x, 66, 13, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      textCenter(ctx, v ? '正' : '反', x, 67, '#1f2937', f(800, 13));
    });
    if (!N) textLeft(ctx, '（還沒擲）', 112, 66, FT_FAINT, f(700, 13));

    // 折線圖：x 為投擲次數、y 為正面比值
    const x0 = 64, x1 = 512, yT = 104, yB = 300;
    ctx.save();
    ctx.strokeStyle = FT_LINE;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0, yT); ctx.lineTo(x0, yB); ctx.lineTo(x1, yB); ctx.stroke();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = 'rgba(227, 179, 65, 0.7)';
    const yh = yB - (yB - yT) * 0.5;
    ctx.beginPath(); ctx.moveTo(x0, yh); ctx.lineTo(x1, yh); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    textCenter(ctx, '0', x0 - 14, yB, FT_FAINT, f(700, 13));
    textCenter(ctx, '1', x0 - 14, yT, FT_FAINT, f(700, 13));
    dkRich(ctx, [['{1/2}', FT_MUSTARD]], x0 - 20, yh, 14);
    textCenter(ctx, `投擲次數（目前 ${N} 次）`, (x0 + x1) / 2, yB + 18, FT_FAINT, f(700, 13));
    if (N > 0) {
      const step = Math.max(1, Math.ceil(N / 450));
      ctx.save();
      ctx.strokeStyle = FT_FELT;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      let c = 0;
      for (let i = 0; i < N; i++) {
        c += results[i];
        if ((i + 1) % step === 0 || i === N - 1) {
          const x = x0 + (x1 - x0) * (i + 1) / N;
          const y = yB - (yB - yT) * c / (i + 1);
          if (i + 1 === step || i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // 最長的連續同面
    let best = 0, run = 0;
    for (let i = 0; i < N; i++) {
      run = (i > 0 && results[i] === results[i - 1]) ? run + 1 : 1;
      if (run > best) best = run;
    }

    if (N === 0) {
      ft2Line(ctx, '按下方的按鈕開始擲硬幣', 350, FT_CREAM, 17);
      dkRow(ctx, '理論上正面的機率是 {1/2}，實驗會剛好一半嗎？', 396, FT_FAINT, 15);
      out.innerHTML = '還沒有投擲';
      fb.innerHTML = wrapFeedback('先擲 10 次看看，再一路擲到幾百、幾千次。');
      typeset([out, fb]);
      return;
    }
    dkRow(ctx, `正面 ${h} 次、反面 ${N - h} 次，共 ${N} 次`, 346, FT_CREAM, 17);
    dkRich(ctx, [['正面的比值 = ', FT_CREAM], [ft2Rich(h, N), FT_MUSTARD], [` ≈ ${(h / N).toFixed(3)}`, FT_FAINT]], W / 2, 390, 21);
    ft2Line(ctx, `最長連續出現同一面：${best} 次${N >= FT_C2_CAP ? '（已達 3000 次上限）' : ''}`, 436, FT_FAINT, 14);

    out.innerHTML = `正面的比值 ${wbrEq(ft2Tex(h, N))}<wbr>\\( {}\\approx ${(h / N).toFixed(3)} \\)`;
    out.setAttribute('data-p', `${h}/${N}`);
    let txt;
    if (N < 50) txt = `只擲了 ${N} 次，比值離 \\(\\frac{1}{2}\\) 可能還很遠——<strong>次數太少</strong>，看不出機率。`;
    else txt = `擲了 ${N} 次，比值是 \\(${(h / N).toFixed(3)}\\)。次數愈多，比值<strong>通常</strong>愈靠近 \\(\\frac{1}{2}\\)，但不一定剛好等於。`;
    txt += '<br>每一次擲出正面的機率都還是 \\(\\frac{1}{2}\\)，不會因為前面連續出現正面就「該輪到反面」。';
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  hbEl('c2-t1').addEventListener('click', () => toss(1));
  hbEl('c2-t10').addEventListener('click', () => toss(10));
  hbEl('c2-t100').addEventListener('click', () => toss(100));
  hbEl('c2-reset').addEventListener('click', () => { results.length = 0; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 3：每種結果機會相等，才能說機率是 1/n——旋轉的飛鏢靶
   ========================================================================== */
function initC3Canvas() {
  const cv = hbEl('canvas-c3');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c3-formula'), fb = hbEl('c3-feedback');
  const sk = hbEl('c3-k');
  let n = 8;

  function draw() {
    if (hbIv(sk) > n - 1) sk.value = n - 1;
    sk.max = n - 1;
    const k = hbIv(sk);
    ft2Set(hbEl('c3-vk'), k);
    ctx.clearRect(0, 0, W, cv.height);
    ft2Title(ctx, `旋轉的飛鏢靶：${n} 等分，紅色 ${k} 格`, FT_TONE[2]);
    const cx = 150, cy = 196, R = 118;
    for (let i = 0; i < n; i++) {
      const a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n;
      ctx.save();
      ctx.fillStyle = i < k ? FT_RED : FT_CREAM;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(31, 41, 55, 0.55)';
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle = FT_FELT; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, R + 3, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#1f2937';
    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    const tx = 300;
    textLeft(ctx, '只看顏色，結果有 2 種：', tx, 92, FT_CREAM, f(700, 15));
    textLeft(ctx, '紅、白', tx + 18, 120, FT_MUSTARD, f(800, 16));
    textLeft(ctx, '但兩種結果占的格數：', tx, 160, FT_CREAM, f(700, 15));
    textLeft(ctx, `紅 ${k} 格、白 ${n - k} 格`, tx + 18, 188, FT_MUSTARD, f(800, 16));
    const eq = 2 * k === n;
    textLeft(ctx, eq ? '兩種一樣大：機會相等' : '兩種不一樣大：機會不相等', tx, 228, eq ? FT_OK : FT_NO, f(800, 15));
    textLeft(ctx, `每一格被射中的機會相等，`, tx, 266, FT_FAINT, f(700, 13.5));
    textLeft(ctx, `所以要數「格」，不是數「顏色」`, tx, 288, FT_FAINT, f(700, 13.5));

    dkRich(ctx, [['P(紅) = ', FT_CREAM], [ft2Rich(k, n), FT_MUSTARD]], W / 2, 362, 22);
    if (eq) dkRow(ctx, '這次剛好是 {1/2}：因為紅白各占一半，不是因為只有兩種顏色', 410, FT_OK, 14.5);
    else dkRow(ctx, '不是 {1/2}：兩種顏色的機會不相等，不能說「各占一半」', 410, FT_NO, 15);

    out.innerHTML = `射中紅色的機率 ${wbrEq(ft2Tex(k, n))}`;
    out.setAttribute('data-p', `${k}/${n}`);
    fb.innerHTML = wrapFeedback(eq
      ? `紅、白各占 ${k} 格，兩種結果的機會相等，機率才各是 \\(\\frac{1}{2}\\)。`
      : `結果雖然只有「紅」「白」兩種，但紅色占 ${k} 格、白色占 ${n - k} 格，<strong>機會不相等</strong>，所以射中紅色的機率是 \\(${ft2Final(k, n)}\\)，不是 \\(\\frac{1}{2}\\)。`);
    typeset([out, fb]);
  }

  sk.addEventListener('input', draw);
  bindPickGroup(hbEl('c3-n-group'), 'data-c3-n', m => { n = parseInt(m, 10); draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 4：機率＝事件包含的「個數」÷ 全部的「個數」，不是看有幾種顏色
   ========================================================================== */
const FT_C4_COL = [
  { key: 'r', name: '紅球', color: FT_RED },
  { key: 'y', name: '黃球', color: FT_YEL },
  { key: 'g', name: '綠球', color: FT_GRN }
];

function initC4Canvas() {
  const cv = hbEl('canvas-c4');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c4-formula'), fb = hbEl('c4-feedback');
  const sl = { r: hbEl('c4-r'), y: hbEl('c4-y'), g: hbEl('c4-g') };
  let ev = 'r';

  function draw() {
    const cnt = { r: hbIv(sl.r), y: hbIv(sl.y), g: hbIv(sl.g) };
    ft2Set(hbEl('c4-vr'), cnt.r);
    ft2Set(hbEl('c4-vy'), cnt.y);
    ft2Set(hbEl('c4-vg'), cnt.g);
    const evName = FT_C4_COL.find(c => c.key === ev).name;
    ctx.clearRect(0, 0, W, cv.height);
    ft2Title(ctx, `從桌遊袋任取一顆：取到${evName}的機率`, FT_TONE[3]);
    ft2Bag(ctx, 24, 46, 492, 166);
    FT_C4_COL.forEach((c, i) => {
      const y = 80 + i * 50;
      textLeft(ctx, `${c.name} ${cnt[c.key]} 顆`, 40, y, c.key === ev ? FT_MUSTARD : FT_CREAM, f(800, 15));
      for (let j = 0; j < cnt[c.key]; j++) {
        ft2Ball(ctx, 160 + j * 52, y, 17, c.color, { hi: c.key === ev, dim: c.key !== ev });
      }
      if (cnt[c.key] === 0) textLeft(ctx, '（沒有）', 160, y, FT_FAINT, f(700, 14));
    });
    const n = cnt.r + cnt.y + cnt.g, m = cnt[ev];
    const kinds = FT_C4_COL.filter(c => cnt[c.key] > 0).length;
    const wrong = reduce(1, kinds);
    const right = reduce(m, n);
    const same = m > 0 && wrong[0] === right[0] && wrong[1] === right[1];
    dkRow(ctx, `看顏色：有 ${kinds} 種顏色 → 說成 {1/${kinds}}？`, 250, same ? FT_FAINT : FT_NO, 17);
    if (!same && m > 0) {
      ctx.save();
      ctx.strokeStyle = FT_NO; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(110, 250); ctx.lineTo(430, 250); ctx.stroke();
      ctx.restore();
    }
    dkRow(ctx, `數個數：共 ${n} 顆球，${evName} ${m} 顆`, 300, FT_CREAM, 17);
    dkRich(ctx, [[`P(${evName.slice(0, 1)}) = `, FT_CREAM], [ft2Rich(m, n), FT_MUSTARD]], W / 2, 352, 24);
    let note;
    if (m === 0) note = `袋中沒有${evName}：不可能事件，機率 0`;
    else if (same) note = '這次剛好相等，因為每種顏色的顆數一樣多';
    else note = '每一「顆」被取到的機會相等，所以要數顆數';
    ft2Line(ctx, note, 400, m === 0 ? FT_NO : same ? FT_OK : FT_FAINT, 15);

    out.innerHTML = `取到${evName}的機率 ${wbrEq(ft2Tex(m, n))}`;
    out.setAttribute('data-p', `${m}/${n}`);
    let txt;
    if (m === 0) txt = `袋子裡沒有${evName}，機率是 \\(0\\)。`;
    else if (same) txt = `每種顏色都一樣多，所以剛好等於 \\(\\frac{1}{${kinds}}\\)；只要顆數不一樣，「看顏色種類」就會算錯。`;
    else txt = `顏色有 ${kinds} 種，但每種的顆數不一樣，三種結果的機會<strong>不相等</strong>——機率要用「${evName}的顆數 ÷ 全部的顆數」：\\(${ft2Final(m, n)}\\)。`;
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  Object.values(sl).forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c4-ev-group'), 'data-c4-ev', m => { ev = m; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 5：籤筒——列出事件包含哪些號碼
   ========================================================================== */
function ft2IsPrime(k) {
  if (k < 2) return false;
  for (let d = 2; d * d <= k; d++) if (k % d === 0) return false;
  return true;
}

const FT_C5_EV = {
  even: { name: '編號是偶數', test: (k) => k % 2 === 0 },
  m3: { name: '編號是 3 的倍數', test: (k) => k % 3 === 0 },
  prime: { name: '編號是質數', test: (k) => ft2IsPrime(k) },
  factor: { name: '編號是 N 的因數', test: (k, N) => N % k === 0 },
  both: { name: '既是 2 的倍數又是 3 的倍數', test: (k) => k % 6 === 0 },
  notN: { name: '編號不是 N', test: (k, N) => k !== N },
  over: { name: '編號大於 N', test: (k, N) => k > N }
};

function initC5Canvas() {
  const cv = hbEl('canvas-c5');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c5-formula'), fb = hbEl('c5-feedback');
  const sn = hbEl('c5-n');
  let ev = 'm3';

  function draw() {
    const N = hbIv(sn);
    ft2Set(hbEl('c5-vn'), N);
    const E = FT_C5_EV[ev];
    const name = E.name.replace('N', String(N));
    ctx.clearRect(0, 0, W, cv.height);
    ft2Title(ctx, `籤筒裡 ${N} 支籤（1～${N} 號）：${name}`, FT_TONE[4]);
    const hits = [];
    const perRow = 10, sw = 40, gap = 49;
    for (let k = 1; k <= N; k++) {
      const row = Math.floor((k - 1) / perRow), col = (k - 1) % perRow;
      const inRow = row === 0 ? Math.min(perRow, N) : N - perRow;
      const x = W / 2 + (col - (inRow - 1) / 2) * gap - sw / 2;
      const y = 50 + row * 100;
      const hit = E.test(k, N);
      if (hit) hits.push(k);
      ctx.save();
      ctx.globalAlpha = hit ? 1 : 0.32;
      ctx.fillStyle = hit ? FT_MUSTARD : '#d6c7a1';
      roundRect(ctx, x, y, sw, 84, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(31, 41, 55, 0.45)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
      textCenter(ctx, String(k), x + sw / 2, y + 22, '#1f2937', f(800, 17));
    }
    const m = hits.length;
    let list = m ? hits.join('、') : '沒有任何一支';
    if (m > 12) list = hits.slice(0, 3).join('、') + '、…、' + hits[m - 1];
    ft2Line(ctx, `符合的籤：${list}${m ? `（共 ${m} 支）` : ''}`, 268, FT_CREAM, 16);
    dkRich(ctx, [['P = ', FT_CREAM], [ft2Rich(m, N), FT_MUSTARD]], W / 2, 318, 24);
    let note = '';
    if (ev === 'prime') note = '1 不是質數；2 是唯一的偶數質數';
    else if (ev === 'factor') note = `1 和 ${N} 自己也是 ${N} 的因數，別漏掉`;
    else if (ev === 'both') note = '「既是 2 的倍數又是 3 的倍數」就是 6 的倍數';
    else if (ev === 'notN') note = `「不是 ${N}」：只有 1 支不符合，其餘都算`;
    else if (ev === 'over') note = '籤筒裡沒有大於 N 的號碼：不可能事件'.replace('N', String(N));
    else note = '每一支籤被抽到的機會相等，所以數「支數」';
    ft2Line(ctx, note, 366, m === 0 ? FT_NO : FT_FAINT, 15);

    out.innerHTML = `${name}的機率 ${wbrEq(ft2Tex(m, N))}`;
    out.setAttribute('data-p', `${m}/${N}`);
    fb.innerHTML = wrapFeedback(m === 0
      ? `1～${N} 號裡沒有符合的號碼，機率是 \\(0\\)。`
      : `可能的結果有 ${N} 種（${N} 支籤），事件包含 ${m} 種，機率是 \\(${ft2Final(m, N)}\\)。`);
    typeset([out, fb]);
  }

  sn.addEventListener('input', draw);
  // 事件按鈕分兩排，兩排共用同一個「目前選中」
  const g1 = hbEl('c5-ev-group'), g2 = hbEl('c5-ev-group2');
  const pick = other => m => {
    if (other) other.querySelectorAll('.pick-btn').forEach(b => b.classList.remove('active'));
    ev = m;
    draw();
  };
  bindPickGroup(g1, 'data-c5-ev', pick(g2));
  bindPickGroup(g2, 'data-c5-ev', pick(g1));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 6：擲骰子換點心——把 6 個面分給 3 種結果，機率加起來是 1
   ========================================================================== */
const FT_C6_PRIZE = [
  { name: '蛋糕', color: FT_RED },
  { name: '鬆餅', color: FT_YEL },
  { name: '奶茶', color: FT_BLU }
];
const FT_C6_PRESET = {
  a: [1, 0, 1, 0, 2, 0],   // 偶數蛋糕、比 5 小的奇數鬆餅、5 奶茶（課本的擲骰吃美食）
  b: [0, 0, 1, 1, 2, 2],
  c: [0, 0, 0, 0, 0, 0]
};

function initC6Canvas() {
  const cv = hbEl('canvas-c6');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c6-formula'), fb = hbEl('c6-feedback');
  const st = { p: FT_C6_PRESET.a.slice() };
  const S = 62, GAP = 80, X0 = (540 - 5 * GAP - S) / 2, Y0 = 52;

  function draw() {
    ctx.clearRect(0, 0, W, cv.height);
    ft2Title(ctx, '擲一顆公正骰子換點心（點骰子可以換點心）', FT_TONE[5]);
    for (let v = 1; v <= 6; v++) {
      const x = X0 + (v - 1) * GAP;
      const pz = FT_C6_PRIZE[st.p[v - 1]];
      ft2Die(ctx, x, Y0, S, v, { ring: pz.color });
      ctx.save();
      ctx.fillStyle = pz.color;
      roundRect(ctx, x + 3, Y0 + S + 10, S - 6, 26, 8);
      ctx.fill();
      ctx.restore();
      textCenter(ctx, pz.name, x + S / 2, Y0 + S + 23, '#1f2937', f(800, 14));
    }
    const cnt = [0, 0, 0];
    st.p.forEach(k => cnt[k]++);
    FT_C6_PRIZE.forEach((pz, i) => {
      const y = 196 + i * 44;
      const faces = [];
      st.p.forEach((k, j) => { if (k === i) faces.push(j + 1); });
      textLeft(ctx, `${pz.name}：`, 60, y, pz.color, f(800, 17));
      textLeft(ctx, faces.length ? `${faces.join('、')} 點（${faces.length} 種）` : '沒有分到任何一面', 124, y, FT_CREAM, f(700, 15));
      dkRich(ctx, [[ft2Rich(cnt[i], 6), pz.color]], 420, y, 18);
    });
    dkRich(ctx, [[`{${cnt[0]}/6} + {${cnt[1]}/6} + {${cnt[2]}/6} = {6/6} = 1`, FT_MUSTARD]], W / 2, 346, 21);
    ft2Line(ctx, '每一面一定會換到其中一種點心，三種機率加起來剛好是 1', 392, FT_FAINT, 14.5);

    out.innerHTML = FT_C6_PRIZE.map((pz, i) => `${pz.name} \\(${ft2Final(cnt[i], 6)}\\)`).join('，<wbr>');
    out.setAttribute('data-p', cnt.join(','));
    const zero = FT_C6_PRIZE.filter((pz, i) => cnt[i] === 0).map(pz => pz.name);
    let txt = '擲一顆骰子共有 \\(6\\) 種結果、機會都相等；每種點心的機率＝分到的面數 \\(\\div 6\\)。';
    if (zero.length) txt += `<br>${zero.join('、')}沒有分到任何一面，換到的機率是 \\(0\\)。`;
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  function cycle(v) {
    st.p[v - 1] = (st.p[v - 1] + 1) % 3;
    draw();
  }

  cv.addEventListener('click', e => {
    const p = ft2Pos(cv, e);
    for (let v = 1; v <= 6; v++) {
      const x = X0 + (v - 1) * GAP;
      if (p.x >= x && p.x <= x + S && p.y >= Y0 && p.y <= Y0 + S + 36) { cycle(v); return; }
    }
  });
  document.querySelectorAll('[data-c6-face]').forEach(b => {
    b.addEventListener('click', () => cycle(parseInt(b.getAttribute('data-c6-face'), 10)));
  });
  document.querySelectorAll('[data-c6-preset]').forEach(b => {
    b.addEventListener('click', () => { st.p = FT_C6_PRESET[b.getAttribute('data-c6-preset')].slice(); draw(); });
  });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 7：撲克牌——52 張 = 4 種花色 × 13 種點數
   ========================================================================== */
const FT_SUITS = [
  { s: '♠', name: '黑桃', red: false },
  { s: '♥', name: '紅心', red: true },
  { s: '♦', name: '方塊', red: true },
  { s: '♣', name: '梅花', red: false }
];
const FT_RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const FT_C7_SUIT = {
  all: { name: '任何花色', ok: () => true },
  red: { name: '紅色', ok: s => s.red },
  black: { name: '黑色', ok: s => !s.red },
  S: { name: '黑桃', ok: s => s.s === '♠' },
  H: { name: '紅心', ok: s => s.s === '♥' },
  D: { name: '方塊', ok: s => s.s === '♦' },
  C: { name: '梅花', ok: s => s.s === '♣' }
};
const FT_C7_RANK = {
  all: { name: '任何點數', ok: () => true },
  A: { name: 'A', ok: r => r === 'A' },
  K: { name: 'K', ok: r => r === 'K' },
  face: { name: 'J、Q、K（人頭牌）', ok: r => r === 'J' || r === 'Q' || r === 'K' },
  letter: { name: '英文字母（A、K、Q、J）', ok: r => /^[AKQJ]$/.test(r) },
  num: { name: '數字（2～10）', ok: r => /^\d+$/.test(r) }
};

function initC7Canvas() {
  const cv = hbEl('canvas-c7');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c7-formula'), fb = hbEl('c7-feedback');
  let su = 'red', rk = 'all';

  function draw() {
    ctx.clearRect(0, 0, W, cv.height);
    const SU = FT_C7_SUIT[su], RK = FT_C7_RANK[rk];
    ft2Title(ctx, `一副 52 張撲克牌：${SU.name}、${RK.name.replace(/（.*）/, '')}`, FT_TONE[6]);
    const cw = 36, ch = 48, gx = 39, gy = 54, x0 = (540 - 12 * gx - cw) / 2, y0 = 48;
    let m = 0;
    const sCnt = FT_SUITS.filter(s => SU.ok(s)).length;
    const rCnt = FT_RANKS.filter(r => RK.ok(r)).length;
    FT_SUITS.forEach((s, i) => {
      FT_RANKS.forEach((r, j) => {
        const hit = SU.ok(s) && RK.ok(r);
        if (hit) m++;
        const x = x0 + j * gx, y = y0 + i * gy;
        ctx.save();
        ctx.globalAlpha = hit ? 1 : 0.25;
        ctx.fillStyle = FT_CREAM;
        roundRect(ctx, x, y, cw, ch, 5);
        ctx.fill();
        if (hit) {
          ctx.strokeStyle = FT_MUSTARD; ctx.lineWidth = 3;
          ctx.shadowColor = FT_MUSTARD; ctx.shadowBlur = 6;
          ctx.stroke();
        }
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = hit ? 1 : 0.35;
        const col = s.red ? '#d64545' : '#1f2937';
        textCenter(ctx, r, x + cw / 2, y + 15, col, f(800, r === '10' ? 13 : 15));
        textCenter(ctx, s.s, x + cw / 2, y + 34, col, f(700, 16));
        ctx.restore();
      });
    });
    dkRow(ctx, `花色 ${sCnt} 種 × 點數 ${rCnt} 種 = ${m} 張`, 292, FT_CREAM, 18);
    dkRich(ctx, [['P = ', FT_CREAM], [ft2Rich(m, 52), FT_MUSTARD]], W / 2, 342, 24);
    let note = '每一張被抽到的機會相等，共 52 種結果';
    if (su === 'all' && rk === 'all') note = '任何一張都符合：必然事件，機率 1';
    else if (rk === 'letter') note = 'A 也是英文字母，字母牌每種花色有 4 張';
    else if (rk === 'num') note = '數字牌是 2～10，每種花色有 9 張';
    ft2Line(ctx, note, 390, FT_FAINT, 15);

    out.innerHTML = `抽到這種牌的機率 ${wbrEq(ft2Tex(m, 52))}`;
    out.setAttribute('data-p', `${m}/52`);
    fb.innerHTML = wrapFeedback(`符合的牌是「${SU.name}」的 ${sCnt} 種花色裡，點數為「${RK.name}」的 ${rCnt} 種，共 \\(${sCnt} \\times ${rCnt} = ${m}\\) 張，機率 \\(${ft2Final(m, 52)}\\)。`);
    typeset([out, fb]);
  }

  bindPickGroup(hbEl('c7-suit-group'), 'data-c7-suit', m => { su = m; draw(); });
  bindPickGroup(hbEl('c7-rank-group'), 'data-c7-rank', m => { rk = m; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 8：抽出後不放回——下一次要用「剩下的」重新數
   ========================================================================== */
function initC8Canvas() {
  const cv = hbEl('canvas-c8');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c8-formula'), fb = hbEl('c8-feedback');
  const sR = hbEl('c8-r'), sW = hbEl('c8-w'), sxr = hbEl('c8-xr'), sxw = hbEl('c8-xw');
  let ev = 'r';

  function draw() {
    const R = hbIv(sR), Wt = hbIv(sW), xr = hbIv(sxr), xw = hbIv(sxw);
    ft2Set(hbEl('c8-vr'), R); ft2Set(hbEl('c8-vw'), Wt);
    ft2Set(hbEl('c8-vxr'), xr); ft2Set(hbEl('c8-vxw'), xw);
    ctx.clearRect(0, 0, W, cv.height);
    const evName = ev === 'r' ? '紅球' : '白球';
    ft2Title(ctx, `已經抽出的球不放回：下一次抽到${evName}的機率`, FT_TONE[7]);
    if (xr > R || xw > Wt) {
      ft2Line(ctx, `袋裡原本只有 ${R} 顆紅球、${Wt} 顆白球，`, 200, FT_NO, 17);
      ft2Line(ctx, `拿不出 ${xr} 顆紅球、${xw} 顆白球（情境不成立）`, 236, FT_NO, 17);
      ft2Line(ctx, '把「已抽出」的數量調到不超過原本的數量', 290, FT_CREAM, 15);
      out.innerHTML = '抽出的球比袋裡的還多（情境不成立）';
      fb.innerHTML = wrapFeedback(`已抽出的紅球不能超過 ${R} 顆、白球不能超過 ${Wt} 顆。`);
      typeset([out, fb]);
      return;
    }
    const r2 = R - xr, w2 = Wt - xw, n2 = r2 + w2;
    if (n2 === 0) {
      ft2Line(ctx, '球全部被抽完了，袋裡沒有球可以再抽（情境不成立）', 220, FT_NO, 17);
      ft2Line(ctx, '把「已抽出」的數量調少一點', 270, FT_CREAM, 15);
      out.innerHTML = '袋中已經沒有球（情境不成立）';
      fb.innerHTML = wrapFeedback('要再抽一次，袋子裡至少要剩 1 顆球。');
      typeset([out, fb]);
      return;
    }
    ft2Bag(ctx, 18, 46, 300, 178);
    textCenter(ctx, '袋子裡（剩下的）', 168, 64, FT_FELT, f(800, 14));
    const items = [];
    for (let i = 0; i < r2; i++) items.push({ color: FT_RED, hi: ev === 'r', dim: ev !== 'r' });
    for (let i = 0; i < w2; i++) items.push({ color: FT_CREAM, hi: ev === 'w', dim: ev !== 'w' });
    ft2BallGrid(ctx, items, 168, 96, 7, 14, 38);
    ctx.save();
    ctx.strokeStyle = FT_LINE; ctx.setLineDash([5, 4]); ctx.lineWidth = 2;
    roundRect(ctx, 332, 46, 190, 178, 16);
    ctx.stroke();
    ctx.restore();
    textCenter(ctx, '已抽出（不放回）', 427, 64, FT_FAINT, f(800, 14));
    const gone = [];
    for (let i = 0; i < xr; i++) gone.push({ color: FT_RED, dim: true });
    for (let i = 0; i < xw; i++) gone.push({ color: FT_CREAM, dim: true });
    if (gone.length) ft2BallGrid(ctx, gone, 427, 96, 5, 12, 32);
    else textCenter(ctx, '（還沒抽）', 427, 130, FT_FAINT, f(700, 14));

    const m0 = ev === 'r' ? R : Wt, m2 = ev === 'r' ? r2 : w2;
    dkRich(ctx, [[`一開始：${R} 紅 ${Wt} 白，共 ${R + Wt} 顆，P = ${ft2Rich(m0, R + Wt)}`, FT_FAINT]], W / 2, 262, 15);
    dkRow(ctx, `現在剩：${r2} 紅 ${w2} 白，共 ${n2} 顆`, 302, FT_CREAM, 18);
    dkRich(ctx, [['下一次 P = ', FT_CREAM], [ft2Rich(m2, n2), FT_MUSTARD]], W / 2, 350, 24);
    ft2Line(ctx, '分子、分母都要用「袋子裡剩下的」重新數', 398, FT_FAINT, 15);

    out.innerHTML = `下一次抽到${evName}的機率 ${wbrEq(ft2Tex(m2, n2))}`;
    out.setAttribute('data-p', `${m2}/${n2}`);
    const same = m0 * n2 === m2 * (R + Wt);
    fb.innerHTML = wrapFeedback(`拿走 ${xr} 顆紅球、${xw} 顆白球之後，袋子裡剩 ${n2} 顆，其中${evName} ${m2} 顆，機率是 \\(${ft2Final(m2, n2)}\\)${same ? '——這次剛好跟一開始一樣' : '，已經和一開始的 \\(' + ft2Final(m0, R + Wt) + '\\) 不同'}。`);
    typeset([out, fb]);
  }

  [sR, sW, sxr, sxw].forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c8-ev-group'), 'data-c8-ev', m => { ev = m; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 9：樹狀圖——兩層，列出所有結果（點末端選出事件）
   ========================================================================== */
const FT_C9_ITEM = {
  coin: { name: '硬幣', opts: ['正', '反'] },
  spin: { name: '三色轉盤', opts: ['紅', '黃', '綠'] },
  box: { name: '盒玩', opts: ['甲', '乙', '丙', '丁'] }
};

function initC9Canvas() {
  const cv = hbEl('canvas-c9');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c9-formula'), fb = hbEl('c9-feedback');
  const st = { a: 'coin', b: 'coin', sel: { '0,1': true, '1,0': true } };
  let leafPos = [];

  function draw() {
    const A = FT_C9_ITEM[st.a], B = FT_C9_ITEM[st.b];
    const na = A.opts.length, nb = B.opts.length, T = na * nb;
    ctx.clearRect(0, 0, W, cv.height);
    ft2Title(ctx, `第一次：${A.name}　第二次：${B.name}（點末端選出事件）`, FT_TONE[8]);
    const rootX = W / 2, rootY = 64, y1 = 140, y2 = 240;
    const leafGap = Math.min(64, 500 / T);
    const left = W / 2 - leafGap * (T - 1) / 2;
    leafPos = [];
    ft2Node(ctx, rootX, rootY, 18, '始', FT_FELT, { size: 14 });
    textLeft(ctx, '第一次', 14, y1, FT_FAINT, f(700, 12.5));
    textLeft(ctx, '第二次', 14, y2 - 30, FT_FAINT, f(700, 12.5));
    const sel = [];
    for (let i = 0; i < na; i++) {
      const xs = left + leafGap * (i * nb), xe = left + leafGap * (i * nb + nb - 1);
      const x1 = (xs + xe) / 2;
      ft2Edge(ctx, rootX, rootY + 18, x1, y1 - 16, FT_CREAM);
      for (let j = 0; j < nb; j++) {
        const x2 = left + leafGap * (i * nb + j);
        const on = !!st.sel[`${i},${j}`];
        if (on) sel.push(`(${A.opts[i]}, ${B.opts[j]})`);
        ft2Edge(ctx, x1, y1 + 16, x2, y2 - 13, FT_CREAM);
        const r = Math.min(14, leafGap * 0.45);
        ft2Node(ctx, x2, y2, r, B.opts[j], on ? FT_MUSTARD : FT_CREAM, { hi: on, fill: on ? FT_MUSTARD : undefined, size: Math.min(14, Math.round(r * 1.05)) });
        leafPos.push({ i, j, x: x2, y: y2, r: Math.max(r, 11) });
      }
      ft2Node(ctx, x1, y1, 16, A.opts[i], FT_FELT, { size: 15 });
    }
    const m = sel.length;
    dkRow(ctx, `所有結果：${na} × ${nb} = ${T} 種（每一個末端是一種）`, 294, FT_CREAM, 17);
    let listTxt = m ? sel.join('、') : '還沒選（點上方的末端）';
    if (m > 6) listTxt = sel.slice(0, 5).join('、') + '、…';
    const lines = fitLines(ctx, `選出的結果：${listTxt}（${m} 種）`, W - 40, f(700, 14));
    lines.slice(0, 3).forEach((ln, k) => ft2Line(ctx, ln, 332 + k * 22, FT_MUSTARD, 14));
    dkRich(ctx, [['P = ', FT_CREAM], [ft2Rich(m, T), FT_MUSTARD]], W / 2, 418, 23);

    out.innerHTML = `選出的事件的機率 ${wbrEq(ft2Tex(m, T))}`;
    out.setAttribute('data-p', `${m}/${T}`);
    fb.innerHTML = wrapFeedback(`第一次有 ${na} 種、每一種後面又各接 ${nb} 種，末端共 \\(${na} \\times ${nb} = ${T}\\) 個、機會都相等。` +
      (st.a === st.b && st.a === 'coin' ? '<br>注意 (正, 反) 和 (反, 正) 是<strong>兩個不同</strong>的末端。' : ''));
    typeset([out, fb]);
  }

  cv.addEventListener('click', e => {
    const p = ft2Pos(cv, e);
    const hit = leafPos.find(q => (p.x - q.x) ** 2 + (p.y - q.y) ** 2 <= (q.r + 4) ** 2);
    if (!hit) return;
    const key = `${hit.i},${hit.j}`;
    if (st.sel[key]) delete st.sel[key]; else st.sel[key] = true;
    draw();
  });
  bindPickGroup(hbEl('c9-a-group'), 'data-c9-a', m => { st.a = m; st.sel = {}; draw(); });
  bindPickGroup(hbEl('c9-b-group'), 'data-c9-b', m => { st.b = m; st.sel = {}; draw(); });
  hbEl('c9-clear').addEventListener('click', () => { st.sel = {}; draw(); });
  hbEl('c9-all').addEventListener('click', () => {
    st.sel = {};
    FT_C9_ITEM[st.a].opts.forEach((_, i) => FT_C9_ITEM[st.b].opts.forEach((__, j) => { st.sel[`${i},${j}`] = true; }));
    draw();
  });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 10：兩人比輸贏——樹狀圖數出誰贏的情形
   ========================================================================== */
const FT_RPS = ['剪刀', '石頭', '布'];

function initC10Canvas() {
  const cv = hbEl('canvas-c10');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c10-formula'), fb = hbEl('c10-feedback');
  const sa = [hbEl('c10-a1'), hbEl('c10-a2'), hbEl('c10-a3')];
  const sb = [hbEl('c10-b1'), hbEl('c10-b2'), hbEl('c10-b3')];
  const wrap = hbEl('c10-sliders');
  let mode = 'card';

  function draw() {
    const a = sa.map(hbIv), b = sb.map(hbIv);
    a.forEach((v, i) => ft2Set(hbEl(`c10-va${i + 1}`), v));
    b.forEach((v, i) => ft2Set(hbEl(`c10-vb${i + 1}`), v));
    if (wrap) wrap.style.display = mode === 'card' ? '' : 'none';
    ctx.clearRect(0, 0, W, cv.height);
    const card = mode === 'card';
    ft2Title(ctx, card ? '數字牌比大小：小棋、阿骰各出一張，大的贏' : '猜拳一次：小棋、阿骰各出一種拳', FT_TONE[9]);
    const la = card ? a.map(String) : FT_RPS, lb = card ? b.map(String) : FT_RPS;
    const res = (i, j) => {
      if (card) return a[i] > b[j] ? 1 : a[i] < b[j] ? -1 : 0;
      if (i === j) return 0;
      return (i - j + 3) % 3 === 1 ? 1 : -1;   // 石頭勝剪刀、布勝石頭、剪刀勝布
    };
    const rootY = 60, y1 = 132, y2 = 230;
    const gap = 52, left = W / 2 - gap * 4;
    ft2Node(ctx, W / 2, rootY, 18, '始', FT_FELT, { size: 14 });
    textLeft(ctx, '小棋', 6, y1, FT_YEL, f(800, 13));
    textLeft(ctx, '阿骰', 6, y2, FT_RED, f(800, 13));
    let w = 0, l = 0, t = 0;
    for (let i = 0; i < 3; i++) {
      const x1 = left + gap * (i * 3 + 1);
      ft2Edge(ctx, W / 2, rootY + 18, x1, y1 - 18, FT_CREAM);
      for (let j = 0; j < 3; j++) {
        const x2 = left + gap * (i * 3 + j);
        ft2Edge(ctx, x1, y1 + 18, x2, y2 - 18, FT_CREAM);
        ft2Node(ctx, x2, y2, 18, lb[j], FT_RED, { size: card ? 17 : 12 });
        const r = res(i, j);
        if (r > 0) w++; else if (r < 0) l++; else t++;
        const tag = r > 0 ? '小棋贏' : r < 0 ? '阿骰贏' : '平手';
        const col = r > 0 ? FT_YEL : r < 0 ? FT_RED : FT_FAINT;
        ctx.save();
        ctx.fillStyle = col;
        roundRect(ctx, x2 - 25, y2 + 28, 50, 24, 7);
        ctx.fill();
        ctx.restore();
        textCenter(ctx, tag, x2, y2 + 40, '#1f2937', f(800, 12));
      }
      ft2Node(ctx, x1, y1, 19, la[i], FT_YEL, { size: card ? 17 : 12 });
    }
    dkRow(ctx, `共 3 × 3 = 9 種：小棋贏 ${w} 種、阿骰贏 ${l} 種、平手 ${t} 種`, 314, FT_CREAM, 16);
    dkRich(ctx, [['P(小棋贏) = ', FT_YEL], [ft2Rich(w, 9), FT_YEL]], W / 2, 358, 21);
    dkRich(ctx, [['P(阿骰贏) = ', FT_RED], [ft2Rich(l, 9), FT_RED], ['　P(平手) = ', FT_FAINT], [ft2Rich(t, 9), FT_FAINT]], W / 2, 404, 19);
    const fair = w === l;
    ft2Line(ctx, fair ? '兩人贏的機率相同：這個遊戲公平' : (w > l ? '小棋贏的機率比較大' : '阿骰贏的機率比較大'), 446, fair ? FT_OK : FT_MUSTARD, 15);

    out.innerHTML = `小棋贏的機率 ${wbrEq(ft2Tex(w, 9))}`;
    out.setAttribute('data-p', `${w}/9,${l}/9,${t}/9`);
    fb.innerHTML = wrapFeedback(`樹狀圖的 9 個末端機會都相等：小棋贏 \\(${ft2Final(w, 9)}\\)、阿骰贏 \\(${ft2Final(l, 9)}\\)、平手 \\(${ft2Final(t, 9)}\\)，三個加起來是 \\(1\\)。`);
    typeset([out, fb]);
  }

  sa.concat(sb).forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c10-mode-group'), 'data-c10-mode', m => { mode = m; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 11：兩顆骰子——36 個數對
   ========================================================================== */
function initC11Canvas() {
  const cv = hbEl('canvas-c11');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c11-formula'), fb = hbEl('c11-feedback');
  const sk = hbEl('c11-k');
  const wrap = hbEl('c11-k-row');
  let mode = 'sum';

  const MODES = {
    sum: { name: k => `點數和 = ${k}`, test: (a, b, k) => a + b === k },
    le: { name: k => `點數和 ≤ ${k}`, test: (a, b, k) => a + b <= k },
    same: { name: () => '兩顆點數相同', test: (a, b) => a === b },
    odd: { name: () => '兩顆都是奇數', test: (a, b) => a % 2 === 1 && b % 2 === 1 }
  };

  function draw() {
    const k = hbIv(sk);
    ft2Set(hbEl('c11-vk'), k);
    if (wrap) wrap.style.display = (mode === 'sum' || mode === 'le') ? '' : 'none';
    const M = MODES[mode];
    ctx.clearRect(0, 0, W, cv.height);
    ft2Title(ctx, `依序擲兩顆公正骰子：${M.name(k)}`, FT_TONE[10]);
    const c = 44, x0 = (540 - 6 * c) / 2 + 12, y0 = 76;
    textCenter(ctx, '第二顆 b →', x0 + 3 * c, y0 - 30, FT_FAINT, f(700, 13));
    textCenter(ctx, '第一顆 a', x0 - 62, y0 - 12, FT_FAINT, f(700, 12.5));
    const hits = [];
    for (let a = 1; a <= 6; a++) {
      textCenter(ctx, String(a), x0 - 18, y0 + (a - 0.5) * c, FT_YEL, f(800, 16));
      textCenter(ctx, String(a), x0 + (a - 0.5) * c, y0 - 10, FT_RED, f(800, 16));
      for (let b = 1; b <= 6; b++) {
        const hit = M.test(a, b, k);
        if (hit) hits.push(`(${a}, ${b})`);
        const x = x0 + (b - 1) * c, y = y0 + (a - 1) * c;
        ctx.save();
        ctx.fillStyle = hit ? FT_MUSTARD : 'rgba(244, 234, 210, 0.06)';
        ctx.fillRect(x + 1.5, y + 1.5, c - 3, c - 3);
        ctx.strokeStyle = FT_LINE;
        ctx.strokeRect(x + 1.5, y + 1.5, c - 3, c - 3);
        ctx.restore();
        textCenter(ctx, `${a},${b}`, x + c / 2, y + c / 2, hit ? '#1f2937' : FT_FAINT, f(700, 12.5));
      }
    }
    const m = hits.length;
    let list = m ? hits.join('、') : '沒有';
    if (m > 6) list = `${hits.slice(0, 3).join('、')}、…（共 ${m} 個）`;
    ft2Line(ctx, `符合的數對：${list}${m && m <= 6 ? `（共 ${m} 個）` : ''}`, 360, FT_CREAM, 14.5);
    dkRich(ctx, [['P = ', FT_CREAM], [ft2Rich(m, 36), FT_MUSTARD]], W / 2, 406, 24);
    ft2Line(ctx, '(1, 4) 和 (4, 1) 是不同的結果：第一顆、第二顆分得出來', 450, FT_FAINT, 14);

    out.innerHTML = `${M.name(k).replace('≤', '小於或等於')}的機率 ${wbrEq(ft2Tex(m, 36))}`;
    out.setAttribute('data-p', `${m}/36`);
    fb.innerHTML = wrapFeedback(m === 0
      ? '表格裡一個符合的數對都沒有：這是不可能事件，機率 \\(0\\)。'
      : `\\(6 \\times 6 = 36\\) 個數對的機會都相等，符合的有 ${m} 個，機率 \\(${ft2Final(m, 36)}\\)。`);
    typeset([out, fb]);
  }

  sk.addEventListener('input', draw);
  bindPickGroup(hbEl('c11-mode-group'), 'data-c11-mode', m => { mode = m; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 12：取後放回、取後不放回——第二層的分支數不一樣
   ========================================================================== */
function initC12Canvas() {
  const cv = hbEl('canvas-c12');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c12-formula'), fb = hbEl('c12-feedback');
  let n = 4, back = 'no', ev = 'gt';

  const EV = {
    gt: { name: '第二顆號碼比第一顆大', test: (a, b) => b > a },
    odd: { name: '兩顆號碼和是奇數', test: (a, b) => (a + b) % 2 === 1 },
    same: { name: '兩顆號碼相同', test: (a, b) => a === b }
  };

  function draw() {
    const E = EV[ev], put = back === 'yes';
    ctx.clearRect(0, 0, W, cv.height);
    ft2Title(ctx, `${n} 顆號碼球（1～${n} 號）抽兩次，${put ? '取後放回' : '取後不放回'}`, FT_TONE[11]);
    const rootY = 58, y1 = 128, y2 = 226;
    const gap = Math.min(40, 504 / (n * n));
    const left = W / 2 - gap * (n * n - 1) / 2;
    ft2Node(ctx, W / 2, rootY, 16, '始', FT_FELT, { size: 13 });
    textLeft(ctx, '第一顆', 10, y1 - 26, FT_FAINT, f(700, 12.5));
    textLeft(ctx, '第二顆', 10, y2 - 30, FT_FAINT, f(700, 12.5));
    let T = 0, m = 0;
    const hits = [];
    for (let a = 1; a <= n; a++) {
      const x1 = left + gap * ((a - 1) * n + (n - 1) / 2);
      ft2Edge(ctx, W / 2, rootY + 16, x1, y1 - 15, FT_CREAM);
      for (let b = 1; b <= n; b++) {
        const x2 = left + gap * ((a - 1) * n + b - 1);
        const gone = !put && a === b;
        const r = Math.min(12, gap * 0.42);
        if (gone) {
          ft2Edge(ctx, x1, y1 + 15, x2, y2 - r, FT_CREAM, true);
          ft2Node(ctx, x2, y2, r, String(b), FT_NO, { dim: true, size: Math.round(r * 1.05) });
          ctx.save();
          ctx.strokeStyle = FT_NO; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x2 - r, y2 - r); ctx.lineTo(x2 + r, y2 + r); ctx.stroke();
          ctx.restore();
          continue;
        }
        T++;
        const hit = E.test(a, b);
        if (hit) { m++; hits.push(`(${a}, ${b})`); }
        ft2Edge(ctx, x1, y1 + 15, x2, y2 - r, FT_CREAM);
        ft2Node(ctx, x2, y2, r, String(b), hit ? FT_MUSTARD : FT_CREAM, { hi: hit, fill: hit ? FT_MUSTARD : undefined, size: Math.round(r * 1.05) });
      }
      ft2Node(ctx, x1, y1, 15, String(a), FT_FELT, { size: 14 });
    }
    if (!put) ft2Line(ctx, '紅叉：第一顆已經拿走，第二次抽不到同一顆', 266, FT_NO, 13.5);
    dkRow(ctx, put ? `所有結果：${n} × ${n} = ${T} 種` : `所有結果：${n} × ${n - 1} = ${T} 種`, 304, FT_CREAM, 18);
    let list = m ? hits.join('、') : '沒有';
    if (m > 6) list = `${hits.slice(0, 4).join('、')}、…（共 ${m} 種）`;
    ft2Line(ctx, `${E.name}：${list}${m && m <= 6 ? `（共 ${m} 種）` : ''}`, 344, FT_MUSTARD, 14.5);
    dkRich(ctx, [['P = ', FT_CREAM], [ft2Rich(m, T), FT_MUSTARD]], W / 2, 392, 24);
    let note = put ? '放回去：第二次又有 n 種可能' : '不放回：第二次只剩 n − 1 種可能';
    note = note.replace('n − 1', String(n - 1)).replace('n 種', `${n} 種`);
    if (!put && ev === 'same') note = '不放回時，兩顆不可能同號：不可能事件';
    ft2Line(ctx, note, 436, !put && ev === 'same' ? FT_NO : FT_FAINT, 15);

    out.innerHTML = `${E.name}的機率 ${wbrEq(ft2Tex(m, T))}`;
    out.setAttribute('data-p', `${m}/${T}`);
    fb.innerHTML = wrapFeedback(put
      ? `取後放回：每一次都是 ${n} 顆裡任取一顆，共 \\(${n} \\times ${n} = ${T}\\) 種，事件 ${m} 種，機率 \\(${ft2Final(m, T)}\\)。`
      : `取後不放回：第一次 ${n} 種，第二次只剩 ${n - 1} 種，共 \\(${n} \\times ${n - 1} = ${T}\\) 種，事件 ${m} 種，機率 \\(${ft2Final(m, T)}\\)。`);
    typeset([out, fb]);
  }

  bindPickGroup(hbEl('c12-n-group'), 'data-c12-n', m => { n = parseInt(m, 10); draw(); });
  bindPickGroup(hbEl('c12-back-group'), 'data-c12-back', m => { back = m; draw(); });
  bindPickGroup(hbEl('c12-ev-group'), 'data-c12-ev', m => { ev = m; draw(); });
  drawWithFonts(draw);
}
