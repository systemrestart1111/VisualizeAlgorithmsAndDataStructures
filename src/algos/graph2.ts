// 擴充的圖論與樹上技巧
import type { AlgoDef, Color, GEdge, GNode, Panel } from '../core/types';
import { Rec, cells, inNum, inSeed, inSelect, inText, rnd, table, text, vars } from '../core/helpers';
import { adjacency, gpanel, graphInput, layoutTree, parseGraph, randomTreeText, rootTree, type G } from '../core/graph';
import { parkMiller } from '../core/extra';

const PALETTE: Color[] = ['active', 'path', 'visited', 'good', 'special', 'frontier', 'compare', 'swap', 'done', 'bad'];
const pick = (g: G, s: string) => (g.nodes.includes(String(s).trim()) ? String(s).trim() : g.nodes[0]);
const treeInput = (def: string, n = 9) => ({ key: 'graph', label: '樹（每行：父 子）', type: 'text' as const, multiline: true, default: def, random: () => randomTreeText(rnd.int(n - 2, n + 2)) });
const nodesOf = (c: Record<string, any>) => parseGraph(String(c.graph), false).nodes;
const DEF_TREE = '1 2\n1 3\n2 4\n2 5\n3 6\n3 7\n5 8\n5 9\n7 10';

/** 以 root 為根的樹面板 */
function treePanel(g: G, root: string, o: { node?: Record<string, Color | undefined>; sub?: Record<string, string | number | undefined>; badge?: Record<string, string | undefined>; title?: string; w?: 'full' | 'half'; edge?: (p: string, c: string) => Color | undefined } = {}): Panel {
  const { children } = rootTree(g, root);
  const pos = layoutTree(root, children, 50, 64);
  const nodes: GNode[] = g.nodes.filter((n) => pos[n]).map((n) => ({ id: n, x: pos[n].x, y: pos[n].y, label: n, color: o.node?.[n], sub: o.sub?.[n] !== undefined ? String(o.sub[n]) : undefined, badge: o.badge?.[n] }));
  const edges: GEdge[] = Object.entries(children).flatMap(([p, cs]) => cs.map((c) => ({ from: p, to: c, color: o.edge?.(p, c) })));
  return { type: 'graph', nodes, edges, title: o.title, w: o.w };
}

// ---------------- 多源 BFS ----------------
const DEF_GRID = 'S....#....\n.##..#.##.\n....#....S\n.#.....#..\n.#.##.....\n...#...S..';
const parseGrid = (s: string) => {
  const rows = String(s).split('\n').map((r) => r.trim()).filter(Boolean);
  if (!rows.length) throw new Error('請輸入格子');
  if (rows.some((r) => r.length !== rows[0].length)) throw new Error('每一列長度必須相同');
  if (rows.length * rows[0].length > 400) throw new Error('格子最多 400 格');
  return rows.map((r) => r.split(''));
};
const multiBfs: AlgoDef = {
  id: 'multi-source-bfs', name: '多源廣度優先搜尋', en: 'Multi-source BFS', cat: 'graph',
  desc: '把所有起點同時放進佇列、距離都設為 0，再照常做 BFS。波前會從所有起點一起往外擴散，每格第一次被碰到時的距離就是「到最近起點」的距離，只需一次 O(V + E)，結果等於對每個起點各跑一次 BFS 再取最小值。',
  time: 'O(V + E)（格子為 O(R·C)）', space: 'O(V)',
  code: ['q = 所有起點；dist[s] = 0', 'while q 非空:', '  u = q.dequeue()', '  for v in 鄰居(u)（不是牆）:', '    if dist[v] 未設定:', '      dist[v] = dist[u] + 1；q.enqueue(v)', '結果 = 到最近起點的距離'],
  inputs: [inText('grid', '格子（S 起點、# 牆、. 空地）', DEF_GRID, () => { const g = Array.from({ length: 6 }, () => Array.from({ length: 10 }, () => (Math.random() < 0.05 ? 'S' : Math.random() < 0.2 ? '#' : '.'))); g[rnd.int(0, 5)][rnd.int(0, 9)] = 'S'; return g.map((row) => row.join('')).join('\n'); }, true)],
  run({ grid }) {
    const r = new Rec();
    const G = parseGrid(grid);
    const R = G.length, C = G[0].length;
    const dist: (number | null)[][] = G.map((row) => row.map(() => null));
    const q: [number, number][] = [];
    G.forEach((row, i) => row.forEach((ch, j) => { if (ch === 'S') { dist[i][j] = 0; q.push([i, j]); } }));
    if (!q.length) throw new Error('至少要有一個起點 S');
    const view = (hl: [number, number] | null, front: [number, number][], msg: string, line: number) => {
      const colors: Record<string, Color> = {};
      G.forEach((row, i) => row.forEach((ch, j) => { if (ch === '#') colors[`${i},${j}`] = 'muted'; else if (ch === 'S') colors[`${i},${j}`] = 'done'; else if (dist[i][j] !== null) colors[`${i},${j}`] = 'visited'; }));
      for (const [i, j] of front) colors[`${i},${j}`] = 'frontier';
      if (hl) colors[`${hl[0]},${hl[1]}`] = 'active';
      r.snap(msg, [table(G.map((row, i) => row.map((ch, j) => (ch === '#' ? '■' : dist[i][j] ?? ''))), colors, { title: '格子（數字為到最近起點的距離）' }), vars({ 佇列大小: front.length })], line);
    };
    view(null, q, `把 ${q.length} 個起點同時放進佇列，距離都是 0`, 1);
    let head = 0, layer = 0;
    while (head < q.length) {
      const end = q.length;
      for (; head < end; head++) {
        const [i, j] = q[head];
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const a = i + di, b = j + dj;
          if (a < 0 || b < 0 || a >= R || b >= C || G[a][b] === '#' || dist[a][b] !== null) continue;
          dist[a][b] = dist[i][j]! + 1;
          q.push([a, b]);
        }
      }
      layer++;
      if (head < q.length) view(null, q.slice(head), `第 ${layer} 層波前：距離 ${layer} 的格子（所有起點同時擴散）`, 5);
    }
    // 對照：每個起點各跑一次 BFS 取最小值
    const sources = G.flatMap((row, i) => row.flatMap((ch, j) => (ch === 'S' ? [[i, j] as [number, number]] : [])));
    let same = true;
    const best = G.map((row) => row.map(() => Infinity));
    for (const [si, sj] of sources) {
      const d = G.map((row) => row.map(() => -1));
      d[si][sj] = 0;
      const qq: [number, number][] = [[si, sj]];
      for (let h = 0; h < qq.length; h++) { const [i, j] = qq[h]; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= R || b >= C || G[a][b] === '#' || d[a][b] >= 0) continue; d[a][b] = d[i][j] + 1; qq.push([a, b]); } }
      G.forEach((row, i) => row.forEach((_, j) => { if (d[i][j] >= 0) best[i][j] = Math.min(best[i][j], d[i][j]); }));
    }
    G.forEach((row, i) => row.forEach((ch, j) => { if (ch !== '#' && (dist[i][j] ?? Infinity) !== best[i][j]) same = false; }));
    view(null, [], `完成，共 ${layer} 層。與「每個起點各跑一次 BFS 取最小」${same ? '完全一致' : '不一致！'}；空白格表示無法到達`, 7);
    return r.frames;
  },
};

// ---------------- 迭代加深 DFS ----------------
const DEF_TREEG = 'A B\nA C\nB D\nB E\nC F\nC G\nD H\nE I\nF J\nG K\nE F';
const iddfs: AlgoDef = {
  id: 'iddfs', name: '迭代加深深度優先搜尋', en: 'Iterative Deepening DFS', cat: 'graph',
  desc: '依序以深度上限 0、1、2…做深度受限 DFS，直到找到目標。記憶體只需 O(深度)，像 DFS；但第一次找到時的深度就是最淺解，像 BFS。代價是淺層節點會被重複拜訪，在分支度大的樹中重訪比例其實不高。',
  time: 'O(b^d)（b 分支度、d 解的深度）', space: 'O(d)',
  code: ['for limit = 0, 1, 2, ...:', '  if dls(start, limit): return 找到', 'dls(u, limit):', '  if u == 目標: return true', '  if limit == 0: return false', '  for v in adj[u]（不走回目前路徑上的點）:', '    if dls(v, limit − 1): return true', '  return false'],
  inputs: [graphInput(DEF_TREEG), inText('start', '起點', 'A'), inText('target', '目標', 'J', (c) => rnd.pick(nodesOf(c)))],
  run({ graph, start, target }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const adj = adjacency(g);
    const s = pick(g, start), t = String(target).trim();
    if (!g.nodes.includes(t)) throw new Error(`目標 ${t} 不在圖中`);
    let total = 0;
    const counts: number[] = [];
    // BFS 深度對照
    const bd: Record<string, number> = { [s]: 0 };
    const bq = [s];
    for (let h = 0; h < bq.length; h++) for (const { to } of adj[bq[h]]) if (!(to in bd)) { bd[to] = bd[bq[h]] + 1; bq.push(to); }
    for (let limit = 0; limit <= g.nodes.length; limit++) {
      let visits = 0;
      const seen: Record<string, Color> = {};
      const path: string[] = [];
      const dls = (u: string, lim: number): boolean => {
        visits++; total++;
        path.push(u);
        seen[u] = 'visited';
        r.snap(`上限 ${limit}：拜訪 ${u}（剩餘深度 ${lim}）`, [gpanel(g, { node: { ...seen, ...Object.fromEntries(path.map((x) => [x, 'frontier' as Color])), [u]: 'active', [t]: u === t ? 'done' : seen[t] ?? 'special' } }), table(counts.map((c, i) => [i, c]).concat([[limit, visits]]), {}, { colHeaders: ['上限', '拜訪次數'], w: 'half' }), vars({ 累計拜訪: total })], 4);
        if (u === t) return true;
        if (lim === 0) { path.pop(); return false; }
        for (const { to } of adj[u]) if (!path.includes(to) && dls(to, lim - 1)) return true;
        path.pop();
        return false;
      };
      const found = dls(s, limit);
      counts.push(visits);
      if (found) {
        r.snap(`在深度上限 ${limit} 找到 ${t}，路徑 ${path.join(' → ')}；BFS 得到的最淺深度也是 ${bd[t]}。總共拜訪 ${total} 次（重複拜訪了較淺的節點）`, [gpanel(g, { node: { ...Object.fromEntries(path.map((x) => [x, 'path' as Color])), [t]: 'done' }, edge: Object.fromEntries(g.edges.map((e, i) => [i, path.includes(e.u) && path.includes(e.v) && Math.abs(path.indexOf(e.u) - path.indexOf(e.v)) === 1 ? 'path' as Color : undefined])) }), table(counts.map((c, i) => [i, c]), {}, { colHeaders: ['上限', '拜訪次數'], w: 'half' })], 2);
        return r.frames;
      }
      r.snap(`上限 ${limit} 沒找到，把上限加 1 重新開始`, [gpanel(g, { node: seen }), table(counts.map((c, i) => [i, c]), {}, { colHeaders: ['上限', '拜訪次數'], w: 'half' })], 1);
      if (Object.keys(seen).length === Object.keys(bd).length && limit > (Math.max(...Object.values(bd)) || 0)) break;
    }
    r.snap(`${t} 無法從 ${s} 到達`, [gpanel(g, {})], 8);
    return r.frames;
  },
};

// ---------------- 遞移閉包 ----------------
const closure: AlgoDef = {
  id: 'transitive-closure', name: 'Warshall 遞移閉包', en: 'Warshall Transitive Closure', cat: 'graph',
  desc: '求有向圖中任兩點是否可達。布林矩陣 R 一開始只有直接相連的邊，依序讓每個頂點 k 當「中繼站」：若 i 能到 k 且 k 能到 j，則 i 能到 j。和 Floyd–Warshall 同樣的三層迴圈，只是把加法與最小值換成 AND 與 OR。本頁可選擇長度 0 的路徑（自己到自己）是否算可達。',
  time: 'O(V³)', space: 'O(V²)',
  code: ['R[i][j] = 有邊 i → j（自反時 R[i][i] = 1）', 'for k in V:', '  for i in V:', '    for j in V:', '      R[i][j] = R[i][j] or (R[i][k] and R[k][j])'],
  inputs: [graphInput('A B\nB C\nC A\nC D\nE D\nE F', { directed: true, n: 6, m: 7 }), inSelect('refl', '長度 0 的路徑', [['no', '不算可達'], ['yes', '算可達（自反）']])],
  run({ graph, refl }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    const N = g.nodes, n = N.length;
    if (n > 12) throw new Error('為了清楚呈現，最多 12 個頂點');
    const R = N.map((u, i) => N.map((v, j) => (g.edges.some((e) => e.u === u && e.v === v) || (refl === 'yes' && i === j) ? 1 : 0)));
    const show = (k: number, hl: Record<string, Color>, msg: string, line: number) => r.snap(msg, [gpanel(g, { node: k >= 0 ? { [N[k]]: 'active' } : {}, w: 'half' }), table(R, { ...Object.fromEntries(R.flatMap((row, i) => row.map((v, j) => [`${i},${j}`, v ? ('visited' as Color) : undefined]))), ...hl }, { rowHeaders: N, colHeaders: N, title: '可達矩陣 R（列 → 行）', w: 'half' })], line);
    show(-1, {}, '初始：只有直接相連的邊' + (refl === 'yes' ? '，並把對角線設為 1' : ''), 1);
    for (let k = 0; k < n; k++) {
      const added: Record<string, Color> = {};
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (!R[i][j] && R[i][k] && R[k][j]) { R[i][j] = 1; added[`${i},${j}`] = 'swap'; }
      for (let x = 0; x < n; x++) { added[`${x},${k}`] ??= 'compare'; added[`${k},${x}`] ??= 'compare'; }
      const cnt = Object.values(added).filter((c) => c === 'swap').length;
      show(k, added, `以 ${N[k]} 為中繼：${cnt ? `新增 ${cnt} 個可達關係（橘色）` : '沒有新的可達關係'}`, 5);
    }
    show(-1, {}, `完成：共 ${R.flat().filter(Boolean).length} 個可達的有序點對`, 2);
    return r.frames;
  },
};

// ---------------- 2-SAT ----------------
const twoSat: AlgoDef = {
  id: 'two-sat', name: '二元可滿足性', en: '2-SAT', cat: 'graph',
  desc: '每個子句 (a ∨ b) 等價於兩條蘊含 ¬a → b 與 ¬b → a。把 2n 個文字當成頂點建蘊含圖並求強連通分量：若某個 x 與 ¬x 在同一個分量，就互相蘊含而無解；否則依 Tarjan 找到分量的順序（反拓撲序），讓 x 取「分量編號較小」的那一邊為真即可得到一組解。',
  time: 'O(n + m)', space: 'O(n + m)',
  code: ['for 子句 (a ∨ b): 加邊 ¬a → b、¬b → a', '用 Tarjan 求強連通分量（編號為反拓撲序）', 'for 變數 x:', '  if comp[x] == comp[¬x]: 無解', '  x = (comp[x] < comp[¬x])', '驗證每個子句都成立'],
  inputs: [inText('clauses', '子句（a|!b，以 ; 分隔，變數為單一字母）', 'a|b; !a|c; !b|!c; c|d; !d|!a', () => Array.from({ length: 5 }, () => { const v = rnd.shuffle(['a', 'b', 'c', 'd']).slice(0, 2); return v.map((x) => (Math.random() < 0.5 ? '!' : '') + x).join('|'); }).join('; '))],
  run({ clauses }) {
    const r = new Rec();
    const cl = String(clauses).split(';').map((s) => s.trim()).filter(Boolean).map((s) => {
      const p = s.split('|').map((x) => x.trim());
      if (p.length !== 2 || p.some((x) => !/^!?[a-z]$/.test(x))) throw new Error(`子句「${s}」格式錯誤，例如 a|!b`);
      return p;
    });
    if (!cl.length) throw new Error('請至少輸入一個子句');
    const vars_ = [...new Set(cl.flat().map((x) => x.replace('!', '')))].sort();
    const lit = (x: string) => x;
    const neg = (x: string) => (x.startsWith('!') ? x.slice(1) : '!' + x);
    const nodes = vars_.flatMap((v) => [v, '!' + v]);
    const edges: { u: string; v: string; w: number }[] = [];
    for (const [a, b] of cl) { edges.push({ u: neg(a), v: lit(b), w: 1 }); edges.push({ u: neg(b), v: lit(a), w: 1 }); }
    const pos: Record<string, { x: number; y: number }> = {};
    vars_.forEach((v, i) => { pos[v] = { x: i * 110, y: 0 }; pos['!' + v] = { x: i * 110, y: 130 }; });
    const g: G = { nodes, edges, directed: true, pos };
    r.snap(`${cl.length} 個子句 → ${edges.length} 條蘊含邊（上排 x、下排 ¬x）`, [gpanel(g, { title: '蘊含圖' }), text(cl.map(([a, b]) => `(${a} ∨ ${b})：${neg(a)} → ${b}，${neg(b)} → ${a}`), '子句')], 1);
    // Tarjan
    const adj = adjacency(g);
    const idx: Record<string, number> = {}, low: Record<string, number> = {}, comp: Record<string, number> = {};
    const st: string[] = [], on = new Set<string>();
    let t = 0, c = 0;
    const dfs = (u: string) => {
      idx[u] = low[u] = t++; st.push(u); on.add(u);
      for (const { to } of adj[u]) { if (!(to in idx)) { dfs(to); low[u] = Math.min(low[u], low[to]); } else if (on.has(to)) low[u] = Math.min(low[u], idx[to]); }
      if (low[u] === idx[u]) { let x: string; do { x = st.pop()!; on.delete(x); comp[x] = c; } while (x !== u); c++; }
    };
    for (const u of nodes) if (!(u in idx)) dfs(u);
    const colorOf = Object.fromEntries(nodes.map((u) => [u, PALETTE[comp[u] % PALETTE.length]]));
    r.snap(`Tarjan 找到 ${c} 個強連通分量（同色為同一分量，下方數字為分量編號）`, [gpanel(g, { node: colorOf, sub: comp, title: '強連通分量' })], 2);
    const bad = vars_.filter((v) => comp[v] === comp['!' + v]);
    if (bad.length) {
      r.snap(`${bad.map((v) => `${v} 與 ¬${v}`).join('、')} 在同一個分量：互相蘊含，無解`, [gpanel(g, { node: Object.fromEntries(bad.flatMap((v) => [[v, 'bad' as Color], ['!' + v, 'bad' as Color]])), sub: comp })], 4);
      return r.frames;
    }
    const val: Record<string, boolean> = Object.fromEntries(vars_.map((v) => [v, comp[v] < comp['!' + v]]));
    const holds = (x: string) => (x.startsWith('!') ? !val[x.slice(1)] : val[x]);
    r.snap(`指派：${vars_.map((v) => `${v} = ${val[v] ? 'T' : 'F'}`).join('，')}（取分量編號較小的一邊為真）`, [gpanel(g, { node: Object.fromEntries(nodes.map((u) => [u, holds(u) ? 'done' as Color : 'muted' as Color])), sub: comp }), table(cl.map(([a, b]) => [`${a} ∨ ${b}`, holds(a) || holds(b) ? '成立' : '不成立']), Object.fromEntries(cl.map((_, i) => [`${i},1`, 'done' as Color])), { colHeaders: ['子句', '驗證'], w: 'half' })], 5);
    return r.frames;
  },
};

// ---------------- DAG 最長路徑 ----------------
const topoOrder = (g: G) => {
  const indeg: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, 0]));
  for (const e of g.edges) indeg[e.v]++;
  const q = g.nodes.filter((n) => !indeg[n]);
  const order: string[] = [];
  const adj = adjacency(g);
  while (q.length) { const u = q.shift()!; order.push(u); for (const { to } of adj[u]) if (--indeg[to] === 0) q.push(to); }
  return order.length === g.nodes.length ? order : null;
};
const dagLongest: AlgoDef = {
  id: 'dag-longest-path', name: 'DAG 最長路徑', en: 'Longest Path in DAG', cat: 'path',
  desc: '一般圖的最長簡單路徑是 NP 困難，但在有向無環圖中可以依拓撲順序做動態規劃：dist[v] = max(dist[u] + w(u, v))。權重可以是負數。若輸入有環則拒絕，因為環上可以繞圈使路徑無限長。最後沿 parent 回溯出路徑。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['order = 拓撲排序（Kahn）；若有環則拒絕', 'dist[s] = 0，其餘 −∞', 'for u in order:', '  if dist[u] == −∞: continue', '  for (u, v, w):', '    if dist[u] + w > dist[v]: dist[v] = dist[u] + w；parent[v] = u', '終點 = argmax dist；沿 parent 回溯'],
  inputs: [graphInput('S A 3\nS B 2\nA C 4\nB C 1\nB D 5\nC E -2\nD E 3\nA D 1\nE F 2', { directed: true, dag: true, weighted: true, negative: true, n: 7, m: 10 }), inText('start', '起點', 'S')],
  run({ graph, start }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    const order = topoOrder(g);
    if (!order) throw new Error('圖中有環，不是 DAG：最長路徑沒有定義（可沿環無限繞）');
    const s = pick(g, start);
    const dist: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, -Infinity]));
    const par: Record<string, number> = {};
    dist[s] = 0;
    const adj = adjacency(g);
    const P = (nc: Record<string, Color>, ec: Record<number, Color> = {}) => [gpanel(g, { node: nc, edge: { ...Object.fromEntries(Object.values(par).map((e) => [e, 'visited' as Color])), ...ec }, sub: Object.fromEntries(g.nodes.map((n) => [n, dist[n] === -Infinity ? '−∞' : dist[n]])) }), cells(order, {}, { title: '拓撲順序' })];
    r.snap(`拓撲順序：${order.join(' → ')}`, P({ [s]: 'active' }), 1);
    for (const u of order) {
      if (dist[u] === -Infinity) { r.snap(`${u} 無法從 ${s} 到達，略過`, P({ [u]: 'muted' }), 4); continue; }
      for (const { to, w, ei } of adj[u]) {
        const better = dist[u] + w > dist[to];
        if (better) { dist[to] = dist[u] + w; par[to] = ei; }
        r.snap(`${u} → ${to}（${w}）：${dist[u]} + ${w} = ${dist[u] + w}${better ? ` > 原值，更新 dist[${to}]` : ' 不比原值大'}`, P({ [u]: 'active', [to]: better ? 'swap' : 'compare' }, { [ei]: better ? 'swap' : 'compare' }), 6);
      }
    }
    const end = g.nodes.reduce((b, n) => (dist[n] > dist[b] ? n : b), s);
    const path = [end];
    const pe = new Set<number>();
    while (path[0] !== s) { const e = par[path[0]]; pe.add(e); path.unshift(g.edges[e].u); }
    r.snap(`最長路徑終點 ${end}，長度 ${dist[end]}：${path.join(' → ')}`, [gpanel(g, { node: Object.fromEntries(path.map((x) => [x, 'path' as Color])), edge: Object.fromEntries([...pe].map((e) => [e, 'path' as Color])), sub: Object.fromEntries(g.nodes.map((n) => [n, dist[n] === -Infinity ? '−∞' : dist[n]])) })], 7);
    return r.frames;
  },
};

// ---------------- 關鍵路徑法 ----------------
const parseTasks = (s: string) => String(s).split(/[;\n]+/).map((x) => x.trim()).filter(Boolean).map((line) => {
  const p = line.split(/\s+/);
  const d = Number(p[1]);
  if (!p[0] || !Number.isFinite(d) || d < 0) throw new Error(`工作「${line}」格式錯誤：名稱 工期 前置（用逗號分隔，沒有則寫 -）`);
  return { name: p[0], d, deps: !p[2] || p[2] === '-' ? [] : p[2].split(',').filter(Boolean) };
});
const criticalPath: AlgoDef = {
  id: 'critical-path', name: '關鍵路徑法', en: 'Critical Path Method', cat: 'path',
  desc: '專案中每項工作有工期與前置工作。正向依拓撲順序算最早開始 ES 與最早完成 EF，反向算最晚完成 LF 與最晚開始 LS。浮時 = LS − ES，浮時為 0 的工作延誤就會拖延整個專案，它們組成關鍵路徑（可能不只一條）。互不相連的工作也能一起排程。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['依拓撲順序：ES = max(前置的 EF)，EF = ES + 工期', '專案工期 T = max(EF)', '依反拓撲順序：LF = min(後續的 LS)（沒有後續則為 T）', '  LS = LF − 工期', '浮時 = LS − ES；浮時 0 的工作為關鍵工作'],
  inputs: [inText('tasks', '工作（名稱 工期 前置，以 ; 或換行分隔）', 'A 3 -\nB 2 A\nC 4 A\nD 2 B\nE 2 C\nF 3 D,E\nG 4 -\nH 1 G', undefined, true)],
  run({ tasks }) {
    const r = new Rec();
    const T = parseTasks(tasks);
    const names = T.map((t) => t.name);
    for (const t of T) for (const d of t.deps) if (!names.includes(d)) throw new Error(`工作 ${t.name} 的前置 ${d} 不存在`);
    const g: G = { nodes: names, edges: T.flatMap((t) => t.deps.map((d) => ({ u: d, v: t.name, w: 1 }))), directed: true, pos: {} };
    const order = topoOrder(g);
    if (!order) throw new Error('前置關係有環，無法排程');
    // 依層級排位置
    const lvl: Record<string, number> = {};
    for (const u of order) lvl[u] = Math.max(0, ...T.find((t) => t.name === u)!.deps.map((d) => lvl[d] + 1));
    const byL: Record<number, string[]> = {};
    order.forEach((u) => (byL[lvl[u]] ??= []).push(u));
    for (const [l, us] of Object.entries(byL)) us.forEach((u, i) => (g.pos[u] = { x: +l * 120, y: i * 80 }));
    const tk = (n: string) => T.find((t) => t.name === n)!;
    const ES: Record<string, number> = {}, EF: Record<string, number> = {}, LS: Record<string, number> = {}, LF: Record<string, number> = {};
    const tab = (hl: string) => table(order.map((n) => [n, tk(n).d, ES[n] ?? '', EF[n] ?? '', LS[n] ?? '', LF[n] ?? '', LS[n] !== undefined ? LS[n] - ES[n] : '']), Object.fromEntries(order.flatMap((n, i) => (n === hl ? [[`${i},0`, 'active' as Color]] : LS[n] !== undefined && LS[n] === ES[n] ? [[`${i},6`, 'bad' as Color]] : []))), { colHeaders: ['工作', '工期', 'ES', 'EF', 'LS', 'LF', '浮時'] });
    for (const n of order) {
      ES[n] = Math.max(0, ...tk(n).deps.map((d) => EF[d]));
      EF[n] = ES[n] + tk(n).d;
      r.snap(`${n}：ES = ${tk(n).deps.length ? `max(${tk(n).deps.map((d) => `EF[${d}]`).join(', ')})` : '0'} = ${ES[n]}，EF = ${ES[n]} + ${tk(n).d} = ${EF[n]}`, [gpanel(g, { node: { [n]: 'active' }, sub: Object.fromEntries(order.map((x) => [x, EF[x] !== undefined ? `${ES[x]}–${EF[x]}` : ''])), title: '工作相依圖（下方為最早開始–完成）' }), tab(n)], 1);
    }
    const Tot = Math.max(...Object.values(EF));
    r.snap(`專案工期 T = ${Tot}`, [tab('')], 2);
    for (const n of [...order].reverse()) {
      const succ = T.filter((t) => t.deps.includes(n)).map((t) => t.name);
      LF[n] = succ.length ? Math.min(...succ.map((s) => LS[s])) : Tot;
      LS[n] = LF[n] - tk(n).d;
      r.snap(`${n}：LF = ${succ.length ? `min(${succ.map((s) => `LS[${s}]`).join(', ')})` : 'T'} = ${LF[n]}，LS = ${LS[n]}，浮時 ${LS[n] - ES[n]}`, [gpanel(g, { node: { [n]: 'active' }, sub: Object.fromEntries(order.map((x) => [x, LS[x] !== undefined ? `浮時 ${LS[x] - ES[x]}` : ''])) }), tab(n)], 4);
    }
    const crit = new Set(order.filter((n) => LS[n] === ES[n]));
    r.snap(`關鍵工作（浮時 0）：${[...crit].join('、')}；任何一項延誤都會延後整個專案`, [gpanel(g, { node: Object.fromEntries(order.map((n) => [n, crit.has(n) ? 'bad' as Color : 'muted' as Color])), edge: Object.fromEntries(g.edges.map((e, i) => [i, crit.has(e.u) && crit.has(e.v) && EF[e.u] === ES[e.v] ? 'bad' as Color : undefined])) }), tab('')], 5);
    return r.frames;
  },
};

// ---------------- Tarjan 離線 LCA ----------------
const tarjanLca: AlgoDef = {
  id: 'tarjan-offline-lca', name: 'Tarjan 離線最近共同祖先', en: 'Tarjan Offline LCA', cat: 'tree',
  desc: '先收下所有查詢再一次 DFS 回答。拜訪完子樹 v 後把它併入父節點 u 的集合，並把集合的代表祖先設為 u。當 u 結束時，對每個查詢 (u, w)，若 w 已經拜訪過，LCA 就是 w 所在集合目前的祖先。整體只需一次走訪加上並查集。',
  time: 'O((n + q)·α(n))', space: 'O(n + q)',
  code: ['dfs(u):', '  ancestor[u] = u', '  for 子節點 v: dfs(v)；union(u, v)；ancestor[find(u)] = u', '  visited[u] = true', '  for 查詢 (u, w):', '    if visited[w]: lca(u, w) = ancestor[find(w)]'],
  inputs: [treeInput(DEF_TREE), inText('queries', '查詢（每組 u v，以 ; 分隔）', '8 9; 4 8; 6 10; 9 6; 3 3', (c) => Array.from({ length: 4 }, () => `${rnd.pick(nodesOf(c))} ${rnd.pick(nodesOf(c))}`).join('; '))],
  run({ graph, queries }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const root = g.nodes[0];
    const { children, parent } = rootTree(g, root);
    if (Object.keys(parent).length !== g.nodes.length) throw new Error('輸入不是連通的樹');
    const Q = String(queries).split(';').map((s) => s.trim().split(/\s+/)).filter((p) => p.length === 2);
    for (const [a, b] of Q) if (!g.nodes.includes(a) || !g.nodes.includes(b)) throw new Error(`查詢 ${a} ${b} 含有不存在的節點`);
    const dsu: Record<string, string> = Object.fromEntries(g.nodes.map((n) => [n, n]));
    const find = (x: string): string => (dsu[x] === x ? x : (dsu[x] = find(dsu[x])));
    const anc: Record<string, string> = {};
    const visited = new Set<string>();
    const ans: (string | null)[] = Q.map(() => null);
    const view = (u: string, msg: string, line: number) => {
      const reps = [...new Set(g.nodes.filter((n) => visited.has(n) || anc[n]).map(find))];
      r.snap(msg, [treePanel(g, root, { node: Object.fromEntries(g.nodes.map((n) => [n, n === u ? 'active' : visited.has(n) ? PALETTE[reps.indexOf(find(n)) % PALETTE.length] : undefined])), sub: Object.fromEntries(g.nodes.filter((n) => anc[find(n)]).map((n) => [n, `祖先 ${anc[find(n)]}`])), title: '同色節點屬於同一個集合，下方是該集合目前的祖先' }), table(Q.map(([a, b], i) => [`${a}, ${b}`, ans[i] ?? '']), Object.fromEntries(ans.map((x, i) => [`${i},1`, x ? 'done' as Color : undefined])), { colHeaders: ['查詢', 'LCA'], w: 'half' })], line);
    };
    const dfs = (u: string) => {
      anc[u] = u;
      view(u, `進入 ${u}`, 2);
      for (const v of children[u]) {
        dfs(v);
        dsu[find(v)] = find(u);
        anc[find(u)] = u;
        view(u, `子樹 ${v} 完成：併入 ${u} 的集合，祖先設為 ${u}`, 3);
      }
      visited.add(u);
      Q.forEach(([a, b], i) => {
        const w = a === u ? b : b === u ? a : null;
        if (w !== null && visited.has(w) && ans[i] === null) { ans[i] = anc[find(w)]; view(u, `查詢 (${a}, ${b})：${w} 已拜訪，LCA = ${w} 所在集合的祖先 = ${ans[i]}`, 6); }
      });
    };
    dfs(root);
    const depth: Record<string, number> = { [root]: 0 };
    const order = [root];
    for (let i = 0; i < order.length; i++) for (const c of children[order[i]]) { depth[c] = depth[order[i]] + 1; order.push(c); }
    const naive = (a: string, b: string) => { while (depth[a] > depth[b]) a = parent[a]!; while (depth[b] > depth[a]) b = parent[b]!; while (a !== b) { a = parent[a]!; b = parent[b]!; } return a; };
    const ok = Q.every(([a, b], i) => naive(a, b) === ans[i]);
    view('', `全部回答完成；與逐層往上爬的方法比對${ok ? '一致' : '不一致！'}`, 6);
    return r.frames;
  },
};

// ---------------- 換根 DP ----------------
const rerooting: AlgoDef = {
  id: 'rerooting-dp', name: '換根動態規劃', en: 'Rerooting DP', cat: 'tree',
  desc: '求每個節點到其他所有節點的距離總和。第一次 DFS 以 1 為根算子樹大小 sz 與 down[u]（子樹內距離和），得到 ans[根]。第二次 DFS 把根從 u 換到子節點 v：v 子樹的 sz[v] 個點近了 1、其餘 n − sz[v] 個點遠了 1，所以 ans[v] = ans[u] − sz[v] + (n − sz[v])。兩次走訪就得到所有答案。',
  time: 'O(n)', space: 'O(n)',
  code: ['dfs1(u)：sz[u] = 1 + Σ sz[v]；down[u] = Σ (down[v] + sz[v])', 'ans[root] = down[root]', 'dfs2(u)：for 子節點 v:', '  ans[v] = ans[u] − sz[v] + (n − sz[v])', '  dfs2(v)'],
  inputs: [treeInput(DEF_TREE)],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const root = g.nodes[0], n = g.nodes.length;
    const { children, order } = rootTree(g, root);
    if (order.length !== n) throw new Error('輸入不是連通的樹');
    const sz: Record<string, number> = {}, down: Record<string, number> = {}, ans: Record<string, number> = {};
    for (const u of [...order].reverse()) {
      sz[u] = 1 + children[u].reduce((s, v) => s + sz[v], 0);
      down[u] = children[u].reduce((s, v) => s + down[v] + sz[v], 0);
      r.snap(`${u}：sz = ${sz[u]}，down = ${down[u]}`, [treePanel(g, root, { node: { [u]: 'active', ...Object.fromEntries(children[u].map((v) => [v, 'compare' as Color])) }, sub: Object.fromEntries(Object.keys(sz).map((x) => [x, `sz${sz[x]} d${down[x]}`])), title: '第一次 DFS（由下往上）' })], 1);
    }
    ans[root] = down[root];
    r.snap(`ans[${root}] = down[${root}] = ${ans[root]}`, [treePanel(g, root, { node: { [root]: 'done' }, sub: { [root]: `ans ${ans[root]}` } })], 2);
    for (const u of order)
      for (const v of children[u]) {
        ans[v] = ans[u] - sz[v] + (n - sz[v]);
        r.snap(`換根 ${u} → ${v}：${ans[u]} − ${sz[v]} + (${n} − ${sz[v]}) = ${ans[v]}`, [treePanel(g, root, { node: { [u]: 'compare', [v]: 'swap', ...Object.fromEntries(Object.keys(ans).filter((x) => x !== u && x !== v).map((x) => [x, 'done' as Color])) }, sub: Object.fromEntries(Object.keys(ans).map((x) => [x, `ans ${ans[x]}`])), title: '第二次 DFS（由上往下）' })], 4);
      }
    const adj = adjacency(g);
    let ok = true;
    for (const s of g.nodes) { const d: Record<string, number> = { [s]: 0 }; const q = [s]; for (let h = 0; h < q.length; h++) for (const { to } of adj[q[h]]) if (!(to in d)) { d[to] = d[q[h]] + 1; q.push(to); } if (Object.values(d).reduce((a, b) => a + b, 0) !== ans[s]) ok = false; }
    r.snap(`完成。對每個點各跑一次 BFS 驗證：${ok ? '全部一致' : '不一致！'}`, [treePanel(g, root, { node: Object.fromEntries(g.nodes.map((x) => [x, 'done' as Color])), sub: ans }), table(g.nodes.map((x) => [x, ans[x]]), {}, { colHeaders: ['節點', '距離總和'], w: 'half' })], 5);
    return r.frames;
  },
};

// ---------------- 重心分解 ----------------
const centroid: AlgoDef = {
  id: 'centroid-decomposition', name: '重心分解', en: 'Centroid Decomposition', cat: 'tree',
  desc: '樹的重心是刪除後最大剩餘塊不超過原大小一半的點。找出重心、刪掉它，對剩下的每一塊遞迴做同樣的事，就得到深度只有 O(log n) 的重心樹。許多路徑問題可以拆成「經過重心」與「不經過重心」兩類，在重心樹上分治求解。',
  time: 'O(n log n)', space: 'O(n)',
  code: ['decompose(塊, 父重心):', '  計算塊內每個點的子樹大小', '  c = 刪除後最大塊 ≤ |塊| / 2 的點', '  重心樹中 parent[c] = 父重心；標記 c 已移除', '  for 刪除 c 後的每一塊：decompose(該塊, c)'],
  inputs: [treeInput('1 2\n2 3\n3 4\n4 5\n5 6\n6 7\n4 8\n8 9\n9 10\n2 11\n6 12', 12)],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const adj = adjacency(g);
    const removed = new Set<string>();
    const cpar: Record<string, string | null> = {};
    const level: Record<string, number> = {};
    const root0 = g.nodes[0];
    if (rootTree(g, root0).order.length !== g.nodes.length) throw new Error('輸入不是連通的樹');
    const compOf = (s: string) => { const out = [s]; const seen = new Set([s]); for (let i = 0; i < out.length; i++) for (const { to } of adj[out[i]]) if (!removed.has(to) && !seen.has(to)) { seen.add(to); out.push(to); } return out; };
    let ok = true;
    const go = (start: string, par: string | null, lv: number) => {
      const comp = compOf(start);
      const sz: Record<string, number> = {}, pr: Record<string, string> = {};
      const order = [start]; const seen = new Set([start]);
      for (let i = 0; i < order.length; i++) for (const { to } of adj[order[i]]) if (!removed.has(to) && !seen.has(to)) { seen.add(to); pr[to] = order[i]; order.push(to); }
      for (const u of [...order].reverse()) sz[u] = 1 + adj[u].filter(({ to }) => !removed.has(to) && pr[to] === u).reduce((s, { to }) => s + sz[to], 0);
      const n = comp.length;
      let c = start;
      for (const u of order) { const mx = Math.max(n - sz[u], ...adj[u].filter(({ to }) => !removed.has(to) && pr[to] === u).map(({ to }) => sz[to])); if (mx <= n / 2) { c = u; break; } }
      removed.add(c); cpar[c] = par; level[c] = lv;
      const pieces = adj[c].filter(({ to }) => !removed.has(to)).map(({ to }) => compOf(to));
      if (pieces.some((p) => p.length > n / 2)) ok = false;
      r.snap(`塊 {${comp.join(',')}}（${n} 個點）的重心是 ${c}；刪除後剩下 ${pieces.map((p) => p.length).join('、') || 0} 個點的塊，都 ≤ ${Math.floor(n / 2)}`, [gpanel(g, { node: Object.fromEntries(g.nodes.map((x) => [x, x === c ? 'done' : comp.includes(x) ? 'frontier' : removed.has(x) ? 'muted' : undefined])), sub: Object.fromEntries(Object.keys(level).map((x) => [x, `層 ${level[x]}`])), title: '原樹（綠：本輪重心，青：目前的塊，灰：已移除）', w: 'half' }), cTree()], 3);
      for (const p of pieces) go(p[0], c, lv + 1);
    };
    const cTree = (): Panel => {
      const ks = Object.keys(cpar);
      const kids: Record<string, string[]> = Object.fromEntries(ks.map((k) => [k, ks.filter((x) => cpar[x] === k)]));
      const rt = ks.find((k) => cpar[k] === null)!;
      const pos = layoutTree(rt, kids, 44, 56);
      return { type: 'graph', nodes: ks.map((k) => ({ id: k, x: pos[k].x, y: pos[k].y, label: k, color: 'done' as Color })), edges: ks.filter((k) => cpar[k]).map((k) => ({ from: cpar[k]!, to: k })), title: '重心樹', w: 'half' };
    };
    go(root0, null, 0);
    const depth = Math.max(...Object.values(level)) + 1;
    r.snap(`分解完成：重心樹深度 ${depth}（⌈log₂ ${g.nodes.length}⌉ + 1 = ${Math.ceil(Math.log2(g.nodes.length)) + 1}）；每一塊都不超過原塊的一半：${ok ? '是' : '否！'}`, [gpanel(g, { node: Object.fromEntries(g.nodes.map((x) => [x, PALETTE[level[x] % PALETTE.length]])), sub: Object.fromEntries(g.nodes.map((x) => [x, `層 ${level[x]}`])), w: 'half' }), cTree()], 5);
    return r.frames;
  },
};

// ---------------- 莫隊演算法 ----------------
const mo: AlgoDef = {
  id: 'mo-algorithm', name: '莫隊演算法', en: "Mo's Algorithm", cat: 'technique',
  desc: '離線回答大量區間查詢（這裡是區間內相異數的個數）。把查詢依「左端點所在的塊、再依右端點」排序，維護一個目前區間，左右指標一格一格移動並增減計數。塊大小取 √n 時指標總移動量為 O((n + q)√n)，比每個查詢從頭算快很多。',
  time: 'O((n + q)·√n)', space: 'O(n + q)',
  code: ['B = ⌈√n⌉；查詢依 (l / B, r) 排序', 'L = 0, R = −1, distinct = 0', 'for 查詢 (l, r) 依排序後順序:', '  while R < r: R += 1；add(a[R])', '  while L > l: L −= 1；add(a[L])', '  while R > r: remove(a[R])；R −= 1', '  while L < l: remove(a[L])；L += 1', '  答案 = distinct', 'add(x): cnt[x] 由 0 變 1 時 distinct += 1；remove 相反'],
  inputs: [{ key: 'arr', label: '陣列', type: 'array', default: [1, 2, 1, 3, 2, 2, 4, 1, 5, 3, 4, 4], random: () => rnd.arr(12, 1, 6) }, inText('queries', '查詢（每組 l r，以 ; 分隔）', '0 4; 2 7; 5 11; 1 3; 6 9; 0 11', () => Array.from({ length: 6 }, () => { const l = rnd.int(0, 9); return `${l} ${rnd.int(l, 11)}`; }).join('; '))],
  run({ arr: a, queries }) {
    const r = new Rec();
    const n = a.length;
    const Q = String(queries).split(';').map((s) => s.trim().split(/\s+/).map(Number)).filter((p) => p.length === 2 && p.every(Number.isInteger)).map(([l, rr], i) => ({ l: Math.min(l, rr), r: Math.max(l, rr), i }));
    if (!Q.length) throw new Error('請輸入查詢');
    if (Q.some((q) => q.l < 0 || q.r >= n)) throw new Error('查詢超出陣列範圍');
    const B = Math.max(1, Math.ceil(Math.sqrt(n)));
    const S = [...Q].sort((x, y) => Math.floor(x.l / B) - Math.floor(y.l / B) || x.r - y.r);
    const cnt = new Map<number, number>();
    let L = 0, R = -1, distinct = 0, moves = 0;
    const ans: (number | null)[] = Q.map(() => null);
    const add = (x: number) => { cnt.set(x, (cnt.get(x) ?? 0) + 1); if (cnt.get(x) === 1) distinct++; moves++; };
    const rem = (x: number) => { cnt.set(x, cnt.get(x)! - 1); if (cnt.get(x) === 0) distinct--; moves++; };
    const view = (msg: string, line: number, cur?: number) => r.snap(msg, [cells(a, Object.fromEntries(a.map((_: number, i: number) => [i, i >= L && i <= R ? 'active' : undefined])), { pointers: [...(L <= R ? [{ index: L, label: 'L' }, { index: R, label: 'R' }] : [])], title: `目前區間（塊大小 B = ${B}）` }), table(S.map((q) => [`[${q.l}, ${q.r}]`, Math.floor(q.l / B), ans[q.i] ?? '']), Object.fromEntries(S.map((q, k) => [`${k},0`, q.i === cur ? 'active' as Color : ans[q.i] !== null ? 'done' as Color : undefined])), { colHeaders: ['查詢（排序後）', '塊', '相異數'], w: 'half' }), vars({ distinct, 指標移動: moves })], line);
    view(`查詢依 (l 所在的塊, r) 排序`, 1);
    for (const q of S) {
      while (R < q.r) add(a[++R]);
      while (L > q.l) add(a[--L]);
      while (R > q.r) rem(a[R--]);
      while (L < q.l) rem(a[L++]);
      ans[q.i] = distinct;
      view(`移動指標到 [${q.l}, ${q.r}]：相異數 = ${distinct}`, 7, q.i);
    }
    const ok = Q.every((q) => new Set(a.slice(q.l, q.r + 1)).size === ans[q.i]);
    const naive = Q.reduce((s, q) => s + q.r - q.l + 1, 0);
    view(`全部完成：指標共移動 ${moves} 次（每個查詢各自重算需要 ${naive} 次）；與暴力集合比對${ok ? '一致' : '不一致！'}`, 7);
    return r.frames;
  },
};

// ---------------- 離線動態連通性 ----------------
const offlineConn: AlgoDef = {
  id: 'offline-dynamic-connectivity', name: '離線動態連通性', en: 'Offline Dynamic Connectivity', cat: 'graph',
  desc: '邊會被加入與刪除，並詢問兩點是否連通。離線處理：算出每條邊「存活」的時間區間，把它掛到時間線段樹上覆蓋該區間的 O(log T) 個節點。DFS 線段樹時，進入節點就用可回滾並查集合併該節點的邊，到葉子回答那個時刻的查詢，離開時回滾。',
  time: 'O(T log T · log n)', space: 'O(T log T)',
  code: ['為每條邊算出存活區間 [加入時間, 刪除時間)', '把區間掛到時間線段樹的 O(log T) 個節點', 'dfs(node)：', '  合併 node 上的所有邊（依大小合併，不壓縮）', '  若是葉子 t：回答時刻 t 的查詢', '  否則 dfs(左子)、dfs(右子)', '  回滾到進入 node 之前'],
  inputs: [inText('events', '事件（+ a b 加邊、- a b 刪邊、? a b 查詢；以 ; 分隔）', '+ 1 2; + 2 3; ? 1 3; + 4 5; - 2 3; ? 1 3; + 3 4; ? 1 5; + 1 3; ? 2 5; - 1 2; ? 2 5', undefined, true)],
  run({ events }) {
    const r = new Rec();
    const ev = String(events).split(/[;\n]+/).map((s) => s.trim()).filter(Boolean).map((s) => {
      const [op, a, b] = s.split(/\s+/);
      if (!['+', '-', '?'].includes(op) || !a || !b) throw new Error(`事件「${s}」格式錯誤`);
      return { op, a, b };
    });
    const T = ev.length;
    if (!T) throw new Error('請輸入事件');
    if (T > 24) throw new Error('最多 24 個事件');
    const key = (a: string, b: string) => (a < b ? `${a}-${b}` : `${b}-${a}`);
    const open = new Map<string, number>();
    const spans: { e: string; l: number; r: number }[] = [];
    ev.forEach((x, t) => {
      const k = key(x.a, x.b);
      if (x.op === '+' && !open.has(k)) open.set(k, t);
      if (x.op === '-' && open.has(k)) { spans.push({ e: k, l: open.get(k)!, r: t - 1 }); open.delete(k); }
    });
    for (const [k, l] of open) spans.push({ e: k, l, r: T - 1 });
    const nodesV = [...new Set(ev.flatMap((x) => [x.a, x.b]))].sort();
    const seg: Record<number, string[]> = {};
    const segInfo: Record<number, [number, number]> = {};
    const ins = (o: number, l: number, rr: number, ql: number, qr: number, e: string) => { segInfo[o] = [l, rr]; if (qr < l || rr < ql || ql > qr) return; if (ql <= l && rr <= qr) { (seg[o] ??= []).push(e); return; } const m = (l + rr) >> 1; ins(2 * o, l, m, ql, qr, e); ins(2 * o + 1, m + 1, rr, ql, qr, e); };
    const fill = (o: number, l: number, rr: number) => { segInfo[o] = [l, rr]; if (l === rr) return; const m = (l + rr) >> 1; fill(2 * o, l, m); fill(2 * o + 1, m + 1, rr); };
    fill(1, 0, T - 1);
    for (const s of spans) ins(1, 0, T - 1, s.l, s.r, s.e);
    const tl = table(spans.map((s) => Array.from({ length: T }, (_, t) => (t >= s.l && t <= s.r ? '━' : ''))), Object.fromEntries(spans.flatMap((s, i) => Array.from({ length: T }, (_, t) => (t >= s.l && t <= s.r ? [[`${i},${t}`, 'visited' as Color]] : [])).flat())), { rowHeaders: spans.map((s) => s.e), colHeaders: ev.map((x, t) => `${t}${x.op}`), title: '每條邊的存活時間' });
    r.snap(`算出 ${spans.length} 段邊的存活區間`, [tl], 1);
    const segPanel = (cur: number, done: Set<number>): Panel => {
      const ids = Object.keys(segInfo).map(Number);
      const kids: Record<string, string[]> = Object.fromEntries(ids.map((o) => [`s${o}`, segInfo[2 * o] ? [`s${2 * o}`, `s${2 * o + 1}`] : []]));
      const pos = layoutTree('s1', kids, 46, 60);
      return { type: 'graph', nodes: ids.map((o) => ({ id: `s${o}`, x: pos[`s${o}`].x, y: pos[`s${o}`].y, label: seg[o]?.length ? String(seg[o].length) : '', shape: 'rect', w: 36, h: 24, badge: segInfo[o][0] === segInfo[o][1] ? `${segInfo[o][0]}` : `${segInfo[o][0]}-${segInfo[o][1]}`, sub: seg[o]?.join(' '), color: o === cur ? 'active' : done.has(o) ? 'visited' : undefined })), edges: ids.filter((o) => segInfo[2 * o]).flatMap((o) => [{ from: `s${o}`, to: `s${2 * o}` }, { from: `s${o}`, to: `s${2 * o + 1}` }]), title: '時間線段樹（節點下方是掛在上面的邊）', height: 420 };
    };
    r.snap('把每段區間掛到線段樹上覆蓋它的節點', [segPanel(0, new Set())], 2);
    const p: Record<string, string> = Object.fromEntries(nodesV.map((v) => [v, v]));
    const sz: Record<string, number> = Object.fromEntries(nodesV.map((v) => [v, 1]));
    const hist: [string, string][] = [];
    const find = (x: string) => { while (p[x] !== x) x = p[x]; return x; };
    const answers: string[] = ev.map(() => '');
    const done = new Set<number>();
    const dfs = (o: number) => {
      const before = hist.length;
      for (const e of seg[o] ?? []) {
        const [a, b] = e.split('-');
        let ra = find(a), rb = find(b);
        if (ra === rb) continue;
        if (sz[ra] > sz[rb]) [ra, rb] = [rb, ra];
        p[ra] = rb; sz[rb] += sz[ra]; hist.push([ra, rb]);
      }
      const [l, rr] = segInfo[o];
      if (l === rr) {
        const x = ev[l];
        if (x.op === '?') {
          answers[l] = find(x.a) === find(x.b) ? '連通' : '不連通';
          r.snap(`時刻 ${l} 查詢 ${x.a}, ${x.b}：${answers[l]}（目前並查集只包含此刻存活的邊）`, [segPanel(o, done), table(ev.map((y, t) => [t, `${y.op} ${y.a} ${y.b}`, answers[t]]), { [`${l},2`]: answers[l] === '連通' ? 'done' : 'bad' }, { colHeaders: ['時刻', '事件', '答案'], w: 'half' })], 5);
        }
      } else {
        if (seg[o]?.length) r.snap(`進入時間 [${l}, ${rr}]：合併 ${seg[o].join('、')}`, [segPanel(o, done), vars({ 回滾堆疊: hist.length })], 4);
        dfs(2 * o); dfs(2 * o + 1);
      }
      while (hist.length > before) { const [ra, rb] = hist.pop()!; p[ra] = ra; sz[rb] -= sz[ra]; }
      done.add(o);
    };
    dfs(1);
    // 對照：每個查詢時刻用目前存活的邊跑 BFS
    let ok = true;
    const alive = new Set<string>();
    ev.forEach((x, t) => {
      const k = key(x.a, x.b);
      if (x.op === '+') alive.add(k); else if (x.op === '-') alive.delete(k);
      else {
        const seen = new Set([x.a]); const q = [x.a];
        for (let h = 0; h < q.length; h++) for (const e of alive) { const [a, b] = e.split('-'); const o = a === q[h] ? b : b === q[h] ? a : null; if (o && !seen.has(o)) { seen.add(o); q.push(o); } }
        if ((seen.has(x.b) ? '連通' : '不連通') !== answers[t]) ok = false;
      }
    });
    r.snap(`全部回答完成；與每個時刻重新 BFS 的結果比對${ok ? '一致' : '不一致！'}`, [table(ev.map((y, t) => [t, `${y.op} ${y.a} ${y.b}`, answers[t]]), Object.fromEntries(ev.map((y, t) => [`${t},2`, y.op === '?' ? (answers[t] === '連通' ? 'done' as Color : 'bad' as Color) : undefined])), { colHeaders: ['時刻', '事件', '答案'] })], 7);
    return r.frames;
  },
};

// ---------------- 次小生成樹 ----------------
const kruskal = (g: G) => {
  const p: Record<string, string> = Object.fromEntries(g.nodes.map((n) => [n, n]));
  const find = (x: string): string => (p[x] === x ? x : (p[x] = find(p[x])));
  const tree: number[] = [];
  const order = g.edges.map((_, i) => i).sort((a, b) => g.edges[a].w - g.edges[b].w || a - b);
  for (const i of order) { const a = find(g.edges[i].u), b = find(g.edges[i].v); if (a !== b) { p[a] = b; tree.push(i); } }
  return tree;
};
const secondMst: AlgoDef = {
  id: 'second-best-mst', name: '次小生成樹', en: 'Second-best MST', cat: 'mst',
  desc: '先用 Kruskal 求最小生成樹，再嘗試加入每一條非樹邊 (u, v, w)：它會和樹上 u–v 路徑形成環，刪掉路徑上權重最大的邊，新樹權重為 MST − max + w，取最小者。「不同的樹」允許權重相同（max 可以等於 w）；「嚴格次小」要求權重嚴格變大，若 max 等於 w 就改用路徑上嚴格小於 w 的最大邊。路徑最大值可用 LCA 倍增在 O(log n) 求得，本頁為了呈現直接沿路徑尋找。',
  time: 'O(E log E + E·V)（用 LCA 倍增可到 O(E log V)）', space: 'O(V + E)',
  code: ['T = Kruskal(G)，W = 權重和', 'best = ∞', 'for 非樹邊 (u, v, w):', '  path = T 上 u 到 v 的路徑', '  m = 路徑上最大邊（嚴格模式：< w 的最大邊）', '  若 m 存在：best = min(best, W − m + w)', 'return best'],
  inputs: [graphInput('A B 4\nA C 3\nB C 1\nB D 2\nC D 4\nC E 5\nD E 6\nD F 7\nE F 3', { weighted: true, n: 7, m: 11 }), inSelect('mode', '定義', [['diff', '不同的樹（權重可相等）'], ['strict', '嚴格更大的權重']])],
  run({ graph, mode }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const tree = kruskal(g);
    if (tree.length !== g.nodes.length - 1) throw new Error('圖不連通，沒有生成樹');
    const W = tree.reduce((s, i) => s + g.edges[i].w, 0);
    const inT = new Set(tree);
    r.snap(`Kruskal 得到 MST，權重 ${W}`, [gpanel(g, { edge: Object.fromEntries(tree.map((i) => [i, 'path' as Color])) })], 1);
    const tAdj: Record<string, { to: string; ei: number }[]> = Object.fromEntries(g.nodes.map((n) => [n, []]));
    for (const i of tree) { tAdj[g.edges[i].u].push({ to: g.edges[i].v, ei: i }); tAdj[g.edges[i].v].push({ to: g.edges[i].u, ei: i }); }
    const pathEdges = (a: string, b: string) => { const pe: Record<string, number> = {}; const prev: Record<string, string> = { [a]: a }; const q = [a]; for (let h = 0; h < q.length; h++) for (const { to, ei } of tAdj[q[h]]) if (!(to in prev)) { prev[to] = q[h]; pe[to] = ei; q.push(to); } const out: number[] = []; for (let x = b; x !== a; x = prev[x]) out.push(pe[x]); return out; };
    let best = Infinity, bestSwap: [number, number] | null = null;
    g.edges.forEach((e, i) => {
      if (inT.has(i)) return;
      const pth = pathEdges(e.u, e.v);
      const cand = pth.filter((j) => (mode === 'strict' ? g.edges[j].w < e.w : true));
      const m = cand.length ? cand.reduce((x, y) => (g.edges[y].w > g.edges[x].w ? y : x)) : -1;
      const val = m >= 0 ? W - g.edges[m].w + e.w : Infinity;
      if (val < best) { best = val; bestSwap = [i, m]; }
      r.snap(m < 0 ? `非樹邊 ${e.u}–${e.v}（${e.w}）：路徑上沒有嚴格小於 ${e.w} 的邊，無法得到嚴格更大的樹` : `非樹邊 ${e.u}–${e.v}（${e.w}）：環上最大可刪邊 ${g.edges[m].u}–${g.edges[m].v}（${g.edges[m].w}），新權重 ${W} − ${g.edges[m].w} + ${e.w} = ${val}`, [gpanel(g, { edge: { ...Object.fromEntries(tree.map((j) => [j, 'visited' as Color])), ...Object.fromEntries(pth.map((j) => [j, 'compare' as Color])), ...(m >= 0 ? { [m]: 'bad' as Color } : {}), [i]: 'swap' } }), vars({ 目前最佳: best === Infinity ? '∞' : best })], m < 0 ? 4 : 6);
    });
    if (!bestSwap) { r.snap('不存在次小生成樹（只有一棵生成樹，或所有替換都無法得到嚴格更大的權重）', [gpanel(g, { edge: Object.fromEntries(tree.map((i) => [i, 'path' as Color])) })], 7); return r.frames; }
    const [add, del] = bestSwap as [number, number];
    const second = [...tree.filter((i) => i !== del), add];
    r.snap(`次小生成樹權重 ${best}（加入 ${g.edges[add].u}–${g.edges[add].v}，刪除 ${g.edges[del].u}–${g.edges[del].v}）${best === W ? '：與 MST 等重但是不同的樹' : ''}`, [gpanel(g, { edge: Object.fromEntries(second.map((i) => [i, 'done' as Color])) }), vars({ MST: W, 次小: best })], 7);
    return r.frames;
  },
};

// ---------------- Yen K 條最短路徑 ----------------
const dijkstraPath = (g: G, s: string, t: string, banE: Set<number>, banN: Set<string>) => {
  const adj = adjacency(g);
  const dist: Record<string, number> = { [s]: 0 }, prev: Record<string, number> = {};
  const done = new Set<string>();
  for (;;) {
    let u: string | null = null;
    for (const n of g.nodes) if (!done.has(n) && dist[n] !== undefined && !banN.has(n) && (u === null || dist[n] < dist[u] || (dist[n] === dist[u] && n < u))) u = n;
    if (u === null) return null;
    if (u === t) break;
    done.add(u);
    for (const { to, w, ei } of adj[u]) if (!banE.has(ei) && !banN.has(to) && (dist[to] === undefined || dist[u] + w < dist[to])) { dist[to] = dist[u] + w; prev[to] = ei; }
  }
  const nodes = [t], edges: number[] = [];
  while (nodes[0] !== s) { const e = prev[nodes[0]]; edges.unshift(e); nodes.unshift(g.edges[e].u); }
  return { nodes, edges, cost: dist[t] };
};
const yen: AlgoDef = {
  id: 'yen-k-shortest', name: 'Yen K 條最短簡單路徑', en: "Yen's K Shortest Paths", cat: 'path',
  desc: '先用 Dijkstra 找出最短路徑。接著對上一條路徑的每個「偏離點」：保留起點到偏離點的根路徑，刪掉所有已知路徑在相同根路徑後走的下一條邊、以及根路徑上的其他節點，再從偏離點跑 Dijkstra 到終點，接起來成為候選。每輪從候選中取最短的。路徑不重複頂點，權重須非負。',
  time: 'O(K·V·(E + V log V))', space: 'O(K·V + E)',
  code: ['A[0] = Dijkstra(s, t)', 'for k = 1 .. K−1:', '  for 上一條路徑 A[k−1] 的每個偏離點 i:', '    root = A[k−1] 的前 i+1 個點', '    刪除：與 root 相同前綴的已知路徑的下一條邊；root 上 i 之前的點', '    spur = Dijkstra(偏離點, t)；若存在則 root + spur 加入候選 B', '  A[k] = B 中最短者（從 B 移除）'],
  inputs: [graphInput('C D 3\nC E 2\nD F 4\nE D 1\nE F 2\nE G 3\nF G 2\nF H 1\nG H 2', { directed: true, weighted: true, n: 6, m: 10 }), inText('s', '起點', 'C', (c) => nodesOf(c)[0]), inText('t', '終點', 'H', (c) => rnd.pick(nodesOf(c))), inNum('K', 'K', 3, 1, 8)],
  run({ graph, s, t, K }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    if (g.edges.some((e) => e.w < 0)) throw new Error('Yen 演算法要求非負權重');
    const S = pick(g, s), Tt = String(t).trim();
    if (!g.nodes.includes(Tt)) throw new Error(`終點 ${Tt} 不在圖中`);
    const first = dijkstraPath(g, S, Tt, new Set(), new Set());
    if (!first) { r.snap(`${S} 到 ${Tt} 沒有路徑`, [gpanel(g, {})], 1); return r.frames; }
    const A = [first];
    const B: typeof A = [];
    const list = () => table(A.map((p, i) => [i + 1, p.nodes.join('→'), p.cost]), {}, { colHeaders: ['#', '路徑', '長度'], w: 'half' });
    r.snap(`第 1 條最短路徑：${first.nodes.join(' → ')}（${first.cost}）`, [gpanel(g, { node: Object.fromEntries(first.nodes.map((x) => [x, 'path' as Color])), edge: Object.fromEntries(first.edges.map((e) => [e, 'path' as Color])) }), list()], 1);
    for (let k = 1; k < K; k++) {
      const last = A[k - 1];
      for (let i = 0; i < last.nodes.length - 1; i++) {
        const spurNode = last.nodes[i];
        const rootNodes = last.nodes.slice(0, i + 1), rootEdges = last.edges.slice(0, i);
        const banE = new Set<number>(), banN = new Set<string>(rootNodes.slice(0, -1));
        for (const p of A) if (p.nodes.slice(0, i + 1).join() === rootNodes.join()) banE.add(p.edges[i]);
        const spur = dijkstraPath(g, spurNode, Tt, banE, banN);
        const cost = rootEdges.reduce((x, e) => x + g.edges[e].w, 0);
        if (spur) {
          const cand = { nodes: [...rootNodes, ...spur.nodes.slice(1)], edges: [...rootEdges, ...spur.edges], cost: cost + spur.cost };
          if (!B.some((p) => p.nodes.join() === cand.nodes.join()) && !A.some((p) => p.nodes.join() === cand.nodes.join())) B.push(cand);
        }
        r.snap(`偏離點 ${spurNode}：根路徑 ${rootNodes.join('→')}，刪除 ${banE.size} 條邊與 ${banN.size} 個點` + (spur ? `；接上 ${spur.nodes.join('→')} 成為候選（${cost + spur.cost}）` : '；找不到偏離路徑'), [gpanel(g, { node: { ...Object.fromEntries([...banN].map((x) => [x, 'muted' as Color])), ...Object.fromEntries(rootNodes.map((x) => [x, 'frontier' as Color])), [spurNode]: 'active', ...(spur ? Object.fromEntries(spur.nodes.slice(1).map((x) => [x, 'swap' as Color])) : {}) }, edge: { ...Object.fromEntries([...banE].map((e) => [e, 'bad' as Color])), ...Object.fromEntries(rootEdges.map((e) => [e, 'frontier' as Color])), ...(spur ? Object.fromEntries(spur.edges.map((e) => [e, 'swap' as Color])) : {}) } }), table(B.map((p) => [p.nodes.join('→'), p.cost]), {}, { colHeaders: ['候選', '長度'], w: 'half' })], 6);
      }
      if (!B.length) { r.snap(`沒有更多候選：只存在 ${A.length} 條簡單路徑`, [gpanel(g, {}), list()], 7); return r.frames; }
      B.sort((x, y) => x.cost - y.cost || x.nodes.length - y.nodes.length || (x.nodes.join() < y.nodes.join() ? -1 : 1));
      const nxt = B.shift()!;
      A.push(nxt);
      r.snap(`第 ${k + 1} 條：${nxt.nodes.join(' → ')}（${nxt.cost}）`, [gpanel(g, { node: Object.fromEntries(nxt.nodes.map((x) => [x, 'path' as Color])), edge: Object.fromEntries(nxt.edges.map((e) => [e, 'path' as Color])) }), list()], 7);
    }
    return r.frames;
  },
};

// ---------------- 最小割：暴力對照 ----------------
const bruteMinCut = (g: G) => {
  const n = g.nodes.length;
  let best = Infinity;
  for (let m = 1; m < 1 << (n - 1); m++) {
    let c = 0;
    for (const e of g.edges) if (((m >> g.nodes.indexOf(e.u)) & 1) !== ((m >> g.nodes.indexOf(e.v)) & 1)) c += e.w;
    best = Math.min(best, c);
  }
  return best;
};

// ---------------- Karger 隨機最小割 ----------------
const karger: AlgoDef = {
  id: 'karger-min-cut', name: 'Karger 隨機最小割', en: 'Karger Min Cut', cat: 'flow',
  desc: '隨機選一條邊把兩端縮成一個超節點（保留平行邊、刪除自環），重複直到只剩兩個超節點，它們之間的邊數就是一個割。單次找到最小割的機率至少 2 / (n(n−1))，所以要重複多次取最小值。本頁用固定種子重現結果，並與枚舉所有割的答案比對（小圖）。',
  time: '單次 O(E α(V))；重複 O(n² log n) 次可高機率成功', space: 'O(V + E)',
  code: ['repeat T 次:', '  每個點自成一個超節點', '  while 超節點數 > 2:', '    隨機選一條兩端屬於不同超節點的邊', '    合併兩端（自環自動消失，平行邊保留）', '  割 = 兩個超節點之間的邊數', 'return 所有試驗中最小的割'],
  inputs: [graphInput('A B\nA C\nA D\nB C\nB D\nC D\nD E\nE F\nE G\nF G\nF H\nG H\nE H', { n: 8, m: 13 }), inNum('trials', '試驗次數 T', 6, 1, 50), inSeed()],
  run({ graph, trials, seed }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    g.edges = g.edges.filter((e) => e.u !== e.v).map((e) => ({ ...e, w: 1 }));
    if (g.nodes.length < 2) throw new Error('至少需要 2 個頂點');
    if (g.nodes.length > 14) throw new Error('最多 14 個頂點');
    const rng = parkMiller(seed);
    let best = Infinity, bestSets: string[][] = [];
    for (let t = 1; t <= trials; t++) {
      const p: Record<string, string> = Object.fromEntries(g.nodes.map((n) => [n, n]));
      const find = (x: string): string => (p[x] === x ? x : (p[x] = find(p[x])));
      let groups = g.nodes.length;
      const view = (msg: string, line: number, hl?: number) => {
        const reps = [...new Set(g.nodes.map(find))];
        const col = Object.fromEntries(g.nodes.map((n) => [n, PALETTE[reps.indexOf(find(n)) % PALETTE.length]]));
        r.snap(msg, [gpanel(g, { node: col, edge: Object.fromEntries(g.edges.map((e, i) => [i, i === hl ? 'swap' : find(e.u) === find(e.v) ? 'muted' : undefined])), title: '同色為同一個超節點；灰色邊已成為自環' }), vars({ 試驗: `${t}/${trials}`, 超節點: groups, 目前最小割: best === Infinity ? '—' : best })], line);
      };
      if (t <= 2) view(`第 ${t} 次試驗開始`, 2);
      while (groups > 2) {
        const live = g.edges.map((_, i) => i).filter((i) => find(g.edges[i].u) !== find(g.edges[i].v));
        if (!live.length) break;
        const i = live[rng.int(live.length)];
        p[find(g.edges[i].u)] = find(g.edges[i].v);
        groups--;
        if (t <= 2) view(`隨機選到邊 ${g.edges[i].u}–${g.edges[i].v}，合併兩個超節點`, 5, i);
      }
      const cut = g.edges.filter((e) => find(e.u) !== find(e.v)).length;
      const sets = [...new Set(g.nodes.map(find))].map((rep) => g.nodes.filter((n) => find(n) === rep));
      if (cut < best) { best = cut; bestSets = sets; }
      view(`第 ${t} 次試驗：剩兩個超節點 {${sets.map((s) => s.join(',')).join('} {')}}，割 = ${cut}`, 6);
    }
    const truth = bruteMinCut(g);
    r.snap(`${trials} 次試驗的最小割 = ${best}（{${bestSets.map((s) => s.join(',')).join('} | {')}}）；枚舉所有割得到 ${truth}${best === truth ? '，找到了真正的最小割' : '，這次沒找到，增加試驗次數可以提高機率'}`, [gpanel(g, { node: Object.fromEntries(bestSets.flatMap((s, k) => s.map((n) => [n, k ? 'special' as Color : 'frontier' as Color]))), edge: Object.fromEntries(g.edges.map((e, i) => [i, bestSets[0]?.includes(e.u) !== bestSets[0]?.includes(e.v) ? 'bad' as Color : undefined])) }), vars({ Karger: best, 正確答案: truth }, undefined, { Karger: best === truth ? 'done' : 'bad' })], 7);
    return r.frames;
  },
};

// ---------------- Stoer–Wagner ----------------
const stoer: AlgoDef = {
  id: 'stoer-wagner', name: 'Stoer–Wagner 全域最小割', en: 'Stoer–Wagner Min Cut', cat: 'flow',
  desc: '不需要指定源點與匯點的無向圖最小割。每個階段做「最大鄰接排序」：從任一點開始，每次加入與已選集合連接權重最大的點。最後加入的點 t 單獨一邊所形成的割就是 s–t 最小割（s 為倒數第二個）。記下它，再把 s 與 t 合併，重複 n − 1 個階段，取最小值。權重必須非負。',
  time: 'O(V³)（用堆積可到 O(VE + V² log V)）', space: 'O(V²)',
  code: ['best = ∞', 'while 剩餘超節點 > 1:', '  A = {任一點}；w(v) = v 與 A 的連接權重', '  每次把 w 最大的點加入 A（最大鄰接排序）', '  s, t = 倒數第二與最後加入的點', '  best = min(best, w(t))        (切出 t 的割)', '  合併 s 與 t'],
  inputs: [graphInput('1 2 2\n1 5 3\n2 3 3\n2 5 2\n2 6 2\n3 4 4\n3 7 2\n4 7 2\n4 8 2\n5 6 3\n6 7 1\n7 8 3', { weighted: true, n: 7, m: 11 })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    if (g.edges.some((e) => e.w < 0)) throw new Error('Stoer–Wagner 要求非負權重');
    if (g.nodes.length < 2 || g.nodes.length > 14) throw new Error('頂點數需介於 2 與 14');
    const N = g.nodes;
    const n = N.length;
    const W = N.map((u) => N.map((v) => g.edges.filter((e) => (e.u === u && e.v === v) || (e.u === v && e.v === u)).reduce((s, e) => s + e.w, 0)));
    const members = N.map((u) => [u]);
    const alive = N.map(() => true);
    let best = Infinity, bestSet: string[] = [];
    for (let phase = 1; phase < n; phase++) {
      const ids = alive.map((a, i) => (a ? i : -1)).filter((i) => i >= 0);
      const inA = new Set<number>([ids[0]]);
      const w = new Array(n).fill(0);
      for (const v of ids) w[v] = W[ids[0]][v];
      const order = [ids[0]];
      while (order.length < ids.length) {
        let pickV = -1;
        for (const v of ids) if (!inA.has(v) && (pickV < 0 || w[v] > w[pickV])) pickV = v;
        inA.add(pickV); order.push(pickV);
        for (const v of ids) if (!inA.has(v)) w[v] += W[pickV][v];
      }
      const t = order[order.length - 1], s = order[order.length - 2];
      const cutW = order.length > 1 ? ids.reduce((x, v) => (v === t ? x : x + W[t][v]), 0) : 0;
      const col = Object.fromEntries(N.map((u) => { const k = members.findIndex((m, i) => alive[i] && m.includes(u)); return [u, k === t ? 'bad' as Color : k === s ? 'special' as Color : PALETTE[(order.indexOf(k) + 2) % PALETTE.length]]; }));
      const improved = cutW < best;
      if (improved) { best = cutW; bestSet = [...members[t]]; }
      r.snap(`第 ${phase} 階段：最大鄰接順序 ${order.map((i) => `{${members[i].join(',')}}`).join(' → ')}；切出最後的 {${members[t].join(',')}} 得割 ${cutW}${improved ? '（目前最佳）' : ''}`, [gpanel(g, { node: col, sub: Object.fromEntries(N.map((u) => { const k = members.findIndex((m, i) => alive[i] && m.includes(u)); return [u, `#${order.indexOf(k) + 1}`]; })), title: '紅：最後加入的 t；粉：倒數第二的 s；下方為加入順序' }), vars({ 本階段割: cutW, 最佳: best })], 5);
      for (let v = 0; v < n; v++) { W[s][v] += W[t][v]; W[v][s] = W[s][v]; }
      members[s].push(...members[t]);
      alive[t] = false;
      r.snap(`合併 s 與 t：{${members[s].join(',')}}`, [gpanel(g, { node: Object.fromEntries(members[s].map((u) => [u, 'swap' as Color])) })], 6);
    }
    const truth = bruteMinCut(g);
    r.snap(`全域最小割 = ${best}：一邊是 {${bestSet.join(',')}}；枚舉所有割得到 ${truth}${best === truth ? '，一致' : '，不一致！'}`, [gpanel(g, { node: Object.fromEntries(N.map((u) => [u, bestSet.includes(u) ? 'special' as Color : 'frontier' as Color])), edge: Object.fromEntries(g.edges.map((e, i) => [i, bestSet.includes(e.u) !== bestSet.includes(e.v) ? 'bad' as Color : undefined])) })], 1);
    return r.frames;
  },
};

// ---------------- Edmonds 花朵匹配 ----------------
const blossom: AlgoDef = {
  id: 'edmonds-blossom', name: 'Edmonds 花朵匹配', en: 'Edmonds Blossom', cat: 'flow',
  desc: '一般（非二分）圖的最大匹配。從未匹配點出發，用 BFS 沿「非匹配邊、匹配邊」交替延伸尋找增廣路。遇到奇數長度的環（花朵）時，把整個環收縮成一個點再繼續搜尋；找到增廣路後展開花朵並翻轉路徑上的匹配狀態。二分圖沒有奇環，所以一般匹配才需要這一步。',
  time: 'O(V³)', space: 'O(V + E)',
  code: ['for 每個未匹配點 root:', '  BFS 交替樹：偶數層點沿非匹配邊找鄰居 v', '    v 未匹配：找到增廣路，沿路徑翻轉匹配', '    v 在樹上且同為偶數層：發現奇環（花朵）', '      找出兩端的最近共同祖先，把整個環收縮成一個點（base）', '    否則：v 與它的配偶加入交替樹', '直到找不到增廣路'],
  inputs: [graphInput('1 2\n2 3\n3 4\n4 5\n5 1\n3 6\n6 7\n7 8\n8 9\n9 6\n5 10', { n: 9, m: 12 })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const N = g.nodes, n = N.length;
    if (n > 16) throw new Error('最多 16 個頂點');
    const id = (x: string) => N.indexOf(x);
    const adj: number[][] = N.map(() => []);
    for (const e of g.edges) if (e.u !== e.v) { adj[id(e.u)].push(id(e.v)); adj[id(e.v)].push(id(e.u)); }
    const match = new Array(n).fill(-1);
    const matchedEdges = () => Object.fromEntries(g.edges.map((e, i) => [i, match[id(e.u)] === id(e.v) ? 'path' as Color : undefined]));
    const view = (msg: string, line: number, nc: Record<string, Color> = {}, ec: Record<number, Color> = {}) => r.snap(msg, [gpanel(g, { node: nc, edge: { ...matchedEdges(), ...ec } }), vars({ 匹配數: match.filter((m) => m >= 0).length / 2 })], line);
    let found = 0;
    for (let root = 0; root < n; root++) {
      if (match[root] >= 0) continue;
      const p = new Array(n).fill(-1), base = N.map((_, i) => i), used = new Array(n).fill(false);
      used[root] = true;
      const q = [root];
      const lca = (a: number, b: number) => {
        const seen = new Array(n).fill(false);
        for (;;) { a = base[a]; seen[a] = true; if (match[a] < 0) break; a = p[match[a]]; }
        for (;;) { b = base[b]; if (seen[b]) return b; b = p[match[b]]; }
      };
      const markPath = (v: number, b: number, child: number, inBl: boolean[]) => {
        while (base[v] !== b) { inBl[base[v]] = inBl[base[match[v]]] = true; p[v] = child; child = match[v]; v = p[match[v]]; }
      };
      let aug = -1;
      for (let h = 0; h < q.length && aug < 0; h++) {
        const v = q[h];
        for (const u of adj[v]) {
          if (base[v] === base[u] || match[v] === u) continue;
          if (u === root || (match[u] >= 0 && p[match[u]] >= 0)) {
            const cb = lca(v, u);
            const inBl = new Array(n).fill(false);
            markPath(v, cb, u, inBl);
            markPath(u, cb, v, inBl);
            const members: number[] = [];
            for (let i = 0; i < n; i++) if (inBl[base[i]]) { members.push(i); base[i] = cb; if (!used[i]) { used[i] = true; q.push(i); } }
            view(`發現奇環（花朵）：${members.map((i) => N[i]).join('、')}，收縮成以 ${N[cb]} 為基底的一個點`, 5, { ...Object.fromEntries(members.map((i) => [N[i], 'special' as Color])), [N[cb]]: 'bad', [N[root]]: 'active' });
          } else if (p[u] < 0) {
            p[u] = v;
            if (match[u] < 0) { aug = u; break; }
            used[match[u]] = true;
            q.push(match[u]);
          }
        }
      }
      if (aug < 0) { view(`從 ${N[root]} 找不到增廣路`, 7, { [N[root]]: 'muted' }); continue; }
      const pathN: number[] = [];
      for (let v = aug; v >= 0;) { const pv = p[v], ppv = match[pv]; pathN.push(v, pv); match[v] = pv; match[pv] = v; v = ppv; }
      found++;
      view(`從 ${N[root]} 找到增廣路並翻轉：匹配數 +1`, 3, Object.fromEntries(pathN.map((i) => [N[i], 'swap' as Color])));
    }
    // 暴力對照：位元 DP
    const memo = new Map<number, number>();
    const best = (mask: number): number => {
      if (memo.has(mask)) return memo.get(mask)!;
      let i = 0;
      while (i < n && mask >> i & 1) i++;
      if (i >= n) return 0;
      let res = best(mask | (1 << i));
      for (const u of adj[i]) if (!(mask >> u & 1)) res = Math.max(res, 1 + best(mask | (1 << i) | (1 << u)));
      memo.set(mask, res);
      return res;
    };
    const truth = best(0);
    view(`最大匹配 = ${found}；以位元 DP 枚舉得到 ${truth}${found === truth ? '，一致' : '，不一致！'}`, 7, Object.fromEntries(N.map((x, i) => [x, match[i] >= 0 ? 'done' as Color : 'muted' as Color])));
    return r.frames;
  },
};

export default [multiBfs, iddfs, closure, twoSat, dagLongest, criticalPath, tarjanLca, rerooting, centroid, mo, offlineConn, secondMst, yen, karger, stoer, blossom] satisfies AlgoDef[];
