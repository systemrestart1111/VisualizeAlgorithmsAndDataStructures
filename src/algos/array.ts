import type { AlgoDef, CMap } from '../core/types';
import { Rec, bars, cells, vars, inArr, inNum, range, rnd, table } from '../core/helpers';
import { SortTracer, ptrs } from '../core/sortTracer';
import { binaryPanel, type BNode } from '../core/graph';

const cat = 'array';

const quickselect: AlgoDef = {
  id: 'quickselect', name: '快速選擇', en: 'Quickselect', cat,
  desc: '找第 k 小的元素：像快速排序一樣分割，但只遞迴進入包含第 k 個位置的那一邊。',
  time: '平均 O(n)，最差 O(n²)', space: 'O(1)',
  code: ['lo = 0, hi = n - 1', 'while lo < hi:', '  p = partition(lo, hi)   (Lomuto)', '  if p == k: return a[k]', '  if k < p: hi = p - 1', '  else: lo = p + 1', 'return a[k]'],
  inputs: [inArr([38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72], '陣列', 12), inNum('k', 'k（0 起算，第 k 小）', 5, 0, 30)],
  run({ arr, k }) {
    const t = new SortTracer(arr);
    k = Math.min(k, t.a.length - 1);
    let lo = 0, hi = t.a.length - 1;
    t.extraVars = { k };
    while (lo < hi) {
      const pv = t.a[hi];
      let i = lo;
      t.snap(`在 [${lo}..${hi}] 分割，pivot = ${pv}`, { ...range(lo, hi, 'active'), [hi]: 'special' }, 3, { lo, hi, k });
      for (let j = lo; j < hi; j++) {
        if (t.less(j, hi)) { t.swap(i, j); i++; }
        t.snap(`比較 a[${j}] 與 pivot`, { ...range(lo, i - 1, 'visited'), [j]: 'compare', [hi]: 'special' }, 3, { i, j, k });
      }
      t.swap(i, hi);
      t.snap(`pivot 就定位於 ${i}`, { [i]: 'swap' }, 3, { p: i, k });
      if (i === k) { lo = hi = k; break; }
      if (k < i) { hi = i - 1; t.snap(`k < p，往左邊找`, range(lo, hi, 'active'), 5, { lo, hi, k }); }
      else { lo = i + 1; t.snap(`k > p，往右邊找`, range(lo, hi, 'active'), 6, { lo, hi, k }); }
    }
    t.snap(`第 ${k} 小的元素是 ${t.a[k]}`, { [k]: 'done' }, 7, { k });
    return t.r.frames;
  },
};

const mom: AlgoDef = {
  id: 'median-of-medians', name: '中位數的中位數', en: 'Median of Medians (BFPRT)', cat,
  desc: '保證最差線性時間的選擇演算法：把資料每 5 個分一組取中位數，再遞迴求「中位數的中位數」當 pivot，保證每次至少捨棄約 30% 的元素。',
  time: 'O(n)', space: 'O(log n)',
  code: ['select(A, k):', '  if |A| <= 5: 排序後回傳 A[k]', '  分成 ⌈n/5⌉ 組，各組排序取中位數', '  M = 各組中位數', '  pivot = select(M, |M|/2)', '  L = {x < pivot}, E = {x = pivot}, G = {x > pivot}', '  if k < |L|: return select(L, k)', '  if k < |L|+|E|: return pivot', '  return select(G, k - |L| - |E|)'],
  inputs: [inArr([12, 3, 5, 7, 4, 19, 26, 1, 14, 8, 22, 17, 9, 30, 2, 11, 25, 6, 15, 20, 28, 10, 13], '陣列', 23), inNum('k', 'k（0 起算）', 11, 0, 50)],
  run({ arr, k }) {
    const r = new Rec();
    k = Math.min(k, arr.length - 1);
    const sel = (A: number[], k: number, depth: number): number => {
      const tag = `[深度 ${depth}] `;
      if (A.length <= 5) {
        const s = [...A].sort((x, y) => x - y);
        r.snap(tag + `元素 ≤ 5 個，直接排序取第 ${k} 小 = ${s[k]}`, [cells(s, { [k]: 'done' }, { title: '目前子問題' }), vars({ k, depth })], 2);
        return s[k];
      }
      const groups: number[][] = [];
      for (let i = 0; i < A.length; i += 5) groups.push(A.slice(i, i + 5).sort((x, y) => x - y));
      const M = groups.map((g) => g[(g.length - 1) >> 1]);
      const rows = Array.from({ length: 5 }, (_, i) => groups.map((g) => g[i] ?? ''));
      const gc: Record<string, any> = {};
      groups.forEach((g, j) => (gc[`${(g.length - 1) >> 1},${j}`] = 'active'));
      r.snap(tag + `分成 ${groups.length} 組並排序，藍色為各組中位數`, [cells(A, {}, { title: '目前子問題' }), table(rows, gc, { colHeaders: groups.map((_, i) => '組' + i), title: '每 5 個一組（已排序）' }), vars({ k, depth })], 3);
      r.snap(tag + `遞迴求中位數們 [${M.join(', ')}] 的中位數`, [cells(M, {}, { title: '中位數集合 M' }), vars({ k, depth })], 5);
      const pv = sel(M, (M.length - 1) >> 1, depth + 1);
      const L = A.filter((x) => x < pv), E = A.filter((x) => x === pv), G = A.filter((x) => x > pv);
      const c: CMap = {};
      A.forEach((x, i) => (c[i] = x < pv ? 'visited' : x === pv ? 'special' : 'frontier'));
      r.snap(tag + `pivot = ${pv}；|L| = ${L.length}, |E| = ${E.length}, |G| = ${G.length}`, [cells(A, c, { title: '目前子問題（紫 < pivot，粉 = pivot，青 > pivot）' }), vars({ k, pivot: pv, depth })], 6);
      if (k < L.length) { r.snap(tag + `k = ${k} < |L|，遞迴進入 L`, [cells(L, {}, { title: 'L' }), vars({ k })], 7); return sel(L, k, depth + 1); }
      if (k < L.length + E.length) { r.snap(tag + `k 落在 E，答案即 pivot = ${pv}`, [cells(E, { 0: 'done' }, { title: 'E' }), vars({ k, pivot: pv })], 8); return pv; }
      r.snap(tag + `k 落在 G，遞迴 select(G, ${k - L.length - E.length})`, [cells(G, {}, { title: 'G' }), vars({ k: k - L.length - E.length })], 9);
      return sel(G, k - L.length - E.length, depth + 1);
    };
    const ans = sel(arr, k, 0);
    const s = [...arr].sort((x, y) => x - y);
    r.snap(`第 ${k} 小的元素為 ${ans}（排序後驗證）`, [cells(s, { [k]: 'done' }, { title: '排序後的陣列' })]);
    return r.frames;
  },
};

const topk: AlgoDef = {
  id: 'top-k', name: '前 K 大元素', en: 'Top-K with Min-Heap', cat,
  desc: '求最大的 k 個元素：維護一個大小為 k 的最小堆積，新元素比堆頂大就替換堆頂並下沉。只需 O(k) 額外空間，適合資料串流。',
  time: 'O(n log k)', space: 'O(k)',
  code: ['heap = 空的最小堆積', 'for x in a:', '  if |heap| < k: heap.push(x)', '  else if x > heap.top:', '    heap.top = x; siftDown(0)', 'return heap'],
  inputs: [inArr([38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47], '陣列', 14), inNum('k', 'k', 4, 1, 10)],
  run({ arr, k }) {
    const r = new Rec();
    const h: number[] = [];
    const hp = (c: CMap = {}) => {
      const nodes: BNode[] = h.map((v, i) => ({ id: i, val: v, left: null, right: null }));
      nodes.forEach((n, i) => { n.left = nodes[2 * i + 1] ?? null; n.right = nodes[2 * i + 2] ?? null; });
      return binaryPanel(nodes[0] ?? null, { color: (n) => c[n.id], title: `最小堆積（大小 ≤ ${k}）`, w: 'half' });
    };
    const snap = (msg: string, i: number, c: CMap, line: number) => r.snap(msg, [bars(arr, { ...range(0, i - 1, 'muted'), [i]: 'active' }, { pointers: ptrs({ i }) }), hp(c), cells(h, c, { title: '堆積陣列', w: 'half' })], line);
    const up = (i: number) => { while (i > 0 && h[(i - 1) >> 1] > h[i]) { const p = (i - 1) >> 1; [h[i], h[p]] = [h[p], h[i]]; i = p; } };
    const down = (i: number) => { for (;;) { let m = i; const l = 2 * i + 1, rr = 2 * i + 2; if (l < h.length && h[l] < h[m]) m = l; if (rr < h.length && h[rr] < h[m]) m = rr; if (m === i) return; [h[i], h[m]] = [h[m], h[i]]; i = m; } };
    for (let i = 0; i < arr.length; i++) {
      const x = arr[i];
      if (h.length < k) { h.push(x); up(h.length - 1); snap(`堆積未滿，放入 ${x}`, i, { [h.indexOf(x)]: 'swap' }, 3); }
      else if (x > h[0]) { const old = h[0]; h[0] = x; down(0); snap(`${x} > 堆頂 ${old}，替換堆頂並下沉`, i, { [h.indexOf(x)]: 'swap' }, 5); }
      else snap(`${x} ≤ 堆頂 ${h[0]}，略過`, i, { 0: 'compare' }, 4);
    }
    r.snap(`最大的 ${k} 個元素：${[...h].sort((a, b) => b - a).join(', ')}`, [bars(arr, Object.fromEntries(arr.map((v: number, i: number) => [i, h.includes(v) ? 'done' : 'muted']))), hp(Object.fromEntries(h.map((_, i) => [i, 'done']))), cells(h, {}, { title: '堆積陣列', w: 'half' })], 6);
    return r.frames;
  },
};

const prefix: AlgoDef = {
  id: 'prefix-sum', name: '前綴和', en: 'Prefix Sum', cat, star: true,
  desc: '預先計算 P[i] = a[0] + … + a[i-1]，之後任意區間和 sum(l..r) = P[r+1] − P[l] 只需 O(1)。',
  time: '建構 O(n)，查詢 O(1)', space: 'O(n)',
  code: ['P[0] = 0', 'for i = 0 .. n-1:', '  P[i+1] = P[i] + a[i]', 'query(l, r):', '  return P[r+1] - P[l]'],
  inputs: [inArr([3, 1, 4, 1, 5, 9, 2, 6, 5, 3], '陣列', 10, 0, 20), inNum('l', '查詢 l', 2, 0), inNum('r', '查詢 r', 6, 0)],
  run({ arr: a, l, r: rr }) {
    const r = new Rec();
    const n = a.length;
    l = Math.min(l, n - 1); rr = Math.max(l, Math.min(rr, n - 1));
    const P: (number | null)[] = [0, ...new Array(n).fill(null)];
    const pp = (c: CMap = {}) => cells(P, c, { title: 'P（前綴和）', headers: P.map((_, i) => i) });
    r.snap('P[0] = 0', [cells(a, {}, { title: 'a' }), pp({ 0: 'swap' })], 1);
    for (let i = 0; i < n; i++) {
      P[i + 1] = (P[i] as number) + a[i];
      r.snap(`P[${i + 1}] = P[${i}] + a[${i}] = ${P[i]} + ${a[i]} = ${P[i + 1]}`, [cells(a, { [i]: 'active' }, { title: 'a' }), pp({ [i]: 'compare', [i + 1]: 'swap' })], 3);
    }
    const s = (P[rr + 1] as number) - (P[l] as number);
    r.snap(`sum(${l}..${rr}) = P[${rr + 1}] − P[${l}] = ${P[rr + 1]} − ${P[l]} = ${s}`, [cells(a, range(l, rr, 'path'), { title: 'a' }), pp({ [l]: 'compare', [rr + 1]: 'done' }), vars({ l, r: rr, sum: s })], 5);
    return r.frames;
  },
};

const diff: AlgoDef = {
  id: 'difference-array', name: '差分陣列', en: 'Difference Array', cat,
  desc: '對區間 [l, r] 全部加 v 時，只需 D[l] += v、D[r+1] −= v 兩次 O(1) 操作；所有更新做完後對 D 求前綴和即可還原陣列。',
  time: '每次更新 O(1)，還原 O(n)', space: 'O(n)',
  code: ['D[i] = a[i] - a[i-1]  (D[0] = a[0])', 'update(l, r, v):', '  D[l] += v', '  D[r+1] -= v', '還原：a[i] = D[0] + ... + D[i]'],
  inputs: [inArr([5, 5, 5, 5, 5, 5, 5, 5, 5, 5], '初始陣列', 10, 0, 9), { key: 'ops', label: '更新（每組 l r v，以 ; 分隔）', type: 'text', default: '1 4 3; 3 7 2; 0 2 -1; 6 9 5', random: () => Array.from({ length: 4 }, () => { const l = rnd.int(0, 7); return `${l} ${rnd.int(l, 9)} ${rnd.int(-3, 6)}`; }).join('; ') }],
  run({ arr: a, ops }) {
    const r = new Rec();
    const n = a.length;
    const D = a.map((x: number, i: number) => (i ? x - a[i - 1] : x));
    D.push(0);
    r.snap('建立差分陣列 D', [cells(a, {}, { title: 'a' }), cells(D, {}, { title: 'D（差分）' })], 1);
    const list = String(ops).split(';').map((s) => s.trim().split(/\s+/).map(Number)).filter((x) => x.length === 3 && x.every((y) => !Number.isNaN(y)));
    for (const [l0, r0, v] of list) {
      const l = Math.max(0, Math.min(n - 1, l0)), rr = Math.max(l, Math.min(n - 1, r0));
      D[l] += v;
      D[rr + 1] -= v;
      r.snap(`區間 [${l}, ${rr}] 加 ${v}：D[${l}] += ${v}，D[${rr + 1}] −= ${v}`, [cells(a, range(l, rr, 'path'), { title: 'a（尚未還原）' }), cells(D, { [l]: 'swap', [rr + 1]: 'swap' }, { title: 'D（差分）' })], 3);
    }
    const out: (number | null)[] = new Array(n).fill(null);
    let s = 0;
    for (let i = 0; i < n; i++) {
      s += D[i];
      out[i] = s;
      r.snap(`還原 a[${i}] = 前綴和 = ${s}`, [cells(out, { [i]: 'swap' }, { title: '結果陣列' }), cells(D, range(0, i, 'compare'), { title: 'D（差分）' })], 5);
    }
    return r.frames;
  },
};

const kadane: AlgoDef = {
  id: 'kadane', name: '最大子陣列和', en: "Kadane's Algorithm", cat,
  desc: '求和最大的連續子陣列：cur 為「以 i 結尾」的最大和，cur = max(a[i], cur + a[i])；best 記錄全域最大值。',
  time: 'O(n)', space: 'O(1)',
  code: ['cur = best = a[0]', 'for i = 1 .. n-1:', '  if cur + a[i] < a[i]: 從 i 重新開始', '  cur = max(a[i], cur + a[i])', '  best = max(best, cur)', 'return best'],
  inputs: [inArr([-2, 1, -3, 4, -1, 2, 1, -5, 4, 3, -2, 2], '陣列（可含負數）', 12, -9, 9)],
  run({ arr: a }) {
    const r = new Rec();
    let cur = a[0], best = a[0], s = 0, bs = 0, be = 0;
    const snap = (msg: string, i: number, line: number) => r.snap(msg, [bars(a, { ...range(s, i, 'active'), [i]: 'compare' }, { ranges: [{ from: bs, to: be, color: 'done', label: `best = ${best}` }], pointers: ptrs({ i }) }), vars({ cur, best, 目前起點: s })], line);
    snap(`cur = best = ${a[0]}`, 0, 1);
    for (let i = 1; i < a.length; i++) {
      if (cur + a[i] < a[i]) { cur = a[i]; s = i; snap(`cur + a[${i}] < a[${i}]，從 ${i} 重新開始，cur = ${cur}`, i, 3); }
      else { cur += a[i]; snap(`延伸子陣列，cur = ${cur}`, i, 4); }
      if (cur > best) { best = cur; bs = s; be = i; snap(`更新 best = ${best}，區間 [${bs}, ${be}]`, i, 5); }
    }
    r.snap(`最大子陣列和 = ${best}，區間 [${bs}, ${be}]`, [bars(a, range(bs, be, 'done'), { ranges: [{ from: bs, to: be, color: 'done', label: `sum = ${best}` }] }), vars({ best })], 6);
    return r.frames;
  },
};

const dutch: AlgoDef = {
  id: 'dutch-flag', name: '荷蘭國旗分割', en: 'Dutch National Flag (3-way Partition)', cat,
  desc: 'Dijkstra 提出的三路分割：以 low、mid、high 三個指標把陣列分成 < pivot、= pivot、> pivot 三段，一次走訪完成。',
  time: 'O(n)', space: 'O(1)',
  code: ['low = mid = 0, high = n - 1', 'while mid <= high:', '  if a[mid] < p: swap(low++, mid++)', '  elif a[mid] == p: mid++', '  else: swap(mid, high--)'],
  inputs: [inArr([2, 0, 1, 2, 1, 0, 0, 2, 1, 1, 0, 2, 1, 0], '陣列', 14, 0, 2), inNum('p', 'pivot', 1)],
  run({ arr, p }) {
    const t = new SortTracer(arr);
    let lo = 0, mid = 0, hi = t.a.length - 1;
    const C = () => ({ ...range(0, lo - 1, 'visited'), ...range(lo, mid - 1, 'special'), ...range(hi + 1, t.a.length - 1, 'frontier') } as CMap);
    t.snap('紫：< pivot，粉：= pivot，青：> pivot', C(), 1, { low: lo, mid, high: hi });
    while (mid <= hi) {
      t.cmp++;
      if (t.a[mid] < p) { t.swap(lo, mid); t.snap(`a[mid] < ${p}：與 low 交換，low++、mid++`, { ...C(), [lo]: 'swap', [mid]: 'swap' }, 3, { low: lo, mid, high: hi }); lo++; mid++; }
      else if (t.a[mid] === p) { t.snap(`a[mid] = ${p}：mid++`, { ...C(), [mid]: 'compare' }, 4, { low: lo, mid, high: hi }); mid++; }
      else { t.swap(mid, hi); t.snap(`a[mid] > ${p}：與 high 交換，high--`, { ...C(), [mid]: 'swap', [hi]: 'swap' }, 5, { low: lo, mid, high: hi }); hi--; }
    }
    t.snap('分割完成', C(), 2);
    return t.r.frames;
  },
};

const majority: AlgoDef = {
  id: 'boyer-moore-majority', name: '多數投票法', en: 'Boyer–Moore Majority Vote', cat,
  desc: '找出出現次數超過 n/2 的元素：維護候選者與計數，相同 +1、不同 −1，歸零則換候選者。最後需再掃一次驗證。',
  time: 'O(n)', space: 'O(1)',
  code: ['cand = null, count = 0', 'for x in a:', '  if count == 0: cand = x', '  if x == cand: count++', '  else: count--', '驗證 cand 出現次數 > n/2'],
  inputs: [inArr([2, 2, 1, 3, 2, 1, 2, 2, 3, 2, 1, 2, 2], '陣列', 13, 1, 3)],
  run({ arr: a }) {
    const r = new Rec();
    let cand: number | null = null, cnt = 0;
    for (let i = 0; i < a.length; i++) {
      if (cnt === 0) { cand = a[i]; r.snap(`count = 0，候選者改為 ${cand}`, [cells(a, { [i]: 'special' }, { pointers: ptrs({ i }) }), vars({ cand, count: cnt })], 3); }
      if (a[i] === cand) { cnt++; r.snap(`${a[i]} = 候選者，count++ → ${cnt}`, [cells(a, { [i]: 'good' }, { pointers: ptrs({ i }) }), vars({ cand, count: cnt })], 4); }
      else { cnt--; r.snap(`${a[i]} ≠ 候選者，互相抵銷，count-- → ${cnt}`, [cells(a, { [i]: 'bad' }, { pointers: ptrs({ i }) }), vars({ cand, count: cnt })], 5); }
    }
    const occ = a.filter((x: number) => x === cand).length;
    const ok = occ * 2 > a.length;
    r.snap(ok ? `驗證：${cand} 出現 ${occ} 次 > ${a.length}/2，是多數元素` : `驗證：${cand} 只出現 ${occ} 次，沒有多數元素`, [cells(a, Object.fromEntries(a.map((x: number, i: number) => [i, x === cand ? (ok ? 'done' : 'compare') : 'muted']))), vars({ cand, 出現次數: occ })], 6);
    return r.frames;
  },
};

const inplaceMerge: AlgoDef = {
  id: 'inplace-merge', name: '原地合併', en: 'In-place Merge', cat,
  desc: '把 a[0..mid-1] 與 a[mid..n-1] 兩段已排序資料在不使用額外陣列的情況下合併：若右段元素較小，就把它旋轉（右移整段）到左段指標位置。',
  time: 'O(n²)（簡單旋轉版）', space: 'O(1)',
  code: ['i = 0, j = mid', 'while i < j and j < n:', '  if a[i] <= a[j]: i++', '  else:', '    v = a[j]; 把 a[i..j-1] 右移一格', '    a[i] = v; i++, j++'],
  inputs: [{ key: 'arr', label: '兩段已排序陣列（以 | 分隔左右）', type: 'text', default: '3 8 15 22 40 | 1 9 10 25 30 45', random: () => `${rnd.sorted(6).join(' ')} | ${rnd.sorted(6).join(' ')}` }],
  run({ arr }) {
    const [L, R] = String(arr).split('|').map((s) => s.trim().split(/[\s,]+/).filter(Boolean).map(Number).sort((x, y) => x - y));
    const t = new SortTracer([...L, ...(R ?? [])]);
    let i = 0, j = L.length;
    const n = t.a.length;
    t.snap('左段（藍）與右段（青）各自已排序', { ...range(0, j - 1, 'active'), ...range(j, n - 1, 'frontier') }, 1, { i, j });
    while (i < j && j < n) {
      t.snap(`比較 a[${i}]=${t.a[i]} 與 a[${j}]=${t.a[j]}`, { ...range(0, i - 1, 'done'), ...range(i, j - 1, 'active'), ...range(j, n - 1, 'frontier'), [i]: 'compare', [j]: 'compare' }, 2, { i, j });
      t.cmp++;
      if (t.a[i] <= t.a[j]) i++;
      else {
        const v = t.a[j];
        for (let k = j; k > i; k--) t.set(k, t.a[k - 1]);
        t.set(i, v);
        t.snap(`${v} 較小：a[${i}..${j - 1}] 右移一格，把 ${v} 放到 ${i}`, { ...range(0, i - 1, 'done'), ...range(i + 1, j, 'swap'), [i]: 'path' }, 5, { i, j });
        i++; j++;
      }
    }
    return t.finish('合併完成');
  },
};

const rotate: AlgoDef = {
  id: 'array-rotation', name: '陣列旋轉', en: 'Array Rotation (Reversal)', cat,
  desc: '把陣列向右旋轉 k 格的三次反轉法：先整體反轉，再分別反轉前 k 個與後 n−k 個。原地、O(n)。',
  time: 'O(n)', space: 'O(1)',
  code: ['k = k mod n', 'reverse(0, n-1)', 'reverse(0, k-1)', 'reverse(k, n-1)', 'reverse(l, r): 兩端交換往內'],
  inputs: [inArr([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], '陣列', 10), inNum('k', '向右旋轉 k 格', 3, 0, 100)],
  run({ arr, k }) {
    const t = new SortTracer(arr);
    const n = t.a.length;
    k %= n;
    const rev = (l: number, r: number, line: number) => {
      t.snap(`反轉區間 [${l}, ${r}]`, range(l, r, 'active'), line, { l, r });
      while (l < r) {
        t.swap(l, r);
        t.snap(`交換 a[${l}] 與 a[${r}]`, { [l]: 'swap', [r]: 'swap' }, 5, { l, r });
        l++; r--;
      }
    };
    t.snap(`k = ${k}`, {}, 1);
    rev(0, n - 1, 2);
    rev(0, k - 1, 3);
    rev(k, n - 1, 4);
    t.snap(`旋轉完成`, Object.fromEntries(t.a.map((_, i) => [i, 'done'])));
    return t.r.frames;
  },
};

export default [quickselect, mom, topk, prefix, diff, kadane, dutch, majority, inplaceMerge, rotate];
