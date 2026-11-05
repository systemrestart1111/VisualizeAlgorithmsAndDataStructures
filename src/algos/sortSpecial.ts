import type { AlgoDef, CMap } from '../core/types';
import { inArr, cells, table, range } from '../core/helpers';
import { SortTracer } from '../core/sortTracer';

const cat = 'sort-special';

const counting: AlgoDef = {
  id: 'counting-sort', name: '計數排序', en: 'Counting Sort', cat, star: true,
  desc: '統計每個值出現的次數，做前綴和得到每個值的最終位置，再由後往前放回（保持穩定）。適合值域 k 不大的整數。',
  time: 'O(n + k)', space: 'O(n + k)',
  code: ['count[0..k] = 0', 'for x in a: count[x]++', 'for v = 1 .. k: count[v] += count[v-1]', 'for i = n-1 .. 0:', '  count[a[i]]--', '  out[count[a[i]]] = a[i]'],
  inputs: [inArr([4, 2, 7, 1, 4, 9, 3, 2, 7, 0, 5, 4, 8, 1], '陣列（0~15 的整數）', 14, 0, 12)],
  run({ arr }) {
    const a = arr.map((x: number) => Math.max(0, Math.min(30, Math.round(x))));
    const t = new SortTracer(a);
    const k = Math.max(...a);
    const cnt = new Array(k + 1).fill(0);
    const out: (number | null)[] = new Array(a.length).fill(null);
    const P = (cc: CMap = {}, oc: CMap = {}) => [cells(cnt, cc, { title: 'count[v]' }), cells(out, oc, { title: '輸出陣列 out' })];
    t.snap(`建立 count 陣列，大小 k+1 = ${k + 1}`, {}, 1, {}, P());
    for (let i = 0; i < a.length; i++) {
      cnt[a[i]]++;
      t.snap(`a[${i}] = ${a[i]}，count[${a[i]}]++`, { [i]: 'active' }, 2, { i }, P({ [a[i]]: 'swap' }));
    }
    for (let v = 1; v <= k; v++) {
      cnt[v] += cnt[v - 1];
      t.snap(`前綴和：count[${v}] += count[${v - 1}] → ${cnt[v]}`, {}, 3, {}, P({ [v]: 'swap', [v - 1]: 'compare' }));
    }
    for (let i = a.length - 1; i >= 0; i--) {
      cnt[a[i]]--;
      out[cnt[a[i]]] = a[i];
      t.snap(`a[${i}] = ${a[i]} 放到 out[${cnt[a[i]]}]`, { [i]: 'active' }, 6, { i }, P({ [a[i]]: 'swap' }, { [cnt[a[i]]]: 'swap' }));
    }
    for (let i = 0; i < a.length; i++) t.a[i] = out[i]!;
    return t.finish('把 out 複製回原陣列，排序完成');
  },
};

const radix: AlgoDef = {
  id: 'radix-sort', name: '基數排序', en: 'Radix Sort (LSD)', cat, star: true,
  desc: '從最低位數開始，依每一位數字把元素穩定地分配到 10 個桶子，再依序收集；處理完最高位即完成排序。',
  time: 'O(d · (n + b))', space: 'O(n + b)',
  code: ['for exp = 1, 10, 100, ... (≤ max):', '  buckets[0..9] = []', '  for x in a: buckets[(x / exp) % 10].push(x)', '  a = concat(buckets[0..9])'],
  inputs: [inArr([170, 45, 75, 90, 802, 24, 2, 66, 431, 318, 59, 7], '陣列（非負整數）', 12, 1, 999)],
  run({ arr }) {
    const t = new SortTracer(arr.map((x: number) => Math.abs(Math.round(x))));
    const mx = Math.max(...t.a);
    const bk = (b: number[][], hl = -1) => {
      const h = Math.max(1, ...b.map((x) => x.length));
      const rows = Array.from({ length: h }, (_, r) => b.map((x) => x[r] ?? ''));
      const c: Record<string, any> = {};
      if (hl >= 0) c[`${b[hl].length - 1},${hl}`] = 'swap';
      return table(rows, c, { colHeaders: b.map((_, i) => '桶 ' + i), title: '桶子' });
    };
    for (let exp = 1; Math.floor(mx / exp) > 0; exp *= 10) {
      const b: number[][] = Array.from({ length: 10 }, () => []);
      t.extraVars = { exp };
      t.snap(`依第 ${String(exp).length} 位（exp = ${exp}）分配`, {}, 1, {}, [bk(b)]);
      for (let i = 0; i < t.a.length; i++) {
        const d = Math.floor(t.a[i] / exp) % 10;
        b[d].push(t.a[i]);
        t.snap(`${t.a[i]} 的該位數字是 ${d}，放進桶 ${d}`, { [i]: 'active' }, 3, { i }, [bk(b, d)]);
      }
      let k = 0;
      for (let d = 0; d < 10; d++)
        for (const x of b[d]) {
          t.set(k, x);
          t.snap(`從桶 ${d} 收集 ${x} → a[${k}]`, { [k]: 'swap' }, 4, { k }, [bk(b)]);
          k++;
        }
    }
    t.extraVars = {};
    return t.finish();
  },
};

const bucket: AlgoDef = {
  id: 'bucket-sort', name: '桶排序', en: 'Bucket Sort', cat,
  desc: '依值域把元素分到若干個桶，每個桶各自排序（此處用插入排序），最後依序串接。資料均勻分布時接近線性時間。',
  time: '平均 O(n + k)，最差 O(n²)', space: 'O(n + k)',
  code: ['建立 k 個空桶', 'for x in a:', '  buckets[floor(k · (x - min) / (max - min + 1))].push(x)', 'for 每個桶: insertionSort(桶)', '依序串接所有桶'],
  inputs: [inArr([29, 25, 3, 49, 9, 37, 21, 43, 12, 33, 6, 41, 17, 48], '陣列', 14), { key: 'k', label: '桶數', type: 'number', default: 5, min: 2, max: 10 }],
  run({ arr, k }) {
    const t = new SortTracer(arr);
    const mn = Math.min(...t.a), mx = Math.max(...t.a);
    const b: number[][] = Array.from({ length: k }, () => []);
    const bk = (hl: CMap = {}) => {
      const h = Math.max(1, ...b.map((x) => x.length));
      const c: Record<string, any> = {};
      for (const key in hl) c[key] = hl[key];
      return table(Array.from({ length: h }, (_, r) => b.map((x) => x[r] ?? '')), c, {
        colHeaders: b.map((_, i) => `[${Math.ceil(mn + ((mx - mn + 1) * i) / k)}, ${Math.ceil(mn + ((mx - mn + 1) * (i + 1)) / k) - 1}]`),
        title: '桶子（括號為值域）',
      });
    };
    t.snap(`建立 ${k} 個桶`, {}, 1, {}, [bk()]);
    for (let i = 0; i < t.a.length; i++) {
      const d = Math.min(k - 1, Math.floor((k * (t.a[i] - mn)) / (mx - mn + 1)));
      b[d].push(t.a[i]);
      t.snap(`${t.a[i]} 放入桶 ${d}`, { [i]: 'active' }, 3, { i }, [bk({ [`${b[d].length - 1},${d}`]: 'swap' })]);
    }
    for (let d = 0; d < k; d++) {
      const x = b[d];
      for (let i = 1; i < x.length; i++) {
        const key = x[i];
        let j = i - 1;
        while (j >= 0 && (t.cmp++, x[j] > key)) { x[j + 1] = x[j]; j--; }
        x[j + 1] = key;
      }
      if (x.length) t.snap(`桶 ${d} 內部插入排序 → [${x.join(', ')}]`, {}, 4, {}, [bk(Object.fromEntries(x.map((_, r) => [`${r},${d}`, 'done'])))]);
    }
    let p = 0;
    for (let d = 0; d < k; d++)
      for (const v of b[d]) {
        t.set(p, v);
        t.snap(`串接：a[${p}] = ${v}`, { [p]: 'swap' }, 5, { p }, [bk()]);
        p++;
      }
    return t.finish();
  },
};

const external: AlgoDef = {
  id: 'external-merge-sort', name: '外部合併排序', en: 'External Merge Sort', cat,
  desc: '資料量大於記憶體時使用：先每次讀入 M 筆在記憶體內排序，寫成一個「已排序區段（run）」到磁碟；再用 k 路合併（以最小堆積選出最小值）把所有 run 合併成一個檔案。',
  time: 'O(n log n)，磁碟 I/O 約 O((n/B) log_{M/B}(n/B))', space: 'O(M)',
  code: ['階段一：產生 runs', '  while 輸入未讀完:', '    讀入 M 筆到記憶體並排序', '    寫出成一個 run', '階段二：k 路合併', '  每個 run 取第一筆放入最小堆積', '  重複：取出最小值寫到輸出，', '        再從該 run 補一筆'],
  inputs: [inArr([41, 7, 63, 22, 88, 15, 34, 70, 2, 56, 29, 93, 11, 47, 80, 38, 5, 66], '磁碟上的資料', 18), { key: 'm', label: '記憶體容量 M', type: 'number', default: 4, min: 2, max: 10 }],
  run({ arr, m }) {
    const t = new SortTracer(arr);
    const disk = [...arr];
    const runs: number[][] = [];
    const ptr: number[] = [];
    const out: number[] = [];
    let mem: number[] = [];
    const panels = (memC: CMap = {}, runC: Record<string, any> = {}) => {
      const h = Math.max(1, ...runs.map((r) => r.length));
      return [
        cells(mem, memC, { title: `記憶體（容量 ${m}）`, w: 'half' }),
        cells(out, {}, { title: '輸出檔', w: 'half' }),
        table(Array.from({ length: h }, (_, r) => runs.map((x) => x[r] ?? '')), runC, { colHeaders: runs.map((_, i) => 'run ' + i), title: '磁碟上的已排序區段' }),
      ];
    };
    t.r.snap('原始資料存在磁碟上', [cells(disk, {}, { title: '磁碟輸入檔' }), ...panels()], 1);
    for (let s = 0; s < disk.length; s += m) {
      mem = disk.slice(s, s + m);
      t.r.snap(`讀入第 ${s}~${Math.min(disk.length, s + m) - 1} 筆到記憶體`, [cells(disk, range(s, s + m - 1, 'active'), { title: '磁碟輸入檔' }), ...panels()], 3);
      mem.sort((x, y) => x - y);
      t.r.snap('在記憶體內排序', [cells(disk, range(s, s + m - 1, 'active'), { title: '磁碟輸入檔' }), ...panels(range(0, mem.length - 1, 'done'))], 3);
      runs.push([...mem]);
      ptr.push(0);
      mem = [];
      t.r.snap(`寫出成 run ${runs.length - 1}`, [cells(disk, range(0, s + m - 1, 'muted'), { title: '磁碟輸入檔' }), ...panels({}, Object.fromEntries(runs[runs.length - 1].map((_, r) => [`${r},${runs.length - 1}`, 'done'])))], 4);
    }
    const runC = () => {
      const c: Record<string, any> = {};
      runs.forEach((r, i) => {
        for (let k = 0; k < ptr[i]; k++) c[`${k},${i}`] = 'muted';
        if (ptr[i] < r.length) c[`${ptr[i]},${i}`] = 'frontier';
      });
      return c;
    };
    t.r.snap(`開始 ${runs.length} 路合併：每個 run 的第一筆是候選者`, [...panels({}, runC())], 6);
    while (out.length < disk.length) {
      let best = -1;
      for (let i = 0; i < runs.length; i++) if (ptr[i] < runs[i].length && (best < 0 || runs[i][ptr[i]] < runs[best][ptr[best]])) best = i;
      mem = runs.map((r, i) => (ptr[i] < r.length ? r[ptr[i]] : NaN)).filter((x) => !Number.isNaN(x));
      const v = runs[best][ptr[best]];
      const c = runC();
      c[`${ptr[best]},${best}`] = 'swap';
      out.push(v);
      t.r.snap(`候選者中最小值為 ${v}（來自 run ${best}），寫到輸出`, [...panels({ [mem.indexOf(v)]: 'swap' }, c)], 7);
      ptr[best]++;
    }
    t.a = out;
    return t.finish('全部合併完成');
  },
};

const pow2 = (n: number) => 1 << Math.ceil(Math.log2(Math.max(2, n)));

const bitonic: AlgoDef = {
  id: 'bitonic-sort', name: '雙調排序', en: 'Bitonic Sort', cat,
  desc: '平行排序網路：先遞迴產生「雙調序列」（先升後降），再以比較器網路合併。所有比較位置與資料無關，適合 GPU／硬體實作。長度需為 2 的冪，不足時以最大值補齊。',
  time: 'O(n log² n) 次比較，平行深度 O(log² n)', space: 'O(1)',
  code: ['for k = 2, 4, 8, ..., n:', '  for j = k/2, k/4, ..., 1:', '    for i = 0 .. n-1 (可平行):', '      l = i XOR j', '      if l > i:', '        升序區塊 (i & k == 0)：a[i] > a[l] 則交換', '        降序區塊：a[i] < a[l] 則交換'],
  inputs: [inArr([38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14], '陣列', 16)],
  run({ arr }) {
    const n = pow2(arr.length);
    const pad = [...arr];
    const mx = Math.max(...arr);
    while (pad.length < n) pad.push(mx);
    const t = new SortTracer(pad);
    if (n !== arr.length) t.snap(`長度 ${arr.length} 不是 2 的冪，以 ${mx} 補到 ${n}`);
    for (let k = 2; k <= n; k <<= 1)
      for (let j = k >> 1; j > 0; j >>= 1) {
        t.extraVars = { k, j };
        const pairs: [number, number, boolean][] = [];
        for (let i = 0; i < n; i++) {
          const l = i ^ j;
          if (l > i) pairs.push([i, l, (i & k) === 0]);
        }
        const c: CMap = {};
        for (const [i, l, up] of pairs) { c[i] = up ? 'active' : 'special'; c[l] = up ? 'active' : 'special'; }
        t.snap(`階段 k=${k}, j=${j}：${pairs.length} 個比較器同時運作（藍=升序、粉=降序）`, c, 3);
        const sw: CMap = {};
        for (const [i, l, up] of pairs) {
          t.cmp++;
          if (up ? t.a[i] > t.a[l] : t.a[i] < t.a[l]) { t.swap(i, l); sw[i] = 'swap'; sw[l] = 'swap'; }
        }
        t.snap('交換完成', sw, Object.keys(sw).length ? 6 : 5);
      }
    t.extraVars = {};
    return t.finish();
  },
};

const oddEven: AlgoDef = {
  id: 'odd-even-sort', name: '奇偶換位排序', en: 'Odd–Even Transposition Sort', cat,
  desc: '平行版氣泡排序：奇數階段比較所有 (1,2),(3,4)… 對，偶數階段比較 (0,1),(2,3)… 對；同一階段的比較互不重疊可同時進行，n 個階段後必定有序。',
  time: 'O(n²) 次比較，平行 O(n) 步', space: 'O(1)',
  code: ['for phase = 0 .. n-1:', '  start = phase % 2', '  for i = start, start+2, ... (可平行):', '    if a[i] > a[i+1]: swap'],
  inputs: [inArr([38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72], '陣列', 12)],
  run({ arr }) {
    const t = new SortTracer(arr);
    const n = t.a.length;
    for (let ph = 0; ph < n; ph++) {
      const s = ph % 2;
      const c: CMap = {};
      for (let i = s; i + 1 < n; i += 2) { c[i] = 'compare'; c[i + 1] = 'compare'; }
      t.extraVars = { phase: ph };
      t.snap(`階段 ${ph}（${s ? '奇' : '偶'}數對）：同時比較相鄰的配對`, c, 3);
      const sw: CMap = {};
      for (let i = s; i + 1 < n; i += 2) {
        if (t.less(i + 1, i)) { t.swap(i, i + 1); sw[i] = 'swap'; sw[i + 1] = 'swap'; }
      }
      t.snap(Object.keys(sw).length ? '交換逆序的配對' : '本階段無交換', sw, 4);
    }
    t.extraVars = {};
    return t.finish();
  },
};

export default [counting, radix, bucket, external, bitonic, oddEven];
