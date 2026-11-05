import type { AlgoDef, Color, PlotPanel } from '../core/types';
import { Rec, vars, text, inText, rnd, cells } from '../core/helpers';

const cat = 'geometry';
type Pt = [number, number];

const parsePts = (s: string): Pt[] => String(s).split(/[;\n]/).map((x) => x.trim().split(/[\s,]+/).map(Number)).filter((x) => x.length >= 2 && !isNaN(x[0]) && !isNaN(x[1])).map((x) => [x[0], x[1]] as Pt);
const randPts = (n: number, lo = 0, hi = 20) => Array.from({ length: n }, () => `${rnd.int(lo, hi)} ${rnd.int(lo, hi)}`).join('; ');
const ptsIn = (def: string, n = 14, label = '點（x y，以 ; 分隔）') => inText('pts', label, def, () => randPts(n));
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

const orient: AlgoDef = {
  id: 'cross-product', name: '向量叉積與方向判斷', en: 'Cross Product & Orientation', cat,
  desc: '對三點 O、A、B，叉積 (A−O)×(B−O) = (Ax−Ox)(By−Oy) − (Ay−Oy)(Bx−Ox)。> 0 表示逆時針（B 在 OA 左側）、< 0 表示順時針、= 0 表示共線；其絕對值是平行四邊形面積。幾乎所有幾何演算法的基礎。',
  time: 'O(1)', space: 'O(1)',
  code: ['cross(O, A, B) = (A.x-O.x)(B.y-O.y) - (A.y-O.y)(B.x-O.x)', 'if cross > 0: 逆時針（左轉）', 'if cross < 0: 順時針（右轉）', 'if cross = 0: 共線'],
  inputs: [inText('o', '點 O', '2 2'), inText('a', '點 A', '8 4'), inText('b', '測試點 B（多個以 ; 分隔）', '4 8; 9 1; 5 3; 11 5', () => randPts(4, 0, 12))],
  run({ o, a, b }) {
    const r = new Rec();
    const O = parsePts(o)[0] ?? [0, 0], A = parsePts(a)[0] ?? [1, 0];
    const Bs = parsePts(b);
    const res: string[] = [];
    const all = [O, A, ...Bs];
    const bd = boundsOf(all, 2);
    r.snap('向量 OA', [{ type: 'plot', square: true, bounds: bd, axes: true, segments: [seg(O, A, 'active', false, 3)], points: [{ x: O[0], y: O[1], label: 'O', color: 'special' }, { x: A[0], y: A[1], label: 'A', color: 'active' }] }], 1);
    for (const [i, B] of Bs.entries()) {
      const c = cross(O, A, B);
      const kind = c > 0 ? '逆時針（左側）' : c < 0 ? '順時針（右側）' : '共線';
      const col: Color = c > 0 ? 'good' : c < 0 ? 'bad' : 'compare';
      res.push(`B${i} (${B.join(', ')})：cross = ${c} → ${kind}`);
      r.snap(`B${i}：(${A[0] - O[0]})(${B[1] - O[1]}) − (${A[1] - O[1]})(${B[0] - O[0]}) = ${c} → ${kind}`, [{ type: 'plot', square: true, bounds: bd, axes: true, polygons: [{ pts: [O, A, [A[0] + B[0] - O[0], A[1] + B[1] - O[1]], B], color: col, fill: true }], segments: [seg(O, A, 'active', false, 3), seg(O, B, col, false, 3)], points: [{ x: O[0], y: O[1], label: 'O', color: 'special' }, { x: A[0], y: A[1], label: 'A', color: 'active' }, ...Bs.map((p, k) => ({ x: p[0], y: p[1], label: 'B' + k, color: k === i ? col : 'muted' as Color }))] }, text(res, '結果（面積 = |cross|）')], c > 0 ? 2 : c < 0 ? 3 : 4);
    }
    return r.frames;
  },
};

const segInter: AlgoDef = {
  id: 'segment-intersection', name: '線段相交', en: 'Segment Intersection Test', cat,
  desc: '線段 AB 與 CD 相交，若且唯若 C、D 分別在 AB 兩側，且 A、B 分別在 CD 兩側（用叉積符號判斷）；若有叉積為 0，再檢查共線的點是否落在線段範圍內。',
  time: 'O(1)', space: 'O(1)',
  code: ['d1 = cross(C, D, A), d2 = cross(C, D, B)', 'd3 = cross(A, B, C), d4 = cross(A, B, D)', 'if d1·d2 < 0 and d3·d4 < 0: 相交', 'if 某 d = 0 且該點在另一線段的範圍內: 相交（端點接觸）', '否則不相交'],
  inputs: [inText('segs', '線段對（每行：x1 y1 x2 y2 x3 y3 x4 y4）', '1 1 9 7 2 8 8 2\n1 1 4 4 5 5 9 2\n2 2 8 2 5 2 5 7\n1 6 4 9 6 1 9 4', () => Array.from({ length: 4 }, () => rnd.arr(8, 0, 10).join(' ')).join('\n'), true)],
  run({ segs }) {
    const r = new Rec();
    const lines = String(segs).trim().split('\n').map((l) => l.trim().split(/\s+/).map(Number)).filter((x) => x.length === 8);
    const onSeg = (p: Pt, q: Pt, x: Pt) => Math.min(p[0], q[0]) <= x[0] && x[0] <= Math.max(p[0], q[0]) && Math.min(p[1], q[1]) <= x[1] && x[1] <= Math.max(p[1], q[1]);
    const res: string[] = [];
    for (const [i, v] of lines.entries()) {
      const A: Pt = [v[0], v[1]], B: Pt = [v[2], v[3]], C: Pt = [v[4], v[5]], D: Pt = [v[6], v[7]];
      const d1 = cross(C, D, A), d2 = cross(C, D, B), d3 = cross(A, B, C), d4 = cross(A, B, D);
      let hit = (d1 * d2 < 0 && d3 * d4 < 0);
      let why = hit ? '兩組叉積皆異號 → 相交' : '';
      if (!hit) {
        if (d1 === 0 && onSeg(C, D, A)) { hit = true; why = 'A 落在 CD 上'; }
        else if (d2 === 0 && onSeg(C, D, B)) { hit = true; why = 'B 落在 CD 上'; }
        else if (d3 === 0 && onSeg(A, B, C)) { hit = true; why = 'C 落在 AB 上'; }
        else if (d4 === 0 && onSeg(A, B, D)) { hit = true; why = 'D 落在 AB 上'; }
        else why = '同側 → 不相交';
      }
      res.push(`第 ${i + 1} 組：d1=${d1}, d2=${d2}, d3=${d3}, d4=${d4} → ${why}`);
      const col: Color = hit ? 'good' : 'bad';
      r.snap(`第 ${i + 1} 組：${why}`, [{ type: 'plot', square: true, bounds: [-1, 11, -1, 11], axes: true, segments: [seg(A, B, 'active', false, 3), seg(C, D, 'special', false, 3)], points: [{ x: A[0], y: A[1], label: 'A', color: 'active' }, { x: B[0], y: B[1], label: 'B', color: 'active' }, { x: C[0], y: C[1], label: 'C', color: 'special' }, { x: D[0], y: D[1], label: 'D', color: 'special' }] }, text(res, '結果'), vars({ 相交: hit ? '是' : '否' }, undefined, { 相交: col })], hit ? 3 : 5);
    }
    return r.frames;
  },
};

const pip: AlgoDef = {
  id: 'point-in-polygon', name: '點在多邊形內判定', en: 'Point in Polygon (Ray Casting)', cat,
  desc: '射線法：從測試點往右發射一條水平射線，計算與多邊形邊的交點數；奇數次在內部、偶數次在外部。對凹多邊形也成立。',
  time: 'O(n)', space: 'O(1)',
  code: ['inside = false', 'for 每條邊 (Pi, Pj):', '  if (Pi.y > y) != (Pj.y > y):', '    xCross = 邊與水平線 y 的交點 x', '    if x < xCross: inside = !inside', 'return inside'],
  inputs: [inText('poly', '多邊形頂點（依序）', '2 1; 9 2; 11 7; 7 5; 5 10; 1 7', () => rnd.pick(['2 1; 9 2; 11 7; 7 5; 5 10; 1 7', '1 1; 10 1; 10 10; 6 10; 6 4; 4 4; 4 10; 1 10', '5 1; 9 5; 5 9; 1 5'])), inText('q', '測試點（以 ; 分隔）', '5 4; 8 7; 3 8; 10 3', () => randPts(4, 0, 11))],
  run({ poly, q }) {
    const r = new Rec();
    const G = parsePts(poly), Q = parsePts(q);
    const res: string[] = [];
    const bd = boundsOf([...G, ...Q], 1);
    for (const [k, [x, y]] of Q.entries()) {
      let inside = false;
      const hits: { x: number; y: number; color: Color }[] = [];
      for (let i = 0, j = G.length - 1; i < G.length; j = i++) {
        const [xi, yi] = G[i], [xj, yj] = G[j];
        const base = { type: 'plot' as const, square: true, bounds: bd, polygons: [{ pts: G, color: 'active' as Color, fill: true }], segments: [seg([x, y], [bd[1], y], 'compare', true), seg(G[j], G[i], 'swap', false, 4)], points: [{ x, y, label: 'Q' + k, color: 'special' as Color }, ...hits] };
        if ((yi > y) !== (yj > y)) {
          const xc = ((xj - xi) * (y - yi)) / (yj - yi) + xi;
          if (x < xc) { inside = !inside; hits.push({ x: xc, y, color: 'bad' }); r.snap(`射線與邊 ${j}→${i} 相交於 x = ${+xc.toFixed(2)}，inside = ${inside}`, [{ ...base, points: [...base.points.slice(0, 1), ...hits] }, vars({ 交點數: hits.length, inside })], 5); }
          else r.snap(`邊 ${j}→${i} 與水平線的交點在測試點左側，不計`, [base, vars({ 交點數: hits.length, inside })], 4);
        }
      }
      res.push(`Q${k} (${x}, ${y})：交點 ${hits.length} 個 → ${inside ? '內部' : '外部'}`);
      r.snap(`Q${k}：交點數 ${hits.length}（${hits.length % 2 ? '奇' : '偶'}數）→ ${inside ? '在多邊形內' : '在多邊形外'}`, [{ type: 'plot', square: true, bounds: bd, polygons: [{ pts: G, color: 'active', fill: true }], segments: [seg([x, y], [bd[1], y], 'compare', true)], points: [{ x, y, label: 'Q' + k, color: inside ? 'good' : 'bad' }, ...hits] }, text(res, '結果')], 6);
    }
    return r.frames;
  },
};

const DEF_PTS = '3 1; 7 2; 10 5; 6 4; 2 6; 5 7; 8 9; 1 3; 4 4; 9 7; 6 10; 3 9; 7 6';

const graham: AlgoDef = {
  id: 'graham-scan', name: '凸包：葛立恆掃描', en: 'Convex Hull — Graham Scan', cat, star: true,
  desc: '選出最下方（再最左）的點為基準，其他點依極角排序。依序處理每個點：若堆疊頂端兩點與新點形成「右轉」（非逆時針），就彈出頂端，直到左轉為止再推入新點。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['p0 = y 最小（再 x 最小）的點', '其餘點依相對 p0 的極角排序', 'stack = [p0]', 'for p in 排序後的點:', '  while |stack| >= 2 and cross(next-to-top, top, p) <= 0:', '    stack.pop()  (右轉，不是凸包)', '  stack.push(p)', 'stack 即為凸包（逆時針）'],
  inputs: [ptsIn(DEF_PTS)],
  run({ pts }) {
    const r = new Rec();
    const S = parsePts(pts);
    const bd = boundsOf(S);
    let p0 = 0;
    S.forEach((p, i) => { if (p[1] < S[p0][1] || (p[1] === S[p0][1] && p[0] < S[p0][0])) p0 = i; });
    const order = S.map((_, i) => i).filter((i) => i !== p0).sort((a, b) => { const c = cross(S[p0], S[a], S[b]); return c ? -c : (S[a][0] - S[p0][0]) ** 2 + (S[a][1] - S[p0][1]) ** 2 - ((S[b][0] - S[p0][0]) ** 2 + (S[b][1] - S[p0][1]) ** 2); });
    r.snap(`基準點 p0 = ${p0}（最下方）`, [P(S, { bounds: bd }, { [p0]: 'special' })], 1);
    r.snap(`依極角排序：${order.join(', ')}`, [P(S, { bounds: bd, segments: order.map((i) => seg(S[p0], S[i], 'muted', true, 1)) }, { [p0]: 'special' })], 2);
    const st = [p0];
    const chain = () => st.slice(1).map((v, i) => seg(S[st[i]], S[v], 'active', false, 3));
    for (const i of order) {
      while (st.length >= 2 && cross(S[st[st.length - 2]], S[st[st.length - 1]], S[i]) <= 0) {
        const t = st[st.length - 1];
        r.snap(`${st[st.length - 2]} → ${t} → ${i} 是右轉（或共線），彈出 ${t}`, [P(S, { bounds: bd, segments: [...chain(), seg(S[t], S[i], 'bad', false, 3)] }, { ...Object.fromEntries(st.map((x) => [x, 'active'])), [t]: 'bad', [i]: 'compare' })], 6);
        st.pop();
      }
      st.push(i);
      r.snap(`推入 ${i}`, [P(S, { bounds: bd, segments: chain() }, { ...Object.fromEntries(st.map((x) => [x, 'active'])), [i]: 'compare' }), cells(st, {}, { title: '堆疊', headers: false })], 7);
    }
    r.snap(`凸包共 ${st.length} 個頂點：${st.join(' → ')}`, [P(S, { bounds: bd, polygons: [{ pts: st.map((i) => S[i]), color: 'done', fill: true }] }, Object.fromEntries(st.map((x) => [x, 'done'])))], 8);
    return r.frames;
  },
};

const monotone: AlgoDef = {
  id: 'monotone-chain', name: '凸包：單調鏈', en: 'Convex Hull — Andrew Monotone Chain', cat, star: true,
  desc: 'Andrew 演算法：點依 (x, y) 排序後，從左到右建立下凸包、再從右到左建立上凸包，兩者都用「非左轉就彈出」的規則。比 Graham 免去極角排序，數值上更穩定。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['依 (x, y) 排序', 'lower = []', 'for p in 點: 當 lower 末兩點與 p 非左轉時 pop；push(p)', 'upper = []', 'for p in 反序點: 當 upper 末兩點與 p 非左轉時 pop；push(p)', 'hull = lower[:-1] + upper[:-1]'],
  inputs: [ptsIn(DEF_PTS)],
  run({ pts }) {
    const r = new Rec();
    const S = parsePts(pts);
    const bd = boundsOf(S);
    const idx = S.map((_, i) => i).sort((a, b) => S[a][0] - S[b][0] || S[a][1] - S[b][1]);
    r.snap(`依 x 排序：${idx.join(', ')}`, [P(S, { bounds: bd })], 1);
    const build = (seq: number[], name: string, line: number, other: number[]) => {
      const h: number[] = [];
      const segs = () => [...other.slice(1).map((v, i) => seg(S[other[i]], S[v], 'done', false, 3)), ...h.slice(1).map((v, i) => seg(S[h[i]], S[v], 'active', false, 3))];
      for (const i of seq) {
        while (h.length >= 2 && cross(S[h[h.length - 2]], S[h[h.length - 1]], S[i]) <= 0) {
          const t = h.pop()!;
          r.snap(`${name}：${t} 造成非左轉，彈出`, [P(S, { bounds: bd, segments: [...segs(), seg(S[h[h.length - 1]], S[t], 'bad'), seg(S[t], S[i], 'bad')] }, { [t]: 'bad', [i]: 'compare' })], line);
        }
        h.push(i);
        r.snap(`${name}：推入 ${i}`, [P(S, { bounds: bd, segments: segs() }, { ...Object.fromEntries(h.map((x) => [x, 'active'])), [i]: 'compare' })], line);
      }
      return h;
    };
    const lower = build(idx, '下凸包', 3, []);
    const upper = build([...idx].reverse(), '上凸包', 5, lower);
    const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
    r.snap(`凸包共 ${hull.length} 個頂點：${hull.join(' → ')}`, [P(S, { bounds: bd, polygons: [{ pts: hull.map((i) => S[i]), color: 'done', fill: true }] }, Object.fromEntries(hull.map((x) => [x, 'done'])))], 6);
    return r.frames;
  },
};

const jarvis: AlgoDef = {
  id: 'jarvis-march', name: '凸包：禮物包裝法', en: 'Convex Hull — Gift Wrapping', cat, star: true,
  desc: '包禮物法：從最左點出發，每次在所有點中找出「最逆時針」的下一個點（所有其他點都在它右側），像用繩子包住點集一樣，直到回到起點。時間與凸包頂點數 h 成正比。',
  time: 'O(n · h)', space: 'O(h)',
  code: ['p = 最左點', 'repeat:', '  hull.push(p)', '  q = 任一其他點', '  for r in 點:', '    if cross(p, q, r) < 0: q = r  (r 更外側)', '  p = q', 'until p == 起點'],
  inputs: [ptsIn(DEF_PTS)],
  run({ pts }) {
    const r = new Rec();
    const S = parsePts(pts);
    const bd = boundsOf(S);
    let start = 0;
    S.forEach((p, i) => { if (p[0] < S[start][0] || (p[0] === S[start][0] && p[1] < S[start][1])) start = i; });
    const hull: number[] = [];
    let p = start;
    const segs = () => hull.slice(1).map((v, i) => seg(S[hull[i]], S[v], 'done', false, 3));
    do {
      hull.push(p);
      let q = (p + 1) % S.length;
      r.snap(`目前點 ${p}，候選 q = ${q}`, [P(S, { bounds: bd, segments: [...segs(), seg(S[p], S[q], 'active', false, 3)] }, { ...Object.fromEntries(hull.map((x) => [x, 'done'])), [p]: 'special', [q]: 'active' })], 4);
      for (let i = 0; i < S.length; i++) {
        if (i === p || i === q) continue;
        const c = cross(S[p], S[q], S[i]);
        const better = c < 0 || (c === 0 && (S[i][0] - S[p][0]) ** 2 + (S[i][1] - S[p][1]) ** 2 > (S[q][0] - S[p][0]) ** 2 + (S[q][1] - S[p][1]) ** 2);
        r.snap(better ? `${i} 在 ${p}→${q} 的右側（更外側），q = ${i}` : `${i} 在左側，保留 q = ${q}`, [P(S, { bounds: bd, segments: [...segs(), seg(S[p], S[q], 'active', false, 3), seg(S[p], S[i], better ? 'swap' : 'muted', true)] }, { ...Object.fromEntries(hull.map((x) => [x, 'done'])), [p]: 'special', [q]: 'active', [i]: 'compare' })], 6);
        if (better) q = i;
      }
      p = q;
    } while (p !== start && hull.length <= S.length);
    r.snap(`回到起點，凸包共 ${hull.length} 個頂點：${hull.join(' → ')}`, [P(S, { bounds: bd, polygons: [{ pts: hull.map((i) => S[i]), color: 'done', fill: true }] }, Object.fromEntries(hull.map((x) => [x, 'done'])))], 8);
    return r.frames;
  },
};

const closest: AlgoDef = {
  id: 'closest-pair', name: '最近點對', en: 'Closest Pair of Points (Divide & Conquer)', cat,
  desc: '依 x 排序後從中線分成兩半，遞迴求出兩邊的最小距離 δ；跨越中線的點對只需檢查中線兩側 δ 寬的帶狀區域內的點，且依 y 排序後每點只需和後面最多 7 個點比較。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['solve(P 依 x 排序):', '  if |P| <= 3: 暴力計算', '  mid = 中位數 x', '  δ = min(solve(左), solve(右))', '  strip = 與中線距離 < δ 的點（依 y 排序）', '  for p in strip: 與其後 y 差 < δ 的點比較', '  return 最小值'],
  inputs: [ptsIn('2 3; 12 30; 40 50; 5 1; 12 10; 3 4; 25 18; 33 8; 18 25; 45 22; 8 40; 30 35; 22 5', 14)],
  run({ pts }) {
    const r = new Rec();
    const S = parsePts(pts);
    const bd = boundsOf(S, 2);
    const dist = (a: number, b: number) => Math.hypot(S[a][0] - S[b][0], S[a][1] - S[b][1]);
    let best: [number, number, number] = [Infinity, -1, -1];
    const bestSeg = () => (best[1] >= 0 ? [seg(S[best[1]], S[best[2]], 'done', false, 3)] : []);
    const solve = (ids: number[], depth: number): number => {
      const lo = Math.min(...ids.map((i) => S[i][0])), hi = Math.max(...ids.map((i) => S[i][0]));
      const region = { pts: [[lo, bd[2]], [hi, bd[2]], [hi, bd[3]], [lo, bd[3]]] as Pt[], color: 'frontier' as Color, fill: true };
      if (ids.length <= 3) {
        for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
          const d = dist(ids[i], ids[j]);
          if (d < best[0]) best = [d, ids[i], ids[j]];
        }
        r.snap(`[深度 ${depth}] ${ids.length} 個點，暴力計算`, [P(S, { bounds: bd, polygons: [region], segments: bestSeg() }, Object.fromEntries(ids.map((i) => [i, 'active']))), vars({ δ: +best[0].toFixed(3) })], 2);
        return best[0];
      }
      const m = ids.length >> 1;
      const midX = S[ids[m]][0];
      r.snap(`[深度 ${depth}] 以 x = ${midX} 分割 ${ids.length} 個點`, [P(S, { bounds: bd, polygons: [region], segments: [seg([midX, bd[2]], [midX, bd[3]], 'special', true), ...bestSeg()] }, Object.fromEntries(ids.map((i, k) => [i, k < m ? 'active' : 'visited']))), vars({ δ: +best[0].toFixed(3) })], 3);
      solve(ids.slice(0, m), depth + 1);
      solve(ids.slice(m), depth + 1);
      const d = best[0];
      const strip = ids.filter((i) => Math.abs(S[i][0] - midX) < d).sort((a, b) => S[a][1] - S[b][1]);
      r.snap(`[深度 ${depth}] 合併：檢查中線兩側 δ = ${+d.toFixed(2)} 帶狀區域內的 ${strip.length} 個點`, [P(S, { bounds: bd, polygons: [{ pts: [[midX - d, bd[2]], [midX + d, bd[2]], [midX + d, bd[3]], [midX - d, bd[3]]], color: 'compare', fill: true }], segments: [seg([midX, bd[2]], [midX, bd[3]], 'special', true), ...bestSeg()] }, Object.fromEntries(strip.map((i) => [i, 'compare']))), vars({ δ: +best[0].toFixed(3) })], 5);
      for (let i = 0; i < strip.length; i++)
        for (let j = i + 1; j < strip.length && S[strip[j]][1] - S[strip[i]][1] < best[0]; j++) {
          const dd = dist(strip[i], strip[j]);
          if (dd < best[0]) { best = [dd, strip[i], strip[j]]; r.snap(`跨中線的點對 ${strip[i]}–${strip[j]} 距離 ${+dd.toFixed(3)} 更近！`, [P(S, { bounds: bd, segments: [seg([midX, bd[2]], [midX, bd[3]], 'special', true), ...bestSeg()] }, { [strip[i]]: 'done', [strip[j]]: 'done' }), vars({ δ: +best[0].toFixed(3) })], 6); }
        }
      return best[0];
    };
    solve(S.map((_, i) => i).sort((a, b) => S[a][0] - S[b][0]), 0);
    r.snap(`最近點對：${best[1]} 與 ${best[2]}，距離 ${+best[0].toFixed(3)}`, [P(S, { bounds: bd, segments: bestSeg() }, { [best[1]]: 'done', [best[2]]: 'done' })], 7);
    return r.frames;
  },
};

const sweep: AlgoDef = {
  id: 'sweep-line', name: '掃描線（矩形聯集面積）', en: 'Sweep Line — Area of Union of Rectangles', cat,
  desc: '一條垂直掃描線由左往右移動，事件為矩形的左右邊。相鄰兩個事件之間，掃描線被覆蓋的總長度不變，面積增加量 = 覆蓋長度 × x 差；遇到左邊加入區間、右邊移除區間。',
  time: 'O(n² log n)（線段樹可到 O(n log n)）', space: 'O(n)',
  code: ['events = 每個矩形的 (x1, +1, [y1,y2]) 與 (x2, -1, [y1,y2])', '依 x 排序', 'for 每個事件 e:', '  area += 目前覆蓋長度 × (e.x - 上一個 x)', '  加入或移除區間 [y1, y2]', '  重新計算覆蓋長度（合併重疊區間）'],
  inputs: [inText('rects', '矩形（x1 y1 x2 y2，以 ; 分隔）', '1 1 6 5; 3 3 9 8; 7 1 11 4; 2 6 5 10', () => Array.from({ length: rnd.int(3, 5) }, () => { const x = rnd.int(0, 8), y = rnd.int(0, 8); return `${x} ${y} ${x + rnd.int(2, 5)} ${y + rnd.int(2, 5)}`; }).join('; '))],
  run({ rects }) {
    const r = new Rec();
    const R = String(rects).split(';').map((x) => x.trim().split(/\s+/).map(Number)).filter((x) => x.length === 4).map(([a, b, c, d]) => [Math.min(a, c), Math.min(b, d), Math.max(a, c), Math.max(b, d)]);
    const ev = R.flatMap((q, i) => [{ x: q[0], t: 1, i }, { x: q[2], t: -1, i }]).sort((a, b) => a.x - b.x || b.t - a.t);
    const xs = R.flatMap((q) => [q[0], q[2]]), ys = R.flatMap((q) => [q[1], q[3]]);
    const bd: [number, number, number, number] = [Math.min(...xs) - 1, Math.max(...xs) + 1, Math.min(...ys) - 1, Math.max(...ys) + 1];
    const active = new Set<number>();
    const covered = () => {
      const iv = [...active].map((i) => [R[i][1], R[i][3]]).sort((a, b) => a[0] - b[0]);
      const merged: number[][] = [];
      for (const v of iv) { if (merged.length && v[0] <= merged[merged.length - 1][1]) merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], v[1]); else merged.push([...v]); }
      return merged;
    };
    let area = 0, lastX = ev[0]?.x ?? 0;
    const strips: Pt[][] = [];
    const view = (x: number, msg: string, line: number) => r.snap(msg, [{ type: 'plot', bounds: bd, square: true, axes: true, polygons: [...strips.map((pts) => ({ pts, color: 'done' as Color, fill: true })), ...R.map((q, i) => ({ pts: [[q[0], q[1]], [q[2], q[1]], [q[2], q[3]], [q[0], q[3]]] as Pt[], color: (active.has(i) ? 'active' : 'muted') as Color }))], segments: [seg([x, bd[2]], [x, bd[3]], 'bad', true, 2), ...covered().map(([a, b]) => seg([x, a], [x, b], 'swap', false, 5))] }, vars({ 面積: area, 覆蓋長度: covered().reduce((s, [a, b]) => s + b - a, 0) })], line);
    view(lastX, '事件依 x 排序，掃描線從左邊開始', 2);
    for (const e of ev) {
      const len = covered().reduce((s, [a, b]) => s + b - a, 0);
      if (e.x > lastX && len) {
        for (const [a, b] of covered()) strips.push([[lastX, a], [e.x, a], [e.x, b], [lastX, b]]);
        area += len * (e.x - lastX);
        view(e.x, `x 從 ${lastX} 到 ${e.x}：面積 += ${len} × ${e.x - lastX} = ${len * (e.x - lastX)}`, 4);
      }
      lastX = e.x;
      if (e.t === 1) active.add(e.i); else active.delete(e.i);
      view(e.x, `x = ${e.x}：矩形 ${e.i} 的${e.t === 1 ? '左邊，加入' : '右邊，移除'}區間 [${R[e.i][1]}, ${R[e.i][3]}]`, e.t === 1 ? 5 : 5);
    }
    view(lastX, `聯集總面積 = ${area}`, 6);
    return r.frames;
  },
};

const hullOf = (S: Pt[]) => {
  const idx = S.map((_, i) => i).sort((a, b) => S[a][0] - S[b][0] || S[a][1] - S[b][1]);
  const half = (seq: number[]) => { const h: number[] = []; for (const i of seq) { while (h.length >= 2 && cross(S[h[h.length - 2]], S[h[h.length - 1]], S[i]) <= 0) h.pop(); h.push(i); } return h; };
  return [...half(idx).slice(0, -1), ...half([...idx].reverse()).slice(0, -1)];
};

const calipers: AlgoDef = {
  id: 'rotating-calipers', name: '旋轉卡尺', en: 'Rotating Calipers (Diameter)', cat,
  desc: '求點集中最遠的兩點（直徑）：先求凸包，再讓一對平行的「卡尺」沿凸包旋轉。對每條邊找出距離它最遠的頂點（對蹄點），指標只會單調前進，總共 O(h)。',
  time: 'O(n log n)（凸包）+ O(h)', space: 'O(h)',
  code: ['H = convexHull(P)', 'j = 1', 'for i in 0 .. h-1  (邊 H[i]→H[i+1]):', '  while 三角形面積(H[i], H[i+1], H[j+1]) > (H[i], H[i+1], H[j]):', '    j = j + 1  (對蹄點前進)', '  更新 best = max(dist(H[i], H[j]), dist(H[i+1], H[j]))'],
  inputs: [ptsIn('3 1; 7 2; 10 5; 6 4; 2 6; 5 7; 8 9; 1 3; 4 4; 9 7; 6 10; 3 9; 7 6')],
  run({ pts }) {
    const r = new Rec();
    const S = parsePts(pts);
    const bd = boundsOf(S, 2);
    const H = hullOf(S);
    const h = H.length;
    const d2 = (a: number, b: number) => (S[a][0] - S[b][0]) ** 2 + (S[a][1] - S[b][1]) ** 2;
    const area = (a: number, b: number, c: number) => Math.abs(cross(S[a], S[b], S[c]));
    let best: [number, number, number] = [0, H[0], H[0]];
    const poly = { pts: H.map((i) => S[i]), color: 'active' as Color, fill: true };
    r.snap(`先求凸包（${h} 個頂點）`, [P(S, { bounds: bd, polygons: [poly] }, Object.fromEntries(H.map((x) => [x, 'active'])))], 1);
    let j = 1;
    for (let i = 0; i < h; i++) {
      const a = H[i], b = H[(i + 1) % h];
      while (area(a, b, H[(j + 1) % h]) > area(a, b, H[j % h])) j++;
      const c = H[j % h];
      for (const p of [a, b]) if (d2(p, c) > best[0]) best = [d2(p, c), p, c];
      // 畫出平行卡尺
      const dx = S[b][0] - S[a][0], dy = S[b][1] - S[a][1];
      const L = 30;
      r.snap(`邊 ${a}→${b} 的對蹄點為 ${c}；目前直徑 ${+Math.sqrt(best[0]).toFixed(3)}`, [P(S, { bounds: bd, polygons: [poly], segments: [seg([S[a][0] - dx * L, S[a][1] - dy * L], [S[a][0] + dx * L, S[a][1] + dy * L], 'special', true), seg([S[c][0] - dx * L, S[c][1] - dy * L], [S[c][0] + dx * L, S[c][1] + dy * L], 'special', true), seg(S[a], S[b], 'swap', false, 4), seg(S[best[1]], S[best[2]], 'done', false, 3)] }, { [a]: 'swap', [b]: 'swap', [c]: 'compare' }), vars({ 直徑: +Math.sqrt(best[0]).toFixed(3) })], 6);
    }
    r.snap(`最遠點對：${best[1]} 與 ${best[2]}，距離 ${+Math.sqrt(best[0]).toFixed(3)}`, [P(S, { bounds: bd, polygons: [poly], segments: [seg(S[best[1]], S[best[2]], 'done', false, 4)] }, { [best[1]]: 'done', [best[2]]: 'done' })]);
    return r.frames;
  },
};

/** Sutherland–Hodgman：用一條有向直線（左側保留）裁切多邊形 */
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

const clipping: AlgoDef = {
  id: 'polygon-clipping', name: '多邊形裁切', en: 'Polygon Clipping (Sutherland–Hodgman)', cat,
  desc: '用凸多邊形（裁切窗）裁切任意多邊形：依序以裁切窗的每一條邊當作半平面，走訪目前多邊形的每條邊，依「內→內、內→外、外→內、外→外」四種情況輸出頂點與交點。',
  time: 'O(n · m)', space: 'O(n + m)',
  code: ['output = subject', 'for 裁切窗的每條邊 (A, B):', '  input = output; output = []', '  for 邊 (prev, cur) in input:', '    cur 在內：若 prev 在外先加交點；再加 cur', '    cur 在外：若 prev 在內加交點', 'return output'],
  inputs: [inText('subj', '被裁切多邊形', '1 4; 5 11; 9 6; 13 10; 12 2; 6 0', () => randPts(rnd.int(5, 7), 0, 14)), inText('clip', '裁切窗（凸多邊形，逆時針）', '3 2; 11 2; 11 8; 3 8')],
  run({ subj, clip }) {
    const r = new Rec();
    let out = parsePts(subj);
    let C = parsePts(clip);
    let area = 0;
    for (let i = 0; i < C.length; i++) area += cross([0, 0], C[i], C[(i + 1) % C.length]);
    if (area < 0) C = C.reverse();
    const all = [...out, ...C];
    const bd = boundsOf(all, 1);
    r.snap('紫色為被裁切多邊形，藍色為裁切窗', [{ type: 'plot', square: true, bounds: bd, polygons: [{ pts: out, color: 'visited', fill: true }, { pts: C, color: 'active', dashed: true }] }], 1);
    for (let k = 0; k < C.length; k++) {
      const a = C[k], b = C[(k + 1) % C.length];
      out = clipBy(out, a, b);
      const dx = b[0] - a[0], dy = b[1] - a[1];
      r.snap(`以裁切窗第 ${k} 條邊所在的半平面裁切，剩 ${out.length} 個頂點`, [{ type: 'plot', square: true, bounds: bd, polygons: [{ pts: C, color: 'active', dashed: true }, ...(out.length ? [{ pts: out, color: 'visited' as Color, fill: true }] : [])], segments: [seg([a[0] - dx * 10, a[1] - dy * 10], [b[0] + dx * 10, b[1] + dy * 10], 'bad', false, 3)], points: out.map(([x, y]) => ({ x, y, color: 'compare' as Color, r: 4 })) }], 5);
    }
    r.snap(`裁切完成，結果有 ${out.length} 個頂點`, [{ type: 'plot', square: true, bounds: bd, polygons: [{ pts: C, color: 'active', dashed: true }, ...(out.length ? [{ pts: out, color: 'done' as Color, fill: true }] : [])] }], 7);
    return r.frames;
  },
};

const PAL: Color[] = ['active', 'path', 'visited', 'good', 'special', 'frontier', 'compare', 'swap'];

const voronoi: AlgoDef = {
  id: 'voronoi', name: '沃羅諾伊圖', en: 'Voronoi Diagram (Half-plane Intersection)', cat,
  desc: '每個站點的 Voronoi 區域 = 離它比離其他站點都近的所有點。對每個站點，從邊界框開始，依序用它與其他每個站點的「垂直平分線」裁掉較遠的那一半，剩下的凸多邊形就是它的區域。（Fortune 掃描線演算法可達 O(n log n)）',
  time: 'O(n² · n)（教學版）', space: 'O(n²)',
  code: ['for 每個站點 p:', '  cell = 邊界框', '  for 其他站點 q:', '    以 p、q 的垂直平分線裁切 cell（保留靠近 p 的一側）', '  cell 即為 p 的 Voronoi 區域'],
  inputs: [ptsIn('3 3; 12 4; 7 9; 2 13; 15 12; 10 16; 17 7', 8)],
  run({ pts }) {
    const r = new Rec();
    const S = parsePts(pts);
    const bd = boundsOf(S, 3);
    const box: Pt[] = [[bd[0], bd[2]], [bd[1], bd[2]], [bd[1], bd[3]], [bd[0], bd[3]]];
    const cells2: Pt[][] = [];
    for (let i = 0; i < S.length; i++) {
      let cell = box;
      for (let j = 0; j < S.length; j++) {
        if (i === j) continue;
        const mx = (S[i][0] + S[j][0]) / 2, my = (S[i][1] + S[j][1]) / 2;
        const dx = S[j][0] - S[i][0], dy = S[j][1] - S[i][1];
        // 平分線方向 (-dy, dx)，讓 S[i] 在左側
        const a: Pt = [mx + dy, my - dx], b: Pt = [mx - dy, my + dx];
        const A: Pt = cross(a, b, S[i]) >= 0 ? a : b, B: Pt = A === a ? b : a;
        cell = clipBy(cell, A, B);
        if (S.length <= 8) r.snap(`站點 ${i}：用與站點 ${j} 的垂直平分線裁切`, [P(S, { bounds: bd, polygons: [...cells2.map((c, k) => ({ pts: c, color: PAL[k % PAL.length], fill: true })), { pts: cell, color: PAL[i % PAL.length], fill: true }], segments: [seg([mx - dy * 5, my + dx * 5], [mx + dy * 5, my - dx * 5], 'bad', true, 2), seg(S[i], S[j], 'muted', true, 1)] }, { [i]: 'special', [j]: 'compare' })], 4);
      }
      cells2.push(cell);
      r.snap(`站點 ${i} 的 Voronoi 區域完成`, [P(S, { bounds: bd, polygons: cells2.map((c, k) => ({ pts: c, color: PAL[k % PAL.length], fill: true })) }, { [i]: 'special' })], 5);
    }
    r.snap('Voronoi 圖完成', [P(S, { bounds: bd, polygons: cells2.map((c, k) => ({ pts: c, color: PAL[k % PAL.length], fill: true })) })]);
    return r.frames;
  },
};

function circum(a: Pt, b: Pt, c: Pt) {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  const ux = ((a[0] ** 2 + a[1] ** 2) * (b[1] - c[1]) + (b[0] ** 2 + b[1] ** 2) * (c[1] - a[1]) + (c[0] ** 2 + c[1] ** 2) * (a[1] - b[1])) / d;
  const uy = ((a[0] ** 2 + a[1] ** 2) * (c[0] - b[0]) + (b[0] ** 2 + b[1] ** 2) * (a[0] - c[0]) + (c[0] ** 2 + c[1] ** 2) * (b[0] - a[0])) / d;
  return { x: ux, y: uy, r: Math.hypot(a[0] - ux, a[1] - uy) };
}

const delaunay: AlgoDef = {
  id: 'delaunay', name: '德勞內三角剖分', en: 'Delaunay Triangulation (Bowyer–Watson)', cat,
  desc: '使任何三角形的外接圓內都不包含其他點的三角剖分（最大化最小角）。Bowyer–Watson 增量法：先放一個包住所有點的超級三角形；每加入一點，刪除所有外接圓包含該點的「壞三角形」，再把形成的多邊形空洞連到新點。最後移除與超級三角形相連的三角形。它的對偶圖即 Voronoi 圖。',
  time: '平均 O(n log n)，最差 O(n²)', space: 'O(n)',
  code: ['T = {超級三角形}', 'for p in 點:', '  bad = 外接圓包含 p 的三角形', '  hole = bad 的邊界（不被兩個 bad 共享的邊）', '  從 T 移除 bad', '  for e in hole: T.add(三角形(e, p))', '移除含超級三角形頂點的三角形'],
  inputs: [ptsIn('3 3; 12 4; 7 9; 2 13; 15 12; 10 16; 17 7; 8 2; 5 6', 10)],
  run({ pts }) {
    const r = new Rec();
    const S = parsePts(pts);
    const bd = boundsOf(S, 3);
    const span = Math.max(bd[1] - bd[0], bd[3] - bd[2]);
    const cx = (bd[0] + bd[1]) / 2, cy = (bd[2] + bd[3]) / 2;
    const V: Pt[] = [...S, [cx - 20 * span, cy - span], [cx + 20 * span, cy - span], [cx, cy + 20 * span]];
    const n = S.length;
    let T: number[][] = [[n, n + 1, n + 2]];
    const view = (o: { bad?: number[][]; hole?: number[][]; p?: number; circles?: boolean } = {}) => P(S, {
      bounds: bd,
      polygons: [...T.map((t) => ({ pts: t.map((i) => V[i]), color: t.some((i) => i >= n) ? ('muted' as Color) : ('active' as Color) })), ...(o.bad ?? []).map((t) => ({ pts: t.map((i) => V[i]), color: 'bad' as Color, fill: true }))],
      segments: (o.hole ?? []).map(([a, b]) => seg(V[a], V[b], 'swap', false, 3)),
      circles: (o.bad ?? []).map((t) => { const c = circum(V[t[0]], V[t[1]], V[t[2]]); return { ...c, color: 'bad' as Color }; }),
    }, o.p !== undefined ? { [o.p]: 'special' } : {}, true);
    r.snap('建立包住所有點的超級三角形（超出畫面，灰色邊）', [view()], 1);
    for (let p = 0; p < n; p++) {
      const bad = T.filter((t) => { const c = circum(V[t[0]], V[t[1]], V[t[2]]); return Math.hypot(V[p][0] - c.x, V[p][1] - c.y) < c.r - 1e-9; });
      r.snap(`加入點 ${p}：有 ${bad.length} 個三角形的外接圓包含它（紅色）`, [view({ bad, p })], 3);
      const edges: number[][] = [];
      for (const t of bad) for (const [a, b] of [[t[0], t[1]], [t[1], t[2]], [t[2], t[0]]]) {
        const k = edges.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
        if (k >= 0) edges.splice(k, 1); else edges.push([a, b]);
      }
      T = T.filter((t) => !bad.includes(t));
      r.snap(`移除壞三角形，留下多邊形空洞（${edges.length} 條邊）`, [view({ hole: edges, p })], 5);
      for (const [a, b] of edges) T.push([a, b, p]);
      r.snap(`把空洞的每條邊連到點 ${p}`, [view({ p })], 6);
    }
    T = T.filter((t) => t.every((i) => i < n));
    r.snap(`完成：${T.length} 個三角形`, [P(S, { bounds: bd, polygons: T.map((t) => ({ pts: t.map((i) => V[i]), color: 'done' as Color, fill: true })) })], 7);
    return r.frames;
  },
};

export default [orient, segInter, pip, graham, monotone, jarvis, closest, sweep, calipers, clipping, voronoi, delaunay];
