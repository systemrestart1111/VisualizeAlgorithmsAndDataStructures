const EDGES = [['A', 'B', 5], ['A', 'C', 3], ['B', 'C', 2], ['B', 'D', 6], ['C', 'D', 7], ['C', 'E', 4], ['C', 'F', 2], ['D', 'E', -1], ['D', 'F', 1], ['E', 'F', -2]];
const nodes = [...new Set(EDGES.flatMap((e) => e.slice(0, 2)))].sort();
const adj = Object.fromEntries(nodes.map((v) => [v, []]));
const indeg = Object.fromEntries(nodes.map((v) => [v, 0]));
for (const [a, b, w] of EDGES) { adj[a].push([b, w]); indeg[b]++; }

// 先求拓撲順序；依此順序鬆弛，處理到某點時它的所有前驅都已確定，因此負權也沒問題
const topo = nodes.filter((v) => indeg[v] === 0);
for (let h = 0; h < topo.length; h++) for (const [v] of adj[topo[h]]) if (--indeg[v] === 0) topo.push(v);

const dist = Object.fromEntries(nodes.map((v) => [v, Infinity]));
dist.A = 0;
for (const u of topo) if (dist[u] < Infinity) for (const [v, w] of adj[u]) dist[v] = Math.min(dist[v], dist[u] + w);
console.log('topological order:', topo.join(' '));
console.log('dist:', nodes.map((v) => `${v}=${dist[v]}`).join(' '));
