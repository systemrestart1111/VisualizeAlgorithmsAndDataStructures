import type { AlgoDef } from '../core/types';
import { inArr } from '../core/helpers';
import { SortTracer } from '../core/sortTracer';

const cat = 'sort-basic';
const DEF = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72];
const input = () => [inArr(DEF, '陣列', 14)];

const bubble: AlgoDef = {
  id: 'bubble-sort', name: '氣泡排序', en: 'Bubble Sort', cat, star: true,
  desc: '重複走訪陣列，相鄰兩元素順序錯誤就交換；每一輪會把最大的元素「浮」到最後。若一輪沒有交換即可提早結束。',
  time: 'O(n²)，最佳 O(n)', space: 'O(1)',
  code: ['for i = 0 .. n-2:', '  swapped = false', '  for j = 0 .. n-2-i:', '    if a[j] > a[j+1]:', '      swap(a[j], a[j+1])', '      swapped = true', '  if not swapped: break'],
  inputs: input(),
  run({ arr }) {
    const t = new SortTracer(arr);
    const n = t.a.length;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      t.snap(`第 ${i + 1} 輪`, {}, 1, { i: n - 1 - i });
      for (let j = 0; j < n - 1 - i; j++) {
        t.snap(`比較 a[${j}]=${t.a[j]} 與 a[${j + 1}]=${t.a[j + 1]}`, { [j]: 'compare', [j + 1]: 'compare' }, 4, { j });
        if (t.less(j + 1, j)) {
          t.swap(j, j + 1);
          swapped = true;
          t.snap(`交換 → ${t.a[j]}, ${t.a[j + 1]}`, { [j]: 'swap', [j + 1]: 'swap' }, 5, { j });
        }
      }
      t.done.add(n - 1 - i);
      if (!swapped) {
        t.snap('這一輪沒有交換，陣列已排序，提早結束', {}, 7);
        break;
      }
    }
    return t.finish();
  },
};

const selection: AlgoDef = {
  id: 'selection-sort', name: '選擇排序', en: 'Selection Sort', cat, star: true,
  desc: '每一輪在未排序區找出最小值，與未排序區的第一個元素交換。交換次數最多 n−1 次。',
  time: 'O(n²)', space: 'O(1)',
  code: ['for i = 0 .. n-2:', '  min = i', '  for j = i+1 .. n-1:', '    if a[j] < a[min]:', '      min = j', '  swap(a[i], a[min])'],
  inputs: input(),
  run({ arr }) {
    const t = new SortTracer(arr);
    const n = t.a.length;
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      t.snap(`從位置 ${i} 開始找最小值，暫定 min = ${i}`, { [i]: 'active' }, 2, { i, min: m });
      for (let j = i + 1; j < n; j++) {
        t.snap(`比較 a[${j}]=${t.a[j]} 與目前最小 a[${m}]=${t.a[m]}`, { [m]: 'active', [j]: 'compare' }, 4, { i, j, min: m });
        if (t.less(j, m)) {
          m = j;
          t.snap(`更新 min = ${j}`, { [m]: 'active' }, 5, { i, j, min: m });
        }
      }
      if (m !== i) t.swap(i, m);
      t.done.add(i);
      t.snap(`把最小值 ${t.a[i]} 放到位置 ${i}`, { [i]: 'swap', [m]: 'swap' }, 6, { i, min: m });
    }
    return t.finish();
  },
};

const insertion: AlgoDef = {
  id: 'insertion-sort', name: '插入排序', en: 'Insertion Sort', cat, star: true,
  desc: '把陣列分成已排序與未排序兩部分，每次取出未排序區第一個元素，往左找到正確位置插入。對近乎有序的資料非常快。',
  time: 'O(n²)，最佳 O(n)', space: 'O(1)',
  code: ['for i = 1 .. n-1:', '  key = a[i], j = i - 1', '  while j >= 0 and a[j] > key:', '    a[j+1] = a[j]', '    j = j - 1', '  a[j+1] = key'],
  inputs: input(),
  run({ arr }) {
    const t = new SortTracer(arr);
    const n = t.a.length;
    const sortedTo = (k: number) => Object.fromEntries(Array.from({ length: k + 1 }, (_, i) => [i, 'done' as const]));
    for (let i = 1; i < n; i++) {
      const key = t.a[i];
      let j = i - 1;
      t.extraVars = { key };
      t.snap(`取出 key = ${key}`, { ...sortedTo(i - 1), [i]: 'active' }, 2, { i, j });
      while (j >= 0) {
        t.cmp++;
        t.snap(`比較 a[${j}]=${t.a[j]} > key=${key}?`, { ...sortedTo(i), [j]: 'compare', [j + 1]: 'active' }, 3, { j });
        if (t.a[j] <= key) break;
        t.set(j + 1, t.a[j]);
        t.a[j] = key;
        t.snap(`${t.a[j + 1]} 右移一格`, { ...sortedTo(i), [j + 1]: 'swap', [j]: 'active' }, 4, { j });
        j--;
      }
      t.a[j + 1] = key;
      t.snap(`把 key = ${key} 放在位置 ${j + 1}`, { ...sortedTo(i), [j + 1]: 'swap' }, 6, { i });
    }
    t.extraVars = {};
    return t.finish();
  },
};

const shell: AlgoDef = {
  id: 'shell-sort', name: '希爾排序', en: 'Shell Sort', cat,
  desc: '插入排序的推廣：先以較大間隔 gap 對子序列做插入排序，再逐步縮小 gap 至 1。讓元素能快速移動到遠處。',
  time: '約 O(n^1.3)，依 gap 序列而定', space: 'O(1)',
  code: ['gap = n / 2', 'while gap > 0:', '  for i = gap .. n-1:', '    tmp = a[i], j = i', '    while j >= gap and a[j-gap] > tmp:', '      a[j] = a[j-gap]; j -= gap', '    a[j] = tmp', '  gap = gap / 2'],
  inputs: input(),
  run({ arr }) {
    const t = new SortTracer(arr);
    const n = t.a.length;
    for (let gap = n >> 1; gap > 0; gap >>= 1) {
      t.extraVars = { gap };
      t.snap(`gap = ${gap}`, {}, 2);
      for (let i = gap; i < n; i++) {
        const tmp = t.a[i];
        let j = i;
        t.snap(`取 a[${i}] = ${tmp}，與相隔 ${gap} 的元素比較`, { [i]: 'active' }, 4, { i });
        while (j >= gap) {
          t.cmp++;
          t.snap(`比較 a[${j - gap}]=${t.a[j - gap]} 與 ${tmp}`, { [j - gap]: 'compare', [j]: 'active' }, 5, { j, 'j-gap': j - gap });
          if (t.a[j - gap] <= tmp) break;
          t.set(j, t.a[j - gap]);
          t.a[j - gap] = tmp;
          t.snap(`${t.a[j]} 往後移 ${gap} 格`, { [j]: 'swap', [j - gap]: 'active' }, 6, { j });
          j -= gap;
        }
        t.a[j] = tmp;
      }
    }
    t.extraVars = {};
    return t.finish();
  },
};

const cocktail: AlgoDef = {
  id: 'cocktail-sort', name: '雞尾酒排序', en: 'Cocktail Shaker Sort', cat,
  desc: '雙向氣泡排序：先由左到右把最大值推到右端，再由右到左把最小值推到左端，交替進行。',
  time: 'O(n²)', space: 'O(1)',
  code: ['lo = 0, hi = n - 1', 'while lo < hi:', '  for j = lo .. hi-1: 若 a[j] > a[j+1] 交換', '  hi = hi - 1', '  for j = hi .. lo+1 (反向): 若 a[j-1] > a[j] 交換', '  lo = lo + 1', '  若整輪沒交換則結束'],
  inputs: input(),
  run({ arr }) {
    const t = new SortTracer(arr);
    let lo = 0, hi = t.a.length - 1;
    while (lo < hi) {
      let sw = false;
      for (let j = lo; j < hi; j++) {
        t.snap(`→ 比較 a[${j}], a[${j + 1}]`, { [j]: 'compare', [j + 1]: 'compare' }, 3, { lo, hi, j });
        if (t.less(j + 1, j)) {
          t.swap(j, j + 1);
          sw = true;
          t.snap('交換', { [j]: 'swap', [j + 1]: 'swap' }, 3, { lo, hi, j });
        }
      }
      t.done.add(hi);
      hi--;
      for (let j = hi; j > lo; j--) {
        t.snap(`← 比較 a[${j - 1}], a[${j}]`, { [j]: 'compare', [j - 1]: 'compare' }, 5, { lo, hi, j });
        if (t.less(j, j - 1)) {
          t.swap(j, j - 1);
          sw = true;
          t.snap('交換', { [j]: 'swap', [j - 1]: 'swap' }, 5, { lo, hi, j });
        }
      }
      t.done.add(lo);
      lo++;
      if (!sw) {
        t.snap('整輪沒有交換，結束', {}, 7);
        break;
      }
    }
    return t.finish();
  },
};

const comb: AlgoDef = {
  id: 'comb-sort', name: '梳排序', en: 'Comb Sort', cat,
  desc: '改良氣泡排序：比較相距 gap 的元素，gap 每輪除以 1.3，直到 gap = 1 且沒有交換為止。可消除氣泡排序中移動緩慢的「烏龜」。',
  time: '平均 O(n²/2^p)，最差 O(n²)', space: 'O(1)',
  code: ['gap = n, sorted = false', 'while not sorted:', '  gap = floor(gap / 1.3)', '  if gap <= 1: gap = 1; sorted = true', '  for i = 0 .. n-1-gap:', '    if a[i] > a[i+gap]:', '      swap; sorted = false'],
  inputs: input(),
  run({ arr }) {
    const t = new SortTracer(arr);
    const n = t.a.length;
    let gap = n, sorted = false;
    while (!sorted) {
      gap = Math.floor(gap / 1.3);
      if (gap <= 1) { gap = 1; sorted = true; }
      t.extraVars = { gap };
      t.snap(`gap = ${gap}`, {}, 3);
      for (let i = 0; i + gap < n; i++) {
        t.snap(`比較 a[${i}] 與 a[${i + gap}]`, { [i]: 'compare', [i + gap]: 'compare' }, 6, { i, 'i+gap': i + gap });
        if (t.less(i + gap, i)) {
          t.swap(i, i + gap);
          sorted = false;
          t.snap('交換', { [i]: 'swap', [i + gap]: 'swap' }, 7, { i, 'i+gap': i + gap });
        }
      }
    }
    t.extraVars = {};
    return t.finish();
  },
};

const gnome: AlgoDef = {
  id: 'gnome-sort', name: '侏儒排序', en: 'Gnome Sort', cat,
  desc: '像花園侏儒排花盆：若目前與前一個順序正確就往前走，否則交換並往後退一步。概念類似插入排序，只用一個索引。',
  time: 'O(n²)', space: 'O(1)',
  code: ['i = 0', 'while i < n:', '  if i == 0 or a[i-1] <= a[i]:', '    i = i + 1', '  else:', '    swap(a[i], a[i-1])', '    i = i - 1'],
  inputs: input(),
  run({ arr }) {
    const t = new SortTracer(arr);
    const n = t.a.length;
    let i = 0;
    while (i < n) {
      if (i === 0) {
        t.snap('i = 0，前進', { [i]: 'active' }, 4, { i });
        i++;
        continue;
      }
      t.snap(`比較 a[${i - 1}]=${t.a[i - 1]} 與 a[${i}]=${t.a[i]}`, { [i]: 'compare', [i - 1]: 'compare' }, 3, { i });
      if (!t.less(i, i - 1)) i++;
      else {
        t.swap(i, i - 1);
        t.snap('順序錯誤，交換並後退', { [i]: 'swap', [i - 1]: 'swap' }, 6, { i });
        i--;
      }
    }
    return t.finish();
  },
};

export default [bubble, selection, insertion, shell, cocktail, comb, gnome];
