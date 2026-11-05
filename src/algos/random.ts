import type { AlgoDef, Color, CMap } from '../core/types';
import { Rec, cells, vars, inArr, inNum, inSeed, seeded, range, bars } from '../core/helpers';
import { SortTracer, ptrs } from '../core/sortTracer';

const cat = 'random';

const fisher: AlgoDef = {
  id: 'fisher-yates', name: '費雪–葉茲洗牌', en: 'Fisher–Yates Shuffle', cat, star: true,
  desc: '由後往前，每一步從「尚未固定」的前段 [0, i] 中均勻隨機選一個位置 j，與 i 交換。每種排列出現的機率都恰好是 1/n!（常見錯誤是從整個陣列選 j，會造成偏差）。',
  time: 'O(n)', space: 'O(1)',
  code: ['for i = n-1 down to 1:', '  j = random(0, i)  (含兩端)', '  swap(a[i], a[j])'],
  inputs: [inArr([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], '陣列', 12), inSeed()],
  run({ arr, seed }) {
    const t = new SortTracer(arr);
    const rand = seeded(seed);
    for (let i = t.a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      t.snap(`從 [0, ${i}] 隨機選出 j = ${j}`, { ...range(0, i, 'frontier'), [j]: 'compare', [i]: 'active' }, 2, { i, j });
      t.swap(i, j);
      t.done.add(i);
      t.snap(`交換 a[${i}] 與 a[${j}]，位置 ${i} 固定`, { [i]: 'swap', [j]: 'swap' }, 3, { i, j });
    }
    t.done.add(0);
    t.snap('洗牌完成');
    // 偏差測試：n = 3 時統計 6000 次的排列分布
    const cnt: Record<string, number> = {}, cntBad: Record<string, number> = {};
    const R = seeded(seed + 1);
    for (let k = 0; k < 6000; k++) {
      const a = [1, 2, 3], b = [1, 2, 3];
      for (let i = 2; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      for (let i = 2; i >= 0; i--) { const j = Math.floor(R() * 3); [b[i], b[j]] = [b[j], b[i]]; }
      cnt[a.join('')] = (cnt[a.join('')] ?? 0) + 1;
      cntBad[b.join('')] = (cntBad[b.join('')] ?? 0) + 1;
    }
    const keys = ['123', '132', '213', '231', '312', '321'];
    t.r.snap('對 [1,2,3] 洗牌 6000 次：正確版每種排列約 1000 次；錯誤版（j 從整個陣列選）分布不均', [bars(keys.map((k) => cnt[k] ?? 0), {}, { labels: keys.map((k) => `${k}:${cnt[k] ?? 0}`), title: '正確 Fisher–Yates', w: 'half' }), bars(keys.map((k) => cntBad[k] ?? 0), Object.fromEntries(keys.map((_, i) => [i, 'bad'])), { labels: keys.map((k) => `${k}:${cntBad[k] ?? 0}`), title: '錯誤的天真洗牌', w: 'half' })]);
    return t.r.frames;
  },
};

const reservoir: AlgoDef = {
  id: 'reservoir-sampling', name: '蓄水池抽樣', en: 'Reservoir Sampling (Algorithm R)', cat,
  desc: '從長度未知的資料串流中均勻抽出 k 個樣本，只需 O(k) 記憶體：前 k 個直接放入；第 i 個（i ≥ k）以 k/(i+1) 的機率取代蓄水池中隨機一個位置。',
  time: 'O(n)', space: 'O(k)',
  code: ['res = stream 前 k 個', 'for i = k .. n-1:', '  j = random(0, i)', '  if j < k: res[j] = stream[i]', '（每個元素最終被選中的機率都是 k / n）'],
  inputs: [inArr([12, 45, 7, 33, 89, 21, 64, 3, 58, 90, 17, 76, 40, 5, 61], '資料串流', 15), inNum('k', '樣本數 k', 4, 1, 10), inSeed()],
  run({ arr, k, seed }) {
    const r = new Rec();
    const rand = seeded(seed);
    k = Math.min(k, arr.length);
    const res = arr.slice(0, k);
    const P = (i: number, c: CMap = {}, rc: CMap = {}) => [cells(arr, { ...range(0, i - 1, 'muted'), [i]: 'active', ...c }, { title: '資料串流', pointers: ptrs({ i }) }), cells(res, rc, { title: `蓄水池（大小 ${k}）`, w: 'half' })];
    r.snap(`前 ${k} 個直接放入蓄水池`, P(k - 1, range(0, k - 1, 'done'), range(0, k - 1, 'done')), 1);
    for (let i = k; i < arr.length; i++) {
      const j = Math.floor(rand() * (i + 1));
      if (j < k) { const old = res[j]; res[j] = arr[i]; r.snap(`i = ${i}：j = ${j} < ${k}（機率 ${k}/${i + 1}），用 ${arr[i]} 取代 ${old}`, [...P(i, {}, { [j]: 'swap' }), vars({ j, 機率: `${k}/${i + 1}` })], 4); }
      else r.snap(`i = ${i}：j = ${j} ≥ ${k}，略過 ${arr[i]}`, [...P(i, { [i]: 'bad' }), vars({ j, 機率: `${k}/${i + 1}` })], 3);
    }
    r.snap(`抽樣結果：${res.join(', ')}`, P(arr.length, {}, range(0, k - 1, 'done')), 5);
    return r.frames;
  },
};

const rqs: AlgoDef = {
  id: 'randomized-quickselect', name: '隨機化快速選擇', en: 'Randomized Quickselect', cat,
  desc: '每次隨機挑選 pivot（而不是固定取最後一個），使任何輸入的期望時間都是 O(n)，避免排序好的資料造成最差情況。',
  time: '期望 O(n)', space: 'O(1)',
  code: ['while lo < hi:', '  p = random(lo, hi); swap(a[p], a[hi])', '  m = partition(lo, hi)', '  if m == k: break', '  if k < m: hi = m - 1 else lo = m + 1', 'return a[k]'],
  inputs: [inArr([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], '陣列（預設已排序，固定 pivot 會退化）', 14), inNum('k', 'k（0 起算）', 3, 0, 30), inSeed()],
  run({ arr, k, seed }) {
    const t = new SortTracer(arr);
    const rand = seeded(seed);
    k = Math.min(k, t.a.length - 1);
    let lo = 0, hi = t.a.length - 1, rounds = 0;
    while (lo < hi) {
      rounds++;
      const p = lo + Math.floor(rand() * (hi - lo + 1));
      t.extraVars = { k, 輪數: rounds };
      t.snap(`隨機選 pivot 位置 ${p}（值 ${t.a[p]}），移到尾端`, { ...range(lo, hi, 'active'), [p]: 'special' }, 2, { lo, hi, p });
      t.swap(p, hi);
      const pv = t.a[hi];
      let i = lo;
      for (let j = lo; j < hi; j++) if (t.less(j, hi)) { t.swap(i, j); i++; }
      t.swap(i, hi);
      t.snap(`分割完成，pivot ${pv} 位於 ${i}`, { ...range(lo, i - 1, 'visited'), ...range(i + 1, hi, 'frontier'), [i]: 'swap' }, 3, { m: i, k });
      if (i === k) break;
      if (k < i) hi = i - 1; else lo = i + 1;
    }
    t.snap(`第 ${k} 小 = ${t.a[k]}（共 ${rounds} 輪）`, { [k]: 'done' }, 6, { k });
    return t.r.frames;
  },
};

const monte: AlgoDef = {
  id: 'monte-carlo-pi', name: '蒙地卡羅估算', en: 'Monte Carlo Estimation of π', cat,
  desc: '在邊長 2 的正方形內均勻撒點，落在內切單位圓內的比例 ≈ π/4，因此 π ≈ 4 × 圓內點數 / 總點數。誤差約以 1/√n 的速度下降。',
  time: 'O(n)', space: 'O(1)',
  code: ['inside = 0', 'repeat n 次:', '  x, y = uniform(-1, 1)', '  if x² + y² <= 1: inside++', 'π ≈ 4 · inside / n'],
  inputs: [inNum('n', '點數', 2000, 10, 20000), inSeed()],
  run({ n, seed }) {
    const r = new Rec();
    const rand = seeded(seed);
    const pts: { x: number; y: number; color: Color; r: number }[] = [];
    let inside = 0;
    const est: [number, number][] = [];
    const circle: [number, number][] = Array.from({ length: 101 }, (_, i) => [Math.cos((i / 50) * Math.PI), Math.sin((i / 50) * Math.PI)]);
    const batch = Math.max(1, Math.floor(n / 40));
    for (let i = 1; i <= n; i++) {
      const x = rand() * 2 - 1, y = rand() * 2 - 1;
      const inn = x * x + y * y <= 1;
      if (inn) inside++;
      if (pts.length < 4000) pts.push({ x, y, color: inn ? 'good' : 'bad', r: 2 });
      if (i % batch === 0 || i === n) {
        const pi = (4 * inside) / i;
        est.push([i, pi]);
        r.snap(`n = ${i}：π ≈ 4 × ${inside} / ${i} = ${pi.toFixed(5)}（誤差 ${Math.abs(pi - Math.PI).toFixed(5)}）`, [{ type: 'plot', bounds: [-1, 1, -1, 1], square: true, points: [...pts], curves: [{ pts: circle, color: 'active' }], w: 'half' }, { type: 'plot', bounds: [0, n, 2.6, 3.7], curves: [{ pts: [...est], color: 'path' }, { pts: [[0, Math.PI], [n, Math.PI]], color: 'muted' }], axes: true, title: '估計值收斂情形（灰線為真實 π）', w: 'half' }], 5);
      }
    }
    return r.frames;
  },
};

const walk: AlgoDef = {
  id: 'random-walk', name: '隨機漫步', en: 'Random Walk', cat,
  desc: '每一步隨機往上下左右（2D）或左右（1D）走一格。n 步後離原點的期望距離約為 √n——擴散、布朗運動與股價模型的基礎。',
  time: 'O(n)', space: 'O(n)',
  code: ['pos = (0, 0)', 'repeat n 次:', '  dir = 隨機選擇 {上, 下, 左, 右}', '  pos += dir', '記錄 |pos| 與 √步數 比較'],
  inputs: [inNum('n', '步數', 400, 10, 5000), { key: 'dim', label: '維度', type: 'select', default: '2', options: [{ value: '2', label: '2D 平面' }, { value: '1', label: '1D 直線（時間-位置圖）' }] }, inSeed()],
  run({ n, dim, seed }) {
    const r = new Rec();
    const rand = seeded(seed);
    let x = 0, y = 0;
    const path: [number, number][] = [[0, 0]];
    const batch = Math.max(1, Math.floor(n / 50));
    for (let i = 1; i <= n; i++) {
      if (dim === '1') { y += rand() < 0.5 ? 1 : -1; x = i; }
      else { const d = Math.floor(rand() * 4); if (d === 0) x++; else if (d === 1) x--; else if (d === 2) y++; else y--; }
      path.push([x, y]);
      if (i % batch === 0 || i === n) {
        const dist = dim === '1' ? Math.abs(y) : Math.hypot(x, y);
        r.snap(`第 ${i} 步：距離原點 ${dist.toFixed(2)}，√n = ${Math.sqrt(i).toFixed(2)}`, [{ type: 'plot', square: dim !== '1', axes: true, curves: [{ pts: [...path], color: 'active', width: 1.5 }, ...(dim === '1' ? [{ pts: Array.from({ length: 51 }, (_, k) => [(k / 50) * i, Math.sqrt((k / 50) * i)] as [number, number]), color: 'muted' as Color }, { pts: Array.from({ length: 51 }, (_, k) => [(k / 50) * i, -Math.sqrt((k / 50) * i)] as [number, number]), color: 'muted' as Color }] : [])], points: [{ x: 0, y: 0, color: 'special', r: 5 }, { x, y, color: 'bad', r: 5 }], circles: dim === '1' ? [] : [{ x: 0, y: 0, r: Math.sqrt(i), color: 'muted' }], title: dim === '1' ? 'x 軸為時間；灰線為 ±√t' : '灰色虛線圓半徑 = √n' }, vars({ 步數: i, 距離: +dist.toFixed(2), '√n': +Math.sqrt(i).toFixed(2) })], 3);
      }
    }
    return r.frames;
  },
};

export default [fisher, reservoir, rqs, monte, walk];
