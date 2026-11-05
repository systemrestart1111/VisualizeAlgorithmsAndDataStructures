import type { AlgoDef, Color, TablePanel } from '../core/types';
import { Rec, cells, vars, inText, inSelect, table, fmt } from '../core/helpers';
import { adjacency, gpanel, graphInput, parseGraph, type G } from '../core/graph';

const cat = 'path';
const startIn = (def = 'A') => inText('start', '起點', def);
const pick = (g: G, s: string) => (g.nodes.includes(s) ? s : g.nodes[0]);
const DEF_W = 'A B 4\nA C 2\nB C 5\nB D 10\nC E 3\nE D 4\nD F 11\nE F 8\nC F 12\nB E 6';

const distSub = (dist: Record<string, number>) => Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, fmt(v)]));

const dijkstra: AlgoDef = {
  id: 'dijkstra', name: '戴克斯特拉演算法', en: "Dijkstra's Algorithm", cat, star: true,
  desc: '單源最短路徑（邊權非負）：每次從優先佇列取出目前距離最小且尚未確定的點，確定其距離，並鬆弛它的所有出邊。',
  time: 'O((V + E) log V)', space: 'O(V)',
  code: ['dist[*] = ∞, dist[s] = 0', 'pq = {(0, s)}', 'while pq 非空:', '  (d, u) = pq.popMin()', '  if u 已確定: continue', '  標記 u 已確定', '  for (v, w) in adj[u]:', '    if dist[u] + w < dist[v]:', '      dist[v] = dist[u] + w; pq.push((dist[v], v))'],
  inputs: [graphInput(DEF_W, { weighted: true }), inSelect('dir', '圖的類型', [['u', '無向圖'], ['d', '有向圖']]), startIn()],
  run({ graph, dir, start }) {
    const r = new Rec();
    const g = parseGraph(graph, dir === 'd');
    const adj = adjacency(g);
    const s = pick(g, start);
    const dist: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, Infinity]));
    const par: Record<string, number | undefined> = {};
    dist[s] = 0;
    const pq: [number, string][] = [[0, s]];
    const done = new Set<string>();
    const P = (u = '', ec: Record<number, Color> = {}) => {
      const tree = new Set<number>();
      for (const n of g.nodes) if (par[n] !== undefined) tree.add(par[n]!);
      const sorted = [...pq].sort((a, b) => a[0] - b[0]);
      return [gpanel(g, { node: { ...Object.fromEntries(pq.map(([, x]) => [x, 'frontier' as Color])), ...Object.fromEntries([...done].map((x) => [x, 'done' as Color])), ...(u ? { [u]: 'active' as Color } : {}) }, edge: { ...Object.fromEntries([...tree].map((e) => [e, 'path' as Color])), ...ec }, sub: distSub(dist) }), cells(sorted.length ? sorted.map(([d, x]) => `${x}:${d}`) : [''], { 0: sorted.length ? 'compare' : undefined }, { title: '優先佇列（依距離排序）', headers: false, w: 'half' })];
    };
    r.snap(`dist[${s}] = 0，其他為 ∞`, P(), 1);
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift()!;
      if (done.has(u)) { r.snap(`取出 (${d}, ${u})，但 ${u} 已確定，略過`, P(), 5); continue; }
      done.add(u);
      r.snap(`取出距離最小的 ${u}（${d}），確定其最短距離`, P(u), 6);
      for (const { to, w, ei } of adj[u]) {
        if (done.has(to)) continue;
        if (dist[u] + w < dist[to]) {
          const old = dist[to];
          dist[to] = dist[u] + w;
          par[to] = ei;
          pq.push([dist[to], to]);
          r.snap(`鬆弛 ${u}→${to}：${dist[u]} + ${w} = ${dist[to]} < ${fmt(old)}，更新`, P(u, { [ei]: 'swap' }), 9);
        } else r.snap(`${u}→${to}：${dist[u]} + ${w} ≥ ${dist[to]}，不更新`, P(u, { [ei]: 'compare' }), 8);
      }
    }
    r.snap('完成！粗線為最短路徑樹，節點下方為最短距離', P());
    return r.frames;
  },
};

const bellman: AlgoDef = {
  id: 'bellman-ford', name: '貝爾曼–福特演算法', en: 'Bellman–Ford Algorithm', cat, star: true,
  desc: '單源最短路徑，可處理負權邊：對所有邊重複鬆弛 V−1 輪。第 V 輪若仍能鬆弛，代表存在可到達的負環。',
  time: 'O(V · E)', space: 'O(V)',
  code: ['dist[*] = ∞, dist[s] = 0', 'repeat V-1 次:', '  for (u, v, w) in E:', '    if dist[u] + w < dist[v]:', '      dist[v] = dist[u] + w', 'for (u, v, w) in E:', '  if dist[u] + w < dist[v]: 有負環'],
  inputs: [{ ...graphInput('A B 6\nA C 7\nB D 5\nB C 8\nB E -4\nC D -3\nC E 9\nD B -2\nE D 7\nE A 2', { directed: true, weighted: true, negative: true, m: 10 }) }, startIn()],
  run({ graph, start }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    const s = pick(g, start);
    const n = g.nodes.length;
    const dist: Record<string, number> = Object.fromEntries(g.nodes.map((x) => [x, Infinity]));
    const par: Record<string, number | undefined> = {};
    dist[s] = 0;
    const P = (ec: Record<number, Color> = {}, nc: Record<string, Color> = {}) => {
      const tree = new Set<number>();
      for (const x of g.nodes) if (par[x] !== undefined) tree.add(par[x]!);
      return [gpanel(g, { node: { [s]: 'special', ...nc }, edge: { ...Object.fromEntries([...tree].map((e) => [e, 'path' as Color])), ...ec }, sub: distSub(dist) })];
    };
    r.snap(`dist[${s}] = 0`, P(), 1);
    for (let it = 1; it < n; it++) {
      let changed = false;
      for (let i = 0; i < g.edges.length; i++) {
        const { u, v, w } = g.edges[i];
        if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          par[v] = i;
          changed = true;
          r.snap(`第 ${it} 輪：鬆弛 ${u}→${v}（${w}），dist[${v}] = ${dist[v]}`, [...P({ [i]: 'swap' }, { [v]: 'active' }), vars({ 輪: it })], 5);
        } else r.snap(`第 ${it} 輪：檢查 ${u}→${v}（${w}），不更新`, [...P({ [i]: 'compare' }), vars({ 輪: it })], 4);
      }
      if (!changed) { r.snap(`第 ${it} 輪沒有任何更新，提早結束`, P(), 2); break; }
    }
    for (let i = 0; i < g.edges.length; i++) {
      const { u, v, w } = g.edges[i];
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        r.snap(`第 V 輪檢查：${u}→${v} 仍可鬆弛 → 存在負環！`, P({ [i]: 'bad' }, { [u]: 'bad', [v]: 'bad' }), 7);
        return r.frames;
      }
    }
    r.snap('沒有負環，最短距離如節點下方所示', P(), 6);
    return r.frames;
  },
};

const floyd: AlgoDef = {
  id: 'floyd-warshall', name: '弗洛伊德–沃舍爾演算法', en: 'Floyd–Warshall Algorithm', cat, star: true,
  desc: '全點對最短路徑（DP）：dist[i][j] 依序嘗試以 k = 1..V 作為中繼點，dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])。',
  time: 'O(V³)', space: 'O(V²)',
  code: ['dist = 鄰接矩陣（無邊為 ∞，dist[i][i] = 0）', 'for k in V:', '  for i in V:', '    for j in V:', '      if dist[i][k] + dist[k][j] < dist[i][j]:', '        dist[i][j] = dist[i][k] + dist[k][j]'],
  inputs: [graphInput('A B 3\nA C 8\nA E -4\nB D 1\nB E 7\nC B 4\nD A 2\nD C -5\nE D 6', { directed: true, weighted: true, n: 5, m: 8 })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    const N = g.nodes;
    const idx = Object.fromEntries(N.map((n, i) => [n, i]));
    const D = N.map((_, i) => N.map((_, j) => (i === j ? 0 : Infinity)));
    for (const e of g.edges) D[idx[e.u]][idx[e.v]] = Math.min(D[idx[e.u]][idx[e.v]], e.w);
    const T = (c: Record<string, Color> = {}) => table(D, c, { rowHeaders: N, colHeaders: N, title: 'dist[i][j]', w: 'half' });
    r.snap('初始化距離矩陣', [gpanel(g, { w: 'half' }), T()], 1);
    for (let k = 0; k < N.length; k++) {
      const kc: Record<string, Color> = {};
      for (let x = 0; x < N.length; x++) { kc[`${k},${x}`] = 'frontier'; kc[`${x},${k}`] = 'frontier'; }
      r.snap(`以 ${N[k]} 作為中繼點（青色為第 k 列／行）`, [gpanel(g, { node: { [N[k]]: 'special' }, w: 'half' }), T(kc)], 2);
      for (let i = 0; i < N.length; i++)
        for (let j = 0; j < N.length; j++) {
          if (i === k || j === k || i === j) continue;
          if (D[i][k] + D[k][j] < D[i][j]) {
            const old = D[i][j];
            D[i][j] = D[i][k] + D[k][j];
            r.snap(`dist[${N[i]}][${N[j]}]：${fmt(old)} → ${D[i][k]} + ${D[k][j]} = ${D[i][j]}`, [gpanel(g, { node: { [N[k]]: 'special', [N[i]]: 'active', [N[j]]: 'active' }, w: 'half' }), T({ ...kc, [`${i},${k}`]: 'compare', [`${k},${j}`]: 'compare', [`${i},${j}`]: 'swap' })], 6);
          }
        }
    }
    const neg = N.some((_, i) => D[i][i] < 0);
    r.snap(neg ? '對角線出現負值 → 圖中有負環' : '完成：全點對最短距離', [gpanel(g, { w: 'half' }), T(neg ? Object.fromEntries(N.map((_, i) => [`${i},${i}`, D[i][i] < 0 ? 'bad' : undefined])) as Record<string, Color> : {})]);
    return r.frames;
  },
};

const dag: AlgoDef = {
  id: 'dag-shortest', name: '有向無環圖最短路徑', en: 'Shortest Path in DAG', cat,
  desc: '有向無環圖可先做拓撲排序，再依拓撲順序鬆弛每個點的出邊；每條邊只需處理一次，且允許負權。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['order = topologicalSort(G)', 'dist[*] = ∞, dist[s] = 0', 'for u in order:', '  if dist[u] == ∞: continue', '  for (v, w) in adj[u]:', '    dist[v] = min(dist[v], dist[u] + w)'],
  inputs: [graphInput('A B 5\nA C 3\nB C 2\nB D 6\nC D 7\nC E 4\nC F 2\nD E -1\nD F 1\nE F -2', { directed: true, dag: true, weighted: true }), startIn()],
  run({ graph, start }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    const adj = adjacency(g);
    const s = pick(g, start);
    const indeg: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, 0]));
    for (const e of g.edges) indeg[e.v]++;
    const q = g.nodes.filter((n) => !indeg[n]);
    const order: string[] = [];
    while (q.length) { const u = q.shift()!; order.push(u); for (const { to } of adj[u]) if (--indeg[to] === 0) q.push(to); }
    if (order.length < g.nodes.length) { r.snap('圖中有環，不是 DAG', [gpanel(g)], 1); return r.frames; }
    const dist: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, Infinity]));
    const par: Record<string, number | undefined> = {};
    dist[s] = 0;
    const P = (u: string, ec: Record<number, Color> = {}) => {
      const tree = new Set<number>(g.nodes.map((n) => par[n]).filter((x): x is number => x !== undefined));
      return [gpanel(g, { node: { [s]: 'special', ...(u ? { [u]: 'active' as Color } : {}) }, edge: { ...Object.fromEntries([...tree].map((e) => [e, 'path' as Color])), ...ec }, sub: distSub(dist) }), cells(order, { [order.indexOf(u)]: 'active' }, { title: '拓撲順序', headers: false })];
    };
    r.snap(`拓撲順序：${order.join(' → ')}`, P(''), 1);
    for (const u of order) {
      if (dist[u] === Infinity) { r.snap(`${u} 無法從 ${s} 到達，略過`, P(u), 4); continue; }
      r.snap(`處理 ${u}（dist = ${dist[u]}）`, P(u), 3);
      for (const { to, w, ei } of adj[u])
        if (dist[u] + w < dist[to]) { dist[to] = dist[u] + w; par[to] = ei; r.snap(`鬆弛 ${u}→${to}：dist[${to}] = ${dist[to]}`, P(u, { [ei]: 'swap' }), 6); }
    }
    r.snap('完成', P(''));
    return r.frames;
  },
};

const zeroOne: AlgoDef = {
  id: 'zero-one-bfs', name: '零一權重最短路徑', en: '0–1 BFS', cat,
  desc: '邊權只有 0 或 1 時的最短路徑：用雙端佇列，權重 0 的邊把鄰居放到隊首、權重 1 的放到隊尾，達到 O(V + E)。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['dist[s] = 0, dq = [s]', 'while dq 非空:', '  u = dq.popFront()', '  for (v, w) in adj[u]:', '    if dist[u] + w < dist[v]:', '      dist[v] = dist[u] + w', '      w == 0 ? dq.pushFront(v) : dq.pushBack(v)'],
  inputs: [{ ...graphInput('A B 0\nA C 1\nB D 1\nB C 0\nC E 1\nD E 0\nD F 1\nE G 0\nF G 1\nE F 1', { weighted: true, minW: 0, maxW: 1 }) }, startIn()],
  run({ graph, start }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    g.edges.forEach((e) => (e.w = e.w ? 1 : 0));
    const adj = adjacency(g);
    const s = pick(g, start);
    const dist: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, Infinity]));
    dist[s] = 0;
    const dq = [s];
    const P = (u: string, ec: Record<number, Color> = {}) => [gpanel(g, { node: { ...Object.fromEntries(dq.map((x) => [x, 'frontier' as Color])), [u]: 'active' }, edge: { ...Object.fromEntries(g.edges.map((e, i) => [i, e.w === 0 ? 'muted' as Color : undefined])), ...ec }, sub: distSub(dist), edgeLabel: Object.fromEntries(g.edges.map((e, i) => [i, String(e.w)])) }), cells(dq.length ? dq : [''], {}, { title: '雙端佇列（左為隊首）', headers: false, w: 'half' })];
    r.snap(`dist[${s}] = 0`, P(s), 1);
    while (dq.length) {
      const u = dq.shift()!;
      r.snap(`從隊首取出 ${u}`, P(u), 3);
      for (const { to, w, ei } of adj[u])
        if (dist[u] + w < dist[to]) {
          dist[to] = dist[u] + w;
          if (w === 0) dq.unshift(to); else dq.push(to);
          r.snap(`${u}→${to} 權重 ${w}：dist[${to}] = ${dist[to]}，放到${w === 0 ? '隊首' : '隊尾'}`, P(u, { [ei]: 'swap' }), 7);
        }
    }
    r.snap('完成', P(''));
    return r.frames;
  },
};

const johnson: AlgoDef = {
  id: 'johnson', name: '強森演算法', en: "Johnson's Algorithm", cat,
  desc: '稀疏圖的全點對最短路徑（允許負權）：新增虛擬點 q 連到所有點（權 0），以 Bellman–Ford 求勢能 h；把每條邊重新加權為 w + h(u) − h(v) ≥ 0，再從每個點跑 Dijkstra，最後還原距離。',
  time: 'O(V · E log V)', space: 'O(V²)',
  code: ['加入虛擬點 q，q→v 權重 0', 'h = BellmanFord(q)；若有負環則停止', "w'(u,v) = w(u,v) + h[u] - h[v]  (≥ 0)", 'for u in V:', "  d' = Dijkstra(u) on w'", "  dist[u][v] = d'[v] - h[u] + h[v]"],
  inputs: [graphInput('A B -2\nA C 4\nB C 3\nB D 2\nB E 6\nC E -1\nD A 1\nD E 5\nE D 2', { directed: true, weighted: true, negative: true, n: 5, m: 8 })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    const N = g.nodes;
    const h: Record<string, number> = Object.fromEntries(N.map((n) => [n, 0]));
    r.snap('加入虛擬點 q 連到每個點（權 0），初始 h = 0', [gpanel(g, { sub: h })], 1);
    for (let it = 0; it <= N.length; it++) {
      let ch = false;
      for (let i = 0; i < g.edges.length; i++) {
        const { u, v, w } = g.edges[i];
        if (h[u] + w < h[v]) { h[v] = h[u] + w; ch = true; r.snap(`Bellman–Ford：鬆弛 ${u}→${v}，h[${v}] = ${h[v]}`, [gpanel(g, { sub: h, edge: { [i]: 'swap' }, node: { [v]: 'active' } })], 2); }
      }
      if (!ch) break;
      if (it === N.length) { r.snap('存在負環，停止', [gpanel(g, { sub: h })], 2); return r.frames; }
    }
    const rw = g.edges.map((e) => e.w + h[e.u] - h[e.v]);
    const g2: G = { ...g, edges: g.edges.map((e, i) => ({ ...e, w: rw[i] })) };
    r.snap("重新加權：w' = w + h[u] − h[v]，所有邊權變成非負", [gpanel(g, { sub: h, title: '原圖（下方為 h）', w: 'half' }), gpanel(g2, { title: "重新加權後的圖 w'", w: 'half', hideWeights: false, edgeLabel: Object.fromEntries(rw.map((w, i) => [i, String(w)])) })], 3);
    const adj = adjacency(g2);
    const D = N.map(() => N.map(() => Infinity as number));
    for (let si = 0; si < N.length; si++) {
      const s = N[si];
      const d: Record<string, number> = Object.fromEntries(N.map((n) => [n, Infinity]));
      d[s] = 0;
      const done = new Set<string>();
      for (;;) {
        let u = '';
        for (const n of N) if (!done.has(n) && d[n] < Infinity && (!u || d[n] < d[u])) u = n;
        if (!u) break;
        done.add(u);
        for (const { to, w } of adj[u]) if (d[u] + w < d[to]) d[to] = d[u] + w;
      }
      N.forEach((v, j) => (D[si][j] = d[v] === Infinity ? Infinity : d[v] - h[s] + h[v]));
      r.snap(`從 ${s} 執行 Dijkstra（w'），再還原：dist = d' − h[${s}] + h[v]`, [gpanel(g2, { node: { [s]: 'special' }, sub: distSub(d), title: "w' 上的 Dijkstra 距離 d'", w: 'half', edgeLabel: Object.fromEntries(rw.map((w, i) => [i, String(w)])) }), table(D, Object.fromEntries(N.map((_, j) => [`${si},${j}`, 'swap'])) as Record<string, Color>, { rowHeaders: N, colHeaders: N, title: '全點對最短距離', w: 'half' })], 6);
    }
    r.snap('完成', [gpanel(g, { w: 'half' }), table(D, {}, { rowHeaders: N, colHeaders: N, title: '全點對最短距離', w: 'half' })]);
    return r.frames;
  },
};

// ---------------- 格子地圖 ----------------

interface Grid {
  h: number;
  w: number;
  wall: boolean[][];
  s: [number, number];
  e: [number, number];
}

export function parseGrid(src: string): Grid {
  const lines = src.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim());
  const h = lines.length, w = Math.max(...lines.map((l) => l.length));
  let s: [number, number] = [0, 0], e: [number, number] = [h - 1, w - 1];
  const wall = lines.map((l, r) => Array.from({ length: w }, (_, c) => {
    const ch = l[c] ?? '.';
    if (ch === 'S') s = [r, c];
    if (ch === 'E') e = [r, c];
    return ch === '#';
  }));
  wall[s[0]][s[1]] = false;
  wall[e[0]][e[1]] = false;
  return { h, w, wall, s, e };
}

export function randomGridText(h: number, w: number, density = 0.28) {
  for (let tries = 0; tries < 50; tries++) {
    const rows: string[][] = Array.from({ length: h }, () => Array.from({ length: w }, () => (Math.random() < density ? '#' : '.')));
    rows[0][0] = 'S';
    rows[h - 1][w - 1] = 'E';
    // 確認可達
    const seen = new Set(['0,0']);
    const q: [number, number][] = [[0, 0]];
    while (q.length) {
      const [r, c] = q.shift()!;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= h || nc >= w || rows[nr][nc] === '#' || seen.has(nr + ',' + nc)) continue;
        seen.add(nr + ',' + nc);
        q.push([nr, nc]);
      }
    }
    if (seen.has(`${h - 1},${w - 1}`)) return rows.map((r) => r.join('')).join('\n');
  }
  return 'S' + '.'.repeat(w - 1) + '\n' + Array.from({ length: h - 1 }, (_, i) => '.'.repeat(w - 1) + (i === h - 2 ? 'E' : '.')).join('\n');
}

const DEF_GRID = ['S.....#.........', '.####.#.#######.', '.#....#.......#.', '.#.#######.##.#.', '.#..........#...', '.#######.#.###.#', '.........#...#..', '########.####.#.', '..............#E'].join('\n');

const gridInput = (def = DEF_GRID, h = 11, w = 18) => ({ key: 'grid', label: '地圖（S 起點、E 終點、# 牆）', type: 'text' as const, multiline: true, default: def, random: () => randomGridText(h, w) });

const DIRS: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const key = (r: number, c: number) => `${r},${c}`;

function gridPanel(G: Grid, color: Record<string, Color | undefined>, txt?: Record<string, string | number>): TablePanel {
  const rows = Array.from({ length: G.h }, (_, r) => Array.from({ length: G.w }, (_, c) => (r === G.s[0] && c === G.s[1] ? 'S' : r === G.e[0] && c === G.e[1] ? 'E' : txt?.[key(r, c)] ?? '')));
  const col: Record<string, Color | undefined> = {};
  for (let r = 0; r < G.h; r++) for (let c = 0; c < G.w; c++) {
    if (G.wall[r][c]) col[key(r, c)] = 'muted';
    else if (color[key(r, c)]) col[key(r, c)] = color[key(r, c)];
  }
  col[key(...G.s)] = 'special';
  col[key(...G.e)] = col[key(...G.e)] === 'path' ? 'path' : 'bad';
  return table(rows, col, { cell: G.w > 24 ? 16 : 24, title: '格子地圖（灰色為牆）' });
}

const manhattan = (a: [number, number], b: [number, number]) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);

function bestFirst(G: Grid, mode: 'astar' | 'greedy', r: Rec) {
  const g: Record<string, number> = { [key(...G.s)]: 0 };
  const par: Record<string, string> = {};
  const open: [number, number, number][] = [[manhattan(G.s, G.e), G.s[0], G.s[1]]];
  const closed = new Set<string>();
  const C = (): Record<string, Color> => ({ ...Object.fromEntries([...closed].map((k) => [k, 'visited' as Color])), ...Object.fromEntries(open.map(([, rr, cc]) => [key(rr, cc), 'frontier' as Color])) });
  const label = mode === 'astar' ? 'f = g + h' : 'h';
  r.snap(`把起點放入開放集合（優先值 ${label}）`, [gridPanel(G, C()), vars({ 開放: open.length, 關閉: 0 })], 1);
  while (open.length) {
    open.sort((a, b) => a[0] - b[0] || manhattan([a[1], a[2]], G.e) - manhattan([b[1], b[2]], G.e));
    const [, cr, cc] = open.shift()!;
    const k = key(cr, cc);
    if (closed.has(k)) continue;
    closed.add(k);
    if (cr === G.e[0] && cc === G.e[1]) {
      const path = new Set<string>();
      for (let x: string | undefined = k; x; x = par[x]) path.add(x);
      r.snap(`抵達終點！路徑長度 ${path.size - 1}，共展開 ${closed.size} 格`, [gridPanel(G, { ...C(), ...Object.fromEntries([...path].map((p) => [p, 'path' as Color])) }), vars({ 路徑長: path.size - 1, 展開: closed.size })], 4);
      return;
    }
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nc < 0 || nr >= G.h || nc >= G.w || G.wall[nr][nc]) continue;
      const nk = key(nr, nc);
      const ng = g[k] + 1;
      if (closed.has(nk) || (g[nk] !== undefined && ng >= g[nk])) continue;
      g[nk] = ng;
      par[nk] = k;
      const hh = manhattan([nr, nc], G.e);
      open.push([mode === 'astar' ? ng + hh : hh, nr, nc]);
    }
    r.snap(`展開 (${cr}, ${cc})：g = ${g[k]}，h = ${manhattan([cr, cc], G.e)}`, [gridPanel(G, { ...C(), [k]: 'active' }), vars({ 開放: open.length, 關閉: closed.size })], mode === 'astar' ? 6 : 6);
  }
  r.snap('開放集合已空，無法到達終點', [gridPanel(G, C())]);
}

const astar: AlgoDef = {
  id: 'a-star', name: 'A* 搜尋', en: 'A* Search', cat, star: true,
  desc: '以 f(n) = g(n) + h(n) 排序的最佳優先搜尋：g 為起點到 n 的實際成本，h 為 n 到終點的估計（此處用曼哈頓距離，是可採納的啟發函數），保證找到最短路徑且通常比 Dijkstra 展開更少節點。',
  time: '最差 O(E log V)', space: 'O(V)',
  code: ['open = {start}, g[start] = 0', 'while open 非空:', '  cur = open 中 f = g + h 最小者', '  if cur == goal: 回溯路徑', '  closed.add(cur)', '  for nb in neighbors(cur):', '    若 g[cur] + 1 < g[nb]: 更新 g、parent，放入 open'],
  inputs: [gridInput()],
  run({ grid }) {
    const r = new Rec();
    bestFirst(parseGrid(grid), 'astar', r);
    return r.frames;
  },
};

const greedyBF: AlgoDef = {
  id: 'greedy-best-first', name: '貪婪最佳優先搜尋', en: 'Greedy Best-First Search', cat,
  desc: '只依啟發值 h(n)（到終點的估計距離）選擇下一個節點。通常非常快，但不保證最短路徑——可和 A* 比較同一張地圖的結果。',
  time: '最差 O(E log V)', space: 'O(V)',
  code: ['open = {start}', 'while open 非空:', '  cur = open 中 h 最小者', '  if cur == goal: 回溯路徑', '  closed.add(cur)', '  for nb in neighbors(cur): 若未拜訪則放入 open'],
  inputs: [gridInput()],
  run({ grid }) {
    const r = new Rec();
    bestFirst(parseGrid(grid), 'greedy', r);
    return r.frames;
  },
};

const bidir: AlgoDef = {
  id: 'bidirectional-bfs', name: '雙向廣度優先搜尋', en: 'Bidirectional BFS', cat,
  desc: '同時從起點與終點各做一次 BFS，每次擴展較小的一邊，兩邊的搜尋範圍相遇時即找到最短路徑。展開節點數約為單向 BFS 的平方根等級。',
  time: 'O(b^(d/2))', space: 'O(b^(d/2))',
  code: ['qS = [S], qE = [E]', 'while qS 與 qE 都非空:', '  選擇較小的一邊擴展一整層', '  for nb in 該層節點的鄰居:', '    if nb 已被另一邊拜訪: 相遇！組合路徑', '    if nb 未被本邊拜訪: 加入佇列'],
  inputs: [gridInput()],
  run({ grid }) {
    const r = new Rec();
    const G = parseGrid(grid);
    const pa: Record<string, string | null> = { [key(...G.s)]: null }, pb: Record<string, string | null> = { [key(...G.e)]: null };
    let qa = [key(...G.s)], qb = [key(...G.e)];
    const C = (): Record<string, Color> => ({ ...Object.fromEntries(Object.keys(pa).map((k) => [k, 'active' as Color])), ...Object.fromEntries(Object.keys(pb).map((k) => [k, 'visited' as Color])) });
    r.snap('從兩端同時開始（藍：起點側，紫：終點側）', [gridPanel(G, C())], 1);
    while (qa.length && qb.length) {
      const fromA = qa.length <= qb.length;
      const [q, mine, other] = fromA ? [qa, pa, pb] : [qb, pb, pa];
      const next: string[] = [];
      for (const k of q) {
        const [cr, cc] = k.split(',').map(Number);
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr, nc = cc + dc;
          if (nr < 0 || nc < 0 || nr >= G.h || nc >= G.w || G.wall[nr][nc]) continue;
          const nk = key(nr, nc);
          if (nk in mine) continue;
          mine[nk] = k;
          if (nk in other) {
            const path = new Set<string>();
            for (let x: string | null = nk; x; x = pa[x]) path.add(x);
            for (let x: string | null = nk; x; x = pb[x]) path.add(x);
            r.snap(`兩邊在 (${nr}, ${nc}) 相遇！路徑長度 ${path.size - 1}`, [gridPanel(G, { ...C(), ...Object.fromEntries([...path].map((p) => [p, 'path' as Color])), [nk]: 'done' }), vars({ 展開: Object.keys(pa).length + Object.keys(pb).length })], 5);
            return r.frames;
          }
          next.push(nk);
        }
      }
      if (fromA) qa = next; else qb = next;
      r.snap(`擴展${fromA ? '起點' : '終點'}側一層（${q.length} 個節點）`, [gridPanel(G, C()), vars({ 起點側佇列: qa.length, 終點側佇列: qb.length })], 3);
    }
    r.snap('無法相遇，終點不可達', [gridPanel(G, C())]);
    return r.frames;
  },
};

const idastar: AlgoDef = {
  id: 'ida-star', name: '迭代加深 A* 搜尋', en: 'Iterative Deepening A*', cat,
  desc: '結合迭代加深與 A*：以 f = g + h 為門檻做深度優先搜尋，超過門檻就剪枝並記錄最小超出值作為下一輪門檻。記憶體只需 O(d)，但會重複展開節點。（使用小地圖以免步驟過多）',
  time: '最差指數級', space: 'O(d)',
  code: ['bound = h(start)', 'loop:', '  t = search(start, g=0, bound)', '  if t == FOUND: return path', '  if t == ∞: return 無解', '  bound = t', 'search(n, g, bound):', '  f = g + h(n); if f > bound: return f', '  if n == goal: return FOUND', '  min = ∞；對每個不在路徑上的鄰居遞迴，取最小回傳值'],
  inputs: [gridInput(['S..#....', '.#.#.##.', '.#...#..', '.####.#.', '......#E'].join('\n'), 6, 8)],
  run({ grid }) {
    const r = new Rec();
    const G = parseGrid(grid);
    const goal = key(...G.e);
    let bound = manhattan(G.s, G.e);
    const path: string[] = [key(...G.s)];
    const onPath = new Set(path);
    let expanded = new Set<string>();
    let steps = 0;
    const P = (msg: string, line: number, extra: Record<string, Color> = {}) => {
      if (steps++ > 1500) return;
      r.snap(msg, [gridPanel(G, { ...Object.fromEntries([...expanded].map((k) => [k, 'visited' as Color])), ...Object.fromEntries(path.map((k) => [k, 'active' as Color])), ...extra }), vars({ bound, 深度: path.length - 1 })], line);
    };
    const search = (g: number): number => {
      const k = path[path.length - 1];
      const [cr, cc] = k.split(',').map(Number);
      const f = g + manhattan([cr, cc], G.e);
      if (f > bound) { P(`f = ${g} + ${f - g} = ${f} > bound ${bound}，剪枝`, 8, { [k]: 'bad' }); return f; }
      if (k === goal) return -1;
      expanded.add(k);
      P(`展開 (${cr}, ${cc})，f = ${f}`, 10);
      let mn = Infinity;
      for (const [dr, dc] of DIRS) {
        const nr = cr + dr, nc = cc + dc;
        if (nr < 0 || nc < 0 || nr >= G.h || nc >= G.w || G.wall[nr][nc]) continue;
        const nk = key(nr, nc);
        if (onPath.has(nk)) continue;
        path.push(nk); onPath.add(nk);
        const t = search(g + 1);
        if (t === -1) return -1;
        mn = Math.min(mn, t);
        path.pop(); onPath.delete(nk);
      }
      return mn;
    };
    for (let it = 0; it < 30; it++) {
      expanded = new Set();
      P(`新一輪：bound = ${bound}`, 3);
      const t = search(0);
      if (t === -1) { r.snap(`找到路徑！長度 ${path.length - 1}`, [gridPanel(G, Object.fromEntries(path.map((k) => [k, 'path' as Color]))), vars({ bound })], 4); return r.frames; }
      if (t === Infinity) { r.snap('無解', [gridPanel(G, {})], 5); return r.frames; }
      bound = t;
      r.snap(`本輪失敗，下一輪 bound = 最小超出值 ${t}`, [gridPanel(G, {}), vars({ bound })], 6);
    }
    return r.frames;
  },
};

export default [dijkstra, bellman, floyd, dag, zeroOne, johnson, bidir, astar, idastar, greedyBF];
