import type { AlgoDef, Color, GEdge, GNode } from '../core/types';
import { Rec, bars, cells, vars, table, text, inArr, inNum, inText, inSelect, rnd, fmt } from '../core/helpers';
import { binaryPanel, gpanel, parseGraph, type BNode } from '../core/graph';
import { ptrs } from '../core/sortTracer';
import { buildLevel } from './tree';

const cat = 'dp';
type CM = Record<string, Color | undefined>;
const INF = Infinity;

const fib: AlgoDef = {
  id: 'fibonacci', name: '費氏數列', en: 'Fibonacci (Naive / Memo / Tabulation)', cat, star: true,
  desc: '比較三種寫法：單純遞迴會重複計算相同子問題（呼叫次數指數成長）；記憶化（top-down）把算過的結果存起來；表格法（bottom-up）由小到大填表。',
  time: '遞迴 O(φⁿ)，DP O(n)', space: 'O(n)',
  code: ['fib(n):', '  if n <= 1: return n', '  [記憶化] if memo[n] 存在: return memo[n]', '  return fib(n-1) + fib(n-2)', '[表格法] dp[0]=0, dp[1]=1', '  for i = 2 .. n: dp[i] = dp[i-1] + dp[i-2]'],
  inputs: [inNum('n', 'n', 6, 1, 25), inSelect('mode', '方法', [['naive', '單純遞迴'], ['memo', '記憶化遞迴'], ['tab', '表格法']])],
  run({ n, mode }) {
    const r = new Rec();
    if (mode === 'tab') {
      const dp: (number | null)[] = new Array(n + 1).fill(null);
      dp[0] = 0; if (n >= 1) dp[1] = 1;
      r.snap('dp[0] = 0, dp[1] = 1', [cells(dp, { 0: 'done', 1: 'done' }, { title: 'dp' })], 5);
      for (let i = 2; i <= n; i++) { dp[i] = dp[i - 1]! + dp[i - 2]!; r.snap(`dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i]}`, [cells(dp, { [i]: 'swap', [i - 1]: 'compare', [i - 2]: 'compare' }, { title: 'dp' })], 6); }
      r.snap(`fib(${n}) = ${dp[n]}`, [cells(dp, { [n]: 'done' }, { title: 'dp' })]);
      return r.frames;
    }
    n = Math.min(n, mode === 'naive' ? 7 : 25);
    const nodes: GNode[] = [], edges: GEdge[] = [];
    const memo: Record<number, number> = {};
    let calls = 0, leaf = 0;
    const tree: { id: string; n: number; kids: string[]; val?: number; hit?: boolean }[] = [];
    const build = (k: number): string => {
      const id = 'c' + tree.length;
      const node: (typeof tree)[0] = { id, n: k, kids: [] };
      tree.push(node);
      if (k > 1 && !(mode === 'memo' && memo[k] !== undefined)) {
        node.kids.push(build(k - 1), build(k - 2));
        memo[k] = 1;
      } else if (k > 1) node.hit = true;
      return id;
    };
    build(n);
    for (const k in memo) delete memo[k];
    const pos: Record<string, { x: number; y: number }> = {};
    const lay = (id: string, d: number): number => {
      const t = tree.find((x) => x.id === id)!;
      const x = t.kids.length ? t.kids.map((c) => lay(c, d + 1)).reduce((a, b) => a + b) / t.kids.length : leaf++ * 46;
      pos[id] = { x, y: d * 62 };
      return x;
    };
    lay('c0', 0);
    const state: Record<string, Color> = {};
    const P = () => {
      nodes.length = 0; edges.length = 0;
      for (const t of tree) if (state[t.id]) {
        nodes.push({ id: t.id, x: pos[t.id].x, y: pos[t.id].y, label: `f${t.n}`, color: state[t.id], sub: t.val !== undefined ? String(t.val) : undefined });
        for (const c of t.kids) if (state[c]) edges.push({ from: t.id, to: c });
      }
      return [{ type: 'graph' as const, nodes: [...nodes], edges: [...edges], title: '遞迴呼叫樹（下方為回傳值）' }, vars({ 呼叫次數: calls, ...(mode === 'memo' ? { memo: Object.entries(memo).map(([k, v]) => `${k}:${v}`).join(' ') } : {}) })];
    };
    const run = (id: string): number => {
      const t = tree.find((x) => x.id === id)!;
      calls++;
      state[id] = 'active';
      r.snap(`呼叫 fib(${t.n})`, P(), 1);
      let v: number;
      if (t.n <= 1) { v = t.n; r.snap(`fib(${t.n}) 為基底，回傳 ${v}`, P(), 2); }
      else if (t.hit) { v = memo[t.n]; state[id] = 'good'; t.val = v; r.snap(`memo[${t.n}] 已存在，直接回傳 ${v}`, P(), 3); return v; }
      else {
        state[id] = 'frontier';
        v = run(t.kids[0]) + run(t.kids[1]);
        if (mode === 'memo') memo[t.n] = v;
      }
      t.val = v;
      state[id] = 'done';
      r.snap(`fib(${t.n}) = ${v}`, P(), 4);
      return v;
    };
    const ans = run('c0');
    r.snap(`fib(${n}) = ${ans}，共呼叫 ${calls} 次${mode === 'naive' ? '（重複計算很多次！試試記憶化）' : ''}`, P());
    return r.frames;
  },
};

const stairs: AlgoDef = {
  id: 'climbing-stairs', name: '爬樓梯', en: 'Climbing Stairs', cat, star: true,
  desc: '每次可以爬的階數集合為 steps，問爬到第 n 階有幾種方法。dp[i] = Σ dp[i − s]（s ∈ steps），預設 {1, 2} 即為 Fibonacci。',
  time: 'O(n · |steps|)', space: 'O(n)',
  code: ['dp[0] = 1', 'for i = 1 .. n:', '  for s in steps:', '    if i >= s: dp[i] += dp[i - s]', 'return dp[n]'],
  inputs: [inNum('n', '階數 n', 8, 1, 30), { key: 'steps', label: '每次可爬階數', type: 'array', default: [1, 2], random: () => rnd.distinct(rnd.int(2, 3), 1, 4).sort() }],
  run({ n, steps }) {
    const r = new Rec();
    const dp = new Array(n + 1).fill(0);
    dp[0] = 1;
    r.snap('dp[0] = 1（站在地面只有一種方式）', [bars(dp, { 0: 'done' }, { labels: dp.map(String) })], 1);
    for (let i = 1; i <= n; i++) {
      for (const s of steps) if (i >= s) { dp[i] += dp[i - s]; r.snap(`dp[${i}] += dp[${i - s}]（最後一步爬 ${s} 階）→ ${dp[i]}`, [bars(dp, { [i]: 'swap', [i - s]: 'compare' }, { pointers: ptrs({ i }) })], 4); }
    }
    r.snap(`爬到第 ${n} 階共有 ${dp[n]} 種方法`, [bars(dp, { [n]: 'done' })], 5);
    return r.frames;
  },
};

type Item = { w: number; v: number };
const parseItems = (s: string): Item[] => String(s).split(';').map((x) => x.trim().split(/\s+/).map(Number)).filter((x) => x.length >= 2 && x.every((y) => !isNaN(y))).map(([w, v, c]) => ({ w, v, c } as any));
const itemsIn = (def: string, label = '物品（重量 價值，以 ; 分隔）', withCount = false) => ({ key: 'items', label, type: 'text' as const, default: def, random: () => Array.from({ length: rnd.int(3, 5) }, () => `${rnd.int(1, 6)} ${rnd.int(1, 12)}${withCount ? ' ' + rnd.int(1, 4) : ''}`).join('; ') });

const knap01: AlgoDef = {
  id: 'knapsack-01', name: '0/1 背包', en: '0/1 Knapsack', cat, star: true,
  desc: '每件物品只能選或不選。dp[i][c] = 前 i 件物品、容量 c 時的最大價值 = max(不選 dp[i−1][c], 選 dp[i−1][c−w] + v)。最後從表格右下角回溯得到選了哪些物品。',
  time: 'O(n · W)', space: 'O(n · W)',
  code: ['dp[0][*] = 0', 'for i = 1 .. n:', '  for c = 0 .. W:', '    dp[i][c] = dp[i-1][c]  (不選)', '    if w[i] <= c:', '      dp[i][c] = max(dp[i][c], dp[i-1][c-w[i]] + v[i])', '回溯：dp[i][c] != dp[i-1][c] 代表選了第 i 件'],
  inputs: [itemsIn('1 1; 3 4; 4 5; 5 7'), inNum('W', '背包容量 W', 7, 1, 15)],
  run({ items, W }) {
    const r = new Rec();
    const it = parseItems(items);
    const n = it.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
    const T = (c: CM = {}) => table(dp, c, { rowHeaders: ['∅', ...it.map((x, i) => `#${i + 1} (w${x.w},v${x.v})`)], colHeaders: Array.from({ length: W + 1 }, (_, i) => i), title: 'dp[i][c]' });
    r.snap('第 0 列（沒有物品）全為 0', [T()], 1);
    for (let i = 1; i <= n; i++)
      for (let c = 0; c <= W; c++) {
        const { w, v } = it[i - 1];
        dp[i][c] = dp[i - 1][c];
        if (w <= c && dp[i - 1][c - w] + v > dp[i][c]) {
          dp[i][c] = dp[i - 1][c - w] + v;
          r.snap(`dp[${i}][${c}]：選第 ${i} 件 ${dp[i - 1][c - w]} + ${v} = ${dp[i][c]} > 不選 ${dp[i - 1][c]}`, [T({ [`${i},${c}`]: 'swap', [`${i - 1},${c}`]: 'compare', [`${i - 1},${c - w}`]: 'good' })], 6);
        } else r.snap(`dp[${i}][${c}] = ${dp[i][c]}（${w > c ? '放不下' : '不選較好'}）`, [T({ [`${i},${c}`]: 'swap', [`${i - 1},${c}`]: 'compare', ...(w <= c ? { [`${i - 1},${c - w}`]: 'compare' as Color } : {}) })], w > c ? 4 : 6);
      }
    const path: CM = {};
    const chosen: number[] = [];
    let c = W;
    for (let i = n; i > 0; i--) {
      path[`${i},${c}`] = 'path';
      if (dp[i][c] !== dp[i - 1][c]) { chosen.push(i); c -= it[i - 1].w; }
    }
    path[`0,${c}`] = 'path';
    r.snap(`最大價值 ${dp[n][W]}，選擇物品 #${chosen.reverse().join(', #')}`, [T(path)], 7);
    return r.frames;
  },
};

const knapUnbounded: AlgoDef = {
  id: 'knapsack-unbounded', name: '完全背包', en: 'Unbounded Knapsack', cat,
  desc: '每件物品可以選無限次。只需一維陣列，且容量要「由小到大」遍歷，讓同一件物品可以被重複使用（與 0/1 背包由大到小相反）。',
  time: 'O(n · W)', space: 'O(W)',
  code: ['dp[0..W] = 0', 'for 物品 (w, v):', '  for c = w .. W:   (由小到大)', '    dp[c] = max(dp[c], dp[c - w] + v)'],
  inputs: [itemsIn('2 3; 3 5; 4 7; 5 8'), inNum('W', '背包容量 W', 11, 1, 25)],
  run({ items, W }) {
    const r = new Rec();
    const it = parseItems(items);
    const dp = new Array(W + 1).fill(0);
    r.snap('dp 全為 0', [bars(dp, {}, { labels: dp.map(String) })], 1);
    it.forEach(({ w, v }, k) => {
      for (let c = w; c <= W; c++) {
        const cand = dp[c - w] + v;
        if (cand > dp[c]) { dp[c] = cand; r.snap(`物品 #${k + 1}(w${w},v${v})：dp[${c}] = dp[${c - w}] + ${v} = ${cand}`, [bars(dp, { [c]: 'swap', [c - w]: 'compare' }, { pointers: ptrs({ c }) }), vars({ 物品: `#${k + 1} w=${w} v=${v}` })], 4); }
        else r.snap(`物品 #${k + 1}：dp[${c}] 維持 ${dp[c]}`, [bars(dp, { [c]: 'active', [c - w]: 'compare' }, { pointers: ptrs({ c }) }), vars({ 物品: `#${k + 1} w=${w} v=${v}` })], 4);
      }
    });
    r.snap(`最大價值 = ${dp[W]}`, [bars(dp, { [W]: 'done' })]);
    return r.frames;
  },
};

const knapBounded: AlgoDef = {
  id: 'knapsack-bounded', name: '多重背包', en: 'Bounded Knapsack (Binary Splitting)', cat,
  desc: '每件物品最多 c 個。用二進位拆分把 c 個拆成 1, 2, 4, …, 剩餘 份，每份當成一件 0/1 物品，就能湊出 0..c 的任何數量，物品數從 Σc 降為 Σlog c。',
  time: 'O(W · Σ log c)', space: 'O(W)',
  code: ['for 物品 (w, v, c):', '  k = 1', '  while c > 0:', '    take = min(k, c); 產生 0/1 物品 (take·w, take·v)', '    c -= take; k *= 2', '對所有 0/1 物品做背包（容量由大到小）'],
  inputs: [itemsIn('2 3 3; 3 4 2; 4 6 4', '物品（重量 價值 數量，以 ; 分隔）', true), inNum('W', '背包容量 W', 12, 1, 25)],
  run({ items, W }) {
    const r = new Rec();
    const it = parseItems(items) as (Item & { c: number })[];
    const parts: { w: number; v: number; desc: string }[] = [];
    for (const [i, x] of it.entries()) {
      let c = x.c ?? 1, k = 1;
      while (c > 0) { const t = Math.min(k, c); parts.push({ w: t * x.w, v: t * x.v, desc: `#${i + 1}×${t}` }); c -= t; k *= 2; }
    }
    const PT = (hl = -1) => table(parts.map((p) => [p.desc, p.w, p.v]), Object.fromEntries([0, 1, 2].map((c) => [`${hl},${c}`, 'compare'])) as CM, { colHeaders: ['拆分', '重量', '價值'], w: 'half', title: '二進位拆分後的 0/1 物品' });
    r.snap(`二進位拆分：${parts.map((p) => p.desc).join('、')}`, [PT()], 4);
    const dp = new Array(W + 1).fill(0);
    parts.forEach((p, k) => {
      for (let c = W; c >= p.w; c--) if (dp[c - p.w] + p.v > dp[c]) dp[c] = dp[c - p.w] + p.v;
      r.snap(`加入 ${p.desc}（w${p.w}, v${p.v}），容量由大到小更新`, [PT(k), bars(dp, {}, { labels: dp.map(String), title: 'dp[c]' })], 6);
    });
    r.snap(`最大價值 = ${dp[W]}`, [PT(), bars(dp, { [W]: 'done' }, { title: 'dp[c]' })]);
    return r.frames;
  },
};

const coin: AlgoDef = {
  id: 'coin-change', name: '零錢兌換', en: 'Coin Change', cat,
  desc: '兩種問題：最少硬幣數 dp[a] = min(dp[a − c] + 1)；湊出金額的方法數 ways[a] += ways[a − c]（外層迴圈跑硬幣，避免重複計算排列）。',
  time: 'O(A · |coins|)', space: 'O(A)',
  code: ['[最少硬幣] dp[0] = 0, 其餘 ∞', '  for a = 1 .. A: for c in coins:', '    dp[a] = min(dp[a], dp[a-c] + 1)', '[方法數] ways[0] = 1', '  for c in coins: for a = c .. A:', '    ways[a] += ways[a-c]'],
  inputs: [{ key: 'coins', label: '硬幣面額', type: 'array', default: [1, 3, 4], random: () => rnd.distinct(3, 1, 7).sort((a, b) => a - b) }, inNum('A', '金額', 10, 1, 30), inSelect('mode', '問題', [['min', '最少硬幣數'], ['ways', '組合方法數']])],
  run({ coins, A, mode }) {
    const r = new Rec();
    if (mode === 'ways') {
      const w = new Array(A + 1).fill(0);
      w[0] = 1;
      r.snap('ways[0] = 1', [cells(w, { 0: 'done' }, { title: 'ways[a]' })], 4);
      for (const c of coins) for (let a = c; a <= A; a++) { w[a] += w[a - c]; r.snap(`硬幣 ${c}：ways[${a}] += ways[${a - c}] → ${w[a]}`, [cells(w, { [a]: 'swap', [a - c]: 'compare' }, { title: 'ways[a]' }), vars({ 硬幣: c })], 6); }
      r.snap(`湊出 ${A} 的方法數 = ${w[A]}`, [cells(w, { [A]: 'done' }, { title: 'ways[a]' })]);
      return r.frames;
    }
    const dp: number[] = new Array(A + 1).fill(INF), from: number[] = new Array(A + 1).fill(-1);
    dp[0] = 0;
    r.snap('dp[0] = 0，其他為 ∞', [cells(dp, { 0: 'done' }, { title: 'dp[a]（最少硬幣數）' })], 1);
    for (let a = 1; a <= A; a++)
      for (const c of coins) {
        if (c > a) continue;
        if (dp[a - c] + 1 < dp[a]) { dp[a] = dp[a - c] + 1; from[a] = c; r.snap(`dp[${a}] = dp[${a - c}] + 1 = ${dp[a]}（用一枚 ${c}）`, [cells(dp, { [a]: 'swap', [a - c]: 'compare' }, { title: 'dp[a]（最少硬幣數）' })], 3); }
        else r.snap(`dp[${a - c}] + 1 = ${fmt(dp[a - c] + 1)} 不比 ${dp[a]} 好`, [cells(dp, { [a]: 'active', [a - c]: 'compare' }, { title: 'dp[a]（最少硬幣數）' })], 3);
      }
    if (dp[A] === INF) { r.snap(`無法湊出 ${A}`, [cells(dp, { [A]: 'bad' }, { title: 'dp[a]' })]); return r.frames; }
    const used: number[] = [];
    const pc: CM = {};
    for (let a = A; a > 0; a -= from[a]) { used.push(from[a]); pc[a] = 'path'; }
    pc[0] = 'path';
    r.snap(`最少 ${dp[A]} 枚：${used.join(' + ')}`, [cells(dp, pc as any, { title: 'dp[a]（回溯路徑）' })]);
    return r.frames;
  },
};

const subsetSum: AlgoDef = {
  id: 'subset-sum', name: '子集合和', en: 'Subset Sum', cat,
  desc: '判斷能否從集合中挑出若干數字使總和為 T。dp[i][s] = 前 i 個數能否湊出 s = dp[i−1][s] or dp[i−1][s − a[i]]。',
  time: 'O(n · T)', space: 'O(n · T)',
  code: ['dp[0][0] = true', 'for i = 1 .. n:', '  for s = 0 .. T:', '    dp[i][s] = dp[i-1][s]', '    if a[i] <= s: dp[i][s] |= dp[i-1][s - a[i]]', '回溯找出使用的數字'],
  inputs: [inArr([3, 34, 4, 12, 5, 2], '集合', 6, 1, 15), inNum('T', '目標和 T', 9, 1, 30)],
  run({ arr: a, T }) {
    const r = new Rec();
    const n = a.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(T + 1).fill(false));
    dp[0][0] = true;
    const view = () => dp.map((row) => row.map((x) => (x ? 'T' : '·')));
    const base = (): CM => { const c: CM = {}; dp.forEach((row, i) => row.forEach((x, s) => { if (x) c[`${i},${s}`] = 'good'; })); return c; };
    const Tb = (c: CM = {}) => table(view(), { ...base(), ...c }, { rowHeaders: ['∅', ...a.map((x: number) => String(x))], colHeaders: Array.from({ length: T + 1 }, (_, i) => i), title: 'dp[i][s]（T = 可湊出）' });
    r.snap('dp[0][0] = true：空集合湊出 0', [Tb()], 1);
    for (let i = 1; i <= n; i++) {
      for (let s = 0; s <= T; s++) {
        dp[i][s] = dp[i - 1][s] || (a[i - 1] <= s && dp[i - 1][s - a[i - 1]]);
      }
      r.snap(`加入數字 ${a[i - 1]}：第 ${i} 列 = 上一列 OR 上一列右移 ${a[i - 1]}`, [Tb(Object.fromEntries(Array.from({ length: T + 1 }, (_, s) => [`${i},${s}`, dp[i][s] ? 'swap' : 'compare']))) ], 5);
    }
    if (!dp[n][T]) { r.snap(`無法湊出 ${T}`, [Tb({ [`${n},${T}`]: 'bad' })]); return r.frames; }
    const used: number[] = [];
    const pc: CM = {};
    let s = T;
    for (let i = n; i > 0; i--) { pc[`${i},${s}`] = 'path'; if (!dp[i - 1][s]) { used.push(a[i - 1]); s -= a[i - 1]; } }
    pc[`0,${s}`] = 'path';
    r.snap(`可以湊出 ${T}：${used.reverse().join(' + ')}`, [Tb(pc)], 6);
    return r.frames;
  },
};

const lcs: AlgoDef = {
  id: 'lcs', name: '最長共同子序列', en: 'Longest Common Subsequence', cat,
  desc: 'dp[i][j] = A 前 i 個字元與 B 前 j 個字元的 LCS 長度。字元相同時取左上 + 1，否則取上方與左方的較大者。最後由右下角沿箭頭回溯。',
  time: 'O(n · m)', space: 'O(n · m)',
  code: ['dp[0][*] = dp[*][0] = 0', 'for i = 1 .. n, j = 1 .. m:', '  if A[i] == B[j]: dp[i][j] = dp[i-1][j-1] + 1  ↖', '  else: dp[i][j] = max(dp[i-1][j] ↑, dp[i][j-1] ←)', '從 dp[n][m] 沿箭頭回溯，↖ 的字元即為 LCS'],
  inputs: [inText('a', '字串 A', 'ABCBDAB', () => rnd.pick(['AGGTAB', 'ABCDEF', 'STONE', 'DYNAMIC'])), inText('b', '字串 B', 'BDCABA', () => rnd.pick(['GXTXAYB', 'ACBCF', 'LONGEST', 'PROGRAM']))],
  run({ a, b }) {
    const r = new Rec();
    const A = [...String(a)], B = [...String(b)];
    const n = A.length, m = B.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    const arrow: Record<string, string> = {};
    const T = (c: CM = {}) => table(dp, c, { rowHeaders: ['', ...A], colHeaders: ['', ...B], arrows: { ...arrow }, title: 'dp[i][j]' });
    r.snap('第 0 列與第 0 行為 0', [T()], 1);
    for (let i = 1; i <= n; i++)
      for (let j = 1; j <= m; j++) {
        if (A[i - 1] === B[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; arrow[`${i},${j}`] = '↖'; r.snap(`A[${i}] = B[${j}] = '${A[i - 1]}'：左上 + 1 = ${dp[i][j]}`, [T({ [`${i},${j}`]: 'swap', [`${i - 1},${j - 1}`]: 'good' })], 3); }
        else {
          const up = dp[i - 1][j] >= dp[i][j - 1];
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          arrow[`${i},${j}`] = up ? '↑' : '←';
          r.snap(`'${A[i - 1]}' ≠ '${B[j - 1]}'：max(上 ${dp[i - 1][j]}, 左 ${dp[i][j - 1]}) = ${dp[i][j]}`, [T({ [`${i},${j}`]: 'swap', [`${i - 1},${j}`]: 'compare', [`${i},${j - 1}`]: 'compare' })], 4);
        }
      }
    const pc: CM = {};
    const res: string[] = [];
    let i = n, j = m;
    while (i > 0 && j > 0) {
      pc[`${i},${j}`] = 'path';
      if (arrow[`${i},${j}`] === '↖') { res.push(A[i - 1]); pc[`${i},${j}`] = 'done'; i--; j--; }
      else if (arrow[`${i},${j}`] === '↑') i--;
      else j--;
    }
    r.snap(`LCS 長度 ${dp[n][m]}："${res.reverse().join('')}"（綠色格子為共同字元）`, [T(pc)], 5);
    return r.frames;
  },
};

const lis: AlgoDef = {
  id: 'lis', name: '最長遞增子序列', en: 'Longest Increasing Subsequence', cat,
  desc: 'O(n²) 法：dp[i] = 以 a[i] 結尾的 LIS 長度 = 1 + max(dp[j])，j < i 且 a[j] < a[i]。O(n log n) 法：tails[k] = 長度 k+1 的遞增子序列最小結尾，用二分搜尋更新。',
  time: 'O(n²) 或 O(n log n)', space: 'O(n)',
  code: ['[O(n²)] for i: dp[i] = 1', '  for j < i: if a[j] < a[i]: dp[i] = max(dp[i], dp[j] + 1)', '[O(n log n)] for x in a:', '  k = lower_bound(tails, x)', '  tails[k] = x  (k == len 時為延伸)', '答案 = max(dp) 或 len(tails)'],
  inputs: [inArr([10, 9, 2, 5, 3, 7, 101, 18, 4, 20], '陣列', 10), inSelect('mode', '方法', [['n2', 'O(n²) DP'], ['nlogn', 'O(n log n) 耐心排序']])],
  run({ arr: a, mode }) {
    const r = new Rec();
    const n = a.length;
    if (mode === 'nlogn') {
      const tails: number[] = [];
      for (let i = 0; i < n; i++) {
        let lo = 0, hi = tails.length;
        while (lo < hi) { const m = (lo + hi) >> 1; if (tails[m] < a[i]) lo = m + 1; else hi = m; }
        const ext = lo === tails.length;
        tails[lo] = a[i];
        r.snap(ext ? `${a[i]} 比所有結尾都大，延伸成長度 ${tails.length}` : `${a[i]} 取代 tails[${lo}]（讓長度 ${lo + 1} 的結尾更小）`, [bars(a, { [i]: 'active' }, { pointers: ptrs({ i }) }), cells(tails, { [lo]: 'swap' }, { title: 'tails[k]：長度 k+1 的最小結尾' })], ext ? 5 : 4);
      }
      r.snap(`LIS 長度 = ${tails.length}（tails 本身不一定是實際的子序列）`, [bars(a, {}), cells(tails, Object.fromEntries(tails.map((_, i) => [i, 'done'])), { title: 'tails' })], 6);
      return r.frames;
    }
    const dp = new Array(n).fill(1), prev = new Array(n).fill(-1);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (a[j] < a[i] && dp[j] + 1 > dp[i]) { dp[i] = dp[j] + 1; prev[i] = j; r.snap(`a[${j}]=${a[j]} < a[${i}]=${a[i]}：dp[${i}] = dp[${j}] + 1 = ${dp[i]}`, [bars(a, { [i]: 'active', [j]: 'compare' }, { pointers: ptrs({ i, j }) }), cells(dp, { [i]: 'swap', [j]: 'compare' }, { title: 'dp[i]' })], 2); }
      }
      r.snap(`dp[${i}] = ${dp[i]}`, [bars(a, { [i]: 'active' }, { pointers: ptrs({ i }) }), cells(dp, { [i]: 'done' }, { title: 'dp[i]' })], 2);
    }
    let best = 0;
    for (let i = 1; i < n; i++) if (dp[i] > dp[best]) best = i;
    const pc: Record<number, Color> = {};
    const seq: number[] = [];
    for (let x = best; x >= 0; x = prev[x]) { pc[x] = 'path'; seq.unshift(a[x]); }
    r.snap(`LIS 長度 ${dp[best]}：${seq.join(' < ')}`, [bars(a, pc), cells(dp, pc, { title: 'dp[i]' })], 6);
    return r.frames;
  },
};

const edit: AlgoDef = {
  id: 'edit-distance', name: '編輯距離', en: 'Edit Distance (Levenshtein)', cat,
  desc: '把 A 變成 B 的最少操作數（插入、刪除、取代）。dp[i][j] = 字元相同時取左上；否則 1 + min(左上=取代, 上=刪除, 左=插入)。',
  time: 'O(n · m)', space: 'O(n · m)',
  code: ['dp[i][0] = i, dp[0][j] = j', 'for i = 1 .. n, j = 1 .. m:', '  if A[i] == B[j]: dp[i][j] = dp[i-1][j-1]', '  else: dp[i][j] = 1 + min(', '    dp[i-1][j-1] (取代), dp[i-1][j] (刪除), dp[i][j-1] (插入))', '回溯得到操作序列'],
  inputs: [inText('a', '字串 A', 'kitten', () => rnd.pick(['sunday', 'intention', 'horse', 'algorithm'])), inText('b', '字串 B', 'sitting', () => rnd.pick(['saturday', 'execution', 'ros', 'altruistic']))],
  run({ a, b }) {
    const r = new Rec();
    const A = [...String(a)], B = [...String(b)];
    const n = A.length, m = B.length;
    const dp = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
    const T = (c: CM = {}) => table(dp, c, { rowHeaders: ['', ...A], colHeaders: ['', ...B], title: 'dp[i][j]' });
    r.snap('初始化第 0 列與第 0 行', [T()], 1);
    for (let i = 1; i <= n; i++)
      for (let j = 1; j <= m; j++) {
        if (A[i - 1] === B[j - 1]) { dp[i][j] = dp[i - 1][j - 1]; r.snap(`'${A[i - 1]}' = '${B[j - 1]}'：沿用左上 ${dp[i][j]}`, [T({ [`${i},${j}`]: 'swap', [`${i - 1},${j - 1}`]: 'good' })], 3); }
        else { dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]); r.snap(`'${A[i - 1]}' ≠ '${B[j - 1]}'：1 + min(${dp[i - 1][j - 1]}, ${dp[i - 1][j]}, ${dp[i][j - 1]}) = ${dp[i][j]}`, [T({ [`${i},${j}`]: 'swap', [`${i - 1},${j - 1}`]: 'compare', [`${i - 1},${j}`]: 'compare', [`${i},${j - 1}`]: 'compare' })], 5); }
      }
    const pc: CM = {};
    const ops: string[] = [];
    let i = n, j = m;
    while (i > 0 || j > 0) {
      pc[`${i},${j}`] = 'path';
      if (i > 0 && j > 0 && A[i - 1] === B[j - 1]) { i--; j--; }
      else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) { ops.push(`取代 '${A[i - 1]}' → '${B[j - 1]}'`); i--; j--; }
      else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) { ops.push(`刪除 '${A[i - 1]}'`); i--; }
      else { ops.push(`插入 '${B[j - 1]}'`); j--; }
    }
    pc['0,0'] = 'path';
    r.snap(`編輯距離 = ${dp[n][m]}`, [T(pc), text(ops.reverse(), '操作序列')], 6);
    return r.frames;
  },
};

const matrixChain: AlgoDef = {
  id: 'matrix-chain', name: '矩陣鏈乘法', en: 'Matrix Chain Multiplication', cat,
  desc: '決定矩陣相乘的括號順序使純量乘法次數最少。m[i][j] = min over k ( m[i][k] + m[k+1][j] + p[i−1]·p[k]·p[j] )，依鏈長由短到長沿對角線填表。',
  time: 'O(n³)', space: 'O(n²)',
  code: ['m[i][i] = 0', 'for len = 2 .. n:', '  for i = 1 .. n-len+1:', '    j = i + len - 1; m[i][j] = ∞', '    for k = i .. j-1:', '      cost = m[i][k] + m[k+1][j] + p[i-1]·p[k]·p[j]', '      若 cost 較小則更新 m[i][j], s[i][j] = k', '由 s 還原括號'],
  inputs: [{ key: 'arr', label: '維度 p（矩陣 i 為 p[i-1]×p[i]）', type: 'array', default: [30, 35, 15, 5, 10, 20, 25], random: () => rnd.arr(rnd.int(5, 7), 5, 40) }],
  run({ arr: p }) {
    const r = new Rec();
    const n = p.length - 1;
    const m: (number | null)[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : null)));
    const s: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    const names = Array.from({ length: n }, (_, i) => `A${i + 1}`);
    const T = (c: CM = {}) => table(m, c, { rowHeaders: names, colHeaders: names, title: 'm[i][j]：Ai..Aj 的最少乘法次數' });
    r.snap(`${n} 個矩陣：${names.map((x, i) => `${x}(${p[i]}×${p[i + 1]})`).join(' ')}`, [T()], 1);
    for (let len = 2; len <= n; len++)
      for (let i = 0; i + len - 1 < n; i++) {
        const j = i + len - 1;
        m[i][j] = INF;
        for (let k = i; k < j; k++) {
          const cost = m[i][k]! + m[k + 1][j]! + p[i] * p[k + 1] * p[j + 1];
          const better = cost < m[i][j]!;
          if (better) { m[i][j] = cost; s[i][j] = k; }
          r.snap(`m[${i + 1}][${j + 1}]，切在 A${k + 1} 之後：${m[i][k]} + ${m[k + 1][j]} + ${p[i]}·${p[k + 1]}·${p[j + 1]} = ${cost}${better ? '（更新）' : ''}`, [T({ [`${i},${j}`]: 'swap', [`${i},${k}`]: 'compare', [`${k + 1},${j}`]: 'compare' })], better ? 7 : 6);
        }
      }
    const paren = (i: number, j: number): string => (i === j ? names[i] : `(${paren(i, s[i][j])}${paren(s[i][j] + 1, j)})`);
    r.snap(`最少乘法次數 ${m[0][n - 1]}，最佳順序：${paren(0, n - 1)}`, [T({ [`0,${n - 1}`]: 'done' }), text([paren(0, n - 1)], '括號方式')], 8);
    return r.frames;
  },
};

const gridPaths: AlgoDef = {
  id: 'grid-paths', name: '網格路徑', en: 'Grid Paths (Count / Min Path Sum)', cat,
  desc: '只能往右或往下走。路徑數：dp[i][j] = dp[i−1][j] + dp[i][j−1]（障礙格為 0）；最小路徑和：dp[i][j] = grid[i][j] + min(上, 左)。',
  time: 'O(R · C)', space: 'O(R · C)',
  code: ['[路徑數] dp[0][0] = 1；障礙格 dp = 0', '  dp[i][j] = dp[i-1][j] + dp[i][j-1]', '[最小和] dp[0][0] = grid[0][0]', '  dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])', '回溯得到最佳路徑'],
  inputs: [{ key: 'grid', label: '網格（數字；路徑數模式中 # 為障礙）', type: 'text', multiline: true, default: '1 3 1 2\n1 # 1 4\n4 2 1 3\n2 1 # 1', random: () => Array.from({ length: rnd.int(3, 5) }, () => Array.from({ length: rnd.int(4, 6) }, () => (Math.random() < 0.15 ? '#' : rnd.int(1, 9))).join(' ')).join('\n').replace(/^#/, '1') }, inSelect('mode', '問題', [['count', '路徑數'], ['min', '最小路徑和']])],
  run({ grid, mode }) {
    const r = new Rec();
    const G = String(grid).trim().split('\n').map((l) => l.trim().split(/\s+/));
    const R = G.length, C = Math.min(...G.map((x) => x.length));
    const block = (i: number, j: number) => G[i][j] === '#';
    const val = (i: number, j: number) => (block(i, j) ? INF : Number(G[i][j]));
    const dp: (number | null)[][] = Array.from({ length: R }, () => new Array(C).fill(null));
    const base: CM = {};
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) if (block(i, j)) base[`${i},${j}`] = 'muted';
    const P = (c: CM = {}) => [table(G.map((row) => row.slice(0, C)), { ...base }, { title: '網格', w: 'half' }), table(dp, { ...base, ...c }, { title: mode === 'count' ? 'dp：路徑數' : 'dp：最小路徑和', w: 'half' })];
    for (let i = 0; i < R; i++)
      for (let j = 0; j < C; j++) {
        if (mode === 'count') {
          dp[i][j] = block(i, j) ? 0 : i === 0 && j === 0 ? 1 : (i ? dp[i - 1][j]! : 0) + (j ? dp[i][j - 1]! : 0);
          r.snap(block(i, j) ? `(${i},${j}) 是障礙，路徑數 0` : `dp[${i}][${j}] = 上 + 左 = ${dp[i][j]}`, P({ [`${i},${j}`]: 'swap', ...(i ? { [`${i - 1},${j}`]: 'compare' as Color } : {}), ...(j ? { [`${i},${j - 1}`]: 'compare' as Color } : {}) }), i || j ? 2 : 1);
        } else {
          const best = i === 0 && j === 0 ? 0 : Math.min(i ? dp[i - 1][j]! : INF, j ? dp[i][j - 1]! : INF);
          dp[i][j] = val(i, j) + best;
          r.snap(`dp[${i}][${j}] = ${fmt(val(i, j))} + min(上, 左) = ${fmt(dp[i][j])}`, P({ [`${i},${j}`]: 'swap', ...(i ? { [`${i - 1},${j}`]: 'compare' as Color } : {}), ...(j ? { [`${i},${j - 1}`]: 'compare' as Color } : {}) }), i || j ? 4 : 3);
        }
      }
    if (mode === 'min' && dp[R - 1][C - 1] !== INF) {
      const pc: CM = {};
      let i = R - 1, j = C - 1;
      pc[`${i},${j}`] = 'path';
      while (i || j) { if (i && (!j || dp[i - 1][j]! <= dp[i][j - 1]!)) i--; else j--; pc[`${i},${j}`] = 'path'; }
      r.snap(`最小路徑和 = ${dp[R - 1][C - 1]}`, P(pc), 5);
    } else r.snap(mode === 'count' ? `從左上到右下共有 ${dp[R - 1][C - 1]} 條路徑` : '終點無法到達', P({ [`${R - 1},${C - 1}`]: 'done' }), 5);
    return r.frames;
  },
};

const intervalDP: AlgoDef = {
  id: 'interval-dp', name: '區間動態規劃（石子合併）', en: 'Interval DP (Stone Merging)', cat,
  desc: '一排石堆，每次合併相鄰兩堆，成本為兩堆重量和，求全部合併的最小總成本。dp[i][j] = min_k (dp[i][k] + dp[k+1][j]) + sum(i..j)，依區間長度由小到大計算——區間 DP 的經典範例。',
  time: 'O(n³)', space: 'O(n²)',
  code: ['dp[i][i] = 0; S = 前綴和', 'for len = 2 .. n:', '  for i: j = i + len - 1', '    dp[i][j] = min over k in [i, j):', '      dp[i][k] + dp[k+1][j] + sum(i..j)', 'return dp[0][n-1]'],
  inputs: [inArr([4, 1, 2, 3, 5, 2], '石堆重量', 6, 1, 9)],
  run({ arr: a }) {
    const r = new Rec();
    const n = a.length;
    const S = [0];
    for (const x of a) S.push(S[S.length - 1] + x);
    const dp: (number | null)[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : null)));
    const T = (c: CM = {}) => table(dp, c, { rowHeaders: a.map((x: number, i: number) => `${i}(${x})`), colHeaders: a.map((x: number, i: number) => `${i}(${x})`), title: 'dp[i][j]：合併 i..j 的最小成本' });
    r.snap('長度 1 的區間成本為 0', [bars(a, {}), T()], 1);
    for (let len = 2; len <= n; len++)
      for (let i = 0; i + len - 1 < n; i++) {
        const j = i + len - 1;
        const sum = S[j + 1] - S[i];
        let best = INF, bk = i;
        for (let k = i; k < j; k++) { const c = dp[i][k]! + dp[k + 1][j]! + sum; if (c < best) { best = c; bk = k; } }
        dp[i][j] = best;
        r.snap(`dp[${i}][${j}]：最佳切點 k = ${bk}，${dp[i][bk]} + ${dp[bk + 1][j]} + sum ${sum} = ${best}`, [bars(a, Object.fromEntries(a.map((_: number, x: number) => [x, x >= i && x <= bk ? 'active' : x > bk && x <= j ? 'frontier' : undefined]))), T({ [`${i},${j}`]: 'swap', [`${i},${bk}`]: 'compare', [`${bk + 1},${j}`]: 'compare' })], 5);
      }
    r.snap(`最小總成本 = ${dp[0][n - 1]}`, [bars(a, {}), T({ [`0,${n - 1}`]: 'done' })], 6);
    return r.frames;
  },
};

const treeDP: AlgoDef = {
  id: 'tree-dp', name: '樹形動態規劃（獨立集）', en: 'Tree DP (Max Weight Independent Set)', cat,
  desc: '在樹上選一些節點使總權重最大，且相鄰（父子）不能同時選。後序走訪計算每個節點的 (選, 不選)：選 = w + Σ 子節點不選；不選 = Σ max(子節點選, 不選)。',
  time: 'O(n)', space: 'O(h)',
  code: ['solve(u):  後序走訪', '  take = w[u], skip = 0', '  for v in children(u):', '    (t, s) = solve(v)', '    take += s', '    skip += max(t, s)', '  return (take, skip)', '答案 = max(solve(root))；再由上往下回溯選擇'],
  inputs: [inText('tree', '二元樹（層序，數字為權重）', '3 4 5 1 3 null 1 2 null 6 null 4', () => Array.from({ length: rnd.int(8, 12) }, () => (Math.random() < 0.15 ? 'null' : rnd.int(1, 9))).join(' ').replace(/^null/, '5'))],
  run({ tree }) {
    const r = new Rec();
    const root = buildLevel(tree);
    const res = new Map<BNode, [number, number]>();
    let cur: BNode | null = null;
    const pick = new Set<BNode>();
    const P = (line?: number, msg = '') => r.snap(msg, [binaryPanel(root, { color: (n) => (pick.has(n) ? 'done' : n === cur ? 'active' : res.has(n) ? 'visited' : undefined), sub: (n) => (res.has(n) ? `選${res.get(n)![0]}/不${res.get(n)![1]}` : undefined), title: '節點下方：(選, 不選) 的最大權重' })], line);
    const solve = (n: BNode | null): [number, number] => {
      if (!n) return [0, 0];
      const L = solve(n.left), R = solve(n.right);
      cur = n;
      const take = (n.val as number) + L[1] + R[1];
      const skip = Math.max(...L) + Math.max(...R);
      res.set(n, [take, skip]);
      P(7, `節點 ${n.val}：選 = ${n.val} + ${L[1]} + ${R[1]} = ${take}；不選 = max(${L.join(',')}) + max(${R.join(',')}) = ${skip}`);
      return [take, skip];
    };
    const ans = solve(root);
    cur = null;
    const back = (n: BNode | null, parentTaken: boolean) => {
      if (!n) return;
      const [t, s] = res.get(n)!;
      const take = !parentTaken && t >= s;
      if (take) pick.add(n);
      back(n.left, take); back(n.right, take);
    };
    back(root, false);
    P(8, `最大總權重 = ${Math.max(...ans)}，選擇綠色節點`);
    return r.frames;
  },
};

const bitmask: AlgoDef = {
  id: 'bitmask-dp', name: '狀態壓縮動態規劃（指派）', en: 'Bitmask DP (Assignment Problem)', cat,
  desc: '用二進位 mask 表示「哪些工作已被分配」。dp[mask] = 前 popcount(mask) 個工人完成 mask 中工作的最小成本；第 i 個工人嘗試每一個未分配的工作 j：dp[mask | 1<<j] = min(dp[mask] + cost[i][j])。',
  time: 'O(2ⁿ · n)', space: 'O(2ⁿ)',
  code: ['dp[0] = 0，其餘 ∞', 'for mask = 0 .. 2ⁿ-1:', '  i = popcount(mask)  (下一個工人)', '  for j 不在 mask 中:', '    dp[mask | 1<<j] = min(..., dp[mask] + cost[i][j])', 'return dp[2ⁿ - 1]'],
  inputs: [{ key: 'm', label: '成本矩陣 cost[工人][工作]', type: 'text', multiline: true, default: '9 2 7 8\n6 4 3 7\n5 8 1 8\n7 6 9 4', random: () => { const n = rnd.int(3, 4); return Array.from({ length: n }, () => rnd.arr(n, 1, 12).join(' ')).join('\n'); } }],
  run({ m }) {
    const r = new Rec();
    const C = String(m).trim().split('\n').map((l) => l.trim().split(/\s+/).map(Number));
    const n = Math.min(C.length, 5);
    const N = 1 << n;
    const dp = new Array(N).fill(INF), from = new Array(N).fill(-1);
    dp[0] = 0;
    const lab = Array.from({ length: N }, (_, x) => x.toString(2).padStart(n, '0'));
    const P = (c: Record<number, Color> = {}, cc: CM = {}) => [table(C.slice(0, n).map((row) => row.slice(0, n)), cc, { rowHeaders: C.slice(0, n).map((_, i) => '工人' + i), colHeaders: C.slice(0, n).map((_, j) => '工作' + j), w: 'half', title: 'cost' }), cells(dp, c, { headers: lab, title: 'dp[mask]（mask 由右至左為工作 0..n-1）' })];
    r.snap('dp[0] = 0', P({ 0: 'done' }), 1);
    for (let mask = 0; mask < N; mask++) {
      if (dp[mask] === INF) continue;
      const i = lab[mask].split('').filter((x) => x === '1').length;
      if (i >= n) continue;
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue;
        const nm = mask | (1 << j);
        const c = dp[mask] + C[i][j];
        if (c < dp[nm]) {
          dp[nm] = c; from[nm] = mask;
          r.snap(`工人 ${i} 做工作 ${j}：dp[${lab[nm]}] = dp[${lab[mask]}] + ${C[i][j]} = ${c}`, P({ [mask]: 'compare', [nm]: 'swap' }, { [`${i},${j}`]: 'swap' }), 5);
        }
      }
    }
    const pc: Record<number, Color> = {}, cc: CM = {};
    const lines: string[] = [];
    for (let x = N - 1; x > 0; x = from[x]) { pc[x] = 'path'; const j = Math.log2(x ^ from[x]); const i = lab[from[x]].split('').filter((y) => y === '1').length; cc[`${i},${j}`] = 'path'; lines.unshift(`工人 ${i} → 工作 ${j}（${C[i][j]}）`); }
    pc[0] = 'path';
    r.snap(`最小總成本 = ${dp[N - 1]}`, [...P(pc, cc), text(lines, '指派')], 6);
    return r.frames;
  },
};

const digitDP: AlgoDef = {
  id: 'digit-dp', name: '數位動態規劃', en: 'Digit DP', cat,
  desc: '計算 0..N 中「各位數字和等於 S」的整數個數。由最高位往下逐位決定數字，狀態為 (位置 pos, 目前和 sum, 是否仍貼著上界 tight)；tight = false 的狀態可以記憶化重複使用。',
  time: 'O(位數 · S · 10)', space: 'O(位數 · S)',
  code: ['f(pos, sum, tight):', '  if sum > S: return 0', '  if pos == 位數: return sum == S ? 1 : 0', '  if not tight 且 memo[pos][sum] 存在: return memo', '  limit = tight ? N 的第 pos 位 : 9', '  for d = 0 .. limit:', '    res += f(pos+1, sum+d, tight and d == limit)', '  if not tight: memo[pos][sum] = res'],
  inputs: [inNum('N', '上界 N', 345, 1, 99999, () => rnd.int(50, 9999)), inNum('S', '數字和 S', 10, 0, 45, () => rnd.int(3, 15))],
  run({ N, S }) {
    const r = new Rec();
    const D = String(N).split('').map(Number);
    const L = D.length;
    const memo: (number | null)[][] = Array.from({ length: L }, () => new Array(S + 1).fill(null));
    let steps = 0;
    const prefix: number[] = [];
    const P = (msg: string, line: number, c: CM = {}) => {
      if (steps++ > 900) return;
      r.snap(msg, [cells(D, Object.fromEntries(prefix.map((_, i) => [i, 'active'])), { title: `N = ${N} 的各位數`, headers: D.map((_, i) => 'pos' + i), w: 'half' }), cells(prefix.length ? prefix : [''], {}, { title: '目前已決定的前綴', headers: false, w: 'half' }), table(memo, c, { rowHeaders: D.map((_, i) => 'pos' + i), colHeaders: Array.from({ length: S + 1 }, (_, i) => 'sum' + i), title: 'memo[pos][sum]（tight = false 的結果）' })], line);
    };
    const f = (pos: number, sum: number, tight: boolean): number => {
      if (sum > S) return 0;
      if (pos === L) return sum === S ? 1 : 0;
      if (!tight && memo[pos][sum] !== null) { P(`f(pos=${pos}, sum=${sum}) 已記憶化 = ${memo[pos][sum]}，直接使用`, 4, { [`${pos},${sum}`]: 'good' }); return memo[pos][sum]!; }
      const lim = tight ? D[pos] : 9;
      let res = 0;
      for (let d = 0; d <= lim; d++) {
        prefix.push(d);
        if (pos < 2) P(`pos ${pos} 放 ${d}${tight && d === lim ? '（仍貼著上界）' : ''}`, 7);
        res += f(pos + 1, sum + d, tight && d === lim);
        prefix.pop();
      }
      if (!tight) { memo[pos][sum] = res; P(`memo[${pos}][${sum}] = ${res}`, 8, { [`${pos},${sum}`]: 'swap' }); }
      return res;
    };
    const ans = f(0, 0, true);
    let brute = 0;
    for (let x = 0; x <= N; x++) if (String(x).split('').reduce((a, b) => a + +b, 0) === S) brute++;
    steps = 0;
    P(`0..${N} 中數字和為 ${S} 的有 ${ans} 個（暴力驗證：${brute}）`, 1);
    return r.frames;
  },
};

const heldKarp: AlgoDef = {
  id: 'held-karp', name: '旅行推銷員問題', en: 'TSP — Held–Karp', cat,
  desc: '從城市 0 出發走遍所有城市再回來的最短迴路。dp[mask][j] = 走過集合 mask、目前在 j 的最短距離；轉移 dp[mask ∪ {k}][k] = min(dp[mask][j] + d[j][k])。比暴力 O(n!) 快很多。',
  time: 'O(2ⁿ · n²)', space: 'O(2ⁿ · n)',
  code: ['dp[{0}][0] = 0', 'for mask 含 0（由小到大）:', '  for j in mask:', '    for k 不在 mask:', '      dp[mask|k][k] = min(..., dp[mask][j] + d[j][k])', '答案 = min_j dp[全集][j] + d[j][0]', '沿 parent 回溯得到路徑'],
  inputs: [{ key: 'pts', label: '城市座標（x y，以 ; 分隔，最多 7 個）', type: 'text', default: '0 0; 4 1; 6 4; 3 6; 1 4; 5 7', random: () => Array.from({ length: rnd.int(4, 6) }, () => `${rnd.int(0, 9)} ${rnd.int(0, 9)}`).join('; ') }],
  run({ pts }) {
    const r = new Rec();
    const P0 = String(pts).split(';').map((x) => x.trim().split(/\s+/).map(Number)).filter((x) => x.length === 2).slice(0, 7);
    const n = P0.length;
    const d = P0.map((a) => P0.map((b) => Math.round(Math.hypot(a[0] - b[0], a[1] - b[1]) * 10) / 10));
    const N = 1 << n;
    const dp = Array.from({ length: N }, () => new Array(n).fill(INF));
    const par = Array.from({ length: N }, () => new Array(n).fill(-1));
    dp[1][0] = 0;
    const g = parseGraph(P0.map((_, i) => String(i)).join('\n'), false);
    P0.forEach(([x, y], i) => (g.pos[String(i)] = { x: x * 50, y: -y * 50 }));
    const masks = Array.from({ length: N }, (_, m) => m).filter((m) => m & 1);
    const lab = (m: number) => m.toString(2).padStart(n, '0');
    const show = (edges: [number, number][], ec: Color, cc: CM, msg: string, line: number) => {
      const gp = gpanel(g, { w: 'half', title: '城市' });
      gp.edges = edges.map(([a, b]) => ({ from: String(a), to: String(b), color: ec, width: 3 }));
      r.snap(msg, [gp, table(masks.map((m) => dp[m]), cc, { rowHeaders: masks.map(lab), colHeaders: P0.map((_, i) => '在' + i), title: 'dp[mask][j]', w: 'half' })], line);
    };
    show([], 'path', {}, 'dp[{0}][0] = 0', 1);
    for (const mask of masks) {
      const ri = masks.indexOf(mask);
      for (let j = 0; j < n; j++) {
        if (!(mask & (1 << j)) || dp[mask][j] === INF) continue;
        const upd: string[] = [];
        const cc: CM = { [`${ri},${j}`]: 'compare' };
        for (let k = 0; k < n; k++) {
          if (mask & (1 << k)) continue;
          const nm = mask | (1 << k);
          const c = +(dp[mask][j] + d[j][k]).toFixed(1);
          if (c < dp[nm][k]) { dp[nm][k] = c; par[nm][k] = j; upd.push(`dp[${lab(nm)}][${k}]=${c}`); cc[`${masks.indexOf(nm)},${k}`] = 'swap'; }
        }
        if (upd.length && n <= 6) show([], 'path', cc, `從 dp[${lab(mask)}][${j}] = ${dp[mask][j]} 延伸：${upd.join('，')}`, 5);
      }
    }
    let best = INF, last = 0;
    for (let j = 1; j < n; j++) if (dp[N - 1][j] + d[j][0] < best) { best = +(dp[N - 1][j] + d[j][0]).toFixed(1); last = j; }
    const tour: number[] = [0];
    for (let m = N - 1, j = last; j !== -1 && j !== 0; ) { tour.push(j); const pj = par[m][j]; m ^= 1 << j; j = pj; }
    tour.push(0);
    const edges: [number, number][] = [];
    for (let i = 0; i + 1 < tour.length; i++) edges.push([tour[i], tour[i + 1]]);
    show(edges, 'path', { [`${masks.length - 1},${last}`]: 'done' }, `最短迴路長度 ${best}：${tour.reverse().join(' → ')}`, 7);
    return r.frames;
  },
};

export default [fib, stairs, knap01, knapUnbounded, knapBounded, coin, subsetSum, lcs, lis, edit, matrixChain, gridPaths, intervalDP, treeDP, bitmask, digitDP, heldKarp];
