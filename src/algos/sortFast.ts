import type { AlgoDef, CMap } from '../core/types';
import { inArr, inSelect, cells, range } from '../core/helpers';
import { SortTracer } from '../core/sortTracer';
import { binaryPanel, type BNode } from '../core/graph';

const cat = 'sort-fast';
const DEF = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47];

const merge: AlgoDef = {
  id: 'merge-sort', name: '合併排序', en: 'Merge Sort', cat, star: true,
  desc: '分治法：把陣列對半拆開，分別遞迴排序，再把兩個已排序的半邊合併。穩定排序，時間永遠 O(n log n)。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['mergeSort(lo, hi):', '  if lo >= hi: return', '  mid = (lo + hi) / 2', '  mergeSort(lo, mid)', '  mergeSort(mid+1, hi)', '  merge(lo, mid, hi)', 'merge: 兩指標 i, j 取較小者', '  依序寫回 a[lo..hi]'],
  inputs: [inArr(DEF, '陣列', 16)],
  run({ arr }) {
    const t = new SortTracer(arr);
    const rec = (lo: number, hi: number, depth: number) => {
      if (lo >= hi) return;
      const mid = (lo + hi) >> 1;
      t.snap(`拆分 [${lo}..${hi}] → [${lo}..${mid}] 與 [${mid + 1}..${hi}]`, range(lo, hi, 'active'), 3, {}, [], [{ from: lo, to: mid, color: 'active', label: 'L' }, { from: mid + 1, to: hi, color: 'frontier', label: 'R' }]);
      rec(lo, mid, depth + 1);
      rec(mid + 1, hi, depth + 1);
      const L = t.a.slice(lo, mid + 1), R = t.a.slice(mid + 1, hi + 1);
      let i = 0, j = 0, k = lo;
      const aux = () => [cells(L, { [i]: 'compare' }, { title: '左半 L', w: 'half' }), cells(R, { [j]: 'compare' }, { title: '右半 R', w: 'half' })];
      t.snap(`合併 [${lo}..${mid}] 與 [${mid + 1}..${hi}]`, range(lo, hi, 'active'), 6, { k }, aux());
      while (i < L.length || j < R.length) {
        let take: number;
        if (j >= R.length || (i < L.length && (t.cmp++, L[i] <= R[j]))) take = L[i++];
        else take = R[j++];
        t.set(k, take);
        t.snap(`寫入 a[${k}] = ${take}`, { ...range(lo, k - 1, 'visited'), [k]: 'swap' }, 7, { k }, aux());
        k++;
      }
    };
    rec(0, t.a.length - 1, 0);
    return t.finish();
  },
};

const quick: AlgoDef = {
  id: 'quick-sort', name: '快速排序', en: 'Quick Sort', cat, star: true,
  desc: '分治法：選一個 pivot，把小於 pivot 的放左邊、大於的放右邊，再遞迴處理兩邊。可選 Lomuto 或 Hoare 分割法。',
  time: '平均 O(n log n)，最差 O(n²)', space: 'O(log n)',
  code: ['quickSort(lo, hi):', '  if lo >= hi: return', '  p = partition(lo, hi)', '  quickSort(lo, p-1)  (Hoare: lo..p)', '  quickSort(p+1, hi)  (Hoare: p+1..hi)', 'Lomuto: pivot = a[hi], i = lo', '  for j in lo..hi-1: 若 a[j] < pivot 交換 a[i++], a[j]', '  swap(a[i], a[hi]); return i', 'Hoare: pivot = a[mid]，i, j 由兩端往內', '  找到逆序對就交換，直到 i >= j'],
  inputs: [inArr(DEF, '陣列', 16), inSelect('scheme', '分割法', [['lomuto', 'Lomuto'], ['hoare', 'Hoare']])],
  run({ arr, scheme }) {
    const t = new SortTracer(arr);
    const lomuto = (lo: number, hi: number) => {
      const pv = t.a[hi];
      t.extraVars = { pivot: pv };
      let i = lo;
      t.snap(`pivot = a[${hi}] = ${pv}`, { ...range(lo, hi, 'muted'), [hi]: 'special' }, 6, { i, hi });
      for (let j = lo; j < hi; j++) {
        const c: CMap = { ...range(lo, i - 1, 'visited'), [hi]: 'special', [j]: 'compare' };
        t.snap(`a[${j}]=${t.a[j]} < pivot ${pv}?`, c, 7, { i, j });
        t.cmp++;
        if (t.a[j] < pv) {
          t.swap(i, j);
          t.snap(`是 → 交換 a[${i}] 與 a[${j}]，i++`, { ...range(lo, i, 'visited'), [hi]: 'special', [i]: 'swap', [j]: 'swap' }, 7, { i, j });
          i++;
        }
      }
      t.swap(i, hi);
      t.snap(`把 pivot 放到最終位置 ${i}`, { ...range(lo, i - 1, 'visited'), [i]: 'swap', [hi]: 'swap' }, 8, { p: i });
      return i;
    };
    const hoare = (lo: number, hi: number) => {
      const m = (lo + hi) >> 1;
      const pv = t.a[m];
      t.extraVars = { pivot: pv };
      let i = lo - 1, j = hi + 1;
      t.snap(`pivot = a[${m}] = ${pv}`, { ...range(lo, hi, 'muted'), [m]: 'special' }, 9);
      for (;;) {
        do { i++; t.cmp++; t.snap(`i 右移：a[${i}]=${t.a[i]} < ${pv}?`, { ...range(lo, hi, 'muted'), [i]: 'compare' }, 10, { i, j: j <= hi ? j : undefined }); } while (t.a[i] < pv);
        do { j--; t.cmp++; t.snap(`j 左移：a[${j}]=${t.a[j]} > ${pv}?`, { ...range(lo, hi, 'muted'), [i]: 'active', [j]: 'compare' }, 10, { i, j }); } while (t.a[j] > pv);
        if (i >= j) {
          t.snap(`i ≥ j，分割點 = ${j}`, { ...range(lo, j, 'visited'), ...range(j + 1, hi, 'frontier') }, 10, { p: j });
          return j;
        }
        t.swap(i, j);
        t.snap(`交換 a[${i}] 與 a[${j}]`, { ...range(lo, hi, 'muted'), [i]: 'swap', [j]: 'swap' }, 10, { i, j });
      }
    };
    const rec = (lo: number, hi: number) => {
      if (lo >= hi) {
        if (lo === hi && scheme === 'lomuto') t.done.add(lo);
        return;
      }
      t.snap(`處理區間 [${lo}..${hi}]`, range(lo, hi, 'active'), 1, { lo, hi });
      if (scheme === 'hoare') {
        const p = hoare(lo, hi);
        rec(lo, p);
        rec(p + 1, hi);
      } else {
        const p = lomuto(lo, hi);
        t.done.add(p);
        rec(lo, p - 1);
        rec(p + 1, hi);
      }
    };
    rec(0, t.a.length - 1);
    t.extraVars = {};
    return t.finish();
  },
};

function heapPanel(a: number[], n: number, colors: CMap) {
  // 把 a[0..n-1] 畫成完全二元樹
  const nodes: BNode[] = a.map((v, i) => ({ id: i, val: v, left: null, right: null }));
  for (let i = 0; i < n; i++) {
    if (2 * i + 1 < n) nodes[i].left = nodes[2 * i + 1];
    if (2 * i + 2 < n) nodes[i].right = nodes[2 * i + 2];
  }
  return binaryPanel(n ? nodes[0] : null, { color: (x) => colors[x.id], badge: (x) => String(x.id), title: '堆積（樹狀檢視）' });
}

export function heapSortRun(arr: number[], t = new SortTracer(arr), lo = 0, hi = arr.length - 1, withTree = true) {
  const n = hi - lo + 1;
  const A = (i: number) => lo + i;
  const extra = (sz: number, c: CMap) => (withTree ? [heapPanel(t.a.slice(lo, hi + 1), sz, Object.fromEntries(Object.entries(c).map(([k, v]) => [+k - lo, v])))] : []);
  const sift = (i: number, sz: number, line: number) => {
    for (;;) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let m = i;
      if (l < sz && (t.cmp++, t.a[A(l)] > t.a[A(m)])) m = l;
      if (r < sz && (t.cmp++, t.a[A(r)] > t.a[A(m)])) m = r;
      const c: CMap = { [A(i)]: 'active' };
      if (l < sz) c[A(l)] = 'compare';
      if (r < sz) c[A(r)] = 'compare';
      t.snap(`下沉：比較節點 ${i} 與其子節點`, c, line, { i: A(i) }, extra(sz, c));
      if (m === i) return;
      t.swap(A(i), A(m));
      const c2: CMap = { [A(i)]: 'swap', [A(m)]: 'swap' };
      t.snap(`與較大的子節點 ${m} 交換`, c2, line, { i: A(m) }, extra(sz, c2));
      i = m;
    }
  };
  t.snap('建構最大堆積（由最後一個非葉節點往前下沉）', {}, 1, {}, extra(n, {}));
  for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n, 2);
  for (let end = n - 1; end > 0; end--) {
    t.swap(A(0), A(end));
    t.done.add(A(end));
    t.snap(`把堆頂最大值 ${t.a[A(end)]} 換到位置 ${A(end)}`, { [A(0)]: 'swap' }, 4, {}, extra(end, { [A(0)]: 'swap' }));
    sift(0, end, 5);
  }
  t.done.add(A(0));
  return t;
}

const heap: AlgoDef = {
  id: 'heap-sort', name: '堆積排序', en: 'Heap Sort', cat, star: true,
  desc: '先把陣列建成最大堆積，再反覆把堆頂（最大值）與最後一個元素交換、縮小堆積並下沉調整。原地排序但不穩定。',
  time: 'O(n log n)', space: 'O(1)',
  code: ['buildMaxHeap:', '  for i = n/2-1 .. 0: siftDown(i, n)', 'for end = n-1 .. 1:', '  swap(a[0], a[end])', '  siftDown(0, end)', 'siftDown(i): 與較大子節點交換直到滿足堆積性質'],
  inputs: [inArr(DEF.slice(0, 12), '陣列', 13)],
  run({ arr }) {
    return heapSortRun(arr).finish();
  },
};

const tim: AlgoDef = {
  id: 'timsort', name: '提姆排序', en: 'TimSort', cat,
  desc: 'Python、Java 採用的混合排序：先把陣列切成長度 minrun 的區段，每段用插入排序，再像合併排序般兩兩合併。（此處為教學用簡化版，未含 galloping 模式。）',
  time: 'O(n log n)，最佳 O(n)', space: 'O(n)',
  code: ['RUN = minrun', 'for 每個長度 RUN 的區段:', '  insertionSort(區段)', 'size = RUN', 'while size < n:', '  兩兩合併相鄰的區段', '  size = size * 2'],
  inputs: [inArr([38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23], '陣列', 20), { key: 'run', label: 'minrun', type: 'number', default: 4, min: 2, max: 16 }],
  run({ arr, run }) {
    const t = new SortTracer(arr);
    const n = t.a.length;
    const runs: { from: number; to: number; color?: any; label?: string }[] = [];
    for (let s = 0; s < n; s += run) runs.push({ from: s, to: Math.min(n - 1, s + run - 1), color: 'frontier', label: 'run' });
    t.snap(`切成 ${runs.length} 個 run（長度 ${run}）`, {}, 1, {}, [], runs);
    for (const rg of runs) {
      for (let i = rg.from + 1; i <= rg.to; i++) {
        const key = t.a[i];
        let j = i - 1;
        while (j >= rg.from && (t.cmp++, t.a[j] > key)) {
          t.set(j + 1, t.a[j]);
          j--;
        }
        t.a[j + 1] = key;
        t.snap(`插入排序 run [${rg.from}..${rg.to}]：插入 ${key}`, { ...range(rg.from, rg.to, 'active'), [j + 1]: 'swap' }, 3, {}, [], runs);
      }
    }
    for (let size = run; size < n; size *= 2) {
      t.extraVars = { size };
      t.snap(`合併長度 ${size} 的相鄰區段`, {}, 5);
      for (let lo = 0; lo < n - size; lo += 2 * size) {
        const mid = lo + size - 1, hi = Math.min(lo + 2 * size - 1, n - 1);
        const L = t.a.slice(lo, mid + 1), R = t.a.slice(mid + 1, hi + 1);
        let i = 0, j = 0;
        for (let k = lo; k <= hi; k++) {
          if (j >= R.length || (i < L.length && (t.cmp++, L[i] <= R[j]))) t.set(k, L[i++]);
          else t.set(k, R[j++]);
          t.snap(`合併 [${lo}..${mid}] 與 [${mid + 1}..${hi}]：寫入 a[${k}]`, { ...range(lo, hi, 'active'), ...range(lo, k - 1, 'visited'), [k]: 'swap' }, 6, { k }, [], [{ from: lo, to: mid, color: 'active', label: 'A' }, { from: mid + 1, to: hi, color: 'frontier', label: 'B' }]);
        }
      }
    }
    t.extraVars = {};
    return t.finish();
  },
};

const intro: AlgoDef = {
  id: 'introsort', name: '內省排序', en: 'Introsort', cat,
  desc: 'C++ std::sort 採用的混合排序：以快速排序為主，遞迴深度超過 2·log₂n 時改用堆積排序避免 O(n²)，區間很小時改用插入排序。',
  time: 'O(n log n)', space: 'O(log n)',
  code: ['introsort(lo, hi, depth):', '  if hi - lo + 1 <= 小區間門檻:', '    insertionSort(lo, hi); return', '  if depth == 0:', '    heapSort(lo, hi); return', '  p = partition(lo, hi)  (三數取中)', '  introsort(lo, p-1, depth-1)', '  introsort(p+1, hi, depth-1)'],
  inputs: [inArr([38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23, 50, 8], '陣列', 20), { key: 'small', label: '小區間門檻', type: 'number', default: 4, min: 1, max: 16 }, { key: 'depth', label: '深度上限（0 = 2·log₂n）', type: 'number', default: 2, min: 0, max: 20 }],
  run({ arr, small, depth }) {
    const t = new SortTracer(arr);
    const n = t.a.length;
    const maxD = depth || 2 * Math.floor(Math.log2(Math.max(2, n)));
    const rec = (lo: number, hi: number, d: number) => {
      if (lo > hi) return;
      t.extraVars = { depth: d };
      if (hi - lo + 1 <= small) {
        t.snap(`區間 [${lo}..${hi}] 很小，改用插入排序`, range(lo, hi, 'frontier'), 3);
        for (let i = lo + 1; i <= hi; i++) {
          const key = t.a[i];
          let j = i - 1;
          while (j >= lo && (t.cmp++, t.a[j] > key)) { t.set(j + 1, t.a[j]); j--; }
          t.a[j + 1] = key;
          t.snap(`插入 ${key}`, { ...range(lo, hi, 'frontier'), [j + 1]: 'swap' }, 3);
        }
        for (let i = lo; i <= hi; i++) t.done.add(i);
        return;
      }
      if (d === 0) {
        t.snap(`遞迴深度用盡，區間 [${lo}..${hi}] 改用堆積排序`, range(lo, hi, 'special'), 5);
        heapSortRun([], t, lo, hi, false);
        return;
      }
      const m = (lo + hi) >> 1;
      // 三數取中，把中位數放到 hi 作為 pivot
      const trio = [lo, m, hi].sort((x, y) => t.a[x] - t.a[y]);
      t.cmp += 3;
      t.snap(`三數取中：a[${lo}]=${t.a[lo]}, a[${m}]=${t.a[m]}, a[${hi}]=${t.a[hi]} → pivot ${t.a[trio[1]]}`, { [lo]: 'compare', [m]: 'compare', [hi]: 'compare' }, 6);
      t.swap(trio[1], hi);
      const pv = t.a[hi];
      let i = lo;
      for (let j = lo; j < hi; j++) {
        t.cmp++;
        if (t.a[j] < pv) { t.swap(i, j); i++; }
        t.snap(`分割：a[${j}] 與 pivot ${pv} 比較`, { ...range(lo, i - 1, 'visited'), [hi]: 'special', [j]: 'compare' }, 6, { i, j });
      }
      t.swap(i, hi);
      t.done.add(i);
      t.snap(`pivot ${pv} 就定位於 ${i}`, { [i]: 'swap' }, 6);
      rec(lo, i - 1, d - 1);
      rec(i + 1, hi, d - 1);
    };
    t.snap(`深度上限 = ${maxD}`, {}, 1);
    rec(0, n - 1, maxD);
    t.extraVars = {};
    return t.finish();
  },
};

const treeSort: AlgoDef = {
  id: 'tree-sort', name: '樹排序', en: 'Tree Sort', cat,
  desc: '把所有元素依序插入二元搜尋樹，再做中序走訪即得到排序結果。樹不平衡時（例如輸入已排序）會退化成 O(n²)。',
  time: '平均 O(n log n)，最差 O(n²)', space: 'O(n)',
  code: ['root = null', 'for x in a: root = insert(root, x)', 'inorder(root):', '  inorder(left)', '  output.append(node.val)', '  inorder(right)'],
  inputs: [inArr([50, 30, 70, 20, 40, 60, 80, 35, 65, 10, 45], '陣列', 11)],
  run({ arr }) {
    const t = new SortTracer(arr);
    let root: BNode | null = null;
    let id = 0;
    const tp = (hl: BNode | null, done: Set<BNode> = new Set(), path: Set<BNode> = new Set()) =>
      binaryPanel(root, { color: (x) => (x === hl ? 'active' : done.has(x) ? 'done' : path.has(x) ? 'compare' : undefined), title: '二元搜尋樹' });
    for (let k = 0; k < arr.length; k++) {
      const v = arr[k];
      const node: BNode = { id: id++, val: v, left: null, right: null };
      const path = new Set<BNode>();
      if (!root) root = node;
      else {
        let cur = root;
        for (;;) {
          path.add(cur);
          t.cmp++;
          if (v < (cur.val as number)) { if (!cur.left) { cur.left = node; break; } cur = cur.left; }
          else { if (!cur.right) { cur.right = node; break; } cur = cur.right; }
        }
      }
      t.snap(`插入 ${v}`, { [k]: 'active' }, 2, {}, [tp(node, new Set(), path)]);
    }
    const out: number[] = [];
    const done = new Set<BNode>();
    const ino = (n: BNode | null) => {
      if (!n) return;
      ino(n.left);
      out.push(n.val as number);
      done.add(n);
      t.set(out.length - 1, n.val as number);
      t.done.add(out.length - 1);
      t.snap(`中序走訪輸出 ${n.val}`, { [out.length - 1]: 'swap' }, 5, {}, [tp(n, done)]);
      ino(n.right);
    };
    ino(root);
    return t.finish();
  },
};

export default [merge, quick, heap, tim, intro, treeSort];
