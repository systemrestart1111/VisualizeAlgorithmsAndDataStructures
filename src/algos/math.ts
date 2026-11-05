import type { AlgoDef, Color } from '../core/types';
import { Rec, cells, vars, table, text, inNum, inText, rnd } from '../core/helpers';

const cat = 'math';
type CM = Record<string, Color | undefined>;

const gcd: AlgoDef = {
  id: 'gcd', name: '歐幾里得最大公因數', en: 'Euclidean GCD', cat, star: true,
  desc: '輾轉相除法：gcd(a, b) = gcd(b, a mod b)，直到 b = 0 時 a 即為最大公因數。下方以矩形切割圖示：每次從 a×b 矩形切掉最多的 b×b 正方形。',
  time: 'O(log min(a, b))', space: 'O(1)',
  code: ['gcd(a, b):', '  while b != 0:', '    (a, b) = (b, a mod b)', '  return a'],
  inputs: [inNum('a', 'a', 252, 1, 1e9, () => rnd.int(20, 400)), inNum('b', 'b', 105, 1, 1e9, () => rnd.int(10, 300))],
  run({ a, b }) {
    const r = new Rec();
    const steps: string[][] = [];
    const W = Math.max(a, b), H = Math.min(a, b);
    const rects: { x: number; y: number; s: number; c: Color }[] = [];
    let x = 0, y = 0, w = W, h = H;
    const PAL: Color[] = ['active', 'path', 'visited', 'good', 'special', 'frontier'];
    const plot = () => ({ type: 'plot' as const, bounds: [0, W, 0, H] as [number, number, number, number], square: true, polygons: [{ pts: [[0, 0], [W, 0], [W, H], [0, H]] as [number, number][], color: 'muted' as Color }, ...rects.map((q) => ({ pts: [[q.x, q.y], [q.x + q.s, q.y], [q.x + q.s, q.y + q.s], [q.x, q.y + q.s]] as [number, number][], color: q.c, fill: true }))], title: '矩形切割（每種顏色是一輪的正方形）' });
    r.snap(`計算 gcd(${a}, ${b})`, [table([['a', 'b', 'a mod b']], {}, {}), plot()], 1);
    let k = 0;
    while (b) {
      const q = Math.floor(a / b), m = a % b;
      steps.push([String(a), String(b), `${a} = ${q}×${b} + ${m}`]);
      for (let i = 0; i < q && rects.length < 400; i++) {
        if (w >= h) { rects.push({ x, y, s: h, c: PAL[k % PAL.length] }); x += h; w -= h; }
        else { rects.push({ x, y, s: w, c: PAL[k % PAL.length] }); y += w; h -= w; }
      }
      k++;
      r.snap(`${a} mod ${b} = ${m} → gcd(${b}, ${m})`, [table(steps, {}, { colHeaders: ['a', 'b', '除法'] }), plot()], 3);
      [a, b] = [b, m];
    }
    r.snap(`b = 0，gcd = ${a}（最後的正方形邊長）`, [table(steps, {}, { colHeaders: ['a', 'b', '除法'] }), plot(), vars({ gcd: a })], 4);
    return r.frames;
  },
};

const extgcd: AlgoDef = {
  id: 'extended-gcd', name: '擴展歐幾里得', en: 'Extended Euclidean Algorithm', cat,
  desc: '除了 g = gcd(a, b)，同時求出整數 x、y 使 ax + by = g（Bézout 等式）。以表格迭代維護 (r, s, t)，每列都滿足 r = a·s + b·t。',
  time: 'O(log min(a, b))', space: 'O(1)',
  code: ['(r0, s0, t0) = (a, 1, 0)', '(r1, s1, t1) = (b, 0, 1)', 'while r1 != 0:', '  q = r0 / r1', '  (r0, r1) = (r1, r0 - q·r1)', '  (s0, s1) = (s1, s0 - q·s1)', '  (t0, t1) = (t1, t0 - q·t1)', 'return (r0, s0, t0)  // a·s0 + b·t0 = r0'],
  inputs: [inNum('a', 'a', 240, 1, 1e9, () => rnd.int(20, 500)), inNum('b', 'b', 46, 1, 1e9, () => rnd.int(10, 300))],
  run({ a, b }) {
    const r = new Rec();
    const rows: (number | string)[][] = [['-', a, 1, 0], ['-', b, 0, 1]];
    const T = (hl: CM = {}) => table(rows, hl, { colHeaders: ['q', 'r', 's', 't'], title: '每列滿足 r = a·s + b·t' });
    r.snap('初始兩列', [T()], 2);
    let [r0, s0, t0] = [a, 1, 0], [r1, s1, t1] = [b, 0, 1];
    while (r1) {
      const q = Math.floor(r0 / r1);
      [r0, r1] = [r1, r0 - q * r1];
      [s0, s1] = [s1, s0 - q * s1];
      [t0, t1] = [t1, t0 - q * t1];
      rows.push([q, r1, s1, t1]);
      const i = rows.length - 1;
      r.snap(`q = ${q}：新列 = 上上列 − ${q} × 上一列`, [T({ [`${i},1`]: 'swap', [`${i},2`]: 'swap', [`${i},3`]: 'swap', [`${i - 1},1`]: 'compare', [`${i - 2},1`]: 'compare' })], 5);
    }
    const i = rows.length - 2;
    r.snap(`gcd = ${r0}，x = ${s0}，y = ${t0}：${a}×(${s0}) + ${b}×(${t0}) = ${a * s0 + b * t0}`, [T({ [`${i},1`]: 'done', [`${i},2`]: 'done', [`${i},3`]: 'done' }), vars({ gcd: r0, x: s0, y: t0 })], 8);
    return r.frames;
  },
};

const lcm: AlgoDef = {
  id: 'lcm', name: '最小公倍數', en: 'Least Common Multiple', cat,
  desc: 'lcm(a, b) = a / gcd(a, b) × b（先除後乘避免溢位）。多個數的 LCM 可兩兩累積計算。',
  time: 'O(k log M)', space: 'O(1)',
  code: ['lcm(a, b) = a / gcd(a, b) * b', 'result = x[0]', 'for x in rest:', '  result = lcm(result, x)'],
  inputs: [{ key: 'arr', label: '整數', type: 'array', default: [12, 18, 30, 8], random: () => rnd.arr(rnd.int(2, 5), 2, 30) }],
  run({ arr }) {
    const r = new Rec();
    const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
    let res = arr[0];
    const lines: string[] = [];
    r.snap(`result = ${res}`, [cells(arr, { 0: 'done' })], 2);
    for (let i = 1; i < arr.length; i++) {
      const gg = g(res, arr[i]);
      const nl = (res / gg) * arr[i];
      lines.push(`lcm(${res}, ${arr[i]}) = ${res} / gcd(${res}, ${arr[i]}) × ${arr[i]} = ${res} / ${gg} × ${arr[i]} = ${nl}`);
      res = nl;
      r.snap(lines[lines.length - 1], [cells(arr, Object.fromEntries(Array.from({ length: i + 1 }, (_, k) => [k, k === i ? 'active' : 'done']))), text(lines, '計算過程')], 4);
    }
    r.snap(`LCM = ${res}`, [cells(arr, Object.fromEntries(arr.map((_: number, k: number) => [k, 'done']))), text(lines, '計算過程'), vars({ lcm: res })]);
    return r.frames;
  },
};

const numGrid = (N: number, color: (x: number) => Color | undefined, start = 0, cols = 10) => {
  const rows: (number | string)[][] = [];
  const c: CM = {};
  for (let x = start; x <= N; x++) {
    const i = x - start;
    (rows[Math.floor(i / cols)] ??= [])[i % cols] = x;
    const cc = color(x);
    if (cc) c[`${Math.floor(i / cols)},${i % cols}`] = cc;
  }
  return table(rows, c, { cell: 32, title: '綠：質數　灰：被篩掉的合數' });
};

const sieve: AlgoDef = {
  id: 'sieve', name: '埃拉托斯特尼質數篩', en: 'Sieve of Eratosthenes', cat, star: true,
  desc: '從 2 開始，每找到一個未被劃掉的數 p 就是質數，再把 p² 起所有 p 的倍數劃掉。只需要篩到 √N。',
  time: 'O(N log log N)', space: 'O(N)',
  code: ['isPrime[2..N] = true', 'for p = 2 while p·p <= N:', '  if isPrime[p]:', '    for m = p·p, p·p + p, ... <= N:', '      isPrime[m] = false', '剩下為 true 的即為質數'],
  inputs: [inNum('N', 'N', 100, 10, 400)],
  run({ N }) {
    const r = new Rec();
    const isP = new Array(N + 1).fill(true);
    isP[0] = isP[1] = false;
    const col = (cur = -1, m = -1) => (x: number) => (x === m ? 'swap' : x === cur ? 'active' : x < 2 ? 'muted' : !isP[x] ? 'muted' : x <= cur ? 'done' : undefined) as Color | undefined;
    r.snap('所有 ≥ 2 的數先假設為質數', [numGrid(N, col())], 1);
    for (let p = 2; p * p <= N; p++) {
      if (!isP[p]) continue;
      r.snap(`${p} 沒被劃掉 → 質數，開始劃掉 ${p * p} 起的倍數`, [numGrid(N, col(p))], 3);
      for (let m = p * p; m <= N; m += p) {
        const was = isP[m];
        isP[m] = false;
        if (was) r.snap(`劃掉 ${m} = ${p} × ${m / p}`, [numGrid(N, col(p, m))], 5);
      }
    }
    const primes = isP.map((v, i) => (v ? i : -1)).filter((x) => x >= 0);
    r.snap(`篩完！≤ ${N} 的質數共有 ${primes.length} 個`, [numGrid(N, (x) => (isP[x] ? 'done' : 'muted')), text([primes.join(' ')], '質數')], 6);
    return r.frames;
  },
};

const linearSieve: AlgoDef = {
  id: 'linear-sieve', name: '線性篩', en: 'Linear Sieve (Euler)', cat,
  desc: '保證每個合數只被它的「最小質因數」篩掉一次：對每個 i，用質數表中 ≤ lp[i] 的質數 p 標記 i·p。同時得到每個數的最小質因數 lp。',
  time: 'O(N)', space: 'O(N)',
  code: ['lp[*] = 0, primes = []', 'for i = 2 .. N:', '  if lp[i] == 0: lp[i] = i; primes.push(i)', '  for p in primes:', '    if p > lp[i] or i·p > N: break', '    lp[i·p] = p'],
  inputs: [inNum('N', 'N', 60, 10, 200)],
  run({ N }) {
    const r = new Rec();
    const lp = new Array(N + 1).fill(0);
    const primes: number[] = [];
    const grid = (i: number, mark = -1) => {
      const rows: (number | string)[][] = [], c: CM = {};
      for (let x = 2; x <= N; x++) {
        const k = x - 2;
        (rows[Math.floor(k / 10)] ??= [])[k % 10] = lp[x] ? `${x}·${lp[x]}` : x;
        c[`${Math.floor(k / 10)},${k % 10}`] = x === mark ? 'swap' : x === i ? 'active' : lp[x] === x ? 'done' : lp[x] ? 'muted' : undefined;
      }
      return table(rows, c, { title: '格式「數·最小質因數」；綠：質數' });
    };
    for (let i = 2; i <= N; i++) {
      if (!lp[i]) { lp[i] = i; primes.push(i); r.snap(`${i} 未被標記 → 質數`, [grid(i), cells(primes, {}, { title: '質數表', headers: false })], 3); }
      for (const p of primes) {
        if (p > lp[i] || i * p > N) break;
        lp[i * p] = p;
        r.snap(`i = ${i}，p = ${p}：標記 ${i * p} 的最小質因數為 ${p}`, [grid(i, i * p), cells(primes, { [primes.indexOf(p)]: 'compare' }, { title: '質數表', headers: false })], 6);
      }
    }
    r.snap(`完成，共 ${primes.length} 個質數；每個合數恰好被標記一次`, [grid(-1), cells(primes, {}, { title: '質數表', headers: false })]);
    return r.frames;
  },
};

const segSieve: AlgoDef = {
  id: 'segmented-sieve', name: '分段篩', en: 'Segmented Sieve', cat,
  desc: '求區間 [L, R] 中的質數，而 R 可能很大：先用普通篩求出 ≤ √R 的質數，再對區間用這些質數劃掉倍數。記憶體只需 O(√R + 區間長度)。',
  time: 'O((R − L + 1) log log R + √R)', space: 'O(√R + R − L)',
  code: ['base = sieve(√R)', 'mark[L..R] = true', 'for p in base:', '  start = max(p·p, ceil(L / p)·p)', '  for m = start, start + p, ... <= R:', '    mark[m] = false', '剩下的即為 [L, R] 中的質數'],
  inputs: [inNum('L', 'L', 1000, 2, 1e9, () => rnd.int(100, 50000)), inNum('R', 'R', 1060, 2, 1e9)],
  run({ L, R }) {
    const r = new Rec();
    if (R < L) [L, R] = [R, L];
    R = Math.min(R, L + 119);
    const lim = Math.floor(Math.sqrt(R));
    const isP = new Array(lim + 1).fill(true);
    const base: number[] = [];
    for (let i = 2; i <= lim; i++) if (isP[i]) { base.push(i); for (let j = i * i; j <= lim; j += i) isP[j] = false; }
    const mark = new Array(R - L + 1).fill(true);
    if (L <= 1) for (let x = L; x <= Math.min(1, R); x++) mark[x - L] = false;
    const col = (cur = -1) => (x: number) => (x === cur ? 'swap' : !mark[x - L] ? 'muted' : undefined) as Color | undefined;
    r.snap(`先求 ≤ √${R} = ${lim} 的質數：${base.join(' ')}`, [numGrid(R, col(), L), cells(base, {}, { title: '基礎質數', headers: false })], 1);
    for (const p of base) {
      const start = Math.max(p * p, Math.ceil(L / p) * p);
      let cnt = 0;
      for (let m = start; m <= R; m += p) { mark[m - L] = false; cnt++; }
      if (cnt) r.snap(`用 ${p} 劃掉區間內 ${cnt} 個倍數（從 ${start} 開始）`, [numGrid(R, col(), L), cells(base, { [base.indexOf(p)]: 'active' }, { title: '基礎質數', headers: false })], 5);
    }
    const res = mark.map((v, i) => (v ? i + L : -1)).filter((x) => x >= 0);
    r.snap(`[${L}, ${R}] 中共有 ${res.length} 個質數`, [numGrid(R, (x) => (mark[x - L] ? 'done' : 'muted'), L), text([res.join(' ')], '質數')], 7);
    return r.frames;
  },
};

const factor: AlgoDef = {
  id: 'prime-factorization', name: '質因數分解', en: 'Prime Factorization (Trial Division)', cat,
  desc: '試除法：從 2 開始嘗試每個 d，只要 d 整除 n 就不斷除下去；d 只需試到 √n，最後若 n > 1 則剩下的 n 本身是質數。',
  time: 'O(√n)', space: 'O(log n)',
  code: ['d = 2', 'while d·d <= n:', '  while n % d == 0:', '    factors.push(d); n /= d', '  d = d + 1', 'if n > 1: factors.push(n)'],
  inputs: [inNum('n', 'n', 360360, 2, 1e12, () => rnd.int(100, 999999))],
  run({ n }) {
    const r = new Rec();
    const fs: number[] = [];
    const orig = n;
    for (let d = 2; d * d <= n; d++) {
      if (n % d) { if (d < 40 || d % 50 === 0) r.snap(`${d} 不整除 ${n}`, [vars({ n, d }), cells(fs.length ? fs : [''], {}, { title: '質因數', headers: false })], 3); continue; }
      while (n % d === 0) { fs.push(d); n /= d; r.snap(`${d} 整除，n = ${n}`, [vars({ n, d }), cells(fs, { [fs.length - 1]: 'swap' }, { title: '質因數', headers: false })], 4); }
    }
    if (n > 1) { fs.push(n); r.snap(`剩下的 ${n} > 1，本身是質數`, [vars({ n }), cells(fs, { [fs.length - 1]: 'swap' }, { title: '質因數', headers: false })], 6); }
    const grouped: Record<number, number> = {};
    for (const f of fs) grouped[f] = (grouped[f] ?? 0) + 1;
    r.snap(`${orig} = ${Object.entries(grouped).map(([p, e]) => (e > 1 ? `${p}^${e}` : p)).join(' × ')}`, [cells(fs, Object.fromEntries(fs.map((_, i) => [i, 'done'])), { title: '質因數', headers: false })]);
    return r.frames;
  },
};

const fastPow: AlgoDef = {
  id: 'fast-power', name: '快速冪', en: 'Binary Exponentiation', cat, star: true,
  desc: '把指數 n 寫成二進位，由低位到高位：每一步把底數平方；若該位為 1 就把目前的底數乘進結果。只需 O(log n) 次乘法（使用大整數，不取模）。',
  time: 'O(log n)', space: 'O(1)',
  code: ['result = 1', 'while n > 0:', '  if n & 1: result = result · base', '  base = base · base', '  n = n >> 1', 'return result'],
  inputs: [inNum('a', '底數 a', 3, -1e6, 1e6, () => rnd.int(2, 9)), inNum('n', '指數 n', 13, 0, 200, () => rnd.int(5, 40))],
  run({ a, n }) {
    const r = new Rec();
    const bits: string[] = Number(n).toString(2).split('').reverse();
    let res = 1n, base = BigInt(a), e = n, k = 0;
    const B = (hl: number) => cells(bits.slice().reverse(), { [bits.length - 1 - hl]: 'active' }, { title: `n = ${n} 的二進位`, headers: bits.map((_, i) => `2^${bits.length - 1 - i}`) });
    r.snap('result = 1', [B(-1), vars({ result: res.toString(), base: base.toString() })], 1);
    while (e > 0) {
      if (e & 1) { res *= base; r.snap(`第 ${k} 位是 1：result ×= a^${2 ** k}`, [B(k), vars({ result: res.toString(), base: base.toString() })], 3); }
      else r.snap(`第 ${k} 位是 0：不乘`, [B(k), vars({ result: res.toString(), base: base.toString() })], 3);
      base *= base; e >>= 1; k++;
      if (e) r.snap(`base 平方 → a^${2 ** k}`, [B(k), vars({ result: res.toString(), base: base.toString().length > 40 ? base.toString().slice(0, 37) + '…' : base.toString() })], 4);
    }
    r.snap(`${a}^${n} = ${res}`, [B(-1), text([res.toString()], '結果')], 6);
    return r.frames;
  },
};

const modPow: AlgoDef = {
  id: 'mod-pow', name: '模冪', en: 'Modular Exponentiation (Left-to-Right)', cat,
  desc: '計算 aⁿ mod m。此處示範「由高位到低位」的平方乘法：每讀一個位元先把結果平方，位元為 1 再乘上 a，全程取模，數字永遠小於 m²。是 RSA、Diffie–Hellman 的核心運算。',
  time: 'O(log n)', space: 'O(1)',
  code: ['result = 1', 'for bit in n 的二進位（由高到低）:', '  result = result² mod m', '  if bit == 1:', '    result = result · a mod m', 'return result'],
  inputs: [inNum('a', '底數 a', 7, 0, 1e9, () => rnd.int(2, 50)), inNum('n', '指數 n', 560, 0, 1e9, () => rnd.int(10, 1000)), inNum('m', '模數 m', 561, 1, 1e9, () => rnd.int(10, 1000))],
  run({ a, n, m }) {
    const r = new Rec();
    const bits: string[] = Number(n).toString(2).split('');
    let res = 1n;
    const A = BigInt(a), M = BigInt(m);
    const rows: (string | number)[][] = [];
    const T = (i: number) => [cells(bits, { [i]: 'active' }, { title: `n = ${n} 的二進位（由高到低）`, headers: false }), table(rows, {}, { colHeaders: ['位元', '平方後', '乘 a 後'] })];
    r.snap('result = 1', T(-1), 1);
    bits.forEach((b, i) => {
      res = (res * res) % M;
      const sq = res.toString();
      if (b === '1') res = (res * A) % M;
      rows.push([b, sq, b === '1' ? res.toString() : '—']);
      r.snap(`位元 ${b}：平方 → ${sq}${b === '1' ? `，乘 ${a} → ${res}` : ''}（mod ${m}）`, T(i), b === '1' ? 5 : 3);
    });
    r.snap(`${a}^${n} mod ${m} = ${res}`, [...T(-1), vars({ 結果: res.toString() })], 6);
    return r.frames;
  },
};

const modInv: AlgoDef = {
  id: 'mod-inverse', name: '模反元素', en: 'Modular Inverse', cat,
  desc: '求 x 使 a·x ≡ 1 (mod m)，存在條件為 gcd(a, m) = 1。方法一：擴展歐幾里得解 ax + my = 1；方法二（m 為質數）：費馬小定理 x = a^(m−2) mod m。',
  time: 'O(log m)', space: 'O(1)',
  code: ['(g, x, y) = extgcd(a, m)', 'if g != 1: 不存在', 'return (x mod m + m) mod m', '// 若 m 為質數：a^(m-2) mod m 亦可'],
  inputs: [inNum('a', 'a', 17, 1, 1e9, () => rnd.int(2, 100)), inNum('m', '模數 m', 43, 2, 1e9, () => rnd.pick([7, 11, 13, 17, 19, 23, 26, 29, 31, 37, 40, 43, 97]))],
  run({ a, m }) {
    const r = new Rec();
    const rows: (string | number)[][] = [['-', m, 0], ['-', a % m, 1]];
    let [r0, t0] = [m, 0], [r1, t1] = [a % m, 1];
    r.snap('在 (m, a) 上執行擴展歐幾里得（只追蹤 a 的係數 t）', [table(rows, {}, { colHeaders: ['q', 'r', 't'] })], 1);
    while (r1) {
      const q = Math.floor(r0 / r1);
      [r0, r1] = [r1, r0 - q * r1];
      [t0, t1] = [t1, t0 - q * t1];
      rows.push([q, r1, t1]);
      r.snap(`q = ${q}`, [table(rows, { [`${rows.length - 1},1`]: 'swap', [`${rows.length - 1},2`]: 'swap' }, { colHeaders: ['q', 'r', 't'] })], 1);
    }
    if (r0 !== 1) { r.snap(`gcd(${a}, ${m}) = ${r0} ≠ 1，模反元素不存在`, [table(rows, {}, { colHeaders: ['q', 'r', 't'] })], 2); return r.frames; }
    const inv = ((t0 % m) + m) % m;
    let fermat = '（m 不是質數，不適用費馬）';
    let isPrime = m > 1;
    for (let d = 2; d * d <= m; d++) if (m % d === 0) isPrime = false;
    if (isPrime) { let res = 1n, b = BigInt(a) % BigInt(m), e = BigInt(m - 2); while (e > 0n) { if (e & 1n) res = (res * b) % BigInt(m); b = (b * b) % BigInt(m); e >>= 1n; } fermat = `費馬驗證：${a}^${m - 2} mod ${m} = ${res}`; }
    r.snap(`${a}⁻¹ ≡ ${inv} (mod ${m})；驗證 ${a} × ${inv} mod ${m} = ${(a * inv) % m}`, [table(rows, { [`${rows.length - 2},2`]: 'done' }, { colHeaders: ['q', 'r', 't'] }), text([fermat], '另一種方法')], 3);
    return r.frames;
  },
};

const crt: AlgoDef = {
  id: 'crt', name: '中國剩餘定理', en: 'Chinese Remainder Theorem', cat,
  desc: '解聯立同餘 x ≡ aᵢ (mod mᵢ)（模數兩兩互質）。逐步合併：已知 x ≡ r (mod M)，再加入 x ≡ a (mod m) 時，令 x = r + M·k，解 M·k ≡ a − r (mod m) 得 k。',
  time: 'O(k log M)', space: 'O(1)',
  code: ['r = 0, M = 1', 'for (a, m) in 同餘式:', '  k = (a - r) · inv(M, m) mod m', '  r = r + M · k', '  M = M · m', 'return r (mod M)'],
  inputs: [inText('eq', '同餘式（a m，以 ; 分隔）', '2 3; 3 5; 2 7', () => rnd.pick(['1 4; 2 5; 3 7', '2 3; 3 5; 2 7', '1 2; 2 3; 3 5; 4 7', '5 6; 3 11']))],
  run({ eq }) {
    const r = new Rec();
    const E = String(eq).split(';').map((x) => x.trim().split(/\s+/).map(Number)).filter((x) => x.length === 2);
    const inv = (a: number, m: number) => { let [r0, t0, r1, t1] = [m, 0, ((a % m) + m) % m, 1]; while (r1) { const q = Math.floor(r0 / r1); [r0, r1] = [r1, r0 - q * r1]; [t0, t1] = [t1, t0 - q * t1]; } return r0 === 1 ? ((t0 % m) + m) % m : NaN; };
    let R = 0, M = 1;
    const lines: string[] = [];
    const T = (i: number) => table(E.map(([a, m]) => [`x ≡ ${a} (mod ${m})`]), Object.fromEntries(E.map((_, k) => [`${k},0`, k < i ? 'done' : k === i ? 'active' : undefined])) as CM, { title: '同餘式', w: 'half' });
    r.snap('r = 0, M = 1', [T(-1), vars({ r: R, M })], 1);
    E.forEach(([a, m], i) => {
      const iv = inv(M % m, m);
      if (Number.isNaN(iv)) { lines.push(`gcd(${M}, ${m}) ≠ 1，模數不互質`); return; }
      const k = ((((a - R) % m) + m) % m * iv) % m;
      lines.push(`加入 x ≡ ${a} (mod ${m})：k = (${a} − ${R}) × ${M}⁻¹ mod ${m} = ${k}，r = ${R} + ${M}×${k} = ${R + M * k}`);
      R = R + M * k; M *= m;
      r.snap(lines[lines.length - 1], [T(i), text(lines, '過程', 'half'), vars({ r: R, M })], 4);
    });
    r.snap(`x ≡ ${R} (mod ${M})；驗證：${E.map(([, m]) => `${R} mod ${m} = ${R % m}`).join('，')}`, [T(E.length), text(lines, '過程', 'half'), vars({ x: R, M })], 6);
    return r.frames;
  },
};

const millerRabin: AlgoDef = {
  id: 'miller-rabin', name: '米勒–拉賓質數測試', en: 'Miller–Rabin Primality Test', cat,
  desc: '把 n − 1 寫成 d·2ˢ，對每個底數 a 計算 a^d mod n，再連續平方 s−1 次；若從未出現 1 或 n−1 的合法序列，a 就是 n 為合數的「證人」。使用固定底數 {2, 3, 5, 7, 11, 13, 17} 對 < 3.4×10¹⁴ 的數是確定性的。',
  time: 'O(k log³ n)', space: 'O(1)',
  code: ['n - 1 = d · 2^s (d 為奇數)', 'for a in 底數:', '  x = a^d mod n', '  if x == 1 or x == n-1: continue', '  repeat s-1 次: x = x² mod n; if x == n-1: break', '  若始終沒有遇到 n-1: return 合數（a 為證人）', 'return 可能是質數（對此範圍為確定）'],
  inputs: [inNum('n', 'n', 561, 2, 1e14, () => rnd.pick([561, 1105, 7919, 104729, 1000003, 999999, 2147483647, 341, 25326001]))],
  run({ n }) {
    const r = new Rec();
    const N = BigInt(n);
    const pw = (b: bigint, e: bigint) => { let res = 1n; b %= N; while (e > 0n) { if (e & 1n) res = (res * b) % N; b = (b * b) % N; e >>= 1n; } return res; };
    if (n < 4) { r.snap(n === 2 || n === 3 ? `${n} 是質數` : `${n} 不是質數`, []); return r.frames; }
    if (n % 2 === 0) { r.snap(`${n} 是偶數 → 合數`, [vars({ n })], 1); return r.frames; }
    let d = N - 1n, s = 0;
    while (d % 2n === 0n) { d /= 2n; s++; }
    const rows: string[][] = [];
    const T = () => table(rows, Object.fromEntries(rows.map((row, i) => [`${i},2`, row[2].includes('合數') ? 'bad' : 'good'])) as CM, { colHeaders: ['底數 a', '序列 a^d, a^2d, …', '結論'] });
    r.snap(`${n} − 1 = ${d} × 2^${s}`, [T()], 1);
    for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n]) {
      if (a % N === 0n) continue;
      let x = pw(a, d);
      const seq = [x.toString()];
      let ok = x === 1n || x === N - 1n;
      for (let i = 1; i < s && !ok; i++) { x = (x * x) % N; seq.push(x.toString()); if (x === N - 1n) ok = true; }
      rows.push([a.toString(), seq.join(' → '), ok ? '通過' : `合數（${a} 是證人）`]);
      r.snap(ok ? `底數 ${a}：序列合法，通過` : `底數 ${a}：序列中沒有 ${n - 1} → ${n} 是合數！`, [T()], ok ? 4 : 6);
      if (!ok) return r.frames;
    }
    r.snap(`${n} 通過所有底數 → 質數`, [T()], 7);
    return r.frames;
  },
};

const matPow: AlgoDef = {
  id: 'matrix-power', name: '矩陣快速冪', en: 'Matrix Exponentiation (Fibonacci)', cat,
  desc: '線性遞迴可寫成矩陣乘法：[F(n+1), F(n)] = [[1,1],[1,0]]ⁿ · [1, 0]。用快速冪計算矩陣的 n 次方，只需 O(log n) 次 2×2 矩陣乘法即可得到 F(n)。',
  time: 'O(k³ log n)', space: 'O(k²)',
  code: ['Q = [[1,1],[1,0]], R = I', 'while n > 0:', '  if n & 1: R = R · Q', '  Q = Q · Q', '  n >>= 1', 'F(n) = R[0][1]'],
  inputs: [inNum('n', 'n', 25, 0, 500, () => rnd.int(10, 90))],
  run({ n }) {
    const r = new Rec();
    type M2 = [[bigint, bigint], [bigint, bigint]];
    const mul = (A: M2, B: M2): M2 => [[A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]], [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]];
    let Q: M2 = [[1n, 1n], [1n, 0n]], R: M2 = [[1n, 0n], [0n, 1n]];
    let e = n, k = 0;
    const show = (M: M2) => M.map((row) => row.map((x) => (x.toString().length > 14 ? x.toString().slice(0, 12) + '…' : x.toString())));
    const P = () => [table(show(R), {}, { title: '結果 R', w: 'half' }), table(show(Q), {}, { title: `Q = [[1,1],[1,0]]^${2 ** k}`, w: 'half' })];
    r.snap('R = 單位矩陣', P(), 1);
    while (e > 0) {
      if (e & 1) { R = mul(R, Q); r.snap(`第 ${k} 位為 1：R = R · Q`, P(), 3); }
      Q = mul(Q, Q); e >>= 1; k++;
      if (e) r.snap('Q = Q²', P(), 4);
    }
    r.snap(`F(${n}) = ${R[0][1]}`, [...P(), text([R[0][1].toString()], `F(${n})`)], 6);
    return r.frames;
  },
};

type Cx = [number, number];
const cAdd = (a: Cx, b: Cx): Cx => [a[0] + b[0], a[1] + b[1]];
const cSub = (a: Cx, b: Cx): Cx => [a[0] - b[0], a[1] - b[1]];
const cMul = (a: Cx, b: Cx): Cx => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cFmt = (a: Cx) => { const re = +a[0].toFixed(2), im = +a[1].toFixed(2); return im === 0 ? String(re) : re === 0 ? `${im}i` : `${re}${im > 0 ? '+' : ''}${im}i`; };

const fft: AlgoDef = {
  id: 'fft', name: '快速傅立葉轉換', en: 'Fast Fourier Transform (Polynomial Multiplication)', cat,
  desc: '把兩個多項式的係數做 FFT 轉成點值表示，逐點相乘後再做逆 FFT 得到乘積係數。迭代版 Cooley–Tukey：先位元反轉重排，再以蝴蝶運算由小到大合併。（NTT 為同樣結構、改在模質數下運算的版本）',
  time: 'O(n log n)', space: 'O(n)',
  code: ['n = 大於 deg(A)+deg(B) 的 2 的冪', 'FFT(A), FFT(B)  (位元反轉 + 蝴蝶運算)', '  for len = 2, 4, ..., n:', '    w = e^(±2πi/len)', '    蝴蝶：u = a[k], v = a[k+len/2]·w^j', '          a[k] = u + v, a[k+len/2] = u - v', 'C[i] = A[i] · B[i]（點值相乘）', 'c = IFFT(C) / n'],
  inputs: [{ key: 'a', label: '多項式 A 係數（由低次到高次）', type: 'array', default: [1, 2, 3], random: () => rnd.arr(rnd.int(2, 4), 0, 9) }, { key: 'b', label: '多項式 B 係數', type: 'array', default: [4, 5, 6], random: () => rnd.arr(rnd.int(2, 4), 0, 9) }],
  run({ a, b }) {
    const r = new Rec();
    let n = 1;
    while (n < a.length + b.length - 1) n <<= 1;
    const A: Cx[] = Array.from({ length: n }, (_, i) => [a[i] ?? 0, 0]);
    const B: Cx[] = Array.from({ length: n }, (_, i) => [b[i] ?? 0, 0]);
    const transform = (X: Cx[], inv: boolean, name: string) => {
      const lg = Math.log2(n);
      for (let i = 0; i < n; i++) { let rv = 0; for (let k = 0; k < lg; k++) if (i & (1 << k)) rv |= 1 << (lg - 1 - k); if (i < rv) [X[i], X[rv]] = [X[rv], X[i]]; }
      r.snap(`${name}：位元反轉重排`, [cells(X.map(cFmt), {}, { title: name })], 2);
      for (let len = 2; len <= n; len <<= 1) {
        const ang = ((inv ? -2 : 2) * Math.PI) / len;
        const wl: Cx = [Math.cos(ang), Math.sin(ang)];
        const touched: Record<number, Color> = {};
        for (let i = 0; i < n; i += len) {
          let w: Cx = [1, 0];
          for (let j = 0; j < len / 2; j++) {
            const u = X[i + j], v = cMul(X[i + j + len / 2], w);
            X[i + j] = cAdd(u, v); X[i + j + len / 2] = cSub(u, v);
            touched[i + j] = 'active'; touched[i + j + len / 2] = 'frontier';
            w = cMul(w, wl);
          }
        }
        r.snap(`${name}：長度 ${len} 的蝴蝶運算（藍 = u + v·w，青 = u − v·w）`, [cells(X.map(cFmt), touched, { title: name })], 5);
      }
    };
    r.snap(`補零到長度 n = ${n}`, [cells(A.map(cFmt), {}, { title: 'A', w: 'half' }), cells(B.map(cFmt), {}, { title: 'B', w: 'half' })], 1);
    transform(A, false, 'FFT(A)');
    transform(B, false, 'FFT(B)');
    const C = A.map((x, i) => cMul(x, B[i]));
    r.snap('點值逐一相乘：C[i] = A[i] · B[i]', [cells(C.map(cFmt), {}, { title: 'C（點值表示）' })], 7);
    transform(C, true, 'IFFT(C)');
    const res = C.map((x) => Math.round(x[0] / n));
    const poly = (p: number[]) => p.map((c, i) => (c ? `${c}${i ? 'x' + (i > 1 ? '^' + i : '') : ''}` : '')).filter(Boolean).join(' + ') || '0';
    const trimmed = res.slice(0, a.length + b.length - 1);
    r.snap(`除以 n 並四捨五入：(${poly(a)}) × (${poly(b)}) = ${poly(trimmed)}`, [cells(trimmed, Object.fromEntries(trimmed.map((_, i) => [i, 'done'])), { title: '乘積係數' })], 8);
    return r.frames;
  },
};

export default [gcd, extgcd, lcm, sieve, linearSieve, segSieve, factor, fastPow, modPow, modInv, crt, millerRabin, matPow, fft];
