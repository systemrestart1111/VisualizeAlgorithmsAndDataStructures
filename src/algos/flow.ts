import type { AlgoDef, Color, GEdge, GraphPanel } from '../core/types';
import { Rec, vars, inText, table, rnd, text } from '../core/helpers';
import { gpanel, parseGraph, type G } from '../core/graph';

const cat = 'flow';

const DEF_NET = 'S A 10\nS C 10\nA B 4\nA C 2\nA D 8\nC D 9\nD B 6\nB T 10\nD T 10';
const randomNet = () => {
  const mids = 'ABCDE'.split('').slice(0, rnd.int(3, 5));
  const lines: string[] = [];
  for (const m of mids) if (Math.random() < 0.7) lines.push(`S ${m} ${rnd.int(3, 15)}`);
  lines.push(`S ${mids[0]} ${rnd.int(3, 15)}`);
  for (let i = 0; i < mids.length; i++) for (let j = 0; j < mids.length; j++) if (i !== j && Math.random() < 0.3) lines.push(`${mids[i]} ${mids[j]} ${rnd.int(2, 10)}`);
  for (const m of mids) if (Math.random() < 0.6) lines.push(`${m} T ${rnd.int(3, 15)}`);
  lines.push(`${mids[mids.length - 1]} T ${rnd.int(3, 15)}`);
  return [...new Set(lines.map((l) => l.split(' ').slice(0, 2).join(' ')))].map((k) => lines.find((l) => l.startsWith(k + ' '))!).join('\n');
};
const netInputs = () => [{ key: 'graph', label: '網路（每行：起點 終點 容量）', type: 'text' as const, multiline: true, default: DEF_NET, random: randomNet }, inText('s', '源點', 'S'), inText('t', '匯點', 'T')];

/** 殘量網路：邊 2i 為原邊 i 的正向，2i+1 為反向 */
class Net {
  to: number[] = [];
  cap: number[] = [];
  adj: number[][];
  constructor(public n: number) {
    this.adj = Array.from({ length: n }, () => []);
  }
  add(u: number, v: number, c: number) {
    this.adj[u].push(this.to.length); this.to.push(v); this.cap.push(c);
    this.adj[v].push(this.to.length); this.to.push(u); this.cap.push(0);
  }
}

function setup(graph: string, s0: string, t0: string) {
  const g = parseGraph(graph, true);
  const idx: Record<string, number> = Object.fromEntries(g.nodes.map((n, i) => [n, i]));
  const net = new Net(g.nodes.length);
  for (const e of g.edges) net.add(idx[e.u], idx[e.v], Math.max(0, e.w));
  const s = idx[s0] ?? 0, t = idx[t0] ?? g.nodes.length - 1;
  const panel = (o: { pathEdges?: number[]; node?: Record<string, Color | undefined>; sub?: Record<string, string>; title?: string } = {}) => {
    const ec: Record<number, Color> = {};
    g.edges.forEach((_, i) => { if (net.cap[2 * i + 1] > 0) ec[i] = net.cap[2 * i] === 0 ? 'visited' : 'active'; });
    for (const id of o.pathEdges ?? []) ec[id >> 1] = id & 1 ? 'special' : 'path';
    return gpanel(g, { node: { [g.nodes[s]]: 'good', [g.nodes[t]]: 'bad', ...o.node }, edge: ec, edgeLabel: Object.fromEntries(g.edges.map((e, i) => [i, `${net.cap[2 * i + 1]}/${e.w}`])), sub: o.sub, title: o.title ?? '邊上為 流量/容量（藍：有流量，紫：已飽和，橘：增廣路徑，粉：沿反向邊退流）' });
  };
  return { g, net, s, t, panel, name: (i: number) => g.nodes[i] };
}

function augmentAlong(net: Net, path: number[]) {
  const b = Math.min(...path.map((id) => net.cap[id]));
  for (const id of path) { net.cap[id] -= b; net.cap[id ^ 1] += b; }
  return b;
}

const pathStr = (S: ReturnType<typeof setup>, path: number[]) => [S.name(S.net.to[path[0] ^ 1]), ...path.map((id) => S.name(S.net.to[id]))].join('→');

const fordFulkerson: AlgoDef = {
  id: 'ford-fulkerson', name: '福特–富爾克森演算法', en: 'Ford–Fulkerson (DFS)', cat,
  desc: '在殘量網路中以 DFS 找任一條從源點到匯點的增廣路徑，沿路推送瓶頸容量，並在反向邊加上相同的量（允許之後「退流」）。重複直到找不到路徑。',
  time: 'O(E · maxFlow)', space: 'O(V + E)',
  code: ['flow = 0', 'while 殘量網路中存在 s→t 路徑 P（DFS）:', '  b = P 上的最小殘量', '  for (u,v) in P:', '    cap[u][v] -= b; cap[v][u] += b', '  flow += b', 'return flow'],
  inputs: netInputs(),
  run({ graph, s, t }) {
    const r = new Rec();
    const S = setup(graph, s, t);
    const { net } = S;
    let flow = 0;
    r.snap('初始流量為 0', [S.panel(), vars({ maxFlow: 0 })], 1);
    for (let it = 0; it < 100; it++) {
      const vis = new Set<number>();
      const path: number[] = [];
      const dfs = (u: number): boolean => {
        if (u === S.t) return true;
        vis.add(u);
        for (const id of net.adj[u]) {
          if (net.cap[id] <= 0 || vis.has(net.to[id])) continue;
          path.push(id);
          if (dfs(net.to[id])) return true;
          path.pop();
        }
        return false;
      };
      if (!dfs(S.s)) break;
      const b = Math.min(...path.map((id) => net.cap[id]));
      r.snap(`DFS 找到增廣路徑 ${pathStr(S, path)}，瓶頸 = ${b}`, [S.panel({ pathEdges: path }), vars({ maxFlow: flow, 瓶頸: b })], 3);
      augmentAlong(net, path);
      flow += b;
      r.snap(`推送 ${b} 單位，總流量 = ${flow}`, [S.panel({ pathEdges: path }), vars({ maxFlow: flow })], 6);
    }
    r.snap(`找不到增廣路徑，最大流 = ${flow}`, [S.panel(), vars({ maxFlow: flow })], 7);
    return r.frames;
  },
};

const edmondsKarp: AlgoDef = {
  id: 'edmonds-karp', name: '埃德蒙茲–卡普演算法', en: 'Edmonds–Karp (BFS)', cat,
  desc: 'Ford–Fulkerson 的特例：每次用 BFS 找「邊數最少」的增廣路徑，保證增廣次數為 O(VE)，總時間與容量大小無關。',
  time: 'O(V · E²)', space: 'O(V + E)',
  code: ['flow = 0', 'loop:', '  BFS 從 s 出發，只走殘量 > 0 的邊', '  if t 未被拜訪: break', '  沿 parent 回溯得到最短增廣路徑 P', '  b = min 殘量；沿 P 更新正反向殘量', '  flow += b', 'return flow'],
  inputs: netInputs(),
  run({ graph, s, t }) {
    const r = new Rec();
    const S = setup(graph, s, t);
    const { net } = S;
    let flow = 0;
    r.snap('初始流量為 0', [S.panel(), vars({ maxFlow: 0 })], 1);
    for (let it = 0; it < 100; it++) {
      const pe: number[] = new Array(net.n).fill(-1);
      const dist: number[] = new Array(net.n).fill(-1);
      dist[S.s] = 0;
      const q = [S.s];
      for (let i = 0; i < q.length; i++) for (const id of net.adj[q[i]]) { const v = net.to[id]; if (net.cap[id] > 0 && dist[v] < 0) { dist[v] = dist[q[i]] + 1; pe[v] = id; q.push(v); } }
      const sub = Object.fromEntries(S.g.nodes.map((n, i) => [n, dist[i] >= 0 ? 'd=' + dist[i] : '']));
      r.snap(`BFS 第 ${it + 1} 次：節點下方為 BFS 距離`, [S.panel({ sub, node: Object.fromEntries(q.map((x) => [S.name(x), 'frontier' as Color])) }), vars({ maxFlow: flow })], 3);
      if (dist[S.t] < 0) break;
      const path: number[] = [];
      for (let v = S.t; v !== S.s; v = net.to[pe[v] ^ 1]) path.unshift(pe[v]);
      const b = augmentAlong(net, path);
      flow += b;
      r.snap(`最短增廣路徑 ${pathStr(S, path)}（${path.length} 條邊），推送 ${b}，總流量 ${flow}`, [S.panel({ pathEdges: path, sub }), vars({ maxFlow: flow })], 6);
    }
    r.snap(`匯點不可達，最大流 = ${flow}`, [S.panel(), vars({ maxFlow: flow })], 8);
    return r.frames;
  },
};

const dinic: AlgoDef = {
  id: 'dinic', name: '迪尼茨演算法', en: "Dinic's Algorithm", cat,
  desc: '每個階段先 BFS 建立「層次圖」（只保留 level 遞增 1 的邊），再用 DFS 在層次圖上找出阻塞流（含當前弧優化）。階段數最多 V−1。',
  time: 'O(V² · E)，單位容量 O(E√V)', space: 'O(V + E)',
  code: ['while BFS 能從 s 到達 t（計算 level）:', '  it[*] = 0  (當前弧)', '  while (f = dfs(s, ∞)) > 0: flow += f', 'dfs(u, push):', '  if u == t: return push', '  for 邊 e 從 it[u] 開始:', '    if cap[e] > 0 且 level[v] == level[u] + 1:', '      d = dfs(v, min(push, cap[e])); 若 d > 0 更新並回傳', 'return flow'],
  inputs: netInputs(),
  run({ graph, s, t }) {
    const r = new Rec();
    const S = setup(graph, s, t);
    const { net } = S;
    let flow = 0, phase = 0;
    for (;;) {
      const level: number[] = new Array(net.n).fill(-1);
      level[S.s] = 0;
      const q = [S.s];
      for (let i = 0; i < q.length; i++) for (const id of net.adj[q[i]]) if (net.cap[id] > 0 && level[net.to[id]] < 0) { level[net.to[id]] = level[q[i]] + 1; q.push(net.to[id]); }
      const sub = Object.fromEntries(S.g.nodes.map((n, i) => [n, level[i] >= 0 ? 'L' + level[i] : '']));
      if (level[S.t] < 0) { r.snap('BFS 無法到達匯點，結束', [S.panel({ sub }), vars({ maxFlow: flow })], 9); break; }
      phase++;
      r.snap(`階段 ${phase}：BFS 建立層次圖（節點下方為 level）`, [S.panel({ sub }), vars({ maxFlow: flow, 階段: phase })], 1);
      const it: number[] = new Array(net.n).fill(0);
      const path: number[] = [];
      const dfs = (u: number, push: number): number => {
        if (u === S.t) return push;
        for (; it[u] < net.adj[u].length; it[u]++) {
          const id = net.adj[u][it[u]], v = net.to[id];
          if (net.cap[id] <= 0 || level[v] !== level[u] + 1) continue;
          path.push(id);
          const d = dfs(v, Math.min(push, net.cap[id]));
          if (d > 0) { net.cap[id] -= d; net.cap[id ^ 1] += d; return d; }
          path.pop();
        }
        return 0;
      };
      for (;;) {
        path.length = 0;
        const f = dfs(S.s, Infinity);
        if (!f) break;
        flow += f;
        r.snap(`在層次圖上找到路徑 ${pathStr(S, path)}，推送 ${f}，總流量 ${flow}`, [S.panel({ pathEdges: [...path], sub }), vars({ maxFlow: flow, 階段: phase })], 3);
      }
      r.snap(`階段 ${phase} 達成阻塞流`, [S.panel({ sub }), vars({ maxFlow: flow, 階段: phase })], 3);
    }
    r.snap(`最大流 = ${flow}`, [S.panel(), vars({ maxFlow: flow })], 9);
    return r.frames;
  },
};

const pushRelabel: AlgoDef = {
  id: 'push-relabel', name: '推送–重標記演算法', en: 'Push–Relabel (FIFO)', cat,
  desc: '不找增廣路徑，而是維護「預流」：每個節點有高度 h 與超額流 e。有超額的節點把流推給高度恰好低 1 的鄰居；推不出去就提高自己的高度（relabel）。最後所有超額流回到匯點或源點。',
  time: 'O(V³)', space: 'O(V + E)',
  code: ['h[s] = V；從 s 推滿所有出邊（預流）', 'active = 有超額的節點（不含 s, t）', 'while active 非空:', '  u = active.pop()', '  for 殘量邊 (u, v) 且 h[u] == h[v] + 1:', '    push min(e[u], cap)', '  if e[u] > 0 仍有剩:', '    relabel: h[u] = 1 + min h[v]（殘量 > 0 的鄰居）'],
  inputs: netInputs(),
  run({ graph, s, t }) {
    const r = new Rec();
    const S = setup(graph, s, t);
    const { net } = S;
    const h: number[] = new Array(net.n).fill(0), ex: number[] = new Array(net.n).fill(0);
    h[S.s] = net.n;
    const sub = () => Object.fromEntries(S.g.nodes.map((n, i) => [n, `h${h[i]} e${ex[i]}`]));
    for (const id of net.adj[S.s]) if (!(id & 1)) { const c = net.cap[id]; net.cap[id] = 0; net.cap[id ^ 1] += c; ex[net.to[id]] += c; ex[S.s] -= c; }
    const q: number[] = [];
    for (let i = 0; i < net.n; i++) if (i !== S.s && i !== S.t && ex[i] > 0) q.push(i);
    r.snap(`h[${S.name(S.s)}] = ${net.n}，把源點的出邊全部推滿（節點下方：高度 h、超額 e）`, [S.panel({ sub: sub(), node: Object.fromEntries(q.map((x) => [S.name(x), 'frontier' as Color])) })], 1);
    let guard = 0;
    while (q.length && guard++ < 400) {
      const u = q.shift()!;
      for (const id of net.adj[u]) {
        if (!ex[u]) break;
        const v = net.to[id];
        if (net.cap[id] > 0 && h[u] === h[v] + 1) {
          const d = Math.min(ex[u], net.cap[id]);
          net.cap[id] -= d; net.cap[id ^ 1] += d; ex[u] -= d; ex[v] += d;
          if (v !== S.s && v !== S.t && !q.includes(v)) q.push(v);
          r.snap(`push：${S.name(u)} → ${S.name(v)} 推送 ${d}`, [S.panel({ sub: sub(), pathEdges: [id], node: { [S.name(u)]: 'active', ...Object.fromEntries(q.map((x) => [S.name(x), 'frontier' as Color])) } })], 6);
        }
      }
      if (ex[u] > 0) {
        let mn = Infinity;
        for (const id of net.adj[u]) if (net.cap[id] > 0) mn = Math.min(mn, h[net.to[id]]);
        h[u] = mn + 1;
        q.push(u);
        r.snap(`relabel：${S.name(u)} 仍有超額 ${ex[u]}，高度提升為 ${h[u]}`, [S.panel({ sub: sub(), node: { [S.name(u)]: 'compare' } })], 8);
      }
    }
    r.snap(`沒有活躍節點，最大流 = e[${S.name(S.t)}] = ${ex[S.t]}`, [S.panel({ sub: sub() }), vars({ maxFlow: ex[S.t] })], 3);
    return r.frames;
  },
};

const mcmf: AlgoDef = {
  id: 'min-cost-max-flow', name: '最小費用最大流', en: 'Min-Cost Max-Flow (SPFA)', cat,
  desc: '在達到最大流的所有方案中，找總費用最小者：每次以 Bellman–Ford/SPFA 在殘量網路上找「費用最短」的增廣路徑（反向邊費用為負），推送瓶頸流量。',
  time: 'O(F · V · E)', space: 'O(V + E)',
  code: ['while 存在 s→t 的殘量路徑:', '  以 SPFA 求費用最短路（反向邊費用 = -cost）', '  b = 路徑上最小殘量', '  沿路徑推送 b', '  totalCost += b × 路徑費用', 'return (maxFlow, totalCost)'],
  inputs: [{ key: 'graph', label: '網路（每行：起點 終點 容量 費用）', type: 'text', multiline: true, default: 'S A 4 1\nS B 2 2\nA B 2 1\nA C 2 3\nB C 5 1\nA T 1 6\nC T 4 2\nB T 1 5', random: () => randomNet().split('\n').map((l) => l + ' ' + rnd.int(1, 6)).join('\n') }, inText('s', '源點', 'S'), inText('t', '匯點', 'T')],
  run({ graph, s, t }) {
    const r = new Rec();
    const rows = String(graph).split('\n').map((l) => l.trim().split(/\s+/)).filter((x) => x.length >= 3);
    const g = parseGraph(rows.map((x) => `${x[0]} ${x[1]} ${x[2]}`).join('\n'), true);
    const cost = rows.map((x) => Number(x[3] ?? 1));
    const idx: Record<string, number> = Object.fromEntries(g.nodes.map((n, i) => [n, i]));
    const net = new Net(g.nodes.length);
    const ec: number[] = [];
    g.edges.forEach((e, i) => { net.add(idx[e.u], idx[e.v], e.w); ec.push(cost[i], -cost[i]); });
    const src = idx[s] ?? 0, snk = idx[t] ?? g.nodes.length - 1;
    let flow = 0, total = 0;
    const panel = (path: number[] = [], dist?: number[]) => {
      const col: Record<number, Color> = {};
      g.edges.forEach((_, i) => { if (net.cap[2 * i + 1] > 0) col[i] = net.cap[2 * i] === 0 ? 'visited' : 'active'; });
      for (const id of path) col[id >> 1] = id & 1 ? 'special' : 'path';
      return gpanel(g, { node: { [g.nodes[src]]: 'good', [g.nodes[snk]]: 'bad' }, edge: col, edgeLabel: Object.fromEntries(g.edges.map((e, i) => [i, `${net.cap[2 * i + 1]}/${e.w} $${cost[i]}`])), sub: dist ? Object.fromEntries(g.nodes.map((n, i) => [n, dist[i] === Infinity ? '∞' : 'd' + dist[i]])) : undefined, title: '邊上為 流量/容量 $單位費用' });
    };
    r.snap('開始', [panel(), vars({ flow, cost: total })], 1);
    for (let it = 0; it < 100; it++) {
      const dist: number[] = new Array(net.n).fill(Infinity), pe: number[] = new Array(net.n).fill(-1), inq: boolean[] = new Array(net.n).fill(false);
      dist[src] = 0;
      const q = [src];
      while (q.length) {
        const u = q.shift()!;
        inq[u] = false;
        for (const id of net.adj[u]) { const v = net.to[id]; if (net.cap[id] > 0 && dist[u] + ec[id] < dist[v]) { dist[v] = dist[u] + ec[id]; pe[v] = id; if (!inq[v]) { inq[v] = true; q.push(v); } } }
      }
      if (dist[snk] === Infinity) break;
      const path: number[] = [];
      for (let v = snk; v !== src; v = net.to[pe[v] ^ 1]) path.unshift(pe[v]);
      r.snap(`SPFA 找到費用最短的增廣路徑，單位費用 ${dist[snk]}`, [panel(path, dist), vars({ flow, cost: total })], 2);
      const b = augmentAlong(net, path);
      flow += b; total += b * dist[snk];
      r.snap(`推送 ${b} 單位，費用 +${b}×${dist[snk]}，總流量 ${flow}、總費用 ${total}`, [panel(path), vars({ flow, cost: total })], 5);
    }
    r.snap(`完成：最大流 ${flow}，最小費用 ${total}`, [panel(), vars({ flow, cost: total })], 6);
    return r.frames;
  },
};

// ---------- 二分圖匹配 ----------

const DEF_BIP = 'L1 R1\nL1 R2\nL2 R1\nL3 R2\nL3 R3\nL4 R3\nL4 R4\nL5 R4\nL5 R5\nL2 R3';
const randomBip = () => {
  const n = rnd.int(4, 6), m = rnd.int(4, 6);
  const lines = new Set<string>();
  for (let i = 1; i <= n; i++) for (let k = 0; k < rnd.int(1, 3); k++) lines.add(`L${i} R${rnd.int(1, m)}`);
  return [...lines].join('\n');
};
const bipInput = () => ({ key: 'graph', label: '二分圖（每行：左點 右點）', type: 'text' as const, multiline: true, default: DEF_BIP, random: randomBip });

function bipartite(src: string) {
  const g = parseGraph(src, false);
  const L = [...new Set(g.edges.map((e) => e.u))];
  const R = [...new Set(g.edges.map((e) => e.v))].filter((x) => !L.includes(x));
  L.forEach((n, i) => (g.pos[n] = { x: 0, y: i * 60 }));
  R.forEach((n, i) => (g.pos[n] = { x: 240, y: i * 60 }));
  const adj: Record<string, { to: string; ei: number }[]> = Object.fromEntries(L.map((l) => [l, []]));
  g.edges.forEach((e, ei) => adj[e.u]?.push({ to: e.v, ei }));
  return { g, L, R, adj };
}

function matchPanel(g: G, match: Record<string, string>, o: { path?: Set<number>; node?: Record<string, Color | undefined>; sub?: Record<string, string> } = {}) {
  const ec: Record<number, Color> = {};
  g.edges.forEach((e, i) => { if (match[e.u] === e.v) ec[i] = 'done'; else ec[i] = 'muted'; });
  for (const i of o.path ?? []) ec[i] = 'path';
  return gpanel(g, { edge: ec, node: { ...Object.fromEntries(Object.keys(match).flatMap((l) => [[l, 'done' as Color], [match[l], 'done' as Color]])), ...o.node }, sub: o.sub, title: '綠：已匹配邊　橘：增廣路徑' });
}

const kuhn: AlgoDef = {
  id: 'bipartite-matching', name: '二分圖增廣路匹配', en: "Bipartite Matching (Kuhn's Augmenting Path)", cat,
  desc: '對每個左點嘗試用 DFS 找增廣路徑：交替走「非匹配邊、匹配邊」，若到達未匹配的右點，就沿路翻轉所有邊的匹配狀態，匹配數 +1。',
  time: 'O(V · E)', space: 'O(V)',
  code: ['for u in L:', '  visited = {}', '  if try(u): result++', 'try(u):', '  for v in adj[u]:', '    if v in visited: continue; visited.add(v)', '    if matchR[v] 為空 or try(matchR[v]):', '      matchR[v] = u; return true', '  return false'],
  inputs: [bipInput()],
  run({ graph }) {
    const r = new Rec();
    const { g, L, adj } = bipartite(graph);
    const mL: Record<string, string> = {}, mR: Record<string, string> = {};
    let cnt = 0;
    for (const u of L) {
      const vis = new Set<string>();
      const path = new Set<number>();
      r.snap(`為 ${u} 尋找增廣路徑`, [matchPanel(g, mL, { node: { [u]: 'active' } }), vars({ 匹配數: cnt })], 1);
      const tryK = (x: string): boolean => {
        for (const { to, ei } of adj[x]) {
          if (vis.has(to)) continue;
          vis.add(to);
          path.add(ei);
          r.snap(`${x} 嘗試 ${to}${mR[to] ? `（已配給 ${mR[to]}，嘗試讓 ${mR[to]} 改配）` : '（未匹配！）'}`, [matchPanel(g, mL, { path, node: { [x]: 'active', [to]: 'compare' } }), vars({ 匹配數: cnt })], 7);
          if (!mR[to] || tryK(mR[to])) { mR[to] = x; mL[x] = to; return true; }
          path.delete(ei);
        }
        return false;
      };
      if (tryK(u)) { cnt++; r.snap(`找到增廣路徑，翻轉後匹配數 = ${cnt}`, [matchPanel(g, mL, { path }), vars({ 匹配數: cnt })], 3); }
      else r.snap(`${u} 找不到增廣路徑`, [matchPanel(g, mL, { node: { [u]: 'bad' } }), vars({ 匹配數: cnt })], 9);
    }
    r.snap(`最大匹配數 = ${cnt}`, [matchPanel(g, mL), vars({ 匹配數: cnt })]);
    return r.frames;
  },
};

const hopcroft: AlgoDef = {
  id: 'hopcroft-karp', name: '霍普克洛夫特–卡普匹配', en: 'Hopcroft–Karp', cat,
  desc: '每個階段先從所有未匹配左點同時 BFS 分層，找出最短增廣路徑的長度；再用 DFS 一次找出一組「點不相交」的最短增廣路徑全部翻轉。階段數只有 O(√V)。',
  time: 'O(E √V)', space: 'O(V)',
  code: ['while BFS 從所有自由左點分層，能到達自由右點:', '  for 每個自由左點 u:', '    if dfs(u): 匹配數++', 'dfs(u): 沿 dist 遞增的交錯路徑尋找自由右點', 'return 匹配數'],
  inputs: [bipInput()],
  run({ graph }) {
    const r = new Rec();
    const { g, L, adj } = bipartite(graph);
    const mL: Record<string, string> = {}, mR: Record<string, string> = {};
    let cnt = 0, phase = 0;
    for (;;) {
      const dist: Record<string, number> = {};
      const q: string[] = [];
      for (const u of L) if (!mL[u]) { dist[u] = 0; q.push(u); }
      let found = false;
      for (let i = 0; i < q.length; i++) {
        const u = q[i];
        for (const { to } of adj[u]) {
          const w = mR[to];
          if (!w) found = true;
          else if (dist[w] === undefined) { dist[w] = dist[u] + 1; q.push(w); }
        }
      }
      const sub = Object.fromEntries(Object.entries(dist).map(([k, v]) => [k, 'L' + v]));
      if (!found) { r.snap('BFS 找不到通往自由右點的交錯路徑，結束', [matchPanel(g, mL, { sub }), vars({ 匹配數: cnt })], 5); break; }
      phase++;
      r.snap(`階段 ${phase}：從所有自由左點 BFS 分層`, [matchPanel(g, mL, { sub, node: Object.fromEntries(L.filter((u) => !mL[u]).map((u) => [u, 'frontier' as Color])) }), vars({ 匹配數: cnt, 階段: phase })], 1);
      const allPaths = new Set<number>();
      const dfs = (u: string, path: number[]): boolean => {
        for (const { to, ei } of adj[u]) {
          const w = mR[to];
          if (!w || (dist[w] === dist[u] + 1 && dfs(w, [...path, ei]))) {
            for (const e of [...path, ei]) allPaths.add(e);
            mR[to] = u; mL[u] = to;
            return true;
          }
        }
        dist[u] = Infinity;
        return false;
      };
      for (const u of L) if (!mL[u] && dfs(u, [])) cnt++;
      r.snap(`同時翻轉 ${phase} 階段找到的所有點不相交最短增廣路徑，匹配數 = ${cnt}`, [matchPanel(g, mL, { path: allPaths }), vars({ 匹配數: cnt, 階段: phase })], 3);
    }
    r.snap(`最大匹配數 = ${cnt}`, [matchPanel(g, mL), vars({ 匹配數: cnt })]);
    return r.frames;
  },
};

const hungarian: AlgoDef = {
  id: 'hungarian', name: '匈牙利演算法', en: 'Hungarian Algorithm (Kuhn–Munkres)', cat,
  desc: '求 n×n 指派問題的最小總成本。維護對偶勢能 u[i]、v[j]，使約化成本 c[i][j] − u[i] − v[j] ≥ 0；只在約化成本為 0 的邊上做增廣，找不到時以最小 δ 調整勢能產生新的 0。',
  time: 'O(n³)', space: 'O(n²)',
  code: ['for i = 1 .. n:  （逐列加入）', '  從第 i 列出發找交錯路徑', '  每次在未使用的欄中找最小約化成本 δ', '  以 δ 調整勢能：已使用列 u += δ，已使用欄 v -= δ', '  走到約化成本為 0 的欄 j', '  若 j 未被指派：沿路徑翻轉，第 i 列完成', '總成本 = Σ c[i][p[i]]'],
  inputs: [{ key: 'm', label: '成本矩陣（每行一列）', type: 'text', multiline: true, default: '9 2 7 8\n6 4 3 7\n5 8 1 8\n7 6 9 4', random: () => { const n = rnd.int(3, 5); return Array.from({ length: n }, () => rnd.arr(n, 1, 15).join(' ')).join('\n'); } }],
  run({ m }) {
    const r = new Rec();
    const C = String(m).trim().split('\n').map((l) => l.trim().split(/\s+/).map(Number));
    const n = C.length;
    const INF = 1e18;
    const u = new Array(n + 1).fill(0), v = new Array(n + 1).fill(0), p = new Array(n + 1).fill(0), way = new Array(n + 1).fill(0);
    const red = () => C.map((row, i) => row.map((c, j) => c - u[i + 1] - v[j + 1]));
    const P = (hl: Record<string, Color> = {}, title = '約化成本 c[i][j] − u[i] − v[j]') => {
      const col: Record<string, Color> = {};
      const R = red();
      R.forEach((row, i) => row.forEach((x, j) => { if (Math.abs(x) < 1e-9) col[`${i},${j}`] = 'frontier'; }));
      for (let j = 1; j <= n; j++) if (p[j]) col[`${p[j] - 1},${j - 1}`] = 'done';
      return [table(R, { ...col, ...hl }, { rowHeaders: C.map((_, i) => `r${i} (u=${u[i + 1]})`), colHeaders: C.map((_, j) => `c${j} (v=${v[j + 1]})`), title })];
    };
    r.snap('原始成本矩陣（勢能皆為 0）；青色 = 約化成本為 0，綠色 = 目前指派', P({}, '成本矩陣'), 1);
    for (let i = 1; i <= n; i++) {
      p[0] = i;
      let j0 = 0;
      const minv = new Array(n + 1).fill(INF), used = new Array(n + 1).fill(false);
      r.snap(`加入第 ${i - 1} 列`, P(Object.fromEntries(C.map((_, j) => [`${i - 1},${j}`, 'active' as Color]))), 1);
      do {
        used[j0] = true;
        const i0 = p[j0];
        let delta = INF, j1 = 0;
        for (let j = 1; j <= n; j++) if (!used[j]) {
          const cur = C[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
          if (minv[j] < delta) { delta = minv[j]; j1 = j; }
        }
        for (let j = 0; j <= n; j++) {
          if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta;
        }
        r.snap(`δ = ${delta}：調整勢能，欄 ${j1 - 1} 出現約化成本 0`, P({ [`${i0 - 1},${j1 - 1}`]: 'compare' }), 4);
        j0 = j1;
      } while (p[j0] !== 0);
      do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
      r.snap(`欄位未被指派，沿交錯路徑翻轉；第 ${i - 1} 列完成`, P(), 6);
    }
    let total = 0;
    const assign: string[] = [];
    const hl: Record<string, Color> = {};
    for (let j = 1; j <= n; j++) { total += C[p[j] - 1][j - 1]; hl[`${p[j] - 1},${j - 1}`] = 'path'; }
    for (let i = 0; i < n; i++) for (let j = 1; j <= n; j++) if (p[j] === i + 1) assign.push(`列 ${i} → 欄 ${j - 1}（成本 ${C[i][j - 1]}）`);
    r.snap(`最小總成本 = ${total}`, [table(C, hl, { rowHeaders: C.map((_, i) => 'r' + i), colHeaders: C.map((_, j) => 'c' + j), title: '原始成本與最佳指派' }), text(assign, '指派結果')], 7);
    return r.frames;
  },
};

const gale: AlgoDef = {
  id: 'gale-shapley', name: '穩定匹配（蓋爾–沙普利）', en: 'Gale–Shapley Stable Matching', cat,
  desc: '求婚方依偏好由高到低提出；被求婚方若單身就暫時接受，若已有對象則保留較喜歡的一位、拒絕另一位。最終匹配必定穩定（沒有兩人彼此都更喜歡對方）。',
  time: 'O(n²)', space: 'O(n²)',
  code: ['所有人單身', 'while 有單身且還有對象可求婚的 m:', '  w = m 偏好清單中下一位', '  if w 單身: (m, w) 訂婚', '  elif w 更喜歡 m 勝過現任 m\':', '    (m, w) 訂婚；m\' 恢復單身', '  else: w 拒絕 m'],
  inputs: [{ key: 'pref', label: '偏好（每行 名字: 由高到低；先求婚方再被求婚方）', type: 'text', multiline: true, default: 'A: X Y Z W\nB: Y X W Z\nC: X Z Y W\nD: Z W X Y\nX: B A D C\nY: A C B D\nZ: C D A B\nW: D B C A', random: () => { const M = ['A', 'B', 'C', 'D'], W = ['X', 'Y', 'Z', 'W']; return [...M.map((m) => `${m}: ${rnd.shuffle(W).join(' ')}`), ...W.map((w) => `${w}: ${rnd.shuffle(M).join(' ')}`)].join('\n'); } }],
  run({ pref }) {
    const r = new Rec();
    const rows = String(pref).trim().split('\n').map((l) => l.split(':')).filter((x) => x.length === 2).map(([k, v]) => [k.trim(), v.trim().split(/\s+/)] as [string, string[]]);
    const half = rows.length / 2;
    const men = rows.slice(0, half), women = rows.slice(half);
    const pm: Record<string, string[]> = Object.fromEntries(men), pw: Record<string, string[]> = Object.fromEntries(women);
    const M = men.map((x) => x[0]), W = women.map((x) => x[0]);
    const g = parseGraph([...M.map((m) => m), ...W.map((w) => w)].join('\n'), false);
    M.forEach((m, i) => (g.pos[m] = { x: 0, y: i * 60 }));
    W.forEach((w, i) => (g.pos[w] = { x: 240, y: i * 60 }));
    const fiance: Record<string, string> = {};
    const next: Record<string, number> = Object.fromEntries(M.map((m) => [m, 0]));
    const P = (prop?: [string, string, Color]) => {
      const gp: GraphPanel = gpanel(g, { node: Object.fromEntries([...Object.keys(fiance), ...Object.values(fiance)].map((x) => [x, 'done' as Color])) });
      const extra: GEdge[] = Object.entries(fiance).map(([w, m]) => ({ from: m, to: w, color: 'done' as Color, width: 3 }));
      if (prop) extra.push({ from: prop[0], to: prop[1], color: prop[2], directed: true, dashed: true });
      gp.edges = extra;
      gp.title = '綠線：目前訂婚';
      const tm = table(men.map(([m, l]) => l), Object.fromEntries(men.flatMap(([m, l], i) => l.map((w, j) => [`${i},${j}`, j < next[m] ? (fiance[w] === m ? 'done' : 'muted') : undefined])).filter((x) => x[1])) as Record<string, Color>, { rowHeaders: M, colHeaders: l1(men), title: '求婚方偏好（灰：已求婚過）', w: 'half' });
      return [gp, tm];
    };
    r.snap('所有人單身', P(), 1);
    let guard = 0;
    for (;;) {
      const m = M.find((x) => !Object.values(fiance).includes(x) && next[x] < pm[x].length);
      if (!m || guard++ > 200) break;
      const w = pm[m][next[m]++];
      const cur = fiance[w];
      if (!cur) { fiance[w] = m; r.snap(`${m} 向 ${w} 求婚，${w} 單身 → 接受`, P([m, w, 'good']), 4); }
      else if (pw[w].indexOf(m) < pw[w].indexOf(cur)) { fiance[w] = m; r.snap(`${m} 向 ${w} 求婚，${w} 比較喜歡 ${m}（勝過 ${cur}）→ 換人，${cur} 恢復單身`, P([m, w, 'good']), 6); }
      else r.snap(`${m} 向 ${w} 求婚，${w} 比較喜歡現任 ${cur} → 拒絕`, P([m, w, 'bad']), 7);
    }
    r.snap(`穩定匹配：${Object.entries(fiance).map(([w, m]) => `${m}–${w}`).join('，')}`, P());
    return r.frames;
  },
};
const l1 = (men: [string, string[]][]) => men[0]?.[1].map((_, i) => `第${i + 1}`) ?? [];

export default [fordFulkerson, edmondsKarp, dinic, pushRelabel, mcmf, kuhn, hopcroft, hungarian, gale];
