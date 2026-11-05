const EDGES = [['A', 'B', 4], ['A', 'C', 2], ['B', 'C', 5], ['B', 'D', 10], ['C', 'E', 3], ['E', 'D', 4], ['D', 'F', 11], ['E', 'F', 8], ['C', 'F', 12], ['B', 'E', 6]];
const adj = {};
for (const [a, b, w] of EDGES) { // 無向圖
  (adj[a] ??= []).push([b, w]);
  (adj[b] ??= []).push([a, w]);
}

// 每次取出目前距離最小且尚未確定的點，確定它的距離並鬆弛所有出邊（邊權須非負）
// （JS 沒有內建優先佇列，這裡每次線性掃描找最小值）
function dijkstra(src) {
  const dist = Object.fromEntries(Object.keys(adj).map((v) => [v, Infinity])), parent = { [src]: null }, done = new Set();
  dist[src] = 0;
  for (;;) {
    let u = null;
    for (const v in dist) if (!done.has(v) && dist[v] < Infinity && (u === null || dist[v] < dist[u])) u = v;
    if (u === null) break;
    done.add(u);
    for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; parent[v] = u; }
  }
  return [dist, parent];
}

const [dist, parent] = dijkstra('A');
for (const v of Object.keys(adj).sort()) {
  const path = [];
  for (let x = v; x; x = parent[x]) path.unshift(x);
  console.log(`${v}: ${String(dist[v]).padStart(2)}  path ${path.join(' -> ')}`);
}
