const EDGES = [['C', 'D', 3], ['C', 'E', 2], ['D', 'F', 4], ['E', 'D', 1], ['E', 'F', 2], ['E', 'G', 3], ['F', 'G', 2], ['F', 'H', 1], ['G', 'H', 2]];
const NODES = [...new Set(EDGES.flatMap((e) => e.slice(0, 2)))].sort();
const ADJ = Object.fromEntries(NODES.map((v) => [v, EDGES.map((e, i) => [e[1], e[2], i]).filter((_, i) => EDGES[i][0] === v).sort((a, b) => (a[0] < b[0] ? -1 : 1))]));

// 同距離時取名稱較小的點；只有嚴格更短才更新前驅
function dijkstra(s, t, banE, banN) {
  const dist = { [s]: 0 }, prev = {}, done = new Set();
  for (;;) {
    let u = null;
    for (const v of NODES) if (!done.has(v) && v in dist && !banN.has(v) && (u === null || dist[v] < dist[u])) u = v;
    if (u === null) return null;
    if (u === t) break;
    done.add(u);
    for (const [v, w, i] of ADJ[u]) if (!banE.has(i) && !banN.has(v) && (!(v in dist) || dist[u] + w < dist[v])) { dist[v] = dist[u] + w; prev[v] = i; }
  }
  const nodes = [t], edges = [];
  while (nodes[0] !== s) { const i = prev[nodes[0]]; edges.unshift(i); nodes.unshift(EDGES[i][0]); }
  return { nodes, edges, cost: dist[t] };
}

function yen(s, t, K) {
  const first = dijkstra(s, t, new Set(), new Set());
  if (!first) return [];
  const A = [first], B = [];
  for (let k = 1; k < K; k++) {
    const last = A.at(-1);
    for (let i = 0; i < last.nodes.length - 1; i++) {
      const rootN = last.nodes.slice(0, i + 1), rootE = last.edges.slice(0, i);
      const banE = new Set(A.filter((p) => p.nodes.slice(0, i + 1).join() === rootN.join()).map((p) => p.edges[i]));
      const spur = dijkstra(last.nodes[i], t, banE, new Set(rootN.slice(0, -1)));
      if (!spur) continue;
      const cand = { nodes: [...rootN, ...spur.nodes.slice(1)], edges: [...rootE, ...spur.edges], cost: rootE.reduce((x, e) => x + EDGES[e][2], 0) + spur.cost };
      if (![...A, ...B].some((p) => p.nodes.join() === cand.nodes.join())) B.push(cand);
    }
    if (!B.length) break;
    B.sort((x, y) => x.cost - y.cost || x.nodes.length - y.nodes.length || (x.nodes.join() < y.nodes.join() ? -1 : 1));
    A.push(B.shift());
  }
  return A;
}

yen('C', 'H', 4).forEach((p, k) => console.log(`${k + 1}: ${p.nodes.join(' -> ')} cost ${p.cost}`));
