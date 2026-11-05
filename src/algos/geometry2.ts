// 計算幾何延伸：面積、凸包、線段交點、Voronoi、三角剖分、半平面交
import type { AlgoDef, Color, Panel, PlotPanel } from '../core/types';
import { Rec, cells, inText, rnd, table, text, vars } from '../core/helpers';
import { gcd } from '../core/extra';

const cat = 'geometry';
type Pt = [number, number];

const parsePts = (s: string): Pt[] => String(s).split(/[;\n]/).map((x) => x.trim().split(/[\s,]+/).map(Number)).filter((x) => x.length >= 2 && !isNaN(x[0]) && !isNaN(x[1])).map((x) => [x[0], x[1]] as Pt);
const randPts = (n: number, lo = 0, hi = 20) => Array.from({ length: n }, () => `${rnd.int(lo, hi)} ${rnd.int(lo, hi)}`).join('; ');
const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const seg = (a: Pt, b: Pt, color?: Color, dashed = false, width?: number) => ({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], color, dashed, width });
const P = (pts: Pt[], o: Partial<PlotPanel> = {}, colors: Record<number, Color | undefined> = {}, labels = true): PlotPanel => ({
  type: 'plot',
  square: true,
  ...o,
  points: [...pts.map(([x, y], i) => ({ x, y, color: colors[i], label: labels ? String(i) : undefined })), ...(o.points ?? [])],
});
const boundsOf = (pts: Pt[], pad = 1): [number, number, number, number] => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return [Math.min(...xs) - pad, Math.max(...xs) + pad, Math.min(...ys) - pad, Math.max(...ys) + pad];
};
const PAL: Color[] = ['active', 'path', 'visited', 'good', 'special', 'frontier', 'compare', 'swap'];
const r2 = (v: number) => { const x = +v.toFixed(2); return Math.abs(x) < 1e-9 ? 0 : x; };
const fp = (p: Pt) => `(${r2(p[0])}, ${r2(p[1])})`;
const signedArea = (poly: Pt[]) => poly.reduce((s, p, i) => { const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;

/** 閉線段是否相交（含端點接觸） */
function segsTouch(a: Pt, b: Pt, c: Pt, d: Pt) {
  const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
  const on = (p: Pt, q: Pt, x: Pt) => Math.min(p[0], q[0]) - 1e-9 <= x[0] && x[0] <= Math.max(p[0], q[0]) + 1e-9 && Math.min(p[1], q[1]) - 1e-9 <= x[1] && x[1] <= Math.max(p[1], q[1]) + 1e-9;
  if (((d1 > 1e-9 && d2 < -1e-9) || (d1 < -1e-9 && d2 > 1e-9)) && ((d3 > 1e-9 && d4 < -1e-9) || (d3 < -1e-9 && d4 > 1e-9))) return true;
  return (Math.abs(d1) <= 1e-9 && on(c, d, a)) || (Math.abs(d2) <= 1e-9 && on(c, d, b)) || (Math.abs(d3) <= 1e-9 && on(a, b, c)) || (Math.abs(d4) <= 1e-9 && on(a, b, d));
}
/** 找出多邊形中不相鄰卻相交的兩條邊；簡單多邊形回傳 null */
function selfCross(poly: Pt[]): [number, number] | null {
  const n = poly.length;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (j === i + 1 || (i === 0 && j === n - 1)) continue;
    if (segsTouch(poly[i], poly[(i + 1) % n], poly[j], poly[(j + 1) % n])) return [i, j];
  }
  return null;
}

// ---------------- 鞋帶公式 ----------------
const shoelace: AlgoDef = {
  id: 'shoelace', name: '鞋帶公式（多邊形面積）', en: 'Shoelace Formula', cat,
  desc: '依序走過簡單多邊形的頂點，把每條邊和原點組成的三角形有向面積 ½(xᵢyᵢ₊₁ − xᵢ₊₁yᵢ) 加總：逆時針經過的部分為正、倒退的部分為負，多邊形外的部分會互相抵消，剩下的就是面積。結果的正負號代表頂點順序：正為逆時針、負為順時針。只適用於邊不交叉的簡單多邊形；整數座標時另用 Pick 定理（A = I + B/2 − 1）驗證。',
  time: 'O(n)', space: 'O(1)',
  code: ['S = 0', 'for i = 0 .. n−1:', '  j = (i + 1) mod n', '  S += xᵢ·yⱼ − xⱼ·yᵢ      (原點、pᵢ、pⱼ 三角形的 2 倍有向面積)', 'A = S / 2', 'A > 0：逆時針；A < 0：順時針', '面積 = |A|（需為簡單多邊形）'],
  inputs: [inText('pts', '頂點（依序，x y 以 ; 分隔）', '1 1; 7 2; 9 6; 5 9; 4 5; 1 7', () => rnd.pick(['1 1; 7 2; 9 6; 5 9; 4 5; 1 7', '0 0; 6 0; 6 4; 3 2; 0 4', '2 1; 8 1; 8 7; 2 7', '1 1; 1 7; 9 6; 7 2', '0 0; 8 6; 8 0; 0 6']))],
  run({ pts }) {
    const r = new Rec();
    const S = parsePts(pts);
    const n = S.length;
    if (n < 3) throw new Error('至少需要 3 個頂點');
    const bd = boundsOf([...S, [0, 0]], 1);
    const tris: PlotPanel['polygons'] = [];
    const base = () => P(S, { bounds: bd, axes: true, polygons: [...tris!, { pts: S, color: 'default' }], points: [{ x: 0, y: 0, label: 'O', color: 'muted' }] });
    const bad = selfCross(S);
    r.snap(`多邊形 ${n} 個頂點${bad ? `；注意：邊 ${bad[0]}–${bad[0] + 1} 與邊 ${bad[1]}–${(bad[1] + 1) % n} 相交，不是簡單多邊形` : ''}`, [base()], 1);
    let sum = 0;
    const rows: (string | number)[][] = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const term = S[i][0] * S[j][1] - S[j][0] * S[i][1];
      sum += term;
      rows.push([`${i}→${j}`, `${S[i][0]}·${S[j][1]} − ${S[j][0]}·${S[i][1]}`, term, sum]);
      tris!.push({ pts: [[0, 0], S[i], S[j]], color: term >= 0 ? 'good' : 'bad', fill: true });
      r.snap(`邊 ${i}→${j}：${S[i][0]}·${S[j][1]} − ${S[j][0]}·${S[i][1]} = ${term}（${term >= 0 ? '逆時針，加上' : '順時針，扣掉'}綠/紅三角形），累計 ${sum}`, [base(), table(rows.slice(-8), { [`${Math.min(rows.length, 8) - 1},2`]: term >= 0 ? 'good' : 'bad' }, { colHeaders: ['邊', '計算', '項', '累計 S'] })], 4);
    }
    const A = sum / 2;
    const panels: Panel[] = [P(S, { bounds: bd, axes: true, polygons: [{ pts: S, color: 'done', fill: true }] }), vars({ 有向面積: A, 方向: A > 0 ? '逆時針' : A < 0 ? '順時針' : '退化', 面積: Math.abs(A) }, undefined, { 面積: 'done' })];
    let pick = '';
    if (!bad && S.every((p) => Number.isInteger(p[0]) && Number.isInteger(p[1])) && bd[1] - bd[0] <= 80 && bd[3] - bd[2] <= 80) {
      let B = 0;
      for (let i = 0; i < n; i++) { const q = S[(i + 1) % n]; B += gcd(Math.abs(q[0] - S[i][0]), Math.abs(q[1] - S[i][1])); }
      let I = 0;
      for (let x = Math.ceil(bd[0]); x <= bd[1]; x++) for (let y = Math.ceil(bd[2]); y <= bd[3]; y++) {
        let onB = false, inside = false;
        for (let i = 0, j = n - 1; i < n; j = i++) {
          const a = S[j], b = S[i];
          if (Math.abs(cross(a, b, [x, y])) < 1e-9 && Math.min(a[0], b[0]) <= x && x <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= y && y <= Math.max(a[1], b[1])) onB = true;
          if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
        }
        if (inside && !onB) I++;
      }
      pick = `；Pick 定理：內部格點 I = ${I}、邊上格點 B = ${B}，I + B/2 − 1 = ${I + B / 2 - 1}${I + B / 2 - 1 === Math.abs(A) ? '，相符' : '，不符！'}`;
    }
    r.snap(bad ? `S/2 = ${A}，但多邊形自我相交：交叉後的部分方向相反、會互相抵消，這個數字不是真正的面積` : `面積 = |S/2| = ${Math.abs(A)}，頂點為${A > 0 ? '逆' : '順'}時針排列${pick}`, panels, bad ? 7 : 6);
    return r.frames;
  },
};

// ---------------- 快速凸包 ----------------
function monotoneHull(S: Pt[]): Pt[] {
  const p = [...S].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const lo: Pt[] = [], up: Pt[] = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 1e-9) lo.pop(); lo.push(q); }
  for (const q of [...p].reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 1e-9) up.pop(); up.push(q); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}
const quickhull: AlgoDef = {
  id: 'quickhull', name: '快速凸包', en: 'Quickhull', cat,
  desc: '類似快速排序的分治凸包：最左與最右的點一定在凸包上，把其他點分成線段上方與下方兩組。對每一組找離線段最遠的點，它也一定在凸包上；落在這三點構成的三角形內的點不可能是凸包頂點，直接丟掉，再對三角形外的兩組遞迴。共線的點（剛好在凸包邊上）不算頂點，重複的點先合併。結果與單調鏈凸包比對。',
  time: '平均 O(n log n)，最差 O(n²)', space: 'O(n)',
  code: ['A = 最左點，B = 最右點（必在凸包上）', '上方點集 = A→B 左側的點；下方點集 = 右側的點', 'findHull(集合, P, Q):', '  if 集合為空: return', '  F = 離直線 PQ 最遠的點（必在凸包上）', '  三角形 PFQ 內的點丟掉', '  findHull(PF 外側的點, P, F)；findHull(FQ 外側的點, F, Q)', '凸包 = A + 上方結果 + B + 下方結果'],
  inputs: [inText('pts', '點（x y，以 ; 分隔）', '3 1; 7 2; 10 5; 6 4; 2 6; 5 7; 8 9; 1 3; 4 4; 9 7; 6 10; 3 9; 7 6; 5 5', () => randPts(rnd.int(8, 16)))],
  run({ pts }) {
    const r = new Rec();
    const raw = parsePts(pts);
    const S = raw.filter((p, i) => raw.findIndex((q) => q[0] === p[0] && q[1] === p[1]) === i);
    if (S.length < 3) throw new Error('至少需要 3 個不同的點');
    const bd = boundsOf(S);
    const status = new Map<number, Color>();
    const hullSegs: [Pt, Pt][] = [];
    const view = (o: Partial<PlotPanel> = {}, extra: Record<number, Color> = {}) => P(S, { bounds: bd, ...o, segments: [...hullSegs.map(([a, b]) => seg(a, b, 'done', false, 2)), ...(o.segments ?? [])] }, { ...Object.fromEntries(status), ...extra });
    let A = 0, B = 0;
    S.forEach((p, i) => { if (p[0] < S[A][0] || (p[0] === S[A][0] && p[1] < S[A][1])) A = i; if (p[0] > S[B][0] || (p[0] === S[B][0] && p[1] > S[B][1])) B = i; });
    status.set(A, 'done'); status.set(B, 'done');
    const idx = S.map((_, i) => i).filter((i) => i !== A && i !== B);
    const upper = idx.filter((i) => cross(S[A], S[B], S[i]) > 1e-9), lower = idx.filter((i) => cross(S[A], S[B], S[i]) < -1e-9);
    idx.filter((i) => Math.abs(cross(S[A], S[B], S[i])) <= 1e-9).forEach((i) => status.set(i, 'muted'));
    r.snap(`最左點 ${A}、最右點 ${B} 一定在凸包上；上方 ${upper.length} 點、下方 ${lower.length} 點${raw.length > S.length ? `（合併了 ${raw.length - S.length} 個重複點）` : ''}`, [view({ segments: [seg(S[A], S[B], 'swap', true, 2)] }, { ...Object.fromEntries(upper.map((i) => [i, 'active' as Color])), ...Object.fromEntries(lower.map((i) => [i, 'frontier' as Color])) })], 2);
    const findHull = (set: number[], p: number, q: number, depth: number): number[] => {
      if (!set.length) { hullSegs.push([S[p], S[q]]); r.snap(`${p}→${q} 外側沒有點：這是一條凸包邊`, [view()], 4); return []; }
      let f = set[0];
      for (const i of set) if (cross(S[p], S[q], S[i]) > cross(S[p], S[q], S[f]) + 1e-12) f = i;
      status.set(f, 'done');
      const s1 = set.filter((i) => cross(S[p], S[f], S[i]) > 1e-9), s2 = set.filter((i) => cross(S[f], S[q], S[i]) > 1e-9);
      const gone = set.filter((i) => i !== f && !s1.includes(i) && !s2.includes(i));
      r.snap(`線段 ${p}→${q} 外側最遠的點是 ${f}（距離 ${r2(cross(S[p], S[q], S[f]) / Math.hypot(S[q][0] - S[p][0], S[q][1] - S[p][1]))}），必在凸包上`, [view({ segments: [seg(S[p], S[q], 'swap', true, 2)], polygons: [{ pts: [S[p], S[f], S[q]], color: 'special', fill: true }] }, { ...Object.fromEntries(set.map((i) => [i, 'compare' as Color])), [f]: 'swap' })], 5);
      gone.forEach((i) => status.set(i, 'muted'));
      if (gone.length) r.snap(`三角形 ${p}-${f}-${q} 內（或邊上）的 ${gone.length} 個點 ${gone.join(', ')} 不可能是凸包頂點，丟掉`, [view({ polygons: [{ pts: [S[p], S[f], S[q]], color: 'special', fill: true }] }, Object.fromEntries(gone.map((i) => [i, 'bad' as Color])))], 6);
      return [...findHull(s1, p, f, depth + 1), f, ...findHull(s2, f, q, depth + 1)];
    };
    const up = findHull(upper, A, B, 0);
    const down = findHull(lower, B, A, 0);
    const hull = [A, ...up, B, ...down].reverse();
    const ref = monotoneHull(S);
    const same = ref.length === hull.length && ref.every((p) => hull.some((i) => S[i][0] === p[0] && S[i][1] === p[1]));
    r.snap(`凸包 ${hull.length} 個頂點（逆時針）：${hull.join(' → ')}；與單調鏈凸包${same ? '相同' : '不同！'}`, [P(S, { bounds: bd, polygons: [{ pts: hull.map((i) => S[i]), color: 'done', fill: true }] }, Object.fromEntries(hull.map((i) => [i, 'done' as Color])))], 8);
    return r.frames;
  },
};

// ---------------- Bentley–Ottmann ----------------
type Seg = { a: Pt; b: Pt; id: number };
const segX = (s: Seg, t: Seg): Pt | null => {
  const [x1, y1] = s.a, [x2, y2] = s.b, [x3, y3] = t.a, [x4, y4] = t.b;
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (Math.abs(d) < 1e-12) return null;
  const u = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d, v = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  if (u < -1e-9 || u > 1 + 1e-9 || v < -1e-9 || v > 1 + 1e-9) return null;
  return [x1 + u * (x2 - x1), y1 + u * (y2 - y1)];
};
/** 隨機線段：不垂直、彼此不共線重疊（符合本頁政策） */
const randSegs = () => {
  const out: Pt[][] = [];
  const k = rnd.int(4, 7);
  while (out.length < k) {
    const a: Pt = [rnd.int(0, 12), rnd.int(0, 12)], b: Pt = [rnd.int(0, 12), rnd.int(0, 12)];
    if (a[0] === b[0]) continue;
    if (out.some(([c, d]) => Math.abs(cross(a, b, c)) < 1e-9 && Math.abs(cross(a, b, d)) < 1e-9)) continue;
    out.push([a, b]);
  }
  return out.map(([a, b]) => `${a[0]} ${a[1]} ${b[0]} ${b[1]}`).join('; ');
};
const ptKey = (p: Pt) => `${Math.round(p[0] * 1e6)},${Math.round(p[1] * 1e6)}`;
const bentley: AlgoDef = {
  id: 'bentley-ottmann', name: 'Bentley–Ottmann 線段交點', en: 'Bentley–Ottmann Sweep', cat,
  desc: '一條垂直掃描線由左往右移動，只在「事件點」停下：線段左端點（插入）、右端點（刪除）、已發現的交點（交換上下順序）。掃描線上的線段依 y 由下而上維持有序（實作上用平衡 BST，這裡以清單顯示）。關鍵觀察：兩條線段相交前，必定在掃描線上相鄰，因此每次順序改變只要檢查新出現的相鄰對。明訂政策：不接受垂直線段與重疊共線線段；多條線段交於同一點時，該點只回報一次並列出所有經過的線段；共用端點也算交點。結果與 O(n²) 暴力比對。',
  time: 'O((n + k) log n)，k 為交點數', space: 'O(n + k)',
  code: ['事件佇列 Q = 所有端點（依 x、再依 y 排序）', 'status = 空（依掃描線上的 y 排序）', 'while Q 不空: 取出最左的事件 e', '  左端點：插入 s，檢查 s 與上下鄰居', '  右端點：刪除 s，檢查原本的上下鄰居是否相交', '  交點：回報；經過此點的線段在 status 中反轉順序', '  新相鄰的一對若在掃描線右側相交 → 加入 Q', '政策：無垂直／重疊線段；同點多線只回報一次'],
  inputs: [inText('segs', '線段（x1 y1 x2 y2，以 ; 分隔）', '1 2 9 8; 1 7 8 1; 3 1 10 6; 2 9 11 3; 4 5 12 5; 6 8 12 9', randSegs)],
  run({ segs }) {
    const r = new Rec();
    const rows = String(segs).split(/[;\n]/).map((s) => s.trim()).filter(Boolean).map((s) => s.split(/[\s,]+/).map(Number));
    if (rows.some((x) => x.length !== 4 || x.some((v) => !Number.isFinite(v)))) throw new Error('每條線段需要 4 個數字 x1 y1 x2 y2');
    if (rows.length < 2 || rows.length > 12) throw new Error('需要 2 到 12 條線段');
    const L: Seg[] = rows.map(([x1, y1, x2, y2], id) => {
      if (x1 === x2) throw new Error(`線段 ${id} 是垂直線段：本頁的政策不接受垂直線段（可先把座標稍微旋轉）`);
      return x1 < x2 ? { a: [x1, y1], b: [x2, y2], id } : { a: [x2, y2], b: [x1, y1], id };
    });
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const s = L[i], t = L[j];
      if (Math.abs(cross(s.a, s.b, t.a)) < 1e-9 && Math.abs(cross(s.a, s.b, t.b)) < 1e-9 && Math.min(s.b[0], t.b[0]) > Math.max(s.a[0], t.a[0]) + 1e-9) throw new Error(`線段 ${i} 與 ${j} 共線且重疊：本頁的政策不接受重疊線段（交點有無限多個）`);
    }
    const yAt = (s: Seg, x: number) => s.a[1] + ((s.b[1] - s.a[1]) * (x - s.a[0])) / (s.b[0] - s.a[0]);
    const all = L.flatMap((s) => [s.a, s.b]);
    const bd = boundsOf(all, 1);
    const delta = (bd[1] - bd[0]) * 1e-7;
    type Ev = { x: number; y: number; kind: 0 | 1 | 2; s?: number };
    const rank = { 0: 1, 1: 0, 2: 2 } as const;
    const Q: Ev[] = L.flatMap((s) => [{ x: s.a[0], y: s.a[1], kind: 0 as const, s: s.id }, { x: s.b[0], y: s.b[1], kind: 2 as const, s: s.id }]);
    const sortQ = () => Q.sort((p, q) => p.x - q.x || p.y - q.y || rank[p.kind] - rank[q.kind]);
    const queued = new Set<string>();
    const found: { p: Pt; segs: number[] }[] = [];
    let status: number[] = [];
    let state: ('wait' | 'on' | 'off')[] = L.map(() => 'wait');
    const reorder = (x: number) => { status.sort((i, j) => yAt(L[i], x + delta) - yAt(L[j], x + delta)); };
    const view = (x: number, hl: number[] = [], hp?: Pt): Panel[] => [
      { type: 'plot', square: true, bounds: bd, segments: [...L.map((s) => seg(s.a, s.b, hl.includes(s.id) ? 'swap' : state[s.id] === 'on' ? 'active' : state[s.id] === 'off' ? 'muted' : 'default', false, hl.includes(s.id) ? 3 : 2)), seg([x, bd[2]], [x, bd[3]], 'bad', true, 1)], points: [...L.map((s) => ({ x: s.a[0], y: s.a[1], label: String(s.id), r: 3, color: 'muted' as Color })), ...found.map((f) => ({ x: f.p[0], y: f.p[1], r: 5, color: 'done' as Color })), ...Q.filter((e) => e.kind === 1).map((e) => ({ x: e.x, y: e.y, r: 4, color: 'frontier' as Color })), ...(hp ? [{ x: hp[0], y: hp[1], r: 7, color: 'swap' as Color }] : [])], title: '紅虛線：掃描線；綠：已回報的交點；青：佇列中的交點事件' },
      cells(status.length ? [...status].reverse() : ['（空）'], {}, { title: 'status（上 → 下）', headers: false, w: 'half' }),
      cells(Q.slice(0, 6).map((e) => `${['左端', '交點', '右端'][e.kind]}${e.s !== undefined ? ' ' + e.s : ''} @${fp([e.x, e.y])}`), {}, { title: '事件佇列（前 6 個）', headers: false, w: 'half' }),
    ];
    const checkPairs = (x: number, y: number, before: Set<string>) => {
      const added: string[] = [];
      for (let k = 0; k + 1 < status.length; k++) {
        const i = status[k], j = status[k + 1];
        const pk = `${Math.min(i, j)}-${Math.max(i, j)}`;
        if (before.has(pk)) continue;
        const p = segX(L[i], L[j]);
        if (!p || p[0] < x - 1e-9 || (Math.abs(p[0] - x) <= 1e-9 && p[1] < y - 1e-9)) continue;
        const key = ptKey(p);
        if (queued.has(key)) continue;
        queued.add(key);
        Q.push({ x: p[0], y: p[1], kind: 1 });
        added.push(`${i} 與 ${j} 在 ${fp(p)}`);
      }
      sortQ();
      return added;
    };
    const pairs = () => new Set(status.slice(0, -1).map((i, k) => `${Math.min(i, status[k + 1])}-${Math.max(i, status[k + 1])}`));
    sortQ();
    r.snap(`${L.length} 條線段的 ${2 * L.length} 個端點放進事件佇列`, view(bd[0]), 1);
    let guard = 0;
    while (Q.length && guard++ < 400) {
      const e = Q.shift()!;
      const before = pairs();
      if (e.kind === 0) {
        state[e.s!] = 'on';
        status.push(e.s!);
        reorder(e.x);
        const added = checkPairs(e.x, e.y, before);
        r.snap(`左端點：插入線段 ${e.s}${added.length ? `；新相鄰的 ${added.join('、')} 相交 → 加入佇列` : '；新鄰居沒有在右側相交'}`, view(e.x, [e.s!]), added.length ? 7 : 4);
      } else if (e.kind === 2) {
        state[e.s!] = 'off';
        status = status.filter((i) => i !== e.s);
        const added = checkPairs(e.x, e.y, before);
        r.snap(`右端點：刪除線段 ${e.s}${added.length ? `；原本的上下鄰居變成相鄰，${added.join('、')} 相交 → 加入佇列` : ''}`, view(e.x, [e.s!]), added.length ? 7 : 5);
      } else {
        const p: Pt = [e.x, e.y];
        const through = L.filter((s) => s.a[0] - 1e-9 <= p[0] && p[0] <= s.b[0] + 1e-9 && Math.abs(yAt(s, p[0]) - p[1]) < 1e-7).map((s) => s.id);
        found.push({ p, segs: through });
        reorder(e.x);
        const added = checkPairs(e.x, e.y, before);
        r.snap(`交點 ${fp(p)}：線段 ${through.join('、')} 經過此點${through.length > 2 ? '（同點多線，只回報一次）' : ''}，在 status 中交換順序${added.length ? `；新相鄰 ${added.join('、')} → 加入佇列` : ''}`, view(e.x, through, p), 6);
      }
    }
    const brute = new Set<string>();
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const p = segX(L[i], L[j]); if (p) brute.add(ptKey(p)); }
    const mine = new Set(found.map((f) => ptKey(f.p)));
    const same = brute.size === mine.size && [...brute].every((k) => mine.has(k));
    state = L.map(() => 'off');
    r.snap(`掃描完成：共 ${found.length} 個交點；O(n²) 暴力比對 ${brute.size} 個，${same ? '結果相同' : '結果不同！'}`, [...view(bd[1]).slice(0, 1), text(found.map((f) => `${fp(f.p)}：線段 ${f.segs.join('、')}`), '交點列表')], 3);
    return r.frames;
  },
};

// ---------------- Fortune Voronoi ----------------
function clipBy(poly: Pt[], a: Pt, b: Pt): Pt[] {
  const out: Pt[] = [];
  const inside = (p: Pt) => cross(a, b, p) >= -1e-9;
  const inter = (p: Pt, q: Pt): Pt => {
    const A1 = q[1] - p[1], B1 = p[0] - q[0], C1 = A1 * p[0] + B1 * p[1];
    const A2 = b[1] - a[1], B2 = a[0] - b[0], C2 = A2 * a[0] + B2 * a[1];
    const det = A1 * B2 - A2 * B1;
    return [(B2 * C1 - B1 * C2) / det, (A1 * C2 - A2 * C1) / det];
  };
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i], prev = poly[(i + poly.length - 1) % poly.length];
    if (inside(cur)) { if (!inside(prev)) out.push(inter(prev, cur)); out.push(cur); }
    else if (inside(prev)) out.push(inter(prev, cur));
  }
  return out;
}
const circum = (a: Pt, b: Pt, c: Pt) => {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-12) return null;
  const ux = ((a[0] ** 2 + a[1] ** 2) * (b[1] - c[1]) + (b[0] ** 2 + b[1] ** 2) * (c[1] - a[1]) + (c[0] ** 2 + c[1] ** 2) * (a[1] - b[1])) / d;
  const uy = ((a[0] ** 2 + a[1] ** 2) * (c[0] - b[0]) + (b[0] ** 2 + b[1] ** 2) * (a[0] - c[0]) + (c[0] ** 2 + c[1] ** 2) * (b[0] - a[0])) / d;
  return { x: ux, y: uy, r: Math.hypot(a[0] - ux, a[1] - uy) };
};
const fortune: AlgoDef = {
  id: 'fortune-voronoi', name: 'Fortune Voronoi 建構', en: "Fortune's Sweep Line Algorithm", cat,
  desc: '水平掃描線由上往下移動。到掃描線與到站點等距的點構成拋物線，所有已掃過站點的拋物線下包絡稱為「海灘線」，它上方的 Voronoi 圖已經確定。海灘線的斷點沿著 Voronoi 邊移動。兩種事件：站點事件——新站點把正上方的弧切開，插入一段新弧；圓事件——相鄰三段弧的兩個斷點會合，中間的弧消失，會合點就是 Voronoi 頂點（三站點的外接圓圓心，事件發生在圓的最低點）。新站點插入時，原本預定的圓事件可能失效，必須取消。最後與既有的「逐一裁切」版本對照頂點。',
  time: 'O(n log n)（本頁用陣列存海灘線，為 O(n²)）', space: 'O(n)',
  code: ['事件佇列 = 所有站點（依 y 由大到小）', 'while 佇列不空: 取出 y 最大的事件（掃描線移到此處）', '  站點事件 p：找到 p 正上方的弧 a，切成 a, p, a', '    取消 a 原本的圓事件（失效）', '    檢查新的相鄰三弧，若斷點會合 → 加入圓事件（圓的最低點）', '  圓事件（弧 b 消失）：記錄 Voronoi 頂點 = 外接圓圓心', '    刪除弧 b，取消左右弧的圓事件，檢查新的相鄰三弧', '海灘線上方的圖已確定；結束後與裁切版本對照'],
  inputs: [inText('pts', '站點（x y，以 ; 分隔）', '3 3; 12 4; 7 9; 2 13; 15 12; 10 16; 17 7', () => randPts(rnd.int(4, 8), 1, 19))],
  run({ pts }) {
    const r = new Rec();
    const raw = parsePts(pts);
    const S0 = raw.filter((p, i) => raw.findIndex((q) => q[0] === p[0] && q[1] === p[1]) === i);
    if (S0.length < 2 || S0.length > 10) throw new Error('需要 2 到 10 個不同的站點');
    // 同一高度的站點會讓拋物線退化：計算時把整體旋轉一個極小角度（約 0.06°，畫面上看不出差異）
    const rot = 1e-3, cx0 = S0.reduce((a, p) => a + p[0], 0) / S0.length, cy0 = S0.reduce((a, p) => a + p[1], 0) / S0.length;
    const S: Pt[] = S0.map(([x, y]) => [cx0 + (x - cx0) * Math.cos(rot) - (y - cy0) * Math.sin(rot), cy0 + (x - cx0) * Math.sin(rot) + (y - cy0) * Math.cos(rot)]);
    const bd = boundsOf(S0, 3);
    const box: Pt[] = [[bd[0], bd[2]], [bd[1], bd[2]], [bd[1], bd[3]], [bd[0], bd[3]]];
    const cellsV = S.map((p, i) => S.reduce((cell, q, j) => { if (i === j) return cell; const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, dx = q[0] - p[0], dy = q[1] - p[1]; const a: Pt = [mx + dy, my - dx], b: Pt = [mx - dy, my + dx]; return cross(a, b, p) >= 0 ? clipBy(cell, a, b) : clipBy(cell, b, a); }, box));
    const edges: [Pt, Pt][] = [];
    cellsV.forEach((c) => c.forEach((p, k) => { const q = c[(k + 1) % c.length]; const onBox = (u: Pt, v: Pt) => (Math.abs(u[0] - v[0]) < 1e-9 && (Math.abs(u[0] - bd[0]) < 1e-9 || Math.abs(u[0] - bd[1]) < 1e-9)) || (Math.abs(u[1] - v[1]) < 1e-9 && (Math.abs(u[1] - bd[2]) < 1e-9 || Math.abs(u[1] - bd[3]) < 1e-9)); if (!onBox(p, q) && !edges.some(([u, v]) => Math.hypot(u[0] - q[0], u[1] - q[1]) + Math.hypot(v[0] - p[0], v[1] - p[1]) < 1e-6)) edges.push([p, q]); }));
    const parab = (s: Pt, L: number, x: number) => (Math.abs(s[1] - L) < 1e-12 ? Infinity : ((x - s[0]) ** 2 + s[1] ** 2 - L * L) / (2 * (s[1] - L)));
    const breakX = (a: Pt, b: Pt, L: number) => {
      const da = 2 * (a[1] - L), db = 2 * (b[1] - L);
      if (Math.abs(da) < 1e-12) return a[0];
      if (Math.abs(db) < 1e-12) return b[0];
      const A = 1 / da - 1 / db, B = -2 * (a[0] / da - b[0] / db), C = (a[0] ** 2 + a[1] ** 2 - L * L) / da - (b[0] ** 2 + b[1] ** 2 - L * L) / db;
      if (Math.abs(A) < 1e-12) return -C / B;
      const disc = Math.sqrt(Math.max(0, B * B - 4 * A * C));
      const roots = [(-B - disc) / (2 * A), (-B + disc) / (2 * A)];
      const eps = 1e-6 * (1 + Math.abs(roots[0]) + Math.abs(roots[1]));
      return roots.find((x) => parab(a, L, x - eps) < parab(b, L, x - eps)) ?? roots[0];
    };
    type Arc = { site: number; id: number; ev: Ev | null };
    type Ev = { y: number; site?: number; arc?: Arc; c?: { x: number; y: number; r: number }; valid: boolean };
    let arcId = 0;
    const beach: Arc[] = [];
    const Q: Ev[] = S.map((p, i) => ({ y: p[1], site: i, valid: true }));
    const sortQ = () => Q.sort((a, b) => b.y - a.y || (a.site !== undefined ? -1 : 1));
    sortQ();
    const verts: { p: Pt; sites: number[] }[] = [];
    const processed = new Set<number>();
    let L = bd[3];
    const scale = bd[1] - bd[0];
    const view = (o: { circles?: PlotPanel['circles']; hl?: number[]; vtx?: Pt } = {}): Panel => {
      const xs = Array.from({ length: 181 }, (_, i) => bd[0] + ((bd[1] - bd[0]) * i) / 180);
      const beachY = (x: number) => Math.min(...[...processed].map((i) => parab(S[i], L, x)));
      const curvePts = processed.size ? xs.map((x) => [x, Math.min(beachY(x), bd[3] + 5)] as Pt) : [];
      const done: PlotPanel['segments'] = [];
      for (const [u, v] of edges) {
        const K = 30;
        let start: Pt | null = null;
        for (let k = 0; k <= K; k++) {
          const t = k / K, p: Pt = [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t];
          const ok = processed.size > 0 && p[1] >= beachY(p[0]) - 1e-9;
          if (ok && !start) start = p;
          if ((!ok || k === K) && start) { const end: Pt = ok ? p : [u[0] + (v[0] - u[0]) * ((k - 1) / K), u[1] + (v[1] - u[1]) * ((k - 1) / K)]; done!.push(seg(start, end, 'done', false, 2)); start = null; }
        }
      }
      return P(S0, { bounds: bd, curves: curvePts.length ? [{ pts: curvePts, color: 'active', width: 2 }] : [], segments: [...done!, seg([bd[0], L], [bd[1], L], 'bad', true, 1.5)], circles: o.circles ?? [], points: [...verts.map((v) => ({ x: v.p[0], y: v.p[1], r: 4, color: 'swap' as Color })), ...(o.vtx ? [{ x: o.vtx[0], y: o.vtx[1], r: 7, color: 'swap' as Color }] : [])], title: '藍：海灘線；紅虛線：掃描線；綠：已確定的 Voronoi 邊' }, Object.fromEntries([...(o.hl ?? []).map((i) => [i, 'special' as Color]), ...[...processed].filter((i) => !(o.hl ?? []).includes(i)).map((i) => [i, 'compare' as Color])]));
    };
    const beachCells = () => cells(beach.length ? beach.map((a) => a.site) : ['（空）'], {}, { title: '海灘線上的弧（左 → 右，數字為站點）', headers: false });
    const checkCircle = (k: number): string | null => {
      if (k < 1 || k + 1 >= beach.length) return null;
      const a = S[beach[k - 1].site], b = S[beach[k].site], c = S[beach[k + 1].site];
      if (beach[k - 1].site === beach[k + 1].site) return null;
      const cc = circum(a, b, c);
      if (!cc) return null;
      const yb = cc.y - cc.r;
      if (yb > L + 1e-9) return null;
      const tol = 1e-5 * scale;
      if (Math.abs(breakX(a, b, yb) - cc.x) > tol || Math.abs(breakX(b, c, yb) - cc.x) > tol) return null;
      const ev: Ev = { y: yb, arc: beach[k], c: cc, valid: true };
      beach[k].ev = ev;
      Q.push(ev);
      sortQ();
      return `弧 ${beach[k - 1].site}-${beach[k].site}-${beach[k + 1].site} 的斷點會合 → 圓事件（y = ${r2(yb)}）`;
    };
    const kill = (arc: Arc, why: string[]) => { if (arc.ev && arc.ev.valid) { arc.ev.valid = false; why.push(`弧 ${arc.site} 的圓事件失效（取消）`); return arc.ev.c!; } arc.ev = null; return null; };
    r.snap(`${S.length} 個站點依 y 由大到小放入事件佇列；掃描線從上方開始往下`, [view(), beachCells()], 1);
    let guard = 0;
    while (Q.length && guard++ < 200) {
      const e = Q.shift()!;
      if (!e.valid) continue;
      L = e.y;
      if (e.site !== undefined) {
        const p = e.site;
        const msgs: string[] = [];
        const killed: PlotPanel['circles'] = [];
        if (!beach.length) { beach.push({ site: p, id: arcId++, ev: null }); processed.add(p); r.snap(`站點事件 ${p}：海灘線還是空的，加入第一段弧`, [view({ hl: [p] }), beachCells()], 3); continue; }
        let k = 0;
        while (k + 1 < beach.length && breakX(S[beach[k].site], S[beach[k + 1].site], L) < S[p][0]) k++;
        const old = beach[k];
        const kc = kill(old, msgs);
        if (kc) killed!.push({ ...kc, color: 'bad' });
        beach.splice(k, 1, { site: old.site, id: arcId++, ev: null }, { site: p, id: arcId++, ev: null }, { site: old.site, id: arcId++, ev: null });
        processed.add(p);
        const c1 = checkCircle(k), c2 = checkCircle(k + 2);
        [c1, c2].forEach((m) => m && msgs.push(m));
        r.snap(`站點事件 ${p}：落在站點 ${old.site} 的弧正下方，把它切成 ${old.site}, ${p}, ${old.site}${msgs.length ? '；' + msgs.join('；') : ''}`, [view({ hl: [p, old.site], circles: [...killed!, ...[beach[k], beach[k + 2]].filter((a) => a.ev).map((a) => ({ ...a.ev!.c!, color: 'frontier' as Color }))] }), beachCells()], kc ? 4 : 5);
      } else {
        const arc = e.arc!;
        const k = beach.indexOf(arc);
        if (k < 1 || k + 1 >= beach.length) continue;
        const a = beach[k - 1], c = beach[k + 1];
        const v: Pt = [e.c!.x, e.c!.y];
        verts.push({ p: v, sites: [a.site, arc.site, c.site].sort((x, y) => x - y) });
        beach.splice(k, 1);
        const msgs: string[] = [];
        kill(a, msgs); kill(c, msgs);
        const m1 = checkCircle(k - 1), m2 = checkCircle(k);
        [m1, m2].forEach((m) => m && msgs.push(m));
        r.snap(`圓事件：站點 ${arc.site} 的弧縮成一點而消失，Voronoi 頂點 ${fp(v)}（站點 ${a.site}、${arc.site}、${c.site} 的外接圓圓心）${msgs.length ? '；' + msgs.join('；') : ''}`, [view({ hl: [a.site, arc.site, c.site], vtx: v, circles: [{ ...e.c!, color: 'swap' }] }), beachCells()], 6);
      }
    }
    L = bd[2] - (bd[3] - bd[2]) * 3;
    // 對照：裁切版的內部頂點（不在邊界框上）
    const refV: Pt[] = [];
    cellsV.forEach((c) => c.forEach((p) => { if (p[0] > bd[0] + 1e-6 && p[0] < bd[1] - 1e-6 && p[1] > bd[2] + 1e-6 && p[1] < bd[3] - 1e-6 && !refV.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-4)) refV.push(p); }));
    const uniq = verts.filter((v, i) => verts.findIndex((w) => Math.hypot(w.p[0] - v.p[0], w.p[1] - v.p[1]) < 1e-4) === i);
    const inBox = uniq.filter((v) => v.p[0] > bd[0] && v.p[0] < bd[1] && v.p[1] > bd[2] && v.p[1] < bd[3]);
    const match = inBox.length === refV.length && inBox.every((v) => refV.some((q) => Math.hypot(q[0] - v.p[0], q[1] - v.p[1]) < 1e-4));
    const empty = verts.every((v) => { const rr = Math.hypot(S[v.sites[0]][0] - v.p[0], S[v.sites[0]][1] - v.p[1]); return S.every((s) => Math.hypot(s[0] - v.p[0], s[1] - v.p[1]) >= rr - 1e-6); });
    r.snap(`掃描結束：Fortune 找到 ${verts.length} 個 Voronoi 頂點${uniq.length < verts.length ? `（四點以上共圓，有 ${verts.length - uniq.length} 個重合，不同的位置 ${uniq.length} 個）` : ''}，${inBox.length} 個在畫面內；裁切版畫面內頂點 ${refV.length} 個，${match ? '位置完全一致' : '不一致！'}；每個頂點的外接圓內都沒有其他站點：${empty ? '是' : '否'}`, [P(S0, { bounds: bd, polygons: cellsV.map((c, k) => ({ pts: c, color: PAL[k % PAL.length], fill: true })), points: verts.map((v) => ({ x: v.p[0], y: v.p[1], r: 4, color: 'swap' as Color })) }), text(verts.map((v) => `${fp(v.p)}：站點 ${v.sites.join('、')}`), 'Voronoi 頂點')], 8);
    return r.frames;
  },
};

// ---------------- 耳切法 ----------------
const earClipping: AlgoDef = {
  id: 'ear-clipping', name: '耳切法三角剖分', en: 'Ear Clipping Triangulation', cat,
  desc: '簡單多邊形（無洞）至少有兩個「耳朵」：一個凸頂點，它和兩個鄰居構成的三角形內沒有其他頂點。把耳朵切下來成為一個三角形，剩下的仍是簡單多邊形，重複直到只剩三角形。n 個頂點恰好得到 n − 2 個三角形，面積總和等於鞋帶公式的面積。頂點若為順時針先反轉成逆時針；自我相交的多邊形不適用。',
  time: 'O(n²)（每次找耳朵 O(n)，每次檢查 O(n) 時為 O(n³)）', space: 'O(n)',
  code: ['確保頂點為逆時針（有向面積 > 0）', 'V = 頂點清單', 'while |V| > 3:', '  for V 中每個頂點 i（前一個 p、後一個 q）:', '    if cross(p, i, q) <= 0: 凹頂點，不是耳朵', '    if 有其他頂點落在三角形 p-i-q 內: 不是耳朵', '    否則：輸出三角形 (p, i, q)，從 V 刪除 i；break', '輸出最後的三角形；共 n − 2 個'],
  inputs: [inText('pts', '頂點（依序，x y 以 ; 分隔）', '0 0; 8 0; 8 6; 5 3; 3 7; 1 4', () => rnd.pick(['0 0; 8 0; 8 6; 5 3; 3 7; 1 4', '0 0; 10 0; 10 8; 7 8; 7 3; 3 3; 3 8; 0 8', '2 0; 6 2; 10 0; 9 5; 12 8; 6 7; 0 9; 3 5', '0 0; 4 6; 8 0; 8 8; 0 8', '1 1; 9 1; 5 3; 9 9; 1 9; 4 5']))],
  run({ pts }) {
    const r = new Rec();
    let S = parsePts(pts);
    const n = S.length;
    if (n < 3) throw new Error('至少需要 3 個頂點');
    const sc = selfCross(S);
    if (sc) throw new Error(`邊 ${sc[0]} 與邊 ${sc[1]} 相交：耳切法只適用於簡單（不自我相交）的多邊形`);
    const area = signedArea(S);
    if (Math.abs(area) < 1e-12) throw new Error('多邊形面積為 0（所有點共線）');
    const label = S.map((_, i) => i);
    if (area < 0) { S = [...S].reverse(); label.reverse(); }
    const bd = boundsOf(S);
    const tris: number[][] = [];
    let V = S.map((_, i) => i);
    const view = (o: { cand?: number[]; color?: Color; inside?: number } = {}) => P(S, {
      bounds: bd,
      polygons: [...tris.map((t, k) => ({ pts: t.map((i) => S[i]), color: PAL[k % PAL.length], fill: true })), { pts: V.map((i) => S[i]), color: 'default' }, ...(o.cand ? [{ pts: o.cand.map((i) => S[i]), color: o.color ?? 'compare', fill: true }] : [])],
      points: S.map(([x, y], i) => ({ x, y, label: String(label[i]), r: 4, color: (i === o.inside ? 'bad' : V.includes(i) ? 'active' : 'muted') as Color })),
    }, {}, false);
    r.snap(`${n} 個頂點${area < 0 ? '原本是順時針，先反轉成逆時針' : '為逆時針'}；預期得到 ${n - 2} 個三角形`, [view()], 1);
    let guard = 0;
    while (V.length > 3 && guard++ < 200) {
      let clipped = false;
      for (let k = 0; k < V.length; k++) {
        const p = V[(k + V.length - 1) % V.length], i = V[k], q = V[(k + 1) % V.length];
        const cr = cross(S[p], S[i], S[q]);
        if (cr <= 1e-12) { r.snap(`頂點 ${label[i]}：內角 ≥ 180°（凹頂點），不是耳朵`, [view({ cand: [p, i, q], color: 'bad' })], 5); continue; }
        const inside = V.find((j) => j !== p && j !== i && j !== q && cross(S[p], S[i], S[j]) >= -1e-12 && cross(S[i], S[q], S[j]) >= -1e-12 && cross(S[q], S[p], S[j]) >= -1e-12);
        if (inside !== undefined) { r.snap(`頂點 ${label[i]}：是凸的，但頂點 ${label[inside]} 落在三角形 ${label[p]}-${label[i]}-${label[q]} 內，不是耳朵`, [view({ cand: [p, i, q], color: 'bad', inside })], 6); continue; }
        tris.push([p, i, q]);
        V = V.filter((x) => x !== i);
        r.snap(`頂點 ${label[i]} 是耳朵：切下三角形 ${label[p]}-${label[i]}-${label[q]}（第 ${tris.length} 個）`, [view()], 7);
        clipped = true;
        break;
      }
      if (!clipped) throw new Error('找不到耳朵：輸入可能有重複或共線的頂點');
    }
    tris.push([...V]);
    V = [];
    const sumA = tris.reduce((s, t) => s + Math.abs(signedArea(t.map((i) => S[i]))), 0);
    r.snap(`剩下的三角形 ${tris[tris.length - 1].map((i) => label[i]).join('-')} 直接輸出；共 ${tris.length} 個三角形（n − 2 = ${n - 2}），面積總和 ${r2(sumA)} = 鞋帶公式 ${r2(Math.abs(area))}`, [view(), text(tris.map((t, k) => `${k + 1}. ${t.map((i) => label[i]).join('-')}`), '三角形')], 8);
    return r.frames;
  },
};

// ---------------- 半平面交 ----------------
type HP = { p: Pt; d: Pt; label: string; box?: boolean };
const hpOut = (h: HP, x: Pt) => h.d[0] * (x[1] - h.p[1]) - h.d[1] * (x[0] - h.p[0]) < -1e-9;
const hpInter = (s: HP, t: HP): Pt => {
  const alpha = ((t.p[0] - s.p[0]) * t.d[1] - (t.p[1] - s.p[1]) * t.d[0]) / (s.d[0] * t.d[1] - s.d[1] * t.d[0]);
  return [s.p[0] + s.d[0] * alpha, s.p[1] + s.d[1] * alpha];
};
const halfPlane: AlgoDef = {
  id: 'half-plane-intersection', name: '半平面交', en: 'Half-plane Intersection (Sort + Deque)', cat,
  desc: '每個限制 a·x + b·y ≤ c 是一個半平面，它們的交集是凸多邊形（可能為空）。把邊界線依方向角排序，用雙端佇列維護目前的邊界：加入新的半平面時，若佇列尾端（或前端）兩條線的交點落在新半平面外面，那條線就不再是邊界，彈出。明訂政策：為了保證有界，演算法自動加入一個大方框（結果碰到方框代表原輸入無界）；同方向平行的只保留較嚴格的；反方向平行且互相排斥時交集為空。最後與「方框逐一裁切」的結果比較面積。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['每個限制轉成有向邊界線（可行側在左邊），再加上方框的 4 條', '依方向角排序；同方向只保留最內側的', 'for 每條線 h:', '  while 佇列尾端兩線交點在 h 外: pop_back', '  while 佇列前端兩線交點在 h 外: pop_front', '  若 h 與尾端反向平行 → 交集為空；push_back(h)', '最後用頭尾互相再修剪一次', '相鄰兩線的交點即為凸多邊形頂點；少於 3 條 → 空集合'],
  inputs: [inText('hp', '限制（每行 a b c，代表 a·x + b·y ≤ c）', '1 1 10\n-1 0 0\n0 -1 0\n1 -2 4\n-2 1 6\n1 0 7', () => { if (!rnd.int(0, 5)) return '1 0 2\n-1 0 -5\n0 1 5\n0 -1 0'; const cx = rnd.int(3, 8), cy = rnd.int(3, 8), k = rnd.int(4, 7), off = rnd.int(0, 359); return Array.from({ length: k }, (_, i) => { const t = ((off + (360 / k) * i + rnd.int(-15, 15)) * Math.PI) / 180; const a = Math.round(10 * Math.cos(t)), b = Math.round(10 * Math.sin(t)); return `${a} ${b} ${a * cx + b * cy + Math.round(Math.hypot(a, b) * rnd.int(2, 4))}`; }).join('\n'); }, true)],
  run({ hp }) {
    const r = new Rec();
    const rows = String(hp).split(/[;\n]/).map((s) => s.trim()).filter(Boolean).map((s) => s.split(/[\s,]+/).map(Number));
    if (!rows.length || rows.some((x) => x.length !== 3 || x.some((v) => !Number.isFinite(v)))) throw new Error('每行需要 3 個數字 a b c');
    if (rows.some(([a, b]) => a === 0 && b === 0)) throw new Error('a 與 b 不可同時為 0');
    const H: HP[] = rows.map(([a, b, c], i) => { const nn = a * a + b * b; return { p: [(a * c) / nn, (b * c) / nn], d: [-b, a], label: `${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)}y ≤ ${c}` + ` (#${i + 1})` }; });
    const M = Math.max(50, ...rows.map((x) => Math.abs(x[2]) / Math.hypot(x[0], x[1]))) * 4;
    const boxL: HP[] = [{ p: [M, -M], d: [0, 1], label: 'x ≤ M', box: true }, { p: [M, M], d: [-1, 0], label: 'y ≤ M', box: true }, { p: [-M, M], d: [0, -1], label: 'x ≥ −M', box: true }, { p: [-M, -M], d: [1, 0], label: 'y ≥ −M', box: true }];
    const all = [...H, ...boxL].map((h) => ({ ...h, ang: Math.atan2(h.d[1], h.d[0]) }));
    all.sort((a, b) => a.ang - b.ang);
    // 參考答案：大方框逐一裁切
    let clip: Pt[] = [[-M, -M], [M, -M], [M, M], [-M, M]];
    for (const h of H) {
      const out: Pt[] = [];
      for (let i = 0; i < clip.length; i++) {
        const cur = clip[i], prev = clip[(i + clip.length - 1) % clip.length];
        const ci = !hpOut(h, cur), pi = !hpOut(h, prev);
        const X = (u: Pt, v: Pt): Pt => { const fu = h.d[0] * (u[1] - h.p[1]) - h.d[1] * (u[0] - h.p[0]), fv = h.d[0] * (v[1] - h.p[1]) - h.d[1] * (v[0] - h.p[0]); const t = fu / (fu - fv); return [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t]; };
        if (ci) { if (!pi) out.push(X(prev, cur)); out.push(cur); } else if (pi) out.push(X(prev, cur));
      }
      clip = out;
    }
    const refArea = clip.length >= 3 ? Math.abs(signedArea(clip)) : 0;
    const refPts = clip.length >= 3 ? clip : [];
    const focus = refPts.length ? refPts.filter((p) => Math.abs(p[0]) < M * 0.99 && Math.abs(p[1]) < M * 0.99) : [];
    const span = focus.length ? focus : H.map((h) => h.p);
    const bd = boundsOf(span.length ? span : [[0, 0]], 3);
    const dq: (typeof all)[number][] = [];
    const lineSeg = (h: HP, color: Color, w = 1.5, dashed = true) => seg([h.p[0] - h.d[0] * 4 * M, h.p[1] - h.d[1] * 4 * M], [h.p[0] + h.d[0] * 4 * M, h.p[1] + h.d[1] * 4 * M], color, dashed, w);
    const view = (cur?: HP, hlPt?: Pt): Panel[] => {
      const chain: Pt[] = [];
      for (let i = 0; i + 1 < dq.length; i++) chain.push(hpInter(dq[i], dq[i + 1]));
      return [{ type: 'plot', square: true, axes: true, bounds: bd, segments: [...H.map((h) => lineSeg(h, 'muted', 1)), ...dq.filter((h) => !h.box).map((h) => lineSeg(h, 'active', 2, false)), ...(cur ? [lineSeg(cur, 'swap', 2.5, false)] : [])], curves: chain.length > 1 ? [{ pts: chain, color: 'done', width: 3 }] : [], points: [...chain.map(([x, y]) => ({ x, y, r: 4, color: 'done' as Color })), ...(hlPt ? [{ x: hlPt[0], y: hlPt[1], r: 7, color: 'bad' as Color }] : [])], title: '灰：所有邊界；藍：佇列中的邊界；綠：目前的邊界鏈' }, cells(dq.length ? dq.map((h) => (h.box ? '方框' : h.label.split('(#')[1].replace(')', '#'))) : ['（空）'], {}, { title: '雙端佇列（前 → 後）', headers: false })];
    };
    r.snap(`${H.length} 個限制轉成有向邊界線（可行側在左），加上大方框 ±${r2(M)} 的 4 條，依方向角排序`, [...view(), text(all.map((h) => `${r2((h.ang * 180) / Math.PI)}°  ${h.label}`), '排序後')], 2);
    let empty = false;
    for (const h of all) {
      while (dq.length >= 2 && hpOut(h, hpInter(dq[dq.length - 1], dq[dq.length - 2]))) { const x = hpInter(dq[dq.length - 1], dq[dq.length - 2]); r.snap(`尾端兩線的交點 ${fp(x)} 在 ${h.label} 外：彈出尾端`, view(h, x), 4); dq.pop(); }
      while (dq.length >= 2 && hpOut(h, hpInter(dq[0], dq[1]))) { const x = hpInter(dq[0], dq[1]); r.snap(`前端兩線的交點 ${fp(x)} 在 ${h.label} 外：彈出前端`, view(h, x), 5); dq.shift(); }
      const last = dq[dq.length - 1];
      if (last && Math.abs(h.d[0] * last.d[1] - h.d[1] * last.d[0]) < 1e-12) {
        if (h.d[0] * last.d[0] + h.d[1] * last.d[1] < 0) { empty = true; r.snap(`${h.label} 與 ${last.label} 反向平行，而且彼此排斥：交集為空`, view(h), 6); break; }
        if (hpOut(h, last.p)) { dq.pop(); r.snap(`${h.label} 與尾端同方向且更嚴格：取代它`, view(h), 2); }
        else { r.snap(`${h.label} 與尾端同方向但較寬鬆：跳過`, view(h), 2); continue; }
      }
      dq.push(h);
      r.snap(`加入 ${h.label}`, view(h), 6);
    }
    if (!empty) {
      while (dq.length >= 3 && hpOut(dq[0], hpInter(dq[dq.length - 1], dq[dq.length - 2]))) dq.pop();
      while (dq.length >= 3 && hpOut(dq[dq.length - 1], hpInter(dq[0], dq[1]))) dq.shift();
      if (dq.length < 3) empty = true;
    }
    if (empty) { r.snap(`交集為空（逐一裁切的面積 ${r2(refArea)}${refArea < 1e-9 ? '，同樣為空' : '，不一致！'}）`, [...view(), vars({ 結果: '空集合' }, undefined, { 結果: 'bad' })], 8); return r.frames; }
    const poly = dq.map((h, i) => hpInter(h, dq[(i + 1) % dq.length]));
    const area = Math.abs(signedArea(poly));
    const touches = dq.some((h) => h.box);
    r.snap(`頭尾互相修剪後得到 ${poly.length} 邊形，面積 ${r2(area)}；逐一裁切的面積 ${r2(refArea)}，${Math.abs(area - refArea) < 1e-6 * Math.max(1, refArea) ? '一致' : '不一致！'}${touches ? '。結果碰到方框：原本的限制圍不出有界區域' : ''}`, [{ type: 'plot', square: true, axes: true, bounds: bd, segments: H.map((h) => lineSeg(h, 'muted', 1)), polygons: [{ pts: poly, color: touches ? 'special' : 'done', fill: true }], points: poly.map(([x, y]) => ({ x, y, r: 4, color: 'done' as Color })) }, text(poly.map(fp), '頂點')], 8);
    return r.frames;
  },
};

export default [shoelace, quickhull, bentley, fortune, earClipping, halfPlane];
