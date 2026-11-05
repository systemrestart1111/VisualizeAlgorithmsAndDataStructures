// 數論延伸
import type { AlgoDef, Color, GEdge, GNode, GraphPanel, Panel } from '../core/types';
import { Rec, cells, inNum, inSelect, rnd, table, text, vars } from '../core/helpers';
import { gcd, invMod, isPrime, mod, mulMod, powMod } from '../core/extra';

const cat = 'math';
type CM = Record<string, Color | undefined>;

/** 1..N 的數字格；color(x) 決定每格顏色 */
const numGrid = (N: number, color: (x: number) => Color | undefined, label: (x: number) => string | number = (x) => x, title?: string) => {
  const cols = N > 100 ? 20 : 10;
  const rows: (string | number)[][] = [];
  const c: CM = {};
  for (let x = 1; x <= N; x++) {
    const i = x - 1;
    (rows[Math.floor(i / cols)] ??= [])[i % cols] = label(x);
    const cc = color(x);
    if (cc) c[`${Math.floor(i / cols)},${i % cols}`] = cc;
  }
  return table(rows, c, { title });
};

// ---------------- 歐拉函數 ----------------
const totient: AlgoDef = {
  id: 'euler-totient', name: '歐拉函數 φ(n)', en: "Euler's Totient Function", cat,
  desc: 'φ(n) 是 1..n 中與 n 互質的整數個數。n 的每個相異質因數 p 會讓 1/p 的數不互質（p 的倍數），刪掉後剩 (1 − 1/p)：φ(n) = n·∏(1 − 1/p)。以整數運算寫成 result −= result / p，只需試除到 √n。n ≤ 300 時在數字格上畫出被刪去的倍數，並與逐一 gcd 計數比對；φ(1) = 1。',
  time: 'O(√n)', space: 'O(1)',
  code: ['result = n', 'for p = 2 while p·p <= n:', '  if n % p == 0:', '    while n % p == 0: n /= p', '    result −= result / p      (刪去 p 的倍數)', 'if n > 1: result −= result / n   (剩下的大質因數)', 'return result'],
  inputs: [inNum('n', 'n', 36, 1, 1e12, () => (rnd.int(0, 2) ? rnd.int(2, 300) : rnd.int(1000, 1e6)))],
  run({ n }) {
    const r = new Rec();
    if (!Number.isInteger(n) || n < 1) throw new Error('n 必須是正整數');
    const N = n, show = N <= 300;
    const removed = new Map<number, number>();
    const strike = (p: number) => { if (show) for (let x = p; x <= N; x += p) if (!removed.has(x)) removed.set(x, p); };
    const grid = (hl = -1, fin = false) => (show ? [numGrid(N, (x) => (removed.has(x) ? (removed.get(x) === hl ? 'bad' : 'muted') : fin ? 'done' : undefined), undefined, '灰：已刪去（不互質）')] : []);
    let m = N, res = N;
    r.snap(`result = ${N}${show ? '' : '（n > 300，不畫數字格）'}`, [...grid(), vars({ n: m, result: res })], 1);
    for (let p = 2; p * p <= m; p++) {
      if (m % p) continue;
      let e = 0;
      while (m % p === 0) { m /= p; e++; }
      res -= res / p;
      strike(p);
      r.snap(`p = ${p} 整除 n（${p}^${e}）：刪去 ${p} 的倍數，result −= result / ${p} → ${res}`, [...grid(p), vars({ p, 剩餘的n: m, result: res })], 5);
    }
    if (m > 1) {
      res -= res / m;
      strike(m);
      r.snap(`剩下的 ${m} > 1 是質因數：result = ${res}`, [...grid(m), vars({ p: m, result: res })], 6);
    }
    let brute: number | string = '略過（n 太大）';
    if (N <= 2e6) { brute = 0; for (let x = 1; x <= N; x++) if (gcd(x, N) === 1) brute++; }
    r.snap(`φ(${N}) = ${res}（逐一 gcd 計數：${brute}）`, [...grid(-1, true), vars({ 'φ(n)': res, 驗證: brute }, undefined, { 'φ(n)': 'done' })], 7);
    return r.frames;
  },
};

// ---------------- Pollard Rho ----------------
/** 把數列 v0, v1, ... 畫成 ρ 形：尾巴一直線，環在上方 */
function rhoPanel(seq: number[], mu: number, lam: number, title: string): GraphPanel {
  const R = Math.max(60, lam * 11);
  const nodes: GNode[] = [], edges: GEdge[] = [];
  for (let k = 0; k < mu; k++) nodes.push({ id: 'v' + k, x: 0, y: (mu - k) * 46 + R, label: String(seq[k]), color: 'muted', r: 15 });
  for (let k = 0; k < lam; k++) {
    const t = Math.PI / 2 + (k / lam) * Math.PI * 2;
    nodes.push({ id: 'v' + (mu + k), x: Math.cos(t) * R, y: Math.sin(t) * R, label: String(seq[mu + k]), color: k ? 'frontier' : 'swap', r: 15 });
  }
  for (let k = 0; k + 1 < mu + lam; k++) edges.push({ from: 'v' + k, to: 'v' + (k + 1), directed: true });
  edges.push({ from: 'v' + (mu + lam - 1), to: 'v' + mu, directed: true, color: 'bad' });
  return { type: 'graph', title, nodes, edges, height: 380 };
}

const pollardRho: AlgoDef = {
  id: 'pollard-rho', name: 'Pollard Rho 質因數分解', en: "Pollard's Rho Factorization", cat,
  desc: '迭代 f(x) = x² + c (mod n)。若 p 是 n 的未知因數，數列 mod p 只有 p 種值，約 √p 步就會進入環（形狀像 ρ）。用龜兔賽跑同時走 x = f(x)、y = f(f(y))，一旦 x ≡ y (mod p)，gcd(|x − y|, n) 就會抽出 p。若 gcd 恰好等於 n（mod n 也同時碰撞），這次失敗，換 c 重試。配合質數測試遞迴分解，最後驗證所有因數乘積等於 n。',
  time: '期望約 O(n^{1/4}) 次 gcd', space: 'O(log n)',
  code: ['factor(n):', '  if n 是質數: 輸出 n；return', '  if n 偶數: 輸出 2；factor(n / 2)；return', '  for c = 1, 2, ...:', '    x = y = 2, d = 1', '    while d == 1:', '      x = f(x)，y = f(f(y))     (f(x) = x² + c mod n)', '      d = gcd(|x − y|, n)', '    if d != n: factor(d)；factor(n / d)；return', '    d == n：碰撞但沒抽出因數，換 c 重試'],
  inputs: [inNum('n', 'n（≤ 10¹²）', 201275, 1, 1e12, () => rnd.pick([8051, 10403, 25, 1022117, 600851475143, 999983 * 1009, 2 ** 4 * 3 * 4087, 1000003]))],
  run({ n }) {
    const r = new Rec();
    if (!Number.isInteger(n) || n < 1) throw new Error('n 必須是正整數');
    if (n > 1e12) throw new Error('n 最大 10¹²');
    const found: number[] = [];
    const stack = [n];
    const fc = () => cells(found.length ? [...found].sort((a, b) => a - b) : ['—'], {}, { title: '已找到的質因數', headers: false });
    if (n === 1) { r.snap('n = 1 沒有質因數', [fc()], 1); return r.frames; }
    let rhoShown = false;
    while (stack.length) {
      const m = stack.pop()!;
      if (isPrime(m)) { found.push(m); r.snap(`${m} 是質數，直接輸出`, [vars({ 待分解: stack.join(', ') || '無' }), fc()], 2); continue; }
      if (m % 2 === 0) { found.push(2); stack.push(m / 2); r.snap(`${m} 是偶數：輸出 2，繼續分解 ${m / 2}`, [vars({ 待分解: stack.join(', ') }), fc()], 3); continue; }
      for (let c = 1; ; c++) {
        const f = (x: number) => (mulMod(x, x, m) + c) % m;
        let x = 2, y = 2, d = 1, step = 0;
        const rows: (string | number)[][] = [];
        const tbl = (hl?: Color) => table(rows.slice(-10), hl ? { [`${Math.min(rows.length, 10) - 1},4`]: hl } : {}, { title: `n = ${m}，f(x) = x² + ${c}`, colHeaders: ['步', 'x', 'y', '|x − y|', 'gcd'] });
        r.snap(`分解 ${m}：嘗試 c = ${c}，x = y = 2`, [tbl(), vars({ n: m, c }), fc()], 5);
        while (d === 1) {
          x = f(x); y = f(f(y)); step++;
          d = gcd(Math.abs(x - y), m);
          rows.push([step, x, y, Math.abs(x - y), d]);
          if (step <= 12 || d !== 1 || step % 50 === 0) r.snap(`第 ${step} 步：x = ${x}，y = ${y}，gcd(${Math.abs(x - y)}, ${m}) = ${d}`, [tbl(d === 1 ? 'muted' : d === m ? 'bad' : 'done'), vars({ n: m, c, 步數: step }), fc()], d === 1 ? 7 : 8);
        }
        if (d === m) { r.snap(`gcd = n：x 與 y 在 mod ${m} 下也相撞，沒有抽出因數 → 換 c = ${c + 1} 重試`, [tbl('bad'), vars({ n: m, c }, undefined, { c: 'bad' }), fc()], 10); continue; }
        stack.push(d, m / d);
        const panels: Panel[] = [tbl('done'), vars({ 因數: `${d} × ${m / d}`, 步數: step }, undefined, { 因數: 'done' }), fc()];
        if (!rhoShown && d <= 400) {
          const seq = [2];
          const seen = new Map<number, number>([[2 % d, 0]]);
          let v = 2;
          for (;;) { v = f(v); const k = seq.length; seq.push(v); if (seen.has(v % d)) { const mu = seen.get(v % d)!; if (k <= 40) { panels.push(rhoPanel(seq.slice(0, k).map((t) => t % d), mu, k - mu, `x mod ${d} 的軌跡：尾巴 ${mu} 個、環長 ${k - mu}`)); rhoShown = true; } break; } seen.set(v % d, k); }
        }
        r.snap(`gcd = ${d}：抽出因數 ${d}，把 ${d} 和 ${m / d} 放回待分解`, panels, 9);
        break;
      }
    }
    found.sort((a, b) => a - b);
    const prod = found.reduce((a, b) => a * b, 1);
    const grouped: Record<number, number> = {};
    for (const p of found) grouped[p] = (grouped[p] ?? 0) + 1;
    r.snap(`${n} = ${Object.entries(grouped).map(([p, e]) => (e > 1 ? `${p}^${e}` : p)).join(' × ')}（乘積驗證：${prod === n ? '相符' : '不符！'}）`, [cells(found, Object.fromEntries(found.map((_, i) => [i, 'done'])), { title: '質因數', headers: false })], 1);
    return r.frames;
  },
};

// ---------------- 數論轉換 NTT ----------------
const NTT_MODS: Record<string, [number, number]> = { '17': [17, 3], '97': [97, 5], '998244353': [998244353, 3] };
const ntt: AlgoDef = {
  id: 'ntt', name: '數論轉換 NTT', en: 'Number Theoretic Transform', cat,
  desc: '把 FFT 的複數單位根 e^(2πi/n) 換成模質數 p 下的 n 次單位根 ω = g^((p−1)/n)（g 為原根），蝴蝶運算完全一樣，但全程是整數、沒有浮點誤差。條件：n 必須整除 p − 1，因此常用 p = 998244353 = 119·2²³ + 1。結果是「模 p 的卷積」——係數超過 p 時會被取模。小模數 17、97 方便看清每一步的數字。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['n = 大於 deg(A)+deg(B) 的 2 的冪；檢查 n | (p − 1)', 'NTT(A), NTT(B)（位元反轉 + 蝴蝶運算）', '  for len = 2, 4, ..., n:', '    w = g^((p−1)/len) mod p（逆轉換用 w⁻¹）', '    蝴蝶：u = a[k], v = a[k+len/2]·w^j mod p', '          a[k] = u + v, a[k+len/2] = u − v (mod p)', 'C[i] = A[i] · B[i] mod p', 'c = INTT(C) · n⁻¹ mod p'],
  inputs: [
    { key: 'a', label: '多項式 A 係數（由低次到高次）', type: 'array', default: [1, 2, 3, 4], random: () => rnd.arr(rnd.int(2, 5), 0, 9) },
    { key: 'b', label: '多項式 B 係數', type: 'array', default: [5, 6, 7], random: () => rnd.arr(rnd.int(2, 5), 0, 9) },
    inSelect('p', '模數 p（原根 g）', [['17', '17（g = 3，最長 16）'], ['97', '97（g = 5，最長 32）'], ['998244353', '998244353（g = 3，最長 2²³）']], '17'),
  ],
  run({ a, b, p: ps }) {
    const r = new Rec();
    const [p, g] = NTT_MODS[ps];
    if (!a.length || !b.length) throw new Error('多項式不可為空');
    let n = 1;
    while (n < a.length + b.length - 1) n <<= 1;
    let two = 0, q = p - 1;
    while (q % 2 === 0) { q /= 2; two++; }
    const ok = (p - 1) % n === 0;
    r.snap(`p − 1 = ${p - 1} = 2^${two} · ${q}，長度上限 ${2 ** two}；需要 n = ${n}：${ok ? '整除 ✓' : '不整除 ✗'}`, [vars({ p, g, n, '最長長度': 2 ** two }, undefined, { n: ok ? 'done' : 'bad' })], 1);
    if (!ok) { r.snap(`n = ${n} 不整除 p − 1，模 ${p} 下不存在 n 次單位根，無法做 NTT；請換更大的模數`, [vars({ 結果: '無法轉換' }, undefined, { 結果: 'bad' })], 1); return r.frames; }
    const wn = powMod(g, (p - 1) / n, p);
    r.snap(`n 次單位根 ω = ${g}^(${p - 1}/${n}) = ${wn}：ω^${n} = ${powMod(wn, n, p)}、ω^${n / 2} = ${powMod(wn, n / 2, p)}（≡ −1）`, [vars({ ω: wn, 'ω^n': powMod(wn, n, p), 'ω^(n/2)': powMod(wn, n / 2, p) })], 4);
    const A = Array.from({ length: n }, (_, i) => mod(a[i] ?? 0, p));
    const B = Array.from({ length: n }, (_, i) => mod(b[i] ?? 0, p));
    const lg = Math.log2(n);
    const transform = (X: number[], inv: boolean, name: string) => {
      for (let i = 0; i < n; i++) { let rv = 0; for (let k = 0; k < lg; k++) if (i & (1 << k)) rv |= 1 << (lg - 1 - k); if (i < rv) [X[i], X[rv]] = [X[rv], X[i]]; }
      r.snap(`${name}：位元反轉重排`, [cells([...X], {}, { title: name })], 2);
      for (let len = 2; len <= n; len <<= 1) {
        let wl = powMod(g, (p - 1) / len, p);
        if (inv) wl = invMod(wl, p)!;
        const touched: Record<number, Color> = {};
        for (let i = 0; i < n; i += len) {
          let w = 1;
          for (let j = 0; j < len / 2; j++) {
            const u = X[i + j], v = mulMod(X[i + j + len / 2], w, p);
            X[i + j] = (u + v) % p; X[i + j + len / 2] = mod(u - v, p);
            touched[i + j] = 'active'; touched[i + j + len / 2] = 'frontier';
            w = mulMod(w, wl, p);
          }
        }
        r.snap(`${name}：長度 ${len} 的蝴蝶，w = ${wl}（藍 = u + v·w，青 = u − v·w，皆 mod ${p}）`, [cells([...X], touched, { title: name })], 5);
      }
    };
    r.snap(`係數取 mod ${p} 並補零到長度 ${n}`, [cells([...A], {}, { title: 'A', w: 'half' }), cells([...B], {}, { title: 'B', w: 'half' })], 1);
    transform(A, false, 'NTT(A)');
    transform(B, false, 'NTT(B)');
    const C = A.map((x, i) => mulMod(x, B[i], p));
    r.snap(`點值逐一相乘 mod ${p}`, [cells([...C], {}, { title: 'C（點值表示）' })], 7);
    transform(C, true, 'INTT(C)');
    const ninv = invMod(n, p)!;
    const len = a.length + b.length - 1;
    const res = C.map((x) => mulMod(x, ninv, p)).slice(0, len);
    const exact = new Array(len).fill(0);
    a.forEach((x: number, i: number) => b.forEach((y: number, j: number) => { exact[i + j] += x * y; }));
    const naive = exact.map((x) => mod(x, p));
    const same = naive.every((x, i) => x === res[i]);
    const wrapped = exact.some((x) => x !== mod(x, p));
    r.snap(`乘上 n⁻¹ = ${ninv}：模 ${p} 卷積${same ? '與直接相乘取模一致' : '與直接相乘不一致！'}${wrapped ? `（真正的係數 ${exact.join(' ')} 有超過 p 的被取模）` : '（係數都小於 p，等於真正的乘積）'}`, [cells(res, Object.fromEntries(res.map((_, i) => [i, 'done'])), { title: `乘積係數 mod ${p}` }), cells(exact, Object.fromEntries(exact.map((x, i) => [i, x !== naive[i] ? 'bad' : undefined])), { title: '直接相乘（不取模）' })], 8);
    return r.frames;
  },
};

// ---------------- Lucas 定理 ----------------
const lucas: AlgoDef = {
  id: 'lucas-theorem', name: 'Lucas 定理', en: "Lucas's Theorem", cat,
  desc: '求 C(n, k) mod p（p 為質數），n 可以遠大於 p。把 n、k 寫成 p 進位 n = (n_t … n_1 n_0)_p、k = (k_t … k_0)_p，則 C(n, k) ≡ ∏ C(n_i, k_i) (mod p)；只要某一位 k_i > n_i，整個結果就是 0。每個小組合數用階乘表與費馬小定理求反元素。p 不是質數時定理不成立。n ≤ 3000 時與大整數直接計算比對。',
  time: 'O(p + log_p n)', space: 'O(p)',
  code: ['Lucas(n, k, p):', '  if k == 0: return 1', '  nᵢ = n mod p，kᵢ = k mod p', '  if kᵢ > nᵢ: return 0', '  return C(nᵢ, kᵢ) · Lucas(n / p, k / p, p) mod p', '小組合數 C(a, b) = a! · inv(b!) · inv((a−b)!) mod p', 'inv(x) = x^(p−2) mod p（費馬小定理，需 p 為質數）'],
  inputs: [inNum('n', 'n', 1000, 0, 1e15, () => rnd.int(50, 3000)), inNum('k', 'k', 300, 0, 1e15, (c) => rnd.int(0, c.n)), inNum('p', '質數 p', 13, 2, 100000, () => rnd.pick([2, 3, 5, 7, 11, 13, 17, 19, 23, 97]))],
  run({ n, k, p }) {
    const r = new Rec();
    if (![n, k, p].every(Number.isInteger) || n < 0 || k < 0) throw new Error('n、k 必須是非負整數');
    if (!isPrime(p)) throw new Error(`p = ${p} 不是質數：Lucas 定理只對質數成立，而且小組合數的反元素需要費馬小定理`);
    const fact = [1];
    for (let i = 1; i < p; i++) fact.push(mulMod(fact[i - 1], i, p));
    const small = (x: number, y: number) => (y > x ? 0 : mulMod(fact[x], mulMod(powMod(fact[y], p - 2, p), powMod(fact[x - y], p - 2, p), p), p));
    const nd: number[] = [], kd: number[] = [];
    for (let x = n, y = k; x > 0 || y > 0; x = Math.floor(x / p), y = Math.floor(y / p)) { nd.push(x % p); kd.push(y % p); }
    if (!nd.length) { nd.push(0); kd.push(0); }
    const cs: (number | string)[] = nd.map(() => '');
    const hdr = nd.map((_, i) => `p^${i}`);
    const tbl = (c: CM = {}) => table([nd, kd, cs], c, { title: `${n} 與 ${k} 的 ${p} 進位（右邊是低位）`, rowHeaders: ['nᵢ', 'kᵢ', 'C(nᵢ, kᵢ)'], colHeaders: hdr });
    r.snap(`把 n = ${n}、k = ${k} 寫成 ${p} 進位，逐位處理`, [tbl(), vars({ p, 結果: 1 })], 3);
    let res = 1;
    if (k > n) {
      r.snap(`k > n，C(n, k) = 0`, [tbl(), vars({ 結果: 0 }, undefined, { 結果: 'done' })], 4);
      return r.frames;
    }
    for (let i = 0; i < nd.length; i++) {
      if (kd[i] > nd[i]) {
        cs[i] = 0; res = 0;
        r.snap(`第 ${i} 位 kᵢ = ${kd[i]} > nᵢ = ${nd[i]}：C(${nd[i]}, ${kd[i]}) = 0，整個乘積為 0`, [tbl({ [`0,${i}`]: 'bad', [`1,${i}`]: 'bad', [`2,${i}`]: 'bad' }), vars({ 結果: 0 }, undefined, { 結果: 'bad' })], 4);
        break;
      }
      const c = small(nd[i], kd[i]);
      cs[i] = c;
      res = mulMod(res, c, p);
      r.snap(`第 ${i} 位：C(${nd[i]}, ${kd[i]}) = ${nd[i]}!·inv(${kd[i]}!)·inv(${nd[i] - kd[i]}!) ≡ ${c}，累積 ${res}`, [tbl({ [`0,${i}`]: 'active', [`1,${i}`]: 'active', [`2,${i}`]: 'done' }), vars({ 'C(nᵢ,kᵢ)': c, 結果: res })], 5);
    }
    let check: string = '略過（n 太大）';
    if (n <= 3000) {
      let c = 1n;
      for (let i = 0; i < k; i++) c = (c * BigInt(n - i)) / BigInt(i + 1);
      check = String(c % BigInt(p));
    }
    r.snap(`C(${n}, ${k}) mod ${p} = ${res}（大整數直接計算：${check}）`, [tbl(), vars({ 結果: res, 驗證: check }, undefined, { 結果: 'done' })], 5);
    return r.frames;
  },
};

// ---------------- 莫比烏斯函數篩 ----------------
const muSym = (v: number) => (v > 0 ? '+1' : v < 0 ? '−1' : '0');
const mobiusSieve: AlgoDef = {
  id: 'mobius-sieve', name: '莫比烏斯函數篩', en: 'Möbius Function Sieve', cat,
  desc: 'μ(n)：n 有平方因子時為 0；否則 n 是 k 個相異質數的乘積，μ(n) = (−1)^k。用線性篩一次求出 1..N：質數 μ = −1；用質數 p 標記 i·p 時，若 p 已整除 i，則 i·p 含 p²，μ = 0；否則多了一個新質因數，μ(i·p) = −μ(i)。最後逐一用質因數分解驗證。',
  time: 'O(N)', space: 'O(N)',
  code: ['μ[1] = 1，primes = []', 'for i = 2 .. N:', '  if i 未被標記: primes.push(i)；μ[i] = −1', '  for p in primes（p·i <= N）:', '    標記 i·p', '    if i % p == 0: μ[i·p] = 0；break   (含 p²)', '    else: μ[i·p] = −μ[i]              (多一個質因數)'],
  inputs: [inNum('N', 'N', 60, 2, 200, () => rnd.int(30, 120))],
  run({ N }) {
    const r = new Rec();
    const mu = new Array(N + 1).fill(null) as (number | null)[];
    const comp = new Array(N + 1).fill(false);
    const primes: number[] = [];
    mu[1] = 1;
    const grid = (cur = -1, mark = -1) => numGrid(N, (x) => (x === mark ? 'swap' : x === cur ? 'compare' : mu[x] === null ? undefined : mu[x] === 0 ? 'muted' : mu[x]! > 0 ? 'done' : 'frontier'), (x) => (mu[x] === null ? x : `${x}:${muSym(mu[x]!)}`), '格式「數:μ」；綠 +1、青 −1、灰 0');
    r.snap('μ(1) = 1', [grid()], 1);
    for (let i = 2; i <= N; i++) {
      if (!comp[i]) { primes.push(i); mu[i] = -1; r.snap(`${i} 沒被標記 → 質數，μ(${i}) = −1`, [grid(i, i)], 3); }
      for (const p of primes) {
        if (p * i > N) break;
        comp[p * i] = true;
        if (i % p === 0) { mu[p * i] = 0; r.snap(`${i} 已含 ${p}，所以 ${p * i} = ${i}·${p} 含 ${p}²：μ = 0，停止`, [grid(i, p * i)], 6); break; }
        mu[p * i] = -mu[i]!;
        r.snap(`${p * i} = ${i}·${p}，${p} 是新的質因數：μ(${p * i}) = −μ(${i}) = ${muSym(mu[p * i]!)}`, [grid(i, p * i)], 7);
      }
    }
    let bad = 0;
    for (let x = 1; x <= N; x++) {
      let m = x, k = 0, sq = false;
      for (let d = 2; d * d <= m; d++) if (m % d === 0) { m /= d; k++; if (m % d === 0) sq = true; while (m % d === 0) m /= d; }
      if (m > 1) k++;
      if ((sq ? 0 : k % 2 ? -1 : 1) !== mu[x]) bad++;
    }
    const cnt = (v: number) => mu.filter((x) => x === v).length;
    r.snap(`完成：+1 有 ${cnt(1)} 個、−1 有 ${cnt(-1)} 個、0 有 ${cnt(0)} 個；與質因數分解比對 ${bad ? `${bad} 個不符` : '全部相符'}`, [grid(), vars({ 'Σμ（Mertens）': mu.reduce((a: number, x) => a + (x ?? 0), 0) })]);
    return r.frames;
  },
};

// ---------------- 莫比烏斯反演 ----------------
const mobiusInversion: AlgoDef = {
  id: 'mobius-inversion', name: '莫比烏斯反演', en: 'Möbius Inversion', cat,
  desc: '若 g(n) = Σ_{d|n} f(d)（對所有因數累加），則可以反過來還原 f(n) = Σ_{d|n} μ(n/d)·g(d)。μ 扮演「因數格上的容斥係數」：μ(n/d) = 0 的項被跳過，±1 的項把重複算到的部分加回或扣掉。預設的 f 是 φ(1..12)，累加後恰好得到 g(n) = n（Σ_{d|n} φ(d) = n）。最後檢查還原結果與原始 f 一致。',
  time: 'O(N log N)', space: 'O(N)',
  code: ['μ = 莫比烏斯篩(N)', 'for n = 1 .. N:', '  g[n] = Σ f[d]，d 跑遍 n 的因數', 'for n = 1 .. N:', '  f′[n] = Σ μ(n/d) · g[d]，d 跑遍 n 的因數', '檢查 f′ == f'],
  inputs: [{ key: 'f', label: 'f(1), f(2), …（最多 16 項）', type: 'array', default: [1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4], random: () => rnd.arr(rnd.int(8, 14), -5, 9) }],
  run({ f }) {
    const r = new Rec();
    const N = f.length;
    if (N < 1 || N > 16) throw new Error('f 需要 1 到 16 項');
    const mu = new Array(N + 1).fill(1);
    for (let x = 2; x <= N; x++) { let m = x, k = 0, sq = false; for (let d = 2; d * d <= m; d++) if (m % d === 0) { m /= d; k++; if (m % d === 0) sq = true; while (m % d === 0) m /= d; } if (m > 1) k++; mu[x] = sq ? 0 : k % 2 ? -1 : 1; }
    const divs = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
    const g: (number | string)[] = new Array(N).fill(''), back: (number | string)[] = new Array(N).fill('');
    const tbl = (c: CM = {}) => table([mu.slice(1), f, g, back], c, { title: '因數格上的累加與還原', rowHeaders: ['μ(n)', 'f(n)', 'g = Σf', 'f′ = Σμ·g'], colHeaders: Array.from({ length: N }, (_, i) => i + 1) });
    r.snap(`先篩出 μ(1..${N})`, [tbl(Object.fromEntries(Array.from({ length: N }, (_, i) => [`0,${i}`, 'active' as Color])))], 1);
    for (let n = 1; n <= N; n++) {
      const ds = divs(n);
      g[n - 1] = ds.reduce((s, d) => s + f[d - 1], 0);
      const c: CM = { [`2,${n - 1}`]: 'done' };
      ds.forEach((d) => { c[`1,${d - 1}`] = 'compare'; });
      r.snap(`g(${n}) = ${ds.map((d) => `f(${d})`).join(' + ')} = ${g[n - 1]}`, [tbl(c)], 3);
    }
    for (let n = 1; n <= N; n++) {
      const ds = divs(n);
      const terms = ds.filter((d) => mu[n / d] !== 0);
      back[n - 1] = terms.reduce((s, d) => s + mu[n / d] * (g[d - 1] as number), 0);
      const c: CM = { [`3,${n - 1}`]: back[n - 1] === f[n - 1] ? 'done' : 'bad' };
      ds.forEach((d) => { c[`2,${d - 1}`] = mu[n / d] ? (mu[n / d] > 0 ? 'good' : 'bad') : 'muted'; });
      const expr = terms.map((d, i) => `${mu[n / d] > 0 ? (i ? '+ ' : '') : '− '}g(${d})`).join(' ');
      r.snap(`f′(${n}) = ${expr} = ${back[n - 1]}${ds.length > terms.length ? `（μ(n/d) = 0 的 ${ds.length - terms.length} 項跳過）` : ''}`, [tbl(c), text([`n = ${n} 的因數 d：${ds.join(', ')}；係數 μ(${n}/d)：${ds.map((d) => muSym(mu[n / d])).join(', ')}`], '綠 +1、紅 −1、灰 0')], 5);
    }
    const ok = back.every((x, i) => x === f[i]);
    r.snap(ok ? '還原結果與原本的 f 完全一致' : '還原結果不一致！', [tbl(Object.fromEntries(Array.from({ length: N }, (_, i) => [`3,${i}`, (ok ? 'done' : 'bad') as Color])))], 6);
    return r.frames;
  },
};

// ---------------- 大步小步 ----------------
const bsgs: AlgoDef = {
  id: 'discrete-log-bsgs', name: '大步小步離散對數', en: 'Baby-step Giant-step', cat,
  desc: '解 a^x ≡ b (mod M)。令 s = ⌈√M⌉，把 x 寫成 i·s + j（0 ≤ j < s）。小步：把 a^0 … a^(s−1) 存進雜湊表；大步：檢查 b·a^(−s·i) 是否在表中，命中就得到 x = i·s + j。兩邊各 O(√M) 步，比逐一嘗試 M 次快得多。基本版需要 gcd(a, M) = 1 才有 a^(−s)；找不到則無解。結果以模冪驗證，且是最小的非負解。',
  time: 'O(√M)', space: 'O(√M)',
  code: ['s = ⌈√M⌉', '小步：for j = 0 .. s−1: if a^j 不在表中: table[a^j] = j', 'factor = a^(−s) mod M', 'γ = b mod M', 'for i = 0 .. s−1:', '  if γ in table: return x = i·s + table[γ]', '  γ = γ · factor            (大步：b · a^(−s(i+1)))', 'return 無解'],
  inputs: [inNum('a', '底數 a', 3, 1, 1e9, () => rnd.int(2, 20)), inNum('b', '目標 b', 13, 0, 1e9, () => rnd.int(1, 100)), inNum('M', '模數 M', 101, 2, 1e9, () => rnd.pick([17, 31, 101, 257, 1009, 65537, 1000003]))],
  run({ a, b, M }) {
    const r = new Rec();
    if (![a, b, M].every(Number.isInteger) || M < 2) throw new Error('a、b 需為整數，M ≥ 2');
    if (gcd(mod(a, M), M) !== 1) throw new Error(`gcd(${a}, ${M}) = ${gcd(mod(a, M), M)} ≠ 1：基本版大步小步需要 a 與 M 互質（否則 a^(−s) 不存在）`);
    a = mod(a, M); b = mod(b, M);
    const s = Math.ceil(Math.sqrt(M));
    const tableMap = new Map<number, number>();
    const entries: [number, number][] = [];
    const babyPanel = (hit = -1) => {
      const show = entries.slice(0, 24);
      const c: CM = {};
      show.forEach(([v], i) => { if (v === hit) c[`1,${i}`] = 'done'; });
      return table([show.map((e) => e[1]), show.map((e) => e[0])], c, { title: `雜湊表（共 ${entries.length} 筆${entries.length > 24 ? '，只顯示前 24 筆' : ''}）`, rowHeaders: ['j', 'a^j'] });
    };
    r.snap(`s = ⌈√${M}⌉ = ${s}；x 拆成 i·${s} + j`, [vars({ a, b, M, s })], 1);
    let cur = 1;
    for (let j = 0; j < s; j++) {
      if (!tableMap.has(cur)) { tableMap.set(cur, j); entries.push([cur, j]); }
      if (j < 8 || j === s - 1) r.snap(`小步 j = ${j}：a^${j} = ${cur} 存入表`, [babyPanel(cur), vars({ j, 'a^j': cur })], 2);
      cur = mulMod(cur, a, M);
    }
    const factor = invMod(powMod(a, s, M), M)!;
    r.snap(`a^${s} = ${powMod(a, s, M)}，其反元素 factor = ${factor}`, [babyPanel(), vars({ factor })], 3);
    let gamma = b;
    for (let i = 0; i < s; i++) {
      if (tableMap.has(gamma)) {
        const x = i * s + tableMap.get(gamma)!;
        r.snap(`大步 i = ${i}：γ = ${gamma} 在表中（j = ${tableMap.get(gamma)}）→ x = ${i}·${s} + ${tableMap.get(gamma)} = ${x}；驗證 ${a}^${x} mod ${M} = ${powMod(a, x, M)}`, [babyPanel(gamma), vars({ i, γ: gamma, x }, undefined, { x: 'done' })], 6);
        return r.frames;
      }
      if (i < 10 || i % 50 === 0) r.snap(`大步 i = ${i}：γ = ${gamma} 不在表中，γ ×= ${factor}`, [babyPanel(), vars({ i, γ: gamma })], 7);
      gamma = mulMod(gamma, factor, M);
    }
    r.snap(`走完 ${s} 個大步都沒命中：${a}^x ≡ ${b} (mod ${M}) 無解（${b} 不在 ${a} 的冪次循環裡）`, [babyPanel(), vars({ 結果: '無解' }, undefined, { 結果: 'bad' })], 8);
    return r.frames;
  },
};

export default [totient, pollardRho, ntt, lucas, mobiusSieve, mobiusInversion, bsgs];
