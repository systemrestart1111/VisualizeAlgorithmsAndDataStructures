const EDGES = [['A', 'B', 0], ['A', 'C', 1], ['B', 'D', 1], ['B', 'C', 0], ['C', 'E', 1], ['D', 'E', 0], ['D', 'F', 1], ['E', 'G', 0], ['F', 'G', 1], ['E', 'F', 1]];
const adj = {};
for (const [a, b, w] of EDGES) { // 無向圖，邊權只有 0 或 1
  (adj[a] ??= []).push([b, w]);
  (adj[b] ??= []).push([a, w]);
}

// 雙端佇列：權重 0 的鄰居放前面、權重 1 的放後面，佇列始終依距離排序，效果等同 Dijkstra 但只需 O(V+E)
const dist = Object.fromEntries(Object.keys(adj).map((v) => [v, Infinity]));
dist.A = 0;
const dq = ['A'];
while (dq.length) {
  const u = dq.shift();
  for (const [v, w] of adj[u])
    if (dist[u] + w < dist[v]) {
      dist[v] = dist[u] + w;
      if (w === 0) dq.unshift(v);
      else dq.push(v);
    }
}
console.log('dist:', Object.keys(dist).sort().map((v) => `${v}=${dist[v]}`).join(' '));
