import type { Color, DSDef, GEdge, GNode, Panel } from '../core/types';
import { cells, vars, table, rnd } from '../core/helpers';
import { gpanel, layoutGraph, layoutTree, type G } from '../core/graph';
import { DSBase, num } from './base';

const cat = 'ds-adv';

// ---------------- 線段樹（區間加值 + 區間和，含懶標記） ----------------

class SegTree extends DSBase<{ n?: Record<number, Color>; a?: Record<number, Color> }> {
  a: number[] = [5, 8, 6, 3, 2, 7, 2, 6];
  n = 8;
  sum: number[] = [];
  lazy: number[] = [];
  constructor() {
    super();
    this.build(1, 0, this.n - 1);
  }
  build(o: number, l: number, r: number): number {
    this.lazy[o] = 0;
    if (l === r) return (this.sum[o] = this.a[l]);
    const m = (l + r) >> 1;
    return (this.sum[o] = this.build(2 * o, l, m) + this.build(2 * o + 1, m + 1, r));
  }
  /** 把懶標記推到葉節點後的實際陣列值 */
  actual() {
    const out = [...this.a];
    const go = (o: number, l: number, r: number, add: number) => {
      if (l === r) { out[l] = this.sum[o] + add; return; }
      const m = (l + r) >> 1;
      go(2 * o, l, m, add + this.lazy[o]);
      go(2 * o + 1, m + 1, r, add + this.lazy[o]);
    };
    go(1, 0, this.n - 1, 0);
    return out;
  }
  panels(h: { n?: Record<number, Color>; a?: Record<number, Color> } = {}): Panel[] {
    const children: Record<string, string[]> = {};
    const info: Record<string, [number, number]> = {};
    const walk = (o: number, l: number, r: number) => {
      info['s' + o] = [l, r];
      if (l === r) { children['s' + o] = []; return; }
      const m = (l + r) >> 1;
      children['s' + o] = ['s' + 2 * o, 's' + (2 * o + 1)];
      walk(2 * o, l, m); walk(2 * o + 1, m + 1, r);
    };
    walk(1, 0, this.n - 1);
    const pos = layoutTree('s1', children, 54, 66);
    const nodes: GNode[] = Object.keys(info).map((id) => { const o = +id.slice(1); const [l, r] = info[id]; return { id, x: pos[id].x, y: pos[id].y, label: String(this.sum[o]), shape: 'rect', w: 46, h: 28, badge: l === r ? `[${l}]` : `[${l},${r}]`, sub: this.lazy[o] ? `+${this.lazy[o]}` : undefined, color: h.n?.[o] }; });
    const edges: GEdge[] = Object.entries(children).flatMap(([p, cs]) => cs.map((c) => ({ from: p, to: c })));
    return [{ type: 'graph', nodes, edges, title: '線段樹：節點值為區間和，上方為負責區間，下方 +x 為懶標記' }, cells(this.actual(), h.a ?? {}, { title: '目前陣列（含懶標記效果）' })];
  }
  push(o: number, l: number, r: number) {
    if (!this.lazy[o] || l === r) return;
    const m = (l + r) >> 1;
    for (const [c, cl, cr] of [[2 * o, l, m], [2 * o + 1, m + 1, r]]) { this.lazy[c] += this.lazy[o]; this.sum[c] += this.lazy[o] * (cr - cl + 1); }
    this.snap(`下推懶標記 +${this.lazy[o]} 到子節點`, 4, { n: { [o]: 'special', [2 * o]: 'swap', [2 * o + 1]: 'swap' } });
    this.lazy[o] = 0;
  }
  query(o: number, l: number, r: number, ql: number, qr: number, acc: Record<number, Color>): number {
    if (qr < l || r < ql) { acc[o] = 'muted'; this.snap(`[${l},${r}] 與查詢區間不相交，回傳 0`, 2, { n: { ...acc } }); return 0; }
    if (ql <= l && r <= qr) { acc[o] = 'done'; this.snap(`[${l},${r}] 完全包含在查詢區間內，直接用 ${this.sum[o]}`, 3, { n: { ...acc } }); return this.sum[o]; }
    acc[o] = 'compare';
    this.snap(`[${l},${r}] 部分重疊，往下拆分`, 4, { n: { ...acc } });
    this.push(o, l, r);
    const m = (l + r) >> 1;
    return this.query(2 * o, l, m, ql, qr, acc) + this.query(2 * o + 1, m + 1, r, ql, qr, acc);
  }
  update(o: number, l: number, r: number, ql: number, qr: number, v: number, acc: Record<number, Color>) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) {
      this.sum[o] += v * (r - l + 1);
      this.lazy[o] += v;
      acc[o] = 'swap';
      this.snap(`[${l},${r}] 完全被覆蓋：sum += ${v}×${r - l + 1}，記懶標記 +${v}（不往下更新）`, 6, { n: { ...acc } });
      return;
    }
    acc[o] = 'compare';
    this.push(o, l, r);
    const m = (l + r) >> 1;
    this.update(2 * o, l, m, ql, qr, v, acc);
    this.update(2 * o + 1, m + 1, r, ql, qr, v, acc);
    this.sum[o] = this.sum[2 * o] + this.sum[2 * o + 1];
    this.snap(`回到 [${l},${r}]：sum = 左 + 右 = ${this.sum[o]}`, 7, { n: { ...acc, [o]: 'active' } });
  }
  run(op: string, a?: any, b?: any) {
    if (op === 'query') {
      let l = Math.max(0, Math.min(num(a), this.n - 1)), r = Math.max(0, Math.min(num(b, this.n - 1), this.n - 1));
      if (l > r) [l, r] = [r, l];
      const res = this.query(1, 0, this.n - 1, l, r, {});
      this.snap(`sum(${l}..${r}) = ${res}`, 1, { a: Object.fromEntries(Array.from({ length: r - l + 1 }, (_, k) => [l + k, 'done'])) });
    } else if (op === 'add') {
      let l = Math.max(0, Math.min(num(a), this.n - 1)), r = Math.max(0, Math.min(num(b, l), this.n - 1));
      if (l > r) [l, r] = [r, l];
      const v = 3;
      this.snap(`把區間 [${l}, ${r}] 每個元素加 ${v}`, 5, { a: Object.fromEntries(Array.from({ length: r - l + 1 }, (_, k) => [l + k, 'swap'])) });
      this.update(1, 0, this.n - 1, l, r, v, {});
      this.snap('區間更新完成', 7, { a: Object.fromEntries(Array.from({ length: r - l + 1 }, (_, k) => [l + k, 'swap'])) });
    } else if (op === 'set') {
      const i = Math.max(0, Math.min(num(a), this.n - 1)), v = num(b, rnd.int(1, 9));
      const cur = this.actual()[i];
      this.update(1, 0, this.n - 1, i, i, v - cur, {});
      this.snap(`a[${i}] = ${v}（以加上差值 ${v - cur} 實作）`, 7, { a: { [i]: 'swap' } });
    } else if (op === 'random') {
      this.a = rnd.arr(this.n, 1, 9);
      this.sum = []; this.lazy = [];
      this.build(1, 0, this.n - 1);
      this.snap('以隨機陣列重新建樹（O(n)）', 1);
    }
  }
}

const segTree: DSDef = {
  id: 'ds-segment-tree', name: '線段樹', en: 'Segment Tree (Lazy Propagation)', cat, star: true,
  desc: '每個節點負責一段區間並存放該區間的彙總值（此處為和）。查詢時把區間拆成 O(log n) 個完整節點；區間更新使用「懶標記」：完全覆蓋的節點先記下待加的值，等到需要往下走時才下推。',
  complexity: [['建樹', 'O(n)'], ['區間查詢', 'O(log n)'], ['區間更新（懶標記）', 'O(log n)'], ['空間', 'O(4n)']],
  codes: {
    query: ['query(node, [l,r], [ql,qr]):', '  不相交：return 0', '  完全包含：return sum[node]', '  否則下推懶標記，遞迴左右子並相加'],
    add: ['', '', '', 'pushDown：把懶標記加到兩個子節點', 'update(node, [ql,qr], v):', '  完全覆蓋：sum += v·長度；lazy += v；return', '  否則下推、遞迴左右，sum = 左 + 右'],
  },
  ops: [
    { key: 'query', label: '區間和(l, r)', arg: 'two', argLabel: 'l r', rand: () => { const l = rnd.int(0, 5); return [l, rnd.int(l, 7)]; } },
    { key: 'add', label: '區間 +3 (l, r)', arg: 'two', argLabel: 'l r', rand: () => { const l = rnd.int(0, 5); return [l, rnd.int(l, 7)]; } },
    { key: 'set', label: '單點設值(i, v)', arg: 'two', argLabel: 'i v', rand: () => [rnd.int(0, 7), rnd.int(1, 9)] },
    { key: 'random', label: '隨機陣列', arg: 'none' },
  ],
  create: () => new SegTree(),
};

// ---------------- 樹狀陣列 ----------------

class Fenwick extends DSBase<{ t?: Record<number, Color>; a?: Record<number, Color> }> {
  n = 12;
  a: number[] = [3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3, 1];
  t: number[] = new Array(13).fill(0);
  constructor() {
    super();
    this.rebuild();
  }
  rebuild() {
    this.t = new Array(this.n + 1).fill(0);
    for (let i = 1; i <= this.n; i++) for (let j = i; j <= this.n; j += j & -j) this.t[j] += this.a[i - 1];
  }
  panels(h: { t?: Record<number, Color>; a?: Record<number, Color> } = {}): Panel[] {
    // 以長條表示每個 t[i] 負責的區間 (i - lowbit(i), i]
    const segs = Array.from({ length: this.n }, (_, k) => { const i = k + 1; const lb = i & -i; return { x1: i - lb + 0.55, y1: Math.log2(lb), x2: i + 0.45, y2: Math.log2(lb), color: (h.t?.[i] ?? 'active') as Color, width: 14 }; });
    return [
      cells(this.a, h.a ?? {}, { title: '原陣列 a（1-indexed 顯示）', headers: this.a.map((_, i) => i + 1) }),
      cells(this.t.slice(1), Object.fromEntries(Object.entries(h.t ?? {}).map(([k, v]) => [+k - 1, v])), { title: 'BIT 陣列 t[i] = a(i − lowbit(i), i] 的和', headers: this.t.slice(1).map((_, i) => `${i + 1}(${(i + 1).toString(2)})`) }),
      { type: 'plot', bounds: [0.5, this.n + 0.5, -0.6, Math.log2(this.n) + 0.6], height: 150, segments: segs, points: segs.map((s, k) => ({ x: s.x2 - 0.2, y: s.y1 + 0.35, label: 't' + (k + 1), r: 0.01 })), title: '每個 t[i] 負責的區間（高度 = log₂ lowbit(i)）' },
    ];
  }
  run(op: string, a?: any, b?: any) {
    if (op === 'prefix' || op === 'range') {
      const pre = (i: number, tag: string) => {
        let s = 0;
        const c: Record<number, Color> = {};
        for (let j = i; j > 0; j -= j & -j) { s += this.t[j]; c[j] = 'compare'; this.snap(`${tag}：加上 t[${j}] = ${this.t[j]}，j −= lowbit(${j}) = ${j & -j} → ${j - (j & -j)}`, 2, { t: { ...c } }); }
        return s;
      };
      if (op === 'prefix') {
        const i = Math.max(1, Math.min(num(a, this.n), this.n));
        const s = pre(i, `prefix(${i})`);
        this.snap(`a[1..${i}] 的和 = ${s}`, 3, { a: Object.fromEntries(Array.from({ length: i }, (_, k) => [k, 'done'])) });
      } else {
        let l = Math.max(1, Math.min(num(a, 1), this.n)), r = Math.max(1, Math.min(num(b, this.n), this.n));
        if (l > r) [l, r] = [r, l];
        const s = pre(r, `prefix(${r})`) - pre(l - 1, `prefix(${l - 1})`);
        this.snap(`sum(${l}..${r}) = prefix(${r}) − prefix(${l - 1}) = ${s}`, 3, { a: Object.fromEntries(Array.from({ length: r - l + 1 }, (_, k) => [l - 1 + k, 'done'])) });
      }
    } else if (op === 'add') {
      const i = Math.max(1, Math.min(num(a, 1), this.n)), v = num(b, rnd.int(-3, 5));
      this.a[i - 1] += v;
      const c: Record<number, Color> = {};
      for (let j = i; j <= this.n; j += j & -j) { this.t[j] += v; c[j] = 'swap'; this.snap(`t[${j}] += ${v}，j += lowbit(${j}) = ${j & -j} → ${j + (j & -j)}`, 5, { t: { ...c }, a: { [i - 1]: 'swap' } }); }
      this.snap(`a[${i}] += ${v} 完成（只更新 O(log n) 個節點）`, 5, { a: { [i - 1]: 'swap' } });
    } else if (op === 'random') { this.a = rnd.arr(this.n, -5, 9); this.rebuild(); this.snap('隨機陣列並重建'); }
  }
}

const fenwick: DSDef = {
  id: 'ds-fenwick', name: '樹狀陣列', en: 'Fenwick Tree (Binary Indexed Tree)', cat,
  desc: 't[i] 存放長度為 lowbit(i)（i 的最低位 1）的一段區間和。前綴和查詢時 i 不斷減去 lowbit，單點更新時 i 不斷加上 lowbit，各只需 O(log n) 步。程式極短、常數小，是線段樹在前綴和問題上的輕量替代。',
  complexity: [['前綴和查詢', 'O(log n)'], ['單點更新', 'O(log n)'], ['空間', 'O(n)']],
  codes: { prefix: ['prefix(i): s = 0', '  while i > 0: s += t[i]; i -= i & (-i)', '  return s'], range: ['', '', 'sum(l, r) = prefix(r) − prefix(l − 1)'], add: ['', '', '', 'add(i, v):', '  while i <= n: t[i] += v; i += i & (-i)'] },
  ops: [
    { key: 'prefix', label: '前綴和(i)', arg: 'number', argLabel: 'i', rand: () => rnd.int(1, 12) },
    { key: 'range', label: '區間和(l, r)', arg: 'two', argLabel: 'l r', rand: () => { const l = rnd.int(1, 8); return [l, rnd.int(l, 12)]; } },
    { key: 'add', label: '單點加值(i, v)', arg: 'two', argLabel: 'i v', rand: () => [rnd.int(1, 12), rnd.int(-3, 5)] },
    { key: 'random', label: '隨機陣列', arg: 'none' },
  ],
  create: () => new Fenwick(),
};

// ---------------- 並查集 ----------------

class DSU extends DSBase<Record<number, Color>> {
  n = 10;
  p = Array.from({ length: 10 }, (_, i) => i);
  rank = new Array(10).fill(0);
  panels(c: Record<number, Color> = {}): Panel[] {
    const kids: Record<string, string[]> = {};
    for (let i = 0; i < this.n; i++) kids['u' + i] = [];
    for (let i = 0; i < this.n; i++) if (this.p[i] !== i) kids['u' + this.p[i]].push('u' + i);
    const roots = Array.from({ length: this.n }, (_, i) => i).filter((i) => this.p[i] === i);
    kids['top'] = roots.map((r) => 'u' + r);
    const pos = layoutTree('top', kids, 48, 64);
    const nodes: GNode[] = Array.from({ length: this.n }, (_, i) => ({ id: 'u' + i, x: pos['u' + i].x, y: pos['u' + i].y, label: String(i), color: c[i] ?? (this.p[i] === i ? 'active' : undefined), sub: this.p[i] === i ? `rank ${this.rank[i]}` : undefined }));
    const edges: GEdge[] = Array.from({ length: this.n }, (_, i) => i).filter((i) => this.p[i] !== i).map((i) => ({ from: 'u' + i, to: 'u' + this.p[i], directed: true }));
    return [{ type: 'graph', nodes, edges, title: '並查集森林（箭頭指向父節點，藍色為各集合的代表）' }, cells(this.p, Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v])), { title: 'parent 陣列' }), vars({ 集合數: roots.length })];
  }
  find(x: number, compress = true): number {
    const path: number[] = [];
    let r = x;
    while (this.p[r] !== r) { path.push(r); this.snap(`find(${x})：${r} 的父節點是 ${this.p[r]}`, 2, Object.fromEntries([...path.map((q) => [q, 'compare' as Color]), [this.p[r], 'active' as Color]])); r = this.p[r]; }
    if (compress && path.length > 1) {
      for (const q of path) this.p[q] = r;
      this.snap(`路徑壓縮：把 ${path.join(', ')} 直接接到根 ${r}`, 3, Object.fromEntries([...path.map((q) => [q, 'swap' as Color]), [r, 'done' as Color]]));
    }
    return r;
  }
  run(op: string, a?: any, b?: any) {
    const x = Math.max(0, Math.min(num(a), this.n - 1));
    if (op === 'find') { const r = this.find(x); this.snap(`find(${x}) = ${r}`, 3, { [x]: 'compare', [r]: 'done' }); }
    else if (op === 'union') {
      const y = Math.max(0, Math.min(num(b, rnd.int(0, this.n - 1)), this.n - 1));
      const rx = this.find(x), ry = this.find(y);
      if (rx === ry) { this.snap(`${x} 與 ${y} 已在同一集合（代表 ${rx}）`, 5, { [rx]: 'done' }); return; }
      const [hi, lo] = this.rank[rx] >= this.rank[ry] ? [rx, ry] : [ry, rx];
      this.p[lo] = hi;
      if (this.rank[rx] === this.rank[ry]) this.rank[hi]++;
      this.snap(`依秩合併：把 rank 較小的根 ${lo} 接到 ${hi} 底下`, 6, { [lo]: 'swap', [hi]: 'done' });
    } else if (op === 'same') {
      const y = Math.max(0, Math.min(num(b, rnd.int(0, this.n - 1)), this.n - 1));
      const rx = this.find(x), ry = this.find(y);
      this.snap(rx === ry ? `${x} 與 ${y} 在同一集合` : `${x} 與 ${y} 在不同集合`, 5, { [x]: rx === ry ? 'good' : 'bad', [y]: rx === ry ? 'good' : 'bad' });
    }
  }
}

const dsu: DSDef = {
  id: 'ds-union-find', name: '並查集', en: 'Disjoint Set Union (Union-Find)', cat, star: true,
  desc: '維護若干不相交集合，支援「合併兩個集合」與「查詢元素屬於哪個集合」。每個集合是一棵以代表元素為根的樹。搭配路徑壓縮與依秩合併後，每次操作的均攤時間為 α(n)（反阿克曼函數，實務上 ≤ 4）。用於 Kruskal、連通性判斷等。',
  complexity: [['find / union（均攤）', 'O(α(n))'], ['空間', 'O(n)']],
  codes: { find: ['find(x):', '  沿 parent 走到根 r', '  路徑壓縮：沿途節點直接指向 r'], union: ['', '', '', 'union(x, y):', '  rx = find(x), ry = find(y)；相同則結束', '  rank 小的根接到 rank 大的根下（相等則 rank+1）'] },
  ops: [
    { key: 'union', label: 'union(x, y)', arg: 'two', argLabel: 'x y', rand: () => [rnd.int(0, 9), rnd.int(0, 9)] },
    { key: 'find', label: 'find(x)', arg: 'number', rand: () => rnd.int(0, 9) },
    { key: 'same', label: '同一集合？', arg: 'two', argLabel: 'x y', rand: () => [rnd.int(0, 9), rnd.int(0, 9)] },
  ],
  create: () => new DSU(),
  init: [['union', 1, 2], ['union', 3, 4], ['union', 2, 4], ['union', 5, 6], ['union', 7, 8], ['union', 8, 9]],
};

// ---------------- 圖 ----------------

class GraphDS extends DSBase<{ n?: Record<string, Color>; e?: Record<number, Color> }> {
  g: G = { nodes: ['A', 'B', 'C', 'D', 'E'], edges: [{ u: 'A', v: 'B', w: 4 }, { u: 'A', v: 'C', w: 2 }, { u: 'B', v: 'D', w: 5 }, { u: 'C', v: 'D', w: 8 }, { u: 'D', v: 'E', w: 3 }], directed: false, pos: {} };
  constructor() {
    super();
    layoutGraph(this.g);
  }
  panels(h: { n?: Record<string, Color>; e?: Record<number, Color> } = {}): Panel[] {
    const N = this.g.nodes;
    const M = N.map((u) => N.map((v) => { const e = this.g.edges.find((x) => (x.u === u && x.v === v) || (!this.g.directed && x.u === v && x.v === u)); return e ? e.w : 0; }));
    const mc: Record<string, Color> = {};
    this.g.edges.forEach((e, i) => { if (h.e?.[i]) { const a = N.indexOf(e.u), b = N.indexOf(e.v); mc[`${a},${b}`] = h.e[i]!; if (!this.g.directed) mc[`${b},${a}`] = h.e[i]!; } });
    const adj = N.map((u) => [u + ' →', ...this.g.edges.flatMap((e) => (e.u === u ? [`${e.v}(${e.w})`] : !this.g.directed && e.v === u ? [`${e.u}(${e.w})`] : []))]);
    const w = Math.max(...adj.map((x) => x.length));
    return [gpanel(this.g, { node: h.n, edge: h.e, title: this.g.directed ? '有向加權圖' : '無向加權圖' }), table(M, mc, { rowHeaders: N, colHeaders: N, title: '鄰接矩陣（空間 O(V²)）', w: 'half' }), table(adj.map((r) => [...r, ...new Array(w - r.length).fill('')]), {}, { title: '鄰接串列（空間 O(V + E)）', w: 'half' })];
  }
  run(op: string, a?: any, b?: any) {
    const parts = String(a ?? '').trim().split(/\s+/);
    if (op === 'addVertex') {
      const v = parts[0] || String.fromCharCode(65 + this.g.nodes.length);
      if (this.g.nodes.includes(v)) { this.snap(`頂點 ${v} 已存在`); return; }
      this.g.nodes.push(v);
      delete this.g.pos[v];
      layoutGraph(this.g);
      this.snap(`新增頂點 ${v}：鄰接矩陣多一列一行（O(V²) 重建），鄰接串列多一個空串列（O(1)）`, undefined, { n: { [v]: 'swap' } });
    } else if (op === 'addEdge') {
      const u = parts[0], v = parts[1] ?? String(b ?? ''), w = Number(parts[2] ?? 1) || 1;
      if (!this.g.nodes.includes(u) || !this.g.nodes.includes(v)) { this.snap(`頂點 ${u} 或 ${v} 不存在`); return; }
      this.g.edges.push({ u, v, w });
      this.snap(`新增邊 ${u}–${v}（權重 ${w}）：矩陣 O(1)，串列 O(1)`, undefined, { e: { [this.g.edges.length - 1]: 'swap' } });
    } else if (op === 'removeEdge') {
      const u = parts[0], v = parts[1] ?? String(b ?? '');
      const i = this.g.edges.findIndex((e) => (e.u === u && e.v === v) || (!this.g.directed && e.u === v && e.v === u));
      if (i < 0) { this.snap(`邊 ${u}–${v} 不存在`); return; }
      this.snap(`刪除邊 ${u}–${v}：矩陣 O(1)，串列需搜尋 O(deg)`, undefined, { e: { [i]: 'bad' } });
      this.g.edges.splice(i, 1);
      this.snap('已刪除');
    } else if (op === 'removeVertex') {
      const v = parts[0];
      if (!this.g.nodes.includes(v)) { this.snap(`頂點 ${v} 不存在`); return; }
      this.snap(`刪除頂點 ${v} 以及所有相連的邊`, undefined, { n: { [v]: 'bad' }, e: Object.fromEntries(this.g.edges.map((e, i) => [i, e.u === v || e.v === v ? 'bad' : undefined])) as Record<number, Color> });
      this.g.nodes = this.g.nodes.filter((x) => x !== v);
      this.g.edges = this.g.edges.filter((e) => e.u !== v && e.v !== v);
      this.snap('已刪除');
    } else if (op === 'neighbors') {
      const v = parts[0];
      const idx = this.g.edges.map((e, i) => (e.u === v || (!this.g.directed && e.v === v) ? i : -1)).filter((i) => i >= 0);
      this.snap(`${v} 的鄰居：${idx.map((i) => (this.g.edges[i].u === v ? this.g.edges[i].v : this.g.edges[i].u)).join(', ') || '無'}（串列 O(deg)，矩陣需掃描整列 O(V)）`, undefined, { n: { [v]: 'active' }, e: Object.fromEntries(idx.map((i) => [i, 'path' as Color])) });
    } else if (op === 'toggle') {
      this.g.directed = !this.g.directed;
      this.snap(`切換為${this.g.directed ? '有向' : '無向'}圖：無向圖的鄰接矩陣是對稱的`);
    }
  }
}

const graphDS: DSDef = {
  id: 'ds-graph', name: '圖', en: 'Graph (Adjacency Matrix & List)', cat, star: true,
  desc: '由頂點與邊組成，可為有向／無向、加權／不加權。兩種常見表示法：鄰接矩陣（V×V 陣列，查詢某條邊 O(1)，適合稠密圖）與鄰接串列（每個頂點一個鄰居串列，空間 O(V+E)，適合稀疏圖）。各種圖演算法請見分類 9～12。',
  complexity: [['查詢邊（矩陣／串列）', 'O(1) / O(deg)'], ['列舉鄰居（矩陣／串列）', 'O(V) / O(deg)'], ['空間（矩陣／串列）', 'O(V²) / O(V + E)']],
  ops: [
    { key: 'addVertex', label: '新增頂點', arg: 'text', argLabel: '名稱', rand: () => String.fromCharCode(70 + rnd.int(0, 5)) },
    { key: 'addEdge', label: '新增邊', arg: 'text', argLabel: 'u v w', rand: () => `${rnd.pick(['A', 'B', 'C', 'D', 'E'])} ${rnd.pick(['A', 'B', 'C', 'D', 'E'])} ${rnd.int(1, 9)}` },
    { key: 'removeEdge', label: '刪除邊', arg: 'text', argLabel: 'u v', rand: () => rnd.pick(['A B', 'A C', 'B D', 'C D', 'D E']) },
    { key: 'removeVertex', label: '刪除頂點', arg: 'text', argLabel: '名稱', rand: () => rnd.pick(['A', 'B', 'C', 'D', 'E']) },
    { key: 'neighbors', label: '列出鄰居', arg: 'text', argLabel: '頂點', rand: () => rnd.pick(['A', 'B', 'C', 'D', 'E']) },
    { key: 'toggle', label: '有向／無向', arg: 'none' },
  ],
  create: () => new GraphDS(),
};

// ---------------- 跳躍串列 ----------------

interface SN { key: number; next: (SN | null)[]; id: number }

class SkipList extends DSBase<{ path?: Set<string>; c?: Map<number, Color> }> {
  MAX = 5;
  head: SN = { key: -Infinity, next: new Array(5).fill(null), id: -1 };
  level = 1;
  id = 0;
  seed = 12345;
  rand() {
    this.seed = (this.seed * 1103515245 + 12345) % 2147483648;
    return this.seed / 2147483648;
  }
  panels(h: { path?: Set<string>; c?: Map<number, Color> } = {}): Panel[] {
    const all: SN[] = [];
    for (let x = this.head.next[0]; x; x = x.next[0]) all.push(x);
    const col = (n: SN) => all.indexOf(n) + 1;
    const nodes: GNode[] = [];
    const edges: GEdge[] = [];
    for (let lv = 0; lv < this.MAX; lv++) {
      if (lv >= this.level && lv > 0) break;
      nodes.push({ id: `h${lv}`, x: 0, y: -lv * 50, label: 'H', shape: 'rect', w: 30, h: 26, color: h.path?.has(`h${lv}`) ? 'compare' : 'muted' });
      for (const n of all) if (n.next.length > lv) nodes.push({ id: `n${n.id}_${lv}`, x: col(n) * 56, y: -lv * 50, label: String(n.key), shape: 'rect', w: 36, h: 26, color: h.c?.get(n.id) ?? (h.path?.has(`n${n.id}_${lv}`) ? 'compare' : undefined) });
      let prev = `h${lv}`;
      for (let x = this.head.next[lv]; x; x = x.next[lv]) { edges.push({ from: prev, to: `n${x.id}_${lv}`, directed: true, color: h.path?.has(prev) && h.path?.has(`n${x.id}_${lv}`) ? 'path' : undefined }); prev = `n${x.id}_${lv}`; }
    }
    for (const n of all) for (let lv = 1; lv < n.next.length; lv++) edges.push({ from: `n${n.id}_${lv}`, to: `n${n.id}_${lv - 1}`, color: 'muted', dashed: true });
    return [{ type: 'graph', nodes, edges, title: '跳躍串列（第 0 層包含全部元素，上層是「快速通道」）' }, vars({ 元素數: all.length, 層數: this.level })];
  }
  search(k: number, show = true) {
    let x = this.head;
    const path = new Set<string>(['h' + (this.level - 1)]);
    const update: SN[] = new Array(this.MAX).fill(this.head);
    for (let lv = this.level - 1; lv >= 0; lv--) {
      path.add(x === this.head ? `h${lv}` : `n${x.id}_${lv}`);
      while (x.next[lv] && x.next[lv]!.key < k) {
        x = x.next[lv]!;
        path.add(`n${x.id}_${lv}`);
        if (show) this.snap(`第 ${lv} 層：${x.key} < ${k}，往右`, 2, { path: new Set(path) });
      }
      if (show) this.snap(`第 ${lv} 層：下一個是 ${x.next[lv]?.key ?? '∅'}（≥ ${k}），往下一層`, 3, { path: new Set(path) });
      update[lv] = x;
    }
    return { cand: x.next[0], update, path };
  }
  run(op: string, a?: any) {
    const k = num(a, rnd.int(1, 99));
    if (op === 'search') {
      const { cand, path } = this.search(k);
      this.snap(cand && cand.key === k ? `找到 ${k}` : `找不到 ${k}`, 4, { path, c: cand && cand.key === k ? new Map([[cand.id, 'done']]) : undefined });
    } else if (op === 'insert') {
      const { cand, update } = this.search(k);
      if (cand && cand.key === k) { this.snap(`${k} 已存在`, 4); return; }
      let lvl = 1;
      while (lvl < this.MAX && this.rand() < 0.5) lvl++;
      this.snap(`擲硬幣決定新節點的層數 = ${lvl}（每多一層機率減半）`, 5);
      if (lvl > this.level) { for (let i = this.level; i < lvl; i++) update[i] = this.head; this.level = lvl; }
      const n: SN = { key: k, next: new Array(lvl).fill(null), id: this.id++ };
      for (let i = 0; i < lvl; i++) { n.next[i] = update[i].next[i]; update[i].next[i] = n; }
      this.snap(`在第 0..${lvl - 1} 層把 ${k} 接進串列`, 6, { c: new Map([[n.id, 'swap']]) });
    } else if (op === 'delete') {
      const { cand, update } = this.search(k);
      if (!cand || cand.key !== k) { this.snap(`找不到 ${k}`, 4); return; }
      this.snap(`找到 ${k}，從它所在的每一層移除`, 7, { c: new Map([[cand.id, 'bad']]) });
      for (let i = 0; i < cand.next.length; i++) if (update[i].next[i] === cand) update[i].next[i] = cand.next[i];
      while (this.level > 1 && !this.head.next[this.level - 1]) this.level--;
      this.snap(`刪除 ${k} 完成`, 7);
    }
  }
}

const skip: DSDef = {
  id: 'ds-skip-list', name: '跳躍串列', en: 'Skip List', cat,
  desc: '在有序鏈結串列上加上多層「快速通道」：每個節點以 1/2 機率往上多一層（隨機層級建構）。搜尋時從最高層開始，能往右就往右，否則往下一層，期望 O(log n)。實作比平衡樹簡單，Redis 的有序集合即以它實作。',
  complexity: [['搜尋／插入／刪除（期望）', 'O(log n)'], ['最差', 'O(n)'], ['空間（期望）', 'O(n)']],
  codes: { search: ['x = head，從最高層開始', '  while x.next[lv].key < k: x = x.next[lv]', '  往下一層', '檢查 x.next[0] 是否為 k'], insert: ['', '', '', '', '隨機決定層數（擲硬幣）', '在每一層把新節點接到 update[lv] 之後'], delete: ['', '', '', '', '', '', '在每一層把 update[lv].next 跳過目標節點'] },
  ops: [
    { key: 'insert', label: '插入', arg: 'number', rand: () => rnd.int(1, 99) },
    { key: 'search', label: '搜尋', arg: 'number', rand: () => rnd.int(1, 99) },
    { key: 'delete', label: '刪除', arg: 'number', rand: () => rnd.int(1, 99) },
  ],
  create: () => new SkipList(),
  init: [30, 10, 50, 20, 70, 40, 60, 80, 25].map((v) => ['insert', v] as [string, number]),
};

export default [segTree, fenwick, dsu, graphDS, skip];
