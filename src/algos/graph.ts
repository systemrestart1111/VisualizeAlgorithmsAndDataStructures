import type { AlgoDef, Color } from '../core/types';
import { Rec, cells, vars, inText, inSelect, text } from '../core/helpers';
import { adjacency, gpanel, graphInput, parseGraph, type G } from '../core/graph';

const cat = 'graph';
const PALETTE: Color[] = ['active', 'path', 'visited', 'good', 'special', 'frontier', 'compare', 'swap'];
const dirSel = (def = 'u') => inSelect('dir', '圖的類型', [['u', '無向圖'], ['d', '有向圖']], def);
const startIn = (def = 'A') => inText('start', '起點', def);
const pickStart = (g: G, s: string) => (g.nodes.includes(s) ? s : g.nodes[0]);

const DEF_U = 'A B\nA C\nB D\nB E\nC F\nE F\nD G\nE G\nF H\nG H';

const bfs: AlgoDef = {
  id: 'bfs', name: '廣度優先搜尋', en: 'Breadth-First Search', cat, star: true,
  desc: '從起點開始，以佇列一層一層往外擴展。在無權圖中，BFS 第一次到達某點時所走的就是最短路徑。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['dist[s] = 0, q = [s]', 'while q 非空:', '  u = q.dequeue()', '  for v in adj[u]:', '    if v 未拜訪:', '      dist[v] = dist[u] + 1, parent[v] = u', '      q.enqueue(v)'],
  inputs: [graphInput(DEF_U), dirSel(), startIn()],
  run({ graph, dir, start }) {
    const r = new Rec();
    const g = parseGraph(graph, dir === 'd');
    const adj = adjacency(g);
    const s = pickStart(g, start);
    const dist: Record<string, number> = { [s]: 0 };
    const q = [s];
    const done = new Set<string>();
    const tree = new Set<number>();
    let u = '';
    const P = (ec: Record<number, Color> = {}, nc: Record<string, Color> = {}) => [gpanel(g, { node: { ...Object.fromEntries(q.map((x) => [x, 'frontier' as Color])), ...Object.fromEntries([...done].map((x) => [x, 'visited' as Color])), [u]: 'active', ...nc }, edge: { ...Object.fromEntries([...tree].map((e) => [e, 'path' as Color])), ...ec }, sub: dist }), cells(q.length ? q : [''], {}, { title: '佇列', headers: false, w: 'half' }), vars({ 目前: u || '-' })];
    r.snap(`從 ${s} 開始，距離 0`, P(), 1);
    while (q.length) {
      u = q.shift()!;
      r.snap(`取出 ${u}`, P(), 3);
      for (const { to, ei } of adj[u]) {
        if (to in dist) { r.snap(`${to} 已拜訪過`, P({ [ei]: 'muted' }), 5); continue; }
        dist[to] = dist[u] + 1;
        tree.add(ei);
        q.push(to);
        r.snap(`發現 ${to}，距離 ${dist[to]}，加入佇列`, P({ [ei]: 'compare' }), 7);
      }
      done.add(u);
    }
    u = '';
    r.snap('BFS 完成，粗線為 BFS 樹（節點下方為距離）', P(), 2);
    return r.frames;
  },
};

const dfs: AlgoDef = {
  id: 'dfs', name: '深度優先搜尋', en: 'Depth-First Search', cat, star: true,
  desc: '沿著一條路一直走到底，無路可走時回溯。節點標示 發現時間/完成時間，可用於拓撲排序、找環、連通分量等。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['dfs(u):', '  visited[u] = true; d[u] = ++time', '  for v in adj[u]:', '    if not visited[v]:', '      parent[v] = u; dfs(v)', '  f[u] = ++time'],
  inputs: [graphInput(DEF_U), dirSel(), startIn()],
  run({ graph, dir, start }) {
    const r = new Rec();
    const g = parseGraph(graph, dir === 'd');
    const adj = adjacency(g);
    const s = pickStart(g, start);
    const d: Record<string, number> = {}, f: Record<string, number> = {};
    const stack: string[] = [];
    const tree = new Set<number>();
    let time = 0;
    const P = (u: string, ec: Record<number, Color> = {}) => [gpanel(g, { node: { ...Object.fromEntries(Object.keys(d).map((x) => [x, 'frontier' as Color])), ...Object.fromEntries(Object.keys(f).map((x) => [x, 'visited' as Color])), [u]: 'active' }, edge: { ...Object.fromEntries([...tree].map((e) => [e, 'path' as Color])), ...ec }, sub: Object.fromEntries(Object.keys(d).map((x) => [x, `${d[x]}/${f[x] ?? ''}`])) }), cells(stack.length ? stack : [''], {}, { title: '遞迴堆疊', headers: false, w: 'half' })];
    const go = (u: string) => {
      d[u] = ++time;
      stack.push(u);
      r.snap(`發現 ${u}（d = ${d[u]}）`, P(u), 2);
      for (const { to, ei } of adj[u]) {
        if (to in d) { r.snap(`${to} 已拜訪`, P(u, { [ei]: 'muted' }), 4); continue; }
        tree.add(ei);
        r.snap(`沿 ${u}→${to} 深入`, P(u, { [ei]: 'compare' }), 5);
        go(to);
        r.snap(`回溯到 ${u}`, P(u), 3);
      }
      f[u] = ++time;
      stack.pop();
      r.snap(`${u} 完成（f = ${f[u]}）`, P(u), 6);
    };
    go(s);
    for (const n of g.nodes) if (!(n in d)) { r.snap(`${n} 尚未拜訪，從 ${n} 開始新的 DFS`, P(n), 1); go(n); }
    r.snap('DFS 完成；節點下方為 發現/完成 時間', P(''));
    return r.frames;
  },
};

const components: AlgoDef = {
  id: 'connected-components', name: '連通分量', en: 'Connected Components', cat,
  desc: '對每個尚未拜訪的節點啟動一次 BFS/DFS，該次拜訪到的所有節點構成一個連通分量。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['comp = 0', 'for s in V:', '  if s 未拜訪:', '    comp++', '    BFS(s)，把拜訪到的點標為 comp'],
  inputs: [graphInput('A B\nB C\nC A\nD E\nF G\nG H\nH F\nF I\nJ', { connected: false, n: 10, m: 7 })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const adj = adjacency(g);
    const comp: Record<string, number> = {};
    let c = 0;
    const col = () => Object.fromEntries(Object.entries(comp).map(([k, v]) => [k, PALETTE[v % PALETTE.length]]));
    for (const s of g.nodes) {
      if (s in comp) continue;
      comp[s] = c;
      r.snap(`${s} 未拜訪，開始第 ${c + 1} 個分量`, [gpanel(g, { node: col(), sub: comp })], 4);
      const q = [s];
      while (q.length) {
        const u = q.shift()!;
        for (const { to } of adj[u]) if (!(to in comp)) { comp[to] = c; q.push(to); r.snap(`${to} 屬於分量 ${c}`, [gpanel(g, { node: col(), sub: comp })], 5); }
      }
      c++;
    }
    r.snap(`共有 ${c} 個連通分量`, [gpanel(g, { node: col(), sub: comp }), vars({ 分量數: c })]);
    return r.frames;
  },
};

const cycle: AlgoDef = {
  id: 'cycle-detection', name: '環偵測', en: 'Cycle Detection', cat,
  desc: '無向圖：DFS 時遇到「已拜訪且不是父節點」的鄰居就有環。有向圖：三色標記（白=未拜訪、灰=在遞迴堆疊中、黑=完成），遇到灰色節點即為回邊，代表有環。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['dfs(u, parent):', '  color[u] = 灰', '  for v in adj[u]:', '    無向：v 已拜訪且 v != parent → 有環', '    有向：color[v] == 灰 → 有環（回邊）', '    color[v] == 白: dfs(v, u)', '  color[u] = 黑'],
  inputs: [graphInput('A B\nB C\nC D\nD B\nA E\nE F', { directed: true }), dirSel('d')],
  run({ graph, dir }) {
    const r = new Rec();
    const directed = dir === 'd';
    const g = parseGraph(graph, directed);
    const adj = adjacency(g);
    const color: Record<string, number> = {};
    const par: Record<string, string | null> = {};
    const tree = new Set<number>();
    const C = (): Record<string, Color> => Object.fromEntries(Object.entries(color).map(([k, v]) => [k, v === 1 ? 'frontier' : 'visited']));
    const E = () => Object.fromEntries([...tree].map((e) => [e, 'path' as Color]));
    let found: { u: string; v: string; ei: number } | null = null;
    const go = (u: string, pe: number): boolean => {
      color[u] = 1;
      r.snap(`進入 ${u}（灰色）`, [gpanel(g, { node: { ...C(), [u]: 'active' }, edge: E() })], 2);
      for (const { to, ei } of adj[u]) {
        if (!directed && ei === pe) continue;
        if (color[to] === 1 || (!directed && color[to] === 2)) {
          found = { u, v: to, ei };
          return true;
        }
        if (color[to] === undefined) {
          tree.add(ei);
          par[to] = u;
          if (go(to, ei)) return true;
        }
      }
      color[u] = 2;
      r.snap(`${u} 完成（黑色）`, [gpanel(g, { node: C(), edge: E() })], 7);
      return false;
    };
    for (const s of g.nodes) if (color[s] === undefined && go(s, -1)) break;
    if (found) {
      const { u, v, ei } = found as { u: string; v: string; ei: number };
      const cyc = new Set<string>([v]);
      const ce = new Set<number>([ei]);
      for (let x: string | undefined = u; x !== undefined && x !== v; x = par[x] ?? undefined) {
        cyc.add(x);
        const px = par[x];
        const pe = g.edges.findIndex((e) => (e.u === px && e.v === x) || (!directed && e.v === px && e.u === x));
        if (pe >= 0) ce.add(pe);
      }
      r.snap(`${u} → ${v}：${v} ${directed ? '仍在遞迴堆疊中（灰色）' : '已拜訪且不是父節點'} → 發現環！`, [gpanel(g, { node: Object.fromEntries([...cyc].map((x) => [x, 'bad' as Color])), edge: Object.fromEntries([...ce].map((e) => [e, 'bad' as Color])) })], directed ? 5 : 4);
    } else r.snap('所有節點都處理完，沒有環', [gpanel(g, { node: C(), edge: E() })]);
    return r.frames;
  },
};

const bipartite: AlgoDef = {
  id: 'bipartite', name: '二分圖判定', en: 'Bipartite Check (2-coloring)', cat,
  desc: '以 BFS 交替塗兩種顏色，若某條邊兩端顏色相同則不是二分圖（等價於存在奇數長度的環）。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['for s in V 未著色:', '  color[s] = 0, q = [s]', '  while q 非空:', '    u = q.dequeue()', '    for v in adj[u]:', '      未著色: color[v] = 1 - color[u]; enqueue', '      color[v] == color[u]: 不是二分圖'],
  inputs: [graphInput('A B\nA D\nB C\nC D\nC F\nE F\nE B\nG H\nD G')],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const adj = adjacency(g);
    const col: Record<string, number> = {};
    const C = () => Object.fromEntries(Object.entries(col).map(([k, v]) => [k, (v ? 'special' : 'active') as Color]));
    for (const s of g.nodes) {
      if (s in col) continue;
      col[s] = 0;
      r.snap(`${s} 塗成藍色`, [gpanel(g, { node: C(), sub: col })], 2);
      const q = [s];
      while (q.length) {
        const u = q.shift()!;
        for (const { to, ei } of adj[u]) {
          if (!(to in col)) { col[to] = 1 - col[u]; q.push(to); r.snap(`${to} 塗成與 ${u} 相反的顏色`, [gpanel(g, { node: C(), edge: { [ei]: 'compare' }, sub: col })], 6); }
          else if (col[to] === col[u]) {
            r.snap(`邊 ${u}–${to} 兩端同色 → 不是二分圖`, [gpanel(g, { node: { ...C(), [u]: 'bad', [to]: 'bad' }, edge: { [ei]: 'bad' }, sub: col })], 7);
            return r.frames;
          }
        }
      }
    }
    r.snap('所有邊兩端都不同色 → 是二分圖', [gpanel(g, { node: C(), sub: col })]);
    return r.frames;
  },
};

const DEF_DAG = 'A C\nB C\nB D\nC E\nD F\nE F\nE G\nF H\nG H';

const kahn: AlgoDef = {
  id: 'topo-kahn', name: '拓撲排序（入度法）', en: "Topological Sort (Kahn's Algorithm)", cat, star: true,
  desc: '反覆取出入度為 0 的節點加入結果，並把它的出邊移除（鄰居入度減 1）。若最後結果少於 V 個點，代表圖中有環。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['計算所有節點的入度 indeg', 'q = 所有 indeg == 0 的節點', 'while q 非空:', '  u = q.dequeue(); order.append(u)', '  for v in adj[u]:', '    indeg[v]--', '    if indeg[v] == 0: q.enqueue(v)', 'if |order| < V: 有環'],
  inputs: [graphInput(DEF_DAG, { directed: true, dag: true })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    const adj = adjacency(g);
    const indeg: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, 0]));
    for (const e of g.edges) indeg[e.v]++;
    const q = g.nodes.filter((n) => indeg[n] === 0);
    const order: string[] = [];
    const removed = new Set<number>();
    const P = (u = '', ec: Record<number, Color> = {}) => [gpanel(g, { node: { ...Object.fromEntries(q.map((x) => [x, 'frontier' as Color])), ...Object.fromEntries(order.map((x) => [x, 'done' as Color])), ...(u ? { [u]: 'active' as Color } : {}) }, edge: { ...Object.fromEntries([...removed].map((e) => [e, 'muted' as Color])), ...ec }, sub: Object.fromEntries(g.nodes.map((n) => [n, 'in=' + indeg[n]])) }), cells(q.length ? q : [''], {}, { title: '佇列（入度 0）', headers: false, w: 'half' }), cells(order.length ? order : [''], {}, { title: '拓撲順序', headers: false, w: 'half' })];
    r.snap('計算入度；入度為 0 的節點放入佇列', P(), 2);
    while (q.length) {
      const u = q.shift()!;
      order.push(u);
      r.snap(`取出 ${u} 加入結果`, P(u), 4);
      for (const { to, ei } of adj[u]) {
        indeg[to]--;
        removed.add(ei);
        if (indeg[to] === 0) q.push(to);
        r.snap(`移除邊 ${u}→${to}，indeg[${to}] = ${indeg[to]}${indeg[to] === 0 ? '，加入佇列' : ''}`, P(u, { [ei]: 'compare' }), indeg[to] === 0 ? 7 : 6);
      }
    }
    if (order.length < g.nodes.length) r.snap(`只排出 ${order.length}/${g.nodes.length} 個節點 → 圖中有環，無拓撲順序`, P(), 8);
    else r.snap(`拓撲順序：${order.join(' → ')}`, P());
    return r.frames;
  },
};

const topoDfs: AlgoDef = {
  id: 'topo-dfs', name: '拓撲排序（深度優先）', en: 'Topological Sort (DFS)', cat, star: true,
  desc: '對 DAG 做 DFS，節點「完成」時推入堆疊；最後反轉完成順序即為拓撲順序（完成時間越晚越前面）。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['for u in V: if 未拜訪: dfs(u)', 'dfs(u):', '  visited[u] = true', '  for v in adj[u]: if 未拜訪: dfs(v)', '  stack.push(u)  (完成)', 'order = reverse(stack)'],
  inputs: [graphInput(DEF_DAG, { directed: true, dag: true })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    const adj = adjacency(g);
    const vis = new Set<string>();
    const fin: string[] = [];
    const P = (u: string) => [gpanel(g, { node: { ...Object.fromEntries([...vis].map((x) => [x, 'frontier' as Color])), ...Object.fromEntries(fin.map((x) => [x, 'done' as Color])), [u]: 'active' }, sub: Object.fromEntries(fin.map((x, i) => [x, 'f' + (i + 1)])) }), cells(fin.length ? fin : [''], {}, { title: '完成順序（堆疊）', headers: false, w: 'half' }), cells(fin.length ? [...fin].reverse() : [''], {}, { title: '目前拓撲順序（反轉）', headers: false, w: 'half' })];
    const go = (u: string) => {
      vis.add(u);
      r.snap(`拜訪 ${u}`, P(u), 3);
      for (const { to } of adj[u]) if (!vis.has(to)) go(to);
      fin.push(u);
      r.snap(`${u} 完成，推入堆疊`, P(u), 5);
    };
    for (const u of g.nodes) if (!vis.has(u)) go(u);
    r.snap(`拓撲順序：${[...fin].reverse().join(' → ')}`, P(''), 6);
    return r.frames;
  },
};

const DEF_SCC = 'A B\nB C\nC A\nB D\nD E\nE F\nF D\nG F\nG H\nH I\nI G\nI J';

const tarjan: AlgoDef = {
  id: 'scc-tarjan', name: '強連通分量（塔揚）', en: "Tarjan's SCC", cat,
  desc: '一次 DFS：記錄發現時間 disc 與 low（可回到的最早節點）。節點在堆疊中直到其 SCC 完成；當 low[u] == disc[u] 時，從堆疊彈出到 u 為止即為一個 SCC。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['dfs(u):', '  disc[u] = low[u] = ++time; stack.push(u)', '  for v in adj[u]:', '    if v 未拜訪: dfs(v); low[u] = min(low[u], low[v])', '    elif v 在堆疊中: low[u] = min(low[u], disc[v])', '  if low[u] == disc[u]:', '    彈出直到 u，形成一個 SCC'],
  inputs: [graphInput(DEF_SCC, { directed: true })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    const adj = adjacency(g);
    const disc: Record<string, number> = {}, low: Record<string, number> = {}, comp: Record<string, number> = {};
    const st: string[] = [];
    const on = new Set<string>();
    let time = 0, c = 0;
    const P = (u: string, ec: Record<number, Color> = {}) => [gpanel(g, { node: { ...Object.fromEntries(st.map((x) => [x, 'frontier' as Color])), ...Object.fromEntries(Object.entries(comp).map(([k, v]) => [k, PALETTE[v % PALETTE.length]])), ...(u ? { [u]: 'compare' as Color } : {}) }, edge: ec, sub: Object.fromEntries(Object.keys(disc).map((x) => [x, `${disc[x]}/${low[x]}`])) }), cells(st.length ? st : [''], {}, { title: '堆疊', headers: false, w: 'half' }), vars({ 'disc/low': '節點下方' })];
    const go = (u: string) => {
      disc[u] = low[u] = ++time;
      st.push(u); on.add(u);
      r.snap(`拜訪 ${u}：disc = low = ${time}`, P(u), 2);
      for (const { to, ei } of adj[u]) {
        if (!(to in disc)) {
          go(to);
          low[u] = Math.min(low[u], low[to]);
          r.snap(`從 ${to} 返回：low[${u}] = min(low[${u}], low[${to}]) = ${low[u]}`, P(u, { [ei]: 'path' }), 4);
        } else if (on.has(to)) {
          low[u] = Math.min(low[u], disc[to]);
          r.snap(`${to} 在堆疊中（回邊）：low[${u}] = ${low[u]}`, P(u, { [ei]: 'special' }), 5);
        }
      }
      if (low[u] === disc[u]) {
        const mem: string[] = [];
        let x: string;
        do { x = st.pop()!; on.delete(x); comp[x] = c; mem.push(x); } while (x !== u);
        r.snap(`low[${u}] == disc[${u}]：彈出 {${mem.join(', ')}} 成為 SCC #${c}`, P(''), 7);
        c++;
      }
    };
    for (const u of g.nodes) if (!(u in disc)) go(u);
    r.snap(`共 ${c} 個強連通分量`, P(''));
    return r.frames;
  },
};

const kosaraju: AlgoDef = {
  id: 'scc-kosaraju', name: '強連通分量（科薩拉朱）', en: "Kosaraju's SCC", cat,
  desc: '兩次 DFS：第一次在原圖記錄完成順序；第二次在反向圖上，依完成時間由晚到早啟動 DFS，每次拜訪到的節點即為一個 SCC。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['第一次 DFS（原圖）：完成時推入 order', '建立反向圖 Gᵀ', 'for u in reverse(order):', '  if u 未指派: 在 Gᵀ 上 DFS(u)', '    拜訪到的節點組成一個 SCC'],
  inputs: [graphInput(DEF_SCC, { directed: true })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, true);
    const adj = adjacency(g);
    const vis = new Set<string>();
    const order: string[] = [];
    const go1 = (u: string) => {
      vis.add(u);
      r.snap(`第一次 DFS：拜訪 ${u}`, [gpanel(g, { node: { ...Object.fromEntries([...vis].map((x) => [x, 'frontier' as Color])), ...Object.fromEntries(order.map((x) => [x, 'visited' as Color])), [u]: 'active' } }), cells(order.length ? order : [''], {}, { title: '完成順序', headers: false })], 1);
      for (const { to } of adj[u]) if (!vis.has(to)) go1(to);
      order.push(u);
    };
    for (const u of g.nodes) if (!vis.has(u)) go1(u);
    const rg: G = { ...g, edges: g.edges.map((e) => ({ u: e.v, v: e.u, w: e.w })) };
    const radj = adjacency(rg);
    const comp: Record<string, number> = {};
    let c = 0;
    const C = () => Object.fromEntries(Object.entries(comp).map(([k, v]) => [k, PALETTE[v % PALETTE.length]]));
    r.snap('建立反向圖（所有邊反轉）', [gpanel(rg, { title: '反向圖 Gᵀ' }), cells([...order].reverse(), {}, { title: '依完成時間由晚到早處理', headers: false })], 2);
    for (const s of [...order].reverse()) {
      if (s in comp) continue;
      const st = [s];
      comp[s] = c;
      while (st.length) {
        const u = st.pop()!;
        r.snap(`在反向圖從 ${s} 出發：${u} 屬於 SCC #${c}`, [gpanel(rg, { node: { ...C(), [u]: 'compare' }, title: '反向圖 Gᵀ' }), cells([...order].reverse(), Object.fromEntries([...order].reverse().map((x, i) => [i, x in comp ? 'done' : undefined])), { title: '處理順序', headers: false })], 4);
        for (const { to } of radj[u]) if (!(to in comp)) { comp[to] = c; st.push(to); }
      }
      c++;
    }
    r.snap(`共 ${c} 個強連通分量（以原圖顯示）`, [gpanel(g, { node: C(), sub: comp })], 5);
    return r.frames;
  },
};

const bridges: AlgoDef = {
  id: 'bridges-articulation', name: '橋與割點', en: 'Bridges & Articulation Points', cat,
  desc: '以 DFS 計算 disc 與 low。樹邊 u–v 若 low[v] > disc[u] 則為「橋」；非根節點 u 若有子節點 v 使 low[v] ≥ disc[u] 則為「割點」，根節點則需要 ≥ 2 個 DFS 子樹。',
  time: 'O(V + E)', space: 'O(V)',
  code: ['dfs(u, parentEdge):', '  disc[u] = low[u] = ++time', '  for (v, e) in adj[u], e != parentEdge:', '    if v 已拜訪: low[u] = min(low[u], disc[v])', '    else: dfs(v, e); low[u] = min(low[u], low[v])', '      if low[v] > disc[u]: e 是橋', '      if low[v] >= disc[u] 且 u 非根: u 是割點', '  根節點：DFS 子樹數 ≥ 2 則為割點'],
  inputs: [graphInput('A B\nB C\nC A\nC D\nD E\nE F\nF D\nF G\nG H\nB I')],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const adj = adjacency(g);
    const disc: Record<string, number> = {}, low: Record<string, number> = {};
    const bridge = new Set<number>(), art = new Set<string>();
    let time = 0;
    const P = (u: string, ec: Record<number, Color> = {}) => [gpanel(g, { node: { ...Object.fromEntries(Object.keys(disc).map((x) => [x, 'visited' as Color])), ...Object.fromEntries([...art].map((x) => [x, 'bad' as Color])), ...(u ? { [u]: 'active' as Color } : {}) }, edge: { ...Object.fromEntries([...bridge].map((e) => [e, 'bad' as Color])), ...ec }, sub: Object.fromEntries(Object.keys(disc).map((x) => [x, `${disc[x]}/${low[x]}`])) }), vars({ 橋: [...bridge].map((e) => `${g.edges[e].u}-${g.edges[e].v}`).join(' ') || '無', 割點: [...art].join(' ') || '無' })];
    const go = (u: string, pe: number, isRoot: boolean) => {
      disc[u] = low[u] = ++time;
      let kids = 0;
      r.snap(`拜訪 ${u}：disc = low = ${time}`, P(u), 2);
      for (const { to, ei } of adj[u]) {
        if (ei === pe) continue;
        if (to in disc) { low[u] = Math.min(low[u], disc[to]); r.snap(`回邊 ${u}–${to}：low[${u}] = ${low[u]}`, P(u, { [ei]: 'special' }), 4); continue; }
        kids++;
        go(to, ei, false);
        low[u] = Math.min(low[u], low[to]);
        if (low[to] > disc[u]) { bridge.add(ei); r.snap(`low[${to}] = ${low[to]} > disc[${u}] = ${disc[u]} → ${u}–${to} 是橋`, P(u, { [ei]: 'bad' }), 6); }
        else r.snap(`從 ${to} 返回：low[${u}] = ${low[u]}`, P(u, { [ei]: 'path' }), 5);
        if (!isRoot && low[to] >= disc[u] && !art.has(u)) { art.add(u); r.snap(`low[${to}] ≥ disc[${u}] → ${u} 是割點`, P(u), 7); }
      }
      if (isRoot && kids >= 2) { art.add(u); r.snap(`根 ${u} 有 ${kids} 棵 DFS 子樹 → 割點`, P(u), 8); }
    };
    for (const u of g.nodes) if (!(u in disc)) go(u, -1, true);
    r.snap('完成：紅色邊為橋、紅色節點為割點', P(''));
    return r.frames;
  },
};

const hierholzer: AlgoDef = {
  id: 'hierholzer', name: '歐拉路徑（希爾霍爾澤）', en: "Hierholzer's Algorithm (Euler Path)", cat,
  desc: '找出每條邊恰好走一次的路徑。無向圖需 0 或 2 個奇數度節點（有 2 個時從其中之一出發）。用堆疊一路走未用過的邊，走不動時把節點彈出加入路徑，最後反轉。',
  time: 'O(E)', space: 'O(E)',
  code: ['檢查度數，選擇起點', 'stack = [start], path = []', 'while stack 非空:', '  u = stack.top', '  if u 還有未使用的邊 (u, v):', '    標記邊已使用; stack.push(v)', '  else: path.append(stack.pop())', 'return reverse(path)'],
  inputs: [graphInput('A B\nB C\nC A\nC D\nD E\nE C\nB D\nA D', { m: 10 })],
  run({ graph }) {
    const r = new Rec();
    const g = parseGraph(graph, false);
    const adj = adjacency(g);
    const deg: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, adj[n].length]));
    const odd = g.nodes.filter((n) => deg[n] % 2);
    if (odd.length !== 0 && odd.length !== 2) {
      r.snap(`有 ${odd.length} 個奇數度節點（${odd.join(', ')}），不存在歐拉路徑`, [gpanel(g, { node: Object.fromEntries(odd.map((x) => [x, 'bad' as Color])), sub: deg })], 1);
      return r.frames;
    }
    const start = odd[0] ?? g.nodes.find((n) => deg[n] > 0) ?? g.nodes[0];
    r.snap(odd.length ? `奇數度節點為 ${odd.join(', ')}，從 ${start} 出發（歐拉路徑）` : `所有節點度數為偶數，從 ${start} 出發（歐拉迴路）`, [gpanel(g, { node: { [start]: 'special' }, sub: deg })], 1);
    const used = new Set<number>();
    const st = [start], path: string[] = [];
    const ptr: Record<string, number> = Object.fromEntries(g.nodes.map((n) => [n, 0]));
    const P = (u: string, ec: Record<number, Color> = {}) => [gpanel(g, { node: { ...Object.fromEntries(st.map((x) => [x, 'frontier' as Color])), [u]: 'active' }, edge: { ...Object.fromEntries([...used].map((e) => [e, 'muted' as Color])), ...ec } }), cells(st, {}, { title: '堆疊', headers: false, w: 'half' }), cells(path.length ? path : [''], {}, { title: '路徑（反向收集）', headers: false, w: 'half' })];
    while (st.length) {
      const u = st[st.length - 1];
      while (ptr[u] < adj[u].length && used.has(adj[u][ptr[u]].ei)) ptr[u]++;
      if (ptr[u] < adj[u].length) {
        const { to, ei } = adj[u][ptr[u]];
        used.add(ei);
        st.push(to);
        r.snap(`走邊 ${u}–${to}`, P(to, { [ei]: 'swap' }), 6);
      } else {
        path.push(st.pop()!);
        r.snap(`${u} 沒有未使用的邊，彈出加入路徑`, P(u), 7);
      }
    }
    const ans = path.reverse();
    if (used.size < g.edges.length) r.snap('圖不連通，無法走完所有邊', P(''));
    else r.snap(`歐拉路徑：${ans.join(' → ')}`, [gpanel(g, { edge: Object.fromEntries(g.edges.map((_, i) => [i, 'path' as Color])) }), text([ans.join(' → ')], '結果')], 8);
    return r.frames;
  },
};

export default [bfs, dfs, components, cycle, bipartite, kahn, topoDfs, tarjan, kosaraju, bridges, hierholzer];
