// 陣列解題技巧
import type { AlgoDef, CMap, Color } from '../core/types';
import { Rec, bars, cells, inArr, inNum, inSelect, inSorted, inText, range, rnd, table, text, vars } from '../core/helpers';
import { ptrs as P } from '../core/sortTracer';
import { parseMatrix } from '../core/extra';

const cat = 'technique';

// ---------------- 雙指標 ----------------
const twoPointers: AlgoDef = {
  id: 'two-pointers', name: '雙指標技巧', en: 'Two Pointers', cat,
  desc: '在已排序陣列找兩數和為 t：左指標從頭、右指標從尾。和太小代表左邊的數不可能配到任何更大的組合，左指標右移；和太大則右指標左移。每步排除一個元素，O(n) 就能找到答案或確定不存在。結果與暴力法比對。',
  time: 'O(n)（已排序）', space: 'O(1)',
  code: ['l = 0, r = n - 1', 'while l < r:', '  s = a[l] + a[r]', '  if s == t: return (l, r)', '  if s < t: l += 1      (a[l] 配誰都太小)', '  else: r -= 1          (a[r] 配誰都太大)', 'return 不存在'],
  inputs: [inSorted([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], '已排序陣列', 10), inNum('t', '目標和 t', 61, undefined, undefined, (c) => { const a = c.arr as number[]; return rnd.int(0, 1) ? rnd.pick(a) + rnd.pick(a) : rnd.int(2, 190); })],
  run({ arr, t }) {
    const r = new Rec();
    const a = [...arr].sort((x: number, y: number) => x - y);
    let l = 0, rr = a.length - 1;
    let brute = false;
    for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] + a[j] === t) brute = true;
    const snap = (msg: string, line: number, c: CMap = {}) => r.snap(msg, [cells(a, { ...Object.fromEntries(a.map((_, i) => [i, i < l || i > rr ? 'muted' : undefined])), ...c }, { pointers: P({ l, r: rr }) }), vars({ l, r: rr, t })], line);
    snap(`在已排序陣列中找兩數和 = ${t}`, 1);
    while (l < rr) {
      const s = a[l] + a[rr];
      if (s === t) { snap(`${a[l]} + ${a[rr]} = ${t}，找到了（暴力法：${brute ? '存在' : '不存在'}）`, 4, { [l]: 'done', [rr]: 'done' }); return r.frames; }
      if (s < t) { snap(`${a[l]} + ${a[rr]} = ${s} < ${t}：${a[l]} 配最大的都不夠，l 右移`, 5, { [l]: 'compare', [rr]: 'compare' }); l++; }
      else { snap(`${a[l]} + ${a[rr]} = ${s} > ${t}：${a[rr]} 配最小的都太大，r 左移`, 6, { [l]: 'compare', [rr]: 'compare' }); rr--; }
    }
    snap(`指標相遇，不存在兩數和為 ${t}（暴力法：${brute ? '存在！' : '同樣不存在'}）`, 7);
    return r.frames;
  },
};

// ---------------- 滑動視窗 ----------------
const slidingWindow: AlgoDef = {
  id: 'sliding-window', name: '滑動視窗技巧', en: 'Sliding Window', cat,
  desc: '固定長度視窗：加入右邊新元素、減去左邊離開的元素，每次 O(1) 更新視窗和，找出長度 k 的最大和子陣列。可變長度視窗：求和 ≥ S 的最短子陣列，右端擴張、和夠大就收縮左端；這依賴「元素皆為正，視窗變長和一定變大」的單調性，有負數時不能套用。',
  time: 'O(n)', space: 'O(1)',
  code: ['固定視窗：sum = a[0..k-1] 的和', '  for i = k .. n-1: sum += a[i] − a[i−k]；更新最大值', '可變視窗（a 皆為正）：l = 0, sum = 0', '  for r = 0 .. n-1:', '    sum += a[r]', '    while sum >= S: 更新最短長度；sum −= a[l]；l += 1', '有負數時：視窗擴張不保證和變大，可變視窗不適用'],
  inputs: [inArr([4, 2, 12, 1, 7, 9, 3, 2, 8, 5], '陣列', 10, 1, 15), inNum('k', '固定視窗長度 k', 3, 1, 50, (c) => rnd.int(2, Math.max(2, c.arr.length - 1))), inNum('S', '可變視窗：和至少 S', 18, 1, 1e6, () => rnd.int(10, 30))],
  run({ arr: a, k, S }) {
    const r = new Rec();
    const n = a.length;
    if (k > n) throw new Error(`k = ${k} 大於陣列長度 ${n}`);
    let sum = 0;
    for (let i = 0; i < k; i++) sum += a[i];
    let best = sum, bestL = 0;
    r.snap(`第一個視窗 [0..${k - 1}] 的和 = ${sum}`, [bars(a, range(0, k - 1, 'active'), { ranges: [{ from: 0, to: k - 1, label: `和 ${sum}` }] }), vars({ sum, best })], 1);
    for (let i = k; i < n; i++) {
      sum += a[i] - a[i - k];
      if (sum > best) { best = sum; bestL = i - k + 1; }
      r.snap(`加入 a[${i}] = ${a[i]}，移除 a[${i - k}] = ${a[i - k]} → 和 = ${sum}`, [bars(a, { ...range(i - k + 1, i, 'active'), [i]: 'swap', [i - k]: 'muted' }, { ranges: [{ from: i - k + 1, to: i, label: `和 ${sum}` }] }), vars({ sum, best })], 2);
    }
    r.snap(`長度 ${k} 的最大和 = ${best}，位置 [${bestL}..${bestL + k - 1}]`, [bars(a, range(bestL, bestL + k - 1, 'done'), { ranges: [{ from: bestL, to: bestL + k - 1, label: `最大 ${best}`, color: 'done' }] }), vars({ best })], 2);
    if (a.some((x: number) => x <= 0)) {
      r.snap('陣列含有 0 或負數：視窗擴張時和不一定變大，「和夠大就收縮」的可變視窗不保證正確，改用前綴和 + 單調佇列等方法', [bars(a, Object.fromEntries(a.map((x: number, i: number) => [i, x <= 0 ? 'bad' : undefined]))), vars({ 可變視窗: '不適用' }, undefined, { 可變視窗: 'bad' })], 7);
      return r.frames;
    }
    let l = 0, minLen = Infinity, ml = -1;
    sum = 0;
    for (let rr = 0; rr < n; rr++) {
      sum += a[rr];
      r.snap(`右端擴張到 ${rr}，視窗和 = ${sum}`, [bars(a, { ...range(l, rr, 'frontier'), [rr]: 'swap' }, { pointers: P({ l, r: rr }) }), vars({ sum, S, 最短: minLen })], 5);
      while (sum >= S) {
        if (rr - l + 1 < minLen) { minLen = rr - l + 1; ml = l; }
        r.snap(`和 ${sum} ≥ ${S}：長度 ${rr - l + 1}，收縮左端`, [bars(a, { ...range(l, rr, 'active'), [l]: 'compare' }, { pointers: P({ l, r: rr }) }), vars({ sum, S, 最短: minLen })], 6);
        sum -= a[l++];
      }
    }
    r.snap(ml < 0 ? `沒有任何子陣列的和 ≥ ${S}` : `和 ≥ ${S} 的最短子陣列長度 ${minLen}：[${ml}..${ml + minLen - 1}]`, [bars(a, ml < 0 ? {} : range(ml, ml + minLen - 1, 'done')), vars({ 最短: ml < 0 ? '不存在' : minLen })], 6);
    return r.frames;
  },
};

// ---------------- 二維前綴和 ----------------
const MAT = '3 0 1 4 2; 5 6 3 2 1; 1 2 0 1 5; 4 1 0 1 7; 1 0 3 0 5';
const randMat = (rows = 5, cols = 5, lo = 0, hi = 9) => Array.from({ length: rows }, () => rnd.arr(cols, lo, hi).join(' ')).join('; ');
const prefix2d: AlgoDef = {
  id: 'prefix-sum-2d', name: '二維前綴和', en: '2D Prefix Sum', cat,
  desc: 'P[i][j] 是左上角 (0,0) 到 (i−1, j−1) 的矩形總和，可由 P[i−1][j] + P[i][j−1] − P[i−1][j−1] + a[i−1][j−1] 遞推（重疊的左上塊被加了兩次要扣掉）。之後任意矩形和只要四項加減：P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]。',
  time: '建表 O(RC)，查詢 O(1)', space: 'O(RC)',
  code: ['P 為 (R+1)×(C+1) 零矩陣', 'for i = 1..R, j = 1..C:', '  P[i][j] = a[i-1][j-1] + P[i-1][j] + P[i][j-1] − P[i-1][j-1]', 'query(r1, c1, r2, c2):', '  return P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]'],
  inputs: [inText('mat', '矩陣（以 ; 分列）', MAT, () => randMat()), inText('q', '查詢 r1 c1 r2 c2（0 起算）', '1 1 3 3', () => { const r1 = rnd.int(0, 3), c1 = rnd.int(0, 3); return `${r1} ${c1} ${rnd.int(r1, 4)} ${rnd.int(c1, 4)}`; })],
  run({ mat, q }) {
    const r = new Rec();
    const A = parseMatrix(mat, '矩陣');
    const R = A.length, C = A[0].length;
    if (R > 8 || C > 8) throw new Error('矩陣最大 8×8');
    const qs = String(q).split(/[\s,]+/).filter(Boolean).map(Number);
    if (qs.length !== 4 || qs.some((x) => !Number.isInteger(x))) throw new Error('查詢需要 4 個整數 r1 c1 r2 c2');
    let [r1, c1, r2, c2] = qs;
    if (r1 > r2) [r1, r2] = [r2, r1];
    if (c1 > c2) [c1, c2] = [c2, c1];
    if (r1 < 0 || c1 < 0 || r2 >= R || c2 >= C) throw new Error('查詢超出矩陣範圍');
    const Pm: (number | null)[][] = Array.from({ length: R + 1 }, (_, i) => Array.from({ length: C + 1 }, (_, j) => (i && j ? null : 0)));
    const pt = (c: Record<string, Color>) => table(Pm, c, { title: 'P（多一列一行 0）', rowHeaders: Pm.map((_, i) => i), colHeaders: Pm[0].map((_, j) => j), w: 'half' });
    for (let i = 1; i <= R; i++)
      for (let j = 1; j <= C; j++) {
        Pm[i][j] = A[i - 1][j - 1] + (Pm[i - 1][j] as number) + (Pm[i][j - 1] as number) - (Pm[i - 1][j - 1] as number);
        if (i <= 3 || (i === R && j === C)) r.snap(`P[${i}][${j}] = ${A[i - 1][j - 1]} + ${Pm[i - 1][j]} + ${Pm[i][j - 1]} − ${Pm[i - 1][j - 1]} = ${Pm[i][j]}`, [table(A, { [`${i - 1},${j - 1}`]: 'active' }, { title: 'a', w: 'half' }), pt({ [`${i},${j}`]: 'done', [`${i - 1},${j}`]: 'compare', [`${i},${j - 1}`]: 'compare', [`${i - 1},${j - 1}`]: 'bad' })], 3);
      }
    const g = (i: number, j: number) => Pm[i][j] as number;
    const ans = g(r2 + 1, c2 + 1) - g(r1, c2 + 1) - g(r2 + 1, c1) + g(r1, c1);
    const ac: Record<string, Color> = {};
    for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) ac[`${i},${j}`] = 'path';
    let brute = 0;
    for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) brute += A[i][j];
    r.snap(`矩形 (${r1},${c1})–(${r2},${c2}) 的和 = ${g(r2 + 1, c2 + 1)} − ${g(r1, c2 + 1)} − ${g(r2 + 1, c1)} + ${g(r1, c1)} = ${ans}（逐格相加 ${brute}）`, [table(A, ac, { title: 'a（查詢範圍）', w: 'half' }), pt({ [`${r2 + 1},${c2 + 1}`]: 'done', [`${r1},${c2 + 1}`]: 'bad', [`${r2 + 1},${c1}`]: 'bad', [`${r1},${c1}`]: 'swap' }), vars({ 和: ans })], 5);
    return r.frames;
  },
};

// ---------------- 二維差分 ----------------
const diff2d: AlgoDef = {
  id: 'difference-2d', name: '二維差分', en: '2D Difference Array', cat,
  desc: '矩形 (r1,c1)–(r2,c2) 全部加 v，只要改差分陣列的四個角：D[r1][c1] += v、D[r1][c2+1] −= v、D[r2+1][c1] −= v、D[r2+1][c2+1] += v。所有更新做完後對 D 做二維前綴和就還原出結果，並與逐格更新的結果比對。',
  time: '每次更新 O(1)，還原 O(RC)', space: 'O(RC)',
  code: ['D 為 (R+1)×(C+1) 零矩陣', 'update(r1, c1, r2, c2, v):', '  D[r1][c1] += v；D[r1][c2+1] −= v', '  D[r2+1][c1] −= v；D[r2+1][c2+1] += v', '還原：a[i][j] = Σ D[0..i][0..j]（二維前綴和）'],
  inputs: [inNum('R', '列數', 5, 1, 8), inNum('C', '行數', 6, 1, 8), inText('ops', '更新（每組 r1 c1 r2 c2 v，以 ; 分隔）', '0 0 2 2 3; 1 2 4 5 2; 3 0 4 1 -1', () => Array.from({ length: 3 }, () => { const r1 = rnd.int(0, 3), c1 = rnd.int(0, 4); return `${r1} ${c1} ${rnd.int(r1, 4)} ${rnd.int(c1, 5)} ${rnd.int(-3, 5)}`; }).join('; '))],
  run({ R, C, ops }) {
    const r = new Rec();
    const D = Array.from({ length: R + 1 }, () => new Array(C + 1).fill(0));
    const naive = Array.from({ length: R }, () => new Array(C).fill(0));
    const list = String(ops).split(';').map((s) => s.trim()).filter(Boolean).map((s) => s.split(/[\s,]+/).map(Number));
    for (const op of list) {
      if (op.length !== 5 || op.some((x) => !Number.isInteger(x))) throw new Error('每組更新需要 5 個整數');
      let [r1, c1, r2, c2] = op;
      const v = op[4];
      if (r1 > r2) [r1, r2] = [r2, r1];
      if (c1 > c2) [c1, c2] = [c2, c1];
      if (r1 < 0 || c1 < 0 || r2 >= R || c2 >= C) throw new Error(`更新 ${op.join(' ')} 超出範圍`);
      D[r1][c1] += v; D[r1][c2 + 1] -= v; D[r2 + 1][c1] -= v; D[r2 + 1][c2 + 1] += v;
      for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) naive[i][j] += v;
      const rect: Record<string, Color> = {};
      for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) rect[`${i},${j}`] = 'path';
      r.snap(`矩形 (${r1},${c1})–(${r2},${c2}) 加 ${v}：只改四個角`, [table(D, { [`${r1},${c1}`]: 'swap', [`${r1},${c2 + 1}`]: 'bad', [`${r2 + 1},${c1}`]: 'bad', [`${r2 + 1},${c2 + 1}`]: 'swap' }, { title: '差分陣列 D', w: 'half' }), table(naive, rect, { title: '逐格更新（對照）', w: 'half' })], 3);
    }
    const out = Array.from({ length: R }, () => new Array(C).fill(0));
    for (let i = 0; i < R; i++)
      for (let j = 0; j < C; j++) {
        out[i][j] = D[i][j] + (i ? out[i - 1][j] : 0) + (j ? out[i][j - 1] : 0) - (i && j ? out[i - 1][j - 1] : 0);
        if (j === C - 1) r.snap(`還原第 ${i} 列：對 D 做二維前綴和`, [table(D, Object.fromEntries(Array.from({ length: C }, (_, k) => [`${i},${k}`, 'active' as Color])), { title: 'D', w: 'half' }), table(out.map((row, ri) => (ri <= i ? row : row.map(() => ''))), Object.fromEntries(Array.from({ length: C }, (_, k) => [`${i},${k}`, 'done' as Color])), { title: '還原結果', w: 'half' })], 5);
      }
    const same = out.every((row, i) => row.every((x, j) => x === naive[i][j]));
    r.snap(same ? '還原結果與逐格更新完全一致' : '結果不一致！', [table(out, {}, { title: '差分還原', w: 'half' }), table(naive, {}, { title: '逐格更新', w: 'half' }), vars({ 一致: same ? '是' : '否' }, undefined, { 一致: same ? 'done' : 'bad' })], 5);
    return r.frames;
  },
};

// ---------------- 座標壓縮 ----------------
const compress: AlgoDef = {
  id: 'coordinate-compression', name: '座標壓縮', en: 'Coordinate Compression', cat,
  desc: '值域很大但只關心大小關係時，把每個值換成它在「排序後去重複」陣列中的排名（0, 1, 2, …）。相等的值得到相同排名，大小關係完全保留，之後就能用排名當陣列索引（例如樹狀陣列）。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['vals = sort(a)', 'vals = 去除相鄰重複', 'for i in 0..n-1:', '  rank[i] = lower_bound(vals, a[i])   (二分搜尋)'],
  inputs: [inArr([1000000, 30, -5, 30, 99999, 7, -5, 2000], '陣列', 8, -50, 1000)],
  run({ arr: a }) {
    const r = new Rec();
    const sorted = [...a].sort((x: number, y: number) => x - y);
    r.snap('先排序', [cells(a, {}, { title: '原陣列' }), cells(sorted, {}, { title: '排序後' })], 1);
    const vals = sorted.filter((x: number, i: number) => !i || x !== sorted[i - 1]);
    r.snap(`去除重複後剩 ${vals.length} 個相異值，它們的索引就是排名`, [cells(a, {}, { title: '原陣列' }), cells(vals, {}, { title: '相異值（索引 = 排名）' })], 2);
    const rank: (number | null)[] = a.map(() => null);
    a.forEach((x: number, i: number) => {
      let lo = 0, hi = vals.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (vals[m] < x) lo = m + 1; else hi = m; }
      rank[i] = lo;
      r.snap(`${x} 在相異值中的位置是 ${lo}`, [cells(a, { [i]: 'active' }, { title: '原陣列' }), cells(vals, { [lo]: 'done' }, { title: '相異值' }), cells(rank, { [i]: 'done' }, { title: '排名' })], 4);
    });
    const ok = a.every((x: number, i: number) => a.every((y: number, j: number) => Math.sign(x - y) === Math.sign((rank[i] as number) - (rank[j] as number))));
    r.snap(`壓縮完成：值域縮到 0..${vals.length - 1}，任兩數的大小關係${ok ? '全部保留' : '有誤！'}`, [cells(a, {}, { title: '原陣列' }), cells(rank, Object.fromEntries(rank.map((_, i) => [i, 'done'])), { title: '排名' })], 4);
    return r.frames;
  },
};

// ---------------- 區間合併 ----------------
const parseIntervals = (s: string) => String(s).split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
  const v = p.split(/[\s,]+/).map(Number);
  if (v.length !== 2 || v.some((x) => Number.isNaN(x))) throw new Error(`區間「${p}」格式錯誤`);
  if (v[0] > v[1]) throw new Error(`區間「${p}」左端點大於右端點`);
  return v as [number, number];
});
const intervalMerge: AlgoDef = {
  id: 'interval-merge', name: '區間合併', en: 'Merge Intervals', cat,
  desc: '把閉區間依左端點排序後掃描：若下一個區間的左端點不超過目前合併區間的右端點，就延伸右端點；否則開始新的區間。本頁可選擇剛好相接（如 [1,3] 與 [3,5]）是否合併——閉區間共享端點 3，預設合併。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['依左端點排序', 'cur = 第一個區間', 'for 其餘區間 [l, r]:', '  if l <= cur.r（相接也合併）或 l < cur.r（只合併重疊）:', '    cur.r = max(cur.r, r)', '  else: 輸出 cur；cur = [l, r]', '輸出 cur'],
  inputs: [inText('iv', '區間（每組 l r，以 ; 分隔）', '1 3; 8 10; 2 6; 10 12; 15 18; 17 20', () => Array.from({ length: 6 }, () => { const l = rnd.int(0, 25); return `${l} ${l + rnd.int(0, 6)}`; }).join('; ')), inSelect('touch', '端點相接', [['merge', '合併'], ['keep', '不合併']])],
  run({ iv, touch }) {
    const r = new Rec();
    const I = parseIntervals(iv);
    if (!I.length) throw new Error('請至少輸入一個區間');
    const S = [...I].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const out: [number, number][] = [];
    const lo = Math.min(...S.map((x) => x[0])) - 1, hi = Math.max(...S.map((x) => x[1])) + 1;
    const plot = (hl: number, cur: [number, number] | null) => ({ type: 'plot' as const, title: '上方：已排序的輸入；下方：合併結果', bounds: [lo, hi, -out.length - 2, S.length + 0.5] as [number, number, number, number], height: 280, segments: [...S.map((s, i) => ({ x1: s[0], y1: S.length - i, x2: s[1], y2: S.length - i, color: (i === hl ? 'active' : i < hl ? 'visited' : 'muted') as Color, width: 6 })), ...out.map((s, i) => ({ x1: s[0], y1: -1 - i, x2: s[1], y2: -1 - i, color: 'done' as Color, width: 6 })), ...(cur ? [{ x1: cur[0], y1: -1 - out.length, x2: cur[1], y2: -1 - out.length, color: 'swap' as Color, width: 6 }] : [])], axes: true });
    r.snap('依左端點排序', [plot(-1, null), text([S.map((s) => `[${s[0]}, ${s[1]}]`).join('  ')], '排序後')], 1);
    let cur: [number, number] = [...S[0]];
    r.snap(`目前區間 [${cur[0]}, ${cur[1]}]`, [plot(0, cur)], 2);
    for (let i = 1; i < S.length; i++) {
      const [l, rr] = S[i];
      const overlap = touch === 'keep' ? l < cur[1] : l <= cur[1];
      if (overlap) { cur[1] = Math.max(cur[1], rr); r.snap(`[${l}, ${rr}] 與目前區間${l === cur[1] && rr <= cur[1] ? '相接' : '重疊'}，延伸為 [${cur[0]}, ${cur[1]}]`, [plot(i, cur)], 5); }
      else { out.push(cur); cur = [l, rr]; r.snap(`[${l}, ${rr}] 不重疊${touch === 'keep' && l === out[out.length - 1][1] ? '（只相接，依設定不合併）' : ''}：輸出前一個，開始新區間`, [plot(i, cur)], 6); }
    }
    out.push(cur);
    r.snap(`合併完成，共 ${out.length} 個區間：${out.map((s) => `[${s[0]}, ${s[1]}]`).join(' ')}`, [plot(S.length, null)], 7);
    return r.frames;
  },
};

// ---------------- 和為 K 的子陣列 ----------------
const subarrayK: AlgoDef = {
  id: 'subarray-sum-k', name: '和為 K 的子陣列計數', en: 'Subarray Sum Equals K', cat,
  desc: '子陣列 a[i..j] 的和 = P[j+1] − P[i]。掃描到前綴和 p 時，以 p − k 為結尾的子陣列個數就是「之前出現過幾次前綴和 p − k」。用雜湊表記錄每個前綴和出現的次數；要先查詢再登錄目前的前綴，並預先放入 0（空前綴）。可處理 0 與負數。',
  time: 'O(n) 期望', space: 'O(n)',
  code: ['cnt = {0: 1}，p = 0，ans = 0', 'for x in a:', '  p += x', '  ans += cnt[p − k]（不存在視為 0）', '  cnt[p] += 1                  (先查詢再登錄)', 'return ans'],
  inputs: [inArr([1, 2, -1, 3, 0, -2, 4, 1, -3], '陣列', 9, -3, 5), inNum('k', 'k', 3, -100, 100, () => rnd.int(-2, 6))],
  run({ arr: a, k }) {
    const r = new Rec();
    const cnt = new Map<number, number>([[0, 1]]);
    let p = 0, ans = 0;
    const found: string[] = [];
    const prefix: number[] = [0];
    const mt = (hl?: number, hl2?: number) => table([...cnt.entries()].map(([key, v]) => [key, v]), Object.fromEntries([...cnt.keys()].flatMap((key, i) => (key === hl ? [[`${i},0`, 'done' as Color], [`${i},1`, 'done' as Color]] : key === hl2 ? [[`${i},0`, 'swap' as Color]] : []))), { colHeaders: ['前綴和', '次數'], title: '雜湊表 cnt', w: 'half' });
    r.snap('cnt = {0: 1}：空前綴的和為 0', [cells(a, {}, { title: 'a' }), mt(), vars({ p, ans, k })], 1);
    a.forEach((x: number, i: number) => {
      p += x;
      prefix.push(p);
      const add = cnt.get(p - k) ?? 0;
      ans += add;
      if (add) prefix.slice(0, -1).forEach((q, s) => { if (q === p - k) found.push(`[${s}..${i}]`); });
      r.snap(`p = ${p}；查 cnt[${p} − ${k}] = cnt[${p - k}] = ${add}` + (add ? `，找到 ${add} 個以 ${i} 結尾的子陣列` : ''), [cells(a, { [i]: 'active' }, { title: 'a' }), mt(p - k), vars({ p, ans, k }, undefined, { ans: add ? 'done' : 'default' as Color })], 4);
      cnt.set(p, (cnt.get(p) ?? 0) + 1);
      r.snap(`登錄 cnt[${p}] = ${cnt.get(p)}`, [cells(a, { [i]: 'active' }, { title: 'a' }), mt(undefined, p), vars({ p, ans, k })], 5);
    });
    let brute = 0;
    for (let i = 0; i < a.length; i++) { let s = 0; for (let j = i; j < a.length; j++) { s += a[j]; if (s === k) brute++; } }
    r.snap(`共 ${ans} 個子陣列和為 ${k}（暴力法 ${brute}）`, [cells(a, {}, { title: 'a' }), text([found.join('  ') || '（無）'], '子陣列'), vars({ ans })], 6);
    return r.frames;
  },
};

// ---------------- 接雨水 ----------------
const rainWater: AlgoDef = {
  id: 'trapping-rain-water', name: '接雨水', en: 'Trapping Rain Water', cat,
  desc: '每格的水位 = min(左邊最高, 右邊最高) − 高度。雙指標從兩端往中間走，維護 leftMax 與 rightMax：哪一邊的最高牆比較矮，那一邊的水位就已經確定，可以直接計算並移動。結果與逐格計算左右最大值的 O(n) 空間基準法比對。',
  time: 'O(n)', space: 'O(1)',
  code: ['l = 0, r = n − 1, leftMax = rightMax = 0', 'while l < r:', '  if h[l] < h[r]:', '    leftMax = max(leftMax, h[l])；water += leftMax − h[l]；l += 1', '  else:', '    rightMax = max(rightMax, h[r])；water += rightMax − h[r]；r −= 1', 'return water'],
  inputs: [inArr([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], '高度', 12, 0, 6)],
  run({ arr: h }) {
    const r = new Rec();
    const n = h.length;
    const w = new Array(n).fill(0);
    let l = 0, rr = n - 1, lm = 0, rm = 0, total = 0;
    const view = (msg: string, line: number, c: CMap = {}) => r.snap(msg, [bars(h, { ...Object.fromEntries(h.map((_: number, i: number) => [i, i < l || i > rr ? 'visited' : undefined])), ...c }, { pointers: P({ l, r: rr }), title: '高度' }), bars(w, Object.fromEntries(w.map((x, i) => [i, x ? 'active' : undefined])), { title: '每格積水', height: 90 }), vars({ leftMax: lm, rightMax: rm, water: total })], line);
    view('從兩端開始', 1);
    while (l < rr) {
      if (h[l] < h[rr]) {
        lm = Math.max(lm, h[l]);
        w[l] = lm - h[l]; total += w[l];
        view(`h[l] = ${h[l]} < h[r] = ${h[rr]}：左邊水位由 leftMax = ${lm} 決定，積水 ${w[l]}`, 4, { [l]: 'compare' });
        l++;
      } else {
        rm = Math.max(rm, h[rr]);
        w[rr] = rm - h[rr]; total += w[rr];
        view(`h[r] = ${h[rr]} ≤ h[l] = ${h[l]}：右邊水位由 rightMax = ${rm} 決定，積水 ${w[rr]}`, 6, { [rr]: 'compare' });
        rr--;
      }
    }
    let base = 0;
    for (let i = 0; i < n; i++) base += Math.max(0, Math.min(Math.max(...h.slice(0, i + 1)), Math.max(...h.slice(i))) - h[i]);
    view(`總積水 ${total}（逐格基準法 ${base}${base === total ? '，一致' : '，不一致！'}）`, 7);
    return r.frames;
  },
};

// ---------------- 下一個排列 ----------------
const nextPerm: AlgoDef = {
  id: 'next-permutation', name: '下一個字典序排列', en: 'Next Permutation', cat,
  desc: '從右往左找第一個 a[i] < a[i+1] 的轉折點 i；再從右邊找第一個比 a[i] 大的 a[j] 交換；最後把 i 之後的尾段反轉成遞增。若找不到轉折點，代表已是最大排列（遞減），整個反轉回到最小排列。重複值也能正確處理（比較時用嚴格不等式）。',
  time: 'O(n)', space: 'O(1)',
  code: ['i = n − 2', 'while i >= 0 and a[i] >= a[i+1]: i −= 1', 'if i >= 0:', '  j = n − 1', '  while a[j] <= a[i]: j −= 1', '  swap(a[i], a[j])', 'reverse(a[i+1 .. n−1])'],
  inputs: [inArr([1, 3, 5, 4, 2], '排列', 6, 1, 6), inNum('times', '連續求幾次', 3, 1, 10)],
  run({ arr, times }) {
    const r = new Rec();
    const a = [...arr];
    const n = a.length;
    const hist: string[] = [a.join(' ')];
    for (let t = 0; t < times; t++) {
      let i = n - 2;
      r.snap(`第 ${t + 1} 次：從右往左找第一個 a[i] < a[i+1]`, [cells(a, {}, { pointers: P({ i }) }), text(hist, '歷程')], 1);
      while (i >= 0 && a[i] >= a[i + 1]) { i--; }
      if (i >= 0) {
        r.snap(`轉折點 i = ${i}（a[${i}] = ${a[i]} < a[${i + 1}] = ${a[i + 1]}），右邊 [${i + 1}..] 是遞減的`, [cells(a, { [i]: 'active', ...range(i + 1, n - 1, 'frontier') }, { pointers: P({ i }) }), text(hist, '歷程')], 2);
        let j = n - 1;
        while (a[j] <= a[i]) j--;
        r.snap(`右邊比 ${a[i]} 大的最右元素是 a[${j}] = ${a[j]}，交換`, [cells(a, { [i]: 'active', [j]: 'compare' }, { pointers: P({ i, j }) }), text(hist, '歷程')], 5);
        [a[i], a[j]] = [a[j], a[i]];
        r.snap('交換後', [cells(a, { [i]: 'swap', [j]: 'swap' }, { pointers: P({ i, j }) }), text(hist, '歷程')], 6);
      } else r.snap('找不到轉折點：已是最大排列，整個反轉回最小排列', [cells(a, range(0, n - 1, 'frontier')), text(hist, '歷程')], 3);
      for (let x = i + 1, y = n - 1; x < y; x++, y--) [a[x], a[y]] = [a[y], a[x]];
      hist.push(a.join(' '));
      r.snap(`反轉尾段 [${i + 1}..${n - 1}] → ${a.join(' ')}`, [cells(a, range(i + 1, n - 1, 'done')), text(hist, '歷程')], 7);
    }
    return r.frames;
  },
};

// ---------------- 折半搜尋 ----------------
const mitm: AlgoDef = {
  id: 'meet-in-middle', name: '折半搜尋', en: 'Meet in the Middle', cat,
  desc: '求子集合和不超過 T 的最大值。直接列舉需要 2ⁿ；把陣列切成兩半，各自列舉 2^(n/2) 個子集合和，把右半排序後，對每個左半和 s 二分搜尋右半中 ≤ T − s 的最大值。總時間 O(2^(n/2)·n)，並與暴力列舉比對。',
  time: 'O(2^(n/2) · n)', space: 'O(2^(n/2))',
  code: ['L = 左半所有子集合和，R = 右半所有子集合和', 'sort(R)', 'best = −∞', 'for s in L:', '  if s > T: continue', '  x = R 中 ≤ T − s 的最大值（二分搜尋）', '  best = max(best, s + x)', 'return best'],
  inputs: [inArr([7, 3, 12, 18, 5, 9, 14, 2], '陣列（≤ 16 個正整數）', 8, 1, 20), inNum('T', '上限 T', 30, 0, 1e6, () => rnd.int(10, 60))],
  run({ arr: a, T }) {
    const r = new Rec();
    if (a.length > 16) throw new Error('最多 16 個元素');
    if (a.some((x: number) => x < 0)) throw new Error('元素必須非負');
    const h = a.length >> 1;
    const sums = (xs: number[]) => { const out: number[] = []; for (let m = 0; m < 1 << xs.length; m++) { let s = 0; xs.forEach((x, i) => { if (m >> i & 1) s += x; }); out.push(s); } return out; };
    const left = a.slice(0, h), right = a.slice(h);
    const L = sums(left), R = sums(right).sort((x, y) => x - y);
    r.snap(`切成兩半：左 ${left.length} 個、右 ${right.length} 個，各有 ${L.length}、${R.length} 種子集合和`, [cells(a, { ...range(0, h - 1, 'frontier'), ...range(h, a.length - 1, 'visited') }), text([`左半和：${L.join(', ')}`], undefined, 'half'), text([`右半和（排序後）：${R.join(', ')}`], undefined, 'half')], 2);
    let best = -Infinity, bs = 0, bx = 0;
    L.forEach((s, k) => {
      if (s > T) { if (k < 12) r.snap(`左半和 ${s} 已超過 T = ${T}，略過`, [cells(R, {}, { title: '右半和（已排序）' }), vars({ s, best: best === -Infinity ? '—' : best })], 5); return; }
      let lo = 0, hi = R.length - 1, idx = -1;
      while (lo <= hi) { const m = (lo + hi) >> 1; if (R[m] <= T - s) { idx = m; lo = m + 1; } else hi = m - 1; }
      const x = R[idx];
      const improved = s + x > best;
      if (improved) { best = s + x; bs = s; bx = x; }
      if (k < 12 || improved) r.snap(`左半和 s = ${s}：右半中 ≤ ${T - s} 的最大值是 ${x} → ${s + x}${improved ? '（更新最佳）' : ''}`, [cells(R, { [idx]: improved ? 'done' : 'compare', ...range(idx + 1, R.length - 1, 'muted') }, { title: '右半和（已排序）' }), vars({ s, 'T − s': T - s, best })], improved ? 7 : 6);
    });
    let brute = 0;
    for (const s of sums(a)) if (s <= T) brute = Math.max(brute, s);
    r.snap(`最大子集合和 ≤ ${T} 為 ${best}（左 ${bs} + 右 ${bx}）；暴力列舉 2^${a.length} 種得 ${brute}${brute === best ? '，一致' : '，不一致！'}`, [vars({ 答案: best, 暴力法: brute }, undefined, { 答案: 'done' })], 8);
    return r.frames;
  },
};

export default [twoPointers, slidingWindow, prefix2d, diff2d, compress, intervalMerge, subarrayK, rainWater, nextPerm, mitm] satisfies AlgoDef[];
