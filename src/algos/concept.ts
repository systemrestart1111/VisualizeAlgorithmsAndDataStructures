import type { AlgoDef, Color, GEdge, GNode } from '../core/types';
import { Rec, cells, fmt, inNum, inSelect, inText, rnd, table, text, vars } from '../core/helpers';
import { frac, mod, parseInts, parseMatrix, ringPanel } from '../core/extra';

const cat = 'concept';

// ---------------- 模運算 ----------------
const modular: AlgoDef = {
  id: 'concept-modular', name: '模運算基礎', en: 'Modular Arithmetic', cat,
  desc: '把整數依除以 m 的餘數放到一個有 m 格的圓環上。許多語言的 % 對負數會得到負餘數，需要再加 m 才落回 [0, m)；餘數相同的數稱為「同餘」。',
  time: '每次運算 O(1)', space: 'O(1)',
  code: ['q = floor(a / m)', 'r = a − q·m        (等同 a % m 再修正)', 'if r < 0: r += m   (只在用截尾除法時需要)', 'a ≡ b (mod m) ⇔ r(a) == r(b)', '(a + b) mod m = (r(a) + r(b)) mod m', '(a · b) mod m = (r(a) · r(b)) mod m'],
  inputs: [inText('nums', '整數（逗號分隔，可為負）', '-1, 27, 52, 13, -27', () => Array.from({ length: 5 }, () => rnd.int(-60, 80)).join(', ')), inNum('m', '模數 m（2–30）', 26, 2, 30, () => rnd.int(5, 26))],
  run({ nums, m }) {
    const r = new Rec();
    const a = parseInts(nums, '整數');
    if (!a.length) throw new Error('請至少輸入一個整數');
    const labels = Array.from({ length: m }, (_, i) => String(i));
    const res: number[] = [];
    const groups: Record<number, number[]> = {};
    for (let i = 0; i < a.length; i++) {
      const x = a[i];
      const q = Math.floor(x / m), rr = x - q * m;
      const trunc = x % m;
      r.snap(`${x} = ${q}·${m} + ${rr}`, [cells(a, { [i]: 'active' }, { title: '輸入' }), ringPanel(labels, { [rr]: 'active' }, { title: `餘數圓環（m = ${m}）` }), vars({ a: x, m, q, r: rr })], 2);
      if (trunc < 0) r.snap(`截尾除法得到 ${x} % ${m} = ${trunc}（負的），加上 ${m} 修正為 ${rr}`, [cells(a, { [i]: 'active' }, { title: '輸入' }), ringPanel(labels, { [rr]: 'swap' }, { title: `餘數圓環（m = ${m}）` }), vars({ 'a % m': trunc, '+ m': rr })], 3);
      res.push(rr);
      (groups[rr] ??= []).push(x);
    }
    const col: Record<number, Color> = {};
    const palette: Color[] = ['active', 'swap', 'done', 'special', 'frontier', 'compare', 'visited'];
    Object.keys(groups).forEach((k, i) => (col[+k] = palette[i % palette.length]));
    const lines = Object.entries(groups).map(([k, xs]) => `餘 ${k}：${xs.join(', ')}` + (xs.length > 1 ? `  → 兩兩同餘` : ''));
    r.snap('同色的數在圓環上落在同一格：它們模 m 同餘', [cells(a, Object.fromEntries(res.map((x, i) => [i, col[x]])), { title: '輸入（顏色代表餘數）' }), cells(res, Object.fromEntries(res.map((x, i) => [i, col[x]])), { title: 'a mod m' }), ringPanel(labels, col, { title: `餘數圓環（m = ${m}）` }), text(lines, '同餘類')], 4);
    if (a.length >= 2) {
      const [x, y] = a;
      const s = mod(x + y, m), p = mod(x * y, m);
      r.snap(`先取餘數再運算結果相同：(${x} + ${y}) mod ${m} = ${s}，(${x} · ${y}) mod ${m} = ${p}`, [ringPanel(labels, { [res[0]]: 'compare', [res[1]]: 'compare', [s]: 'done' }, { title: '加法：沿圓環走' }), vars({ 'r(a)': res[0], 'r(b)': res[1], '(a+b) mod m': s, '(r(a)+r(b)) mod m': mod(res[0] + res[1], m), '(a·b) mod m': p, '(r(a)·r(b)) mod m': mod(res[0] * res[1], m) })], 5);
    }
    return r.frames;
  },
};

// ---------------- 矩陣 ----------------
const det = (A: number[][]): number => {
  const n = A.length;
  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
  let s = 0;
  for (let j = 0; j < n; j++) s += (j % 2 ? -1 : 1) * A[0][j] * det(A.slice(1).map((row) => row.filter((_, k) => k !== j)));
  return s;
};

const matrix: AlgoDef = {
  id: 'concept-matrix', name: '矩陣與線性變換', en: 'Matrix Basics', cat,
  desc: '矩陣乘法 C = AB 的每一格是 A 的一列與 B 的一行做內積；轉置把列與行互換；方陣的行列式表示線性變換把面積（體積）放大幾倍，等於 0 代表不可逆。',
  time: '乘法 O(n·m·p)，行列式（餘因子展開）O(n!)', space: 'O(n·p)',
  code: ['C = n×p 零矩陣', 'for i in 0..n-1:', '  for j in 0..p-1:', '    C[i][j] = Σ_k A[i][k]·B[k][j]', 'Aᵀ[j][i] = A[i][j]', 'det(A) = Σ_j (−1)^j · A[0][j] · det(A 去掉第 0 列第 j 行)'],
  inputs: [inText('A', 'A（以 ; 分列）', '1 2; 3 4', () => `${rnd.int(-3, 4)} ${rnd.int(-3, 4)}; ${rnd.int(-3, 4)} ${rnd.int(-3, 4)}`), inText('B', 'B（以 ; 分列）', '5 6; 7 8', () => `${rnd.int(-3, 4)} ${rnd.int(-3, 4)}; ${rnd.int(-3, 4)} ${rnd.int(-3, 4)}`)],
  run({ A: as, B: bs }) {
    const r = new Rec();
    const A = parseMatrix(as, 'A'), B = parseMatrix(bs, 'B');
    const n = A.length, m = A[0].length, p = B[0].length;
    if (B.length !== m) throw new Error(`A 是 ${n}×${m}，B 是 ${B.length}×${p}：A 的行數必須等於 B 的列數`);
    if (n > 5 || m > 5 || p > 5) throw new Error('為了清楚呈現，矩陣最大 5×5');
    const C: (number | null)[][] = Array.from({ length: n }, () => new Array(p).fill(null));
    const hl = (rowI: number | null, colJ: number | null, k: number | null) => {
      const ca: Record<string, Color> = {}, cb: Record<string, Color> = {}, cc: Record<string, Color> = {};
      if (rowI !== null) for (let t = 0; t < m; t++) ca[`${rowI},${t}`] = t === k ? 'swap' : 'active';
      if (colJ !== null) for (let t = 0; t < m; t++) cb[`${t},${colJ}`] = t === k ? 'swap' : 'active';
      if (rowI !== null && colJ !== null) cc[`${rowI},${colJ}`] = 'done';
      return [table(A, ca, { title: 'A', w: 'auto' as const }), table(B, cb, { title: 'B', w: 'auto' as const }), table(C, cc, { title: 'C = AB', w: 'auto' as const })];
    };
    r.snap(`A 為 ${n}×${m}、B 為 ${m}×${p}，所以 C 為 ${n}×${p}`, hl(null, null, null), 1);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < p; j++) {
        let s = 0;
        const terms: string[] = [];
        for (let k = 0; k < m; k++) { s += A[i][k] * B[k][j]; terms.push(`${fmt(A[i][k])}·${fmt(B[k][j])}`); }
        C[i][j] = s;
        r.snap(`C[${i}][${j}] = ${terms.join(' + ')} = ${s}`, hl(i, j, null), 4);
      }
    const T = A[0].map((_, j) => A.map((row) => row[j]));
    r.snap('轉置：Aᵀ 的第 j 列就是 A 的第 j 行', [table(A, {}, { title: 'A', w: 'auto' }), table(T, {}, { title: 'Aᵀ', w: 'auto' })], 5);
    if (n === m) {
      const d = det(A);
      const panels: any[] = [table(A, {}, { title: 'A', w: 'auto' }), vars({ 'det(A)': d, 可逆: d !== 0 ? '是' : '否' })];
      if (n === 2) {
        const sq: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
        const tr = sq.map(([x, y]) => [A[0][0] * x + A[0][1] * y, A[1][0] * x + A[1][1] * y] as [number, number]);
        panels.unshift({ type: 'plot', title: '單位正方形（虛線）經 A 變換後（實線），面積放大 |det| 倍', polygons: [{ pts: sq, color: 'muted', dashed: true }, { pts: tr, color: d ? 'active' : 'bad', fill: true }], axes: true, square: true });
      }
      r.snap(n === 2 ? `det(A) = ${A[0][0]}·${A[1][1]} − ${A[0][1]}·${A[1][0]} = ${d}` : `以第 0 列餘因子展開得 det(A) = ${d}`, panels, 6);
    } else r.snap('A 不是方陣，沒有行列式', [table(A, {}, { title: 'A' })], 6);
    return r.frames;
  },
};

// ---------------- 機率 ----------------
const probability: AlgoDef = {
  id: 'concept-probability', name: '機率與期望基礎', en: 'Probability Basics', cat,
  desc: '從袋中連抽兩顆球，用事件樹計算每條路徑的機率：路徑機率 = 沿途條件機率相乘。放回時兩次獨立，不放回時第二次的機率取決於第一次，並計算抽到紅球數的期望值。',
  time: 'O(1)', space: 'O(1)',
  code: ['P(第 1 次紅) = R / (R + B)', 'P(第 2 次紅 | 第 1 次紅) = 放回 ? R/(R+B) : (R−1)/(R+B−1)', 'P(A ∩ B) = P(A) · P(B | A)', '獨立 ⇔ P(B | A) = P(B)', 'E[X] = Σ x · P(X = x)'],
  inputs: [inNum('red', '紅球數', 3, 1, 20, () => rnd.int(1, 6)), inNum('blue', '藍球數', 2, 1, 20, () => rnd.int(1, 6)), inSelect('mode', '抽法', [['without', '不放回'], ['with', '放回']])],
  run({ red: R, blue: B, mode }) {
    const r = new Rec();
    const back = mode === 'with';
    const T = R + B;
    if (!back && T < 2) throw new Error('不放回時至少需要 2 顆球');
    const p1 = [R, B];
    const p2 = (first: 0 | 1): [number, number, number] => (back ? [R, B, T] : first === 0 ? [R - 1, B, T - 1] : [R, B - 1, T - 1]);
    const leaf: { name: string; n: number; d: number; reds: number }[] = [];
    for (const a of [0, 1] as const) {
      const [r2, b2, t2] = p2(a);
      for (const b of [0, 1] as const) leaf.push({ name: (a ? '藍' : '紅') + (b ? '藍' : '紅'), n: p1[a] * (b ? b2 : r2), d: T * t2, reds: (a ? 0 : 1) + (b ? 0 : 1) });
    }
    const tree = (hl: string[] = []) => {
      const nodes: GNode[] = [{ id: 'root', x: 0, y: 0, label: '開始' }];
      const edges: GEdge[] = [];
      const c = (id: string): Color | undefined => (hl.includes(id) ? 'active' : undefined);
      [0, 1].forEach((a) => {
        const id = 'a' + a;
        nodes.push({ id, x: (a ? 1 : -1) * 150, y: 90, label: a ? '藍' : '紅', color: a ? 'visited' : 'bad' });
        edges.push({ from: 'root', to: id, label: frac(p1[a], T), color: c(id), directed: true });
        const [r2, b2, t2] = p2(a as 0 | 1);
        [0, 1].forEach((b) => {
          const lid = id + b;
          const L = leaf[a * 2 + b];
          nodes.push({ id: lid, x: (a ? 1 : -1) * 150 + (b ? 1 : -1) * 70, y: 190, label: b ? '藍' : '紅', color: b ? 'visited' : 'bad', sub: frac(L.n, L.d) });
          edges.push({ from: id, to: lid, label: frac(b ? b2 : r2, t2), color: c(lid), directed: true });
        });
      });
      return { type: 'graph' as const, nodes, edges, title: '事件樹（邊上為條件機率，葉節點下方為路徑機率）', height: 300 };
    };
    r.snap(`袋中 ${R} 紅 ${B} 藍，第一次抽到紅球的機率 = ${R}/${T}`, [tree(['a0'])], 1);
    const [r2] = p2(0);
    r.snap(`已抽到紅球，${back ? '放回後' : '剩下'} ${back ? T : T - 1} 顆中有 ${r2} 顆紅球 → P(第2次紅 | 第1次紅) = ${frac(r2, back ? T : T - 1)}`, [tree(['a0', 'a00'])], 2);
    r.snap(`P(紅紅) = ${frac(R, T)} × ${frac(r2, back ? T : T - 1)} = ${frac(leaf[0].n, leaf[0].d)}`, [tree(['a0', 'a00']), table(leaf.map((l) => [l.name, frac(l.n, l.d), l.reds]), { '0,1': 'done' }, { colHeaders: ['結果', '機率', '紅球數 X'], w: 'half' })], 3);
    const second = frac(leaf[0].n * leaf[2].d + leaf[2].n * leaf[0].d, leaf[0].d * leaf[2].d);
    r.snap(back ? `放回：P(第2次紅 | 第1次紅) = ${frac(R, T)} = P(第2次紅)，兩次抽取獨立` : `不放回：P(第2次紅 | 第1次紅) = ${frac(R - 1, T - 1)}，但 P(第2次紅) = ${second}，兩者不同 → 相依`, [tree(['a0', 'a00', 'a1', 'a10']), vars({ 'P(第2次紅)': second, 'P(第2次紅|第1次紅)': frac(r2, back ? T : T - 1), 獨立: back ? '是' : '否' })], 4);
    const ex = leaf.reduce((s, l) => s + (l.reds * l.n) / l.d, 0);
    r.snap(`E[X] = Σ x·P(X=x) = ${leaf.map((l) => `${l.reds}·${frac(l.n, l.d)}`).join(' + ')} = ${+ex.toFixed(4)}（= 2 × ${R}/${T}）`, [table(leaf.map((l) => [l.name, frac(l.n, l.d), l.reds, frac(l.reds * l.n, l.d)]), {}, { colHeaders: ['結果', '機率', 'X', 'x·P'] }), vars({ 'E[X]': ex })], 5);
    return r.frames;
  },
};

// ---------------- 位元運算 ----------------
const bitsDef: AlgoDef = {
  id: 'concept-bits', name: '位元運算基礎', en: 'Bitwise Operations', cat,
  desc: '在固定字寬 w 下逐位示範 AND、OR、XOR、NOT、左右位移與遮罩。超過 w 位的結果會被截掉（溢位）；負數以二補數表示，lowbit = x & −x 取出最低位的 1。',
  time: '每個運算 O(1)（硬體一次處理 w 位）', space: 'O(1)',
  code: ['mask = 2^w − 1', 'a & b   兩位皆 1 才是 1', 'a | b   任一位為 1 就是 1', 'a ^ b   兩位不同才是 1', '~a & mask   每位反轉', '(a << k) & mask   左移，超出字寬的位元捨棄', 'a >> k   右移（邏輯位移補 0）', 'a & (−a)   最低位的 1（lowbit）', '(a >> k) & 1 檢查第 k 位；a | (1 << k) 設為 1'],
  inputs: [inNum('a', 'a', 182, -128, 255, () => rnd.int(0, 255)), inNum('b', 'b', 109, -128, 255, () => rnd.int(0, 255)), inNum('w', '字寬 w（4–16）', 8, 4, 16), inNum('k', '位移量／位元位置 k', 3, 0, 15, () => rnd.int(0, 7))],
  run({ a, b, w, k }) {
    const r = new Rec();
    if (k >= w) throw new Error('k 必須小於字寬 w');
    const M = 2 ** w - 1;
    const A = ((a % (M + 1)) + M + 1) & M, B = ((b % (M + 1)) + M + 1) & M;
    const bits = (x: number) => Array.from({ length: w }, (_, i) => (x >> (w - 1 - i)) & 1);
    const hdr = Array.from({ length: w }, (_, i) => w - 1 - i);
    const show = (rows: [string, number][], hlRow: number, line: number, msg: string, diff = false) => {
      const colors: Record<string, Color> = {};
      rows.forEach(([, v], ri) => bits(v).forEach((bt, ci) => { if (bt) colors[`${ri},${ci}`] = ri === hlRow ? 'done' : 'active'; }));
      if (diff) bits(rows[hlRow][1]).forEach((_, ci) => { if (!colors[`${hlRow},${ci}`]) colors[`${hlRow},${ci}`] = 'muted'; });
      r.snap(msg, [table(rows.map(([, v]) => bits(v)), colors, { rowHeaders: rows.map(([n, v]) => `${n} = ${v}`), colHeaders: hdr }), vars({ w, mask: M })], line);
    };
    show([['a', A], ['b', B]], -1, 1, `字寬 ${w}：mask = 2^${w} − 1 = ${M}` + (a < 0 || b < 0 ? '（負數以二補數表示）' : ''));
    show([['a', A], ['b', B], ['a & b', A & B]], 2, 2, `a & b = ${A & B}：只有兩列都為 1 的位才留下`);
    show([['a', A], ['b', B], ['a | b', A | B]], 2, 3, `a | b = ${A | B}`);
    show([['a', A], ['b', B], ['a ^ b', A ^ B]], 2, 4, `a ^ b = ${A ^ B}：不同的位為 1；再 ^ b 一次可還原 a`);
    show([['a', A], ['~a', ~A & M]], 1, 5, `~a & mask = ${~A & M}`);
    const shl = A * 2 ** k, lost = Math.floor(shl / (M + 1));
    show([['a', A], [`a << ${k}`, shl & M]], 1, 6, `a << ${k} = ${shl}，保留 ${w} 位後為 ${shl & M}` + (lost ? `（溢位捨棄高位 ${lost.toString(2)}）` : '（沒有溢位）'));
    show([['a', A], [`a >> ${k}`, A >> k]], 1, 7, `a >> ${k} = ${A >> k}，相當於 floor(a / 2^${k})`);
    const low = A & (-A & M);
    show([['a', A], ['−a', -A & M], ['a & −a', low]], 2, 8, A ? `lowbit(a) = ${low}：二補數的 −a 只有最低位的 1 與 a 相同` : 'a = 0 沒有任何為 1 的位');
    show([['a', A], [`1 << ${k}`, 1 << k], [`a | (1<<${k})`, A | (1 << k)]], 2, 9, `第 ${k} 位目前為 ${(A >> k) & 1}；設為 1 後得 ${A | (1 << k)}`);
    return r.frames;
  },
};

// ---------------- 導數與梯度 ----------------
const FUNCS: Record<string, { f: (x: number) => number; d: (x: number) => number; name: string }> = {
  sq: { f: (x) => x * x, d: (x) => 2 * x, name: 'x²' },
  cube: { f: (x) => x ** 3 - 2 * x, d: (x) => 3 * x * x - 2, name: 'x³ − 2x' },
  sin: { f: Math.sin, d: Math.cos, name: 'sin x' },
  exp: { f: Math.exp, d: Math.exp, name: 'eˣ' },
};

const calculus: AlgoDef = {
  id: 'concept-calculus', name: '導數與梯度基礎', en: 'Derivatives and Gradients', cat,
  desc: '導數是割線斜率在 h → 0 時的極限，也就是切線斜率。用有限差分 (f(x+h) − f(x−h)) / 2h 逼近並與解析解比較；多變數函數的梯度 ∇f 指向上升最快的方向，並與等高線垂直。',
  time: '每個差分 O(1)', space: 'O(1)',
  code: ['for h in 1, 1/2, 1/4, ...:', '  割線斜率 = (f(x+h) − f(x)) / h', '  中央差分 = (f(x+h) − f(x−h)) / (2h)', "f'(x) = lim_{h→0} 割線斜率", '∇g(x, y) = (∂g/∂x, ∂g/∂y)', '梯度與等高線垂直，指向 g 增加最快的方向'],
  inputs: [inSelect('fn', '函數 f', [['sq', 'x²'], ['cube', 'x³ − 2x'], ['sin', 'sin x'], ['exp', 'eˣ']]), inNum('x0', 'x₀', 1, -3, 3, () => rnd.int(-2, 2))],
  run({ fn, x0 }) {
    const r = new Rec();
    const F = FUNCS[fn] ?? FUNCS.sq;
    const xs = Array.from({ length: 121 }, (_, i) => x0 - 3 + i * 0.05);
    const curve: [number, number][] = xs.map((x) => [x, F.f(x)]);
    const y0 = F.f(x0), exact = F.d(x0);
    const lo = Math.min(...curve.map((p) => p[1])), hi = Math.max(...curve.map((p) => p[1]));
    const bounds: [number, number, number, number] = [x0 - 3, x0 + 3, Math.max(lo, y0 - 6), Math.min(hi, y0 + 6)];
    const line = (s: number, color: Color, dashed = false) => ({ x1: x0 - 3, y1: y0 - 3 * s, x2: x0 + 3, y2: y0 + 3 * s, color, dashed });
    const rows: (string | number)[][] = [];
    for (let h = 1, i = 0; i < 6; i++, h /= 2) {
      const sec = (F.f(x0 + h) - y0) / h, cen = (F.f(x0 + h) - F.f(x0 - h)) / (2 * h);
      rows.push([h, +sec.toFixed(6), +cen.toFixed(6), +Math.abs(sec - exact).toExponential(2)]);
      r.snap(`h = ${h}：割線斜率 ${+sec.toFixed(4)}，中央差分 ${+cen.toFixed(4)}`, [{ type: 'plot', title: `f(x) = ${F.name}；橘線為割線，虛線為真正切線`, bounds, curves: [{ pts: curve }], segments: [line(exact, 'muted', true), line(sec, 'swap')], points: [{ x: x0, y: y0, color: 'active', label: 'x₀' }, { x: x0 + h, y: F.f(x0 + h), color: 'swap' }], axes: true }, table(rows, { [`${i},1`]: 'swap', [`${i},2`]: 'done' }, { colHeaders: ['h', '割線', '中央差分', '割線誤差'], w: 'half' })], i === 0 ? 1 : 2);
    }
    r.snap(`h 越小割線越接近切線；解析解 f'(${x0}) = ${+exact.toFixed(6)}`, [{ type: 'plot', title: '切線', bounds, curves: [{ pts: curve }], segments: [line(exact, 'done')], points: [{ x: x0, y: y0, color: 'active', label: `斜率 ${+exact.toFixed(3)}` }], axes: true }, vars({ "f'(x₀)": exact })], 4);
    // 多變數：g(x, y) = x² + 2y²
    const px = x0 === 0 ? 1 : x0, py = 1;
    const gx = 2 * px, gy = 4 * py, len = Math.hypot(gx, gy);
    const ell = (c: number): [number, number][] => Array.from({ length: 73 }, (_, i) => { const t = (i / 72) * 2 * Math.PI; return [Math.sqrt(c) * Math.cos(t), Math.sqrt(c / 2) * Math.sin(t)]; });
    const c0 = px * px + 2 * py * py;
    r.snap(`g(x, y) = x² + 2y² 在 (${px}, ${py}) 的梯度 = (2x, 4y) = (${gx}, ${gy})，垂直於通過該點的等高線`, [{ type: 'plot', title: '等高線與梯度方向', square: true, bounds: [-4, 4, -3, 3], curves: [1, 4, c0, 12].map((c) => ({ pts: ell(c), color: (c === c0 ? 'active' : 'muted') as Color, width: c === c0 ? 2.5 : 1.2 })), segments: [{ x1: px, y1: py, x2: px + gx / len, y2: py + gy / len, color: 'bad', width: 3 }], points: [{ x: px, y: py, color: 'bad', label: '∇g' }], axes: true }, vars({ '∂g/∂x': gx, '∂g/∂y': gy, '|∇g|': len })], 6);
    return r.frames;
  },
};

// ---------------- 有限體 GF(2^8) ----------------
const gfMul = (a: number, b: number) => {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p;
};
const bin8 = (x: number) => x.toString(2).padStart(8, '0');
const hx = (x: number) => '0x' + x.toString(16).padStart(2, '0').toUpperCase();
const parseByte = (s: string, name: string) => {
  const t = String(s).trim().toLowerCase();
  const v = t.startsWith('0x') ? parseInt(t.slice(2), 16) : /^[0-9a-f]{1,2}$/.test(t) && /[a-f]/.test(t) ? parseInt(t, 16) : Number(t);
  if (!Number.isInteger(v) || v < 0 || v > 255) throw new Error(`${name} 必須是 0–255（可寫成 0x57）`);
  return v;
};
const poly = (x: number) => {
  const t: string[] = [];
  for (let i = 7; i >= 0; i--) if ((x >> i) & 1) t.push(i === 0 ? '1' : i === 1 ? 'x' : `x^${i}`);
  return t.join(' + ') || '0';
};

const finiteField: AlgoDef = {
  id: 'concept-finite-field', name: '有限體運算', en: 'Finite Field Arithmetic GF(2⁸)', cat,
  desc: 'GF(2⁸) 的元素是 8 位元組，看成係數為 0/1 的多項式。加法是 XOR；乘法是多項式相乘再對不可約多項式 x⁸ + x⁴ + x³ + x + 1（0x11B）取餘。AES 的 S-box 與 MixColumns 都建立在這個運算上。',
  time: '乘法 O(8)，求反元素 O(8·log 255)', space: 'O(1)',
  code: ['a ⊕ b = a XOR b          (加法 = 減法)', 'p = 0', 'for i in 0..7:', '  if b 的最低位為 1: p ^= a', '  a = xtime(a)：左移一位，若溢出 x⁸ 則 ^ 0x1B', '  b >>= 1', 'a⁻¹ = a^254（a ≠ 0）；0 沒有乘法反元素'],
  inputs: [inText('a', 'a（0–255 或 0x..）', '0x57', () => hx(rnd.int(0, 255))), inText('b', 'b（0–255 或 0x..）', '0x83', () => hx(rnd.int(0, 255)))],
  run({ a: as, b: bs }) {
    const r = new Rec();
    const A0 = parseByte(as, 'a'), B0 = parseByte(bs, 'b');
    const row = (name: string, v: number): (string | number)[] => [name, hx(v), bin8(v), poly(v)];
    r.snap(`加法：${hx(A0)} ⊕ ${hx(B0)} = ${hx(A0 ^ B0)}（逐位 XOR，不進位）`, [table([row('a', A0), row('b', B0), row('a ⊕ b', A0 ^ B0)], { '2,1': 'done', '2,2': 'done' }, { colHeaders: ['', '十六進位', '二進位', '多項式'] })], 1);
    let a = A0, b = B0, p = 0;
    const log: (string | number)[][] = [];
    for (let i = 0; i < 8; i++) {
      const take = b & 1;
      if (take) p ^= a;
      log.push([i, bin8(b), take ? `p ^= ${hx(a)}` : '—', hx(p)]);
      r.snap(take ? `b 的第 ${i} 位為 1：p ^= ${hx(a)} → ${hx(p)}` : `b 的第 ${i} 位為 0：p 不變`, [table(log, { [`${i},2`]: take ? 'swap' : 'muted', [`${i},3`]: 'done' }, { colHeaders: ['i', 'b（剩餘）', '動作', 'p'] }), vars({ a: hx(a), b: hx(b), p: hx(p) })], 4);
      const hi = a & 0x80;
      const na = ((a << 1) & 0xff) ^ (hi ? 0x1b : 0);
      if (i < 7) r.snap(`xtime：${hx(a)} 左移${hi ? '，最高位溢出 → 再 ^ 0x1B（約化）' : '（沒有溢出）'} = ${hx(na)}`, [table(log, {}, { colHeaders: ['i', 'b（剩餘）', '動作', 'p'] }), vars({ 'a（新）': hx(na), 約化: hi ? '是' : '否' })], 5);
      a = na; b >>= 1;
    }
    r.snap(`${hx(A0)} · ${hx(B0)} = ${hx(p)}`, [table([row('a', A0), row('b', B0), row('a · b', p)], { '2,1': 'done', '2,2': 'done', '2,3': 'done' }, { colHeaders: ['', '十六進位', '二進位', '多項式'] })], 3);
    if (A0 === 0) r.snap('a = 0：任何數乘 0 都是 0，0 沒有乘法反元素', [vars({ a: hx(0), 'a⁻¹': '不存在' }, undefined, { 'a⁻¹': 'bad' })], 7);
    else {
      let inv = 1, base = A0, e = 254;
      while (e) { if (e & 1) inv = gfMul(inv, base); base = gfMul(base, base); e >>= 1; }
      r.snap(`a⁻¹ = a^254 = ${hx(inv)}；驗證 ${hx(A0)} · ${hx(inv)} = ${hx(gfMul(A0, inv))}`, [vars({ a: hx(A0), 'a⁻¹': hx(inv), 'a · a⁻¹': hx(gfMul(A0, inv)) }, undefined, { 'a · a⁻¹': 'done' })], 7);
    }
    return r.frames;
  },
};

// ---------------- 特徵值與特徵向量 ----------------
const eigen: AlgoDef = {
  id: 'concept-eigen', name: '特徵值與特徵向量', en: 'Eigenvalues and Eigenvectors', cat,
  desc: '矩陣 A 作用在大多數向量上會改變方向；特徵向量 v 經過 A 之後只被伸縮：Av = λv。2×2 矩陣的特徵值是 λ² − tr(A)·λ + det(A) = 0 的根，判別式小於 0 時沒有實特徵向量（例如旋轉）。',
  time: '2×2 解析解 O(1)', space: 'O(1)',
  code: ['tr = a + d，det = ad − bc', 'Δ = tr² − 4·det', 'if Δ < 0: 沒有實特徵值（旋轉成分）', 'λ = (tr ± √Δ) / 2', '解 (A − λI)v = 0 得 v', '驗證 Av = λv'],
  inputs: [inText('A', 'A（2×2，以 ; 分列）', '2 1; 1 2', () => { const b = rnd.int(-2, 3); return `${rnd.int(-2, 4)} ${b}; ${rnd.pick([b, rnd.int(-2, 3)])} ${rnd.int(-2, 4)}`; })],
  run({ A: as }) {
    const r = new Rec();
    const A = parseMatrix(as, 'A');
    if (A.length !== 2 || A[0].length !== 2) throw new Error('請輸入 2×2 矩陣');
    const [[a, b], [c, d]] = A;
    const mul = (v: [number, number]): [number, number] => [a * v[0] + b * v[1], c * v[0] + d * v[1]];
    const tr = a + d, dt = a * d - b * c, D = tr * tr - 4 * dt;
    const probes: [number, number][] = Array.from({ length: 8 }, (_, i) => [Math.cos((i * Math.PI) / 8), Math.sin((i * Math.PI) / 8)]);
    const M = Math.max(2, ...probes.flatMap((v) => mul(v).map(Math.abs))) * 1.15;
    const B: [number, number, number, number] = [-M, M, -M, M];
    const seg = (v: [number, number], color: Color, dashed = false, width = 2) => ({ x1: 0, y1: 0, x2: v[0], y2: v[1], color, dashed, width });
    r.snap('一般向量（灰虛線）經 A 變換後（藍線）方向通常會改變', [{ type: 'plot', title: '單位向量 v 與 Av', square: true, bounds: B, segments: probes.flatMap((v) => [seg(v, 'muted', true, 1.5), seg(mul(v), 'active', false, 1.5)]), axes: true }, vars({ tr, det: dt })], 1);
    r.snap(`Δ = tr² − 4det = ${tr}² − 4·${dt} = ${D}`, [vars({ tr, det: dt, Δ: D }, undefined, { Δ: D < 0 ? 'bad' : 'done' })], 2);
    if (D < 0) {
      r.snap('Δ < 0：沒有實數特徵值，A 會把每個實向量都轉個方向', [{ type: 'plot', title: '沒有方向保持不變的實向量', square: true, bounds: B, segments: probes.flatMap((v) => [seg(v, 'muted', true, 1.5), seg(mul(v), 'bad', false, 1.5)]), axes: true }], 3);
      return r.frames;
    }
    const ls = [(tr + Math.sqrt(D)) / 2, (tr - Math.sqrt(D)) / 2];
    r.snap(`λ₁ = ${fmt(ls[0])}，λ₂ = ${fmt(ls[1])}`, [vars({ λ1: ls[0], λ2: ls[1] })], 4);
    const vecs: [number, number][] = ls.map((l) => {
      // (a−λ)x + b y = 0；若整列為 0 則用第二列
      let v: [number, number] = Math.abs(b) > 1e-12 ? [b, l - a] : Math.abs(c) > 1e-12 ? [l - d, c] : Math.abs(a - l) < 1e-12 ? [1, 0] : [0, 1];
      const n = Math.hypot(...v);
      v = [v[0] / n, v[1] / n];
      return v;
    });
    const same = Math.abs(ls[0] - ls[1]) < 1e-12;
    const rows = ls.map((l, i) => { const v = vecs[i], Av = mul(v); return [`λ${i + 1} = ${fmt(l)}`, fmt(v), fmt(Av), fmt([l * v[0], l * v[1]])]; });
    r.snap(same && b === 0 && c === 0 ? 'A = λI：每個向量都是特徵向量' : '特徵向量（粗線）經 A 後仍在同一直線上，只被乘上 λ', [{ type: 'plot', title: '特徵方向：v（虛線）與 Av = λv（實線）', square: true, bounds: B, segments: [...probes.map((v) => seg(mul(v), 'muted', false, 1)), ...vecs.flatMap((v, i) => [seg(v, i ? 'special' : 'done', true, 3), seg(mul(v), i ? 'special' : 'done', false, 3)])], axes: true }, table(rows, {}, { colHeaders: ['特徵值', 'v', 'Av', 'λv'] })], 6);
    return r.frames;
  },
};

export default [modular, bitsDef, probability, matrix, calculus, finiteField, eigen] satisfies AlgoDef[];
