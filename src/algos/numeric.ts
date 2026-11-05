// 數值方法延伸：線性代數分解、迭代法、積分與微分方程、線性規劃
import type { AlgoDef, Color, Panel, PlotPanel } from '../core/types';
import { Rec, cells, inNum, inSelect, inText, rnd, table, text, vars } from '../core/helpers';
import { parseMatrix } from '../core/extra';

const cat = 'numeric';
type CM = Record<string, Color | undefined>;
type Pt = [number, number];

/** 四位小數並把 −0 與極小值顯示成 0 */
const f4 = (v: number) => { const x = +v.toFixed(4); return Math.abs(x) < 1e-10 ? 0 : x; };
const f6 = (v: number) => { const x = +v.toFixed(6); return Math.abs(x) < 1e-12 ? 0 : x; };
const mt = (M: number[][], hl: CM = {}, o: Parameters<typeof table>[2] = {}) => table(M.map((r) => r.map(f4)), hl, o);
const rowHL = (r: number, len: number, c: Color): CM => Object.fromEntries(Array.from({ length: len }, (_, j) => [`${r},${j}`, c]));
const matMul = (A: number[][], B: number[][]) => A.map((r) => B[0].map((_, j) => r.reduce((s, v, k) => s + v * B[k][j], 0)));
const matVec = (A: number[][], x: number[]) => A.map((r) => r.reduce((s, v, k) => s + v * x[k], 0));
const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = (a: number[]) => Math.sqrt(dot(a, a));
const maxErr = (A: number[][], B: number[][]) => Math.max(...A.flatMap((r, i) => r.map((v, j) => Math.abs(v - B[i][j]))));
const randInt = (n: number, lo: number, hi: number) => rnd.arr(n, lo, hi);
const vecIn = (s: string, n: number, name: string) => {
  const v = String(s).split(/[\s,;]+/).filter(Boolean).map(Number);
  if (v.length !== n || v.some((x) => !Number.isFinite(x))) throw new Error(`${name}需要 ${n} 個數字`);
  return v;
};
const randMat = (r: number, c: number, lo = -5, hi = 5) => Array.from({ length: r }, () => randInt(c, lo, hi).join(' ')).join('\n');

// ---------------- 高斯–喬登 ----------------
const GJ_CASES = ['2 1 -1 8\n-3 -1 2 -11\n-2 1 2 -3', '1 2 -1 3\n2 4 -2 6\n1 1 1 4', '1 1 2 3\n2 2 4 7\n1 -1 0 1', '1 2 3\n2 -1 1\n3 1 4'];
const gaussJordan: AlgoDef = {
  id: 'gauss-jordan', name: '高斯–喬登消去法', en: 'Gauss–Jordan Elimination', cat,
  desc: '把增廣矩陣 [A | b] 化成「簡化列梯形」(RREF)：每個主元都是 1，且主元所在的欄其他位置全部是 0，解可以直接讀出，不需要回代。同時能判斷三種情況：出現 [0 … 0 | c ≠ 0] 代表無解；主元數少於變數數代表有自由變數、無限多解；否則唯一解。',
  time: 'O(n³)', space: 'O(n²)',
  code: ['row = 0', 'for col = 0 .. 變數數−1:', '  p = 第 row 列以下 |M[p][col]| 最大者', '  if |M[p][col]| ≈ 0: 此欄沒有主元 → 自由變數，跳過', '  交換 row 與 p，整列除以主元（主元變 1）', '  其他每一列 r: M[r] −= M[r][col] · M[row]', '  row += 1', '若有 [0 … 0 | c ≠ 0]：無解', '主元數 < 變數數：無限多解；否則唯一解'],
  inputs: [inText('m', '增廣矩陣 [A | b]（每行一個方程式）', GJ_CASES[0], () => (rnd.int(0, 2) ? rnd.pick(GJ_CASES) : (() => { const n = rnd.int(2, 4), x = randInt(n, -4, 4); return Array.from({ length: n }, () => { const a = randInt(n, -5, 5); return [...a, dot(a, x)].join(' '); }).join('\n'); })()), true)],
  run({ m }) {
    const r = new Rec();
    const M = parseMatrix(m, '增廣矩陣');
    const R = M.length, nv = M[0].length - 1;
    if (nv < 1) throw new Error('每列至少要有一個係數與常數項');
    if (R > 6 || nv > 6) throw new Error('最多 6×6');
    const hdr = [...Array.from({ length: nv }, (_, i) => 'x' + (i + 1)), 'b'];
    const T = (hl: CM = {}) => mt(M, hl, { colHeaders: hdr, rowHeaders: M.map((_, i) => 'R' + (i + 1)) });
    r.snap('增廣矩陣 [A | b]', [T()], 1);
    const pivCols: number[] = [];
    let row = 0;
    for (let col = 0; col < nv && row < R; col++) {
      let p = row;
      for (let i = row + 1; i < R; i++) if (Math.abs(M[i][col]) > Math.abs(M[p][col])) p = i;
      if (Math.abs(M[p][col]) < 1e-9) { r.snap(`x${col + 1} 這一欄（第 ${row + 1} 列以下）全是 0：沒有主元，x${col + 1} 是自由變數`, [T(Object.fromEntries(Array.from({ length: R - row }, (_, k) => [`${row + k},${col}`, 'muted' as Color])))], 4); continue; }
      if (p !== row) { [M[p], M[row]] = [M[row], M[p]]; r.snap(`交換 R${row + 1} ↔ R${p + 1}（|主元| 最大）`, [T(rowHL(row, nv + 1, 'swap'))], 5); }
      const pv = M[row][col];
      M[row] = M[row].map((v) => v / pv);
      r.snap(`R${row + 1} ÷ ${f4(pv)}：主元變成 1`, [T({ ...rowHL(row, nv + 1, 'active'), [`${row},${col}`]: 'special' })], 5);
      for (let i = 0; i < R; i++) {
        if (i === row || Math.abs(M[i][col]) < 1e-12) continue;
        const f = M[i][col];
        M[i] = M[i].map((v, j) => v - f * M[row][j]);
        r.snap(`R${i + 1} −= ${f4(f)} × R${row + 1}：消去 x${col + 1}`, [T({ ...rowHL(i, nv + 1, 'compare'), [`${row},${col}`]: 'special' })], 6);
      }
      pivCols.push(col);
      row++;
    }
    const bad = M.findIndex((rw, i) => i >= row && Math.abs(rw[nv]) > 1e-9);
    if (bad >= 0) {
      r.snap(`R${bad + 1} 變成 [0 … 0 | ${f4(M[bad][nv])}]，代表 0 = ${f4(M[bad][nv])}，矛盾 → 無解`, [T(rowHL(bad, nv + 1, 'bad')), vars({ 秩: pivCols.length, 結果: '無解' }, undefined, { 結果: 'bad' })], 8);
      return r.frames;
    }
    if (pivCols.length < nv) {
      const free = Array.from({ length: nv }, (_, j) => j).filter((j) => !pivCols.includes(j));
      const lines = pivCols.map((c, i) => `x${c + 1} = ${f4(M[i][nv])}${free.map((fj) => (Math.abs(M[i][fj]) > 1e-9 ? ` ${M[i][fj] > 0 ? '−' : '+'} ${f4(Math.abs(M[i][fj]))}·x${fj + 1}` : '')).join('')}`);
      r.snap(`主元 ${pivCols.length} 個 < 變數 ${nv} 個：${free.map((j) => 'x' + (j + 1)).join('、')} 可任意取值 → 無限多解`, [T(), text([...lines, ...free.map((j) => `x${j + 1} 為自由變數`)], '通解'), vars({ 秩: pivCols.length, 結果: '無限多解' }, undefined, { 結果: 'special' })], 9);
      return r.frames;
    }
    const x = pivCols.map((_, i) => M[i][nv]);
    r.snap(`RREF 的最後一欄就是解：${x.map((v, i) => `x${i + 1} = ${f6(v)}`).join('，')}`, [T(Object.fromEntries(x.map((_, i) => [`${i},${nv}`, 'done' as Color]))), vars({ 秩: nv, 結果: '唯一解' }, undefined, { 結果: 'done' })], 9);
    return r.frames;
  },
};

// ---------------- LU 分解 ----------------
const luDecomp: AlgoDef = {
  id: 'lu-decomposition', name: 'LU 分解', en: 'LU Decomposition (Partial Pivoting)', cat,
  desc: '把方陣分解成 PA = LU：L 是對角線為 1 的下三角矩陣，記錄高斯消去時每一步的倍數；U 是消去後的上三角矩陣；P 是列交換（部分樞軸）的排列矩陣。分解一次 O(n³) 後，每個新的 b 只要兩次 O(n²) 三角代換就能求解。交換列時，L 中已算好的倍數也要一起交換。最後核對 PA 與 LU 的差。',
  time: '分解 O(n³)，每次求解 O(n²)', space: 'O(n²)',
  code: ['P = I，L = I，U = A', 'for k = 0 .. n−1:', '  p = 第 k 列以下 |U[i][k]| 最大者', '  交換 U、P 的第 k 與 p 列；L 的第 0..k−1 欄也交換', '  if U[k][k] ≈ 0: 矩陣奇異', '  for i = k+1 .. n−1:', '    L[i][k] = U[i][k] / U[k][k]', '    U[i] −= L[i][k] · U[k]', '驗證 PA = LU'],
  inputs: [inText('m', '方陣 A（每行一列）', '2 1 1 0\n4 3 3 1\n8 7 9 5\n6 7 9 8', () => { const n = rnd.int(3, 4); return rnd.int(0, 4) ? randMat(n, n, -6, 6) : '1 2 3\n2 4 6\n1 0 1'; }, true)],
  run({ m }) {
    const r = new Rec();
    const A = parseMatrix(m, '矩陣');
    const n = A.length;
    if (A[0].length !== n) throw new Error('LU 分解需要方陣');
    if (n > 6) throw new Error('最多 6×6');
    const U = A.map((rw) => [...rw]);
    const L: number[][] = A.map((_, i) => A.map((__, j) => (i === j ? 1 : 0)));
    const perm = A.map((_, i) => i);
    const Pm = () => perm.map((pi) => A.map((_, j) => (j === pi ? 1 : 0)));
    const show = (hlU: CM = {}, hlL: CM = {}) => [mt(L, hlL, { title: 'L', w: 'half' as const }), mt(U, hlU, { title: 'U', w: 'half' as const }), cells(perm.map((p) => `R${p + 1}`), {}, { title: 'P：U 的每一列來自 A 的哪一列', headers: false })];
    r.snap('L = I，U = A', show(), 1);
    for (let k = 0; k < n; k++) {
      let p = k;
      for (let i = k + 1; i < n; i++) if (Math.abs(U[i][k]) > Math.abs(U[p][k])) p = i;
      if (p !== k) {
        [U[p], U[k]] = [U[k], U[p]];
        [perm[p], perm[k]] = [perm[k], perm[p]];
        for (let j = 0; j < k; j++) [L[p][j], L[k][j]] = [L[k][j], L[p][j]];
        r.snap(`第 ${k + 1} 欄 |主元| 最大在第 ${p + 1} 列：交換 U、P，以及 L 已算好的前 ${k} 欄`, show({ ...rowHL(k, n, 'swap'), ...rowHL(p, n, 'swap') }, Object.fromEntries(Array.from({ length: k }, (_, j) => [[`${k},${j}`, 'swap' as Color], [`${p},${j}`, 'swap' as Color]]).flat())), 4);
      }
      if (Math.abs(U[k][k]) < 1e-12) { r.snap(`U[${k + 1}][${k + 1}] = 0，整欄都找不到非零主元 → 矩陣奇異（不可逆），無法完成 LU 分解`, [...show({ [`${k},${k}`]: 'bad' }), vars({ 結果: '奇異矩陣' }, undefined, { 結果: 'bad' })], 5); return r.frames; }
      for (let i = k + 1; i < n; i++) {
        const f = U[i][k] / U[k][k];
        L[i][k] = f;
        for (let j = k; j < n; j++) U[i][j] -= f * U[k][j];
        U[i][k] = 0;
        r.snap(`L[${i + 1}][${k + 1}] = ${f4(f)}，U 的第 ${i + 1} 列 −= ${f4(f)} × 第 ${k + 1} 列`, show({ ...rowHL(i, n, 'compare'), [`${k},${k}`]: 'special' }, { [`${i},${k}`]: 'active' }), 8);
      }
    }
    const PA = matMul(Pm(), A), LU = matMul(L, U);
    const err = maxErr(PA, LU);
    r.snap(`完成：PA 與 LU 的最大差 ${err.toExponential(2)}${err < 1e-9 ? '，分解正確' : '，有誤差！'}`, [mt(PA, {}, { title: 'PA', w: 'half' }), mt(LU, {}, { title: 'LU', w: 'half' }), ...show()], 9);
    return r.frames;
  },
};

// ---------------- QR 分解 ----------------
const qrDecomp: AlgoDef = {
  id: 'qr-decomposition', name: 'QR 分解', en: 'QR Decomposition (Modified Gram–Schmidt)', cat,
  desc: '把 m×n 矩陣（m ≥ n、各欄線性獨立）分解成 A = QR：Q 的各欄是單位長、彼此正交的向量，R 是上三角矩陣。修正版 Gram–Schmidt 逐欄處理：先依序扣掉在前面每個 q 上的投影（每扣一次就用更新後的向量計算下一個投影，比古典版數值穩定），剩下的部分正規化成新的 q。最後檢查 QᵀQ = I 與 QR = A。2 列的矩陣會同時畫出向量。',
  time: 'O(mn²)', space: 'O(mn)',
  code: ['for j = 0 .. n−1:', '  v = A 的第 j 欄', '  for i = 0 .. j−1:', '    R[i][j] = q_i · v；v −= R[i][j] · q_i   (扣掉投影)', '  R[j][j] = ‖v‖；若 ≈ 0：與前面的欄線性相依', '  q_j = v / R[j][j]', '驗證 QᵀQ = I、QR = A'],
  inputs: [inText('m', '矩陣 A（每行一列，m ≥ n）', '12 -51 4\n6 167 -68\n-4 24 -41', () => rnd.pick(['3 1\n1 2', '1 1 0\n1 0 1\n0 1 1', '2 -1\n1 3', '1 2\n2 4']) + '', true)],
  run({ m }) {
    const r = new Rec();
    const A = parseMatrix(m, '矩陣');
    const rows = A.length, n = A[0].length;
    if (rows < n) throw new Error('需要 m ≥ n（列數不少於欄數）');
    if (rows > 6 || n > 6) throw new Error('最多 6×6');
    const col = (M: number[][], j: number) => M.map((rw) => rw[j]);
    const Q: number[][] = A.map(() => new Array(n).fill(NaN));
    const R: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    const qs: number[][] = [];
    const plot2 = (v?: number[]): Panel[] => {
      if (rows !== 2) return [];
      const segs: PlotPanel['segments'] = [];
      for (let j = 0; j < n; j++) segs!.push({ x1: 0, y1: 0, x2: A[0][j], y2: A[1][j], color: 'muted', width: 2 });
      qs.forEach((q) => segs!.push({ x1: 0, y1: 0, x2: q[0], y2: q[1], color: 'done', width: 3 }));
      if (v) segs!.push({ x1: 0, y1: 0, x2: v[0], y2: v[1], color: 'swap', width: 2 });
      const all = [...A[0], ...A[1], 1, -1, ...(v ?? [])];
      const B = Math.max(...all.map(Math.abs)) * 1.15;
      return [{ type: 'plot', axes: true, square: true, bounds: [-B, B, -B, B], segments: segs, circles: [{ x: 0, y: 0, r: 1, color: 'muted' }], title: '灰：A 的欄；綠：q；橘：目前的 v' } as PlotPanel];
    };
    const show = (hlQ: CM = {}, hlR: CM = {}, v?: number[]) => [table(Q.map((rw) => rw.map((x) => (Number.isNaN(x) ? '' : f4(x)))), hlQ, { title: 'Q', w: 'half' }), mt(R, hlR, { title: 'R', w: 'half' }), ...plot2(v)];
    r.snap('逐欄做 Gram–Schmidt 正交化', [mt(A, {}, { title: 'A' }), ...show()], 1);
    for (let j = 0; j < n; j++) {
      const v = col(A, j);
      r.snap(`取出 A 的第 ${j + 1} 欄 v = (${v.map(f4).join(', ')})`, show({}, {}, v), 2);
      for (let i = 0; i < j; i++) {
        R[i][j] = dot(qs[i], v);
        for (let k = 0; k < rows; k++) v[k] -= R[i][j] * qs[i][k];
        r.snap(`R[${i + 1}][${j + 1}] = q${i + 1} · v = ${f4(R[i][j])}，扣掉投影後 v = (${v.map(f4).join(', ')})`, show(Object.fromEntries(Q.map((_, k) => [`${k},${i}`, 'compare' as Color])), { [`${i},${j}`]: 'active' }, [...v]), 4);
      }
      const nv = norm(v);
      if (nv < 1e-9) { R[j][j] = 0; r.snap(`‖v‖ ≈ 0：第 ${j + 1} 欄是前面各欄的線性組合（欄線性相依），無法得到新的正交方向`, [...show({}, { [`${j},${j}`]: 'bad' }), vars({ 結果: '欄線性相依（秩不足）' }, undefined, { 結果: 'bad' })], 5); return r.frames; }
      R[j][j] = nv;
      const q = v.map((x) => x / nv);
      qs.push(q);
      q.forEach((x, k) => { Q[k][j] = x; });
      r.snap(`R[${j + 1}][${j + 1}] = ‖v‖ = ${f4(nv)}，q${j + 1} = v / ‖v‖`, show(Object.fromEntries(Q.map((_, k) => [`${k},${j}`, 'done' as Color])), { [`${j},${j}`]: 'special' }), 6);
    }
    const QtQ = matMul(Q[0].map((_, i) => Q.map((rw) => rw[i])), Q);
    const I = QtQ.map((rw, i) => rw.map((_, j) => (i === j ? 1 : 0)));
    const e1 = maxErr(QtQ, I), e2 = maxErr(matMul(Q, R), A);
    r.snap(`QᵀQ 與 I 最大差 ${e1.toExponential(2)}；QR 與 A 最大差 ${e2.toExponential(2)}${e1 < 1e-9 && e2 < 1e-9 ? '，分解正確' : ''}`, [mt(QtQ, {}, { title: 'QᵀQ', w: 'half' }), mt(matMul(Q, R), {}, { title: 'QR', w: 'half' }), ...show()], 7);
    return r.frames;
  },
};

// ---------------- 冪迭代 ----------------
const powerIter: AlgoDef = {
  id: 'power-iteration', name: '冪迭代法', en: 'Power Iteration', cat,
  desc: '反覆計算 x ← Ax / ‖Ax‖，x 中屬於主特徵向量（|λ| 最大）的成分會以 |λ₁/λ₂|^k 的速度壓過其他成分，Rayleigh 商 xᵀAx 收斂到主特徵值 λ₁。條件：|λ₁| 必須嚴格大於其他特徵值的絕對值，而且起始向量在主特徵向量方向上有分量。若 |λ₁| = |λ₂|（例如對稱的交換矩陣），方向會來回擺盪不收斂。2×2 矩陣會畫出向量在單位圓上的軌跡。',
  time: '每步 O(n²)', space: 'O(n)',
  code: ['x = 起始向量 / ‖·‖', 'repeat:', '  y = A x', '  λ = xᵀ y          (Rayleigh 商)', '  x_new = y / ‖y‖', '  if ‖x_new ∓ x‖ < ε: 收斂（方向不再改變）', '  x = x_new', '收斂速度 ∝ |λ₂/λ₁|；|λ₁| = |λ₂| 時可能不收斂'],
  inputs: [inText('m', '方陣 A', '2 1\n1 3', () => rnd.pick(['2 1\n1 3', '4 1\n2 3', '0 1\n1 0', '1 2 0\n2 1 0\n0 0 -1', '5 4\n1 2', '2 0 0\n0 1 0\n0 0 3']), true), inText('x0', '起始向量 x₀', '1 0', (c) => new Array(parseMatrix(c.m).length).fill(0).map((_, i) => (i ? rnd.int(0, 2) : 1)).join(' ')), inNum('steps', '最多步數', 30, 1, 200)],
  run({ m, x0, steps }) {
    const r = new Rec();
    const A = parseMatrix(m, '矩陣');
    const n = A.length;
    if (A[0].length !== n) throw new Error('需要方陣');
    let x = vecIn(x0, n, '起始向量');
    if (norm(x) < 1e-12) throw new Error('起始向量不可為零向量');
    x = x.map((v) => v / norm(x));
    const rows: (string | number)[][] = [];
    const trail: number[][] = [x];
    const lams: Pt[] = [];
    const plots = (): Panel[] => {
      const out: Panel[] = [];
      if (n === 2) out.push({ type: 'plot', axes: true, square: true, bounds: [-1.3, 1.3, -1.3, 1.3], circles: [{ x: 0, y: 0, r: 1, color: 'muted' }], segments: trail.map((v, i) => ({ x1: 0, y1: 0, x2: v[0], y2: v[1], color: (i === trail.length - 1 ? 'swap' : 'muted') as Color, width: i === trail.length - 1 ? 3 : 1 })), title: '單位圓上的 x_k', w: 'half' });
      if (lams.length > 1) { const ys = lams.map((p) => p[1]); out.push({ type: 'plot', axes: true, bounds: [0, lams.length, Math.min(...ys) - 0.5, Math.max(...ys) + 0.5], curves: [{ pts: lams, color: 'active', width: 2 }], points: lams.map(([a, b]) => ({ x: a, y: b, r: 3, color: 'active' as Color })), title: 'λ 估計值', w: n === 2 ? 'half' : undefined }); }
      return out;
    };
    const tbl = () => table(rows.slice(-8), {}, { colHeaders: ['步', 'λ（Rayleigh）', 'x', '‖Δx‖'] });
    r.snap(`x₀ 正規化為 (${x.map(f4).join(', ')})`, [...plots(), vars({ x: x.map(f4).join(', ') })], 1);
    let lam = NaN, converged = false;
    for (let k = 1; k <= steps; k++) {
      const y = matVec(A, x);
      lam = dot(x, y);
      const ny = norm(y);
      if (ny < 1e-14) { r.snap('Ax = 0：起始向量落在零空間，無法繼續', [vars({ 結果: '失敗' }, undefined, { 結果: 'bad' })], 3); return r.frames; }
      const xn = y.map((v) => v / ny);
      const d = Math.min(norm(xn.map((v, i) => v - x[i])), norm(xn.map((v, i) => v + x[i])));
      rows.push([k, f6(lam), xn.map(f4).join(', '), d.toExponential(2)]);
      lams.push([k, lam]);
      x = xn;
      trail.push(x);
      if (k <= 15 || d < 1e-10 || k % 10 === 0) r.snap(`第 ${k} 步：λ ≈ ${f6(lam)}，方向變化 ${d.toExponential(2)}`, [...plots(), tbl()], d < 1e-10 ? 6 : 4);
      if (d < 1e-10) { converged = true; break; }
    }
    const res = norm(matVec(A, x).map((v, i) => v - lam * x[i]));
    if (converged) r.snap(`收斂：主特徵值 λ₁ ≈ ${f6(lam)}，特徵向量 (${x.map(f4).join(', ')})；殘差 ‖Ax − λx‖ = ${res.toExponential(2)}`, [...plots(), tbl(), vars({ λ1: f6(lam), 殘差: res.toExponential(2) }, undefined, { λ1: 'done' })], 6);
    else r.snap(`${steps} 步內方向沒有收斂（殘差 ${res.toExponential(2)}）：多半是有兩個絕對值相同的最大特徵值（如 ±λ），x 會在兩個方向間擺盪`, [...plots(), tbl(), vars({ 結果: '不收斂' }, undefined, { 結果: 'bad' })], 8);
    return r.frames;
  },
};

// ---------------- 共軛梯度 ----------------
const conjGrad: AlgoDef = {
  id: 'conjugate-gradient', name: '共軛梯度法', en: 'Conjugate Gradient', cat,
  desc: '解 Ax = b，A 必須是對稱正定矩陣——此時解就是二次函數 f(x) = ½xᵀAx − bᵀx 的最小值。最速下降法沿負梯度（殘差 r）走，在細長的等高線上會來回鋸齒；共軛梯度每次的方向 p 都與之前所有方向「A-共軛」（pᵢᵀApⱼ = 0），不會破壞已經做好的部分，理論上至多 n 步就得到精確解。先用 Cholesky 檢查正定性；2×2 時畫出等高線並與最速下降比較。',
  time: '每步 O(n²)，至多 n 步', space: 'O(n)',
  code: ['檢查 A 對稱且正定（Cholesky 成功）', 'x = 0，r = b − Ax，p = r', 'for k = 0 .. n−1:', '  α = rᵀr / pᵀAp', '  x += α p；r_new = r − α A p', '  if ‖r_new‖ < ε: 停止', '  β = r_newᵀr_new / rᵀr；p = r_new + β p', '理論上至多 n 步得到精確解'],
  inputs: [inText('m', '對稱正定矩陣 A', '3 2\n2 6', () => rnd.pick(['3 2\n2 6', '4 1\n1 3', '10 -3\n-3 1', '4 1 0\n1 3 1\n0 1 2', '1 2\n2 1']), true), inText('b', '右側 b', '2 -8', (c) => randInt(parseMatrix(c.m).length, -8, 8).join(' '))],
  run({ m, b: bs }) {
    const r = new Rec();
    const A = parseMatrix(m, '矩陣');
    const n = A.length;
    if (A[0].length !== n) throw new Error('需要方陣');
    const b = vecIn(bs, n, 'b');
    if (A.some((rw, i) => rw.some((v, j) => Math.abs(v - A[j][i]) > 1e-12))) { r.snap('A 不對稱：共軛梯度法只適用於對稱正定矩陣（非對稱可改用 GMRES、BiCGSTAB）', [mt(A, {}, { title: 'A' }), vars({ 條件: '不對稱' }, undefined, { 條件: 'bad' })], 1); return r.frames; }
    const Lc = A.map(() => new Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
      let s = A[i][j];
      for (let k = 0; k < j; k++) s -= Lc[i][k] * Lc[j][k];
      if (i === j) { if (s <= 1e-12) { r.snap(`Cholesky 在第 ${i + 1} 個對角元素得到 ${f4(s)} ≤ 0：A 不是正定矩陣，二次函數沒有最小值，共軛梯度法不保證收斂`, [mt(A, {}, { title: 'A' }), vars({ 條件: '非正定' }, undefined, { 條件: 'bad' })], 1); return r.frames; } Lc[i][i] = Math.sqrt(s); }
      else Lc[i][j] = s / Lc[j][j];
    }
    r.snap('A 對稱，且 Cholesky 分解成功 → 正定，可以使用共軛梯度法', [mt(A, {}, { title: 'A', w: 'half' }), mt(Lc, {}, { title: 'Cholesky L', w: 'half' })], 1);
    const xs = (() => { const y = new Array(n).fill(0); for (let i = 0; i < n; i++) { let s = b[i]; for (let k = 0; k < i; k++) s -= Lc[i][k] * y[k]; y[i] = s / Lc[i][i]; } const x = new Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = y[i]; for (let k = i + 1; k < n; k++) s -= Lc[k][i] * x[k]; x[i] = s / Lc[i][i]; } return x; })();
    // 2×2 時畫等高線與最速下降的路徑
    const sdPath: Pt[] = [];
    let contour: Pt[][] = [];
    if (n === 2) {
      let x = [0, 0];
      sdPath.push([0, 0]);
      for (let k = 0; k < 25; k++) { const rr = b.map((v, i) => v - matVec(A, x)[i]); const rr2 = dot(rr, rr); if (rr2 < 1e-20) break; const a = rr2 / dot(rr, matVec(A, rr)); x = x.map((v, i) => v + a * rr[i]); sdPath.push([x[0], x[1]]); }
      const tr = A[0][0] + A[1][1], det = A[0][0] * A[1][1] - A[0][1] ** 2, disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
      const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
      const v1 = Math.abs(A[0][1]) > 1e-12 ? [l1 - A[1][1], A[0][1]] : A[0][0] >= A[1][1] ? [1, 0] : [0, 1];
      const nv = norm(v1), u1 = [v1[0] / nv, v1[1] / nv], u2 = [-u1[1], u1[0]];
      const c0 = 0.5 * dot(xs, matVec(A, xs));
      contour = [0.04, 0.2, 0.5, 1, 1.6].map((t) => { const c = c0 * t; return Array.from({ length: 73 }, (_, i) => { const th = (i / 72) * Math.PI * 2; const a = Math.sqrt((2 * c) / l1) * Math.cos(th), bb = Math.sqrt((2 * c) / l2) * Math.sin(th); return [xs[0] + a * u1[0] + bb * u2[0], xs[1] + a * u1[1] + bb * u2[1]] as Pt; }); });
    }
    const cgPath: Pt[] = [];
    const plot = (): Panel[] => {
      if (n !== 2) return [];
      const all = [...contour.flat(), ...sdPath];
      const xsA = all.map((p) => p[0]), ysA = all.map((p) => p[1]);
      return [{ type: 'plot', axes: true, square: true, bounds: [Math.min(...xsA), Math.max(...xsA), Math.min(...ysA), Math.max(...ysA)], curves: [...contour.map((pts) => ({ pts, color: 'muted' as Color, width: 1 })), { pts: sdPath, color: 'bad', width: 1 }, { pts: cgPath, color: 'done', width: 3 }], points: [...cgPath.map(([a, c]) => ({ x: a, y: c, color: 'done' as Color, r: 5 })), { x: xs[0], y: xs[1], color: 'special', r: 4, label: 'x*' }], title: `綠：共軛梯度；紅：最速下降（${sdPath.length - 1} 步）` }];
    };
    let x = new Array(n).fill(0);
    let rv = b.map((v, i) => v - matVec(A, x)[i]);
    let p = [...rv];
    cgPath.push([x[0], x[1] ?? 0]);
    const rows: (string | number)[][] = [];
    const tbl = () => table(rows, {}, { colHeaders: ['k', 'α', 'β', 'x', '‖r‖'] });
    r.snap(`x = 0，r = b = (${rv.map(f4).join(', ')})，第一個方向 p = r`, [...plot(), vars({ '‖r‖': f6(norm(rv)) })], 2);
    for (let k = 0; k < n + 5; k++) {
      const Ap = matVec(A, p);
      const rr = dot(rv, rv);
      const alpha = rr / dot(p, Ap);
      x = x.map((v, i) => v + alpha * p[i]);
      const rn = rv.map((v, i) => v - alpha * Ap[i]);
      cgPath.push([x[0], x[1] ?? 0]);
      const done = norm(rn) < 1e-10;
      const beta = done ? 0 : dot(rn, rn) / rr;
      rows.push([k + 1, f6(alpha), done ? '—' : f6(beta), x.map(f4).join(', '), norm(rn).toExponential(2)]);
      r.snap(`第 ${k + 1} 步：α = ${f6(alpha)}，x = (${x.map(f4).join(', ')})，‖r‖ = ${norm(rn).toExponential(2)}`, [...plot(), tbl()], done ? 6 : 5);
      if (done) break;
      p = rn.map((v, i) => v + beta * p[i]);
      rv = rn;
      r.snap(`β = ${f6(beta)}，新方向 p = r + βp 與之前的方向 A-共軛`, [...plot(), tbl()], 7);
    }
    r.snap(`共軛梯度在 ${rows.length} 步（n = ${n}）收斂到 x = (${x.map(f6).join(', ')})；直接解為 (${xs.map(f6).join(', ')})${n === 2 ? `；最速下降同樣精度需要 ${sdPath.length - 1} 步以上` : ''}`, [...plot(), tbl()], 8);
    return r.frames;
  },
};

// ---------------- 割線法 ----------------
type Fn = { f: (x: number) => number; label: string; range: [number, number] };
const SECANT_FNS: Record<string, Fn> = {
  cubic: { f: (x) => x ** 3 - 2 * x - 5, label: 'x³ − 2x − 5', range: [-1, 4] },
  cos: { f: (x) => Math.cos(x) - x, label: 'cos x − x', range: [-1, 3] },
  sqrt2: { f: (x) => x * x - 2, label: 'x² − 2', range: [-2.5, 2.5] },
  atan: { f: (x) => Math.atan(x), label: 'arctan x（初始點太遠會發散）', range: [-8, 8] },
};
const secant: AlgoDef = {
  id: 'secant-method', name: '割線法', en: 'Secant Method', cat,
  desc: '和牛頓法類似，但不需要導數：用最近兩個點 (x₀, f(x₀))、(x₁, f(x₁)) 連成割線，取它與 x 軸的交點當下一個猜測。收斂階約 1.618（黃金比例），介於二分法與牛頓法之間。缺點：不像二分法保證包住根，可能發散；若 f(x₀) ≈ f(x₁)，割線接近水平、分母趨近 0，必須停止。',
  time: '每步一次函數求值，超線性收斂', space: 'O(1)',
  code: ['給定 x0, x1', 'repeat:', '  if |f(x1) − f(x0)| ≈ 0: 割線水平，停止', '  x2 = x1 − f(x1)·(x1 − x0) / (f(x1) − f(x0))', '  if |x2 − x1| < ε: 收斂', '  x0, x1 = x1, x2', '超過步數或 |x| 爆增：不收斂'],
  inputs: [inSelect('fn', '函數 f(x)', Object.entries(SECANT_FNS).map(([k, v]) => [k, v.label])), inText('x0', 'x₀', '1', () => String(rnd.int(-2, 3))), inText('x1', 'x₁', '3', (c) => String(Number(c.x0) + rnd.pick([-2, -1, 1, 2, 3])))],
  run({ fn, x0: s0, x1: s1 }) {
    const r = new Rec();
    const F = SECANT_FNS[fn];
    let x0 = Number(s0), x1 = Number(s1);
    if (!Number.isFinite(x0) || !Number.isFinite(x1)) throw new Error('x₀、x₁ 必須是數字');
    if (x0 === x1) throw new Error('x₀ 與 x₁ 不可相同');
    const rows: (string | number)[][] = [];
    const segs: PlotPanel['segments'] = [];
    const hist: number[] = [x0, x1];
    const plot = (extra: PlotPanel['points'] = []): PlotPanel => {
      const lo = Math.min(F.range[0], ...hist.filter((v) => Math.abs(v) < 60)), hi = Math.max(F.range[1], ...hist.filter((v) => Math.abs(v) < 60));
      const pts = Array.from({ length: 161 }, (_, i) => { const x = lo + ((hi - lo) * i) / 160; return [x, F.f(x)] as Pt; });
      const ys = pts.map((p) => p[1]);
      return { type: 'plot', axes: true, bounds: [lo, hi, Math.min(...ys), Math.max(...ys)], curves: [{ pts }], segments: [...segs!], points: extra };
    };
    const tbl = () => table(rows, {}, { colHeaders: ['步', 'x0', 'x1', 'x2', 'f(x2)'] });
    r.snap(`初始點 x₀ = ${x0}、x₁ = ${x1}`, [plot([{ x: x0, y: F.f(x0), color: 'active', label: 'x0' }, { x: x1, y: F.f(x1), color: 'active', label: 'x1' }])], 1);
    for (let k = 1; k <= 25; k++) {
      const f0 = F.f(x0), f1 = F.f(x1);
      if (Math.abs(f1 - f0) < 1e-14) { r.snap(`f(x₀) = ${f6(f0)} 與 f(x₁) = ${f6(f1)} 幾乎相等：割線水平、分母 ≈ 0，無法求交點`, [plot([{ x: x0, y: f0, color: 'bad' }, { x: x1, y: f1, color: 'bad' }]), tbl(), vars({ 結果: '分母趨近 0' }, undefined, { 結果: 'bad' })], 3); return r.frames; }
      const x2 = x1 - (f1 * (x1 - x0)) / (f1 - f0);
      rows.push([k, f6(x0), f6(x1), f6(x2), Number.isFinite(F.f(x2)) ? F.f(x2).toExponential(3) : 'NaN']);
      segs!.push({ x1: x0, y1: f0, x2, y2: 0, color: 'swap', width: 1.5 });
      hist.push(x2);
      r.snap(`第 ${k} 步：割線交 x 軸於 x₂ = ${f6(x2)}`, [plot([{ x: x0, y: f0, color: 'active' }, { x: x1, y: f1, color: 'active' }, { x: x2, y: 0, color: 'bad', label: 'x2' }]), tbl()], 4);
      if (!Number.isFinite(x2) || Math.abs(x2) > 1e6) { r.snap(`|x| 爆增到 ${f4(x2)}：發散，割線法不保證收斂（初始點離根太遠或函數太平）`, [tbl(), vars({ 結果: '發散' }, undefined, { 結果: 'bad' })], 7); return r.frames; }
      if (Math.abs(x2 - x1) < 1e-12) { r.snap(`收斂：根 ≈ ${x2.toFixed(12)}（f = ${F.f(x2).toExponential(2)}），共 ${k} 步`, [plot([{ x: x2, y: 0, color: 'done', label: '根' }]), tbl()], 5); return r.frames; }
      x0 = x1; x1 = x2;
    }
    r.snap('25 步內沒有收斂', [tbl(), vars({ 結果: '不收斂' }, undefined, { 結果: 'bad' })], 7);
    return r.frames;
  },
};

// ---------------- 辛普森積分 ----------------
const INTEG: Record<string, { f: (x: number) => number; label: string; a: number; b: number; exact: number; exactLabel: string }> = {
  sin: { f: Math.sin, label: '∫₀^π sin x dx', a: 0, b: Math.PI, exact: 2, exactLabel: '2' },
  pi: { f: (x) => 4 / (1 + x * x), label: '∫₀¹ 4/(1+x²) dx', a: 0, b: 1, exact: Math.PI, exactLabel: 'π' },
  exp: { f: Math.exp, label: '∫₀¹ eˣ dx', a: 0, b: 1, exact: Math.E - 1, exactLabel: 'e − 1' },
  cubic: { f: (x) => x ** 3 - 2 * x + 1, label: '∫₀² (x³ − 2x + 1) dx（三次多項式，辛普森恰好精確）', a: 0, b: 2, exact: 2, exactLabel: '2' },
  sqrt: { f: Math.sqrt, label: '∫₀¹ √x dx（端點導數無界，收斂較慢）', a: 0, b: 1, exact: 2 / 3, exactLabel: '2/3' },
};
const simpsonSum = (f: (x: number) => number, a: number, b: number, n: number) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return (s * h) / 3; };
const trapSum = (f: (x: number) => number, a: number, b: number, n: number) => { const h = (b - a) / n; let s = (f(a) + f(b)) / 2; for (let i = 1; i < n; i++) s += f(a + i * h); return s * h; };
const simpson: AlgoDef = {
  id: 'simpson-rule', name: '辛普森積分法', en: "Composite Simpson's Rule", cat,
  desc: '把 [a, b] 分成 n 等分（n 必須是偶數），每兩個小區間用通過三個點的拋物線近似，拋物線下的面積是 h/3·(f₀ + 4f₁ + f₂)。全部加起來得到係數 1, 4, 2, 4, …, 2, 4, 1。誤差 O(h⁴)：等分數加倍，誤差約縮小 16 倍；對三次以下的多項式完全精確。與梯形法（誤差 O(h²)）比較。',
  time: 'O(n)', space: 'O(1)',
  code: ['要求 n 為偶數，h = (b − a) / n', 'S = f(a) + f(b)', 'for i = 1 .. n−1:', '  S += (i 奇數 ? 4 : 2) · f(a + i·h)', 'return S · h / 3', '每一對區間 [x₂ₖ, x₂ₖ₊₂] 上即是一條拋物線的面積'],
  inputs: [inSelect('fn', '積分', Object.entries(INTEG).map(([k, v]) => [k, v.label])), inNum('n', '等分數 n（偶數）', 6, 2, 64, () => 2 * rnd.int(1, 8))],
  run({ fn, n }) {
    const r = new Rec();
    const F = INTEG[fn];
    if (!Number.isInteger(n) || n < 2) throw new Error('n 至少為 2');
    if (n % 2) throw new Error(`n = ${n} 是奇數：複合辛普森法每次用兩個小區間配一條拋物線，等分數必須是偶數`);
    const { a, b, f } = F;
    const h = (b - a) / n;
    const xs = Array.from({ length: n + 1 }, (_, i) => a + i * h);
    const curve = Array.from({ length: 161 }, (_, i) => { const x = a + ((b - a) * i) / 160; return [x, f(x)] as Pt; });
    const ys = curve.map((p) => p[1]);
    const bounds: [number, number, number, number] = [a - (b - a) * 0.05, b + (b - a) * 0.05, Math.min(0, ...ys), Math.max(...ys) * 1.1];
    const polys: PlotPanel['polygons'] = [];
    const parabola = (k: number) => {
      const [x0, x1, x2] = [xs[2 * k], xs[2 * k + 1], xs[2 * k + 2]], [y0, y1, y2] = [f(x0), f(x1), f(x2)];
      const L = (x: number) => y0 * ((x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2)) + y1 * ((x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2)) + y2 * ((x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));
      return Array.from({ length: 21 }, (_, i) => { const x = x0 + ((x2 - x0) * i) / 20; return [x, L(x)] as Pt; });
    };
    const plot = (cur = -1): PlotPanel => ({ type: 'plot', axes: true, bounds, polygons: [...polys!], curves: [{ pts: curve, color: 'default', width: 2 }, ...(cur >= 0 ? [{ pts: parabola(cur), color: 'swap' as Color, width: 2 }] : [])], points: xs.map((x, i) => ({ x, y: f(x), r: 3, color: (i % 2 ? 'compare' : 'active') as Color })) });
    const coef = xs.map((_, i) => (i === 0 || i === n ? 1 : i % 2 ? 4 : 2));
    r.snap(`h = (${f4(b)} − ${f4(a)}) / ${n} = ${f6(h)}；係數 ${coef.join(' ')}`, [plot(), cells(coef, {}, { title: '係數（× h/3）', headers: xs.map((_, i) => 'x' + i) })], 1);
    let S = 0;
    for (let k = 0; k < n / 2; k++) {
      const part = (h / 3) * (f(xs[2 * k]) + 4 * f(xs[2 * k + 1]) + f(xs[2 * k + 2]));
      S += part;
      polys!.push({ pts: [[xs[2 * k], 0], ...parabola(k), [xs[2 * k + 2], 0]], color: k % 2 ? 'frontier' : 'active', fill: true });
      r.snap(`第 ${k + 1} 條拋物線：[${f4(xs[2 * k])}, ${f4(xs[2 * k + 2])}] 面積 = h/3·(f₀ + 4f₁ + f₂) = ${f6(part)}，累計 ${f6(S)}`, [plot(k), vars({ 本段: f6(part), 累計: f6(S) })], 6);
    }
    const T = trapSum(f, a, b, n);
    const errRows = [n, 2 * n, 4 * n].map((m) => [m, simpsonSum(f, a, b, m).toFixed(10), Math.abs(simpsonSum(f, a, b, m) - F.exact).toExponential(2), Math.abs(trapSum(f, a, b, m) - F.exact).toExponential(2)]);
    r.snap(`辛普森 ≈ ${S.toFixed(10)}，梯形法 ≈ ${T.toFixed(10)}，真值 ${F.exactLabel} = ${F.exact.toFixed(10)}`, [plot(), table(errRows, {}, { title: '等分數加倍時的誤差', colHeaders: ['n', '辛普森', '辛普森誤差', '梯形誤差'] })], 5);
    return r.frames;
  },
};

// ---------------- Runge–Kutta 4 ----------------
const ODES: Record<string, { f: (t: number, y: number) => number; exact: (t: number) => number; label: string; y0: number; T: number }> = {
  growth: { f: (_t, y) => y, exact: Math.exp, label: "y′ = y，y(0) = 1（解 eᵗ）", y0: 1, T: 2 },
  gauss: { f: (t, y) => -2 * t * y, exact: (t) => Math.exp(-t * t), label: "y′ = −2ty，y(0) = 1（解 e^(−t²)）", y0: 1, T: 2 },
  linear: { f: (t, y) => t - y, exact: (t) => t - 1 + 2 * Math.exp(-t), label: "y′ = t − y，y(0) = 1（解 t − 1 + 2e^(−t)）", y0: 1, T: 3 },
  osc: { f: (t) => Math.cos(t), exact: Math.sin, label: "y′ = cos t，y(0) = 0（解 sin t）", y0: 0, T: 6 },
};
const rk4: AlgoDef = {
  id: 'runge-kutta-4', name: '四階 Runge–Kutta 法', en: 'Runge–Kutta 4 (RK4)', cat,
  desc: '解常微分方程 y′ = f(t, y)。歐拉法每步只用起點的斜率，誤差 O(h)；RK4 在一步內取四個斜率：起點 k₁、用 k₁ 走半步的中點 k₂、用 k₂ 走半步的中點 k₃、用 k₃ 走一整步的終點 k₄，再以 1:2:2:1 加權平均，整體誤差 O(h⁴)。下方與解析解及歐拉法比較；步長減半時 RK4 誤差約縮小 16 倍。',
  time: '每步 4 次 f 求值', space: 'O(1)',
  code: ['t = 0，y = y₀', 'for 每一步:', '  k₁ = f(t, y)', '  k₂ = f(t + h/2, y + h·k₁/2)', '  k₃ = f(t + h/2, y + h·k₂/2)', '  k₄ = f(t + h, y + h·k₃)', '  y += h·(k₁ + 2k₂ + 2k₃ + k₄) / 6；t += h'],
  inputs: [inSelect('ode', '微分方程', Object.entries(ODES).map(([k, v]) => [k, v.label])), inSelect('h', '步長 h', [['0.5', '0.5'], ['0.25', '0.25'], ['0.1', '0.1']], '0.5')],
  run({ ode, h: hs }) {
    const r = new Rec();
    const O = ODES[ode];
    const h = Number(hs);
    const N = Math.round(O.T / h);
    const exactPts = Array.from({ length: 121 }, (_, i) => { const t = (O.T * i) / 120; return [t, O.exact(t)] as Pt; });
    const rkPts: Pt[] = [[0, O.y0]], euPts: Pt[] = [[0, O.y0]];
    const ys = exactPts.map((p) => p[1]);
    const lo = Math.min(...ys), hi = Math.max(...ys), pad = (hi - lo) * 0.15 + 0.1;
    const rows: (string | number)[][] = [[0, f6(O.y0), f6(O.y0), f6(O.y0), 0]];
    const plot = (segs: PlotPanel['segments'] = []): PlotPanel => ({ type: 'plot', axes: true, bounds: [-0.05 * O.T, O.T * 1.05, lo - pad, hi + pad], curves: [{ pts: exactPts, color: 'muted', width: 2 }, { pts: [...euPts], color: 'bad', width: 1 }, { pts: [...rkPts], color: 'done', width: 2 }], points: [...rkPts.map(([t, y]) => ({ x: t, y, r: 4, color: 'done' as Color })), ...euPts.map(([t, y]) => ({ x: t, y, r: 3, color: 'bad' as Color }))], segments: segs, title: '灰：解析解；綠：RK4；紅：歐拉法' });
    const tbl = () => table(rows.slice(-8), {}, { colHeaders: ['t', 'RK4', '歐拉', '解析解', 'RK4 誤差'] });
    r.snap(`${O.label}，h = ${h}，共 ${N} 步`, [plot(), tbl()], 1);
    let t = 0, y = O.y0, ye = O.y0;
    for (let k = 0; k < N; k++) {
      const k1 = O.f(t, y), k2 = O.f(t + h / 2, y + (h * k1) / 2), k3 = O.f(t + h / 2, y + (h * k2) / 2), k4 = O.f(t + h, y + h * k3);
      const sl = (tt: number, yy: number, s: number, c: Color) => ({ x1: tt - h * 0.18, y1: yy - s * h * 0.18, x2: tt + h * 0.18, y2: yy + s * h * 0.18, color: c, width: 2.5 });
      const segs = [sl(t, y, k1, 'active'), sl(t + h / 2, y + (h * k1) / 2, k2, 'compare'), sl(t + h / 2, y + (h * k2) / 2, k3, 'frontier'), sl(t + h, y + h * k3, k4, 'special')];
      if (k < 6 || k === N - 1) r.snap(`t = ${f4(t)}：k₁ = ${f4(k1)}、k₂ = ${f4(k2)}、k₃ = ${f4(k3)}、k₄ = ${f4(k4)}（四個斜率畫在圖上）`, [plot(segs), vars({ k1: f6(k1), k2: f6(k2), k3: f6(k3), k4: f6(k4) })], 6);
      ye += h * O.f(t, ye);
      y += (h * (k1 + 2 * k2 + 2 * k3 + k4)) / 6;
      t = (k + 1) * h;
      rkPts.push([t, y]); euPts.push([t, ye]);
      rows.push([f4(t), f6(y), f6(ye), f6(O.exact(t)), Math.abs(y - O.exact(t)).toExponential(2)]);
      if (k < 6 || k === N - 1) r.snap(`y += h·(k₁ + 2k₂ + 2k₃ + k₄)/6 → y(${f4(t)}) ≈ ${f6(y)}（解析解 ${f6(O.exact(t))}）`, [plot(), tbl()], 7);
    }
    const run = (hh: number) => { let tt = 0, yy = O.y0; const n = Math.round(O.T / hh); for (let k = 0; k < n; k++) { const a = O.f(tt, yy), b = O.f(tt + hh / 2, yy + (hh * a) / 2), c = O.f(tt + hh / 2, yy + (hh * b) / 2), d = O.f(tt + hh, yy + hh * c); yy += (hh * (a + 2 * b + 2 * c + d)) / 6; tt = (k + 1) * hh; } return Math.abs(yy - O.exact(O.T)); };
    const e1 = run(h), e2 = run(h / 2);
    r.snap(`t = ${O.T}：RK4 誤差 ${e1.toExponential(2)}，歐拉誤差 ${Math.abs(ye - O.exact(O.T)).toExponential(2)}；步長減半後 RK4 誤差 ${e2.toExponential(2)}（縮小 ${(e1 / e2).toFixed(1)} 倍，接近 16）`, [plot(), tbl()], 7);
    return r.frames;
  },
};

// ---------------- 單純形法 ----------------
const LP_CASES = [
  'max: 3 5\n1 0 <= 4\n0 2 <= 12\n3 2 <= 18',
  'max: 1 1\n1 -1 <= 2\n-1 1 <= 3',
  'max: 1 1\n1 1 <= 2\n1 1 >= 5',
  'min: 2 3\n1 1 >= 4\n1 3 >= 6\n1 0 <= 5',
  'max: 2 1\n1 1 <= 4\n1 0 <= 2\n2 1 <= 6',
  'max: 0.75 -20 0.5 -6\n0.25 -8 -1 9 <= 0\n0.5 -12 -0.5 3 <= 0\n0 0 1 0 <= 1',
];
const simplex: AlgoDef = {
  id: 'simplex-lp', name: '線性規劃單純形法', en: 'Simplex Method (Two-Phase, Bland)', cat,
  desc: '線性規劃的最優解一定出現在可行域的頂點。單純形法從一個頂點出發，每次選一個能讓目標變好的變數進入基底（入基），用最小比值測試決定哪個限制最先卡住（出基），沿著邊走到相鄰頂點，直到沒有變數能再改善。可行域不含原點時（有 ≥ 限制）先用第一階段的人工變數找起始頂點：人工變數無法歸零代表不可行；入基欄沒有正數代表目標可以無限增加（無界）。採用 Bland 法則（都選編號最小者），即使遇到退化（比值為 0）也不會循環。兩個變數時畫出可行域與走過的頂點。',
  time: '最壞指數時間，實務上通常很快', space: 'O(mn)',
  code: ['把每個限制化成 a·x + s = b（b < 0 的列乘 −1 並加人工變數）', '第一階段：最小化人工變數總和；> 0 則不可行', '第二階段：用原目標的 z_j − c_j 選入基', 'repeat:', '  入基 e = 編號最小且 z_e − c_e < 0 的欄（Bland）；沒有則最優', '  出基：對 T[i][e] > 0 的列取最小 RHS / T[i][e]；沒有則無界', '  以 T[l][e] 為主元做列運算（換到相鄰頂點）', 'θ = 0 時為退化步：頂點不動，Bland 法則避免循環'],
  inputs: [inText('lp', '線性規劃（第一行 max: 或 min: 係數；之後每行「係數 <= 或 >= 常數」，x ≥ 0）', LP_CASES[0], () => rnd.pick(LP_CASES), true)],
  run({ lp }) {
    const r = new Rec();
    const lines = String(lp).split('\n').map((s) => s.trim()).filter(Boolean);
    const head = lines[0]?.match(/^(max|min)\s*:?\s*(.*)$/i);
    if (!head) throw new Error('第一行必須是「max: c1 c2 …」或「min: c1 c2 …」');
    const isMin = head[1].toLowerCase() === 'min';
    const c0 = head[2].split(/[\s,]+/).filter(Boolean).map(Number);
    const n = c0.length;
    if (!n || c0.some((v) => !Number.isFinite(v))) throw new Error('目標係數必須是數字');
    const cons = lines.slice(1).map((l, i) => {
      const mm = l.match(/^(.*?)(<=|>=|≤|≥)\s*(\S+)$/);
      if (!mm) throw new Error(`第 ${i + 2} 行格式錯誤，應為「係數 … <= 常數」`);
      const a = mm[1].split(/[\s,]+/).filter(Boolean).map(Number), b = Number(mm[3]);
      if (a.length !== n || a.some((v) => !Number.isFinite(v)) || !Number.isFinite(b)) throw new Error(`第 ${i + 2} 行需要 ${n} 個係數與一個常數`);
      return mm[2] === '>=' || mm[2] === '≥' ? { a: a.map((v) => -v), b: -b } : { a, b };
    });
    const m = cons.length;
    if (!m) throw new Error('至少需要一條限制');
    if (n > 4 || m > 5) throw new Error('最多 4 個變數、5 條限制');
    const c = isMin ? c0.map((v) => -v) : c0;
    const artRows = cons.map((k, i) => (k.b < 0 ? i : -1)).filter((i) => i >= 0);
    const K = artRows.length, N = n + m + K;
    const names = [...Array.from({ length: n }, (_, i) => `x${i + 1}`), ...Array.from({ length: m }, (_, i) => `s${i + 1}`), ...Array.from({ length: K }, (_, i) => `a${i + 1}`)];
    const T: number[][] = [];
    const basis: number[] = [];
    cons.forEach((k, i) => {
      const row = new Array(N + 1).fill(0);
      const sg = k.b < 0 ? -1 : 1;
      k.a.forEach((v, j) => { row[j] = sg * v; });
      row[n + i] = sg;
      row[N] = sg * k.b;
      if (k.b < 0) { const ai = artRows.indexOf(i); row[n + m + ai] = 1; basis.push(n + m + ai); } else basis.push(n + i);
      T.push(row);
    });
    // 兩個變數時的可行域（畫圖用，加一個大方框把無界區域截斷）
    const region = (() => {
      if (n !== 2) return null;
      const scale = Math.max(4, ...cons.map((k) => Math.abs(k.b))) * 1.6;
      const all = [...cons, { a: [-1, 0], b: 0 }, { a: [0, -1], b: 0 }, { a: [1, 0], b: scale }, { a: [0, 1], b: scale }];
      const pts: Pt[] = [];
      for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
        const [a1, b1] = all[i].a, [a2, b2] = all[j].a, d = a1 * b2 - a2 * b1;
        if (Math.abs(d) < 1e-12) continue;
        const x = (all[i].b * b2 - all[j].b * b1) / d, y = (a1 * all[j].b - a2 * all[i].b) / d;
        if (all.every((k) => k.a[0] * x + k.a[1] * y <= k.b + 1e-9)) pts.push([x, y]);
      }
      if (pts.length < 3) return { poly: [] as Pt[], scale };
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      pts.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
      return { poly: pts, scale };
    })();
    const path: Pt[] = [];
    const curX = () => { const x = new Array(n).fill(0); basis.forEach((bj, i) => { if (bj < n) x[bj] = T[i][N]; }); return x; };
    const plot = (): Panel[] => {
      if (!region) return [];
      const S = region.scale;
      const lineSegs = cons.map((k) => { const [a, b] = k.a; const P: Pt[] = []; if (Math.abs(b) > 1e-12) { P.push([-S * 0.1, (k.b + a * S * 0.1) / b], [S, (k.b - a * S) / b]); } else P.push([k.b / a, -S * 0.1], [k.b / a, S]); return { x1: P[0][0], y1: P[0][1], x2: P[1][0], y2: P[1][1], color: 'muted' as Color, dashed: true }; });
      const vis = Math.max(1, ...region.poly.filter((p) => p[0] < S * 0.99 && p[1] < S * 0.99).flat(), ...path.flat()) * 1.25;
      return [{ type: 'plot', axes: true, square: true, bounds: [-vis * 0.08, vis, -vis * 0.08, vis], polygons: region.poly.length ? [{ pts: region.poly, color: 'frontier', fill: true }] : [], segments: lineSegs, curves: path.length > 1 ? [{ pts: path, color: 'swap', width: 2.5 }] : [], points: path.map(([x, y], i) => ({ x, y, r: i === path.length - 1 ? 6 : 4, color: (i === path.length - 1 ? 'bad' : 'swap') as Color })), title: region.poly.length ? '青：可行域；橘：走過的頂點' : '可行域是空集合' }];
    };
    const tab = (cost: number[], allowed: number, hl: CM = {}) => {
      const cols = Array.from({ length: allowed }, (_, j) => j);
      const red = cols.map((j) => basis.reduce((s, bj, i) => s + cost[bj] * T[i][j], 0) - cost[j]);
      const z = basis.reduce((s, bj, i) => s + cost[bj] * T[i][N], 0);
      return table([...T.map((rw) => [...cols.map((j) => f4(rw[j])), f4(rw[N])]), [...red.map(f4), f4(z)]], hl, { colHeaders: [...cols.map((j) => names[j]), 'RHS'], rowHeaders: [...basis.map((bj) => names[bj]), 'z_j − c_j'] });
    };
    const pivot = (pr: number, pc: number) => {
      const pv = T[pr][pc];
      T[pr] = T[pr].map((v) => v / pv);
      for (let i = 0; i < T.length; i++) if (i !== pr && Math.abs(T[i][pc]) > 1e-15) { const f = T[i][pc]; T[i] = T[i].map((v, j) => v - f * T[pr][j]); }
      basis[pr] = pc;
    };
    const solve = (cost: number[], allowed: number, phase: string, startLine: number): 'optimal' | 'unbounded' => {
      for (let it = 0; it < 60; it++) {
        const red = (j: number) => basis.reduce((s, bj, i) => s + cost[bj] * T[i][j], 0) - cost[j];
        let e = -1;
        for (let j = 0; j < allowed; j++) if (!basis.includes(j) && red(j) < -1e-9) { e = j; break; }
        if (e < 0) { r.snap(`${phase}：所有 z_j − c_j ≥ 0，沒有變數能再改善 → 此階段最優`, [tab(cost, allowed), ...plot()], 5); return 'optimal'; }
        let l = -1, best = Infinity;
        for (let i = 0; i < T.length; i++) if (T[i][e] > 1e-9) { const q = T[i][N] / T[i][e]; if (q < best - 1e-12 || (Math.abs(q - best) <= 1e-12 && basis[i] < basis[l])) { best = q; l = i; } }
        const colHL: CM = Object.fromEntries(T.map((_, i) => [`${i},${e}`, 'compare' as Color]));
        if (l < 0) { r.snap(`${phase}：${names[e]} 可以讓目標變好（z − c = ${f4(red(e))}），但這一欄沒有正數，增加 ${names[e]} 永遠不會碰到限制 → 目標無界`, [tab(cost, allowed, { ...colHL, [`${T.length},${e}`]: 'bad' }), ...plot(), vars({ 結果: '無界' }, undefined, { 結果: 'bad' })], 6); return 'unbounded'; }
        r.snap(`${phase}：${names[e]} 入基（z − c = ${f4(red(e))} < 0），最小比值在 ${names[basis[l]]} 那列（θ = ${f4(best)}）→ ${names[basis[l]]} 出基${best < 1e-12 ? '；θ = 0 是退化步，頂點不變' : ''}`, [tab(cost, allowed, { ...colHL, ...rowHL(l, allowed + 1, 'active'), [`${l},${e}`]: 'swap' }), ...plot()], best < 1e-12 ? 8 : startLine);
        pivot(l, e);
        if (n === 2) { const x = curX(); const last = path[path.length - 1]; if (!last || Math.abs(last[0] - x[0]) + Math.abs(last[1] - x[1]) > 1e-9) path.push([x[0], x[1]]); }
        r.snap(`以 ${names[e]} 為主元做列運算，換到相鄰頂點：目前 ${curX().map((v, i) => `x${i + 1} = ${f4(v)}`).join('，')}`, [tab(cost, allowed, rowHL(l, allowed + 1, 'done')), ...plot()], 7);
      }
      throw new Error('迭代次數過多');
    };
    r.snap(`化成標準型：${m} 條限制各加一個鬆弛變數${K ? `；${K} 條右側為負的限制改乘 −1，並加人工變數` : ''}`, [tab(new Array(N).fill(0), N), ...plot()], 1);
    if (K) {
      const cost1 = names.map((_, j) => (j >= n + m ? -1 : 0));
      solve(cost1, N, '第一階段', 4);
      const z1 = basis.reduce((s, bj, i) => s + cost1[bj] * T[i][N], 0);
      if (z1 < -1e-7) { r.snap(`第一階段最優時人工變數總和仍為 ${f4(-z1)} > 0：沒有任何點同時滿足所有限制 → 不可行`, [tab(cost1, N), ...plot(), vars({ 結果: '不可行' }, undefined, { 結果: 'bad' })], 2); return r.frames; }
      for (let i = T.length - 1; i >= 0; i--) {
        if (basis[i] < n + m) continue;
        const j = Array.from({ length: n + m }, (_, k) => k).find((k) => Math.abs(T[i][k]) > 1e-9);
        if (j === undefined) { T.splice(i, 1); basis.splice(i, 1); } else pivot(i, j);
      }
      if (n === 2) { const x = curX(); path.push([x[0], x[1]]); }
      r.snap('人工變數全部歸零，找到起始可行頂點；刪去人工變數欄，進入第二階段', [tab(names.map((_, j) => (j < n ? c[j] : 0)), n + m), ...plot()], 2);
    } else if (n === 2) path.push([0, 0]);
    const cost2 = names.map((_, j) => (j < n ? c[j] : 0));
    const res = solve(cost2, n + m, K ? '第二階段' : '單純形', 4);
    if (res === 'unbounded') return r.frames;
    const x = curX();
    const z = dot(x, c0);
    r.snap(`最優解：${x.map((v, i) => `x${i + 1} = ${f4(v)}`).join('，')}，目標值 ${isMin ? 'min' : 'max'} = ${f4(z)}`, [tab(cost2, n + m), ...plot(), vars({ 目標值: f4(z) }, undefined, { 目標值: 'done' })], 5);
    return r.frames;
  },
};

export default [gaussJordan, luDecomp, qrDecomp, powerIter, conjGrad, secant, simpson, rk4, simplex];
