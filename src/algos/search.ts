import type { AlgoDef, CMap, Pointer } from '../core/types';
import { Rec, cells, vars, inSorted, inNum, inArr, inSelect, rnd } from '../core/helpers';

const cat = 'search';

const sortedOf = (a: number[]) => [...a].sort((x, y) => x - y);
const mute = (n: number, lo: number, hi: number, base: CMap = {}): CMap => {
  const m: CMap = { ...base };
  for (let i = 0; i < n; i++) if ((i < lo || i > hi) && !m[i]) m[i] = 'muted';
  return m;
};
const P = (o: Record<string, number | undefined>): Pointer[] =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v >= 0)
    .map(([label, index]) => ({ label, index: index! }));

// 隨機目標值從目前的陣列中挑選，確保找得到；想看找不到的情況可自行輸入
const target = (def: number) => inNum('t', '目標值', def, undefined, undefined, (cur) => (cur.arr?.length ? rnd.pick(cur.arr as number[]) : rnd.int(1, 99)));

const linear: AlgoDef = {
  id: 'linear-search', name: '線性搜尋', en: 'Linear Search', cat, star: true,
  desc: '從頭到尾逐一比對每個元素，直到找到目標或走完陣列。不需要資料已排序。',
  time: 'O(n)', space: 'O(1)',
  code: ['for i = 0 .. n-1:', '  if a[i] == t:', '    return i', 'return -1'],
  inputs: [inArr([29, 4, 71, 15, 42, 8, 63, 37, 90, 22]), target(63)],
  run({ arr: a, t }) {
    const r = new Rec();
    for (let i = 0; i < a.length; i++) {
      const c: CMap = {};
      for (let j = 0; j < i; j++) c[j] = 'visited';
      c[i] = 'compare';
      r.snap(`比較 a[${i}] = ${a[i]} 與目標 ${t}`, [cells(a, c, { pointers: P({ i }) }), vars({ i, t })], 2);
      if (a[i] === t) {
        c[i] = 'done';
        r.snap(`找到了！a[${i}] = ${t}`, [cells(a, c, { pointers: P({ i }) }), vars({ i, t })], 3);
        return r.frames;
      }
    }
    r.snap(`找不到 ${t}，回傳 -1`, [cells(a, Object.fromEntries(a.map((_: number, i: number) => [i, 'visited']))), vars({ t })], 4);
    return r.frames;
  },
};

const binary: AlgoDef = {
  id: 'binary-search', name: '二分搜尋', en: 'Binary Search', cat, star: true,
  desc: '在已排序陣列中，每次與中間元素比較，捨棄不可能包含目標的一半，搜尋範圍每步減半。',
  time: 'O(log n)', space: 'O(1)',
  code: ['lo = 0, hi = n - 1', 'while lo <= hi:', '  mid = (lo + hi) / 2', '  if a[mid] == t: return mid', '  if a[mid] < t: lo = mid + 1', '  else: hi = mid - 1', 'return -1'],
  inputs: [inSorted([3, 8, 12, 17, 23, 31, 38, 45, 52, 60, 67, 74, 81, 89, 95], '已排序陣列', 15), target(67)],
  run({ arr, t }) {
    const a = sortedOf(arr);
    const r = new Rec();
    let lo = 0, hi = a.length - 1;
    r.snap(`初始化搜尋範圍 [${lo}, ${hi}]`, [cells(a, mute(a.length, lo, hi), { pointers: P({ lo, hi }) }), vars({ lo, hi, t })], 1);
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      r.snap(`mid = (${lo} + ${hi}) / 2 = ${mid}，a[mid] = ${a[mid]}`, [cells(a, mute(a.length, lo, hi, { [mid]: 'compare' }), { pointers: P({ lo, mid, hi }) }), vars({ lo, mid, hi, t })], 3);
      if (a[mid] === t) {
        r.snap(`a[${mid}] = ${t}，找到目標！`, [cells(a, mute(a.length, lo, hi, { [mid]: 'done' }), { pointers: P({ mid }) }), vars({ lo, mid, hi, t })], 4);
        return r.frames;
      }
      if (a[mid] < t) {
        lo = mid + 1;
        r.snap(`${a[mid]} < ${t}，目標在右半邊，lo = ${lo}`, [cells(a, mute(a.length, lo, hi), { pointers: P({ lo, hi }) }), vars({ lo, hi, t })], 5);
      } else {
        hi = mid - 1;
        r.snap(`${a[mid]} > ${t}，目標在左半邊，hi = ${hi}`, [cells(a, mute(a.length, lo, hi), { pointers: P({ lo, hi }) }), vars({ lo, hi, t })], 6);
      }
    }
    r.snap(`lo > hi，搜尋範圍為空，找不到 ${t}`, [cells(a, mute(a.length, 1, 0)), vars({ lo, hi, t })], 7);
    return r.frames;
  },
};

const bound: AlgoDef = {
  id: 'lower-upper-bound', name: '下界／上界搜尋', en: 'Lower / Upper Bound', cat,
  desc: 'Lower bound 找第一個 ≥ t 的位置；Upper bound 找第一個 > t 的位置。兩者相減即為 t 出現的次數。使用半開區間 [lo, hi)。',
  time: 'O(log n)', space: 'O(1)',
  code: ['lo = 0, hi = n', 'while lo < hi:', '  mid = (lo + hi) / 2', '  if a[mid] < t   (lower)', '  或 a[mid] <= t  (upper):', '    lo = mid + 1', '  else: hi = mid', 'return lo'],
  inputs: [inSorted([2, 4, 4, 4, 7, 9, 9, 12, 15, 15, 15, 18], '已排序陣列', 12), target(9), inSelect('mode', '模式', [['lower', 'Lower bound（≥ t）'], ['upper', 'Upper bound（> t）'], ['both', '兩者都做']], 'both')],
  run({ arr, t, mode }) {
    const a = sortedOf(arr);
    const r = new Rec();
    const res: Record<string, number> = {};
    for (const m of mode === 'both' ? ['lower', 'upper'] : [mode]) {
      const less = (x: number) => (m === 'lower' ? x < t : x <= t);
      const name = m === 'lower' ? 'lower_bound' : 'upper_bound';
      let lo = 0, hi = a.length;
      r.snap(`${name}(${t})：區間 [${lo}, ${hi})`, [cells(a, mute(a.length, lo, hi - 1), { pointers: P({ lo, hi }) }), vars({ ...res, lo, hi, t })], 1);
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        const ok = less(a[mid]);
        r.snap(`a[${mid}] = ${a[mid]} ${ok ? (m === 'lower' ? '<' : '≤') : m === 'lower' ? '≥' : '>'} ${t}`, [cells(a, mute(a.length, lo, hi - 1, { [mid]: 'compare' }), { pointers: P({ lo, mid, hi }) }), vars({ ...res, lo, mid, hi, t })], ok ? 4 : 7);
        if (ok) lo = mid + 1;
        else hi = mid;
      }
      res[name] = lo;
      r.snap(`${name}(${t}) = ${lo}`, [cells(a, { [lo]: 'done' }, { pointers: P({ [name]: lo }) }), vars({ ...res, t })], 8);
    }
    if (mode === 'both') {
      const c: CMap = {};
      for (let i = res.lower_bound; i < res.upper_bound; i++) c[i] = 'path';
      r.snap(`${t} 出現次數 = upper − lower = ${res.upper_bound - res.lower_bound}`, [cells(a, c, { pointers: P({ lower: res.lower_bound, upper: res.upper_bound }) }), vars({ ...res, t })]);
    }
    return r.frames;
  },
};

const jump: AlgoDef = {
  id: 'jump-search', name: '跳躍搜尋', en: 'Jump Search', cat,
  desc: '以 √n 為步長向前跳，找到可能包含目標的區塊後，再於區塊內線性搜尋。',
  time: 'O(√n)', space: 'O(1)',
  code: ['step = √n, prev = 0', 'while a[min(step, n)-1] < t:', '  prev = step; step += √n', '  if prev >= n: return -1', 'for i = prev .. min(step, n)-1:', '  if a[i] == t: return i', 'return -1'],
  inputs: [inSorted([1, 4, 7, 10, 14, 18, 21, 25, 29, 33, 38, 42, 47, 51, 56, 60], '已排序陣列', 16), target(47)],
  run({ arr, t }) {
    const a = sortedOf(arr);
    const n = a.length, r = new Rec();
    const s = Math.max(1, Math.floor(Math.sqrt(n)));
    let step = s, prev = 0;
    r.snap(`步長 = ⌊√${n}⌋ = ${s}`, [cells(a, {}, { pointers: P({ prev, step: Math.min(step, n) - 1 }) }), vars({ step: s, t })], 1);
    while (a[Math.min(step, n) - 1] < t) {
      const k = Math.min(step, n) - 1;
      r.snap(`a[${k}] = ${a[k]} < ${t}，往前跳`, [cells(a, mute(n, prev, n, { [k]: 'compare' }), { pointers: P({ prev, jump: k }) }), vars({ prev, step, t })], 2);
      prev = step;
      step += s;
      if (prev >= n) {
        r.snap(`已超出陣列，找不到 ${t}`, [cells(a, mute(n, 1, 0)), vars({ t })], 4);
        return r.frames;
      }
    }
    const end = Math.min(step, n) - 1;
    r.snap(`a[${end}] = ${a[end]} ≥ ${t}，目標若存在必在區塊 [${prev}, ${end}]`, [cells(a, mute(n, prev, end, { [end]: 'compare' }), { pointers: P({ prev, end }) }), vars({ prev, end, t })], 5);
    for (let i = prev; i <= end; i++) {
      r.snap(`線性比對 a[${i}] = ${a[i]}`, [cells(a, mute(n, prev, end, { [i]: 'compare' }), { pointers: P({ i }) }), vars({ i, t })], 6);
      if (a[i] === t) {
        r.snap(`找到 ${t}，位置 ${i}`, [cells(a, mute(n, prev, end, { [i]: 'done' }), { pointers: P({ i }) }), vars({ i, t })], 6);
        return r.frames;
      }
    }
    r.snap(`區塊內沒有 ${t}`, [cells(a, mute(n, 1, 0)), vars({ t })], 7);
    return r.frames;
  },
};

const interp: AlgoDef = {
  id: 'interpolation-search', name: '插值搜尋', en: 'Interpolation Search', cat,
  desc: '假設資料大致均勻分布，依目標值在 [a[lo], a[hi]] 中的比例估計位置，而不是固定取中間。',
  time: '平均 O(log log n)，最差 O(n)', space: 'O(1)',
  code: ['lo = 0, hi = n - 1', 'while lo <= hi and a[lo] <= t <= a[hi]:', '  pos = lo + (t - a[lo]) * (hi - lo)', '              / (a[hi] - a[lo])', '  if a[pos] == t: return pos', '  if a[pos] < t: lo = pos + 1', '  else: hi = pos - 1', 'return -1'],
  inputs: [inSorted([10, 14, 19, 26, 27, 31, 33, 35, 42, 44, 51, 58, 63, 70, 77, 85], '已排序陣列', 16), target(58)],
  run({ arr, t }) {
    const a = sortedOf(arr);
    const n = a.length, r = new Rec();
    let lo = 0, hi = n - 1;
    while (lo <= hi && t >= a[lo] && t <= a[hi]) {
      const pos = a[hi] === a[lo] ? lo : lo + Math.floor(((t - a[lo]) * (hi - lo)) / (a[hi] - a[lo]));
      r.snap(`pos = ${lo} + (${t}−${a[lo]})×(${hi}−${lo})/(${a[hi]}−${a[lo]}) = ${pos}`, [cells(a, mute(n, lo, hi, { [pos]: 'compare' }), { pointers: P({ lo, pos, hi }) }), vars({ lo, hi, pos, t })], 3);
      if (a[pos] === t) {
        r.snap(`a[${pos}] = ${t}，找到！`, [cells(a, mute(n, lo, hi, { [pos]: 'done' }), { pointers: P({ pos }) }), vars({ pos, t })], 5);
        return r.frames;
      }
      if (a[pos] < t) lo = pos + 1;
      else hi = pos - 1;
      r.snap(a[pos] < t ? `a[pos] < t，lo = ${lo}` : `a[pos] > t，hi = ${hi}`, [cells(a, mute(n, lo, hi), { pointers: P({ lo, hi }) }), vars({ lo, hi, t })], a[pos] < t ? 6 : 7);
    }
    r.snap(`找不到 ${t}`, [cells(a, mute(n, 1, 0)), vars({ t })], 8);
    return r.frames;
  },
};

const expo: AlgoDef = {
  id: 'exponential-search', name: '指數搜尋', en: 'Exponential Search', cat,
  desc: '以 1, 2, 4, 8… 倍增邊界，找到第一個 a[bound] ≥ t 的範圍，再於 [bound/2, bound] 做二分搜尋。適合無界或很長的陣列。',
  time: 'O(log i)', space: 'O(1)',
  code: ['if a[0] == t: return 0', 'bound = 1', 'while bound < n and a[bound] < t:', '  bound *= 2', 'binary search in', '  [bound/2, min(bound, n-1)]'],
  inputs: [inSorted([2, 5, 8, 11, 15, 19, 24, 28, 33, 39, 44, 50, 57, 63, 70, 78, 85, 93], '已排序陣列', 18), target(57)],
  run({ arr, t }) {
    const a = sortedOf(arr);
    const n = a.length, r = new Rec();
    r.snap(`比較 a[0] = ${a[0]}`, [cells(a, { 0: 'compare' }), vars({ t })], 1);
    if (a[0] === t) {
      r.snap('a[0] 即為目標', [cells(a, { 0: 'done' })], 1);
      return r.frames;
    }
    let b = 1;
    while (b < n && a[b] < t) {
      r.snap(`a[${b}] = ${a[b]} < ${t}，bound 加倍`, [cells(a, { [b]: 'compare' }, { pointers: P({ bound: b }) }), vars({ bound: b, t })], 3);
      b *= 2;
    }
    let lo = b >> 1, hi = Math.min(b, n - 1);
    r.snap(`範圍確定為 [${lo}, ${hi}]，開始二分搜尋`, [cells(a, mute(n, lo, hi, b < n ? { [b]: 'compare' } : {}), { pointers: P({ lo, hi }) }), vars({ bound: b, t })], 5);
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      r.snap(`mid = ${mid}，a[mid] = ${a[mid]}`, [cells(a, mute(n, lo, hi, { [mid]: 'compare' }), { pointers: P({ lo, mid, hi }) }), vars({ lo, mid, hi, t })], 6);
      if (a[mid] === t) {
        r.snap(`找到 ${t}，位置 ${mid}`, [cells(a, mute(n, lo, hi, { [mid]: 'done' }), { pointers: P({ mid }) }), vars({ mid, t })], 6);
        return r.frames;
      }
      if (a[mid] < t) lo = mid + 1;
      else hi = mid - 1;
    }
    r.snap(`找不到 ${t}`, [cells(a, mute(n, 1, 0))], 6);
    return r.frames;
  },
};

const unimodal = (n: number) => {
  const peak = rnd.int(2, n - 3);
  const up = rnd.distinct(peak + 1, 1, 60).sort((x, y) => x - y);
  const down = rnd.distinct(n - peak - 1, 1, up[up.length - 1] - 1).sort((x, y) => y - x);
  return [...up, ...down];
};

const ternary: AlgoDef = {
  id: 'ternary-search', name: '三分搜尋', en: 'Ternary Search', cat,
  desc: '在單峰（先升後降）序列中找最大值：取兩個三等分點 m1、m2，比較後捨棄不含峰值的三分之一。',
  time: 'O(log n)', space: 'O(1)',
  code: ['lo = 0, hi = n - 1', 'while hi - lo > 2:', '  m1 = lo + (hi - lo) / 3', '  m2 = hi - (hi - lo) / 3', '  if a[m1] < a[m2]: lo = m1 + 1', '  else: hi = m2 - 1', 'return argmax(a[lo..hi])'],
  inputs: [{ key: 'arr', label: '單峰陣列（先升後降）', type: 'array', default: [3, 9, 14, 22, 31, 40, 52, 47, 38, 26, 17, 11, 5], random: () => unimodal(rnd.int(11, 17)) }],
  run({ arr: a }) {
    const n = a.length, r = new Rec();
    let lo = 0, hi = n - 1;
    r.snap('在單峰序列中找最大值', [cells(a, {}, { pointers: P({ lo, hi }) })], 1);
    while (hi - lo > 2) {
      const m1 = lo + Math.floor((hi - lo) / 3), m2 = hi - Math.floor((hi - lo) / 3);
      r.snap(`m1 = ${m1}（${a[m1]}），m2 = ${m2}（${a[m2]}）`, [cells(a, mute(n, lo, hi, { [m1]: 'compare', [m2]: 'compare' }), { pointers: P({ lo, m1, m2, hi }) }), vars({ lo, m1, m2, hi })], 4);
      if (a[m1] < a[m2]) {
        lo = m1 + 1;
        r.snap(`a[m1] < a[m2]，峰值不在 [.., m1]，lo = ${lo}`, [cells(a, mute(n, lo, hi), { pointers: P({ lo, hi }) }), vars({ lo, hi })], 5);
      } else {
        hi = m2 - 1;
        r.snap(`a[m1] ≥ a[m2]，峰值不在 [m2, ..]，hi = ${hi}`, [cells(a, mute(n, lo, hi), { pointers: P({ lo, hi }) }), vars({ lo, hi })], 6);
      }
    }
    let best = lo;
    for (let i = lo; i <= hi; i++) if (a[i] > a[best]) best = i;
    r.snap(`剩餘範圍內最大值 a[${best}] = ${a[best]}`, [cells(a, mute(n, lo, hi, { [best]: 'done' }), { pointers: P({ peak: best }) }), vars({ peak: best, value: a[best] })], 7);
    return r.frames;
  },
};

export default [linear, binary, bound, jump, interp, expo, ternary];
