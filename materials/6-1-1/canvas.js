/* ==========================================================================
   6-1-1（第六冊 1-1）二次函數的圖形與最大值、最小值 — 互動 Canvas 與隨堂評量
   畫風：街頭籃球噴漆塗鴉風（小弧、阿投），第 1 章只有這一節。
   配色：噴漆橘 SG_ORANGE、螢光粉 SG_PINK、電光青 SG_CYAN、萊姆綠 SG_LIME、
   檸檬黃 SG_YEL、奶油 SG_CREAM；薄荷綠 SG_OK 是「符合、答案」，玫瑰 SG_NO 是
   「不符合、錯誤、情境不成立」。

   共用工具在 ../math-canvas.js（T／IT／SEQ／FR／measure／drawIt／drawExpr／
   drawPanel／drawTitle／drawStepRows／drawPlane／drawDot／dashLine／axisArrow／
   q 有理數／parseExpr／wbrEq／drawWithFonts…），本檔只放本節的色票（SG_ 前綴）、
   拋物線小工具（sg 前綴）與 12 個互動。

   ⚠️ 係數 a 一律用有理數 [分子, 分母]（qOf），h、k 一律是整數；
      數值列的分數走 qTex（會先化簡），canvas 上的分數走 qIt（畫成直式分數）。
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initQuizSystem();

  initJudgeCanvas();
  initFenceCanvas();
  initAx2Canvas();
  initWidthCanvas();
  initVShiftCanvas();
  initHShiftCanvas();
  initVertexCanvas();
  initCrossCanvas();
  initExtremeCanvas();
  initFindCanvas();
  initMoveCanvas();
  initSymCanvas();
});

/* ==========================================================================
   0. 本節調色盤與小工具（SG_ = Street Graffiti）
   ========================================================================== */

const SG_ORANGE = '#fb923c';
const SG_PINK = '#f472b6';
const SG_CYAN = '#67e8f9';
const SG_LIME = '#bef264';
const SG_YEL = '#fde047';
const SG_CREAM = '#fef3c7';
const SG_GRAY = '#94a3b8';
const SG_OK = '#86efac';
const SG_NO = '#fb7185';

// 每個重點的主題色，與 style.css 的 #conceptN strong 對應
const SG_TONE = ['#fcd34d', '#5eead4', '#7dd3fc', '#fda4af', '#6ee7b7', '#d8b4fe',
                 '#fdba74', '#f9a8d4', '#a5b4fc', '#bef264', '#67e8f9', '#fca5a5'];

// 坐標平面：x、y 都是 −7～7（重點 1、10 另用較小的平面）
const SG_PLANE = { cx: 270, top: 50, unit: 22, min: -7, max: 7, tickFont: f(600, 11), labelEvery: 2 };

function sgEl(id) {
  return document.getElementById(id);
}

function sgIv(el) {
  return parseInt(el.value, 10);
}

// 滑桿值 n 代表 n/2（a 以 1/2 為一格）
function sgHalf(el) {
  return qOf(sgIv(el), 2);
}

// canvas 上的減號換成數學減號 −
function sgMn(s) {
  return String(s).replace(/-/g, '−');
}

// a(x − h)² + k 在 x 的函數值（有理數）
function sgEval(a, h, k, x) {
  return qAdd(qMul(a, (x - h) * (x - h)), k);
}

// LaTeX 的係數：1 不寫、−1 只寫負號
function sgCoefTex(a) {
  if (a[0] === a[1]) return '';
  if (a[0] === -a[1]) return '-';
  return qTex(a);
}

// (x − h)² 的寫法；h = 0 時只寫 x²
function sgCore(h) {
  if (h === 0) return 'x^2';
  return `(x ${h > 0 ? '-' : '+'} ${Math.abs(h)})^2`;
}

function sgKTail(k) {
  if (k === 0) return '';
  return k > 0 ? ` + ${k}` : ` - ${-k}`;
}

// 「y = a(x − h)² + k」的 LaTeX（不含 \( \)）
function sgVTex(a, h, k) {
  return `y = ${sgCoefTex(a)}${sgCore(h)}${sgKTail(k)}`;
}

// 同一條式子的 canvas 元件：分數係數畫成直式分數
function sgVItems(a, h, k, color) {
  let co = '', slots = [];
  if (a[0] === a[1]) co = '';
  else if (a[0] === -a[1]) co = '-';
  else if (a[1] === 1) co = String(a[0]);
  else { co = '@0'; slots = [qIt(a, color)]; }
  return exprItems(`y = ${co}${sgCore(h)}${sgKTail(k)}`, color, slots);
}

// (x, y) 坐標的 canvas 元件；x、y 可以是整數或有理數
function sgPtItem(x, y, color) {
  const xq = Array.isArray(x) ? x : [x, 1];
  const yq = Array.isArray(y) ? y : [y, 1];
  return SEQ([T('(', color), qIt(xq, color), T(',', color), T(' ', color), qIt(yq, color), T(')', color)], color, 1);
}

// 在點旁邊放一個帶深色底的標籤（元件），不超出畫布左右
function sgTag(ctx, item, x, y, color, opts) {
  const o = opts || {};
  const size = o.size || 14;
  ctx.save();
  const m = measure(ctx, item, size);
  const w = m.w;
  let lx = o.left ? x - 12 - w : x + 12;
  if (lx + w > ctx.canvas.width - 8) lx = x - 12 - w;
  if (lx < 8) lx = 8;
  const ly = y + (o.dy == null ? -18 : o.dy);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  roundRect(ctx, lx - 5, ly - m.h / 2 - 3, w + 10, m.h + 6, 6);
  ctx.fill();
  drawIt(ctx, item, lx, ly, size, color);
  ctx.restore();
}

// 純文字標籤（中文）
function sgTextTag(ctx, text, x, y, color, opts) {
  sgTag(ctx, T(text, color), x, y, color, opts);
}

function sgPlane(ctx, cfg) {
  return drawPlane(ctx, cfg || SG_PLANE);
}

// 在平面範圍內畫函數圖形（超出範圍的部分裁掉）
function sgCurve(ctx, P, fn, color, lw, dash) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(P.left - 1, P.top - 1, P.right - P.left + 2, P.bottom - P.top + 2);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw || 3;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  let started = false;
  for (let u = P.min - 0.5; u <= P.max + 0.5; u += 0.02) {
    const v = fn(u);
    const Y = P.py(v);
    if (!isFinite(Y) || Y < P.top - 300 || Y > P.bottom + 300) { started = false; continue; }
    const X = P.px(u);
    if (!started) { ctx.moveTo(X, Y); started = true; } else ctx.lineTo(X, Y);
  }
  ctx.stroke();
  ctx.restore();
}

function sgQuadFn(a, h, k) {
  const av = qVal(a);
  return u => av * (u - h) * (u - h) + k;
}

// 點在不在平面的可見範圍內
function sgIn(P, x, y) {
  const yv = Array.isArray(y) ? qVal(y) : y;
  return x >= P.min && x <= P.max && yv >= P.min && yv <= P.max;
}

// 鉛垂虛線 x = h（對稱軸）
function sgVLine(ctx, P, h, color) {
  dashLine(ctx, P.px(h), P.py(P.max) - 4, P.px(h), P.py(P.min), color, [7, 5]);
}

// 水平虛線 y = c
function sgHLine(ctx, P, c, color) {
  dashLine(ctx, P.px(P.min), P.py(c), P.px(P.max), P.py(c), color, [7, 5]);
}

// 粗一點的移動箭頭（平移示意，不是坐標軸）
function sgMoveArrow(ctx, x1, y1, x2, y2, color) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 4) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hs = 12;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - hs * 0.7 * Math.cos(ang), y2 - hs * 0.7 * Math.sin(ang));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hs * Math.cos(ang - 0.45), y2 - hs * Math.sin(ang - 0.45));
  ctx.lineTo(x2 - hs * Math.cos(ang + 0.45), y2 - hs * Math.sin(ang + 0.45));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 底板：第一行是算式元件、第二行是中文說明
function sgPanel(ctx, items, text, color, opts) {
  const o = opts || {};
  const W = ctx.canvas.width;
  const y0 = o.y == null ? 372 : o.y;
  const h = o.h == null ? 98 : o.h;
  drawPanel(ctx, 24, y0, W - 48, h, color, 0.1);
  if (items) drawExpr(ctx, items, W / 2, y0 + 30, o.size || 19, SG_CREAM, { maxW: W - 80 });
  const lines = Array.isArray(text) ? text : [text];
  lines.forEach((ln, i) => {
    if (!ln) return;
    textCenter(ctx, ln, W / 2, y0 + (items ? 62 : 32) + i * 24, i === 0 ? color : INK, f(800, 14));
  });
}

// a = 0 時不是二次函數：把畫面換成提醒
function sgZeroWarn(ctx, P, out, fb) {
  sgCurve(ctx, P, () => 0, SG_NO, 3);
  sgPanel(ctx, null, ['a = 0 時二次項消失，不是二次函數', '把 a 調離 0 再看看'], SG_NO);
  out.innerHTML = '\\(a = 0\\)：\\(\\text{（情境不成立）}\\)';
  fb.innerHTML = wrapFeedback('二次函數規定 \\(a \\ne 0\\)。\\(a = 0\\) 時 \\(ax^2\\) 這一項不見了，圖形變成一條水平線，不是拋物線。');
}

// 一般的多項式 [二次項, 一次項, 常數項] 寫成字串（LaTeX 與 parseExpr 共用）
function sgPolyStr(terms) {
  let s = '';
  terms.forEach(([c, v]) => {
    if (!c) return;
    const abs = Math.abs(c);
    const body = (v && abs === 1) ? v : `${abs}${v}`;
    if (!s) s = (c < 0 ? '-' : '') + body;
    else s += (c < 0 ? ' - ' : ' + ') + body;
  });
  return s || '0';
}

/* ==========================================================================
   隨堂評量
   ========================================================================== */
function initQuizSystem() {
  const quizCards = document.querySelectorAll('.quiz-card');

  // 第六冊 1-1 的 24 題正解
  // 正解字母分布：A 6 題、B 6 題、C 6 題、D 6 題（開發約束 36）
  const answers = {
    '1-1-1': 'B',    // y = x(6 − x) = −x² + 6x 是二次函數
    '1-1-2': 'D',    // k(x + 5)² − 3x² + 1 是一次函數 → k = 3
    '1-1-3': 'A',    // 周長 36 的長方形：y = x(18 − x)
    '1-1-4': 'C',    // 每兩隊各打 2 場：y = x(x − 1) = x² − x
    '1-1-5': 'B',    // y = −(1/3)x²：開口向下、對稱軸 y 軸、最高點 (0, 0)
    '1-1-6': 'D',    // y = 5x² 沿 x 軸對摺 → y = −5x²
    '1-1-7': 'C',    // |a|：5、1/4、4、2/5 → 乙 > 丁 > 丙 > 甲
    '1-1-8': 'A',    // 開口向上且比 y = −6x² 大 → 0 < a < 6，a = 5
    '1-1-9': 'B',    // y = −(3/4)x² 向下 6 → y = −(3/4)x² − 6，最高點 (0, −6)
    '1-1-10': 'D',   // y = 4x² + 5 → y = 4x² − 3：向下 8
    '1-1-11': 'A',   // y = (2/3)(x + 7)²：向左 7，最低點 (−7, 0)
    '1-1-12': 'C',   // y = −x² 向右 6 → y = −(x − 6)²
    '1-1-13': 'D',   // y = −3(x + 6)² + 2：頂點 (−6, 2)，對稱軸 x = −6
    '1-1-14': 'B',   // y = 2x² + 3 → y = 2(x − 5)² − 4：向右 5、向下 7
    '1-1-15': 'C',   // y = −(1/3)(x − 6)² + 9 與 x 軸有兩個交點
    '1-1-16': 'A',   // 頂點 (2, −7) 在 x 軸下方，沒有交點 → 開口向下，a = −4
    '1-1-17': 'B',   // y = −2(x + 9)² + 11：x = −9 時最大值 11
    '1-1-18': 'D',   // 乙 y = −(x + 15)² − 25：x = −15 時最大值 −25
    '1-1-19': 'A',   // 頂點 (5, −2)、過 (7, 10) → a = 3
    '1-1-20': 'C',   // 頂點 (0, 8)、過 (−4, 0) → y = −(1/2)x² + 8，另一交點 (4, 0)
    '1-1-21': 'B',   // 由 y = 4x² 平移、對稱軸 x = −1、過 (1, 9) → 頂點 (−1, −7)
    '1-1-22': 'C',   // y = (x − 6)² − 10 向左平移 9：y 軸交點先向下再向上
    '1-1-23': 'D',   // 到 x = 3 的距離 4、1、3，開口向下 → q > r > p
    '1-1-24': 'A'    // 水平線交點對稱於 x = 4：p = 2 × 4 − (−3) = 11
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
   重點 1：二次函數的意義——化簡後形如 y = ax² + bx + c（a ≠ 0）
   y = a(x + m)² + cx²：展開、合併，看 x 的最高次數
   ========================================================================== */
function initJudgeCanvas() {
  const cv = sgEl('canvas-judge');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sa = sgEl('jd-a'), sc = sgEl('jd-c'), sm = sgEl('jd-m');
  const va = sgEl('jd-va'), vc = sgEl('jd-vc'), vm = sgEl('jd-vm');
  const out = sgEl('jd-formula');
  const fb = sgEl('jd-feedback');
  const C = SG_TONE[0];

  function draw() {
    const a = sgIv(sa), c = sgIv(sc), m = sgIv(sm);
    va.textContent = sgMn(a); vc.textContent = sgMn(c); vm.textContent = sgMn(m);

    // 原式 a(x + m)² + cx²
    const core = m === 0 ? 'x^2' : `(x ${m > 0 ? '+' : '-'} ${Math.abs(m)})^2`;
    let orig = '';
    if (a) orig = (a === 1 ? '' : (a === -1 ? '-' : String(a))) + core;
    if (c) {
      const body = (Math.abs(c) === 1 ? '' : String(Math.abs(c))) + 'x^2';
      orig = orig ? `${orig} ${c < 0 ? '-' : '+'} ${body}` : (c < 0 ? '-' : '') + body;
    }
    if (!orig) orig = '0';
    const expd = sgPolyStr([[a, 'x^2'], [2 * a * m, 'x'], [a * m * m, ''], [c, 'x^2']]);
    const c2 = a + c, c1 = 2 * a * m, c0 = a * m * m;
    const merged = sgPolyStr([[c2, 'x^2'], [c1, 'x'], [c0, '']]);
    let kind, col;
    if (c2 !== 0) { kind = '二次函數'; col = SG_OK; }
    else if (c1 !== 0) { kind = '一次函數'; col = SG_NO; }
    else { kind = '常數函數'; col = SG_NO; }

    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, '先化簡，再看 x 的最高次數', C);
    const rows = [
      { name: '原式', hint: '', items: exprItems(`y = ${orig}`, SG_CREAM) },
      { name: '展開', hint: '把括號的平方乘開', items: exprItems(`y = ${expd}`, SG_CREAM) },
      { name: '合併', hint: 'x² 項的係數相加', items: exprItems(`y = ${merged}`, SG_CREAM) },
      { name: '判斷', hint: c2 !== 0 ? 'x² 項還在' : 'x² 項消掉了', items: [T(kind, col)], color: col }
    ];
    drawStepRows(ctx, rows, rows.length, { top: 62, gap: 46, color: C, size: 19 });

    const P = sgPlane(ctx, { cx: 270, top: 262, unit: 23, min: -4, max: 4, tickFont: f(600, 11), labelEvery: 2 });
    sgCurve(ctx, P, u => c2 * u * u + c1 * u + c0, col, 3);
    textLeft(ctx, c2 !== 0 ? '圖形是拋物線' : '圖形是直線', 22, 300, col, f(800, 14));

    out.innerHTML = wbrEq(`y = ${orig} = ${merged}`) + `：${kind}`;
    if (c2 !== 0) {
      fb.innerHTML = wrapFeedback(`合併後 \\(x^2\\) 項的係數是 \\(${a} + (${c}) = ${c2}\\)，不是 \\(0\\)，最高次數是二次，所以 \\(y\\) 是 \\(x\\) 的<strong>二次函數</strong>。`);
    } else if (c1 !== 0) {
      fb.innerHTML = wrapFeedback(`\\(x^2\\) 項的係數 \\(${a} + (${c}) = 0\\)，二次項消掉了，剩下 \\(y = ${merged}\\)。式子裡看得到平方，化簡後卻只是<strong>一次函數</strong>。`);
    } else {
      fb.innerHTML = wrapFeedback(`二次項和一次項都消掉了，剩下 \\(y = ${merged}\\)，是<strong>常數函數</strong>，不是二次函數。`);
    }
    typeset([out, fb]);
  }

  [sa, sc, sm].forEach(sl => sl.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 2：生活中的二次函數——用圍網圍出長方形，面積是邊長的二次函數
   ========================================================================== */
function initFenceCanvas() {
  const cv = sgEl('canvas-fence');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sL = sgEl('fc-L'), sx = sgEl('fc-x');
  const vL = sgEl('fc-vL'), vx = sgEl('fc-vx');
  const g = sgEl('fc-mode-group');
  const out = sgEl('fc-formula');
  const fb = sgEl('fc-feedback');
  const C = SG_TONE[1];
  let mode = 'wall';

  function draw() {
    const L = sgIv(sL);
    const half = L / 2;
    const xMax = half - 1;
    sx.max = String(xMax);
    if (sgIv(sx) > xMax) sx.value = String(xMax);
    const x = sgIv(sx);
    vL.textContent = String(L); vx.textContent = String(x);
    const wid = mode === 'wall' ? L - 2 * x : half - x;
    const area = x * wid;
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, mode === 'wall' ? `靠著球場牆，用 ${L} 公尺圍網圍成ㄇ形` : `用 ${L} 公尺圍網圍成一圈長方形`, C);

    // 上半部：長方形示意（等比例）
    const boxW = mode === 'wall' ? L - 2 : half - 1;
    const s = Math.min(380 / boxW, 130 / (half - 1));
    const rw = wid * s, rh = x * s;
    const left = W / 2 - rw / 2, top = 70;
    if (mode === 'wall') {
      ctx.save();
      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.fillRect(40, top - 12, W - 80, 12);
      ctx.restore();
      textLeft(ctx, '牆（不用圍網）', 44, top - 22, SG_GRAY, f(700, 12));
    }
    ctx.save();
    ctx.fillStyle = 'rgba(94, 234, 212, 0.12)';
    ctx.fillRect(left, top, rw, rh);
    ctx.strokeStyle = C;
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (mode === 'wall') {
      ctx.moveTo(left, top); ctx.lineTo(left, top + rh); ctx.lineTo(left + rw, top + rh); ctx.lineTo(left + rw, top);
    } else {
      ctx.rect(left, top, rw, rh);
    }
    ctx.stroke();
    ctx.restore();
    sgTag(ctx, IT('x', SG_YEL), left - 6, top + rh / 2, SG_YEL, { left: true, dy: 0, size: 15 });
    const wItem = mode === 'wall' ? exprSeq(`${L} - 2x`, SG_YEL) : exprSeq(`${half} - x`, SG_YEL);
    const wm = measure(ctx, wItem, 15).w;
    sgTag(ctx, wItem, left + rw / 2 - wm / 2 - 12, top + rh + 20, SG_YEL, { dy: 0, size: 15 });

    // 下半部：面積對邊長的圖（每個整數 x 描一點）
    const ox = 70, oy = 448, gw = 400, gh = 150;
    const xs = half, ymax = mode === 'wall' ? L * L / 8 : L * L / 16;
    const gx = u => ox + u / xs * gw;
    const gy = v => oy - v / ymax * gh;
    ctx.save();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + gw + 16, oy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, oy - gh - 22); ctx.stroke();
    ctx.restore();
    axisArrow(ctx, ox + gw + 12, oy, 'right', INK);
    axisArrow(ctx, ox, oy - gh - 18, 'up', INK);
    textLeft(ctx, 'x（公尺）', ox + gw - 40, oy + 16, INK, f(700, 12));
    textLeft(ctx, 'y（平方公尺）', ox + 8, oy - gh - 22, INK, f(700, 12));
    textCenter(ctx, 'O', ox - 10, oy + 10, INK, fi(700, 12));
    ctx.save();
    ctx.strokeStyle = 'rgba(94, 234, 212, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let u = 0; u <= xs + 1e-9; u += xs / 120) {
      const v = mode === 'wall' ? u * (L - 2 * u) : u * (half - u);
      if (u === 0) ctx.moveTo(gx(u), gy(v)); else ctx.lineTo(gx(u), gy(v));
    }
    ctx.stroke();
    ctx.restore();
    for (let u = 1; u <= xMax; u++) {
      const v = mode === 'wall' ? u * (L - 2 * u) : u * (half - u);
      drawDot(ctx, gx(u), gy(v), u === x ? SG_YEL : 'rgba(203,213,225,0.7)', u === x ? 6.5 : 3.2);
    }
    sgTag(ctx, sgPtItem(x, area, SG_YEL), gx(x), gy(area), SG_YEL, { size: 14 });

    if (mode === 'wall') {
      out.innerHTML = wbrEq(`y = x(${L} - 2x) = -2x^2 + ${L}x`) + `；\\(x = ${x}\\) 時 \\(y = ${area}\\)`;
      fb.innerHTML = wrapFeedback(`兩側各 \\(x\\) 公尺，前面剩 \\((${L} - 2x)\\) 公尺。面積 ${wbrEq(`y = x(${L} - 2x) = -2x^2 + ${L}x`)}，化簡後 \\(x\\) 的最高次數是二次，所以 \\(y\\) 是 \\(x\\) 的<strong>二次函數</strong>。描出來的點連成一條開口向下的曲線。`);
    } else {
      out.innerHTML = wbrEq(`y = x(${half} - x) = -x^2 + ${half}x`) + `；\\(x = ${x}\\) 時 \\(y = ${area}\\)`;
      fb.innerHTML = wrapFeedback(`周長 \\(${L}\\)，長加寬是 \\(${half}\\)，寬是 \\((${half} - x)\\)。面積 ${wbrEq(`y = x(${half} - x) = -x^2 + ${half}x`)}，是 \\(x\\) 的<strong>二次函數</strong>。注意長加寬是周長的一半，不是整個周長。`);
    }
    typeset([out, fb]);
  }

  [sL, sx].forEach(sl => sl.addEventListener('input', draw));
  bindPickGroup(g, 'data-fc-mode', v => { mode = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 3：y = ax² 的圖形——a 的正負決定開口方向；對稱軸是 y 軸
   ========================================================================== */
function initAx2Canvas() {
  const cv = sgEl('canvas-ax2');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sa = sgEl('ax-a'), sx = sgEl('ax-x');
  const va = sgEl('ax-va'), vx = sgEl('ax-vx');
  const fold = sgEl('ax-fold');
  const out = sgEl('ax-formula');
  const fb = sgEl('ax-feedback');
  const C = SG_TONE[2];
  let showFold = false;

  function draw() {
    const a = sgHalf(sa), x = sgIv(sx);
    va.innerHTML = `\\(${qTex(a)}\\)`;
    vx.textContent = sgMn(x);
    fold.textContent = showFold ? '收起對摺' : '沿 x 軸對摺';
    fold.classList.toggle('active', showFold);
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, 'y = ax² 的圖形：a 的正負決定開口方向', C);
    const P = sgPlane(ctx);
    if (a[0] === 0) { sgZeroWarn(ctx, P, out, fb); typeset([va, out, fb]); return; }

    sgVLine(ctx, P, 0, SG_YEL);
    if (showFold) sgCurve(ctx, P, u => -qVal(a) * u * u, SG_PINK, 2.5, [8, 6]);
    sgCurve(ctx, P, u => qVal(a) * u * u, C, 3.2);
    const y = qMul(a, x * x);
    const up = a[0] > 0;
    if (x !== 0 && sgIn(P, x, y)) {
      dashLine(ctx, P.px(-x), P.py(qVal(y)), P.px(x), P.py(qVal(y)), SG_YEL, [4, 4]);
      drawDot(ctx, P.px(x), P.py(qVal(y)), SG_ORANGE, 6.5);
      drawDot(ctx, P.px(-x), P.py(qVal(y)), SG_ORANGE, 6.5);
      sgTag(ctx, SEQ([T('P', SG_ORANGE), sgPtItem(x, y, SG_ORANGE)], SG_ORANGE, 2), P.px(x), P.py(qVal(y)), SG_ORANGE, { left: x < 0, dy: up ? 16 : -16 });
      sgTag(ctx, SEQ([T("P'", SG_ORANGE), sgPtItem(-x, y, SG_ORANGE)], SG_ORANGE, 2), P.px(-x), P.py(qVal(y)), SG_ORANGE, { left: x > 0, dy: up ? 16 : -16 });
    }
    drawDot(ctx, P.px(0), P.py(0), SG_YEL, 6.5);
    sgTextTag(ctx, up ? '最低點' : '最高點', P.px(0), P.py(0), SG_YEL, { dy: up ? 22 : -22 });

    sgPanel(ctx, sgVItems(a, 0, 0, SG_CREAM),
      [up ? 'a > 0：開口向上，最低點 (0, 0)' : 'a < 0：開口向下，最高點 (0, 0)',
       showFold ? '粉紅虛線是對摺後的 y = −ax²' : '對稱軸是 y 軸（x = 0）'], up ? SG_OK : SG_PINK);

    let s = `\\(${sgVTex(a, 0, 0)}\\)`;
    if (x !== 0) s += `；\\(P(${x}, ${qTex(y)})\\)、\\(P'(${-x}, ${qTex(y)})\\)`;
    if (showFold) s += `；對摺後 \\(${sgVTex(qMul(a, -1), 0, 0)}\\)`;
    out.innerHTML = s;
    const yNote = x !== 0
      ? `\\(x = ${x}\\) 與 \\(x = ${-x}\\) 互為相反數，代入都得 \\(y = ${qTex(y)}\\)：兩點對稱於 \\(y\\) 軸，\\(y\\) 坐標相同。`
      : '把 \\(x\\) 調離 \\(0\\)，看看 \\(P\\) 與 \\(P\'\\) 的位置。';
    fb.innerHTML = wrapFeedback((up
      ? '\\(a \\gt 0\\)：\\(x^2 \\ge 0\\)，乘上正數後 \\(y \\ge 0\\)，圖形開口向上、原點是最低點。'
      : '\\(a \\lt 0\\)：\\(x^2 \\ge 0\\)，乘上負數後 \\(y \\le 0\\)，圖形開口向下、原點是最高點。') + '<br>' + yNote
      + (showFold ? `<br>沿 \\(x\\) 軸對摺：每個點 \\((x, y)\\) 變成 \\((x, -y)\\)，所以 \\(y = ax^2\\) 與 \\(y = -ax^2\\) 的圖形重合。` : ''));
    typeset([va, out, fb]);
  }

  [sa, sx].forEach(sl => sl.addEventListener('input', draw));
  fold.addEventListener('click', () => { showFold = !showFold; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 4：開口大小——|a| 愈大，開口愈小
   ========================================================================== */
function initWidthCanvas() {
  const cv = sgEl('canvas-width');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const s1 = sgEl('wd-a1'), s2 = sgEl('wd-a2');
  const v1 = sgEl('wd-v1'), v2 = sgEl('wd-v2');
  const out = sgEl('wd-formula');
  const fb = sgEl('wd-feedback');
  const C = SG_TONE[3];

  function chord(P, a, color) {
    // 在 |y| = 4 那一條水平線上量開口寬度
    const lv = a[0] > 0 ? 4 : -4;
    const hw = Math.sqrt(4 / Math.abs(qVal(a)));
    const x1 = P.px(-hw), x2 = P.px(hw), Y = P.py(lv);
    if (hw > 7) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(x1, Y); ctx.lineTo(x2, Y); ctx.stroke();
    [x1, x2].forEach(X => { ctx.beginPath(); ctx.moveTo(X, Y - 7); ctx.lineTo(X, Y + 7); ctx.stroke(); });
    ctx.restore();
  }

  function draw() {
    const a1 = sgHalf(s1), a2 = sgHalf(s2);
    v1.innerHTML = `\\(${qTex(a1)}\\)`;
    v2.innerHTML = `\\(${qTex(a2)}\\)`;
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, '開口大小：比 |a|，不是比 a', C);
    const P = sgPlane(ctx);
    if (a1[0] === 0 || a2[0] === 0) { sgZeroWarn(ctx, P, out, fb); typeset([v1, v2, out, fb]); return; }
    sgHLine(ctx, P, 4, 'rgba(203,213,225,0.35)');
    sgHLine(ctx, P, -4, 'rgba(203,213,225,0.35)');
    sgCurve(ctx, P, u => qVal(a1) * u * u, SG_ORANGE, 3.2);
    sgCurve(ctx, P, u => qVal(a2) * u * u, SG_CYAN, 3.2, qEq(a1, a2) ? [8, 6] : null);
    chord(P, a1, SG_ORANGE);
    chord(P, a2, SG_CYAN);
    textLeft(ctx, '甲', P.px(-6.7), P.py(6.3), SG_ORANGE, f(900, 16));
    textLeft(ctx, '乙', P.px(-6.7), P.py(5.2), SG_CYAN, f(900, 16));

    const m1 = Math.abs(qVal(a1)), m2 = Math.abs(qVal(a2));
    let verdict;
    if (m1 === m2) verdict = qEq(a1, a2) ? '兩個式子一樣，圖形完全重合' : '|a| 相同：開口一樣大，一個向上一個向下';
    else verdict = m1 > m2 ? '|a| 較大的甲，開口較小（較窄）' : '|a| 較大的乙，開口較小（較窄）';
    const items = [SEQ([T('甲 ', SG_ORANGE), T('|a| = ', SG_ORANGE), qIt([Math.abs(a1[0]), a1[1]], SG_ORANGE)], SG_ORANGE, 2),
                   T('   ', INK),
                   SEQ([T('乙 ', SG_CYAN), T('|a| = ', SG_CYAN), qIt([Math.abs(a2[0]), a2[1]], SG_CYAN)], SG_CYAN, 2)];
    sgPanel(ctx, items, [verdict, '橫線是 y = 4 或 y = −4 處量到的開口寬度'], C);

    out.innerHTML = `甲 \\(${sgVTex(a1, 0, 0)}\\)、乙 \\(${sgVTex(a2, 0, 0)}\\)`;
    let note;
    if (m1 === m2) note = qEq(a1, a2) ? '兩條是同一個函數。' : `\\(|a|\\) 都是 \\(${qTex([Math.abs(a1[0]), a1[1]])}\\)，開口一樣大；正負號只決定開口朝上或朝下。`;
    else {
      const big = m1 > m2 ? '甲' : '乙', small = m1 > m2 ? '乙' : '甲';
      note = `\\(|a|\\) 比較：${big}較大，所以${big}的開口較小、${small}的開口較大。`;
      if ((a1[0] < 0) !== (a2[0] < 0)) note += '比的是絕對值：負的係數不代表開口比較小。';
    }
    fb.innerHTML = wrapFeedback(`同樣走到 \\(|y| = 4\\) 的高度，\\(|a|\\) 愈大的拋物線走得愈快，需要的 \\(|x|\\) 愈小，開口就愈窄。<br>${note}`);
    typeset([v1, v2, out, fb]);
  }

  [s1, s2].forEach(sl => sl.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 5：y = ax² + k——由 y = ax² 上下平移 |k| 單位，頂點 (0, k)
   ========================================================================== */
function initVShiftCanvas() {
  const cv = sgEl('canvas-vshift');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sa = sgEl('vs-a'), sk = sgEl('vs-k');
  const va = sgEl('vs-va'), vk = sgEl('vs-vk');
  const out = sgEl('vs-formula');
  const fb = sgEl('vs-feedback');
  const C = SG_TONE[4];

  function draw() {
    const a = sgHalf(sa), k = sgIv(sk);
    va.innerHTML = `\\(${qTex(a)}\\)`;
    vk.textContent = sgMn(k);
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, 'y = ax² + k：整條圖形上下平移', C);
    const P = sgPlane(ctx);
    if (a[0] === 0) { sgZeroWarn(ctx, P, out, fb); typeset([va, out, fb]); return; }
    const up = a[0] > 0;
    sgCurve(ctx, P, u => qVal(a) * u * u, SG_GRAY, 2.2, [7, 6]);
    sgCurve(ctx, P, u => qVal(a) * u * u + k, C, 3.2);
    [-1, 1].forEach(xv => {
      const y0 = qVal(a) * xv * xv;
      if (Math.abs(y0) <= 7 && Math.abs(y0 + k) <= 7 && k !== 0) sgMoveArrow(ctx, P.px(xv), P.py(y0), P.px(xv), P.py(y0 + k), 'rgba(253,224,71,0.55)');
    });
    if (k !== 0) sgMoveArrow(ctx, P.px(0), P.py(0), P.px(0), P.py(k), SG_YEL);
    drawDot(ctx, P.px(0), P.py(0), SG_GRAY, 5);
    drawDot(ctx, P.px(0), P.py(k), SG_ORANGE, 7);
    sgTag(ctx, sgPtItem(0, k, SG_ORANGE), P.px(0), P.py(k), SG_ORANGE, { dy: up ? 20 : -20 });

    const items = sgVItems(a, 0, k, SG_CREAM);
    const move = k === 0 ? '不平移（k = 0）' : `由 y = ax² ${k > 0 ? '向上' : '向下'}平移 ${Math.abs(k)} 單位`;
    sgPanel(ctx, items, [move, `${up ? '最低點' : '最高點'} (0, ${sgMn(k)})，對稱軸仍是 y 軸`], C);

    out.innerHTML = `\\(${sgVTex(a, 0, k)}\\)；${up ? '最低點' : '最高點'} \\((0, ${k})\\)`;
    fb.innerHTML = wrapFeedback(k === 0
      ? '\\(k = 0\\) 時就是 \\(y = ax^2\\)。把 \\(k\\) 調成正數或負數看看。'
      : `同一個 \\(x\\)，\\(y = ax^2 + ${k < 0 ? `(${k})` : k}\\) 的值都比 \\(y = ax^2\\) ${k > 0 ? '多' : '少'} \\(${Math.abs(k)}\\)，所以每個點都${k > 0 ? '往上' : '往下'}移 \\(${Math.abs(k)}\\) 單位，${up ? '最低點' : '最高點'}由 \\((0, 0)\\) 移到 \\((0, ${k})\\)。開口方向與大小都不變。`);
    typeset([va, out, fb]);
  }

  [sa, sk].forEach(sl => sl.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 6：y = a(x − h)²——由 y = ax² 左右平移，(x + 3)² 是向左
   ========================================================================== */
function initHShiftCanvas() {
  const cv = sgEl('canvas-hshift');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sa = sgEl('hs-a'), sh = sgEl('hs-h');
  const va = sgEl('hs-va'), vh = sgEl('hs-vh');
  const out = sgEl('hs-formula');
  const fb = sgEl('hs-feedback');
  const C = SG_TONE[5];

  function draw() {
    const a = sgHalf(sa), h = sgIv(sh);
    va.innerHTML = `\\(${qTex(a)}\\)`;
    vh.textContent = sgMn(h);
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, 'y = a(x − h)²：整條圖形左右平移', C);
    const P = sgPlane(ctx);
    if (a[0] === 0) { sgZeroWarn(ctx, P, out, fb); typeset([va, out, fb]); return; }
    const up = a[0] > 0;
    sgCurve(ctx, P, u => qVal(a) * u * u, SG_GRAY, 2.2, [7, 6]);
    sgVLine(ctx, P, h, SG_PINK);
    sgCurve(ctx, P, u => qVal(a) * (u - h) * (u - h), C, 3.2);
    if (h !== 0) sgMoveArrow(ctx, P.px(0), P.py(0), P.px(h), P.py(0), SG_YEL);
    drawDot(ctx, P.px(0), P.py(0), SG_GRAY, 5);
    drawDot(ctx, P.px(h), P.py(0), SG_ORANGE, 7);
    sgTag(ctx, sgPtItem(h, 0, SG_ORANGE), P.px(h), P.py(0), SG_ORANGE, { dy: up ? 22 : -22, left: h < 0 });
    sgTag(ctx, exprSeq(`x = ${h}`, SG_PINK), P.px(h), P.py(up ? 6.4 : -6.4), SG_PINK, { dy: 0 });

    let items, line1;
    if (h < 0) {
      items = sgVItems(a, h, 0, SG_CREAM).concat([T('，', SG_CREAM)], exprItems(`x + ${-h} = x - (${h})`, SG_CREAM));
      line1 = `h = ${sgMn(h)}：向左平移 ${-h} 單位`;
    } else if (h > 0) {
      items = sgVItems(a, h, 0, SG_CREAM);
      line1 = `h = ${h}：向右平移 ${h} 單位`;
    } else {
      items = sgVItems(a, 0, 0, SG_CREAM);
      line1 = 'h = 0：不平移';
    }
    sgPanel(ctx, items, [line1, `${up ? '最低點' : '最高點'} (${sgMn(h)}, 0)，對稱軸 x = ${sgMn(h)}`], C);

    out.innerHTML = `\\(${sgVTex(a, h, 0)}\\)；${up ? '最低點' : '最高點'} \\((${h}, 0)\\)、對稱軸 \\(x = ${h}\\)`;
    fb.innerHTML = wrapFeedback(h === 0
      ? '\\(h = 0\\) 時就是 \\(y = ax^2\\)。把 \\(h\\) 調成正數或負數看看。'
      : `要讓括號 \\((x ${h > 0 ? '-' : '+'} ${Math.abs(h)})\\) 等於 \\(0\\)，\\(x\\) 必須是 \\(${h}\\)，所以${up ? '最低點' : '最高點'}跑到 \\((${h}, 0)\\)，整條圖形${h > 0 ? '向右' : '向左'}平移 \\(${Math.abs(h)}\\) 單位。`
        + (h < 0 ? `<br>看到 \\(x + ${-h}\\) 先改寫成 \\(x - (${h})\\)：是\\(-${-h}\\) 那一側，向<strong>左</strong>移，不是向右。` : ''));
    typeset([va, out, fb]);
  }

  [sa, sh].forEach(sl => sl.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 7：y = a(x − h)² + k——拋物線、頂點 (h, k)、兩次平移
   ========================================================================== */
function initVertexCanvas() {
  const cv = sgEl('canvas-vertex');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sa = sgEl('vx-a'), sh = sgEl('vx-h'), sk = sgEl('vx-k');
  const va = sgEl('vx-va'), vh = sgEl('vx-vh'), vk = sgEl('vx-vk');
  const g = sgEl('vx-mode-group');
  const out = sgEl('vx-formula');
  const fb = sgEl('vx-feedback');
  const C = SG_TONE[6];
  let order = 'hk';

  function draw() {
    const a = sgHalf(sa), h = sgIv(sh), k = sgIv(sk);
    va.innerHTML = `\\(${qTex(a)}\\)`;
    vh.textContent = sgMn(h); vk.textContent = sgMn(k);
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, 'y = a(x − h)² + k：頂點 (h, k) 的拋物線', C);
    const P = sgPlane(ctx);
    if (a[0] === 0) { sgZeroWarn(ctx, P, out, fb); typeset([va, out, fb]); return; }
    const up = a[0] > 0;
    const mid = order === 'hk' ? [h, 0] : [0, k];
    sgCurve(ctx, P, u => qVal(a) * u * u, SG_GRAY, 2, [7, 6]);
    sgCurve(ctx, P, u => qVal(a) * (u - mid[0]) * (u - mid[0]) + mid[1], 'rgba(253,224,71,0.6)', 2, [2, 5]);
    sgVLine(ctx, P, h, SG_PINK);
    sgCurve(ctx, P, sgQuadFn(a, h, k), C, 3.4);
    sgMoveArrow(ctx, P.px(0), P.py(0), P.px(mid[0]), P.py(mid[1]), SG_YEL);
    sgMoveArrow(ctx, P.px(mid[0]), P.py(mid[1]), P.px(h), P.py(k), SG_YEL);
    drawDot(ctx, P.px(0), P.py(0), SG_GRAY, 5);
    drawDot(ctx, P.px(h), P.py(k), SG_ORANGE, 7.5);
    sgTag(ctx, SEQ([T('頂點', SG_ORANGE), sgPtItem(h, k, SG_ORANGE)], SG_ORANGE, 4), P.px(h), P.py(k), SG_ORANGE, { dy: up ? 22 : -22 });

    const hTxt = h === 0 ? '' : `${h > 0 ? '向右' : '向左'} ${Math.abs(h)}`;
    const kTxt = k === 0 ? '' : `${k > 0 ? '向上' : '向下'} ${Math.abs(k)}`;
    const steps = (order === 'hk' ? [hTxt, kTxt] : [kTxt, hTxt]).filter(s => s);
    const moveTxt = steps.length ? `由 y = ax²：${steps.join('，再')}` : '頂點就在原點，不必平移';
    sgPanel(ctx, sgVItems(a, h, k, SG_CREAM),
      [moveTxt, `對稱軸 x = ${sgMn(h)}・開口${up ? '向上・頂點是最低點' : '向下・頂點是最高點'}`], C);

    out.innerHTML = `\\(${sgVTex(a, h, k)}\\)；頂點 \\((${h}, ${k})\\)、對稱軸 \\(x = ${h}\\)`;
    fb.innerHTML = wrapFeedback(`拋物線的頂點就是它與對稱軸的交點。\\(y = a(x - h)^2 + k\\) 直接讀出頂點 \\((${h}, ${k})\\)：括號決定左右、後面的常數決定上下。<br>`
      + (order === 'hk' ? '黃色點線是只做了左右平移的中途圖形。' : '黃色點線是只做了上下平移的中途圖形。')
      + '換另一個順序試試：先左右或先上下，最後都落在同一條拋物線上。');
    typeset([va, out, fb]);
  }

  [sa, sh, sk].forEach(sl => sl.addEventListener('input', draw));
  bindPickGroup(g, 'data-vx-order', v => { order = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 8：與 x 軸的交點個數——看開口方向與頂點在 x 軸的哪一側
   ========================================================================== */
function initCrossCanvas() {
  const cv = sgEl('canvas-cross');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sa = sgEl('cr-a'), sh = sgEl('cr-h'), sk = sgEl('cr-k');
  const va = sgEl('cr-va'), vh = sgEl('cr-vh'), vk = sgEl('cr-vk');
  const out = sgEl('cr-formula');
  const fb = sgEl('cr-feedback');
  const C = SG_TONE[7];

  function draw() {
    const a = sgHalf(sa), h = sgIv(sh), k = sgIv(sk);
    va.innerHTML = `\\(${qTex(a)}\\)`;
    vh.textContent = sgMn(h); vk.textContent = sgMn(k);
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, '拋物線和 x 軸交於幾點？', C);
    const P = sgPlane(ctx);
    if (a[0] === 0) { sgZeroWarn(ctx, P, out, fb); typeset([va, out, fb]); return; }
    const up = a[0] > 0;
    ctx.save();
    ctx.strokeStyle = 'rgba(190, 242, 100, 0.5)';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(P.px(P.min), P.py(0)); ctx.lineTo(P.px(P.max), P.py(0)); ctx.stroke();
    ctx.restore();
    sgCurve(ctx, P, sgQuadFn(a, h, k), C, 3.2);
    const r = -k / qVal(a);
    let n;
    if (k === 0) n = 1;
    else n = r > 0 ? 2 : 0;
    if (n === 2) {
      const d = Math.sqrt(r);
      [h - d, h + d].forEach(xv => { if (Math.abs(xv) <= 7) drawDot(ctx, P.px(xv), P.py(0), SG_LIME, 6.5); });
    }
    drawDot(ctx, P.px(h), P.py(k), SG_ORANGE, 7);
    sgTag(ctx, SEQ([T('頂點', SG_ORANGE), sgPtItem(h, k, SG_ORANGE)], SG_ORANGE, 4), P.px(h), P.py(k), SG_ORANGE, { dy: up ? 22 : -22 });

    const side = k > 0 ? 'x 軸上方' : (k < 0 ? 'x 軸下方' : '恰好在 x 軸上');
    const col = n === 2 ? SG_OK : (n === 1 ? SG_YEL : SG_NO);
    sgPanel(ctx, null, [`開口${up ? '向上' : '向下'}，頂點在${side}`, `→ 與 x 軸${n === 2 ? '有兩個交點' : (n === 1 ? '恰有一個交點（頂點）' : '沒有交點')}`], col, { size: 15 });

    out.innerHTML = `\\(${sgVTex(a, h, k)}\\)；與 \\(x\\) 軸 ${n === 2 ? '有兩個交點' : (n === 1 ? '恰有一個交點' : '沒有交點')}`;
    let why;
    if (n === 1) why = '頂點在 \\(x\\) 軸上，其餘的點都在同一側，只碰到一次。';
    else if (n === 2) why = up ? '開口向上、最低點在 \\(x\\) 軸下方：兩側往上延伸，一定穿過 \\(x\\) 軸兩次。' : '開口向下、最高點在 \\(x\\) 軸上方：兩側往下延伸，一定穿過 \\(x\\) 軸兩次。';
    else why = up ? '開口向上、最低點已經在 \\(x\\) 軸上方：整條圖形都在上方，碰不到 \\(x\\) 軸。' : '開口向下、最高點已經在 \\(x\\) 軸下方：整條圖形都在下方，碰不到 \\(x\\) 軸。';
    fb.innerHTML = wrapFeedback(`${why}<br>只看兩件事：\\(a\\) 的正負（開口方向）與 \\(k\\) 的正負（頂點在 \\(x\\) 軸的哪一側）。\\(h\\) 只會左右移動，不影響交點個數。`);
    typeset([va, out, fb]);
  }

  [sa, sh, sk].forEach(sl => sl.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 9：最大值與最小值——頂點的 y 坐標
   ========================================================================== */
function initExtremeCanvas() {
  const cv = sgEl('canvas-extreme');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sa = sgEl('ex-a'), sh = sgEl('ex-h'), sk = sgEl('ex-k'), sx = sgEl('ex-x');
  const va = sgEl('ex-va'), vh = sgEl('ex-vh'), vk = sgEl('ex-vk'), vx = sgEl('ex-vx');
  const out = sgEl('ex-formula');
  const fb = sgEl('ex-feedback');
  const C = SG_TONE[8];

  function draw() {
    const a = sgHalf(sa), h = sgIv(sh), k = sgIv(sk), x = sgIv(sx);
    va.innerHTML = `\\(${qTex(a)}\\)`;
    vh.textContent = sgMn(h); vk.textContent = sgMn(k); vx.textContent = sgMn(x);
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, '移動 x：y 最小（大）會停在哪裡？', C);
    const P = sgPlane(ctx);
    if (a[0] === 0) { sgZeroWarn(ctx, P, out, fb); typeset([va, out, fb]); return; }
    const up = a[0] > 0;
    sgHLine(ctx, P, k, SG_YEL);
    sgCurve(ctx, P, sgQuadFn(a, h, k), C, 3.2);
    const y = sgEval(a, h, k, x);
    drawDot(ctx, P.px(h), P.py(k), SG_ORANGE, 7);
    sgTag(ctx, T(up ? '最小值' : '最大值', SG_ORANGE), P.px(h), P.py(k), SG_ORANGE, { dy: up ? 22 : -22, left: x > h });
    if (sgIn(P, x, y)) {
      ctx.save();
      ctx.strokeStyle = SG_PINK;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(P.px(x), P.py(k)); ctx.lineTo(P.px(x), P.py(qVal(y))); ctx.stroke();
      ctx.restore();
      drawDot(ctx, P.px(x), P.py(qVal(y)), SG_PINK, 6.5);
      sgTag(ctx, SEQ([T('Q', SG_PINK), sgPtItem(x, y, SG_PINK)], SG_PINK, 2), P.px(x), P.py(qVal(y)), SG_PINK, { left: x <= h, dy: up ? -18 : 18 });
    } else {
      textCenter(ctx, 'Q 點超出畫面（看下方數值）', W / 2, 62, SG_PINK, f(700, 12.5));
    }

    // 代入：y = a(x − h)² + k
    const xi = String(x);
    const inner = h === 0 ? xi : `${xi} ${h > 0 ? '-' : '+'} ${Math.abs(h)}`;
    let co = '', slots = [];
    if (a[0] === a[1]) co = ''; else if (a[0] === -a[1]) co = '-';
    else if (a[1] === 1) co = String(a[0]); else { co = '@0'; slots = [qIt(a, SG_CREAM)]; }
    const subStr = `y = ${co}(${inner})^2${sgKTail(k)} = @1`;
    slots[1] = qIt(y, SG_CREAM);
    if (!slots[0]) slots[0] = T('', SG_CREAM);
    sgPanel(ctx, exprItems(subStr, SG_CREAM, slots),
      [up ? `(x − h)² ≥ 0，a > 0 → y ≥ ${sgMn(k)}` : `(x − h)² ≥ 0，a < 0 → y ≤ ${sgMn(k)}`,
       `x = ${sgMn(h)} 時，y 有${up ? '最小值' : '最大值'} ${sgMn(k)}`], up ? SG_OK : SG_PINK);

    out.innerHTML = `\\(x = ${x}\\) 時 \\(y = ${qTex(y)}\\)；\\(x = ${h}\\) 時 \\(y\\) 有${up ? '最小值' : '最大值'} \\(${k}\\)`;
    const diff = qSub(y, k);
    fb.innerHTML = wrapFeedback((x === h
      ? `\\(x = ${h}\\) 時括號是 \\(0\\)，\\(y\\) 剛好等於 \\(${k}\\)：這就是${up ? '最小值' : '最大值'}。`
      : `\\(Q\\) 比水平線 \\(y = ${k}\\) ${up ? '高' : '低'}了 \\(${qTex(up ? diff : qMul(diff, -1))}\\)。不論 \\(x\\) 是多少，\\(a(x - h)^2\\) ${up ? '都不會小於' : '都不會大於'} \\(0\\)，所以 \\(y\\) ${up ? '不會小於' : '不會大於'} \\(${k}\\)。`)
      + `<br>${up ? '開口向上只有最小值，沒有最大值' : '開口向下只有最大值，沒有最小值'}：圖形往兩側無限延伸。`);
    typeset([va, out, fb]);
  }

  [sa, sh, sk, sx].forEach(sl => sl.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 10：已知頂點與另一點，求二次函數
   ========================================================================== */
function initFindCanvas() {
  const cv = sgEl('canvas-find');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sh = sgEl('fd-h'), sk = sgEl('fd-k'), spx = sgEl('fd-px'), spy = sgEl('fd-py');
  const vh = sgEl('fd-vh'), vk = sgEl('fd-vk'), vpx = sgEl('fd-vpx'), vpy = sgEl('fd-vpy');
  const out = sgEl('fd-formula');
  const fb = sgEl('fd-feedback');
  const C = SG_TONE[9];

  function draw() {
    const h = sgIv(sh), k = sgIv(sk), px = sgIv(spx), py = sgIv(spy);
    vh.textContent = sgMn(h); vk.textContent = sgMn(k); vpx.textContent = sgMn(px); vpy.textContent = sgMn(py);
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, `頂點 (${sgMn(h)}, ${sgMn(k)})，通過 (${sgMn(px)}, ${sgMn(py)})：求 a`, C);
    const d = px - h;
    const pxs = String(px);
    const inner = h === 0 ? pxs : `${pxs} ${h > 0 ? '-' : '+'} ${Math.abs(h)}`;
    const rows = [
      { name: '設', hint: '頂點 (h, k) 先代進去', items: exprItems(`y = a${sgCore(h)}${sgKTail(k)}`, SG_CREAM) },
      { name: '代入', hint: '另一點的 x、y', items: exprItems(`${py} = a(${inner})^2${sgKTail(k)}`, SG_CREAM) }
    ];
    const P = { cx: 270, top: 246, unit: 24, min: -4, max: 4, tickFont: f(600, 11), labelEvery: 2 };
    let bad = null;
    if (d === 0) bad = py === k ? '這一點就是頂點本身，資料不夠決定 a' : '這一點在對稱軸上，拋物線只有頂點在對稱軸上';
    else if (py === k) bad = '算出 a = 0，不是二次函數';
    if (bad) {
      if (d === 0 && py !== k) rows.push({ name: '檢查', hint: `x = ${h} 代入`, items: exprItems(`y = a × 0${sgKTail(k)} = ${k} ≠ ${py}`, SG_NO), color: SG_NO });
      if (d !== 0) rows.push({ name: '解', hint: '', items: exprItems(`${py - k} = ${d * d}a，a = 0`, SG_NO), color: SG_NO });
      drawStepRows(ctx, rows, rows.length, { top: 64, gap: 46, color: C, size: 19 });
      const pl = sgPlane(ctx, P);
      drawDot(ctx, pl.px(h), pl.py(k), SG_ORANGE, 7);
      drawDot(ctx, pl.px(px), pl.py(py), SG_PINK, 6.5);
      drawPanel(ctx, 24, 202, W - 48, 34, SG_NO, 0.14);
      textCenter(ctx, `情境不成立：${bad}`, W / 2, 219, SG_NO, f(800, 13.5));
      out.innerHTML = '\\(\\text{（情境不成立）}\\)';
      fb.innerHTML = wrapFeedback(d === 0
        ? (py === k ? `頂點是 \\((${h}, ${k})\\)，另一點也是它，任何 \\(a\\) 都通過，決定不了函數。把另一點的 \\(x\\) 調離 \\(${h}\\)。`
                     : `\\(x = ${h}\\) 代入一定得到 \\(y = ${k}\\)，不可能是 \\(${py}\\)。把另一點的 \\(x\\) 調離 \\(${h}\\)。`)
        : `另一點的 \\(y\\) 坐標也是 \\(${k}\\)，算出 \\(a = 0\\)，圖形是水平線 \\(y = ${k}\\)，不是拋物線。把另一點的 \\(y\\) 調離 \\(${k}\\)。`);
      typeset([out, fb]);
      return;
    }
    const a = qOf(py - k, d * d);
    rows.push({ name: '解出 a', hint: '移項、除以平方', items: exprItems(`${py - k} = ${d * d}a，a = @0`, SG_CREAM, [qIt(a, SG_YEL)]) });
    rows.push({ name: '函數', hint: '', items: sgVItems(a, h, k, SG_OK), color: SG_OK });
    drawStepRows(ctx, rows, rows.length, { top: 64, gap: 44, color: C, size: 19 });
    const pl = sgPlane(ctx, P);
    sgCurve(ctx, pl, sgQuadFn(a, h, k), C, 3);
    drawDot(ctx, pl.px(h), pl.py(k), SG_ORANGE, 7);
    drawDot(ctx, pl.px(px), pl.py(py), SG_PINK, 6.5);
    // 對稱點也在圖形上
    const sx = 2 * h - px;
    if (Math.abs(sx) <= 4) drawDot(ctx, pl.px(sx), pl.py(py), 'rgba(244,114,182,0.5)', 5);

    out.innerHTML = `\\(a = ${qTex(a)}\\)，\\(${sgVTex(a, h, k)}\\)`;
    fb.innerHTML = wrapFeedback(`知道頂點就先設 \\(y = a(x - h)^2 + k\\)，只剩 \\(a\\) 一個未知數，再用另一點代入解出 \\(a = ${qTex(a)}\\)。`
      + `<br>淡粉紅點是 \\((${px}, ${py})\\) 對於 \\(x = ${h}\\) 的對稱點 \\((${sx}, ${py})\\)，它也在圖形上。`);
    typeset([out, fb]);
  }

  [sh, sk, spx, spy].forEach(sl => sl.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 11：平移的應用——平移不改變 a；平移時與 y 軸交點怎麼動
   ========================================================================== */
function initMoveCanvas() {
  const cv = sgEl('canvas-move');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sa = sgEl('mv-a'), sh = sgEl('mv-h'), sk = sgEl('mv-k');
  const va = sgEl('mv-va'), vh = sgEl('mv-vh'), vk = sgEl('mv-vk');
  const out = sgEl('mv-formula');
  const fb = sgEl('mv-feedback');
  const C = SG_TONE[10];

  function draw() {
    const a = sgHalf(sa), h = sgIv(sh), k = sgIv(sk);
    va.innerHTML = `\\(${qTex(a)}\\)`;
    vh.textContent = sgMn(h); vk.textContent = sgMn(k);
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, '平移噴漆模板：形狀不變，只有位置改變', C);
    const P = sgPlane(ctx);
    if (a[0] === 0) { sgZeroWarn(ctx, P, out, fb); typeset([va, out, fb]); return; }
    const up = a[0] > 0;
    sgCurve(ctx, P, u => qVal(a) * u * u, SG_GRAY, 2.2, [7, 6]);
    sgCurve(ctx, P, sgQuadFn(a, h, k), C, 3.2);
    drawDot(ctx, P.px(h), P.py(k), SG_ORANGE, 6.5);
    const yi = sgEval(a, h, k, 0);
    if (sgIn(P, 0, yi)) {
      drawDot(ctx, P.px(0), P.py(qVal(yi)), SG_PINK, 7);
      sgTag(ctx, SEQ([T('P', SG_PINK), sgPtItem(0, yi, SG_PINK)], SG_PINK, 2), P.px(0), P.py(qVal(yi)), SG_PINK, { left: h > 0, dy: 0 });
    } else {
      textCenter(ctx, 'P 點超出畫面（看下方數值）', W / 2, 62, SG_PINK, f(700, 12.5));
    }

    const hs = h < 0 ? `(${h})` : String(h);
    let co = '', slots = [];
    if (a[0] === a[1]) co = '1'; else if (a[0] === -a[1]) co = '-1';
    else if (a[1] === 1) co = String(a[0]); else { co = '@0'; slots = [qIt(a, SG_CREAM)]; }
    slots[1] = qIt(yi, SG_CREAM);
    if (!slots[0]) slots[0] = T('', SG_CREAM);
    sgPanel(ctx, exprItems(`P 的 y 坐標 = ${co} × ${hs}^2${sgKTail(k)} = @1`, SG_CREAM, slots),
      ['平移不改變 a：開口方向與大小都和 y = ax² 一樣', `頂點 (${sgMn(h)}, ${sgMn(k)})，P 是與 y 軸的交點`], C);

    out.innerHTML = `\\(${sgVTex(a, h, k)}\\)；與 \\(y\\) 軸交於 \\(P(0, ${qTex(yi)})\\)`;
    const toward = up ? '下' : '上';
    fb.innerHTML = wrapFeedback(`把 \\(x = 0\\) 代入，\\(P\\) 的 \\(y\\) 坐標是 \\(a \\times h^2 + k\\)。拉動 \\(h\\) 讓頂點向 \\(y\\) 軸靠近：\\(h^2\\) 變小，\\(P\\) 往${toward}走；頂點越過 \\(y\\) 軸再走遠，\\(P\\) 又往回走——頂點剛好在 \\(y\\) 軸上（\\(h = 0\\)）時，\\(P\\) 就是頂點。`);
    typeset([va, out, fb]);
  }

  [sa, sh, sk].forEach(sl => sl.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 12：對稱性的應用——比較函數值、水平線的兩個交點
   ========================================================================== */
function initSymCanvas() {
  const cv = sgEl('canvas-sym');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sa = sgEl('sy-a'), sh = sgEl('sy-h'), sk = sgEl('sy-k');
  const s1 = sgEl('sy-x1'), s2 = sgEl('sy-x2'), sc = sgEl('sy-c');
  const va = sgEl('sy-va'), vh = sgEl('sy-vh'), vk = sgEl('sy-vk');
  const v1 = sgEl('sy-v1'), v2 = sgEl('sy-v2'), vc = sgEl('sy-vc');
  const rowX1 = sgEl('sy-row-x1'), rowX2 = sgEl('sy-row-x2'), rowC = sgEl('sy-row-c');
  const g = sgEl('sy-mode-group');
  const out = sgEl('sy-formula');
  const fb = sgEl('sy-feedback');
  const C = SG_TONE[11];
  let mode = 'cmp';

  function draw() {
    const a = sgHalf(sa), h = sgIv(sh), k = sgIv(sk);
    const x1 = sgIv(s1), x2 = sgIv(s2), c = sgIv(sc);
    va.innerHTML = `\\(${qTex(a)}\\)`;
    vh.textContent = sgMn(h); vk.textContent = sgMn(k);
    v1.textContent = sgMn(x1); v2.textContent = sgMn(x2); vc.textContent = sgMn(c);
    rowX1.style.display = mode === 'cmp' ? '' : 'none';
    rowX2.style.display = mode === 'cmp' ? '' : 'none';
    rowC.style.display = mode === 'line' ? '' : 'none';
    const W = cv.width;
    ctx.clearRect(0, 0, W, cv.height);
    drawTitle(ctx, mode === 'cmp' ? '不必代入：看離對稱軸多遠' : '水平線的兩個交點對稱於對稱軸', C);
    const P = sgPlane(ctx);
    if (a[0] === 0) { sgZeroWarn(ctx, P, out, fb); typeset([va, out, fb]); return; }
    const up = a[0] > 0;
    sgVLine(ctx, P, h, SG_PINK);
    sgCurve(ctx, P, sgQuadFn(a, h, k), C, 3.2);
    drawDot(ctx, P.px(h), P.py(k), SG_ORANGE, 6);

    if (mode === 'cmp') {
      const yA = sgEval(a, h, k, x1), yB = sgEval(a, h, k, x2);
      const dA = Math.abs(x1 - h), dB = Math.abs(x2 - h);
      [[x1, yA, 'A', SG_YEL], [x2, yB, 'B', SG_CYAN]].forEach(([xv, yv, nm, col]) => {
        if (!sgIn(P, xv, yv)) return;
        dashLine(ctx, P.px(h), P.py(qVal(yv)), P.px(xv), P.py(qVal(yv)), col, [4, 4]);
        drawDot(ctx, P.px(xv), P.py(qVal(yv)), col, 6.5);
        sgTextTag(ctx, nm, P.px(xv), P.py(qVal(yv)), col, { left: xv < h, dy: up ? -16 : 16 });
      });
      let rel;
      if (dA === dB) rel = 'A、B 離對稱軸一樣遠 → y 坐標相同';
      else {
        const far = dA > dB ? 'A' : 'B', near = dA > dB ? 'B' : 'A';
        rel = up ? `開口向上：離軸愈遠愈高 → ${far} 比 ${near} 高` : `開口向下：離軸愈遠愈低 → ${far} 比 ${near} 低`;
      }
      sgPanel(ctx, null, [`A 離 x = ${sgMn(h)} 有 ${dA} 格，B 離 x = ${sgMn(h)} 有 ${dB} 格`, rel], C, { size: 15 });
      const sgn = qVal(yA) > qVal(yB) ? '\\gt' : (qVal(yA) < qVal(yB) ? '\\lt' : '=');
      out.innerHTML = `\\(A(${x1}, ${qTex(yA)})\\)、\\(B(${x2}, ${qTex(yB)})\\)：\\(y_A ${sgn} y_B\\)`;
      fb.innerHTML = wrapFeedback(`拋物線對稱於 \\(x = ${h}\\)，函數值只跟「離對稱軸多遠」有關。${up ? '開口向上，最低點在軸上，離軸愈遠 \\(y\\) 愈大。' : '開口向下，最高點在軸上，離軸愈遠 \\(y\\) 愈小。'}<br>代入算出的 \\(y_A = ${qTex(yA)}\\)、\\(y_B = ${qTex(yB)}\\) 也一樣。`);
      typeset([va, out, fb]);
      return;
    }

    sgHLine(ctx, P, c, SG_YEL);
    const r = (c - k) / qVal(a);
    let n = 0;
    if (c === k) n = 1; else if (r > 0) n = 2;
    if (n === 2) {
      const d = Math.sqrt(r);
      const pts = [h - d, h + d];
      if (pts.some(xv => Math.abs(xv) > 7)) textCenter(ctx, '有一個交點在畫面外（照樣對稱於對稱軸）', W / 2, 62, SG_YEL, f(700, 12.5));
      pts.forEach((xv, i) => {
        if (Math.abs(xv) > 7) return;
        drawDot(ctx, P.px(xv), P.py(c), SG_YEL, 6.5);
        sgTextTag(ctx, i ? 'D' : 'C', P.px(xv), P.py(c), SG_YEL, { left: i === 0, dy: up ? 18 : -18 });
      });
      // 兩段等長的記號
      ctx.save();
      ctx.strokeStyle = SG_CREAM;
      ctx.lineWidth = 3;
      pts.forEach(xv => {
        const mx = P.px((xv + h) / 2);
        if (Math.abs(xv) > 7) return;
        ctx.beginPath(); ctx.moveTo(mx, P.py(c) - 7); ctx.lineTo(mx, P.py(c) + 7); ctx.stroke();
      });
      ctx.restore();
    } else if (n === 1) {
      drawDot(ctx, P.px(h), P.py(c), SG_YEL, 6.5);
    }
    const txt2 = n === 2 ? `兩交點 C、D 的中點就在對稱軸 x = ${sgMn(h)} 上` : (n === 1 ? '只碰到頂點：一個交點' : '水平線在拋物線外側：沒有交點');
    sgPanel(ctx, null, [`水平線 y = ${sgMn(c)}`, txt2], n === 0 ? SG_NO : C, { size: 15 });
    out.innerHTML = `\\(${sgVTex(a, h, k)}\\) 與 \\(y = ${c}\\)：` + (n === 2 ? '兩個交點，對稱於 \\(x = ' + h + '\\)' : (n === 1 ? '一個交點（頂點）' : '沒有交點'));
    fb.innerHTML = wrapFeedback(n === 2
      ? `同一條水平線上的兩個交點高度相同，所以它們對稱於 \\(x = ${h}\\)：若交點是 \\((p, ${c})\\) 與 \\((q, ${c})\\)，則 \\(\\frac{p + q}{2} = ${h}\\)。知道一個就能直接寫出另一個。`
      : (n === 1 ? `\\(y = ${c}\\) 剛好通過頂點，只交於一點。` : `${up ? '開口向上，最低點' : '開口向下，最高點'}是 \\((${h}, ${k})\\)，水平線 \\(y = ${c}\\) 在${up ? '它下面' : '它上面'}，碰不到拋物線。`));
    typeset([va, out, fb]);
  }

  [sa, sh, sk, s1, s2, sc].forEach(sl => sl.addEventListener('input', draw));
  bindPickGroup(g, 'data-sy-mode', v => { mode = v; draw(); });
  drawWithFonts(draw);
}
