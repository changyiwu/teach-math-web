/* ==========================================================================
   6-2-1（第六冊 2-1）資料的分析 — 互動 Canvas 與隨堂評量
   畫風：桌遊咖啡館・羊毛氈手作公仔（小棋、阿骰），第 2 章兩節共用。
   配色：芥末黃 FT_MUSTARD 是小棋／甲班，草綠 FT_GREEN 是阿骰／乙班；
   玫瑰 FT_ROSE 是錯、翡翠 FT_JADE 是對、金 FT_GOLD 是「要找的那一個」。

   共用工具在 ../math-canvas.js（T／FR／drawExpr／drawPanel／drawTitle／
   wbrEq／textCenter／textLeft／fitLines／drawWithFonts…），本檔只放本節的
   色票（FT_ 前綴）、統計工具（ft1 前綴）與 11 個互動。6-2-2 用 ft2 前綴。

   ⚠️ 四分位數一律照康軒課本的取法（P.59 Key point）：資料由小到大排序，
      令 N × k/4 = a；a 是整數就取第 a、a + 1 個的平均，a 不是整數就取
      「a 的整數部分再加 1」那一個。判斷整不整除一律用整數運算（N·k % 4）。
   ⚠️ 盒狀圖、直方圖的長度一律與數值成正比、縱軸從 0 開始（開發約束 17）。
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initQuizSystem();
  drawWithFonts(initQuizFigs);

  initMedianCanvas();
  initQuartCanvas();
  initPositionCanvas();
  initTableCanvas();
  initHistCanvas();
  initBuildBoxCanvas();
  initRangeCanvas();
  initOutlierCanvas();
  initCompareCanvas();
  initEstimateCanvas();
  initRankCanvas();
});

/* ==========================================================================
   0. 本節調色盤與小工具
   ========================================================================== */

const FT_MUSTARD = '#facc15';  // 小棋的芥末黃毛衣：甲、主要的那一組
const FT_GREEN = '#4ade80';    // 阿骰那一側：乙、對照的那一組
const FT_RED = '#f87171';      // 阿骰的紅白條紋
const FT_CREAM = '#fef3c7';    // 羊毛氈米白：深色底板上的字
const FT_TAN = '#e0b07a';      // 木桌、籌碼邊
const FT_SKY = '#7dd3fc';      // 第三組（盒狀圖三組比較時）
const FT_ROSE = '#fb7185';     // 錯誤、情境不成立
const FT_JADE = '#6ee7b7';     // 正確
const FT_GOLD = '#fbbf24';     // 要找的那一個位置

// 每個重點的主題色，與 style.css 的 #conceptN strong 對應
const FT_TONE = ['#fcd34d', '#5eead4', '#7dd3fc', '#fda4af', '#6ee7b7', '#d8b4fe',
                 '#fdba74', '#f9a8d4', '#a5b4fc', '#bef264', '#67e8f9'];

// 次數分配表的各個值：每個值一個顏色（毛氈籌碼）
const FT_CHIPS = ['#f472b6', '#2dd4bf', '#fcd34d', '#a78bfa', '#fb923c', '#60a5fa', '#a3e635'];

function ft1El(id) {
  return document.getElementById(id);
}

function ft1Iv(el) {
  return parseInt(el.value, 10);
}

function ft1Sorted(a) {
  return a.slice().sort((x, y) => x - y);
}

function ft1Expand(vals, freq) {
  const out = [];
  vals.forEach((v, i) => { for (let j = 0; j < freq[i]; j++) out.push(v); });
  return out;
}

function ft1Sum(a) {
  return a.reduce((s, v) => s + v, 0);
}

function ft1Cum(a) {
  const out = [];
  let s = 0;
  a.forEach(v => { s += v; out.push(s); });
  return out;
}

/* --------------------------------------------------------------------------
   康軒的四分位數：s 已由小到大排序，k = 1, 2, 3
   回傳 { N, k, num: N·k, aStr: N·k/4 的小數寫法, int: a 是否為整數,
          pos: [第幾個] 或 [第 a 個, 第 a+1 個]（1 起算）, v: 數值 }
   -------------------------------------------------------------------------- */
function ft1Q(s, k) {
  const N = s.length;
  const num = N * k;
  const isInt = num % 4 === 0;
  const aStr = numStr(num / 4);
  if (isInt) {
    const a = num / 4;
    return { N, k, num, aStr, int: true, a, pos: [a, a + 1], v: (s[a - 1] + s[a]) / 2 };
  }
  const fl = Math.floor(num / 4);
  return { N, k, num, aStr, int: false, fl, pos: [fl + 1], v: s[fl] };
}

function ft1Five(s) {
  return [s[0], ft1Q(s, 1).v, ft1Q(s, 2).v, ft1Q(s, 3).v, s[s.length - 1]];
}

// k/4 化成最簡分數（k = 2 時是 1/2）
function ft1K4(k) {
  return reduce(k, 4);
}

// 分數 n/d 的 LaTeX（化簡過）
function ft1FracTex(n, d) {
  const r = reduce(n, d);
  return texFrac(r[0], r[1]);
}

// canvas 上的分數元件（化簡過；整數就直接寫）
function ft1FrIt(n, d, color) {
  const r = reduce(n, d);
  return r[1] === 1 ? T(String(r[0]), color) : FR(r[0], r[1], color);
}

// 「N × k/4 = a」的 canvas 元件
function ft1PosItems(N, k, aStr, color) {
  const r = ft1K4(k);
  return [T(`${N} ×`, color), FR(r[0], r[1], color), T(`= ${aStr}`, color)];
}

// 「N × k/4 = a」的 LaTeX
function ft1PosTex(N, k, aStr) {
  const r = ft1K4(k);
  return `${N} \\times ${texFrac(r[0], r[1])} = ${aStr}`;
}

// 取法的中文說明
function ft1RuleText(q) {
  if (q.int) return `${q.aStr} 是整數 → 取第 ${q.a}、${q.a + 1} 個的平均`;
  return `${q.aStr} 不是整數 → 整數部分 ${q.fl} 再加 1，取第 ${q.fl + 1} 個`;
}

// Qk 的值（canvas 元件）：整數情形寫成平均的分數
function ft1ValItems(s, q, label, color) {
  if (q.int) {
    const x = s[q.a - 1], y = s[q.a];
    return [T(`${label} =`, color), FR(`${x} + ${y}`, 2, color), T(`= ${numStr(q.v)}`, color)];
  }
  return [T(`${label} = 第 ${q.fl + 1} 個 = ${numStr(q.v)}`, color)];
}

function ft1ValTex(s, q, label) {
  if (q.int) {
    const x = s[q.a - 1], y = s[q.a];
    return `${label} = \\frac{${x} + ${y}}{2} = ${numStr(q.v)}`;
  }
  return `${label} = ${numStr(q.v)}`;
}

/* --------------------------------------------------------------------------
   由五個數推估人數（重點 10、11）
   five = [最小值, Q1, Q2, Q3, 最大值]，N 筆資料
   根據：至少 k/4 的資料 ≤ Qk、至多 k/4 的資料 < Qk；
         最小值 ≤ 自己（至少 1 筆）、比最大值小的至多 N − 1 筆。
   strict = true 算「x < t」的筆數，false 算「x ≤ t」的筆數。
   回傳 { lo, hi, loK, hiK }：loK／hiK 是用到的那個點（0～4，-1 表示沒有）
   -------------------------------------------------------------------------- */
function ft1Bounds(five, N, t, strict) {
  const cLo = [1, Math.ceil(N / 4), Math.ceil(N / 2), Math.ceil(3 * N / 4), N];
  const cHi = [0, Math.floor(N / 4), Math.floor(N / 2), Math.floor(3 * N / 4), N - 1];
  // five 由小到大，所以「在 t 左邊」的點是前面一段：取最後一個當下限、
  // 第一個不在左邊的點當上限（cLo、cHi 都隨 k 遞增）
  let loK = -1, hiK = -1;
  for (let k = 0; k < 5; k++) {
    const below = strict ? five[k] < t : five[k] <= t;
    if (below) loK = k;
    else if (hiK === -1) hiK = k;
  }
  const lo = loK === -1 ? 0 : cLo[loK];
  const hi = hiK === -1 ? N : cHi[hiK];
  return { lo, hi, loK, hiK };
}

const FT_FIVE_NAME = ['最小值', 'Q1', 'Q2', 'Q3', '最大值'];
const FT_FIVE_TEX = ['\\text{最小值}', 'Q_1', 'Q_2', 'Q_3', '\\text{最大值}'];

// 「N 的 k/4」的說明文字
function ft1PartText(k, N) {
  if (k === 0) return '最低分那 1 人';
  if (k === 4) return `全部 ${N} 人`;
  const r = ft1K4(k);
  return `${N} 的 ${r[0]}/${r[1]}`;
}

/* --------------------------------------------------------------------------
   繪圖小工具
   -------------------------------------------------------------------------- */

// 一枚羊毛氈籌碼：圓形、米白字
function ft1Chip(ctx, x, y, r, label, fill, ring, txt, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // 毛氈的內圈縫線
  ctx.strokeStyle = 'rgba(10,8,28,0.35)';
  ctx.setLineDash([2, 2]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r - 3.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  if (ring) {
    ctx.strokeStyle = ring;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r + 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  if (label != null) textCenter(ctx, String(label), x, y + 0.5, txt || '#1e1b2e', f(800, Math.max(11, Math.round(r * 0.82))));
}

// 一半黃一半綠的籌碼（剛好等於 Qk 的資料：兩邊都算）
function ft1HalfChip(ctx, x, y, r, label, cA, cB, ring) {
  ctx.save();
  ctx.fillStyle = cA;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r, Math.PI / 2, Math.PI * 3 / 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = cB;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2);
  ctx.closePath();
  ctx.fill();
  if (ring) {
    ctx.strokeStyle = ring;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r + 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  textCenter(ctx, String(label), x, y + 0.5, '#1e1b2e', f(800, Math.max(11, Math.round(r * 0.82))));
}

// 籌碼排成幾列：回傳每一枚的中心
function ft1ChipLayout(N, perRow, top, rowGap, spacing, W) {
  const pts = [];
  const rows = Math.ceil(N / perRow);
  for (let r = 0; r < rows; r++) {
    const cnt = Math.min(perRow, N - r * perRow);
    const x0 = W / 2 - (cnt - 1) * spacing / 2;
    for (let i = 0; i < cnt; i++) pts.push({ x: x0 + i * spacing, y: top + r * rowGap });
  }
  return pts;
}

// 水平數線（統計圖的橫軸）：回傳 px(v)
function ft1Axis(ctx, o) {
  const { L, R, y, min, max, step } = o;
  const px = v => L + (v - min) / (max - min) * (R - L);
  ctx.save();
  if (o.grid) {
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    const gs = o.gridStep || step;
    for (let v = min; v <= max + 1e-9; v += gs) {
      ctx.beginPath();
      ctx.moveTo(px(v), o.gridTop);
      ctx.lineTo(px(v), y);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = MUTED;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(L - 6, y);
  ctx.lineTo(R + 6, y);
  ctx.stroke();
  for (let v = min; v <= max + 1e-9; v += step) {
    ctx.beginPath();
    ctx.moveTo(px(v), y);
    ctx.lineTo(px(v), y + 6);
    ctx.stroke();
    textCenter(ctx, numStr(v), px(v), y + 17, INK, o.font || f(600, 12));
  }
  if (o.minor) {
    ctx.lineWidth = 1;
    for (let v = min; v <= max + 1e-9; v += o.minor) {
      ctx.beginPath();
      ctx.moveTo(px(v), y);
      ctx.lineTo(px(v), y + 3);
      ctx.stroke();
    }
  }
  ctx.restore();
  if (o.label) textLeft(ctx, o.label, R - 56, y + 34, MUTED, f(700, 12));
  return px;
}

// 盒狀圖：five = [最小值, Q1, Q2, Q3, 最大值]，yc 為中線，h 為盒高
// o.step：1 只畫軸、2 再加最小值／Q2／最大值的直線段、3 再加盒子、4 再接橫線（預設 4）
function ft1Box(ctx, px, five, yc, h, color, o) {
  const opt = o || {};
  const step = opt.step == null ? 4 : opt.step;
  const [mn, q1, q2, q3, mx] = five.map(px);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = opt.lw || 2.6;
  ctx.lineCap = 'round';
  if (step >= 2) {
    [mn, q2, mx].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, yc - h / 2);
      ctx.lineTo(x, yc + h / 2);
      ctx.stroke();
    });
  }
  if (step >= 3) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.16;
    ctx.fillRect(q1, yc - h / 2, q3 - q1, h);
    ctx.globalAlpha = 1;
    ctx.strokeRect(q1, yc - h / 2, q3 - q1, h);
  }
  if (step >= 4) {
    ctx.beginPath();
    ctx.moveTo(mn, yc);
    ctx.lineTo(q1, yc);
    ctx.moveTo(q3, yc);
    ctx.lineTo(mx, yc);
    ctx.stroke();
  }
  ctx.restore();
  if (opt.vals) {
    // 數值標在盒子上方；跟上一個太近時改標在盒子下方
    const xs = [mn, q1, q2, q3, mx];
    let prevTop = -999;
    xs.forEach((x, i) => {
      let y;
      if (x - prevTop < 26) {
        y = yc + h / 2 + 11;
      } else {
        y = yc - h / 2 - 11;
        prevTop = x;
      }
      textCenter(ctx, numStr(five[i]), x, y, opt.valColor || FT_CREAM, f(700, opt.valSize || 12));
    });
  }
  if (opt.name) textLeft(ctx, opt.name, opt.nameX == null ? 8 : opt.nameX, yc, color, f(800, 14));
}

// 水平的量尺括號（全距、四分位距）：從 x1 到 x2，在 y 高度
function ft1Span(ctx, x1, x2, y, color, label) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y + 6);
  ctx.lineTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.lineTo(x2, y + 6);
  ctx.stroke();
  ctx.restore();
  if (label) {
    ctx.save();
    ctx.font = f(800, 13);
    const w = ctx.measureText(label).width + 12;
    ctx.restore();
    const cx = (x1 + x2) / 2;
    ctx.save();
    ctx.fillStyle = 'rgba(15,12,35,0.92)';
    roundRect(ctx, cx - w / 2, y - 10, w, 20, 6);
    ctx.fill();
    ctx.restore();
    textCenter(ctx, label, cx, y, color, f(800, 13));
  }
}

// 一行置中的混排說明（中文字與算式元件）
function ft1Line(ctx, items, y, size, color) {
  return drawExpr(ctx, items, ctx.canvas.width / 2, y, size || 17, color || INK, { maxW: ctx.canvas.width - 44, gap: 6 });
}

// 長句子：量寬折行後置中
function ft1Note(ctx, text, y, color, size, maxW) {
  const font = f(700, size || 14);
  const lines = fitLines(ctx, text, maxW || ctx.canvas.width - 56, font);
  const lh = (size || 14) + 7;
  const y0 = y - (lines.length - 1) * lh / 2;
  lines.forEach((ln, i) => textCenter(ctx, ln, ctx.canvas.width / 2, y0 + i * lh, color, font));
}

// 小三角形指標（往下指）
function ft1Pointer(ctx, x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 7, y - 11);
  ctx.lineTo(x + 7, y - 11);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ==========================================================================
   隨堂評量
   ========================================================================== */
function initQuizSystem() {
  const quizCards = document.querySelectorAll('.quiz-card');

  // 第六冊 2-1 的 22 題正解
  // 正解字母分布：A 6 題、B 5 題、C 6 題、D 5 題（開發約束 36）
  const answers = {
    '6-2-1-1': 'C',    // ≤ 21 的有 5 個：5/9
    '6-2-1-2': 'B',    // (16 + 20) ÷ 2 = 18
    '6-2-1-3': 'C',    // 14 × 1/4 = 3.5 → 第 4 個 = 10
    '6-2-1-4': 'A',    // 先排序，11 × 3/4 = 8.25 → 第 9 個 = 40
    '6-2-1-5': 'B',    // 至少 6 人 ≤ Q1
    '6-2-1-6': 'C',    // Q1 = 6，≤ 6 的有 6 個：1/2
    '6-2-1-7': 'D',    // 24 × 3/4 = 18 → (5 + 6) ÷ 2 = 5.5
    '6-2-1-8': 'A',    // Q1 = 第 7 個 = 6；Q2 = 第 13、14 個 = 7
    '6-2-1-9': 'B',    // 30 × 3/4 = 22.5 → 第 23 個在 30～40
    '6-2-1-10': 'D',   // 36 人，第 9、10 個都在 50～60
    '6-2-1-11': 'A',   // 8、12、15
    '6-2-1-12': 'D',   // Q1 到 Q3 之間（含）至少一半
    '6-2-1-13': 'C',   // 全距 30、四分位距 10
    '6-2-1-14': 'A',   // 262 − 185 = 77
    '6-2-1-15': 'B',   // 全距變大、四分位距不變
    '6-2-1-16': 'D',   // 中間一半很集中，有極端值
    '6-2-1-17': 'C',   // a > b，c > d
    '6-2-1-18': 'A',   // 第二次的四分位距 40 最大
    '6-2-1-19': 'B',   // 不及格至多 9 人
    '6-2-1-20': 'C',   // 甲班至少 10 人高於 80
    '6-2-1-21': 'D',   // 推理：68 < Q1，至少 30 人比她高
    '6-2-1-22': 'A'    // 小棋的名次一定比阿骰好
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

/* --------------------------------------------------------------------------
   評量附圖（靜態）：盒狀圖與直方圖
   -------------------------------------------------------------------------- */
const QUIZ_FIGS = {
  'qf-9': { type: 'hist', edges: [0, 10, 20, 30, 40, 50, 60], freq: [2, 5, 9, 8, 4, 2],
    yMax: 10, yStep: 2, xLabel: '得分（分）' },
  'qf-10': { type: 'hist', edges: [40, 50, 60, 70, 80, 90, 100], freq: [3, 7, 10, 9, 5, 2],
    yMax: 12, yStep: 2, xLabel: '分數（分）' },
  'qf-12': { type: 'box', min: 0, max: 80, step: 10, minor: 5, label: '得分（分）', vals: true,
    boxes: [{ five: [17, 31, 37, 53, 71], color: FT_MUSTARD }] },
  'qf-17': { type: 'box', min: 0, max: 100, step: 10, minor: 5, label: '分數（分）', vals: true,
    boxes: [{ name: '甲班', five: [20, 38, 55, 70, 92], color: FT_MUSTARD },
            { name: '乙班', five: [30, 45, 52, 62, 85], color: FT_GREEN }] },
  'qf-18': { type: 'box', min: 0, max: 100, step: 10, minor: 5, label: '分數（分）', grid: true,
    boxes: [{ name: '第一次', five: [20, 40, 55, 70, 90], color: FT_MUSTARD },
            { name: '第二次', five: [30, 45, 55, 85, 95], color: FT_GREEN },
            { name: '第三次', five: [10, 50, 65, 80, 100], color: FT_SKY },
            { name: '第四次', five: [25, 35, 50, 70, 80], color: FT_RED }] },
  'qf-19': { type: 'box', min: 30, max: 100, step: 10, minor: 5, label: '分數（分）', vals: true, line: 60,
    boxes: [{ five: [41, 62, 70, 81, 97], color: FT_MUSTARD }] },
  'qf-20': { type: 'box', min: 30, max: 100, step: 10, minor: 5, label: '分數（分）', vals: true,
    boxes: [{ name: '甲班', five: [48, 63, 72, 84, 98], color: FT_MUSTARD },
            { name: '乙班', five: [35, 50, 61, 70, 80], color: FT_GREEN }] },
  'qf-21': { type: 'box', min: 20, max: 100, step: 10, minor: 5, label: '得分（分）', vals: true, line: 68,
    boxes: [{ name: '拼字', five: [28, 45, 56, 64, 90], color: FT_MUSTARD },
            { name: '卡牌', five: [35, 52, 62, 75, 93], color: FT_GREEN },
            { name: '推理', five: [40, 70, 78, 86, 99], color: FT_SKY }] },
  'qf-22': { type: 'box', min: 30, max: 100, step: 10, minor: 5, label: '分數（分）', vals: true, line: 80,
    boxes: [{ name: '甲班', five: [40, 55, 66, 78, 94], color: FT_MUSTARD },
            { name: '乙班', five: [50, 70, 82, 90, 98], color: FT_GREEN }] }
};

function drawQuizBox(cv, cfg) {
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  const n = cfg.boxes.length;
  const named = cfg.boxes.some(b => b.name);
  const L = named ? 74 : 34, R = cv.width - 26;
  const top = 34, axisY = cv.height - 44;
  const band = (axisY - top - 10) / n;
  const px = ft1Axis(ctx, { L, R, y: axisY, min: cfg.min, max: cfg.max, step: cfg.step, minor: cfg.minor,
    label: cfg.label, grid: cfg.grid, gridStep: cfg.minor, gridTop: top - 10 });
  if (cfg.line != null) {
    ctx.save();
    ctx.strokeStyle = FT_ROSE;
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(px(cfg.line), top - 14);
    ctx.lineTo(px(cfg.line), axisY);
    ctx.stroke();
    ctx.restore();
  }
  const h = Math.min(30, band * 0.42);
  cfg.boxes.forEach((b, i) => {
    const yc = top + band * (i + 0.5) + (cfg.vals ? 8 : 0);
    ft1Box(ctx, px, b.five, yc, h, b.color, { vals: cfg.vals, name: b.name, nameX: 8 });
  });
}

function drawQuizHist(cv, cfg) {
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  const e = cfg.edges, fr = cfg.freq;
  const L = 56, R = cv.width - 30, T0 = 34, B = cv.height - 44;
  const px = v => L + (v - e[0]) / (e[e.length - 1] - e[0]) * (R - L);
  const py = v => B - v / cfg.yMax * (B - T0);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  for (let v = cfg.yStep; v <= cfg.yMax; v += cfg.yStep) {
    ctx.beginPath(); ctx.moveTo(L, py(v)); ctx.lineTo(R, py(v)); ctx.stroke();
  }
  fr.forEach((c, i) => {
    ctx.fillStyle = 'rgba(250,204,21,0.30)';
    ctx.fillRect(px(e[i]), py(c), px(e[i + 1]) - px(e[i]), B - py(c));
    ctx.strokeStyle = FT_MUSTARD;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(px(e[i]), py(c), px(e[i + 1]) - px(e[i]), B - py(c));
    textCenter(ctx, String(c), (px(e[i]) + px(e[i + 1])) / 2, py(c) - 10, FT_CREAM, f(800, 13));
  });
  ctx.strokeStyle = MUTED;
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(L, T0 - 8); ctx.lineTo(L, B); ctx.lineTo(R + 8, B); ctx.stroke();
  ctx.restore();
  for (let v = 0; v <= cfg.yMax; v += cfg.yStep) textLeft(ctx, String(v), L - 22, py(v), INK, f(600, 12));
  e.forEach(v => textCenter(ctx, String(v), px(v), B + 15, INK, f(600, 12)));
  textLeft(ctx, '次數（人）', L - 40, T0 - 20, MUTED, f(700, 12));
  textLeft(ctx, cfg.xLabel, R - 64, B + 33, MUTED, f(700, 12));
}

function initQuizFigs() {
  Object.keys(QUIZ_FIGS).forEach(id => {
    const cv = ft1El(id);
    if (!cv) return;
    const cfg = QUIZ_FIGS[id];
    if (cfg.type === 'hist') drawQuizHist(cv, cfg); else drawQuizBox(cv, cfg);
  });
}

/* ==========================================================================
   重點 1：中位數——N × 1/2 與「至少一半」
   ⚠️ 兩桌的資料不可以和 Q1、Q2 的數字相同（開發約束 29）
   ========================================================================== */
const MD_POOL = [
  { name: '甲桌', d: [23, 31, 17, 28, 35, 19, 26, 40, 22, 33, 29, 37, 25, 44] },
  { name: '乙桌（有同分）', d: [27, 21, 27, 34, 18, 27, 30, 21, 38, 25, 30, 42, 24, 30] }
];

function initMedianCanvas() {
  const cv = ft1El('canvas-median');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sn = ft1El('md-n'), vn = ft1El('md-vn');
  const out = ft1El('md-formula'), fb = ft1El('md-feedback');
  const C = FT_TONE[0];
  let ds = 0;

  function draw() {
    const N = ft1Iv(sn);
    vn.textContent = N;
    const s = ft1Sorted(MD_POOL[ds].d.slice(0, N));
    const q = ft1Q(s, 2);
    const m = q.v;
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, `${MD_POOL[ds].name}：${N} 位玩家的得分（由小到大）`, C);

    const pts = ft1ChipLayout(N, 14, 88, 0, 36, W);
    const c1 = s.filter(v => v <= m).length;
    const c2 = s.filter(v => v >= m).length;
    s.forEach((v, i) => {
      const p = pts[i];
      const hit = q.pos.indexOf(i + 1) >= 0;
      ft1Chip(ctx, p.x, p.y, 15, v, FT_CREAM, hit ? FT_GOLD : null);
      textCenter(ctx, String(i + 1), p.x, p.y + 28, DIM, f(700, 12));
      // 下方兩條色帶：≤ 中位數（黃）、≥ 中位數（綠）
      if (v <= m) {
        ctx.fillStyle = FT_MUSTARD;
        ctx.fillRect(p.x - 15, p.y + 42, 30, 6);
      }
      if (v >= m) {
        ctx.fillStyle = FT_GREEN;
        ctx.fillRect(p.x - 15, p.y + 52, 30, 6);
      }
    });
    // 指標
    if (q.int) {
      const xa = pts[q.a - 1].x, xb = pts[q.a].x;
      ft1Pointer(ctx, (xa + xb) / 2, 66, FT_GOLD);
      textCenter(ctx, '取兩個的平均', (xa + xb) / 2, 50, FT_GOLD, f(800, 13));
    } else {
      const x = pts[q.fl].x;
      ft1Pointer(ctx, x, 66, FT_GOLD);
      textCenter(ctx, `第 ${q.fl + 1} 個`, x, 50, FT_GOLD, f(800, 13));
    }
    textLeft(ctx, '黃：≤ 中位數', 24, 172, FT_MUSTARD, f(800, 13));
    textLeft(ctx, '綠：≥ 中位數', 140, 172, FT_GREEN, f(800, 13));

    drawPanel(ctx, 16, 192, W - 32, 274, C, 0.07);
    ft1Line(ctx, ft1PosItems(N, 2, q.aStr, FT_CREAM), 222, 20);
    ft1Note(ctx, ft1RuleText(q), 262, FT_GOLD, 15);
    ft1Line(ctx, ft1ValItems(s, q, '中位數', FT_CREAM), 304, 19);

    const cmp = (c, need) => (c * 2 === N ? '=' : '>');
    ft1Line(ctx, [T(`≤ ${numStr(m)} 的有 ${c1} 個，占`, FT_MUSTARD), ft1FrIt(c1, N, FT_MUSTARD),
      T(cmp(c1), FT_MUSTARD), FR(1, 2, FT_MUSTARD)], 354, 17);
    ft1Line(ctx, [T(`≥ ${numStr(m)} 的有 ${c2} 個，占`, FT_GREEN), ft1FrIt(c2, N, FT_GREEN),
      T(cmp(c2), FT_GREEN), FR(1, 2, FT_GREEN)], 406, 17);
    ft1Note(ctx, (c1 * 2 === N && c2 * 2 === N)
      ? '兩邊剛好各一半。'
      : '兩邊都「至少一半」：中位數自己兩邊都算，同分的資料也會讓比例超過一半。', 446, MUTED, 13);

    out.innerHTML = `${wbrEq(ft1PosTex(N, 2, q.aStr))}，${wbrEq(ft1ValTex(s, q, '\\text{中位數}'))}`;
    fb.innerHTML = wrapFeedback(`小於或等於中位數的有 \\(${c1}\\) 個，占 \\(${ft1FracTex(c1, N)}\\)；`
      + `大於或等於中位數的有 \\(${c2}\\) 個，占 \\(${ft1FracTex(c2, N)}\\)。兩邊都至少占 \\(\\frac{1}{2}\\)。`);
    typeset([out, fb]);
  }

  sn.addEventListener('input', draw);
  bindPickGroup(ft1El('md-ds-group'), 'data-md-ds', v => { ds = parseInt(v, 10); draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 2：四分位數的算法——N × k/4
   原始資料是報名順序（沒有排序），取前 N 筆
   ========================================================================== */
const QT_RAW = [41, 27, 56, 33, 19, 48, 62, 36, 24, 51, 30, 45, 58, 22, 39, 53, 28, 64, 35, 47];

function initQuartCanvas() {
  const cv = ft1El('canvas-quart');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sn = ft1El('qt-n'), vn = ft1El('qt-vn');
  const out = ft1El('qt-formula'), fb = ft1El('qt-feedback');
  const C = FT_TONE[1];
  let k = 1, ord = 'sorted';

  function draw() {
    const N = ft1Iv(sn);
    vn.textContent = N;
    const raw = QT_RAW.slice(0, N);
    const s = ft1Sorted(raw);
    const q = ft1Q(s, k);
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, `${N} 位玩家的得分：找第 ${k} 四分位數 Q${k}`, C);

    if (ord === 'raw') {
      const rp = ft1ChipLayout(N, 20, 60, 0, 25, W);
      raw.forEach((v, i) => ft1Chip(ctx, rp[i].x, rp[i].y, 11, v, 'rgba(254,243,199,0.55)', null, '#1e1b2e'));
      textCenter(ctx, '↓ 報名順序沒有排好：先由小到大排序 ↓', W / 2, 86, FT_ROSE, f(800, 13));
    } else {
      textCenter(ctx, '資料已由小到大排好，直接數位置', W / 2, 70, MUTED, f(700, 13));
    }

    const pts = ft1ChipLayout(N, 10, 136, 60, 48, W);
    const all = [1, 2, 3].map(kk => ft1Q(s, kk));
    s.forEach((v, i) => {
      const p = pts[i];
      const hit = q.pos.indexOf(i + 1) >= 0;
      ft1Chip(ctx, p.x, p.y, 17, v, hit ? FT_GOLD : FT_CREAM, hit ? FT_GOLD : null);
      textCenter(ctx, String(i + 1), p.x, p.y + 27, DIM, f(700, 11));
    });
    // Q1、Q2、Q3 的小旗：選中的那一個亮起來
    all.forEach((qq, j) => {
      let x, y;
      if (qq.int) {
        const pa = pts[qq.a - 1], pb = pts[qq.a];
        if (pa.y === pb.y) { x = (pa.x + pb.x) / 2; y = pa.y - 26; }
        else { x = pb.x - 32; y = pb.y; }      // 跨兩排：標在下一排開頭的左邊
      } else { x = pts[qq.fl].x; y = pts[qq.fl].y - 26; }
      const on = j + 1 === k;
      textCenter(ctx, `Q${j + 1}`, x, y, on ? FT_GOLD : 'rgba(148,163,184,0.55)', f(800, on ? 14 : 12));
    });

    const py0 = N > 10 ? 234 : 176;
    drawPanel(ctx, 16, py0, W - 32, 466 - py0, C, 0.07);
    const mid = (py0 + 466) / 2;
    ft1Line(ctx, ft1PosItems(N, k, q.aStr, FT_CREAM), mid - 76, 20);
    ft1Note(ctx, ft1RuleText(q), mid - 36, FT_GOLD, 15);
    ft1Line(ctx, ft1ValItems(s, q, `Q${k}`, FT_CREAM), mid + 6, 19);
    ft1Note(ctx, `這群資料：Q1 = ${numStr(all[0].v)}，Q2 = ${numStr(all[1].v)}，Q3 = ${numStr(all[2].v)}`, mid + 48, MUTED, 13);
    if (ord === 'raw') {
      const bad = q.int ? (raw[q.a - 1] + raw[q.a]) / 2 : raw[q.fl];
      ft1Note(ctx, `沒排序就直接數，會拿到 ${numStr(bad)}——錯的。`, mid + 80, FT_ROSE, 13);
    } else {
      ft1Note(ctx, k === 2 ? 'Q2 的算法和中位數一樣：Q2 就是中位數。' : `Q${k} 落在整體資料的 ${ft1K4(k)[0]}/${ft1K4(k)[1]} 位置。`, mid + 80, MUTED, 13);
    }

    out.innerHTML = `${wbrEq(ft1PosTex(N, k, q.aStr))}，${wbrEq(ft1ValTex(s, q, `Q_${k}`))}`;
    fb.innerHTML = wrapFeedback(q.int
      ? `\\(${q.aStr}\\) 是整數，所以取第 \\(${q.a}\\) 個與第 \\(${q.a + 1}\\) 個的平均。`
      : `\\(${q.aStr}\\) 不是整數，取整數部分 \\(${q.fl}\\) 再加 \\(1\\)，所以取第 \\(${q.fl + 1}\\) 個。`);
    typeset([out, fb]);
  }

  sn.addEventListener('input', draw);
  bindPickGroup(ft1El('qt-k-group'), 'data-qt-k', v => { k = parseInt(v, 10); draw(); });
  bindPickGroup(ft1El('qt-ord-group'), 'data-qt-ord', v => { ord = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 3：四分位數的相對位置——「至少 k/4」
   同分滑桿：把 Qk 那個位置附近的 t 筆資料改成同一個數
   ========================================================================== */
const PS_BASE = [12, 15, 17, 20, 22, 25, 27, 30, 32, 35, 38, 40, 43, 46, 49, 52];

function ft1PsData(N, k, t) {
  const s = PS_BASE.slice(0, N);
  const q0 = ft1Q(s, k);
  const b0 = q0.int ? q0.a - 1 : q0.fl;     // 0 起算
  const st = clamp(b0 - Math.floor((t - 1) / 2), 0, N - t);
  const v = s[b0];
  for (let i = st; i < st + t; i++) s[i] = v;
  return s;
}

function initPositionCanvas() {
  const cv = ft1El('canvas-position');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sn = ft1El('ps-n'), st = ft1El('ps-t');
  const vn = ft1El('ps-vn'), vt = ft1El('ps-vt');
  const out = ft1El('ps-formula'), fb = ft1El('ps-feedback');
  const C = FT_TONE[2];
  let k = 1;

  function draw() {
    const N = ft1Iv(sn), t = ft1Iv(st);
    vn.textContent = N; vt.textContent = t;
    const s = ft1PsData(N, k, t);
    const q = ft1Q(s, k);
    const Q = q.v;
    const c1 = s.filter(v => v <= Q).length;
    const c2 = s.filter(v => v >= Q).length;
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, `${N} 筆資料、${t} 筆同分：Q${k} 兩側各有多少？`, C);

    const pts = ft1ChipLayout(N, 8, 86, 66, 58, W);
    s.forEach((v, i) => {
      const p = pts[i];
      const hit = q.pos.indexOf(i + 1) >= 0;
      if (v === Q) ft1HalfChip(ctx, p.x, p.y, 20, v, FT_MUSTARD, FT_GREEN, hit ? FT_GOLD : null);
      else ft1Chip(ctx, p.x, p.y, 20, v, v < Q ? FT_MUSTARD : FT_GREEN, hit ? FT_GOLD : null);
      textCenter(ctx, String(i + 1), p.x, p.y + 31, DIM, f(700, 11));
    });
    textLeft(ctx, `黃：< Q${k}　綠：> Q${k}　半黃半綠：= Q${k}（兩邊都算）`, 24, 210, INK, f(700, 13));

    drawPanel(ctx, 16, 228, W - 32, 238, C, 0.07);
    ft1Line(ctx, [...ft1PosItems(N, k, q.aStr, FT_CREAM), T(`→ Q${k} = ${numStr(Q)}`, FT_GOLD)], 256, 18);
    const r = ft1K4(k), r2 = ft1K4(4 - k);
    const cmp = (c, kk) => (c * 4 === kk * N ? '=' : '>');
    ft1Line(ctx, [T(`≤ Q${k} 的有 ${c1} 個，占`, FT_MUSTARD), ft1FrIt(c1, N, FT_MUSTARD),
      T(cmp(c1, k), FT_MUSTARD), FR(r[0], r[1], FT_MUSTARD)], 310, 17);
    ft1Line(ctx, [T(`≥ Q${k} 的有 ${c2} 個，占`, FT_GREEN), ft1FrIt(c2, N, FT_GREEN),
      T(cmp(c2, 4 - k), FT_GREEN), FR(r2[0], r2[1], FT_GREEN)], 366, 17);
    const exact = c1 * 4 === k * N && c2 * 4 === (4 - k) * N;
    ft1Note(ctx, exact
      ? `兩邊剛好是 ${r[0]}/${r[1]} 與 ${r2[0]}/${r2[1]}。`
      : `比例超過 ${r[0]}/${r[1]} 或 ${r2[0]}/${r2[1]}：位置要進位、或有同分卡在 Q${k} 上，所以課本只能說「至少」。`,
    424, exact ? MUTED : FT_GOLD, 13);

    out.innerHTML = `\\(Q_${k} = ${numStr(Q)}\\)，\\(\\le Q_${k}\\)：\\(${ft1FracTex(c1, N)}\\)，\\(\\ge Q_${k}\\)：\\(${ft1FracTex(c2, N)}\\)`;
    fb.innerHTML = wrapFeedback(`至少 \\(${texFrac(r[0], r[1])}\\) 的資料小於或等於 \\(Q_${k}\\)，`
      + `且至少 \\(${texFrac(r2[0], r2[1])}\\) 的資料大於或等於 \\(Q_${k}\\)。`);
    typeset([out, fb]);
  }

  [sn, st].forEach(el => el.addEventListener('input', draw));
  bindPickGroup(ft1El('ps-k-group'), 'data-ps-k', v => { k = parseInt(v, 10); draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 4：次數分配表求四分位數——累積次數找位置
   ⚠️ 不可以和 Q7、Q8 的表相同
   ========================================================================== */
const TB_DATA = [
  { name: '每局拿到的星星數', unit: '顆', vals: [1, 2, 3, 4, 5, 6], freq: [4, 6, 8, 5, 3, 2] },
  { name: '每人的積分', unit: '分', vals: [10, 15, 20, 25, 30, 35, 40], freq: [2, 5, 7, 6, 5, 3, 1] },
  { name: '每人玩過的桌遊數', unit: '款', vals: [3, 4, 5, 6, 7, 8], freq: [5, 7, 4, 6, 6, 2] }
];

function initTableCanvas() {
  const cv = ft1El('canvas-table');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const out = ft1El('tb-formula'), fb = ft1El('tb-feedback');
  const C = FT_TONE[3];
  let ds = 0, k = 1;

  function draw() {
    const D = TB_DATA[ds];
    const s = ft1Expand(D.vals, D.freq);
    const N = s.length;
    const cum = ft1Cum(D.freq);
    const q = ft1Q(s, k);
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, `${D.name}（共 ${N} 人）：找 Q${k}`, C);

    // 表格：值／次數／累積次數
    const n = D.vals.length;
    const x0 = 24, hw = 92, cw = (W - 48 - hw) / n, rh = 30, y0 = 50;
    const rowNames = [`${D.unit}`, '次數（人）', '累積（人）'];
    // 目標值所在的欄
    const hitVals = q.pos.map(p => s[p - 1]);
    for (let r = 0; r < 3; r++) {
      const y = y0 + r * rh;
      ctx.save();
      ctx.fillStyle = r === 0 ? 'rgba(253,164,175,0.12)' : 'rgba(255,255,255,0.03)';
      ctx.fillRect(x0, y, W - 48, rh);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.strokeRect(x0, y, W - 48, rh);
      ctx.restore();
      textCenter(ctx, rowNames[r], x0 + hw / 2, y + rh / 2, MUTED, f(700, 13));
      for (let i = 0; i < n; i++) {
        const cx = x0 + hw + cw * (i + 0.5);
        const txt = r === 0 ? D.vals[i] : (r === 1 ? D.freq[i] : cum[i]);
        const hit = hitVals.indexOf(D.vals[i]) >= 0;
        textCenter(ctx, String(txt), cx, y + rh / 2, hit ? FT_GOLD : (r === 2 ? FT_CREAM : INK), f(800, 14));
      }
    }
    for (let i = 0; i < n; i++) {
      if (hitVals.indexOf(D.vals[i]) < 0) continue;
      ctx.save();
      ctx.strokeStyle = FT_GOLD;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x0 + hw + cw * i + 2, y0 + 2, cw - 4, rh * 3 - 4);
      ctx.restore();
    }

    // 位置條：N 個格子，依值上色
    const sy = 176, sh = 28, sx0 = 24, sw = (W - 48) / N;
    let vi = 0;
    s.forEach((v, i) => {
      while (D.vals[vi] !== v) vi++;
      ctx.save();
      ctx.fillStyle = FT_CHIPS[vi % FT_CHIPS.length];
      ctx.globalAlpha = q.pos.indexOf(i + 1) >= 0 ? 1 : 0.42;
      ctx.fillRect(sx0 + sw * i + 0.5, sy, sw - 1, sh);
      ctx.restore();
    });
    // 每一組的分界：標累積次數
    cum.forEach((c, i) => {
      const x = sx0 + sw * c;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, sy - 4); ctx.lineTo(x, sy + sh + 4); ctx.stroke();
      ctx.restore();
      textCenter(ctx, String(c), x, sy + sh + 14, INK, f(700, 11));
      const cx = sx0 + sw * (c - D.freq[i] / 2);
      if (D.freq[i] * sw >= 16) textCenter(ctx, String(D.vals[i]), cx, sy + sh / 2, '#1e1b2e', f(800, 12));
    });
    // 指到目標位置
    const xs = q.pos.map(p => sx0 + sw * (p - 0.5));
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
    ft1Pointer(ctx, mx, sy - 4, FT_GOLD);
    textCenter(ctx, q.int ? `第 ${q.a}、${q.a + 1} 個` : `第 ${q.fl + 1} 個`, mx, sy - 24, FT_GOLD, f(800, 13));

    drawPanel(ctx, 16, 228, W - 32, 238, C, 0.07);
    ft1Line(ctx, [T(`全部 ${N} 人：`, INK), ...ft1PosItems(N, k, q.aStr, FT_CREAM)], 256, 18);
    ft1Note(ctx, ft1RuleText(q), 296, FT_GOLD, 14);
    // 用累積次數定位
    const look = q.pos.map(p => {
      const gi = cum.findIndex(c => c >= p);
      const before = gi === 0 ? 0 : cum[gi - 1];
      return `第 ${p} 個：累積 ${before} < ${p} ≤ ${cum[gi]}，是 ${D.vals[gi]}`;
    });
    look.forEach((ln, i) => ft1Note(ctx, ln, 334 + i * 28, INK, 14));
    ft1Line(ctx, ft1ValItems(s, q, `Q${k}`, FT_CREAM), q.int ? 420 : 400, 19);

    out.innerHTML = `${wbrEq(ft1PosTex(N, k, q.aStr))}，${wbrEq(ft1ValTex(s, q, `Q_${k}`))}`;
    fb.innerHTML = wrapFeedback(`把次數一路累加：累積次數第一次「達到或超過」位置的那一欄，就是那一個人的數值。`);
    typeset([out, fb]);
  }

  bindPickGroup(ft1El('tb-ds-group'), 'data-tb-ds', v => { ds = parseInt(v, 10); draw(); });
  bindPickGroup(ft1El('tb-k-group'), 'data-tb-k', v => { k = parseInt(v, 10); draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 5：次數分配直方圖——Qk 在哪一組
   中間那一組（20～30 分）的次數可以調
   ⚠️ 位置 a、a+1 落在不同組時，只看直方圖判斷不出 Qk 在哪一組（開發約束 27）
   ========================================================================== */
const HS_EDGES = [0, 10, 20, 30, 40, 50, 60];
const HS_BASE = [3, 6, 0, 7, 4, 2];   // 第 3 組由滑桿決定

function initHistCanvas() {
  const cv = ft1El('canvas-hist');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sm = ft1El('hs-m'), vm = ft1El('hs-vm');
  const out = ft1El('hs-formula'), fb = ft1El('hs-feedback');
  const C = FT_TONE[4];
  let k = 3;

  function draw() {
    const m = ft1Iv(sm);
    vm.textContent = m;
    const fr = HS_BASE.slice();
    fr[2] = m;
    const N = ft1Sum(fr), cum = ft1Cum(fr);
    const num = N * k, isInt = num % 4 === 0;
    const aStr = numStr(num / 4);
    const pos = isInt ? [num / 4, num / 4 + 1] : [Math.floor(num / 4) + 1];
    const grp = pos.map(p => cum.findIndex(c => c >= p));
    const ok = grp.length === 1 || grp[0] === grp[1];
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, `桌遊比賽得分的直方圖（共 ${N} 人）：Q${k} 在哪一組？`, C);

    const L = 58, R = 516, T0 = 62, B = 262, yMax = 16;
    const px = v => L + v / 60 * (R - L);
    const py = v => B - v / yMax * (B - T0);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    for (let v = 2; v <= yMax; v += 2) { ctx.beginPath(); ctx.moveTo(L, py(v)); ctx.lineTo(R, py(v)); ctx.stroke(); }
    ctx.restore();
    fr.forEach((c, i) => {
      const x1 = px(HS_EDGES[i]), x2 = px(HS_EDGES[i + 1]);
      const hit = grp.indexOf(i) >= 0;
      ctx.save();
      ctx.fillStyle = hit ? (ok ? 'rgba(251,191,36,0.55)' : 'rgba(251,113,133,0.45)') : 'rgba(110,231,183,0.22)';
      ctx.fillRect(x1, py(c), x2 - x1, B - py(c));
      ctx.strokeStyle = hit ? (ok ? FT_GOLD : FT_ROSE) : FT_JADE;
      ctx.lineWidth = hit ? 2.6 : 1.4;
      ctx.strokeRect(x1, py(c), x2 - x1, B - py(c));
      ctx.restore();
      textCenter(ctx, String(c), (x1 + x2) / 2, py(c) - 10, FT_CREAM, f(800, 14));
      textCenter(ctx, `累積 ${cum[i]}`, (x1 + x2) / 2, B + 34, i === grp[0] || i === grp[1] ? FT_GOLD : MUTED, f(700, 12));
    });
    ctx.save();
    ctx.strokeStyle = MUTED; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(L, T0 - 8); ctx.lineTo(L, B); ctx.lineTo(R + 8, B); ctx.stroke();
    ctx.restore();
    for (let v = 0; v <= yMax; v += 4) textLeft(ctx, String(v), L - 24, py(v), INK, f(600, 12));
    HS_EDGES.forEach(v => textCenter(ctx, String(v), px(v), B + 15, INK, f(600, 12)));
    textLeft(ctx, '次數（人）', 14, T0 - 18, MUTED, f(700, 12));

    drawPanel(ctx, 16, 312, W - 32, 154, C, 0.07);
    ft1Line(ctx, [T(`${fr.join(' + ')} = ${N}；`, INK), ...ft1PosItems(N, k, aStr, FT_CREAM)], 338, 17);
    const ruleTxt = isInt ? `${aStr} 是整數 → 看第 ${pos[0]}、${pos[1]} 個` : `${aStr} 不是整數 → 看第 ${pos[0]} 個`;
    ft1Note(ctx, ruleTxt, 374, FT_GOLD, 14);
    const gTxt = i => `${HS_EDGES[i]}～${HS_EDGES[i + 1]}`;
    if (ok) {
      const g = grp[0];
      const before = g === 0 ? 0 : cum[g - 1];
      ft1Note(ctx, `累積 ${before} 人 < ${pos[pos.length - 1]} ≤ ${cum[g]} 人 → Q${k} 在 ${gTxt(g)} 分這一組`, 410, FT_CREAM, 15);
      ft1Note(ctx, '直方圖只看得出「在哪一組」，看不出確切的分數。', 444, MUTED, 13);
    } else {
      ft1Note(ctx, `第 ${pos[0]} 個在 ${gTxt(grp[0])}、第 ${pos[1]} 個在 ${gTxt(grp[1])}，兩個的平均可能落在任一組`, 410, FT_ROSE, 14);
      ft1Note(ctx, '只看直方圖判斷不出 Q 在哪一組；把滑桿調一格看看。', 444, FT_ROSE, 13);
    }

    out.innerHTML = `${wbrEq(`N = ${N}`)}，${wbrEq(ft1PosTex(N, k, aStr))}`;
    fb.innerHTML = wrapFeedback(ok
      ? `由左往右累加次數：第 \\(${pos.join('、')}\\) 個人落在 ${gTxt(grp[0])} 分這一組，所以 \\(Q_${k}\\) 在這一組。`
      : `第 \\(${pos[0]}\\) 個與第 \\(${pos[1]}\\) 個在不同組，兩個的平均可能在 ${gTxt(grp[0])}，也可能在 ${gTxt(grp[1])}：這種直方圖判斷不出來。`);
    typeset([out, fb]);
  }

  sm.addEventListener('input', draw);
  bindPickGroup(ft1El('hs-k-group'), 'data-hs-k', v => { k = parseInt(v, 10); draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 6：盒狀圖的畫法——四個步驟
   ⚠️ 不可以和 Q11 的資料相同
   ========================================================================== */
const BX_DATA = [
  { name: '甲桌 12 人', d: [6, 9, 9, 11, 14, 15, 18, 20, 21, 25, 27, 33] },
  { name: '乙桌 15 人', d: [5, 8, 10, 12, 12, 13, 16, 18, 19, 22, 24, 24, 28, 31, 38] },
  { name: '丙桌 10 人', d: [14, 16, 17, 21, 24, 24, 26, 30, 35, 39] }
];
const BX_STEP_TEXT = [
  '❶ 畫出橫軸，標上單位與刻度（0 到 40，每格 5）。',
  '❷ 在最小值、Q2、最大值的上方各畫一條直線段。',
  '❸ 以 Q2 線段的長度當寬、Q1 到 Q3 當長，畫出長方形（盒子）。',
  '❹ 用橫線連接「最小值、Q1」與「Q3、最大值」，完成！'
];

function initBuildBoxCanvas() {
  const cv = ft1El('canvas-buildbox');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const ss = ft1El('bx-step'), vs = ft1El('bx-vstep');
  const out = ft1El('bx-formula'), fb = ft1El('bx-feedback');
  const C = FT_TONE[5];
  let ds = 0;

  function draw() {
    const step = ft1Iv(ss);
    vs.textContent = step;
    const s = BX_DATA[ds].d;
    const five = ft1Five(s);
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, `${BX_DATA[ds].name}的得分 → 盒狀圖`, C);

    const L = 40, R = 506;
    const px = v => L + v / 40 * (R - L);
    // 上：點圖（每一筆資料一顆籌碼，同分往上疊）
    const base = 168;
    const cnt = {};
    s.forEach(v => {
      cnt[v] = (cnt[v] || 0) + 1;
      ft1Chip(ctx, px(v), base - (cnt[v] - 1) * 15, 7, null, FT_CREAM);
    });
    ctx.save();
    ctx.strokeStyle = 'rgba(148,163,184,0.5)';
    ctx.beginPath(); ctx.moveTo(L, base + 10); ctx.lineTo(R, base + 10); ctx.stroke();
    ctx.restore();
    textLeft(ctx, '每顆籌碼是一位玩家', L, 56, MUTED, f(700, 12));

    // 下：盒狀圖與橫軸
    const axisY = 330, yc = 266, h = 54;
    if (step >= 2) {
      // 由點圖拉虛線下來，對到五個數
      ctx.save();
      ctx.strokeStyle = 'rgba(216,180,254,0.45)';
      ctx.setLineDash([3, 4]);
      five.forEach((v, i) => {
        if (step === 2 && (i === 1 || i === 3)) return;
        ctx.beginPath(); ctx.moveTo(px(v), base + 12); ctx.lineTo(px(v), yc - h / 2 - 4); ctx.stroke();
      });
      ctx.restore();
    }
    ft1Axis(ctx, { L, R, y: axisY, min: 0, max: 40, step: 5, label: '得分（分）' });
    if (step >= 2) ft1Box(ctx, px, five, yc, h, C, { step });
    // 五個數的標籤
    if (step >= 2) {
      const show = step === 2 ? [0, 2, 4] : [0, 1, 2, 3, 4];
      show.forEach(i => {
        const yy = (i % 2 === 0) ? yc + h / 2 + 14 : yc - h / 2 - 12;
        textCenter(ctx, `${FT_FIVE_NAME[i]} ${numStr(five[i])}`, px(five[i]), yy, i === 2 ? FT_GOLD : FT_CREAM, f(800, 11.5));
      });
    }

    drawPanel(ctx, 16, 372, W - 32, 94, C, 0.07);
    ft1Note(ctx, BX_STEP_TEXT[step - 1], 398, FT_CREAM, 14, W - 70);
    ft1Note(ctx, `五個數：最小值 ${numStr(five[0])}、Q1 ${numStr(five[1])}、Q2 ${numStr(five[2])}、Q3 ${numStr(five[3])}、最大值 ${numStr(five[4])}`,
      442, MUTED, 13, W - 60);

    const tx = five.map((v, i) => `${FT_FIVE_TEX[i]} = ${numStr(v)}`);
    out.innerHTML = tx.map(t => `\\(${t}\\)`).join('，');
    fb.innerHTML = wrapFeedback(`盒子從 \\(Q_1 = ${numStr(five[1])}\\) 畫到 \\(Q_3 = ${numStr(five[3])}\\)，`
      + `盒內的直線在 \\(Q_2 = ${numStr(five[2])}\\)；兩條橫線伸到最小值 \\(${numStr(five[0])}\\) 與最大值 \\(${numStr(five[4])}\\)。`);
    typeset([out, fb]);
  }

  ss.addEventListener('input', draw);
  bindPickGroup(ft1El('bx-ds-group'), 'data-bx-ds', v => { ds = parseInt(v, 10); draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 7：全距與四分位距——五個數各一支滑桿
   ⚠️ 五個數必須「最小值 ≤ Q1 ≤ Q2 ≤ Q3 ≤ 最大值」，否則情境不成立（開發約束 27）
   ⚠️ 滑桿只有偶數，Q12、Q14、Q17 的五個數刻意含奇數或超出範圍（開發約束 29）
   ========================================================================== */
function initRangeCanvas() {
  const cv = ft1El('canvas-range');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const ids = ['rg-min', 'rg-q1', 'rg-q2', 'rg-q3', 'rg-max'];
  const sl = ids.map(ft1El);
  const vl = ids.map(id => ft1El(id.replace('rg-', 'rg-v')));
  const out = ft1El('rg-formula'), fb = ft1El('rg-feedback');
  const C = FT_TONE[6];

  function draw() {
    const five = sl.map(ft1Iv);
    five.forEach((v, i) => { vl[i].textContent = v; });
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, '由五個數算出全距與四分位距', C);
    let bad = -1;
    for (let i = 0; i < 4; i++) if (five[i] > five[i + 1]) { bad = i; break; }

    const L = 40, R = 506;
    const px = ft1Axis(ctx, { L, R, y: 300, min: 0, max: 100, step: 10, minor: 5, label: '分數（分）' });
    if (bad >= 0) {
      drawPanel(ctx, 30, 90, W - 60, 150, FT_ROSE, 0.08);
      ft1Note(ctx, `${FT_FIVE_NAME[bad]} ${five[bad]} 比 ${FT_FIVE_NAME[bad + 1]} ${five[bad + 1]} 還大：情境不成立`, 140, FT_ROSE, 16);
      ft1Note(ctx, '五個數一定是「最小值 ≤ Q1 ≤ Q2 ≤ Q3 ≤ 最大值」。把滑桿調回這個順序。', 190, FT_ROSE, 14);
      out.innerHTML = `${FT_FIVE_NAME[bad]} \\(${five[bad]}\\) 大於 ${FT_FIVE_NAME[bad + 1]} \\(${five[bad + 1]}\\)（情境不成立）`;
      fb.innerHTML = wrapFeedback(`資料由小到大排序後，最小值、\\(Q_1\\)、\\(Q_2\\)、\\(Q_3\\)、最大值一定依序不減；目前 ${FT_FIVE_NAME[bad]} 是 \\(${five[bad]}\\)、${FT_FIVE_NAME[bad + 1]} 是 \\(${five[bad + 1]}\\)，順序反了。`);
      typeset([out, fb]);
      return;
    }
    const range = five[4] - five[0], iqr = five[3] - five[1];
    ft1Span(ctx, px(five[0]), px(five[4]), 92, FT_GOLD, `全距 ${range}`);
    ft1Span(ctx, px(five[1]), px(five[3]), 142, FT_TONE[6], `四分位距 ${iqr}`);
    ft1Box(ctx, px, five, 228, 56, C, { vals: false });
    five.forEach((v, i) => {
      const yy = (i % 2 === 0) ? 270 : 186;
      textCenter(ctx, `${FT_FIVE_NAME[i]} ${v}`, px(v), yy, i === 2 ? FT_GOLD : FT_CREAM, f(800, 11.5));
    });

    drawPanel(ctx, 16, 344, W - 32, 122, C, 0.07);
    ft1Note(ctx, `全距 = 最大值 − 最小值 = ${five[4]} − ${five[0]} = ${range}`, 370, FT_GOLD, 16);
    ft1Note(ctx, `四分位距 = Q3 − Q1 = ${five[3]} − ${five[1]} = ${iqr}`, 404, FT_TONE[6], 16);
    ft1Note(ctx, '全距看「全部資料」的範圍；四分位距看「中間一半資料」的範圍。', 442, MUTED, 13);

    out.innerHTML = `${wbrEq(`\\text{全距} = ${five[4]} - ${five[0]} = ${range}`)}，${wbrEq(`\\text{四分位距} = ${five[3]} - ${five[1]} = ${iqr}`)}`;
    fb.innerHTML = wrapFeedback(`盒子的長度就是四分位距 \\(${iqr}\\)；兩端最遠的距離就是全距 \\(${range}\\)。`);
    typeset([out, fb]);
  }

  sl.forEach(s => s.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 8：極端值——全距跟著跑，四分位距不動
   12 筆資料：[最低分, 31, 34, …, 46, 最高分]
   Q1 = 第 3、4 個的平均，Q3 = 第 9、10 個的平均，都碰不到頭尾兩筆
   ========================================================================== */
const OL_MID = [31, 34, 35, 37, 38, 40, 41, 43, 44, 46];

function initOutlierCanvas() {
  const cv = ft1El('canvas-outlier');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const slo = ft1El('ol-lo'), shi = ft1El('ol-hi');
  const vlo = ft1El('ol-vlo'), vhi = ft1El('ol-vhi');
  const out = ft1El('ol-formula'), fb = ft1El('ol-feedback');
  const C = FT_TONE[7];

  function draw() {
    const lo = ft1Iv(slo), hi = ft1Iv(shi);
    vlo.textContent = lo; vhi.textContent = hi;
    const s = [lo, ...OL_MID, hi];
    const five = ft1Five(s);
    const range = five[4] - five[0], iqr = five[3] - five[1];
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, '拉動最低分與最高分：誰跟著變？', C);

    const L = 36, R = 510;
    const px = v => L + v / 120 * (R - L);
    const base = 92;
    // 中間十筆靠得很近：交錯排成上下兩排，才看得出是十顆
    s.forEach((v, i) => {
      const edge = i === 0 || i === s.length - 1;
      const y = edge ? base - 6 : base - (i % 2 === 0 ? 0 : 13);
      ft1Chip(ctx, px(v), y, 5.5, null, edge ? FT_RED : FT_CREAM);
    });
    ft1Box(ctx, px, five, 160, 46, C, {});
    ft1Axis(ctx, { L, R, y: 206, min: 0, max: 120, step: 10, label: '得分（分）' });

    // 長條比較：長度與數值成正比（開發約束 17）
    const bx = 120, bw = 380, scale = bw / 120;
    const by1 = 270, by2 = 316;
    textLeft(ctx, '全距', 30, by1 + 12, FT_GOLD, f(800, 15));
    textLeft(ctx, '四分位距', 30, by2 + 12, C, f(800, 15));
    ctx.save();
    ctx.fillStyle = 'rgba(251,191,36,0.55)';
    ctx.fillRect(bx, by1, range * scale, 24);
    ctx.fillStyle = 'rgba(249,168,212,0.6)';
    ctx.fillRect(bx, by2, iqr * scale, 24);
    ctx.restore();
    textLeft(ctx, String(range), bx + range * scale + 8, by1 + 12, FT_GOLD, f(800, 15));
    textLeft(ctx, numStr(iqr), bx + iqr * scale + 8, by2 + 12, C, f(800, 15));

    drawPanel(ctx, 16, 360, W - 32, 106, C, 0.07);
    ft1Note(ctx, `全距 = ${hi} − ${lo} = ${range}　四分位距 = ${numStr(five[3])} − ${numStr(five[1])} = ${numStr(iqr)}`, 386, FT_CREAM, 15);
    ft1Note(ctx, '全距只用到頭尾兩筆，一個特別高或特別低的分數就把它拉大；', 418, MUTED, 13);
    ft1Note(ctx, '四分位距去掉頭尾各 1/4，不受極端值影響。', 442, MUTED, 13);

    out.innerHTML = `${wbrEq(`\\text{全距} = ${hi} - ${lo} = ${range}`)}，${wbrEq(`\\text{四分位距} = ${numStr(five[3])} - ${numStr(five[1])} = ${numStr(iqr)}`)}`;
    fb.innerHTML = wrapFeedback(`紅色兩顆是最低分 \\(${lo}\\) 與最高分 \\(${hi}\\)：不管怎麼拉，\\(Q_1 = ${numStr(five[1])}\\)、\\(Q_3 = ${numStr(five[3])}\\) 都不動，四分位距一直是 \\(${numStr(iqr)}\\)。`);
    typeset([out, fb]);
  }

  [slo, shi].forEach(s => s.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 9：用盒狀圖比較兩班
   ⚠️ 不可以和 Q17、Q18 的盒狀圖相同
   ========================================================================== */
const CP_PAIRS = [
  { a: [18, 35, 48, 66, 90], b: [26, 40, 52, 60, 78] },
  { a: [30, 44, 58, 71, 96], b: [12, 38, 61, 74, 88] },
  { a: [22, 46, 55, 63, 81], b: [35, 42, 50, 69, 99] }
];
const CP_ITEMS = {
  med: { name: '中位數', get: f5 => f5[2], tex: 'Q_2' },
  range: { name: '全距', get: f5 => f5[4] - f5[0], tex: '\\text{全距}' },
  iqr: { name: '四分位距', get: f5 => f5[3] - f5[1], tex: '\\text{四分位距}' }
};

function initCompareCanvas() {
  const cv = ft1El('canvas-compare');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const out = ft1El('cp-formula'), fb = ft1El('cp-feedback');
  const C = FT_TONE[8];
  let pi = 0, item = 'med';

  function draw() {
    const P = CP_PAIRS[pi], it = CP_ITEMS[item];
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, `比較甲、乙兩班的${it.name}`, C);
    const L = 74, R = 512;
    const px = ft1Axis(ctx, { L, R, y: 300, min: 0, max: 100, step: 10, minor: 5, label: '分數（分）',
      grid: true, gridStep: 10, gridTop: 50 });
    const rows = [{ f5: P.a, name: '甲班', color: FT_MUSTARD, y: 120 }, { f5: P.b, name: '乙班', color: FT_GREEN, y: 230 }];
    rows.forEach(r => {
      ft1Box(ctx, px, r.f5, r.y, 40, r.color, { vals: true, name: r.name, nameX: 10 });
      if (item === 'med') {
        ctx.save();
        ctx.strokeStyle = FT_GOLD; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(px(r.f5[2]), r.y - 24); ctx.lineTo(px(r.f5[2]), r.y + 24); ctx.stroke();
        ctx.restore();
      } else if (item === 'range') {
        ft1Span(ctx, px(r.f5[0]), px(r.f5[4]), r.y + 38, FT_GOLD, `全距 ${r.f5[4] - r.f5[0]}`);
      } else {
        ft1Span(ctx, px(r.f5[1]), px(r.f5[3]), r.y + 38, FT_GOLD, `四分位距 ${r.f5[3] - r.f5[1]}`);
      }
    });
    const va = it.get(P.a), vb = it.get(P.b);
    drawPanel(ctx, 16, 344, W - 32, 122, C, 0.07);
    const exprA = item === 'med' ? `${va}` : (item === 'range' ? `${P.a[4]} − ${P.a[0]} = ${va}` : `${P.a[3]} − ${P.a[1]} = ${va}`);
    const exprB = item === 'med' ? `${vb}` : (item === 'range' ? `${P.b[4]} − ${P.b[0]} = ${vb}` : `${P.b[3]} − ${P.b[1]} = ${vb}`);
    ft1Note(ctx, `甲班${it.name}：${exprA}`, 370, FT_MUSTARD, 15);
    ft1Note(ctx, `乙班${it.name}：${exprB}`, 400, FT_GREEN, 15);
    const big = va > vb ? '甲班' : (vb > va ? '乙班' : '');
    const mean = { med: '排在中間的那個分數比較高', range: '最高到最低的分布範圍比較廣', iqr: '中間一半的資料比較分散' }[item];
    ft1Note(ctx, big ? `${big}的${it.name}比較大：${mean}。` : `兩班的${it.name}一樣。`, 438, FT_CREAM, 14);

    const ta = item === 'med' ? `${va}` : (item === 'range' ? `${P.a[4]} - ${P.a[0]} = ${va}` : `${P.a[3]} - ${P.a[1]} = ${va}`);
    const tb = item === 'med' ? `${vb}` : (item === 'range' ? `${P.b[4]} - ${P.b[0]} = ${vb}` : `${P.b[3]} - ${P.b[1]} = ${vb}`);
    out.innerHTML = `甲班：${wbrEq(`${it.tex} = ${ta}`)}；乙班：${wbrEq(`${it.tex} = ${tb}`)}`;
    fb.innerHTML = wrapFeedback(item === 'med'
      ? '中位數看盒子裡那一條直線的位置。'
      : (item === 'range' ? '全距看整張盒狀圖從左端到右端有多長。' : '四分位距看盒子（長方形）有多長，不看兩條橫線。'));
    typeset([out, fb]);
  }

  bindPickGroup(ft1El('cp-pair-group'), 'data-cp-pair', v => { pi = parseInt(v, 10); draw(); });
  bindPickGroup(ft1El('cp-item-group'), 'data-cp-item', v => { item = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 10：由盒狀圖推估人數
   ⚠️ 不可以和 Q19、Q20 的盒狀圖與人數相同
   ========================================================================== */
const ES_FIVE = [34, 52, 63, 75, 96];

function initEstimateCanvas() {
  const cv = ft1El('canvas-estimate');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const stt = ft1El('es-t'), vt = ft1El('es-vt');
  const out = ft1El('es-formula'), fb = ft1El('es-feedback');
  const C = FT_TONE[9];
  let N = 32, dir = 'below';

  function draw() {
    const t = ft1Iv(stt);
    vt.textContent = t;
    const five = ES_FIVE;
    const bd = ft1Bounds(five, N, t, true);       // x < t 的人數
    const lo = dir === 'below' ? bd.lo : N - bd.hi;
    const hi = dir === 'below' ? bd.hi : N - bd.lo;
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    const what = dir === 'below' ? `低於 ${t} 分` : `${t} 分以上（含）`;
    drawTitle(ctx, `全班 ${N} 人：${what}的有幾人？`, C);

    const L = 40, R = 506;
    const px = ft1Axis(ctx, { L, R, y: 218, min: 20, max: 100, step: 10, minor: 5, label: '分數（分）' });
    // 要數的那一側塗色
    ctx.save();
    ctx.fillStyle = 'rgba(190,242,100,0.10)';
    if (dir === 'below') ctx.fillRect(L, 60, px(t) - L, 150);
    else ctx.fillRect(px(t), 60, R - px(t), 150);
    ctx.restore();
    ft1Box(ctx, px, five, 136, 48, C, { vals: true });
    ctx.save();
    ctx.strokeStyle = FT_ROSE; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(px(t), 54); ctx.lineTo(px(t), 218); ctx.stroke();
    ctx.restore();
    textCenter(ctx, `${t} 分`, px(t), 46, FT_ROSE, f(800, 13));

    drawPanel(ctx, 16, 262, W - 32, 204, C, 0.07);
    // 推理的兩句：用到哪一個點
    const loLine = bd.loK === -1 ? `沒有任何一個點比 ${t} 小：低於 ${t} 分的可能一個人也沒有`
      : `${FT_FIVE_NAME[bd.loK]} = ${five[bd.loK]} < ${t}：低於 ${t} 分的至少 ${bd.lo} 人（${ft1PartText(bd.loK, N)}）`;
    const hiLine = bd.hiK === -1 ? `最大值 ${five[4]} < ${t}：全部 ${N} 人都低於 ${t} 分`
      : (bd.hiK === 0 ? `最小值 ${five[0]} ≥ ${t}：沒有人低於 ${t} 分`
        : `${FT_FIVE_NAME[bd.hiK]} = ${five[bd.hiK]} ≥ ${t}：低於 ${t} 分的至多 ${bd.hi} 人`);
    if (bd.loK === 4) {
      ft1Note(ctx, hiLine, 310, INK, 13.5, W - 60);
    } else if (bd.hiK === 0) {
      ft1Note(ctx, hiLine, 310, INK, 13.5, W - 60);
    } else {
      ft1Note(ctx, loLine, 292, INK, 13.5, W - 60);
      ft1Note(ctx, hiLine, 328, INK, 13.5, W - 60);
    }
    if (dir === 'atleast') ft1Note(ctx, `${t} 分以上（含）＝ ${N} − 低於 ${t} 分的人數`, 362, MUTED, 13);
    const ans = lo === hi ? `${what}：恰好 ${lo} 人` : `${what}：至少 ${lo} 人、至多 ${hi} 人`;
    ft1Note(ctx, ans, 404, FT_GOLD, 17);
    ft1Note(ctx, '盒狀圖只告訴我們五個數，所以人數常常只能說「至少」「至多」。', 442, MUTED, 12.5);

    out.innerHTML = lo === hi
      ? `${what}：\\(${lo}\\) 人`
      : `${what}：\\(${lo} \\le \\text{人數} \\le ${hi}\\)`;
    fb.innerHTML = wrapFeedback(`至少 \\(\\frac{k}{4}\\) 的人分數小於或等於 \\(Q_k\\)、至多 \\(\\frac{k}{4}\\) 的人分數小於 \\(Q_k\\)：把 \\(${t}\\) 夾在哪兩個點之間，就決定了人數的範圍。`);
    typeset([out, fb]);
  }

  stt.addEventListener('input', draw);
  bindPickGroup(ft1El('es-n-group'), 'data-es-n', v => { N = parseInt(v, 10); draw(); });
  bindPickGroup(ft1El('es-dir-group'), 'data-es-dir', v => { dir = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 11：同一個分數在三種桌遊裡的排名
   每一種桌遊都是 40 人參加；比 s 高的人越多，排名越差
   ⚠️ 不可以和 Q21、Q22 的盒狀圖相同
   ========================================================================== */
const RK_GAMES = [
  { name: '疊疊樂', five: [30, 48, 58, 70, 92], color: FT_MUSTARD },
  { name: '拼圖', five: [45, 62, 70, 80, 96], color: FT_GREEN },
  { name: '骰子', five: [25, 40, 52, 66, 86], color: FT_SKY }
];
const RK_N = 40;

// 比 s 高（x > s）的人數範圍
function ft1Higher(five, N, s) {
  const b = ft1Bounds(five, N, s, false);   // x ≤ s 的人數
  return { lo: N - b.hi, hi: N - b.lo };
}

function initRankCanvas() {
  const cv = ft1El('canvas-rank');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const ss = ft1El('rk-s'), vs = ft1El('rk-vs');
  const out = ft1El('rk-formula'), fb = ft1El('rk-feedback');
  const C = FT_TONE[10];

  function draw() {
    const s = ft1Iv(ss);
    vs.textContent = s;
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, `小棋三種桌遊都拿 ${s} 分：哪一種排名最差？`, C);
    const L = 70, R = 510;
    const px = ft1Axis(ctx, { L, R, y: 262, min: 20, max: 100, step: 10, minor: 5, label: '得分（分）' });
    const hs = RK_GAMES.map(g => ft1Higher(g.five, RK_N, s));
    RK_GAMES.forEach((g, i) => {
      ft1Box(ctx, px, g.five, 84 + i * 62, 28, g.color, { vals: true, name: g.name, nameX: 8, valSize: 11 });
    });
    ctx.save();
    ctx.strokeStyle = FT_ROSE; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(px(s), 48); ctx.lineTo(px(s), 262); ctx.stroke();
    ctx.restore();

    drawPanel(ctx, 16, 300, W - 32, 166, C, 0.07);
    RK_GAMES.forEach((g, i) => {
      const h = hs[i];
      const txt = h.lo === h.hi ? `恰好 ${h.lo} 人` : `至少 ${h.lo} 人、至多 ${h.hi} 人`;
      ft1Note(ctx, `${g.name}：比 ${s} 分高的 ${txt}`, 326 + i * 30, g.color, 14.5);
    });
    // 一定最差：比她高的人數下限，比其他兩種的上限都多
    let worst = -1, best = -1;
    for (let i = 0; i < 3; i++) {
      if ([0, 1, 2].every(j => j === i || hs[i].lo > hs[j].hi)) worst = i;
      if ([0, 1, 2].every(j => j === i || hs[i].hi < hs[j].lo)) best = i;
    }
    let concl;
    if (worst >= 0) concl = `${RK_GAMES[worst].name}的排名一定最差`;
    else concl = '範圍互相重疊：判斷不出哪一種一定最差';
    if (best >= 0) concl += `；${RK_GAMES[best].name}的排名一定最好`;
    ft1Note(ctx, concl + '。', 428, worst >= 0 ? FT_GOLD : FT_ROSE, 14.5, W - 50);

    out.innerHTML = RK_GAMES.map((g, i) => `${g.name}：\\(${hs[i].lo} \\le \\text{人數} \\le ${hs[i].hi}\\)`).join('；');
    fb.innerHTML = wrapFeedback(`比 \\(${s}\\) 分高的人越多，排名越後面。分數落在 \\(Q_1\\) 左邊，至少 \\(\\frac{3}{4}\\) 的人比她高；落在 \\(Q_3\\) 右邊，至多 \\(\\frac{1}{4}\\) 的人比她高。`);
    typeset([out, fb]);
  }

  ss.addEventListener('input', draw);
  drawWithFonts(draw);
}
