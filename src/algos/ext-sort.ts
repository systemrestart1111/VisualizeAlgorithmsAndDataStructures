// 擴充的排序、選擇與搜尋主題
import type { AlgoDef, CMap, Color, Pointer } from '../core/types';
import { Rec, bars, cells, inArr, inNum, inSelect, inSorted, inText, range, rnd, table, vars } from '../core/helpers';
import { SortTracer, ptrs } from '../core/sortTracer';
import { binaryPanel, type BNode } from '../core/graph';

const DEF = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72];
const P = (o: Record<string, number | undefined>): Pointer[] => ptrs(o);

// ---------------- 循環排序 ----------------
const cycleSort: AlgoDef = {
  id: 'cycle-sort', name: '循環排序', en: 'Cycle Sort', cat: 'sort-basic',
  desc: '對每個起點，數出有幾個元素比它小，就能算出它最終的位置，直接把它放過去，再處理被擠出來的元素，直到繞回起點。寫入次數是理論最少值，適合寫入昂貴的記憶體。遇到重複值時要跳過相同元素，否則會無窮迴圈。',
  time: 'O(n²)', space: 'O(1)',
  code: ['for start = 0 .. n-2:', '  item = a[start]', '  pos = start + #{ i > start : a[i] < item }', '  if pos == start: continue', '  while item == a[pos]: pos += 1     (跳過重複值)', '  swap(item, a[pos])                 (寫入 1 次)', '  while pos != start:', '    重新計算 pos 並跳過重複值', '    swap(item, a[pos])'],
  inputs: [inArr([20, 40, 50, 10, 30, 40, 20, 60, 10], '陣列', 10, 1, 9)],
  run({ arr }) {
    const t = new SortTracer(arr);
    const a = t.a, n = a.length;
    if (n <= 1) { t.snap('元素不超過 1 個，已經排序'); return t.finish(); }
    const findPos = (start: number, item: number) => {
      let pos = start;
      for (let i = start + 1; i < n; i++) { t.cmp++; if (a[i] < item) pos++; }
      return pos;
    };
    for (let start = 0; start < n - 1; start++) {
      let item = a[start];
      t.extraVars = { item };
      t.snap(`起點 ${start}：拿起 item = ${item}`, { [start]: 'active' }, 2, { start });
      let pos = findPos(start, item);
      t.snap(`右邊有 ${pos - start} 個比 ${item} 小，它應該在位置 ${pos}`, { [start]: 'active', [pos]: 'compare' }, 3, { start, pos });
      if (pos === start) { t.done.add(start); t.snap(`${item} 已在正確位置`, {}, 4, { start }); continue; }
      while (item === a[pos]) pos++;
      [item, a[pos]] = [a[pos], item];
      t.swp++;
      t.done.add(pos);
      t.extraVars = { item };
      t.snap(`把它寫到位置 ${pos}，手上換成被擠出的 ${item}`, { [pos]: 'swap' }, 6, { start, pos });
      while (pos !== start) {
        pos = findPos(start, item);
        while (pos !== start && item === a[pos]) pos++;
        if (pos === start) { a[start] = item; t.swp++; t.done.add(start); t.extraVars = { item: '—' }; t.snap(`${item} 屬於起點 ${start}，放回去，這個循環結束`, { [start]: 'swap' }, 8, { start }); break; }
        [item, a[pos]] = [a[pos], item];
        t.swp++;
        t.done.add(pos);
        t.extraVars = { item };
        t.snap(`寫到位置 ${pos}，手上換成 ${item}`, { [pos]: 'swap' }, 9, { start, pos });
      }
    }
    t.extraVars = {};
    return t.finish(`排序完成，共寫入 ${t.swp} 次`);
  },
};

// ---------------- 遞迴氣泡排序 ----------------
const recBubble: AlgoDef = {
  id: 'recursive-bubble-sort', name: '遞迴泡沫排序', en: 'Recursive Bubble Sort', cat: 'sort-basic',
  desc: '把氣泡排序寫成遞迴：bubble(n) 先做一輪相鄰比較，把最大值推到第 n−1 格，再呼叫 bubble(n−1)。當 n ≤ 1 或這一輪沒有交換時停止。可以清楚看到每層呼叫負責的範圍與遞迴堆疊。',
  time: 'O(n²)，已排序時 O(n)', space: 'O(n) 遞迴堆疊',
  code: ['bubble(a, n):', '  if n <= 1: return', '  swapped = false', '  for j = 0 .. n-2:', '    if a[j] > a[j+1]: swap；swapped = true', '  if not swapped: return', '  bubble(a, n - 1)'],
  inputs: [inArr([38, 27, 43, 3, 9, 82, 10, 55], '陣列', 8)],
  run({ arr }) {
    const t = new SortTracer(arr);
    const stack: string[] = [];
    const st = () => [table(stack.map((s, i) => [s + (i === stack.length - 1 ? '  ← 目前' : '')]), Object.fromEntries([[`${stack.length - 1},0`, 'active' as Color]]), { title: '呼叫堆疊（上方先呼叫）' })];
    const go = (n: number) => {
      stack.push(`bubble(n = ${n})`);
      if (n <= 1) { t.snap(`n = ${n} ≤ 1，直接返回`, {}, 2, {}, st()); stack.pop(); return; }
      let swapped = false;
      t.snap(`bubble(${n})：處理前 ${n} 個元素`, range(0, n - 1, 'active'), 3, {}, st(), [{ from: 0, to: n - 1, label: `n = ${n}` }]);
      for (let j = 0; j < n - 1; j++) {
        t.snap(`比較 a[${j}] = ${t.a[j]} 與 a[${j + 1}] = ${t.a[j + 1]}`, { [j]: 'compare', [j + 1]: 'compare' }, 5, { j }, st());
        if (t.less(j + 1, j)) { t.swap(j, j + 1); swapped = true; t.snap('交換', { [j]: 'swap', [j + 1]: 'swap' }, 5, { j }, st()); }
      }
      t.done.add(n - 1);
      if (!swapped) { for (let i = 0; i < n; i++) t.done.add(i); t.snap('這一輪沒有交換，前面已經排好，直接返回', {}, 6, {}, st()); stack.pop(); return; }
      t.snap(`最大值 ${t.a[n - 1]} 已到位，遞迴呼叫 bubble(${n - 1})`, {}, 7, {}, st());
      go(n - 1);
      stack.pop();
    };
    if (!t.a.length) { t.snap('空陣列：不需要排序'); return t.finish(); }
    go(t.a.length);
    return t.finish();
  },
};

// ---------------- 二分插入排序 ----------------
const binInsertion: AlgoDef = {
  id: 'binary-insertion-sort', name: '二分插入排序', en: 'Binary Insertion Sort', cat: 'sort-basic',
  desc: '和插入排序一樣把元素插進左邊已排序的部分，但用二分搜尋找插入位置，比較次數降到 O(n log n)；搬移元素的次數仍是 O(n²)。尋找「第一個大於 key 的位置」（upper bound），相等的鍵保持原本順序，因此是穩定排序。',
  time: '比較 O(n log n)，搬移 O(n²)', space: 'O(1)',
  code: ['for i = 1 .. n-1:', '  key = a[i]', '  lo = 0, hi = i          (在 a[0..i) 找第一個 > key 的位置)', '  while lo < hi:', '    mid = (lo + hi) / 2', '    if a[mid] <= key: lo = mid + 1 else hi = mid', '  把 a[lo..i-1] 往右搬一格', '  a[lo] = key'],
  inputs: [inArr([5, 2, 8, 2, 9, 1, 5, 6, 3, 5], '陣列', 12, 1, 9)],
  run({ arr }) {
    const t = new SortTracer(arr);
    const a = t.a;
    let moves = 0;
    t.extraVars = { 搬移: 0 };
    if (a.length) t.done.add(0);
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let lo = 0, hi = i;
      t.extraVars = { key, 搬移: moves };
      t.snap(`key = a[${i}] = ${key}，在 [0, ${i}) 中二分搜尋插入位置`, { ...range(0, i - 1, 'visited'), [i]: 'active' }, 3, { lo, hi });
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        t.cmp++;
        const go = a[mid] <= key;
        t.snap(`a[${mid}] = ${a[mid]} ${go ? '≤' : '>'} ${key} → ${go ? '往右' : '往左'}`, { ...range(lo, hi - 1, 'frontier'), [mid]: 'compare', [i]: 'active' }, 6, { lo, mid, hi });
        if (go) lo = mid + 1; else hi = mid;
      }
      for (let j = i; j > lo; j--) { a[j] = a[j - 1]; moves++; t.swp++; }
      a[lo] = key;
      t.swp++;
      for (let j = 0; j <= i; j++) t.done.add(j);
      t.extraVars = { key, 搬移: moves };
      t.snap(`插入位置 ${lo}：搬移 ${i - lo} 個元素後放入 ${key}`, { [lo]: 'swap', ...range(lo + 1, i, 'frontier') }, 8, { lo });
    }
    t.extraVars = { 搬移: moves };
    return t.finish(`排序完成：比較 ${t.cmp} 次、搬移 ${moves} 次`);
  },
};

// ---------------- 煎餅排序 ----------------
const pancake: AlgoDef = {
  id: 'pancake-sort', name: '煎餅排序', en: 'Pancake Sort', cat: 'sort-basic',
  desc: '唯一允許的操作是「翻轉前綴」（把鍋鏟插在第 k 個煎餅下面整疊翻過來）。每一輪找出未排序部分的最大值，先翻到最上面，再翻到未排序部分的底部。最多 2n − 3 次翻轉。',
  time: 'O(n²)', space: 'O(1)',
  code: ['for size = n down to 2:', '  m = argmax(a[0 .. size-1])', '  if m == size-1: continue', '  if m != 0: flip(0 .. m)        (最大值翻到最前面)', '  flip(0 .. size-1)              (再翻到第 size-1 格)'],
  inputs: [inArr([3, 6, 1, 8, 4, 9, 2, 7, 5], '陣列', 10)],
  run({ arr }) {
    const t = new SortTracer(arr);
    const a = t.a;
    let flips = 0;
    const flip = (k: number, line: number) => {
      for (let i = 0, j = k; i < j; i++, j--) t.swap(i, j);
      flips++;
      t.extraVars = { 翻轉: flips };
      t.snap(`翻轉前綴 [0..${k}]`, range(0, k, 'swap'), line, {}, [], [{ from: 0, to: k, color: 'swap', label: '翻轉' }]);
    };
    t.extraVars = { 翻轉: 0 };
    for (let size = a.length; size > 1; size--) {
      let m = 0;
      for (let i = 1; i < size; i++) { t.cmp++; if (a[i] > a[m]) m = i; }
      t.snap(`未排序部分 [0..${size - 1}] 的最大值 ${a[m]} 在位置 ${m}`, { ...range(0, size - 1, 'frontier'), [m]: 'active' }, 2, { m });
      if (m === size - 1) { t.done.add(size - 1); t.snap('已在正確位置，不用翻', {}, 3); continue; }
      if (m !== 0) flip(m, 4);
      flip(size - 1, 5);
      t.done.add(size - 1);
    }
    return t.finish(`排序完成，共翻轉 ${flips} 次`);
  },
};

// ---------------- 耐心排序 ----------------
const patience: AlgoDef = {
  id: 'patience-sort', name: '耐心排序', en: 'Patience Sorting', cat: 'sort-fast',
  desc: '像接龍一樣發牌：每張牌放到「牌頂 ≥ 它」的最左邊牌堆上（以二分搜尋牌頂），找不到就開新牌堆；每堆由上往下遞增。牌堆數等於最長嚴格遞增子序列的長度。最後用最小堆積反覆取出各堆牌頂，多路合併成排序結果。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['for x in a:', '  找最左邊牌頂 ≥ x 的牌堆（二分搜尋）', '  有就放上去，否則開新牌堆', 'heap = 各牌堆的牌頂', 'while heap 不空:', '  取出最小牌頂輸出', '  該牌堆的下一張放回 heap'],
  inputs: [inArr([6, 3, 9, 2, 8, 3, 7, 1, 5, 4, 9], '陣列', 11, 1, 20)],
  run({ arr }) {
    const r = new Rec();
    const piles: number[][] = [];
    const pileTable = (hl: number, col: Color = 'active') => {
      const h = Math.max(1, ...piles.map((p) => p.length));
      const rows = Array.from({ length: h }, (_, i) => piles.map((p) => p[p.length - 1 - i] ?? ''));
      return table(rows, hl >= 0 ? { [`0,${hl}`]: col } : {}, { colHeaders: piles.map((_, i) => `堆 ${i}`), rowHeaders: rows.map((_, i) => (i ? '' : '牌頂')), title: '牌堆（第一列是牌頂）' });
    };
    arr.forEach((x: number, i: number) => {
      let lo = 0, hi = piles.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (piles[m][piles[m].length - 1] >= x) hi = m; else lo = m + 1; }
      if (lo === piles.length) piles.push([x]); else piles[lo].push(x);
      r.snap(lo === piles.length - 1 && piles[lo].length === 1 ? `${x} 比所有牌頂大，開新牌堆 ${lo}` : `${x} 放到牌堆 ${lo}（牌頂 ≥ ${x} 的最左堆）`, [bars(arr, { ...range(0, i - 1, 'muted'), [i]: 'active' }), pileTable(lo)], lo === piles.length - 1 && piles[lo].length === 1 ? 3 : 2);
    });
    r.snap(`共 ${piles.length} 個牌堆（= 最長嚴格遞增子序列長度），開始多路合併`, [pileTable(-1)], 4);
    const out: number[] = [];
    const heap: [number, number][] = piles.map((p, k) => [p[p.length - 1], k]);
    const less = (x: [number, number], y: [number, number]) => x[0] < y[0] || (x[0] === y[0] && x[1] < y[1]);
    const sift = (i: number) => { for (;;) { let m = i; const l = 2 * i + 1, rr = l + 1; if (l < heap.length && less(heap[l], heap[m])) m = l; if (rr < heap.length && less(heap[rr], heap[m])) m = rr; if (m === i) return; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; } };
    for (let i = heap.length >> 1; i >= 0; i--) sift(i);
    const heapPanel = () => {
      const nodes: BNode[] = heap.map(([v, k], i) => ({ id: i, val: v, left: null, right: null, k }));
      nodes.forEach((nd, i) => { nd.left = nodes[2 * i + 1] ?? null; nd.right = nodes[2 * i + 2] ?? null; });
      return binaryPanel(nodes[0] ?? null, { sub: (nd) => `堆${nd.k}`, color: (nd) => (nd.id === 0 ? 'active' : undefined), title: '最小堆積（各牌堆的牌頂）', w: 'half' });
    };
    while (heap.length) {
      const [v, k] = heap[0];
      out.push(v);
      piles[k].pop();
      if (piles[k].length) heap[0] = [piles[k][piles[k].length - 1], k];
      else { heap[0] = heap[heap.length - 1]; heap.pop(); }
      sift(0);
      r.snap(`取出最小牌頂 ${v}（來自牌堆 ${k}）`, [pileTable(k, 'swap'), heapPanel(), bars(out, { [out.length - 1]: 'done' }, { title: '輸出' })], 6);
    }
    r.snap('排序完成', [bars(out, Object.fromEntries(out.map((_, i) => [i, 'done'])))], 7);
    return r.frames;
  },
};

// ---------------- MSD 基數排序（字串） ----------------
const msdRadix: AlgoDef = {
  id: 'msd-radix-sort', name: '最高位優先基數排序', en: 'MSD Radix Sort', cat: 'sort-special',
  desc: '從字串的第一個字元開始分桶，再對每個有兩個以上元素的桶，用下一個字元遞迴分桶。字串較短、在第 d 位已經結束的放在最前面的「結尾桶」，因此 "app" 會排在 "apple" 之前。只處理需要細分的桶，適合字典序排序。',
  time: 'O(N + n·σ)（N 為總字元數，σ 為字母表大小）', space: 'O(n + σ)',
  code: ['msd(list, d):', '  if |list| <= 1: return list', '  buckets = 結尾桶 + 每個字元一桶', '  for s in list: 依 s[d] 放入桶（長度 ≤ d 放結尾桶）', '  結尾桶直接輸出（已完全相同）', '  其他桶依字元順序遞迴 msd(bucket, d + 1)', '  依序串接各桶'],
  inputs: [inText('words', '字串（空白或逗號分隔）', 'she sells sea shells by the sea shore app apple ape', () => rnd.shuffle(['cat', 'car', 'cart', 'care', 'dog', 'do', 'door', 'dot', 'ant', 'an', 'and']).slice(0, 8).join(' '))],
  run({ words }) {
    const r = new Rec();
    const list: string[] = String(words).split(/[\s,，]+/).filter(Boolean);
    if (!list.length) throw new Error('請至少輸入一個字串');
    if (list.length > 24) throw new Error('為了清楚呈現，最多 24 個字串');
    const out: string[] = [];
    const show = (cur: string[], d: number, msg: string, line: number, buckets?: [string, string[]][]) => {
      const maxL = Math.max(...cur.map((s) => s.length), d + 1);
      const rows = cur.map((s) => Array.from({ length: maxL }, (_, i) => s[i] ?? (i === s.length ? '∅' : '')));
      const colors: Record<string, Color> = {};
      cur.forEach((s, ri) => { for (let i = 0; i < d; i++) colors[`${ri},${i}`] = 'muted'; colors[`${ri},${d}`] = 'active'; void s; });
      const ps: any[] = [table(rows, colors, { colHeaders: Array.from({ length: maxL }, (_, i) => (i === d ? `第 ${i} 位` : i)), title: `目前的子問題（比較第 ${d} 個字元，∅ 表示字串已結束）` })];
      if (buckets) ps.push(table(buckets.map(([k, v]) => [k, v.join(', ')]), {}, { colHeaders: ['桶', '內容'], w: 'half' }));
      ps.push(cells(out.length ? out : ['（空）'], {}, { title: '已確定的輸出' }));
      r.snap(msg, ps, line);
    };
    const msd = (cur: string[], d: number) => {
      if (cur.length <= 1) { out.push(...cur); if (cur.length) show(cur, d, `只有「${cur[0]}」一個，直接輸出`, 2); return; }
      const end: string[] = [];
      const map = new Map<string, string[]>();
      for (const s of cur) { if (s.length <= d) end.push(s); else { const c = s[d]; if (!map.has(c)) map.set(c, []); map.get(c)!.push(s); } }
      const keys = [...map.keys()].sort();
      const buckets: [string, string[]][] = [...(end.length ? [['結尾', end] as [string, string[]]] : []), ...keys.map((k) => [k, map.get(k)!] as [string, string[]])];
      show(cur, d, `依第 ${d} 個字元分成 ${buckets.length} 桶`, 4, buckets);
      if (end.length) { out.push(...end); show(cur, d, `結尾桶：${end.join(', ')} 已在第 ${d} 位結束，直接輸出`, 5, buckets); }
      for (const k of keys) msd(map.get(k)!, d + 1);
    };
    msd(list, 0);
    r.snap(`排序完成：${out.join(', ')}`, [cells(out, Object.fromEntries(out.map((_, i) => [i, 'done' as Color])), { title: '排序結果' })], 7);
    return r.frames;
  },
};

// ---------------- 多路合併 ----------------
const parseLists = (s: string) => String(s).split(';').map((part) => part.split(/[\s,，]+/).filter(Boolean).map(Number)).map((l) => { if (l.some((x) => Number.isNaN(x))) throw new Error('串列只能包含數字'); return l; });
const multiway: AlgoDef = {
  id: 'multiway-merge', name: '多路合併', en: 'K-way Merge', cat: 'sort-special',
  desc: '把 k 個已排序的串列合併成一個：最小堆積放每個串列目前的開頭元素，每次取出最小者輸出，再把同一串列的下一個元素放進堆積。空串列直接略過；長度不同也不影響。外部排序與資料庫合併都用這個方法。',
  time: 'O(N log k)', space: 'O(k)',
  code: ['heap = 每個非空串列的 (第一個元素, 串列編號)', 'while heap 不空:', '  (x, i) = heap.pop()', '  output.append(x)', '  若串列 i 還有元素: heap.push(下一個)'],
  inputs: [inText('lists', '已排序串列（以 ; 分隔，可留空）', '1 4 9 12; 2 3 10; ; 5; 6 7 8 11 13', () => Array.from({ length: rnd.int(3, 5) }, () => rnd.sorted(rnd.int(0, 5), 1, 40).join(' ')).join('; '))],
  run({ lists }) {
    const r = new Rec();
    const L = parseLists(lists);
    if (L.length > 8) throw new Error('最多 8 個串列');
    L.forEach((l, i) => { if (l.some((x, k) => k && l[k - 1] > x)) throw new Error(`串列 ${i} 沒有排序`); });
    const pos = L.map(() => 0);
    const heap: [number, number][] = [];
    const less = (x: [number, number], y: [number, number]) => x[0] < y[0] || (x[0] === y[0] && x[1] < y[1]);
    const push = (e: [number, number]) => { heap.push(e); let i = heap.length - 1; while (i && less(heap[i], heap[(i - 1) >> 1])) { [heap[i], heap[(i - 1) >> 1]] = [heap[(i - 1) >> 1], heap[i]]; i = (i - 1) >> 1; } };
    const pop = () => { const top = heap[0]; const last = heap.pop()!; if (heap.length) { heap[0] = last; let i = 0; for (;;) { let m = i; const l = 2 * i + 1, rr = l + 1; if (l < heap.length && less(heap[l], heap[m])) m = l; if (rr < heap.length && less(heap[rr], heap[m])) m = rr; if (m === i) break; [heap[i], heap[m]] = [heap[m], heap[i]]; i = m; } } return top; };
    const out: number[] = [];
    const view = (hlList: number, msg: string, line: number) => {
      const w = Math.max(1, ...L.map((l) => l.length));
      const colors: Record<string, Color> = {};
      L.forEach((l, i) => l.forEach((_, k) => { if (k < pos[i]) colors[`${i},${k}`] = 'muted'; else if (k === pos[i]) colors[`${i},${k}`] = i === hlList ? 'active' : 'frontier'; }));
      const nodes: BNode[] = heap.map(([v, k], i) => ({ id: i, val: v, left: null, right: null, k }));
      nodes.forEach((nd, i) => { nd.left = nodes[2 * i + 1] ?? null; nd.right = nodes[2 * i + 2] ?? null; });
      r.snap(msg, [table(L.map((l) => Array.from({ length: w }, (_, k) => l[k] ?? '')), colors, { rowHeaders: L.map((l, i) => `串列 ${i}${l.length ? '' : '（空）'}`) }), binaryPanel(nodes[0] ?? null, { sub: (nd) => `#${nd.k}`, color: (nd) => (nd.id === 0 ? 'active' : undefined), title: '最小堆積', w: 'half' }), bars(out.length ? out : [0], out.length ? { [out.length - 1]: 'done' } : {}, { title: '輸出', labels: out.length ? undefined : [''] })], line);
    };
    L.forEach((l, i) => { if (l.length) push([l[0], i]); });
    view(-1, `把 ${heap.length} 個非空串列的第一個元素放進最小堆積` + (heap.length < L.length ? `（略過 ${L.length - heap.length} 個空串列）` : ''), 1);
    while (heap.length) {
      const [x, i] = pop();
      out.push(x);
      pos[i]++;
      if (pos[i] < L[i].length) push([L[i][pos[i]], i]);
      view(i, `取出最小 ${x}（串列 ${i}）` + (pos[i] < L[i].length ? `，放入串列 ${i} 的下一個 ${L[i][pos[i]]}` : `，串列 ${i} 已用完`), pos[i] < L[i].length ? 5 : 4);
    }
    r.snap(`合併完成，共 ${out.length} 個元素`, [bars(out.length ? out : [0], Object.fromEntries(out.map((_, k) => [k, 'done'])), { title: '合併結果' })], 2);
    return r.frames;
  },
};

// ---------------- 逆序對 ----------------
const inversion: AlgoDef = {
  id: 'inversion-count', name: '逆序對計數', en: 'Inversion Count', cat: 'array',
  desc: '逆序對是 i < j 但 a[i] > a[j] 的配對。用合併排序：合併時若右半的元素先被取出，代表它比左半剩下的所有元素都小，一次加上「左半剩餘個數」。相等的值不算逆序（合併時相等先取左邊）。結果與 O(n²) 暴力法比對。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['count(l, r):', '  if r - l <= 1: return 0', '  m = (l + r) / 2；c = count(l, m) + count(m, r)', '  合併 a[l..m) 與 a[m..r)：', '    if a[i] <= a[j]: 取左邊', '    else: 取右邊；c += m − i       (左半剩下的都比它大)', '  return c'],
  inputs: [inArr([8, 4, 2, 1, 7, 3, 5, 3], '陣列', 10, 1, 20)],
  run({ arr }) {
    const t = new SortTracer(arr);
    const a = t.a;
    let inv = 0;
    const go = (l: number, rr: number) => {
      if (rr - l <= 1) return;
      const m = (l + rr) >> 1;
      go(l, m); go(m, rr);
      const left = a.slice(l, m), right = a.slice(m, rr);
      let i = 0, j = 0, k = l;
      t.extraVars = { 逆序對: inv };
      t.snap(`合併 [${l}..${m - 1}] 與 [${m}..${rr - 1}]`, { ...range(l, m - 1, 'frontier'), ...range(m, rr - 1, 'visited') }, 4, {}, [], [{ from: l, to: m - 1, label: '左' }, { from: m, to: rr - 1, label: '右', color: 'visited' }]);
      while (i < left.length || j < right.length) {
        if (j >= right.length || (i < left.length && left[i] <= right[j])) { a[k++] = left[i++]; t.swp++; }
        else {
          inv += left.length - i;
          t.extraVars = { 逆序對: inv };
          t.snap(`右邊的 ${right[j]} 比左半剩下的 ${left.length - i} 個（${left.slice(i).join(', ')}）都小 → +${left.length - i}`, { [k]: 'swap' }, 6, {});
          a[k++] = right[j++]; t.swp++;
        }
      }
      t.extraVars = { 逆序對: inv };
      t.snap(`合併完成，目前逆序對 ${inv}`, range(l, rr - 1, 'done'), 7);
    };
    go(0, a.length);
    let brute = 0;
    for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) if (arr[i] > arr[j]) brute++;
    t.extraVars = { 逆序對: inv, 暴力法: brute };
    return t.finish(`共 ${inv} 個逆序對（暴力法 ${brute}${brute === inv ? '，一致' : '，不一致！'}）`);
  },
};

// ---------------- 第二大元素 ----------------
const secondLargest: AlgoDef = {
  id: 'second-largest', name: '尋找第二大元素', en: 'Find Second Largest Element', cat: 'array',
  desc: '一次掃描同時維護最大值 first 與第二大 second。預設求「第二大的相異值」：等於 first 的元素不能成為 second，例如 [5, 5, 3] 答案是 3；所有元素相同時沒有答案。切換成「含重複排名」時 [5, 5, 3] 的第二名是 5。',
  time: 'O(n)', space: 'O(1)',
  code: ['first = second = 無', 'for x in a:', '  if first 無 或 x > first: second = first；first = x', '  else if x == first: 相異模式略過；含重複模式 second = x', '  else if second 無 或 x > second: second = x', 'return second（可能不存在）'],
  inputs: [inArr([12, 35, 1, 10, 34, 35, 1], '陣列', 8, 1, 50), inSelect('mode', '定義', [['distinct', '第二大相異值'], ['rank', '含重複排名']])],
  run({ arr, mode }) {
    const r = new Rec();
    let first: number | null = null, second: number | null = null;
    const distinct = mode !== 'rank';
    const snap = (i: number, msg: string, line: number, c: Color = 'compare') => r.snap(msg, [cells(arr, { ...Object.fromEntries(arr.map((_: number, k: number) => [k, k < i ? 'visited' : undefined])), [i]: c }, { pointers: P({ i }) }), vars({ first: first ?? '無', second: second ?? '無' }, undefined, { first: 'active', second: 'swap' })], line);
    if (!arr.length) { r.snap('空陣列沒有第二大元素', [vars({ second: '不存在' })], 6); return r.frames; }
    arr.forEach((x: number, i: number) => {
      if (first === null || x > first) { second = first; first = x; snap(i, `${x} 比 first 大：舊的 first 降為 second`, 3, 'active'); }
      else if (x === first) { if (!distinct) second = x; snap(i, distinct ? `${x} 等於 first，不是相異的第二大，略過` : `${x} 等於 first，含重複排名時第二名也是 ${x}`, 4, distinct ? 'muted' : 'swap'); }
      else if (second === null || x > second) { second = x; snap(i, `${x} 介於 second 與 first 之間，更新 second`, 5, 'swap'); }
      else snap(i, `${x} 不影響答案`, 2, 'muted');
    });
    r.snap(second === null ? `所有元素都等於 ${first}，沒有第二大的相異值` : `第二大${distinct ? '相異值' : '（含重複排名）'}為 ${second}`, [cells(arr, Object.fromEntries(arr.map((x: number, k: number) => [k, x === second ? 'done' : x === first ? 'active' : undefined]))), vars({ first: first ?? '無', second: second ?? '不存在' }, undefined, { second: second === null ? 'bad' : 'done' })], 6);
    return r.frames;
  },
};

// ---------------- 答案二分 ----------------
const bsAnswer: AlgoDef = {
  id: 'binary-search-answer', name: '答案二分搜尋', en: 'Binary Search on Answer', cat: 'search',
  desc: '當「答案 x 可行」具有單調性（x 可行則更大的 x 也可行），就能對答案二分。例題：h 小時內吃完所有香蕉堆，每小時最多吃一堆中的 k 根，求最小的 k。可行性函數 hours(k) = Σ⌈pᵢ / k⌉ ≤ h。若 h 小於堆數，任何速度都不可行。',
  time: 'O(n log max(p))', space: 'O(1)',
  code: ['if h < n: 任何 k 都不可行', 'lo = 1, hi = max(p)', 'while lo < hi:', '  mid = (lo + hi) / 2', '  if feasible(mid):  hi = mid      (mid 可行，答案 ≤ mid)', '  else: lo = mid + 1', 'return lo', 'feasible(k) = Σ ceil(p_i / k) <= h'],
  inputs: [inArr([30, 11, 23, 4, 20], '香蕉堆', 6, 1, 60), inNum('h', '時限 h（小時）', 6, 1, 1000, (c) => rnd.int(c.arr.length, c.arr.length * 3))],
  run({ arr, h }) {
    const r = new Rec();
    if (!arr.length || arr.some((x: number) => x <= 0)) throw new Error('香蕉堆必須是正整數');
    const n = arr.length;
    if (h < n) { r.snap(`h = ${h} 小於堆數 ${n}：每小時最多吃一堆，任何速度都不可行`, [bars(arr), vars({ h, n }, undefined, { h: 'bad' })], 1); return r.frames; }
    let lo = 1, hi = Math.max(...arr);
    const hours = (k: number) => arr.reduce((s: number, p: number) => s + Math.ceil(p / k), 0);
    const tried: (string | number)[][] = [];
    r.snap(`答案範圍 [1, ${hi}]：速度 ${hi} 一定可行（每堆 1 小時）`, [bars(arr, {}, { title: '香蕉堆' }), vars({ lo, hi, h })], 2);
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      const hh = hours(mid);
      const ok = hh <= h;
      tried.push([mid, arr.map((p: number) => Math.ceil(p / mid)).join('+') + ' = ' + hh, ok ? '可行' : '不可行']);
      r.snap(`k = ${mid}：需要 ${hh} 小時 ${ok ? '≤' : '>'} ${h} → ${ok ? '可行，往左找更小的' : '不可行，往右'}`, [bars(arr, {}, { title: '香蕉堆', labels: arr.map((p: number) => `${p}→${Math.ceil(p / mid)}h`) }), table(tried, { [`${tried.length - 1},2`]: ok ? 'done' : 'bad' }, { colHeaders: ['k', '時數', '結果'], w: 'half' }), vars({ lo, mid, hi })], ok ? 5 : 6);
      if (ok) hi = mid; else lo = mid + 1;
    }
    r.snap(`最小速度 k = ${lo}（需要 ${hours(lo)} 小時）` + (lo > 1 ? `；k = ${lo - 1} 需要 ${hours(lo - 1)} 小時，超過時限` : ''), [bars(arr, {}, { labels: arr.map((p: number) => `${p}→${Math.ceil(p / lo)}h`) }), vars({ 答案: lo }, undefined, { 答案: 'done' })], 7);
    return r.frames;
  },
};

// ---------------- 旋轉陣列搜尋 ----------------
const rotated: AlgoDef = {
  id: 'rotated-array-search', name: '旋轉有序陣列搜尋', en: 'Search in Rotated Sorted Array', cat: 'search',
  desc: '已排序陣列被旋轉過（如 [4,5,6,7,0,1,2]）。二分時 [lo, mid] 與 [mid, hi] 至少有一邊是有序的：判斷目標是否落在有序那半邊的範圍內，就能捨棄另一半。若有重複值且 a[lo] = a[mid] = a[hi]，無法判斷哪邊有序，只能把兩端各縮一格，最壞退化成 O(n)。',
  time: 'O(log n)；有重複值時最壞 O(n)', space: 'O(1)',
  code: ['lo = 0, hi = n - 1', 'while lo <= hi:', '  mid = (lo + hi) / 2；if a[mid] == t: return mid', '  if a[lo] == a[mid] == a[hi]: lo++, hi--；continue', '  if a[lo] <= a[mid]:            (左半有序)', '    if a[lo] <= t < a[mid]: hi = mid - 1 else lo = mid + 1', '  else:                          (右半有序)', '    if a[mid] < t <= a[hi]: lo = mid + 1 else hi = mid - 1', 'return -1'],
  inputs: [{ key: 'arr', label: '旋轉後的有序陣列', type: 'array', default: [45, 52, 60, 67, 74, 3, 8, 12, 17, 23, 31, 38], random: () => { const s = rnd.distinct(12, 1, 90).sort((x, y) => x - y); const k = rnd.int(1, 11); return [...s.slice(k), ...s.slice(0, k)]; } }, inNum('t', '目標值', 12, undefined, undefined, (c) => rnd.pick(c.arr as number[]))],
  run({ arr: a, t }) {
    const r = new Rec();
    let lo = 0, hi = a.length - 1;
    const snap = (msg: string, line: number, extra: CMap = {}, mid?: number) => {
      const c: CMap = {};
      for (let i = 0; i < a.length; i++) if (i < lo || i > hi) c[i] = 'muted';
      r.snap(msg, [cells(a, { ...c, ...extra }, { pointers: P({ lo, mid, hi }) }), vars({ lo, hi, mid: mid ?? '—', t })], line);
    };
    snap(`在旋轉陣列中找 ${t}`, 1);
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (a[mid] === t) { snap(`a[${mid}] = ${t}，找到了`, 3, { [mid]: 'done' }, mid); return r.frames; }
      if (a[lo] === a[mid] && a[mid] === a[hi]) { snap(`a[lo] = a[mid] = a[hi] = ${a[mid]}，無法判斷哪邊有序，兩端各縮一格`, 4, { [lo]: 'compare', [mid]: 'compare', [hi]: 'compare' }, mid); lo++; hi--; continue; }
      if (a[lo] <= a[mid]) {
        const inLeft = a[lo] <= t && t < a[mid];
        snap(`左半 [${lo}..${mid}] 有序（${a[lo]} ≤ ${a[mid]}）；${t} ${inLeft ? '在' : '不在'} [${a[lo]}, ${a[mid]}) 內`, 6, { ...range(lo, mid, 'frontier'), [mid]: 'compare' }, mid);
        if (inLeft) hi = mid - 1; else lo = mid + 1;
      } else {
        const inRight = a[mid] < t && t <= a[hi];
        snap(`右半 [${mid}..${hi}] 有序（${a[mid]} < ${a[hi]}）；${t} ${inRight ? '在' : '不在'} (${a[mid]}, ${a[hi]}] 內`, 8, { ...range(mid, hi, 'frontier'), [mid]: 'compare' }, mid);
        if (inRight) lo = mid + 1; else hi = mid - 1;
      }
    }
    snap(`找不到 ${t}，回傳 -1`, 9);
    return r.frames;
  },
};

// ---------------- 兩個有序陣列的中位數 ----------------
const twoMedian: AlgoDef = {
  id: 'two-sorted-median', name: '兩個有序陣列的中位數', en: 'Median of Two Sorted Arrays', cat: 'search',
  desc: '在較短的陣列 A 上二分切點 i，B 的切點 j = (m + n + 1)/2 − i，使左半部共有一半的元素。若 A[i−1] ≤ B[j] 且 B[j−1] ≤ A[i]，左半最大值與右半最小值就決定中位數（總長為奇數時取左半最大）。陣列為空時以 −∞／+∞ 補邊界。',
  time: 'O(log min(m, n))', space: 'O(1)',
  code: ['讓 A 為較短的陣列', 'lo = 0, hi = m', 'while lo <= hi:', '  i = (lo + hi) / 2；j = (m + n + 1) / 2 − i', '  L1 = A[i−1], R1 = A[i], L2 = B[j−1], R2 = B[j]  (越界用 ±∞)', '  if L1 <= R2 and L2 <= R1:', '    奇數：max(L1, L2)；偶數：(max(L1, L2) + min(R1, R2)) / 2', '  else if L1 > R2: hi = i − 1', '  else: lo = i + 1'],
  inputs: [inSorted([1, 3, 8, 9, 15], '已排序陣列 A', 5), { key: 'b', label: '已排序陣列 B', type: 'array', default: [7, 11, 18, 19, 21, 25], random: () => rnd.sorted(rnd.int(0, 7), 1, 99) }],
  run({ arr: a0, b: b0 }) {
    const r = new Rec();
    const s1 = [...a0].sort((x, y) => x - y), s2 = [...b0].sort((x, y) => x - y);
    if (!s1.length && !s2.length) throw new Error('兩個陣列不能同時為空');
    const swap = s1.length > s2.length;
    const A = swap ? s2 : s1, B = swap ? s1 : s2;
    const m = A.length, n = B.length, half = (m + n + 1) >> 1;
    const view = (i: number, j: number, msg: string, line: number, ok?: boolean) => {
      const ca: CMap = {}, cb: CMap = {};
      A.forEach((_, k) => (ca[k] = k < i ? 'frontier' : 'visited'));
      B.forEach((_, k) => (cb[k] = k < j ? 'frontier' : 'visited'));
      r.snap(msg, [cells(A.length ? A : ['（空）'], A.length ? ca : {}, { title: `A（較短${swap ? '，原本的 B' : ''}）：切點 i = ${i}`, pointers: A.length ? [{ index: Math.min(i, m - 1), label: i < m ? '│i' : 'i│' }] : undefined }), cells(B.length ? B : ['（空）'], B.length ? cb : {}, { title: `B：切點 j = ${j}`, pointers: B.length ? [{ index: Math.min(j, n - 1), label: j < n ? '│j' : 'j│' }] : undefined }), vars({ L1: i > 0 ? A[i - 1] : -Infinity, R1: i < m ? A[i] : Infinity, L2: j > 0 ? B[j - 1] : -Infinity, R2: j < n ? B[j] : Infinity }, '青色為左半部', ok === undefined ? {} : { L1: ok ? 'done' : 'bad', L2: ok ? 'done' : 'bad' })], line);
    };
    let lo = 0, hi = m;
    while (lo <= hi) {
      const i = (lo + hi) >> 1, j = half - i;
      const L1 = i > 0 ? A[i - 1] : -Infinity, R1 = i < m ? A[i] : Infinity, L2 = j > 0 ? B[j - 1] : -Infinity, R2 = j < n ? B[j] : Infinity;
      if (L1 <= R2 && L2 <= R1) {
        const med = (m + n) % 2 ? Math.max(L1, L2) : (Math.max(L1, L2) + Math.min(R1, R2)) / 2;
        view(i, j, `左半最大 ${Math.max(L1, L2)} ≤ 右半最小 ${Math.min(R1, R2)}：切點正確。總長 ${m + n} 為${(m + n) % 2 ? '奇數，中位數 = 左半最大' : '偶數，取兩者平均'} = ${med}`, 7, true);
        const all = [...A, ...B].sort((x, y) => x - y);
        r.snap(`中位數 = ${med}`, [cells(all, (m + n) % 2 ? { [(m + n) >> 1]: 'done' } : { [(m + n) / 2 - 1]: 'done', [(m + n) / 2]: 'done' }, { title: '合併後驗證' }), vars({ 中位數: med }, undefined, { 中位數: 'done' })], 7);
        return r.frames;
      }
      if (L1 > R2) { view(i, j, `A 的左半最大 ${L1} > B 的右半最小 ${R2}：i 太大，往左`, 8, false); hi = i - 1; }
      else { view(i, j, `B 的左半最大 ${L2} > A 的右半最小 ${R1}：i 太小，往右`, 9, false); lo = i + 1; }
    }
    throw new Error('輸入必須是已排序陣列');
  },
};

export default [cycleSort, recBubble, binInsertion, pancake, patience, msdRadix, multiway, inversion, secondLargest, bsAnswer, rotated, twoMedian] satisfies AlgoDef[];
