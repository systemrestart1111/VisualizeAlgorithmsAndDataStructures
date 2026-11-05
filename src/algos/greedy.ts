import type { AlgoDef, Color, PlotPanel } from '../core/types';
import { Rec, cells, vars, table, text, rnd } from '../core/helpers';
import { binaryPanel, type BNode } from '../core/graph';

const cat = 'greedy';

type Iv = { id: string; s: number; e: number };
const parseIv = (src: string): Iv[] =>
  String(src).split(/[;\n]/).map((x) => x.trim()).filter(Boolean).map((x, i) => {
    const [a, b] = x.split(/[\s,-]+/).map(Number);
    return { id: String.fromCharCode(65 + (i % 26)) + (i >= 26 ? i : ''), s: Math.min(a, b), e: Math.max(a, b) };
  });
const randomIv = (n = rnd.int(8, 11)) => Array.from({ length: n }, () => { const s = rnd.int(0, 14); return `${s} ${s + rnd.int(1, 5)}`; }).join('; ');

function gantt(iv: Iv[], color: Record<string, Color | undefined>, o: { lane?: Record<string, number>; marker?: number; title?: string } = {}): PlotPanel {
  const maxE = Math.max(...iv.map((x) => x.e), 1);
  const lanes = o.lane ? Math.max(...Object.values(o.lane), 0) + 1 : iv.length;
  return {
    type: 'plot',
    title: o.title,
    bounds: [0, maxE + 1, -1, lanes],
    height: Math.max(160, lanes * 26),
    segments: [
      ...iv.map((x, i) => {
        const y = o.lane ? lanes - 1 - (o.lane[x.id] ?? 0) : iv.length - 1 - i;
        return { x1: x.s, y1: y, x2: x.e, y2: y, color: color[x.id] ?? 'muted', width: 12 };
      }),
      ...(o.marker !== undefined ? [{ x1: o.marker, y1: -1, x2: o.marker, y2: lanes, color: 'bad' as Color, dashed: true, width: 1.5 }] : []),
    ],
    points: iv.map((x, i) => ({ x: x.s, y: o.lane ? lanes - 1 - (o.lane[x.id] ?? 0) : iv.length - 1 - i, label: `${x.id} [${x.s},${x.e}]`, r: 0.1 })),
    axes: true,
  };
}

const activity: AlgoDef = {
  id: 'activity-selection', name: '活動選擇／區間排程', en: 'Activity Selection / Interval Scheduling', cat, star: true,
  desc: '在互不重疊的前提下選出最多個活動：依「結束時間」由早到晚排序，能選就選（開始時間 ≥ 上一個已選活動的結束時間）。結束越早，留給後面的空間越多。',
  time: 'O(n log n)', space: 'O(1)',
  code: ['依結束時間排序', 'last = -∞', 'for 活動 a in 排序後:', '  if a.start >= last:', '    選擇 a; last = a.end', '  else: 略過（與已選活動重疊）'],
  inputs: [{ key: 'iv', label: '區間（start end，以 ; 分隔）', type: 'text', default: '1 4; 3 5; 0 6; 5 7; 3 9; 5 9; 6 10; 8 11; 8 12; 2 14; 12 16', random: () => randomIv() }],
  run({ iv }) {
    const r = new Rec();
    const A = parseIv(iv).sort((a, b) => a.e - b.e || a.s - b.s);
    const col: Record<string, Color> = {};
    let last = -Infinity;
    const chosen: string[] = [];
    r.snap('依結束時間排序（由上到下）', [gantt(A, col), vars({ last: '-∞', 已選: 0 })], 1);
    for (const a of A) {
      r.snap(`考慮 ${a.id} [${a.s}, ${a.e}]`, [gantt(A, { ...col, [a.id]: 'compare' }, { marker: Number.isFinite(last) ? last : undefined }), vars({ last, 已選: chosen.join(' ') })], 4);
      if (a.s >= last) { col[a.id] = 'done'; last = a.e; chosen.push(a.id); r.snap(`${a.s} ≥ last，選擇 ${a.id}，last = ${last}`, [gantt(A, col, { marker: last }), vars({ last, 已選: chosen.join(' ') })], 5); }
      else { col[a.id] = 'bad'; r.snap(`${a.s} < last = ${last}，重疊，略過`, [gantt(A, col, { marker: last }), vars({ last, 已選: chosen.join(' ') })], 6); }
    }
    r.snap(`最多可選 ${chosen.length} 個活動：${chosen.join(', ')}`, [gantt(A, col), vars({ 數量: chosen.length })]);
    return r.frames;
  },
};

const partition: AlgoDef = {
  id: 'interval-partitioning', name: '區間分組', en: 'Interval Partitioning', cat,
  desc: '用最少的「教室」容納所有區間（同教室內不重疊）：依開始時間排序，用最小堆積記錄每間教室最早的空出時間；若最早空出的教室仍來不及，就開新教室。答案等於同時重疊的最大數量。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['依開始時間排序', 'heap = 空（存 (教室結束時間, 教室編號)）', 'for 區間 x:', '  if heap.top.end <= x.start:', '    沿用該教室，更新結束時間', '  else: 開新教室', '答案 = 教室數'],
  inputs: [{ key: 'iv', label: '區間（start end，以 ; 分隔）', type: 'text', default: '0 3; 1 4; 2 6; 4 7; 5 9; 6 8; 7 10; 9 12; 8 11; 11 13', random: () => randomIv() }],
  run({ iv }) {
    const r = new Rec();
    const A = parseIv(iv).sort((a, b) => a.s - b.s || a.e - b.e);
    const lane: Record<string, number> = {};
    const rooms: number[] = [];
    const LC: Color[] = ['active', 'path', 'visited', 'good', 'special', 'frontier', 'compare', 'swap'];
    const col = () => Object.fromEntries(Object.entries(lane).map(([k, v]) => [k, LC[v % LC.length]]));
    const P = (cur?: Iv) => [gantt(A, { ...col(), ...(cur ? { [cur.id]: 'bad' as Color } : {}) }, { lane: { ...lane, ...(cur && lane[cur.id] === undefined ? { [cur.id]: rooms.length } : {}) }, marker: cur?.s, title: '每一列是一間教室' }), cells(rooms.length ? rooms : [''], {}, { title: '各教室目前的結束時間', w: 'half' })];
    r.snap('依開始時間排序', P(), 1);
    for (const x of A) {
      let best = -1;
      for (let i = 0; i < rooms.length; i++) if (rooms[i] <= x.s && (best < 0 || rooms[i] < rooms[best])) best = i;
      if (best >= 0) { lane[x.id] = best; rooms[best] = x.e; r.snap(`${x.id} [${x.s},${x.e}]：教室 ${best} 在 ${x.s} 前已空出，沿用`, P(), 5); }
      else { lane[x.id] = rooms.length; rooms.push(x.e); r.snap(`${x.id} [${x.s},${x.e}]：所有教室都還在使用，開新教室 ${rooms.length - 1}`, P(), 6); }
    }
    r.snap(`最少需要 ${rooms.length} 間教室`, P(), 7);
    return r.frames;
  },
};

const fractional: AlgoDef = {
  id: 'fractional-knapsack', name: '分數背包', en: 'Fractional Knapsack', cat,
  desc: '物品可以切割時，依「價值／重量」比由高到低裝入背包，最後一件裝不下就裝一部分。貪婪法在此可得最佳解（0/1 背包則不行）。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['依 value / weight 由大到小排序', 'for 物品 i:', '  if w[i] <= 剩餘容量: 全部裝入', '  else: 裝入 剩餘容量 / w[i] 的比例; break'],
  inputs: [{ key: 'items', label: '物品（重量 價值，以 ; 分隔）', type: 'text', default: '10 60; 20 100; 30 120; 5 50; 15 45', random: () => Array.from({ length: rnd.int(4, 6) }, () => `${rnd.int(3, 25)} ${rnd.int(10, 120)}`).join('; ') }, { key: 'cap', label: '背包容量', type: 'number', default: 50, min: 1 }],
  run({ items, cap }) {
    const r = new Rec();
    const it = String(items).split(';').map((x) => x.trim().split(/\s+/).map(Number)).filter((x) => x.length === 2).map(([w, v], i) => ({ id: 'I' + i, w, v, ratio: +(v / w).toFixed(3), take: 0 }));
    it.sort((a, b) => b.ratio - a.ratio);
    let left = cap, total = 0;
    const T = (cur = -1) => table(it.map((x) => [x.id, x.w, x.v, x.ratio, x.take ? +x.take.toFixed(3) : '']), Object.fromEntries(it.flatMap((x, i) => [0, 1, 2, 3, 4].map((c) => [`${i},${c}`, i === cur ? 'compare' : x.take === 1 ? 'done' : x.take > 0 ? 'path' : undefined]))) as Record<string, Color>, { colHeaders: ['物品', '重量', '價值', '價值/重量', '裝入比例'] });
    r.snap('依價值／重量比排序', [T(), vars({ 剩餘容量: left, 總價值: total })], 1);
    for (let i = 0; i < it.length && left > 0; i++) {
      const x = it[i];
      if (x.w <= left) { x.take = 1; left -= x.w; total += x.v; r.snap(`${x.id} 重 ${x.w} ≤ 剩餘 ${left + x.w}，全部裝入`, [T(i), vars({ 剩餘容量: left, 總價值: total })], 3); }
      else { x.take = left / x.w; total += x.v * x.take; r.snap(`${x.id} 裝不下，只裝 ${left}/${x.w} = ${x.take.toFixed(3)} 的比例`, [T(i), vars({ 剩餘容量: 0, 總價值: +total.toFixed(3) })], 4); left = 0; }
    }
    r.snap(`最大總價值 = ${+total.toFixed(3)}`, [T(), vars({ 總價值: +total.toFixed(3) })]);
    return r.frames;
  },
};

const huffman: AlgoDef = {
  id: 'huffman', name: '霍夫曼編碼', en: 'Huffman Coding', cat,
  desc: '最佳前綴碼：反覆從優先佇列取出頻率最小的兩棵樹合併成新樹（頻率相加），直到只剩一棵。左分支記 0、右分支記 1，出現越頻繁的字元編碼越短。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['pq = 每個字元一個葉節點（依頻率）', 'while |pq| > 1:', '  a = pq.popMin(); b = pq.popMin()', '  pq.push(新節點(a.freq + b.freq, a, b))', '從根走到葉：左 0、右 1 得到編碼'],
  inputs: [{ key: 's', label: '文字', type: 'text', default: 'ABRACADABRA BANANA', random: () => rnd.pick(['MISSISSIPPI RIVER', 'HELLO WORLD', 'abracadabra', 'she sells sea shells']) }],
  run({ s }) {
    const r = new Rec();
    const freq: Record<string, number> = {};
    for (const ch of String(s)) freq[ch] = (freq[ch] ?? 0) + 1;
    let id = 0;
    let pq: BNode[] = Object.entries(freq).map(([ch, f]) => ({ id: id++, val: f, ch, left: null, right: null }));
    const forest = (hl: BNode[] = []) => {
      // 把森林中每棵樹接到一個隱形根下面，方便同時畫出
      const sorted = [...pq].sort((a, b) => (a.val as number) - (b.val as number));
      const panels = sorted.map((t) => binaryPanel(t, { label: (n) => (n.ch !== undefined ? `${n.ch === ' ' ? '␣' : n.ch}:${n.val}` : String(n.val)), color: (n) => (hl.includes(n) ? 'compare' : n.ch !== undefined ? 'active' : undefined) }));
      let x0 = 0;
      const nodes: any[] = [], edges: any[] = [];
      for (const p of panels) {
        const minX = Math.min(...p.nodes.map((n) => n.x)), maxX = Math.max(...p.nodes.map((n) => n.x));
        for (const n of p.nodes) nodes.push({ ...n, x: n.x - minX + x0, r: 20 });
        edges.push(...p.edges);
        x0 += maxX - minX + 60;
      }
      return { type: 'graph' as const, nodes, edges, title: '優先佇列中的樹（依頻率由小到大）' };
    };
    r.snap(`統計頻率：${Object.entries(freq).map(([c, f]) => `${c === ' ' ? '␣' : c}=${f}`).join(' ')}`, [forest()], 1);
    while (pq.length > 1) {
      pq.sort((a, b) => (a.val as number) - (b.val as number));
      const a = pq[0], b = pq[1];
      r.snap(`取出頻率最小的兩棵：${a.val} 與 ${b.val}`, [forest([a, b])], 3);
      pq = pq.slice(2);
      const n: BNode = { id: id++, val: (a.val as number) + (b.val as number), left: a, right: b };
      pq.push(n);
      r.snap(`合併成頻率 ${n.val} 的新樹`, [forest([n])], 4);
    }
    const codes: Record<string, string> = {};
    const walk = (n: BNode | null, c: string) => { if (!n) return; if (n.ch !== undefined) codes[n.ch] = c || '0'; walk(n.left, c + '0'); walk(n.right, c + '1'); };
    walk(pq[0], '');
    const bits = [...String(s)].map((ch) => codes[ch]).join('');
    r.snap(`編碼完成：共 ${bits.length} bits（固定長度需 ${String(s).length * Math.max(1, Math.ceil(Math.log2(Object.keys(freq).length)))} bits）`, [binaryPanel(pq[0], { label: (n) => (n.ch !== undefined ? `${n.ch === ' ' ? '␣' : n.ch}:${n.val}` : String(n.val)), color: (n) => (n.ch !== undefined ? 'done' : undefined), sub: (n) => (n.ch !== undefined ? codes[n.ch] : undefined), title: 'Huffman 樹（左 0、右 1）' }), table(Object.entries(codes).map(([c, code]) => [c === ' ' ? '␣' : c, freq[c], code]), {}, { colHeaders: ['字元', '頻率', '編碼'], w: 'half' }), text([bits], '編碼結果', 'half')], 5);
    return r.frames;
  },
};

const jobs: AlgoDef = {
  id: 'job-sequencing', name: '工作排程', en: 'Job Sequencing with Deadlines', cat,
  desc: '每個工作耗時 1 單位、有截止時間與利潤。依利潤由高到低處理，把工作放在截止時間之前「最晚」的空檔；沒有空檔就放棄。',
  time: 'O(n²)（可用並查集優化至 O(n log n)）', space: 'O(n)',
  code: ['依利潤由大到小排序', 'slot[1..maxDeadline] = 空', 'for 工作 j:', '  for t = j.deadline .. 1:', '    if slot[t] 空: slot[t] = j; break', '  若找不到空檔: 放棄 j'],
  inputs: [{ key: 'jobs', label: '工作（截止 利潤，以 ; 分隔）', type: 'text', default: '2 100; 1 19; 2 27; 1 25; 3 15; 3 40; 4 30', random: () => Array.from({ length: rnd.int(5, 8) }, () => `${rnd.int(1, 4)} ${rnd.int(10, 100)}`).join('; ') }],
  run({ jobs: src }) {
    const r = new Rec();
    const J = String(src).split(';').map((x) => x.trim().split(/\s+/).map(Number)).filter((x) => x.length === 2).map(([d, p], i) => ({ id: 'J' + i, d, p }));
    J.sort((a, b) => b.p - a.p);
    const maxD = Math.max(...J.map((j) => j.d));
    const slot: (string | null)[] = new Array(maxD).fill(null);
    let total = 0;
    const st: Record<string, Color> = {};
    const P = (cur = -1, sc: Record<number, Color> = {}) => [table(J.map((j) => [j.id, j.d, j.p]), Object.fromEntries(J.flatMap((j, i) => [0, 1, 2].map((c) => [`${i},${c}`, i === cur ? 'compare' : st[j.id]]))) as Record<string, Color>, { colHeaders: ['工作', '截止', '利潤'], w: 'half' }), cells(slot.map((x) => x ?? ''), sc, { title: '時間槽', headers: slot.map((_, i) => `t${i + 1}`), w: 'half' }), vars({ 總利潤: total })];
    r.snap('依利潤由大到小排序', P(), 1);
    J.forEach((j, i) => {
      for (let t = Math.min(j.d, maxD) - 1; t >= 0; t--) {
        if (!slot[t]) { slot[t] = j.id; total += j.p; st[j.id] = 'done'; r.snap(`${j.id}（截止 ${j.d}）放入最晚的空檔 t${t + 1}`, P(i, { [t]: 'swap' }), 5); return; }
      }
      st[j.id] = 'bad';
      r.snap(`${j.id} 截止前沒有空檔，放棄`, P(i), 6);
    });
    r.snap(`最大總利潤 = ${total}`, P());
    return r.frames;
  },
};

const optimalMerge: AlgoDef = {
  id: 'optimal-merge', name: '最優合併模式', en: 'Optimal Merge Pattern', cat,
  desc: '把多個已排序檔案兩兩合併成一個，合併長度 a 與 b 的成本為 a + b。每次合併最短的兩個（與 Huffman 相同的貪婪策略）可使總成本最小。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['pq = 所有檔案長度', 'cost = 0', 'while |pq| > 1:', '  a = popMin(); b = popMin()', '  cost += a + b', '  push(a + b)', 'return cost'],
  inputs: [{ key: 'arr', label: '檔案長度', type: 'array', default: [20, 30, 10, 5, 30, 15], random: () => rnd.arr(rnd.int(4, 8), 2, 40) }],
  run({ arr }) {
    const r = new Rec();
    let id = 0;
    let pq: BNode[] = arr.map((v: number) => ({ id: id++, val: v, left: null, right: null, leaf: true }));
    let cost = 0;
    const steps: string[] = [];
    r.snap('所有檔案放入最小堆積', [cells([...pq].map((x) => x.val).sort((a, b) => (a as number) - (b as number)), {}, { title: '優先佇列', headers: false }), vars({ 總成本: cost })], 1);
    while (pq.length > 1) {
      pq.sort((a, b) => (a.val as number) - (b.val as number));
      const [a, b] = pq;
      pq = pq.slice(2);
      const n: BNode = { id: id++, val: (a.val as number) + (b.val as number), left: a, right: b };
      cost += n.val as number;
      steps.push(`${a.val} + ${b.val} = ${n.val}（累計 ${cost}）`);
      pq.push(n);
      r.snap(`合併 ${a.val} 與 ${b.val}，成本 ${n.val}`, [cells([...pq].map((x) => x.val).sort((x, y) => (x as number) - (y as number)), {}, { title: '優先佇列', headers: false }), binaryPanel(n, { color: (x) => (x === n ? 'swap' : x.leaf ? 'active' : undefined), title: '本次合併形成的樹' }), text(steps, '合併紀錄', 'half'), vars({ 總成本: cost })], 5);
    }
    r.snap(`最小總合併成本 = ${cost}`, [binaryPanel(pq[0], { color: (x) => (x.leaf ? 'done' : undefined), title: '合併樹' }), text(steps, '合併紀錄', 'half'), vars({ 總成本: cost })], 7);
    return r.frames;
  },
};

export default [activity, partition, fractional, huffman, jobs, optimalMerge];
