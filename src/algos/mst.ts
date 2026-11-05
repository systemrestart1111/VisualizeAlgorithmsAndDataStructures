import type { AlgoDef, Color } from '../core/types';
import { Rec, cells, vars, inText } from '../core/helpers';
import { adjacency, gpanel, graphInput, parseGraph } from '../core/graph';

const cat = 'mst';
const DEF = 'A B 7\nA D 5\nB C 8\nB D 9\nB E 7\nC E 5\nD E 15\nD F 6\nE F 8\nE G 9\nF G 11';
const PALETTE: Color[] = ['active', 'path', 'visited', 'good', 'special', 'frontier', 'compare', 'swap'];

class DSU {
  p: Record<string, string> = {};
  constructor(nodes: string[]) {
    for (const n of nodes) this.p[n] = n;
  }
  find(x: string): string {
    while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x]; }
    return x;
  }
  union(a: string, b: string) {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    this.p[ra] = rb;
    return true;
  }
}

const kruskal: AlgoDef = {
  id: 'kruskal', name: '克魯斯卡爾演算法', en: "Kruskal's Algorithm", cat, star: true,
  desc: '把所有邊依權重由小到大排序，依序考慮：若邊的兩端不在同一個集合（用並查集判斷），就加入 MST 並合併集合；否則會形成環而略過。',
  time: 'O(E log E)', space: 'O(V)',
  code: ['把邊依權重排序', 'DSU 初始化：每個點自成一組', 'for (u, v, w) in 排序後的邊:', '  if find(u) != find(v):', '    MST.add(u, v); union(u, v)', '  else: 略過（會成環）', '直到 MST 有 V-1 條邊'],
  inputs: [graphInput(DEF, { weighted: true })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const order = g.edges.map((_, i) => i).sort((a, b) => g.edges[a].w - g.edges[b].w);
    const dsu = new DSU(g.nodes);
    const mst = new Set<number>(), rej = new Set<number>();
    let total = 0;
    const comp = () => {
      const roots = [...new Set(g.nodes.map((n) => dsu.find(n)))];
      return Object.fromEntries(g.nodes.map((n) => [n, PALETTE[roots.indexOf(dsu.find(n)) % PALETTE.length]]));
    };
    const P = (cur = -1) => [gpanel(g, { node: comp(), edge: { ...Object.fromEntries([...mst].map((e) => [e, 'done' as Color])), ...Object.fromEntries([...rej].map((e) => [e, 'muted' as Color])), ...(cur >= 0 ? { [cur]: 'compare' as Color } : {}) } }), cells(order.map((e) => `${g.edges[e].u}${g.edges[e].v}:${g.edges[e].w}`), Object.fromEntries(order.map((e, i) => [i, mst.has(e) ? 'done' : rej.has(e) ? 'muted' : e === cur ? 'compare' : undefined])), { title: '排序後的邊', headers: false }), vars({ 總權重: total, 邊數: mst.size })];
    r.snap('依權重排序所有邊；節點顏色代表所屬集合', P(), 1);
    for (const e of order) {
      if (mst.size === g.nodes.length - 1) break;
      const { u, v, w } = g.edges[e];
      r.snap(`考慮邊 ${u}–${v}（${w}）`, P(e), 3);
      if (dsu.union(u, v)) { mst.add(e); total += w; r.snap(`${u}、${v} 在不同集合 → 加入 MST，合併集合`, P(), 5); }
      else { rej.add(e); r.snap(`${u}、${v} 已在同一集合 → 加入會成環，略過`, P(), 6); }
    }
    r.snap(mst.size === g.nodes.length - 1 ? `完成！MST 總權重 = ${total}` : `圖不連通，得到最小生成森林，總權重 ${total}`, P(), 7);
    return r.frames;
  },
};

const prim: AlgoDef = {
  id: 'prim', name: '普林演算法', en: "Prim's Algorithm", cat, star: true,
  desc: '從任意起點開始逐步長大一棵樹：每次選擇連接「樹內」與「樹外」的最小權重邊，把樹外的那個端點加入樹中（以優先佇列實作）。',
  time: 'O(E log V)', space: 'O(V)',
  code: ['inTree = {s}; pq = s 的所有邊', 'while pq 非空 且 |inTree| < V:', '  (w, u, v) = pq.popMin()', '  if v 已在樹中: continue', '  MST.add(u, v); inTree.add(v)', '  把 v 連到樹外的邊加入 pq'],
  inputs: [graphInput(DEF, { weighted: true }), inText('start', '起點', 'A')],
  run({ graph, start }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const adj = adjacency(g);
    const s = g.nodes.includes(start) ? start : g.nodes[0];
    const inT = new Set([s]);
    const mst = new Set<number>();
    let pq: { w: number; u: string; v: string; ei: number }[] = adj[s].map((a) => ({ w: a.w, u: s, v: a.to, ei: a.ei }));
    let total = 0;
    const P = (cur = -1) => [gpanel(g, { node: { ...Object.fromEntries([...inT].map((x) => [x, 'done' as Color])) }, edge: { ...Object.fromEntries(pq.map((p) => [p.ei, 'frontier' as Color])), ...Object.fromEntries([...mst].map((e) => [e, 'done' as Color])), ...(cur >= 0 ? { [cur]: 'compare' as Color } : {}) } }), cells(pq.length ? [...pq].sort((a, b) => a.w - b.w).map((p) => `${p.u}${p.v}:${p.w}`) : [''], { 0: pq.length ? 'compare' : undefined }, { title: '優先佇列（青色邊）', headers: false }), vars({ 總權重: total })];
    r.snap(`從 ${s} 開始，把它的邊放入優先佇列`, P(), 1);
    while (pq.length && inT.size < g.nodes.length) {
      pq.sort((a, b) => a.w - b.w);
      const { w, u, v, ei } = pq.shift()!;
      if (inT.has(v)) { r.snap(`取出 ${u}–${v}（${w}），但 ${v} 已在樹中，略過`, P(ei), 4); continue; }
      inT.add(v); mst.add(ei); total += w;
      for (const a of adj[v]) if (!inT.has(a.to)) pq.push({ w: a.w, u: v, v: a.to, ei: a.ei });
      pq = pq.filter((p) => !(inT.has(p.u) && inT.has(p.v)));
      r.snap(`取出最小邊 ${u}–${v}（${w}），把 ${v} 加入樹`, P(ei), 5);
    }
    r.snap(`完成！MST 總權重 = ${total}`, P());
    return r.frames;
  },
};

const boruvka: AlgoDef = {
  id: 'boruvka', name: '博魯夫卡演算法', en: "Borůvka's Algorithm", cat,
  desc: '每一輪讓每個連通分量各自選出連到外部的最小邊，同時全部加入，分量數至少減半。最古老的 MST 演算法（1926），天生適合平行化。',
  time: 'O(E log V)', space: 'O(V)',
  code: ['每個點自成一個分量', 'while 分量數 > 1:', '  for 每個分量 C: cheapest[C] = 連出 C 的最小邊', '  for 每個 cheapest 邊 (u, v):', '    if find(u) != find(v): 加入 MST，union', '  （無邊可加則圖不連通，結束）'],
  inputs: [graphInput(DEF, { weighted: true })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const dsu = new DSU(g.nodes);
    const mst = new Set<number>();
    let total = 0, round = 0;
    const comp = () => {
      const roots = [...new Set(g.nodes.map((n) => dsu.find(n)))];
      return Object.fromEntries(g.nodes.map((n) => [n, PALETTE[roots.indexOf(dsu.find(n)) % PALETTE.length]]));
    };
    const P = (cand: Set<number> = new Set()) => [gpanel(g, { node: comp(), edge: { ...Object.fromEntries([...cand].map((e) => [e, 'compare' as Color])), ...Object.fromEntries([...mst].map((e) => [e, 'done' as Color])) } }), vars({ 輪: round, 分量數: new Set(g.nodes.map((n) => dsu.find(n))).size, 總權重: total })];
    r.snap('每個點各自是一個分量', P(), 1);
    for (;;) {
      round++;
      const cheapest: Record<string, number> = {};
      g.edges.forEach((e, i) => {
        const a = dsu.find(e.u), b = dsu.find(e.v);
        if (a === b) return;
        for (const c of [a, b]) if (cheapest[c] === undefined || g.edges[cheapest[c]].w > e.w || (g.edges[cheapest[c]].w === e.w && cheapest[c] > i)) cheapest[c] = i;
      });
      const cand = new Set(Object.values(cheapest));
      if (!cand.size) break;
      r.snap(`第 ${round} 輪：每個分量選出連出去的最小邊（黃色）`, P(cand), 3);
      for (const e of cand) {
        const { u, v, w } = g.edges[e];
        if (dsu.union(u, v)) { mst.add(e); total += w; r.snap(`加入 ${u}–${v}（${w}），合併分量`, P(cand), 5); }
      }
      if (new Set(g.nodes.map((n) => dsu.find(n))).size === 1) break;
    }
    r.snap(`完成！MST 總權重 = ${total}`, P());
    return r.frames;
  },
};

export default [kruskal, prim, boruvka];
