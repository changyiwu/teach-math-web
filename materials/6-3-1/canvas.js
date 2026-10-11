/* ==========================================================================
   6-3-1（第六冊 3-1）空間中的線、平面與形體 — 互動 Canvas 與隨堂評量
   畫風：冰雪節冰雕工坊・藍白冬季繪本風（小雪、阿磚）。

   共用工具在 ../math-canvas.js（f／fi／textCenter／wrapFeedback／wbrEq／
   typeset／bindPickGroup／drawWithFonts／reduce／hbRoot／dkRich…）。
   ⚠️ 本頁不修改共用檔；本節自己的工具一律用 ic 前綴、色票用 IC_ 前綴。

   立體圖形一律用本頁的小型 3D 引擎畫：世界座標 z 朝上，正交投影，
   yaw 是繞鉛垂軸的轉角、elev 是俯視角。多面體的「看得到的邊」由相鄰面的
   法向量判斷（至少一個相鄰面朝向觀看者就畫實線，否則畫虛線）；圓柱、圓錐
   用取樣的圓畫，後半圈畫虛線。所有數值（長度、面積、體積、角度、平行垂直
   的判定）都由頂點座標或整數公式算出，不寫死。
   每個 draw 只依目前狀態重畫（drawWithFonts 會在字型下載完成時重畫）。
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  dkUsePalette({ tagBg: IC_TAG_BG, rim: IC_TAG_BG });
  initQuizSystem();
  drawWithFonts(initQuizFigs);

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
  initC13Canvas();
  initC14Canvas();
  initC15Canvas();
});

/* ==========================================================================
   0. 本節色票（冰藍、霜白、燈籠琥珀）
   ========================================================================== */
const IC_ICE = '#7dd3fc';
const IC_FROST = '#e0f2fe';
const IC_SKY = '#38bdf8';
const IC_AMBER = '#fbbf24';
const IC_TEAL = '#5eead4';
const IC_VIO = '#c4b5fd';
const IC_PINK = '#f9a8d4';
const IC_LIME = '#bef264';
const IC_OK = '#86efac';
const IC_NO = '#fb7185';
const IC_FAINT = 'rgba(224, 242, 254, 0.42)';
const IC_LINE = 'rgba(224, 242, 254, 0.22)';
const IC_TAG_BG = 'rgba(8, 15, 28, 0.9)';
// 各重點的標題色（對應 style.css 的 #conceptN）
const IC_TONE = ['#7dd3fc', '#67e8f9', '#a5b4fc', '#93c5fd', '#c4b5fd', '#6ee7b7', '#5eead4',
  '#bef264', '#86efac', '#a3e635', '#2dd4bf', '#d8b4fe', '#fcd34d', '#fdba74', '#fde047'];
// 正立方體六個面的顏色
const IC_FACE6 = ['#7dd3fc', '#fbbf24', '#86efac', '#f9a8d4', '#c4b5fd', '#fdba74'];

/* ==========================================================================
   1. 小型 3D 引擎
   ========================================================================== */
function icSub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function icAdd(a, b, s) { const k = s == null ? 1 : s; return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
function icDot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function icCross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function icLen(a) { return Math.hypot(a[0], a[1], a[2]); }
function icUnit(a) { const l = icLen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
function icCentroid(pts) {
  const c = [0, 0, 0];
  pts.forEach(p => { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; });
  return [c[0] / pts.length, c[1] / pts.length, c[2] / pts.length];
}
// 繞「過 P、方向 d」的軸旋轉 ang（弧度），Rodrigues 公式
function icRotAxis(q, P, d, ang) {
  const k = icUnit(d), v = icSub(q, P);
  const c = Math.cos(ang), s = Math.sin(ang);
  const kv = icCross(k, v), kd = icDot(k, v);
  return [
    P[0] + v[0] * c + kv[0] * s + k[0] * kd * (1 - c),
    P[1] + v[1] * c + kv[1] * s + k[1] * kd * (1 - c),
    P[2] + v[2] * c + kv[2] * s + k[2] * kd * (1 - c)
  ];
}

// 正交投影的相機：yaw、elev 為度；k 為每單位幾 px；ctr 為投影到 (cx, cy) 的世界點
function icCam(yaw, elev, k, cx, cy, ctr) {
  const a = yaw * HB_RAD, e = elev * HB_RAD;
  const ca = Math.cos(a), sa = Math.sin(a), ce = Math.cos(e), se = Math.sin(e);
  const c0 = ctr || [0, 0, 0];
  const rot = v => [v[0] * ca - v[1] * sa, v[0] * sa + v[1] * ca, v[2]];
  return {
    k, cx, cy, yaw, elev,
    pt(p) {
      const r = rot([p[0] - c0[0], p[1] - c0[1], p[2] - c0[2]]);
      return { x: cx + r[0] * k, y: cy - (r[2] * ce + r[1] * se) * k, d: -r[1] * ce + r[2] * se };
    },
    // > 0 代表這個法向量朝向觀看者
    facing(n) { const r = rot(n); return -r[1] * ce + r[2] * se; }
  };
}

// 讓一組點放進 box：比例尺取「各個 yaw 下都放得進」的最小值，轉動時大小不跳動
function icCamFit(pts, box, yaw, elev, maxK) {
  const ctr = icCentroid(pts);
  let k = maxK || 1e9;
  const test = [yaw];
  for (let a = 0; a < 360; a += 15) test.push(a);
  let bb = null;
  test.forEach((ya, i) => {
    const cam = icCam(ya, elev, 1, 0, 0, ctr);
    const ps = pts.map(p => cam.pt(p));
    const xs = ps.map(p => p.x), ys = ps.map(p => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    k = Math.min(k, box.w / Math.max(x1 - x0, 1e-6), box.h / Math.max(y1 - y0, 1e-6));
    if (i === 0) bb = { x0, x1, y0, y1 };
  });
  const cx = box.x + box.w / 2 - (bb.x0 + bb.x1) / 2 * k;
  const cy = box.y + box.h / 2 - (bb.y0 + bb.y1) / 2 * k;
  return icCam(yaw, elev, k, cx, cy, ctr);
}

// 多面體：V 頂點、F 面（頂點索引），smooth[i] 為 true 表示那一面屬於曲面（分格線不畫）
function icSolid(V, F, smooth) {
  const c = icCentroid(V);
  const faces = F.map((idx, i) => {
    let n = [0, 0, 0];
    for (let j = 0; j < idx.length; j++) {
      const p = V[idx[j]], q = V[idx[(j + 1) % idx.length]];
      n[0] += (p[1] - q[1]) * (p[2] + q[2]);
      n[1] += (p[2] - q[2]) * (p[0] + q[0]);
      n[2] += (p[0] - q[0]) * (p[1] + q[1]);
    }
    const fc = icCentroid(idx.map(k => V[k]));
    if (icDot(n, icSub(fc, c)) < 0) n = n.map(x => -x);
    return { idx, n: icUnit(n), c: fc, smooth: !!(smooth && smooth[i]) };
  });
  const map = {}, E = [];
  faces.forEach((fa, fi) => fa.idx.forEach((a, j) => {
    const b = fa.idx[(j + 1) % fa.idx.length];
    const key = Math.min(a, b) + '-' + Math.max(a, b);
    if (!map[key]) { map[key] = { a: Math.min(a, b), b: Math.max(a, b), f: [] }; E.push(map[key]); }
    map[key].f.push(fi);
  }));
  return { V, F: faces, E, c };
}

function icPath(ctx, pts) {
  ctx.beginPath();
  pts.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
}

// 畫多面體。o.faceFill(i, vis) 回傳顏色就上色；o.edgeStyle(e) 回傳 {color, width} 就強調那條邊
function icDraw(ctx, cam, S, o) {
  const opt = o || {};
  const P = S.V.map(v => cam.pt(v));
  const vis = S.F.map(fa => cam.facing(fa.n) > 1e-9);
  const order = S.F.map((fa, i) => i).sort((i, j) => cam.pt(S.F[i].c).d - cam.pt(S.F[j].c).d);
  order.forEach(i => {
    const hl = opt.faceFill ? opt.faceFill(i, vis[i]) : null;
    const col = hl || (vis[i] ? (opt.fill || IC_ICE) : null);
    if (!col) return;
    ctx.save();
    ctx.globalAlpha = hl ? (vis[i] ? (opt.hlAlpha || 0.36) : 0.16) : (opt.alpha == null ? 0.1 : opt.alpha);
    ctx.fillStyle = col;
    icPath(ctx, S.F[i].idx.map(k => P[k]));
    ctx.fill();
    ctx.restore();
  });
  const hidden = [], shown = [], hi = [];
  S.E.forEach(e => {
    const v = e.f.some(fi => vis[fi]);
    const sm = e.f.length === 2 && S.F[e.f[0]].smooth && S.F[e.f[1]].smooth;
    if (sm && vis[e.f[0]] === vis[e.f[1]]) return;
    const st = opt.edgeStyle ? opt.edgeStyle(e) : null;
    (st ? hi : v ? shown : hidden).push({ e, v, st });
  });
  const seg = (e, color, w, dash) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(P[e.a].x, P[e.a].y);
    ctx.lineTo(P[e.b].x, P[e.b].y);
    ctx.stroke();
    ctx.restore();
  };
  if (!opt.noHidden) hidden.forEach(h => seg(h.e, opt.hidden || IC_FAINT, 1.5, [5, 5]));
  shown.forEach(h => seg(h.e, opt.line || IC_FROST, opt.width || 2));
  hi.forEach(h => seg(h.e, h.st.color, h.st.width || 4.5, h.v ? null : [8, 5]));
  if (opt.names) icNames(ctx, cam, S.V, opt.names, opt.nameColor || IC_FROST, S.c);
  return { P, vis };
}

// 頂點名：由投影後的中心往外推
function icNames(ctx, cam, V, names, color, ctr) {
  const pc = cam.pt(ctr || icCentroid(V));
  V.forEach((v, i) => {
    if (!names[i]) return;
    const p = cam.pt(v);
    let dx = p.x - pc.x, dy = p.y - pc.y;
    const l = Math.hypot(dx, dy) || 1;
    dx /= l; dy /= l;
    dkRich(ctx, [[names[i], color]], p.x + dx * 15, p.y + dy * 14, 15);
  });
}

function icSeg3(ctx, cam, p, q, color, width, dash) {
  const a = cam.pt(p), b = cam.pt(q);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width || 2;
  ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function icPoly3(ctx, cam, pts, fill, alpha, stroke, width, dash) {
  const ps = pts.map(p => cam.pt(p));
  ctx.save();
  if (fill) {
    ctx.globalAlpha = alpha == null ? 0.18 : alpha;
    ctx.fillStyle = fill;
    icPath(ctx, ps);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width || 1.6;
    if (dash) ctx.setLineDash(dash);
    icPath(ctx, ps);
    ctx.stroke();
  }
  ctx.restore();
}

function icDot3(ctx, cam, p, color, r) {
  const a = cam.pt(p);
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = IC_TAG_BG;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(a.x, a.y, r || 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// 直角記號：頂點 V、兩個方向 u、w（世界座標，會自動化成單位向量）
function icRightMark(ctx, cam, V, u, w, s, color) {
  const a = icAdd(V, icUnit(u), s), b = icAdd(icAdd(V, icUnit(u), s), icUnit(w), s), c = icAdd(V, icUnit(w), s);
  const P = [a, b, c].map(p => cam.pt(p));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(P[0].x, P[0].y);
  ctx.lineTo(P[1].x, P[1].y);
  ctx.lineTo(P[2].x, P[2].y);
  ctx.stroke();
  ctx.restore();
}

/* --------------------------------------------------------------------------
   常用立體
   -------------------------------------------------------------------------- */
const IC_BOX_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// 長方體 ABCD-EFGH：上底 ABCD、下底 EFGH，AE、BF、CG、DH 是高；前面是 ABFE
function icCuboid(l, w, h) {
  const V = [[0, 0, h], [l, 0, h], [l, w, h], [0, w, h], [0, 0, 0], [l, 0, 0], [l, w, 0], [0, w, 0]];
  const F = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  return icSolid(V, F);
}
const IC_BOX_FACE = ['ABCD', 'EFGH', 'ABFE', 'BCGF', 'CDHG', 'DAEH'];

// 正 n 邊形（xy 平面），第一個頂點在 rot 度
function icRegPoly(n, R, rot) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (rot + 360 * i / n) * HB_RAD;
    out.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  return out;
}

// 直角柱：底面 base（xy、依序），高 h；頂點 0..n-1 為下底、n..2n-1 為上底
function icPrism(base, h) {
  const n = base.length;
  const V = base.map(p => [p[0], p[1], 0]).concat(base.map(p => [p[0], p[1], h]));
  const F = [base.map((p, i) => i), base.map((p, i) => n + i)];
  for (let i = 0; i < n; i++) F.push([i, (i + 1) % n, n + (i + 1) % n, n + i]);
  return icSolid(V, F);
}

// 角錐：底面 base（xy），錐頂 apex；頂點 0..n-1 為底、n 為錐頂
function icPyramid(base, apex) {
  const n = base.length;
  const V = base.map(p => [p[0], p[1], 0]).concat([apex]);
  const F = [base.map((p, i) => i)];
  for (let i = 0; i < n; i++) F.push([i, (i + 1) % n, n]);
  return icSolid(V, F);
}

/* --------------------------------------------------------------------------
   圓柱、圓錐（取樣的水平圓）
   -------------------------------------------------------------------------- */
const IC_CN = 96;

function icRing(cam, c, r) {
  const out = [];
  for (let i = 0; i < IC_CN; i++) {
    const t = 2 * Math.PI * i / IC_CN;
    out.push(cam.pt([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t), c[2]]));
  }
  return out;
}

// 由 i0 走到 i1 的那一段弧（front = true 取比圓心靠近觀看者的那一段）
function icArc(ring, i0, i1, front, dc) {
  const n = ring.length;
  const walk = dir => {
    const out = [];
    let i = i0;
    for (let g = 0; g <= n; g++) {
      out.push(ring[i]);
      if (i === i1) break;
      i = (i + dir + n) % n;
    }
    return out;
  };
  const a = walk(1), b = walk(-1);
  const mid = arr => arr[Math.floor(arr.length / 2)].d;
  const aFront = mid(a) > dc;
  return (aFront === front) ? a : b;
}

function icStrokePts(ctx, pts, color, width, dash, closed) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  pts.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  if (closed) ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function icFillPts(ctx, pts, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  icPath(ctx, pts);
  ctx.fill();
  ctx.restore();
}

// 圓柱：底圓圓心 (cx, cy, z0)、半徑 r、高 h。o.top = false 表示不畫上底（中空時另外畫）
function icCylinder(ctx, cam, r, h, o) {
  const opt = o || {};
  const c = opt.c || [0, 0, 0];
  const bot = icRing(cam, c, r), top = icRing(cam, [c[0], c[1], c[2] + h], r);
  let iL = 0, iR = 0;
  bot.forEach((p, i) => { if (p.x < bot[iL].x) iL = i; if (p.x > bot[iR].x) iR = i; });
  const dcB = cam.pt(c).d, dcT = cam.pt([c[0], c[1], c[2] + h]).d;
  const bf = icArc(bot, iL, iR, true, dcB), bb = icArc(bot, iL, iR, false, dcB);
  const tb = icArc(top, iR, iL, false, dcT);
  const color = opt.color || IC_ICE, line = opt.line || IC_FROST;
  icFillPts(ctx, bf.concat(tb), color, opt.alpha == null ? 0.13 : opt.alpha);
  if (opt.top !== false) icFillPts(ctx, top, color, 0.16);
  if (!opt.noHidden) icStrokePts(ctx, bb, IC_FAINT, 1.5, [5, 5]);
  icStrokePts(ctx, bf, line, opt.width || 2);
  if (opt.top !== false) icStrokePts(ctx, top, line, opt.width || 2, null, true);
  icStrokePts(ctx, [bot[iL], top[iL]], line, opt.width || 2);
  icStrokePts(ctx, [bot[iR], top[iR]], line, opt.width || 2);
  return { bot, top, iL, iR };
}

// 圓錐：底圓圓心 c、半徑 r、高 h
function icCone(ctx, cam, r, h, o) {
  const opt = o || {};
  const c = opt.c || [0, 0, 0];
  const bot = icRing(cam, c, r);
  const A = cam.pt([c[0], c[1], c[2] + h]);
  let iL = 0, iR = 0;
  const ang = p => Math.atan2(p.x - A.x, p.y - A.y);
  bot.forEach((p, i) => { if (ang(p) > ang(bot[iL])) iL = i; if (ang(p) < ang(bot[iR])) iR = i; });
  const dc = cam.pt(c).d;
  const bf = icArc(bot, iL, iR, true, dc), bb = icArc(bot, iL, iR, false, dc);
  const color = opt.color || IC_ICE, line = opt.line || IC_FROST;
  icFillPts(ctx, [A].concat(bf), color, opt.alpha == null ? 0.14 : opt.alpha);
  if (!opt.noHidden) icStrokePts(ctx, bb, IC_FAINT, 1.5, [5, 5]);
  icStrokePts(ctx, bf, line, opt.width || 2);
  icStrokePts(ctx, [bot[iL], A, bot[iR]], line, opt.width || 2);
  return { bot, A, iL, iR };
}

/* --------------------------------------------------------------------------
   文字小工具
   -------------------------------------------------------------------------- */
function icTitle(ctx, text, color) {
  hbFitLine(ctx, text, 24, color, 17);
}

function icSet(el, v) {
  if (el) el.textContent = v;
}

// 一行「名稱 = 算式」：名稱用 dkRich（[AB] 畫上橫線），算式用 parseExpr（@0 換成 slots）
function icRow(ctx, label, expr, slots, cx, y, size, c1, c2) {
  const toks = dkTok(label, c1);
  const items = expr ? parseExpr(expr, c2 || c1, slots || []) : [];
  let s = size;
  const widths = () => {
    ctx.save();
    const a = toks.reduce((w, t) => w + dkTokW(ctx, t, s), 0);
    ctx.restore();
    return [a, items.length ? exprWidth(ctx, items, s, 1) : 0];
  };
  let w = widths();
  const maxW = ctx.canvas.width - 24;
  while (w[0] + w[1] + 6 > maxW && s > 11) { s -= 0.5; w = widths(); }
  let x = cx - (w[0] + w[1] + (items.length ? 6 : 0)) / 2;
  ctx.save();
  toks.forEach(t => { x += dkTokD(ctx, t, x, y, s); });
  ctx.restore();
  if (items.length) {
    x += 6;
    items.forEach(it => { x += drawIt(ctx, it, x, y, s, c2 || c1) + 1; });
  }
}

// 根號元件：k√m（m = 1 時只有 k）
function icRootIt(n, color) {
  const r = hbRoot(n);
  if (r.exact) return T(String(r.k), color);
  if (r.k === 1) return RT(T(String(r.r), color), color);
  return SEQ([T(String(r.k), color), RT(T(String(r.r), color), color)], color, 1);
}

// 有理數係數乘 π 的 LaTeX：q = [n, d]
function icPiTex(n, d) {
  const r = reduce(n, d || 1);
  if (r[0] === 0) return '0';
  if (r[1] === 1) return (r[0] === 1 ? '' : String(r[0])) + '\\pi';
  return `\\frac{${r[0]}}{${r[1]}}\\pi`;
}

// 有理數係數乘 π 的 canvas 元件
function icPiIt(n, d, color) {
  const r = reduce(n, d || 1);
  if (r[1] === 1) return T((r[0] === 1 ? '' : String(r[0])) + 'π', color);
  return SEQ([FR(String(r[0]), String(r[1]), color), T('π', color)], color, 1);
}

// 有理數的 canvas 元件
function icQIt(n, d, color) {
  const r = reduce(n, d || 1);
  if (r[1] === 1) return T(String(r[0]), color);
  return FR(String(r[0]), String(r[1]), color);
}

function icQTex(n, d) {
  const r = reduce(n, d || 1);
  if (r[1] === 1) return String(r[0]);
  return `\\frac{${r[0]}}{${r[1]}}`;
}

// 隱藏／顯示一組控制項（模式切換時用）
function icShow(id, on) {
  const el = hbEl(id);
  if (el) el.style.display = on ? '' : 'none';
}

/* ==========================================================================
   隨堂評量
   ========================================================================== */
function initQuizSystem() {
  const quizCards = document.querySelectorAll('.quiz-card');

  // 第六冊 3-1 的 30 題正解
  // 正解字母分布：A 8 題、B 8 題、C 7 題、D 7 題（開發約束 36）
  const answers = {
    '3-1-1': 'C',    // 正四角錐：錐頂與底面中心的連線垂直底面
    '3-1-2': 'B',    // AE 垂直平面 EFGH
    '3-1-3': 'C',    // 旗桿垂直地面：地面上過 P 的三條都垂直
    '3-1-4': 'C',    // L ⊥ S，M 在 S 上但不過 P：歪斜
    '3-1-5': 'B',    // AD 平行平面 BCGF
    '3-1-6': 'D',    // BF 同時垂直 FG 與平面 ABCD：FG // 平面 ABCD
    '3-1-7': 'C',    // 正四角錐 O-ABCD：BC 與 OD 歪斜
    '3-1-8': 'B',    // 正四面體：每條邊恰與一條邊歪斜
    '3-1-9': 'C',    // 36 條邊 → 十二角柱，頂點 24
    '3-1-10': 'A',   // 頂點 + 面 = 3n + 2 = 47 → n = 15，邊 45
    '3-1-11': 'D',   // 展開圖：甲與己相對
    '3-1-12': 'B',   // 展開圖上共用一邊的兩面摺好後垂直
    '3-1-13': 'D',   // 7、24、25 直角三角柱，高 5：表面積 448
    '3-1-14': 'A',   // 梯形底（4、10、高 6），柱高 8：體積 336
    '3-1-15': 'A',   // 12 × 4 × 3 長方體對角線 13
    '3-1-16': 'C',   // 16 × 12 × 24，I 到 F：26
    '3-1-17': 'B',   // 半徑 7：側面長 14π
    '3-1-18': 'A',   // 側面是邊長 10π 的正方形：高 : 半徑 = 2π : 1
    '3-1-19': 'D',   // r = 8、h = 5：表面積 208π
    '3-1-20': 'A',   // 底面積 16π、高 12，3 : 1 切開，大段側面積 72π
    '3-1-21': 'D',   // 外半徑 9、內半徑 7、長 10 的管：320π
    '3-1-22': 'C',   // R = 10、H = 3 疊 r = 4、h = 6：表面積 308π
    '3-1-23': 'B',   // 30 條邊 → 十五角錐，面 16
    '3-1-24': 'A',   // 正三角錐：側面木片底邊要等於 4，且圍得起來
    '3-1-25': 'B',   // 正四角錐底邊 12、斜高 7：表面積 312
    '3-1-26': 'D',   // 正四角錐底邊 10、錐高 12：斜高 13，表面積 360
    '3-1-27': 'B',   // r = 7、扇形半徑 20：圓心角 126°
    '3-1-28': 'A',   // 圓心角 260°、r = 13：扇形半徑 18
    '3-1-29': 'D',   // r = 9、扇形半徑 20：表面積 261π
    '3-1-30': 'A'    // 扇形面積 : 底圓面積 = 17 : 4
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
   評量附圖
   ========================================================================== */
const IC_QUIZ_FIGS = {
  // 長方體 ABCD-EFGH
  cube(ctx, W, H) {
    const S = icCuboid(4, 2.6, 2.4);
    const cam = icCamFit(S.V, { x: 40, y: 22, w: W - 80, h: H - 44 }, -24, 24);
    icDraw(ctx, cam, S, { names: IC_BOX_NAMES, alpha: 0.08 });
  },
  // 正四角錐 O-ABCD
  pyr(ctx, W, H) {
    const base = [[-1.6, -1.6], [1.6, -1.6], [1.6, 1.6], [-1.6, 1.6]];
    const S = icPyramid(base, [0, 0, 2.8]);
    const cam = icCamFit(S.V, { x: 50, y: 32, w: W - 100, h: H - 56 }, -22, 22);
    icDraw(ctx, cam, S, { names: ['A', 'B', 'C', 'D', 'O'], alpha: 0.08 });
  },
  // 正立方體展開圖（甲～己）
  net(ctx, W, H) {
    const cells = [[0, 0, '甲'], [0, 1, '乙'], [1, 1, '丙'], [2, 1, '丁'], [3, 1, '戊'], [1, 2, '己']];
    const s = Math.min((W - 40) / 4, (H - 30) / 3);
    const x0 = (W - 4 * s) / 2, y0 = (H - 3 * s) / 2;
    cells.forEach((c, i) => {
      const x = x0 + c[0] * s, y = y0 + c[1] * s;
      ctx.save();
      ctx.fillStyle = IC_FACE6[i];
      ctx.globalAlpha = 0.22;
      ctx.fillRect(x, y, s, s);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = IC_FROST;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, s, s);
      ctx.restore();
      textCenter(ctx, c[2], x + s / 2, y + s / 2, IC_FROST, f(800, 20));
    });
  },
  // 長方體客廳：I 為上底面中心，IF、IG
  room(ctx, W, H) {
    const S = icCuboid(4, 3, 6);
    const cam = icCamFit(S.V, { x: 40, y: 34, w: W - 80, h: H - 54 }, -24, 30);
    icDraw(ctx, cam, S, { names: IC_BOX_NAMES, alpha: 0.06 });
    const I = [2, 1.5, 6];
    icSeg3(ctx, cam, S.V[0], S.V[2], IC_FAINT, 1.4, [4, 4]);
    icSeg3(ctx, cam, S.V[1], S.V[3], IC_FAINT, 1.4, [4, 4]);
    icSeg3(ctx, cam, I, S.V[5], IC_AMBER, 2.6);
    icSeg3(ctx, cam, I, S.V[6], IC_AMBER, 2.6);
    icDot3(ctx, cam, I, IC_AMBER, 4);
    const p = cam.pt(I);
    dkRich(ctx, [['I', IC_AMBER]], p.x, p.y - 14, 15);
  }
};

function initQuizFigs() {
  document.querySelectorAll('canvas.quiz-fig[data-fig]').forEach(cv => {
    const fn = IC_QUIZ_FIGS[cv.getAttribute('data-fig')];
    if (!fn) return;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    fn(ctx, cv.width, cv.height);
  });
}

/* ==========================================================================
   重點 1：用長方體檢驗垂直——平面與平面、直線與平面
   長方體靠在 T（或 L）上：夾角 90° 才會緊密貼合，否則一定留下空隙。
   ========================================================================== */
function initC1Canvas() {
  const cv = hbEl('canvas-c1');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c1-formula'), fb = hbEl('c1-feedback');
  const sA = hbEl('c1-ang'), sY = hbEl('c1-yaw');
  let mode = 'plane';

  function draw() {
    const th = hbIv(sA), yaw = hbIv(sY);
    icSet(hbEl('c1-vang'), th);
    icSet(hbEl('c1-vyaw'), yaw);
    ctx.clearRect(0, 0, W, cv.height);
    const plane = mode === 'plane';
    icTitle(ctx, plane ? '用長方體檢驗：平面 T 和地面 S 垂直嗎？' : '用長方體檢驗：直線 L 和地面 S 垂直嗎？', IC_TONE[0]);

    const t = th * HB_RAD, u = [Math.cos(t), 0, Math.sin(t)];
    const bw = 2, bd = 2.4, bh = 2.6;
    const x0 = th < 90 ? bh * Math.cos(t) / Math.sin(t) : 0;
    const y0 = plane ? -bd / 2 : 0;
    const cam = icCam(yaw, 22, 44, W / 2 - 6, 262, [0.7, 0, 1.3]);

    // 地面 S
    icPoly3(ctx, cam, [[-3.4, -2.6, 0], [4.6, -2.6, 0], [4.6, 2.6, 0], [-3.4, 2.6, 0]], IC_SKY, 0.1, IC_LINE, 1.6);
    const sl = cam.pt([4.3, -2.3, 0]);
    dkRich(ctx, [['S', IC_SKY]], sl.x, sl.y, 17);

    // 平面 T 或直線 L
    if (plane) {
      const T0 = [0, -2.6, 0], T1 = [0, 2.6, 0];
      icPoly3(ctx, cam, [T0, T1, icAdd(T1, u, 5), icAdd(T0, u, 5)], IC_VIO, 0.16, IC_VIO, 1.8);
      const tl = cam.pt(icAdd([0, -2.2, 0], u, 4.6));
      dkRich(ctx, [['T', IC_VIO]], tl.x - 14, tl.y, 17);
    }

    // 長方體（靠在 T 上）
    const V = [[x0, y0, 0], [x0 + bw, y0, 0], [x0 + bw, y0 + bd, 0], [x0, y0 + bd, 0]];
    const box = icSolid(V.concat(V.map(p => [p[0], p[1], bh])),
      [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]);
    icDraw(ctx, cam, box, {
      fill: IC_AMBER, alpha: 0.2, line: IC_AMBER,
      edgeStyle: e => (!plane && e.a === 0 && e.b === 4) ? { color: IC_AMBER, width: 4 } : null
    });

    if (!plane) {
      icSeg3(ctx, cam, [0, 0, 0], icAdd([0, 0, 0], u, 5), IC_VIO, 4);
      icDot3(ctx, cam, [0, 0, 0], IC_VIO, 5);
      const ll = cam.pt(icAdd([0, 0, 0], u, 5.2));
      dkRich(ctx, [['L', IC_VIO]], ll.x, ll.y - 6, 17);
    }

    // 空隙或直角
    const yf = y0;
    let gap = null;
    if (th > 90) gap = [[0, yf, 0], [0, yf, bh], [bh * Math.cos(t) / Math.sin(t), yf, bh]];
    else if (th < 90) gap = [[0, yf, 0], [x0, yf, 0], [x0, yf, bh]];
    if (gap) {
      icPoly3(ctx, cam, gap, IC_NO, 0.55, IC_NO, 1.6);
      const gc = cam.pt(icCentroid(gap));
      dkTag(ctx, '空隙', gc.x + (th > 90 ? -26 : 0), gc.y + (th > 90 ? -20 : 26), IC_NO, 14);
    } else {
      icRightMark(ctx, cam, [0, yf, 0], [1, 0, 0], [0, 0, 1], 0.45, IC_OK);
    }

    const ok = th === 90;
    const thing = plane ? '平面 T' : '直線 L';
    hbFitLine(ctx, `${thing}與地面 S 的夾角：${th}°`, 402, IC_FROST, 16);
    if (ok) hbFitLine(ctx, plane ? '長方體的側面和 T 緊密貼合 → S ⊥ T' : '長方體的高和 L 緊密貼合 → L ⊥ S', 438, IC_OK, 16);
    else hbFitLine(ctx, plane ? '貼不緊、留下空隙 → S 與 T 不垂直' : '高和 L 貼不緊、留下空隙 → L 與 S 不垂直', 438, IC_NO, 16);

    const sym = plane ? 'S \\perp T' : 'L \\perp S';
    out.innerHTML = ok ? `夾角 \\(${th}^\\circ\\)，緊密貼合：\\(${sym}\\)` : `夾角 \\(${th}^\\circ\\)，有空隙：不垂直`;
    let txt;
    if (ok) {
      txt = plane
        ? '長方體<strong>相鄰的兩個面互相垂直</strong>：底面平放在 \\(S\\) 上，側面又能和 \\(T\\) 整面貼緊，就表示 \\(S\\) 與 \\(T\\) 互相垂直。'
        : '長方體的<strong>高與底面互相垂直</strong>：底面平放在 \\(S\\) 上，高又能和 \\(L\\) 整條貼緊，就表示 \\(L \\perp S\\)。';
    } else if (th < 90) {
      txt = `${thing}往長方體這一側傾斜，長方體的上緣先頂到它，下方留出空隙——夾角 \\(${th}^\\circ\\) 比直角小，不垂直。`;
    } else {
      txt = `${thing}往外傾斜，長方體只有下緣碰得到它，上方留出空隙——夾角 \\(${th}^\\circ\\) 比直角大，不垂直。`;
    }
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  [sA, sY].forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c1-mode-group'), 'data-c1-mode', m => { mode = m; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 2：直線垂直平面 → 平面上「通過交點」的每一條直線都和它垂直
   L 由 P 點立起（可傾斜 τ），平面上的 M 方向角 φ。兩方向的夾角由內積算出。
   ========================================================================== */
function initC2Canvas() {
  const cv = hbEl('canvas-c2');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c2-formula'), fb = hbEl('c2-feedback');
  const sP = hbEl('c2-phi'), sT = hbEl('c2-tilt');
  let through = true;

  function draw() {
    const phi = hbIv(sP), tau = hbIv(sT);
    icSet(hbEl('c2-vphi'), phi);
    icSet(hbEl('c2-vtilt'), tau);
    ctx.clearRect(0, 0, W, cv.height);
    icTitle(ctx, '平面 S 上的直線 M 和直線 L 垂直嗎？', IC_TONE[1]);
    const cam = icCam(28, 24, 40, W / 2, 252, [0, 0, 1.2]);
    const P = [0, 0, 0];
    const Ld = [Math.sin(tau * HB_RAD), 0, Math.cos(tau * HB_RAD)];
    const m = [Math.cos(phi * HB_RAD), Math.sin(phi * HB_RAD), 0];
    const nn = [-m[1], m[0], 0];
    const off = through ? [0, 0, 0] : icAdd([0, 0, 0], nn, 1.8);

    icPoly3(ctx, cam, [[-4, -3.4, 0], [4, -3.4, 0], [4, 3.4, 0], [-4, 3.4, 0]], IC_SKY, 0.1, IC_LINE, 1.6);
    const sl = cam.pt([3.6, -3, 0]);
    dkRich(ctx, [['S', IC_SKY]], sl.x, sl.y, 17);

    // 直線 M
    icSeg3(ctx, cam, icAdd(off, m, -3.3), icAdd(off, m, 3.3), IC_TEAL, 3.4);
    const ml = cam.pt(icAdd(off, m, 3.65));
    dkRich(ctx, [['M', IC_TEAL]], ml.x, ml.y, 17);

    const cosv = icDot(Ld, m);
    const ang = Math.acos(Math.max(-1, Math.min(1, cosv))) / HB_RAD;
    const angR = Math.round(ang);
    const perp = Math.abs(cosv) < 1e-9;

    // 長方體繞著 L 轉，讓它的一條邊貼著 M（只在 L ⊥ S 且 M 過 P 時畫）
    if (through && tau === 0) {
      const a = 1.9, b = 1.3, c = 2.4;
      const base = [P, icAdd(P, m, a), icAdd(icAdd(P, m, a), nn, b), icAdd(P, nn, b)];
      const box = icSolid(base.concat(base.map(p => [p[0], p[1], c])),
        [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]);
      icDraw(ctx, cam, box, { fill: IC_AMBER, alpha: 0.16, line: 'rgba(251, 191, 36, 0.75)', width: 1.6 });
    }

    // 直線 L
    icSeg3(ctx, cam, P, icAdd(P, Ld, 4.4), IC_VIO, 4);
    const ll = cam.pt(icAdd(P, Ld, 4.65));
    dkRich(ctx, [['L', IC_VIO]], ll.x, ll.y, 17);
    icDot3(ctx, cam, P, IC_FROST, 5);
    const pl = cam.pt(P);
    dkRich(ctx, [['P', IC_FROST]], pl.x - 16, pl.y + 12, 15);

    if (!through) {
      icSeg3(ctx, cam, P, off, IC_FAINT, 1.6, [5, 4]);
      icDot3(ctx, cam, off, IC_TEAL, 4);
    } else if (perp) {
      icRightMark(ctx, cam, P, m, Ld, 0.5, IC_OK);
    }

    let l1, c1, l2, c2;
    if (!through) {
      l1 = 'M 不通過 P：L 和 M 根本不相交'; c1 = IC_NO;
      l2 = '兩線不相交、也不在同一平面上 → 歪斜，不能說 L ⊥ M'; c2 = IC_FROST;
    } else if (tau === 0) {
      l1 = `L 與 M 的夾角：90°（M 轉到 ${phi}° 也一樣）`; c1 = IC_OK;
      l2 = 'L ⊥ S 時，S 上通過 P 的每一條直線都與 L 垂直'; c2 = IC_FROST;
    } else {
      l1 = `L 與 M 的夾角：約 ${angR}°`; c1 = perp ? IC_OK : IC_AMBER;
      l2 = perp ? '這一條剛好垂直，但把 M 轉個方向就不是了 → L 不垂直 S' : 'L 傾斜了：S 上通過 P 的直線不一定和 L 垂直';
      c2 = IC_FROST;
    }
    hbFitLine(ctx, l1, 402, c1, 16);
    hbFitLine(ctx, l2, 436, c2, 15);

    if (!through) out.innerHTML = '\\(M\\) 不通過 \\(P\\)：\\(L\\) 與 \\(M\\) 不相交';
    else if (perp) out.innerHTML = '\\(L\\) 與 \\(M\\) 的夾角 \\(= 90^\\circ\\)';
    else out.innerHTML = `\\(L\\) 與 \\(M\\) 的夾角 \\(\\approx ${angR}^\\circ\\)`;

    let txt;
    if (!through) txt = '平面 \\(S\\) 和直線 \\(L\\) 只交在 \\(P\\) 點；\\(M\\) 不通過 \\(P\\)，兩條線碰不到，又不在同一平面上，是<strong>歪斜</strong>關係（重點 4）。「垂直」說的是相交的兩直線。';
    else if (tau === 0) txt = '長方體繞著 \\(L\\) 轉，底邊總能貼住 \\(M\\)；長方體通過同一個頂點的邊互相垂直，所以不論 \\(M\\) 轉到哪裡，都有 \\(L \\perp M\\)。電線杆的影子落在地面上、通過杆腳，所以影子與電線杆垂直。';
    else txt = `把 \\(L\\) 傾斜 \\(${tau}^\\circ\\) 後，\\(M\\) 換個方向，夾角就跟著變（現在約 \\(${angR}^\\circ\\)）。只有 \\(L\\) 與 \\(S\\) 垂直時，通過 \\(P\\) 的每一條直線才<strong>全部</strong>與 \\(L\\) 垂直。`;
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  [sP, sT].forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c2-m-group'), 'data-c2-m', v => { through = v === 'on'; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 3：平行——平面與平面、直線與平面
   由長方體的頂點座標判斷：法向量互相平行 → 兩面平行；邊的方向與法向量
   垂直且不在面上 → 線與面平行。
   ========================================================================== */
function icEdgeName(e) {
  return IC_BOX_NAMES[e.a] + IC_BOX_NAMES[e.b];
}

function icRelEdgePlane(S, fi, e) {
  const n = S.F[fi].n, p0 = S.V[S.F[fi].idx[0]];
  const d = icSub(S.V[e.b], S.V[e.a]);
  const onA = Math.abs(icDot(n, icSub(S.V[e.a], p0))) < 1e-9;
  const onB = Math.abs(icDot(n, icSub(S.V[e.b], p0))) < 1e-9;
  if (onA && onB) return 'in';
  if (Math.abs(Math.abs(icDot(n, icUnit(d))) - 1) < 1e-9) return 'perp';
  if (Math.abs(icDot(n, d)) < 1e-9) return 'par';
  return 'cut';
}

function icRelPlanePlane(S, fi, fj) {
  if (fi === fj) return 'same';
  const c = icDot(S.F[fi].n, S.F[fj].n);
  if (Math.abs(Math.abs(c) - 1) < 1e-9) return 'par';
  if (Math.abs(c) < 1e-9) return 'perp';
  return 'cut';
}

function initC3Canvas() {
  const cv = hbEl('canvas-c3');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c3-formula'), fb = hbEl('c3-feedback');
  const sY = hbEl('c3-yaw');
  let ref = 0, kind = 'face';

  function draw() {
    const yaw = hbIv(sY);
    icSet(hbEl('c3-vyaw'), yaw);
    ctx.clearRect(0, 0, W, cv.height);
    const S = icCuboid(3.6, 2.4, 2.2);
    const rname = IC_BOX_FACE[ref];
    icTitle(ctx, kind === 'face' ? `哪些平面和平面 ${rname} 平行？哪些垂直？` : `哪些邊和平面 ${rname} 平行？哪些垂直？`, IC_TONE[2]);
    const cam = icCamFit(S.V, { x: 90, y: 50, w: W - 180, h: 220 }, yaw, 24);

    const par = [], perp = [], inn = [];
    if (kind === 'face') {
      S.F.forEach((fa, j) => {
        const r = icRelPlanePlane(S, ref, j);
        if (r === 'par') par.push(j);
        else if (r === 'perp') perp.push(j);
      });
      icDraw(ctx, cam, S, {
        names: IC_BOX_NAMES,
        faceFill: i => (i === ref ? IC_SKY : par.indexOf(i) >= 0 ? IC_OK : null),
        alpha: 0.06
      });
    } else {
      S.E.forEach(e => {
        const r = icRelEdgePlane(S, ref, e);
        if (r === 'in') inn.push(e);
        else if (r === 'perp') perp.push(e);
        else if (r === 'par') par.push(e);
      });
      icDraw(ctx, cam, S, {
        names: IC_BOX_NAMES,
        faceFill: i => (i === ref ? IC_SKY : null),
        edgeStyle: e => (par.indexOf(e) >= 0 ? { color: IC_OK } : perp.indexOf(e) >= 0 ? { color: IC_AMBER } : inn.indexOf(e) >= 0 ? { color: IC_SKY, width: 3.5 } : null),
        alpha: 0.06
      });
    }

    const list = arr => arr.map(x => (kind === 'face' ? `平面 ${IC_BOX_FACE[x]}` : `[${icEdgeName(x)}]`)).join('、');
    const rows = [];
    if (kind === 'face') {
      rows.push([`平行：${list(par)}`, IC_OK]);
      rows.push([`垂直：${list(perp)}`, IC_AMBER]);
    } else {
      rows.push([`在平面上：${list(inn)}`, IC_SKY]);
      rows.push([`平行：${list(par)}`, IC_OK]);
      rows.push([`垂直：${list(perp)}`, IC_AMBER]);
    }
    rows.forEach((r, i) => dkRich(ctx, [[r[0], r[1]]], W / 2, 300 + i * 32, 15.5));

    // 證據：一條同時垂直於兩者的邊
    const witness = S.E.find(e => icRelEdgePlane(S, ref, e) === 'perp');
    if (kind === 'face') {
      const pj = par[0];
      dkRich(ctx, [[`例：[${icEdgeName(witness)}] 同時垂直於平面 ${rname} 與平面 ${IC_BOX_FACE[pj]}`, IC_FROST]], W / 2, 300 + rows.length * 32 + 12, 14.5);
    } else {
      const pe = par[0];
      const w2 = S.E.find(e => icRelEdgePlane(S, ref, e) === 'perp' && (e.a === pe.a || e.b === pe.a || e.a === pe.b || e.b === pe.b));
      dkRich(ctx, [[`例：[${icEdgeName(w2)}] 同時垂直於 [${icEdgeName(pe)}] 與平面 ${rname}`, IC_FROST]], W / 2, 300 + rows.length * 32 + 12, 14.5);
    }

    const texList = arr => arr.map(x => `\\(\\overline{${icEdgeName(x)}}\\)`).join('、');
    if (kind === 'face') {
      out.innerHTML = `平面 ${IC_BOX_FACE[par[0]]} \\(//\\) 平面 ${rname}`;
      fb.innerHTML = wrapFeedback(`長方體的高與底面垂直：\\(\\overline{${icEdgeName(witness)}}\\) 同時垂直於這兩個平面，所以它們<strong>互相平行</strong>。和平面 ${rname} 相鄰的 ${perp.length} 個面都與它<strong>垂直</strong>。`);
    } else {
      out.innerHTML = `與平面 ${rname} 平行的邊：${texList(par)}`;
      fb.innerHTML = wrapFeedback(`綠色的邊不在平面 ${rname} 上，又和某一條垂直於平面 ${rname} 的邊（例如 \\(\\overline{${icEdgeName(witness)}}\\)）互相垂直，所以與平面 ${rname} <strong>平行</strong>；黃色的邊就是垂直於平面 ${rname} 的高。`);
    }
    typeset([out, fb]);
  }

  sY.addEventListener('input', draw);
  bindPickGroup(hbEl('c3-ref-group'), 'data-c3-ref', v => { ref = parseInt(v, 10); draw(); });
  bindPickGroup(hbEl('c3-kind-group'), 'data-c3-kind', v => { kind = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 4：兩直線的三種關係——相交、平行、歪斜（長方體、正四面體）
   有共同端點 → 相交；方向向量平行 → 平行；都不是 → 歪斜。
   ========================================================================== */
const IC_C4_BOX_E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
const IC_C4_TET_E = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 1]];

function icTetra(s) {
  const R = s / Math.sqrt(3), h = s * Math.sqrt(2 / 3);
  const base = icRegPoly(3, R, -90);
  const V = [[0, 0, h]].concat(base.map(p => [p[0], p[1], 0]));
  return icSolid(V, [[1, 2, 3], [0, 1, 2], [0, 2, 3], [0, 3, 1]]);
}

function initC4Canvas() {
  const cv = hbEl('canvas-c4');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c4-formula'), fb = hbEl('c4-feedback');
  const s1 = hbEl('c4-e1'), s2 = hbEl('c4-e2'), sY = hbEl('c4-yaw');
  let mode = 'box';

  function draw() {
    const box = mode === 'box';
    const EL = box ? IC_C4_BOX_E : IC_C4_TET_E;
    const S = box ? icCuboid(3.6, 2.4, 2.2) : icTetra(3.4);
    const names = box ? IC_BOX_NAMES : ['A', 'B', 'C', 'D'];
    const yaw = hbIv(sY);
    const i1 = Math.min(hbIv(s1), EL.length - 1), i2 = Math.min(hbIv(s2), EL.length - 1);
    const e1 = EL[i1], e2 = EL[i2];
    const nm = e => names[e[0]] + names[e[1]];
    icSet(hbEl('c4-n1'), nm(e1));
    icSet(hbEl('c4-n2'), nm(e2));
    icSet(hbEl('c4-vyaw'), yaw);
    ctx.clearRect(0, 0, W, cv.height);
    icTitle(ctx, `${box ? '長方體' : '正四面體'}：兩條邊是相交、平行，還是歪斜？`, IC_TONE[3]);
    const cam = icCamFit(S.V, { x: 100, y: 48, w: W - 200, h: 250 }, yaw, 22);

    const shared = e1.filter(v => e2.indexOf(v) >= 0);
    const d1 = icSub(S.V[e1[1]], S.V[e1[0]]), d2 = icSub(S.V[e2[1]], S.V[e2[0]]);
    const crossL = icLen(icCross(d1, d2));
    let rel;
    if (i1 === i2) rel = 'same';
    else if (shared.length) rel = 'meet';
    else if (crossL < 1e-9) rel = 'par';
    else rel = 'skew';

    // 先畫出兩邊所在（或試圖找）的平面
    const A1 = S.V[e1[0]], B1 = S.V[e1[1]], A2 = S.V[e2[0]], B2 = S.V[e2[1]];
    if (rel === 'par') {
      const quad = icDot(d1, d2) > 0 ? [A1, B1, B2, A2] : [A1, B1, A2, B2];
      icPoly3(ctx, cam, quad, IC_OK, 0.2, IC_OK, 1.2, [4, 4]);
    } else if (rel === 'meet') {
      const pts = [];
      [e1[0], e1[1], e2[0], e2[1]].forEach(v => { if (pts.indexOf(v) < 0) pts.push(v); });
      icPoly3(ctx, cam, pts.map(v => S.V[v]), IC_AMBER, 0.2, IC_AMBER, 1.2, [4, 4]);
    } else if (rel === 'skew') {
      icPoly3(ctx, cam, [A1, B1, A2], IC_NO, 0.14, IC_NO, 1.2, [4, 4]);
    }

    const ek = e => Math.min(e[0], e[1]) + '-' + Math.max(e[0], e[1]);
    icDraw(ctx, cam, S, {
      names,
      alpha: 0.06,
      edgeStyle: e => {
        const k = e.a + '-' + e.b;
        if (k === ek(e1)) return { color: IC_SKY, width: 5 };
        if (k === ek(e2)) return { color: IC_PINK, width: 5 };
        return null;
      }
    });
    if (rel === 'meet') icDot3(ctx, cam, S.V[shared[0]], IC_AMBER, 6);

    const n1 = `[${nm(e1)}]`, n2 = `[${nm(e2)}]`;
    let l1, c1, l2;
    if (rel === 'same') { l1 = '請選兩條不同的邊'; c1 = IC_FROST; l2 = '把第二條邊的滑桿換到別的位置'; }
    else if (rel === 'meet') { l1 = `${n1} 與 ${n2} 相交於 ${names[shared[0]]} 點`; c1 = IC_AMBER; l2 = '有交點的兩直線一定在同一個平面上（黃色三角形）'; }
    else if (rel === 'par') { l1 = `${n1} // ${n2}：互相平行`; c1 = IC_OK; l2 = '不相交，而且在同一個平面上（綠色長方形）'; }
    else { l1 = `${n1} 與 ${n2} 是歪斜關係`; c1 = IC_NO; l2 = `不相交，也找不到同時包含兩條的平面：${n2} 穿過紅色平面`; }
    dkRich(ctx, [[l1, c1]], W / 2, 330, 18);
    dkRich(ctx, [[l2, IC_FROST]], W / 2, 368, 14.5);
    if (!box && rel !== 'same') dkRich(ctx, [['正四面體裡沒有平行的邊：不相交的兩條一定歪斜', IC_FAINT]], W / 2, 404, 14);

    const t1 = `\\overline{${nm(e1)}}`, t2 = `\\overline{${nm(e2)}}`;
    if (rel === 'same') out.innerHTML = '請選兩條不同的邊';
    else if (rel === 'meet') out.innerHTML = `\\(${t1}\\) 與 \\(${t2}\\) 相交於 \\(${names[shared[0]]}\\) 點`;
    else if (rel === 'par') out.innerHTML = `\\(${t1} // ${t2}\\)`;
    else out.innerHTML = `\\(${t1}\\) 與 \\(${t2}\\) 歪斜`;
    let txt;
    if (rel === 'same') txt = '兩個滑桿選到同一條邊了。';
    else if (rel === 'meet') txt = '有共同的端點，兩條邊相交。';
    else if (rel === 'par') txt = '兩條邊<strong>不相交、且在同一個平面上</strong>，所以互相平行。';
    else txt = '兩條邊<strong>不相交、也不在同一個平面上</strong>，這種關係叫做<strong>歪斜</strong>。只看「不相交」還不夠，要再問：它們在不在同一個平面上？';
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  function setMode(m) {
    mode = m;
    const n = (m === 'box' ? IC_C4_BOX_E : IC_C4_TET_E).length - 1;
    s1.max = n; s2.max = n;
    if (hbIv(s1) > n) s1.value = 0;
    if (hbIv(s2) > n) s2.value = n;
    draw();
  }

  [s1, s2, sY].forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c4-mode-group'), 'data-c4-mode', setMode);
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 5：角柱的組成——頂點 2n、面 n + 2、邊 3n
   ========================================================================== */
const IC_CN_NUM = ['', '', '', '三', '四', '五', '六', '七', '八', '九', '十'];

function initC5Canvas() {
  const cv = hbEl('canvas-c5');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c5-formula'), fb = hbEl('c5-feedback');
  const sN = hbEl('c5-n'), sY = hbEl('c5-yaw');
  let hl = 'v';

  function draw() {
    const n = hbIv(sN), yaw = hbIv(sY);
    icSet(hbEl('c5-vn'), n);
    icSet(hbEl('c5-vyaw'), yaw);
    ctx.clearRect(0, 0, W, cv.height);
    const name = `${IC_CN_NUM[n]}角柱`;
    icTitle(ctx, `正${name}：數一數頂點、面、邊`, IC_TONE[4]);
    const S = icPrism(icRegPoly(n, 2, 90 + 180 / n), 2.6);
    const cam = icCamFit(S.V, { x: 90, y: 46, w: W - 180, h: 236 }, yaw, 24);
    const o = { alpha: 0.07 };
    if (hl === 'f') {
      o.faceFill = i => (i < 2 ? IC_SKY : (i % 2 ? IC_AMBER : IC_PINK));
      o.hlAlpha = 0.3;
    }
    if (hl === 'e') {
      o.edgeStyle = e => (e.b < n ? { color: IC_SKY, width: 4 } : e.a >= n ? { color: IC_VIO, width: 4 } : { color: IC_AMBER, width: 4 });
    }
    icDraw(ctx, cam, S, o);
    if (hl === 'v') S.V.forEach((v, i) => icDot3(ctx, cam, v, i < n ? IC_SKY : IC_VIO, 5.5));

    let r1, r2;
    if (hl === 'v') {
      r1 = [`頂點：上底 ${n} 個 + 下底 ${n} 個`, IC_FROST];
      r2 = [`2n = 2 × ${n} = ${2 * n}（個）`, IC_AMBER];
    } else if (hl === 'f') {
      r1 = [`面：上、下底 2 個 + 側面 ${n} 個（都是長方形）`, IC_FROST];
      r2 = [`n + 2 = ${n} + 2 = ${n + 2}（個）`, IC_AMBER];
    } else {
      r1 = [`邊：上底 ${n} 條 + 下底 ${n} 條 + 側邊 ${n} 條`, IC_FROST];
      r2 = [`3n = 3 × ${n} = ${3 * n}（條）`, IC_AMBER];
    }
    dkRich(ctx, [r1], W / 2, 318, 16);
    dkRich(ctx, [r2], W / 2, 356, 20);
    dkRich(ctx, [[`${name}：頂點 ${2 * n} 個、面 ${n + 2} 個、邊 ${3 * n} 條`, IC_FAINT]], W / 2, 410, 15);

    out.innerHTML = `${name}：頂點 \\(${2 * n}\\)、面 \\(${n + 2}\\)、邊 \\(${3 * n}\\)`;
    let txt;
    if (hl === 'v') txt = `頂點都在上、下兩個底面上，每個底面是 ${n} 邊形，有 ${n} 個頂點，所以 \\(n\\) 角柱有 \\(2n\\) 個頂點。`;
    else if (hl === 'f') txt = `兩個底面，再加上每一條底邊各接一個長方形側面（共 ${n} 個），所以 \\(n\\) 角柱有 \\(n + 2\\) 個面。`;
    else txt = `上底、下底各 ${n} 條邊，再加上連接上下兩個頂點的 ${n} 條側邊，所以 \\(n\\) 角柱有 \\(3n\\) 條邊。`;
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  [sN, sY].forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c5-hl-group'), 'data-c5-hl', v => { hl = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 6：正立方體的展開圖——摺摺看
   展開圖的每一片沿著它和「父片」共用的邊轉 t × 90°（由根片向外建樹）；
   摺到底時，六片的中心若剛好落在六個不同位置，就是正立方體。
   ========================================================================== */
const IC_NETS = [
  [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]],
  [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]],
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]],
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
  [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
  [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1]]
];
const IC_NET_ROOT = [2, 2, 3, 2, 2, 3, 3, 2];

// 由根片建「誰接在誰上面」的樹，回傳每片的 parent 與鉸鏈
function icNetTree(cells, root) {
  const n = cells.length;
  const par = new Array(n).fill(-1), hinge = new Array(n).fill(null), seen = new Array(n).fill(false);
  const q = [root];
  seen[root] = true;
  while (q.length) {
    const p = q.shift();
    for (let c = 0; c < n; c++) {
      if (seen[c]) continue;
      const dx = cells[c][0] - cells[p][0], dy = cells[c][1] - cells[p][1];
      if (Math.abs(dx) + Math.abs(dy) !== 1) continue;
      seen[c] = true;
      par[c] = p;
      let H0, H1;
      if (dx !== 0) {
        const X = Math.max(cells[c][0], cells[p][0]);
        H0 = [X, cells[p][1], 0]; H1 = [X, cells[p][1] + 1, 0];
      } else {
        const Y = Math.max(cells[c][1], cells[p][1]);
        H0 = [cells[p][0], Y, 0]; H1 = [cells[p][0] + 1, Y, 0];
      }
      // 轉的方向：讓這一片往上（z > 0）摺
      const ctr = [cells[c][0] + 0.5, cells[c][1] + 0.5, 0];
      const test = icRotAxis(ctr, H0, icSub(H1, H0), 0.1);
      hinge[c] = { H0, d: icSub(H1, H0), sign: test[2] > 0 ? 1 : -1 };
      q.push(c);
    }
  }
  return { par, hinge };
}

function icNetPoint(tree, c, q, ang) {
  let p = q, k = c;
  while (tree.par[k] >= 0) {
    const h = tree.hinge[k];
    p = icRotAxis(p, h.H0, h.d, h.sign * ang);
    k = tree.par[k];
  }
  return p;
}

// 摺到 90° 後每片的中心
function icNetFold(cells, root) {
  const tree = icNetTree(cells, root);
  const ctrs = cells.map((c, i) => icNetPoint(tree, i, [c[0] + 0.5, c[1] + 0.5, 0], Math.PI / 2));
  const same = [];
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
    if (icLen(icSub(ctrs[i], ctrs[j])) < 1e-6) same.push([i, j]);
  }
  const opp = [];
  if (!same.length) {
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) {
      if (Math.abs(icLen(icSub(ctrs[i], ctrs[j])) - 1) < 1e-6) opp.push([i, j]);
    }
  }
  return { tree, ctrs, same, opp, ok: !same.length };
}

function initC6Canvas() {
  const cv = hbEl('canvas-c6');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c6-formula'), fb = hbEl('c6-feedback');
  const sN = hbEl('c6-net'), sT = hbEl('c6-t'), sY = hbEl('c6-yaw');

  function draw() {
    const ni = hbIv(sN), tp = hbIv(sT), yaw = hbIv(sY);
    icSet(hbEl('c6-vnet'), ni + 1);
    icSet(hbEl('c6-vt'), tp);
    icSet(hbEl('c6-vyaw'), yaw);
    ctx.clearRect(0, 0, W, cv.height);
    icTitle(ctx, `展開圖 ${ni + 1}：摺得成正立方體嗎？`, IC_TONE[5]);
    const cells = IC_NETS[ni], root = IC_NET_ROOT[ni];
    const res = icNetFold(cells, root);
    const ang = tp / 100 * Math.PI / 2;

    // 小圖：平面的展開圖
    const s = 17, mx0 = 22, my0 = 46;
    cells.forEach((c, i) => {
      ctx.save();
      ctx.fillStyle = IC_FACE6[i];
      ctx.globalAlpha = 0.35;
      ctx.fillRect(mx0 + c[0] * s, my0 + c[1] * s, s, s);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = IC_FROST;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(mx0 + c[0] * s, my0 + c[1] * s, s, s);
      ctx.restore();
      textCenter(ctx, String(i + 1), mx0 + c[0] * s + s / 2, my0 + c[1] * s + s / 2, IC_FROST, f(700, 10.5));
    });

    const rc = cells[root];
    const cam = icCam(yaw, 30, 64, W / 2 + 20, 214, [rc[0] + 0.5, rc[1] + 0.5, 0.4]);
    const faces = cells.map((c, i) => {
      const pts = [[c[0], c[1], 0], [c[0] + 1, c[1], 0], [c[0] + 1, c[1] + 1, 0], [c[0], c[1] + 1, 0]]
        .map(q => icNetPoint(res.tree, i, q, ang));
      return { i, pts, ctr: icCentroid(pts) };
    });
    faces.sort((a, b) => cam.pt(a.ctr).d - cam.pt(b.ctr).d);
    faces.forEach(fc => {
      const ps = fc.pts.map(p => cam.pt(p));
      icFillPts(ctx, ps, IC_FACE6[fc.i], 0.42);
      icStrokePts(ctx, ps, IC_FROST, 1.8, null, true);
      const pc = cam.pt(fc.ctr);
      textCenter(ctx, String(fc.i + 1), pc.x, pc.y, IC_FROST, f(800, 17));
    });

    let l1, c1, l2 = '';
    if (tp < 100) { l1 = `摺到 ${tp}%……把「摺的程度」拉到 100% 看結果`; c1 = IC_FROST; }
    else if (res.ok) {
      l1 = '六片剛好圍成正立方體：這是展開圖'; c1 = IC_OK;
      l2 = '相對的面：' + res.opp.map(p => `${p[0] + 1} 與 ${p[1] + 1}`).join('、');
    } else {
      l1 = '有兩片疊在一起、又空出一個面：不是展開圖'; c1 = IC_NO;
      l2 = '疊在一起的：' + res.same.map(p => `第 ${p[0] + 1} 片和第 ${p[1] + 1} 片`).join('、');
    }
    hbFitLine(ctx, l1, 400, c1, 16);
    if (l2) hbFitLine(ctx, l2, 434, IC_AMBER, 15);

    if (tp < 100) out.innerHTML = `展開圖 ${ni + 1}：摺到 \\(${tp}\\%\\)`;
    else if (res.ok) out.innerHTML = `展開圖 ${ni + 1}：是正立方體的展開圖`;
    else out.innerHTML = `展開圖 ${ni + 1}：不是正立方體的展開圖`;
    let txt;
    if (tp < 100) txt = '每一片都沿著和旁邊那一片共用的邊往上摺。拉到 \\(100\\%\\)，看六片會不會剛好圍成一個盒子。';
    else if (res.ok) txt = '摺好後，<strong>共用一邊的兩片互相垂直</strong>；在一直排上<strong>隔一片</strong>的兩片會變成<strong>相對的面</strong>，互相平行。同一個正立方體有好幾種不同的展開圖。';
    else txt = '六個正方形不一定圍得成正立方體：像「田」字那樣排成 \\(2 \\times 2\\) 的四片、或一排超過四片，摺起來都會重疊。';
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  [sN, sT, sY].forEach(s => s.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 7：角柱的體積與表面積
   體積 = 底面積 × 高；表面積 = 側面積（周長 × 高）+ 2 × 底面積
   ========================================================================== */
const IC_TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]];

function initC7Canvas() {
  const cv = hbEl('canvas-c7');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c7-formula'), fb = hbEl('c7-feedback');
  const sA = hbEl('c7-a'), sB = hbEl('c7-b'), sK = hbEl('c7-k'), sH = hbEl('c7-h');
  let mode = 'rect';

  function draw() {
    const a0 = hbIv(sA), b0 = hbIv(sB), k = hbIv(sK), h = hbIv(sH);
    const tri = mode === 'tri';
    const tp = IC_TRIPLES[k];
    icSet(hbEl('c7-va'), a0);
    icSet(hbEl('c7-vb'), b0);
    icSet(hbEl('c7-vk'), `${tp[0]}、${tp[1]}、${tp[2]}`);
    icSet(hbEl('c7-vh'), h);
    icShow('c7-rect-ctl', !tri);
    icShow('c7-tri-ctl', tri);
    ctx.clearRect(0, 0, W, cv.height);
    icTitle(ctx, tri ? '直角三角柱的體積與表面積' : '長方體（四角柱）的體積與表面積', IC_TONE[6]);

    const a = tri ? tp[0] : a0, b = tri ? tp[1] : b0;
    const base = tri ? [[0, 0], [a, 0], [0, b]] : [[0, 0], [a, 0], [a, b], [0, b]];
    const sides = tri ? [a, tp[2], b] : [a, b, a, b];
    const A2 = a * b;                 // 底面積的兩倍（三角形）或底面積（長方形）
    const area = tri ? A2 / 2 : A2;
    const per = sides.reduce((s, x) => s + x, 0);
    const V = area * h, Sf = per * h + 2 * area;

    // 立體
    const S = icPrism(base, h);
    const cam = icCamFit(S.V, { x: 24, y: 46, w: 250, h: 210 }, -30, 24);
    icDraw(ctx, cam, S, { faceFill: i => (i < 2 ? IC_AMBER : null), hlAlpha: 0.3, alpha: 0.08 });
    // 底面（平面圖）
    const bx = 300, by = 60, bw = 210, bh = 150;
    const u = Math.min(bw / a, bh / b);
    const P = p => ({ x: bx + p[0] * u, y: by + bh - p[1] * u });
    const bp = base.map(P);
    icFillPts(ctx, bp, IC_AMBER, 0.28);
    icStrokePts(ctx, bp, IC_FROST, 2, null, true);
    textCenter(ctx, String(a), (bp[0].x + bp[1].x) / 2, bp[0].y + 14, IC_FROST, f(700, 14));
    textCenter(ctx, String(b), bp[0].x - 14, (bp[0].y + bp[bp.length - 1].y) / 2, IC_FROST, f(700, 14));
    if (tri) textCenter(ctx, String(tp[2]), (bp[1].x + bp[2].x) / 2 + 12, (bp[1].y + bp[2].y) / 2 - 10, IC_FROST, f(700, 14));
    icRow(ctx, '底面積 =', tri ? `${a} × ${b} ÷ 2 = ${area}` : `${a} × ${b} = ${area}`, [], bx + bw / 2, by + bh + 34, 15, IC_AMBER, IC_FROST);

    // 側面攤開成一個長方形
    const sx = 480 / per, sh = Math.min(sx * h, 70);
    let x = 30;
    const y0 = 278;
    sides.forEach((sd, i) => {
      ctx.save();
      ctx.fillStyle = i % 2 ? IC_TEAL : IC_SKY;
      ctx.globalAlpha = 0.24;
      ctx.fillRect(x, y0, sd * sx, sh);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = IC_FROST;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x, y0, sd * sx, sh);
      ctx.restore();
      textCenter(ctx, String(sd), x + sd * sx / 2, y0 + sh / 2, IC_FROST, f(700, 14));
      x += sd * sx;
    });
    textCenter(ctx, `側面攤開：長 = 底面周長 ${per}、寬 = 高 ${h}`, W / 2, y0 + sh + 18, IC_FAINT, f(700, 13.5));

    icRow(ctx, '體積 = 底面積 × 高 =', `${area} × ${h} = ${V}`, [], W / 2, 410, 17, IC_FROST, IC_AMBER);
    icRow(ctx, '表面積 = 周長 × 高 + 2 × 底面積 =', `${per} × ${h} + 2 × ${area} = ${Sf}`, [], W / 2, 452, 17, IC_FROST, IC_AMBER);

    out.innerHTML = `體積 ${wbrEq(`${area} \\times ${h} = ${V}`)}，表面積 ${wbrEq(`${per} \\times ${h} + 2 \\times ${area} = ${Sf}`)}`;
    const txt = tri
      ? `底面是兩股 \\(${a}\\)、\\(${b}\\) 的直角三角形，斜邊 \\(${tp[2]}\\)。三個側面拼成一個長 \\(${per}\\)（周長）、寬 \\(${h}\\) 的長方形；別忘了<strong>上下兩個底面</strong>都要算。`
      : `四個側面拼成一個長 \\(${per}\\)（底面周長）、寬 \\(${h}\\) 的長方形，面積 \\(${per * h}\\)；再加上下兩個底面 \\(2 \\times ${area}\\)。`;
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  [sA, sB, sK, sH].forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c7-mode-group'), 'data-c7-mode', v => { mode = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 8：長方體裡的最短距離——兩次畢氏定理
   B 到 H：先在底面 △FGH 求 FH，再在直立的 △BFH 求 BH。
   ========================================================================== */
function initC8Canvas() {
  const cv = hbEl('canvas-c8');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c8-formula'), fb = hbEl('c8-feedback');
  const sL = hbEl('c8-l'), sW = hbEl('c8-w'), sH = hbEl('c8-h'), sY = hbEl('c8-yaw');

  function draw() {
    const l = hbIv(sL), w = hbIv(sW), h = hbIv(sH), yaw = hbIv(sY);
    icSet(hbEl('c8-vl'), l);
    icSet(hbEl('c8-vw'), w);
    icSet(hbEl('c8-vh'), h);
    icSet(hbEl('c8-vyaw'), yaw);
    ctx.clearRect(0, 0, W, cv.height);
    icTitle(ctx, '冰庫裡的螢火蟲從 B 飛到 H，最短要飛多遠？', IC_TONE[7]);
    const S = icCuboid(l, w, h);
    const cam = icCamFit(S.V, { x: 70, y: 44, w: W - 140, h: 216 }, yaw, 24);
    const [, B, , , , F, G, Hh] = S.V;
    icPoly3(ctx, cam, [F, G, Hh], IC_TEAL, 0.3);
    icPoly3(ctx, cam, [B, F, Hh], IC_AMBER, 0.24);
    icDraw(ctx, cam, S, { names: IC_BOX_NAMES, alpha: 0.05 });
    icSeg3(ctx, cam, F, Hh, IC_TEAL, 3);
    icSeg3(ctx, cam, B, Hh, IC_AMBER, 4);
    icRightMark(ctx, cam, G, icSub(F, G), icSub(Hh, G), Math.min(l, w, h) * 0.14, IC_TEAL);
    icRightMark(ctx, cam, F, icSub(B, F), icSub(Hh, F), Math.min(l, w, h) * 0.14, IC_AMBER);

    const fh2 = l * l + w * w, bh2 = fh2 + h * h;
    icRow(ctx, '[FH]² = [FG]² + [GH]² =', `${w}^2 + ${l}^2 = ${fh2}`, [], W / 2, 296, 16, IC_TEAL, IC_FROST);
    icRow(ctx, '[FH] =', '@0', [icRootIt(fh2, IC_TEAL)], W / 2, 330, 16, IC_TEAL);
    icRow(ctx, '[BH]² = [FH]² + [BF]² =', `${fh2} + ${h}^2 = ${bh2}`, [], W / 2, 372, 16, IC_AMBER, IC_FROST);
    const r = hbRoot(bh2);
    icRow(ctx, '[BH] =', r.exact ? '@0' : `@0 ≈ ${r.dec}`, [icRootIt(bh2, IC_AMBER)], W / 2, 412, 19, IC_AMBER);

    out.innerHTML = `\\(\\overline{BH}\\) ${wbrEq(`= \\sqrt{${l}^2 + ${w}^2 + ${h}^2} = ${r.tex}`)}`.replace('\\( {}= ', '\\( = ');
    fb.innerHTML = wrapFeedback(`兩點之間直線最短，所以最短距離就是 \\(\\overline{BH}\\)。\\(\\overline{BH}\\) 不在任何一個面上，要先在底面的直角 \\(\\triangle FGH\\) 求出 \\(\\overline{FH}\\)，再用直立的直角 \\(\\triangle BFH\\)（\\(\\angle BFH = 90^\\circ\\)）求 \\(\\overline{BH}\\)。合起來就是 \\(\\sqrt{\\text{長}^2 + \\text{寬}^2 + \\text{高}^2}\\)。`);
    typeset([out, fb]);
  }

  [sL, sW, sH, sY].forEach(s => s.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 9：圓柱的展開圖——側面長方形的長 = 底圓周長 2πr
   ========================================================================== */
function initC9Canvas() {
  const cv = hbEl('canvas-c9');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c9-formula'), fb = hbEl('c9-feedback');
  const sR = hbEl('c9-r'), sH = hbEl('c9-h'), sT = hbEl('c9-t'), sK = hbEl('c9-k');
  let mode = 'roll';

  function draw() {
    const r = hbIv(sR), h = hbIv(sH), tp = hbIv(sT), k = hbIv(sK);
    const chk = mode === 'check';
    icSet(hbEl('c9-vr'), r);
    icSet(hbEl('c9-vh'), h);
    icSet(hbEl('c9-vt'), tp);
    icSet(hbEl('c9-vk'), k);
    icShow('c9-t-row', !chk);
    icShow('c9-k-row', chk);
    ctx.clearRect(0, 0, W, cv.height);
    icTitle(ctx, chk ? '這張展開圖圍得成圓柱嗎？' : '把圓柱的側面剪開、攤平', IC_TONE[8]);

    const L = chk ? k * Math.PI : 2 * Math.PI * r * tp / 100;
    const Lmax = Math.max(chk ? k * Math.PI : 2 * Math.PI * r, 2 * Math.PI * r);
    const u = Math.min(290 / Lmax, 290 / (h + 4 * r), 80 / r, 26);

    // 左：圓柱
    const cam = icCam(-20, 22, u, 112, 210, [0, 0, h / 2]);
    const cyl = icCylinder(ctx, cam, r, h, { color: IC_SKY });
    if (!chk) icStrokePts(ctx, [cyl.bot[cyl.iL], cyl.top[cyl.iL]], IC_AMBER, 3.5);

    // 右：展開圖
    const x0 = 222, top = 210 - (h + 4 * r) * u / 2;
    const ry = top + 2 * r * u;
    if (L > 0) {
      ctx.save();
      ctx.fillStyle = IC_SKY;
      ctx.globalAlpha = 0.24;
      ctx.fillRect(x0, ry, L * u, h * u);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = IC_FROST;
      ctx.lineWidth = 2;
      ctx.strokeRect(x0, ry, L * u, h * u);
      ctx.restore();
    }
    if (chk || tp === 100) {
      [[top + r * u], [ry + h * u + r * u]].forEach(cy => {
        ctx.save();
        ctx.fillStyle = IC_AMBER;
        ctx.globalAlpha = 0.24;
        ctx.beginPath();
        ctx.arc(x0 + r * u, cy[0], r * u, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = IC_AMBER;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });
      textCenter(ctx, `r = ${r}`, x0 + r * u, top + r * u, IC_FROST, fi(700, 13));
    }
    textCenter(ctx, `h = ${h}`, x0 - 28 + (L > 0 ? 0 : 0), ry + h * u / 2, IC_FROST, fi(700, 13));
    if (chk) {
      // 底圓周長的長度，畫在長方形下緣的下方對照
      const yc = ry + h * u + 2 * r * u + 16;
      icStrokePts(ctx, [{ x: x0, y: yc }, { x: x0 + 2 * Math.PI * r * u, y: yc }], IC_AMBER, 3, [6, 4]);
    }

    const lenTxt = chk ? `${k}π` : `${2 * r}π`;
    let l1, c1;
    if (!chk) {
      l1 = tp < 100 ? `攤開 ${tp}%：長方形的長愈拉愈長` : `長方形的長 = 底圓周長 = 2π × ${r} = ${2 * r}π`;
      c1 = IC_FROST;
    } else if (k === 2 * r) { l1 = `長方形的長 ${lenTxt} = 底圓周長 ${2 * r}π：剛好圍得起來`; c1 = IC_OK; }
    else if (k < 2 * r) { l1 = `長方形的長 ${lenTxt} 比底圓周長 ${2 * r}π 短：圍不滿`; c1 = IC_NO; }
    else { l1 = `長方形的長 ${lenTxt} 比底圓周長 ${2 * r}π 長：會重疊`; c1 = IC_NO; }
    hbFitLine(ctx, l1, 412, c1, 16);
    hbFitLine(ctx, '長方形的寬 = 圓柱的高；長方形的長 = 底圓的周長', 446, IC_FAINT, 14);

    if (!chk) out.innerHTML = `長方形的長 ${wbrEq(`= 2\\pi \\times ${r} = ${2 * r}\\pi`)}，寬 \\(= ${h}\\)`.replace('\\( {}= ', '\\( = ');
    else out.innerHTML = k === 2 * r ? `\\(${k}\\pi = 2\\pi \\times ${r}\\)：是圓柱的展開圖` : `\\(${k}\\pi \\ne 2\\pi \\times ${r}\\)：不是圓柱的展開圖`;
    let txt;
    if (!chk) txt = '沿著一條直的邊（黃線）把側面剪開攤平，會得到一個長方形：寬是圓柱的高，長剛好繞底圓一圈，等於底圓的周長 \\(2\\pi r\\)。';
    else if (k === 2 * r) txt = '側面的長方形剛好繞上下兩個圓一圈，這是圓柱的展開圖。';
    else txt = `底圓半徑 \\(${r}\\)，周長是 \\(${2 * r}\\pi\\)，長方形的長卻是 \\(${k}\\pi\\)，捲起來${k < 2 * r ? '接不起來' : '會多出一截'}——不是圓柱的展開圖。只看「中間是長方形、上下兩個圓」是不夠的。`;
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  [sR, sH, sT, sK].forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c9-mode-group'), 'data-c9-mode', v => { mode = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 10：圓柱的體積與表面積
   體積 = πr² × h；表面積 = 2πr × h + 2 × πr²。由展開圖出發時 r = k/2，用有理數算。
   ========================================================================== */
// 平面上的圓柱展開圖：長方形（長 L、寬 h）上下各接一個半徑 r 的圓
function icCylNet(ctx, x0, cyMid, L, h, r, u) {
  const top = cyMid - (h + 4 * r) * u / 2, ry = top + 2 * r * u;
  ctx.save();
  ctx.fillStyle = IC_SKY;
  ctx.globalAlpha = 0.24;
  ctx.fillRect(x0, ry, L * u, h * u);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = IC_FROST;
  ctx.lineWidth = 2;
  ctx.strokeRect(x0, ry, L * u, h * u);
  [top + r * u, ry + h * u + r * u].forEach(cy => {
    ctx.fillStyle = IC_AMBER;
    ctx.globalAlpha = 0.24;
    ctx.beginPath();
    ctx.arc(x0 + r * u, cy, r * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = IC_AMBER;
    ctx.stroke();
  });
  ctx.restore();
  return { top, ry };
}

function initC10Canvas() {
  const cv = hbEl('canvas-c10');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c10-formula'), fb = hbEl('c10-feedback');
  const sR = hbEl('c10-r'), sH = hbEl('c10-h'), sK = hbEl('c10-k');
  let mode = 'rh';

  function draw() {
    const net = mode === 'net';
    const r0 = hbIv(sR), h = hbIv(sH), k = hbIv(sK);
    icSet(hbEl('c10-vr'), r0);
    icSet(hbEl('c10-vh'), h);
    icSet(hbEl('c10-vk'), k);
    icShow('c10-r-row', !net);
    icShow('c10-k-row', net);
    ctx.clearRect(0, 0, W, cv.height);
    icTitle(ctx, net ? '由展開圖求圓柱的體積與表面積' : '圓柱的體積與表面積', IC_TONE[9]);
    // r = rn / rd（展開圖模式 r = k/2）
    const rn = net ? k : 2 * r0, rd = 2;
    const rv = rn / rd;
    const u = Math.min(290 / (2 * Math.PI * rv), 230 / (h + 4 * rv), 70 / rv, 22);
    const cam = icCam(-20, 22, u, 110, 176, [0, 0, h / 2]);
    icCylinder(ctx, cam, rv, h, { color: IC_SKY });
    icCylNet(ctx, 222, 176, 2 * Math.PI * rv, h, rv, u);

    // 係數都以「乘 π」表示：r² = rn²/4
    const r2n = rn * rn, r2d = 4;                       // r²
    const vN = r2n * h, vD = 4;                          // 體積係數
    const latN = rn * h, latD = 1;                       // 側面積係數 2πrh = rn·h π
    const sN = 2 * latN * 2 + 2 * r2n, sD = 4;           // 表面積係數（通分到 4）
    const rIt = icQIt(rn, rd, IC_FROST);
    if (net) {
      icRow(ctx, `2πr = ${k}π，r =`, '@0', [icQIt(rn, rd, IC_AMBER)], W / 2, 320, 16, IC_FROST, IC_AMBER);
    } else {
      icRow(ctx, '底面積 = π × r² =', `π × ${r0}^2 = @0`, [icPiIt(r2n, r2d, IC_AMBER)], W / 2, 320, 16, IC_FROST);
    }
    icRow(ctx, '體積 = πr² × h =', net && rn % 2 ? `π × (@0)^2 × ${h} = @1` : `π × @0^2 × ${h} = @1`, [rIt, icPiIt(vN, vD, IC_AMBER)], W / 2, 362, 16.5, IC_FROST);
    icRow(ctx, '側面積 = 2πr × h =', `${net ? k : 2 * r0}π × ${h} = @0`, [icPiIt(latN * 2, 2, IC_AMBER)], W / 2, 402, 16.5, IC_FROST);
    icRow(ctx, '表面積 = 側面積 + 2 × πr² =', '@0', [icPiIt(sN, sD, IC_AMBER)], W / 2, 442, 18, IC_FROST);

    const rT = icQTex(rn, rd);
    const rP = rd === 1 || rn % rd === 0 ? rT : `\\left(${rT}\\right)`;
    out.innerHTML = `體積 ${wbrEq(`\\pi \\times ${rP}^2 \\times ${h} = ${icPiTex(vN, vD)}`)}，表面積 ${wbrEq(`${icPiTex(latN * 2, 2)} + 2 \\times ${icPiTex(r2n, r2d)} = ${icPiTex(sN, sD)}`)}`;
    const txt = net
      ? `側面攤開的長方形，長 \\(${k}\\pi\\) 就是底圓周長 \\(2\\pi r\\)，所以 \\(r = ${rT}\\)。先求出半徑，體積、表面積就和一般圓柱一樣算。`
      : '圓柱的體積和角柱一樣是<strong>底面積 \\(\\times\\) 高</strong>；表面積是側面的長方形（長 \\(2\\pi r\\)、寬 \\(h\\)）加上<strong>兩個</strong>底圓。答案保留 \\(\\pi\\) 就好，不必代 \\(3.14\\)。';
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  [sR, sH, sK].forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c10-mode-group'), 'data-c10-mode', v => { mode = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 11：空心與組合的圓柱
   筆筒：體積 = πR²H − πr²d；表面積 = 2πRH + 2πrd + 2πR²（內底面補到上緣環形）
   疊放：體積 = πR²H + πr²h；表面積 = 2πR² + 2πRH + 2πrh（重疊的部分不算）
   ========================================================================== */
function initC11Canvas() {
  const cv = hbEl('canvas-c11');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c11-formula'), fb = hbEl('c11-feedback');
  const s1 = hbEl('c11-R'), s2 = hbEl('c11-r'), s3 = hbEl('c11-H'), s4 = hbEl('c11-d');
  let mode = 'hollow';

  function draw() {
    const R = hbIv(s1), r = hbIv(s2), H = hbIv(s3), d = hbIv(s4);
    const hollow = mode === 'hollow';
    icSet(hbEl('c11-vR'), R);
    icSet(hbEl('c11-vr'), r);
    icSet(hbEl('c11-vH'), H);
    icSet(hbEl('c11-vd'), d);
    icSet(hbEl('c11-l1'), hollow ? '外圈半徑 R' : '大圓柱半徑 R');
    icSet(hbEl('c11-l2'), hollow ? '內圈半徑 r' : '小圓柱半徑 r');
    icSet(hbEl('c11-l3'), hollow ? '外壁高 H' : '大圓柱高 H');
    icSet(hbEl('c11-l4'), hollow ? '內壁深 d' : '小圓柱高 h');
    ctx.clearRect(0, 0, W, cv.height);
    icTitle(ctx, hollow ? '冰杯（中空圓柱）的體積與表面積' : '兩個圓柱疊成的冰燈座', IC_TONE[10]);

    let bad = '';
    if (r >= R) bad = hollow ? '內圈半徑要比外圈小，杯壁才有厚度' : '小圓柱要比大圓柱細，才放得在上面';
    else if (hollow && d >= H) bad = '內壁深度要比外壁高度小，杯子才有底';

    const Htot = hollow ? H : H + d;
    const box = [[-R, -R, 0], [R, R, 0], [-R, R, Htot], [R, -R, Htot]];
    const cam = icCamFit(box, { x: 120, y: 44, w: W - 240, h: 232 }, -20, 24, 30);
    if (!bad) {
      if (hollow) {
        icCylinder(ctx, cam, R, H, { color: IC_SKY, top: false });
        const topO = icRing(cam, [0, 0, H], R), topI = icRing(cam, [0, 0, H], r);
        icFillPts(ctx, topO, IC_SKY, 0.22);
        icFillPts(ctx, topI, '#0b1424', 0.85);
        icStrokePts(ctx, topO, IC_FROST, 2, null, true);
        icStrokePts(ctx, topI, IC_FROST, 2, null, true);
        icStrokePts(ctx, icRing(cam, [0, 0, H - d], r), IC_FAINT, 1.4, [5, 4], true);
        const ip = icRing(cam, [0, 0, H], r), ib = icRing(cam, [0, 0, H - d], r);
        let iL = 0, iR = 0;
        ip.forEach((p, i) => { if (p.x < ip[iL].x) iL = i; if (p.x > ip[iR].x) iR = i; });
        icStrokePts(ctx, [ip[iL], ib[iL]], IC_FAINT, 1.4, [5, 4]);
        icStrokePts(ctx, [ip[iR], ib[iR]], IC_FAINT, 1.4, [5, 4]);
      } else {
        icCylinder(ctx, cam, R, H, { color: IC_SKY });
        icCylinder(ctx, cam, r, d, { color: IC_AMBER, c: [0, 0, H] });
      }
    } else {
      hbFitLine(ctx, bad + '（情境不成立）', 160, IC_NO, 16);
      hbFitLine(ctx, '把滑桿調回去再看', 196, IC_FROST, 15);
    }

    if (bad) {
      out.innerHTML = '情境不成立';
      fb.innerHTML = wrapFeedback(`現在 \\(R = ${R}\\)、\\(r = ${r}\\)${hollow ? `、\\(H = ${H}\\)、\\(d = ${d}\\)` : ''}：${bad}。`);
      typeset([out, fb]);
      return;
    }
    let vN, sN, rows;
    if (hollow) {
      vN = R * R * H - r * r * d;
      sN = 2 * R * H + 2 * r * d + 2 * R * R;
      rows = [
        ['體積 = 外圓柱 − 挖空的部分 =', `${R * R * H}π − ${r * r * d}π = ${vN}π`],
        ['外側面 + 內側面 =', `${2 * R * H}π + ${2 * r * d}π`],
        ['外底面 × 2（內底面補到上緣環形）=', `${2 * R * R}π`],
        ['表面積 =', `${sN}π`]
      ];
    } else {
      vN = R * R * H + r * r * d;
      sN = 2 * R * R + 2 * R * H + 2 * r * d;
      rows = [
        ['體積 = 大圓柱 + 小圓柱 =', `${R * R * H}π + ${r * r * d}π = ${vN}π`],
        ['大圓柱上下底 =', `2 × ${R * R}π = ${2 * R * R}π`],
        ['大圓柱側面 + 小圓柱側面 =', `${2 * R * H}π + ${2 * r * d}π`],
        ['表面積 =', `${sN}π`]
      ];
    }
    rows.forEach((rw, i) => icRow(ctx, rw[0], rw[1], [], W / 2, 304 + i * 38, i === 3 ? 18 : 15.5, IC_FROST, IC_AMBER));

    out.innerHTML = `體積 \\(${vN}\\pi\\)，表面積 \\(${sN}\\pi\\)`;
    const txt = hollow
      ? '表面積包含外側面、內側面、外底面、上緣的環形與內部的底面。把內底面（半徑 \\(r\\) 的圓）「搬」到上緣，剛好補成一個完整的大圓，所以是外底面算兩次。'
      : '小圓柱壓住大圓柱上底的一塊圓，那塊被遮住了；但小圓柱自己的上底露出來，大小一樣——一進一出，正好等於「大圓柱上下底 \\(+\\) 兩個側面」。';
    fb.innerHTML = wrapFeedback(txt);
    typeset([out, fb]);
  }

  [s1, s2, s3, s4].forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c11-mode-group'), 'data-c11-mode', v => { mode = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 12：角錐的組成與展開圖——頂點 n + 1、面 n + 1、邊 2n
   每個側面三角形沿底邊往上轉 t × (180° − 側面與底面的夾角)，摺到底時錐頂會合。
   ========================================================================== */
function initC12Canvas() {
  const cv = hbEl('canvas-c12');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c12-formula'), fb = hbEl('c12-feedback');
  const sN = hbEl('c12-n'), sT = hbEl('c12-t'), sY = hbEl('c12-yaw');

  function draw() {
    const n = hbIv(sN), tp = hbIv(sT), yaw = hbIv(sY);
    icSet(hbEl('c12-vn'), n);
    icSet(hbEl('c12-vt'), tp);
    icSet(hbEl('c12-vyaw'), yaw);
    ctx.clearRect(0, 0, W, cv.height);
    const name = `${IC_CN_NUM[n]}角錐`;
    icTitle(ctx, `正${name}：摺起來、數一數`, IC_TONE[11]);

    const Rb = 1.6, Hh = 2.3;
    const base = icRegPoly(n, Rb, 90 + 180 / n).map(p => [p[0], p[1], 0]);
    const rho = Rb * Math.cos(Math.PI / n);
    const sl = Math.hypot(Hh, rho), phi = Math.atan2(Hh, rho);
    const beta = tp / 100 * (Math.PI - phi);
    const faces = [{ pts: base, col: IC_AMBER }];
    for (let i = 0; i < n; i++) {
      const P = base[i], Q = base[(i + 1) % n];
      const M = icCentroid([P, Q]);
      const flat = icAdd(M, icUnit([M[0], M[1], 0]), sl);
      let A = icRotAxis(flat, P, icSub(Q, P), beta);
      const test = icRotAxis(flat, P, icSub(Q, P), 0.1);
      if (test[2] < 0) A = icRotAxis(flat, P, icSub(Q, P), -beta);
      faces.push({ pts: [P, Q, A], col: i % 2 ? IC_VIO : IC_PINK });
    }
    const span = Rb + sl;
    const cam = icCam(yaw, 34, Math.min(440 / (2 * span), 58), W / 2, 196, [0, 0, 0.6]);
    faces.sort((a, b) => cam.pt(icCentroid(a.pts)).d - cam.pt(icCentroid(b.pts)).d);
    faces.forEach(fc => {
      const ps = fc.pts.map(p => cam.pt(p));
      icFillPts(ctx, ps, fc.col, 0.36);
      icStrokePts(ctx, ps, IC_FROST, 1.8, null, true);
    });

    if (tp < 100) hbFitLine(ctx, `摺到 ${tp}%：底面在中間，${n} 個側面三角形圍在四周`, 350, IC_FROST, 15);
    else hbFitLine(ctx, `${n} 個三角形的頂點會合在一點，成為錐頂`, 350, IC_OK, 15);
    dkRich(ctx, [[`頂點：底面 ${n} 個 + 錐頂 1 個 = n + 1 = ${n + 1}`, IC_FROST]], W / 2, 384, 15);
    dkRich(ctx, [[`面：底面 1 個 + 側面 ${n} 個 = n + 1 = ${n + 1}`, IC_FROST]], W / 2, 414, 15);
    dkRich(ctx, [[`邊：底面 ${n} 條 + 側邊 ${n} 條 = 2n = ${2 * n}`, IC_AMBER]], W / 2, 444, 15);

    out.innerHTML = `${name}：頂點 \\(${n + 1}\\)、面 \\(${n + 1}\\)、邊 \\(${2 * n}\\)`;
    fb.innerHTML = wrapFeedback(`\\(n\\) 角錐的底面是 \\(n\\) 邊形，每一條底邊接一個三角形側面，這些三角形共用一個頂點（錐頂）。所以頂點、面都是 \\(n + 1\\)，邊是 \\(2n\\)。<strong>正角錐</strong>的底面是正多邊形、側面是全等的等腰三角形。`);
    typeset([out, fb]);
  }

  [sN, sT, sY].forEach(s => s.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 13：角錐的表面積——底面積 + 側面三角形的面積和
   ========================================================================== */
function initC13Canvas() {
  const cv = hbEl('canvas-c13');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c13-formula'), fb = hbEl('c13-feedback');
  const sA = hbEl('c13-a'), sS = hbEl('c13-s'), sH = hbEl('c13-H');
  let mode = 'slant';

  function draw() {
    const a = hbIv(sA), s = hbIv(sS), H = hbIv(sH);
    icSet(hbEl('c13-va'), a);
    icSet(hbEl('c13-vs'), s);
    icSet(hbEl('c13-vH'), H);
    icShow('c13-s-row', mode === 'slant');
    icShow('c13-H-row', mode === 'height');
    ctx.clearRect(0, 0, W, cv.height);
    const titles = { slant: '正四角錐：已知底邊與斜高', height: '正四角錐：已知底邊與錐高', tet: '正四面體：四個面都是正三角形' };
    icTitle(ctx, titles[mode], IC_TONE[12]);

    if (mode === 'slant' && 2 * s <= a) {
      hbFitLine(ctx, `斜高 ${s} 不比底邊的一半 ${a / 2} 長，四個側面立不起來（情境不成立）`, 180, IC_NO, 15);
      hbFitLine(ctx, '把斜高調大，或把底邊調小', 216, IC_FROST, 15);
      out.innerHTML = '情境不成立';
      fb.innerHTML = wrapFeedback(`側面等腰三角形的高（斜高）要比底邊的一半長：現在斜高 \\(${s}\\)、底邊的一半是 \\(${a / 2}\\)。`);
      typeset([out, fb]);
      return;
    }

    if (mode === 'tet') {
      const S = icTetra(a);
      const cam = icCamFit(S.V, { x: 130, y: 46, w: W - 260, h: 220 }, -24, 22);
      icDraw(ctx, cam, S, { faceFill: () => IC_AMBER, hlAlpha: 0.22, alpha: 0.08 });
      icRow(ctx, '一個正三角形 =', `@0 × ${a}^2 = @1`, [FR('√3', '4', IC_FROST), SEQ([T(String(a * a / 4)), RT(T('3'))], IC_AMBER, 1)], W / 2, 320, 16, IC_FROST, IC_FROST);
      icRow(ctx, '表面積 = 4 個正三角形 =', `4 × @0 = @1`, [SEQ([T(String(a * a / 4)), RT(T('3'))], IC_FROST, 1), SEQ([T(String(a * a)), RT(T('3'))], IC_AMBER, 1)], W / 2, 366, 18, IC_FROST, IC_FROST);
      hbFitLine(ctx, '邊長 a 的正三角形：高 = (√3/2)a、面積 = (√3/4)a²', 420, IC_FAINT, 14);
      out.innerHTML = `表面積 ${wbrEq(`4 \\times \\frac{\\sqrt{3}}{4} \\times ${a}^2 = ${a * a}\\sqrt{3}`)}`;
      fb.innerHTML = wrapFeedback('正四面體的底面和三個側面都是全等的正三角形，表面積就是一個正三角形面積的 \\(4\\) 倍。');
      typeset([out, fb]);
      return;
    }

    const half = a / 2;
    const s2 = mode === 'slant' ? s * s : H * H + half * half;
    const Hv = mode === 'slant' ? Math.sqrt(s * s - half * half) : H;
    const base = [[-half, -half], [half, -half], [half, half], [-half, half]];
    const S = icPyramid(base, [0, 0, Hv]);
    const cam = icCamFit(S.V, { x: 120, y: 46, w: W - 240, h: 220 }, -24, 22);
    icDraw(ctx, cam, S, { faceFill: i => (i === 0 ? IC_AMBER : null), hlAlpha: 0.24, alpha: 0.08 });
    const O = [0, 0, 0], M = [0, -half, 0], A = [0, 0, Hv];
    icPoly3(ctx, cam, [O, M, A], IC_VIO, 0.16);
    icSeg3(ctx, cam, A, O, IC_VIO, 2.4, [6, 4]);
    icSeg3(ctx, cam, A, M, IC_TEAL, 4);
    icSeg3(ctx, cam, O, M, IC_FAINT, 1.6, [4, 4]);
    icRightMark(ctx, cam, O, icSub(M, O), icSub(A, O), Math.min(half, Hv) * 0.22, IC_VIO);
    const ml = cam.pt(icCentroid([A, M]));
    dkTag(ctx, '斜高', ml.x - 30, ml.y, IC_TEAL, 13);

    const sr = hbRoot(s2);
    const side2 = 2 * a;   // 側面積 = 4 × ½ × a × 斜高 = 2a × 斜高
    if (mode === 'slant') {
      icRow(ctx, '底面積 =', `${a}^2 = ${a * a}`, [], W / 2, 304, 16, IC_FROST, IC_AMBER);
      icRow(ctx, '側面積 = 4 ×', `@0 × ${a} × ${s} = ${side2 * s}`, [FR('1', '2', IC_FROST)], W / 2, 346, 16, IC_FROST, IC_AMBER);
      icRow(ctx, '表面積 =', `${a * a} + ${side2 * s} = ${a * a + side2 * s}`, [], W / 2, 392, 19, IC_FROST, IC_AMBER);
      out.innerHTML = `表面積 ${wbrEq(`${a}^2 + 4 \\times \\frac{1}{2} \\times ${a} \\times ${s} = ${a * a + side2 * s}`)}`;
      fb.innerHTML = wrapFeedback('角錐的表面積就是展開圖的面積：<strong>一個底面 \\(+\\) 所有側面三角形</strong>。側面三角形的高（斜高）不是角錐的高（虛線），兩者不要混在一起。');
    } else {
      icRow(ctx, '斜高 =', `@0 = @1`, [RT(T(`${H}² + ${half}²`)), icRootIt(s2, IC_TEAL)], W / 2, 304, 16, IC_TEAL, IC_FROST);
      const sideIt = sr.exact ? T(String(side2 * sr.k)) : SEQ([T(String(side2 * sr.k)), RT(T(String(sr.r)))], IC_AMBER, 1);
      icRow(ctx, '側面積 = 4 ×', `@0 × ${a} × @1 = @2`, [FR('1', '2', IC_FROST), icRootIt(s2, IC_FROST), sideIt], W / 2, 346, 16, IC_FROST, IC_AMBER);
      const tot = sr.exact ? T(String(a * a + side2 * sr.k)) : SEQ([T(`${a * a} + ${side2 * sr.k}`), RT(T(String(sr.r)))], IC_AMBER, 1);
      icRow(ctx, '表面積 =', '@0', [tot], W / 2, 392, 19, IC_FROST, IC_AMBER);
      const sideTex = sr.exact ? String(side2 * sr.k) : `${side2 * sr.k}\\sqrt{${sr.r}}`;
      const totTex = sr.exact ? String(a * a + side2 * sr.k) : `${a * a} + ${side2 * sr.k}\\sqrt{${sr.r}}`;
      out.innerHTML = `斜高 ${wbrEq(`= \\sqrt{${H}^2 + ${half}^2} = ${sr.tex}`)}，表面積 ${wbrEq(`= ${totTex}`)}`;
      fb.innerHTML = wrapFeedback(`錐高、底面中心到底邊中點的距離（底邊的一半 \\(${half}\\)）、斜高，圍成一個直角三角形（紫色），斜高是斜邊。先用畢氏定理求斜高，才能算側面三角形的面積。`);
    }
    typeset([out, fb]);
  }

  [sA, sS, sH].forEach(x => x.addEventListener('input', draw));
  bindPickGroup(hbEl('c13-mode-group'), 'data-c13-mode', v => { mode = v; draw(); });
  drawWithFonts(draw);
}

/* ==========================================================================
   圓錐的展開圖：扇形（半徑 R、圓心角 θ）＋底圓（半徑 r），兩個重點共用
   ========================================================================== */
function icConeNet(ctx, cx, oy, R, r, u, th) {
  const a0 = Math.PI / 2 - th / 2 * HB_RAD, a1 = Math.PI / 2 + th / 2 * HB_RAD;
  ctx.save();
  ctx.fillStyle = IC_SKY;
  ctx.globalAlpha = 0.24;
  ctx.beginPath();
  ctx.moveTo(cx, oy);
  ctx.arc(cx, oy, R * u, a0, a1);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = IC_FROST;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = IC_AMBER;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(cx, oy, R * u, a0, a1);
  ctx.stroke();
  // 底圓接在弧的最低點
  const cy = oy + R * u + r * u;
  ctx.fillStyle = IC_AMBER;
  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.arc(cx, cy, r * u, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = IC_AMBER;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  // 圓心角記號
  ctx.save();
  ctx.strokeStyle = IC_VIO;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, oy, Math.min(20, R * u * 0.3), a0, a1);
  ctx.stroke();
  ctx.restore();
  textCenter(ctx, 'O', cx, oy - 12, IC_FROST, fi(700, 14));
  return { cy };
}

function icConeScale(R, r, th) {
  return Math.min(12, 260 / (R + 2 * r + (th > 180 ? R : 0)), 118 / R);
}

/* ==========================================================================
   重點 14：圓錐展開圖——扇形的弧長 = 底圓周長，圓心角 = 360° × r/R
   ========================================================================== */
function initC14Canvas() {
  const cv = hbEl('canvas-c14');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c14-formula'), fb = hbEl('c14-feedback');
  const sR = hbEl('c14-R'), sr = hbEl('c14-r');

  function draw() {
    const R = hbIv(sR), r = hbIv(sr);
    icSet(hbEl('c14-vR'), R);
    icSet(hbEl('c14-vr'), r);
    ctx.clearRect(0, 0, W, cv.height);
    icTitle(ctx, '圓錐展開圖：扇形的圓心角是多少？', IC_TONE[13]);
    if (r >= R) {
      hbFitLine(ctx, `底圓半徑 ${r} 不比扇形半徑 ${R} 小，圍不出圓錐（情境不成立）`, 180, IC_NO, 15);
      hbFitLine(ctx, '母線（扇形半徑）一定比底圓半徑長', 216, IC_FROST, 15);
      out.innerHTML = '情境不成立';
      fb.innerHTML = wrapFeedback(`扇形半徑 \\(R = ${R}\\)、底圓半徑 \\(r = ${r}\\)：圓錐的母線是直角三角形的斜邊，一定比底圓半徑長。`);
      typeset([out, fb]);
      return;
    }
    const th = 360 * r / R;
    const u = icConeScale(R, r, th);
    const h = Math.sqrt(R * R - r * r);
    const cam = icCam(-15, 20, u, 120, 120 + h * u * 0.5, [0, 0, h / 2]);
    const cn = icCone(ctx, cam, r, h, { color: IC_SKY });
    icStrokePts(ctx, icArc(cn.bot, cn.iL, cn.iR, true, cam.pt([0, 0, 0]).d), IC_AMBER, 3.5);
    icStrokePts(ctx, [cn.A, cn.bot[cn.iR]], IC_TEAL, 3.5);
    const oy = 66 + (th > 180 ? R * u : 0);
    icConeNet(ctx, 390, oy, R, r, u, th);

    const deg = hbDegItem(360 * r, R, IC_AMBER);
    icRow(ctx, '扇形弧長 = 底圓周長 =', `2π × ${r} = ${2 * r}π`, [], W / 2, 344, 16, IC_FROST, IC_AMBER);
    icRow(ctx, '弧長占整個圓周的', `@0 = @1`, [FR(`${2 * r}π`, `2π × ${R}`, IC_FROST), icQIt(r, R, IC_AMBER)], W / 2, 384, 16, IC_FROST, IC_FROST);
    icRow(ctx, '圓心角 = 360° ×', `@0 = @1`, [icQIt(r, R, IC_FROST), deg], W / 2, 430, 18, IC_FROST, IC_FROST);

    out.innerHTML = `圓心角 ${wbrEq(`= 360^\\circ \\times ${icQTex(r, R)} = ${hbDegTex(360 * r, R)}`)}`;
    fb.innerHTML = wrapFeedback('把扇形捲起來，弧（黃色）剛好繞底圓一圈，所以<strong>扇形弧長 \\(=\\) 底圓周長 \\(2\\pi r\\)</strong>。弧長是整個圓周 \\(2\\pi R\\) 的幾分之幾，圓心角就是 \\(360^\\circ\\) 的幾分之幾——化簡後就是 \\(\\frac{r}{R}\\)。反過來，已知圓心角也能求 \\(r\\) 或 \\(R\\)。');
    typeset([out, fb]);
  }

  [sR, sr].forEach(s => s.addEventListener('input', draw));
  drawWithFonts(draw);
}

/* ==========================================================================
   重點 15：圓錐的表面積 = 扇形面積 + 底圓面積 = πRr + πr²
   ========================================================================== */
function initC15Canvas() {
  const cv = hbEl('canvas-c15');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const W = cv.width;
  const out = hbEl('c15-formula'), fb = hbEl('c15-feedback');
  const sR = hbEl('c15-R'), sr = hbEl('c15-r'), sH = hbEl('c15-h');
  let mode = 'slant';

  function draw() {
    const R0 = hbIv(sR), r = hbIv(sr), hh = hbIv(sH);
    const byH = mode === 'height';
    icSet(hbEl('c15-vR'), R0);
    icSet(hbEl('c15-vr'), r);
    icSet(hbEl('c15-vh'), hh);
    icShow('c15-R-row', !byH);
    icShow('c15-h-row', byH);
    ctx.clearRect(0, 0, W, cv.height);
    icTitle(ctx, byH ? '圓錐的表面積：已知底圓半徑與高' : '圓錐的表面積：扇形 + 底圓', IC_TONE[14]);
    if (!byH && r >= R0) {
      hbFitLine(ctx, `底圓半徑 ${r} 不比母線 ${R0} 短，圍不出圓錐（情境不成立）`, 180, IC_NO, 15);
      hbFitLine(ctx, '把母線調長，或把底圓半徑調小', 216, IC_FROST, 15);
      out.innerHTML = '情境不成立';
      fb.innerHTML = wrapFeedback(`母線 \\(R = ${R0}\\)、底圓半徑 \\(r = ${r}\\)：母線一定比底圓半徑長。`);
      typeset([out, fb]);
      return;
    }
    const R2 = byH ? r * r + hh * hh : R0 * R0;
    const Rr = hbRoot(R2);
    const R = Math.sqrt(R2);
    const th = 360 * r / R;
    const u = icConeScale(R, r, th);
    const h = Math.sqrt(R2 - r * r);
    const cam = icCam(-15, 20, u, 120, 120 + h * u * 0.5, [0, 0, h / 2]);
    const cn = icCone(ctx, cam, r, h, { color: IC_SKY });
    icStrokePts(ctx, [cn.A, cn.bot[cn.iR]], IC_TEAL, 3.5);
    if (byH) icSeg3(ctx, cam, [0, 0, 0], [0, 0, h], IC_VIO, 2.2, [6, 4]);
    const oy = 66 + (th > 180 ? R * u : 0);
    icConeNet(ctx, 390, oy, R, r, u, th);

    // 扇形面積 = πR² × r/R = πRr
    if (byH) {
      icRow(ctx, '母線 R =', '@0 = @1', [RT(T(`${r}² + ${hh}²`)), icRootIt(R2, IC_TEAL)], W / 2, 336, 16, IC_TEAL, IC_FROST);
      const secIt = Rr.exact ? T(`${Rr.k * r}π`) : SEQ([T(String(Rr.k * r)), RT(T(String(Rr.r))), T('π')], IC_AMBER, 1);
      icRow(ctx, '扇形面積 = π × R × r =', '@0', [secIt], W / 2, 376, 16, IC_FROST, IC_AMBER);
      const totIt = Rr.exact ? T(`${Rr.k * r + r * r}π`) : SEQ([T(`${Rr.k * r}`), RT(T(String(Rr.r))), T(`π + ${r * r}π`)], IC_AMBER, 1);
      icRow(ctx, '表面積 = 扇形 + 底圓 =', '@0', [totIt], W / 2, 422, 18, IC_FROST, IC_AMBER);
      const secTex = Rr.exact ? `${Rr.k * r}\\pi` : `${Rr.k * r}\\sqrt{${Rr.r}}\\pi`;
      out.innerHTML = `母線 ${wbrEq(`= \\sqrt{${r}^2 + ${hh}^2} = ${Rr.tex}`)}，表面積 ${wbrEq(Rr.exact ? `= ${Rr.k * r + r * r}\\pi` : `= ${secTex} + ${r * r}\\pi`)}`;
      fb.innerHTML = wrapFeedback('圓錐的高（虛線）、底圓半徑、母線圍成直角三角形，母線是斜邊。展開圖的扇形半徑是<strong>母線</strong>，不是高——先用畢氏定理求母線。');
    } else {
      icRow(ctx, '扇形面積 = π × ' + R0 + '² ×', `@0 = ${R0 * r}π`, [icQIt(r, R0, IC_FROST)], W / 2, 336, 16, IC_FROST, IC_AMBER);
      icRow(ctx, '底圓面積 = π ×', `${r}^2 = ${r * r}π`, [], W / 2, 376, 16, IC_FROST, IC_AMBER);
      icRow(ctx, '表面積 =', `${R0 * r}π + ${r * r}π = ${R0 * r + r * r}π`, [], W / 2, 422, 18, IC_FROST, IC_AMBER);
      out.innerHTML = `表面積 ${wbrEq(`= ${R0 * r}\\pi + ${r * r}\\pi = ${R0 * r + r * r}\\pi`)}`;
      fb.innerHTML = wrapFeedback(`弧長是整個圓周的 \\(${icQTex(r, R0)}\\)，扇形面積也就是整個圓面積 \\(\\pi R^2\\) 的 \\(${icQTex(r, R0)}\\)；算出來剛好是 \\(\\pi R r\\)。最後別忘了加上底圓。`);
    }
    typeset([out, fb]);
  }

  [sR, sr, sH].forEach(s => s.addEventListener('input', draw));
  bindPickGroup(hbEl('c15-mode-group'), 'data-c15-mode', v => { mode = v; draw(); });
  drawWithFonts(draw);
}
