// 依拓撲順序放鬆最大距離（可有負權）；有環時回傳 null
function longestPath(nodes, edges, s) {
  const adj = Object.fromEntries(nodes.map((v) => [v, []]));
  const indeg = Object.fromEntries(nodes.map((v) => [v, 0]));
  for (const [u, v, w] of edges) { adj[u].push([v, w]); indeg[v]++; }
  for (const v in adj) adj[v].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const q = nodes.filter((v) => !indeg[v]), order = [];
  while (q.length) { const u = q.shift(); order.push(u); for (const [v] of adj[u]) if (--indeg[v] === 0) q.push(v); }
  if (order.length !== nodes.length) return null;
  const dist = Object.fromEntries(nodes.map((v) => [v, -Infinity])), par = {};
  dist[s] = 0;
  for (const u of order) {
    if (dist[u] === -Infinity) continue;
    for (const [v, w] of adj[u]) if (dist[u] + w > dist[v]) { dist[v] = dist[u] + w; par[v] = u; }
  }
  const end = nodes.reduce((b, v) => (dist[v] > dist[b] ? v : b), s);
  const path = [end];
  while (path[0] !== s) path.unshift(par[path[0]]);
  return [dist, path];
}

const nodes = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
const edges = [['S', 'A', 3], ['S', 'B', 2], ['A', 'C', 4], ['B', 'C', 1], ['B', 'D', 5], ['C', 'E', -2], ['D', 'E', 3], ['A', 'D', 1], ['E', 'F', 2]];
const [dist, path] = longestPath(nodes, edges, 'S');
console.log('dist:', nodes.map((v) => `${v}=${dist[v]}`).join(' '));
console.log('longest:', path.join(' -> '), 'length', dist[path.at(-1)]);
console.log('with cycle:', longestPath(['X', 'Y'], [['X', 'Y', 1], ['Y', 'X', 1]], 'X') === null ? 'None' : '?');
