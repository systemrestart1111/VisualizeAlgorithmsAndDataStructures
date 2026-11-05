const EDGES = 'AB AC BD BE CF EF DG EG FH GH'.split(' '); // 無向圖，每兩個字母是一條邊
const adj = {};
for (const [a, b] of EDGES) {
  (adj[a] ??= []).push(b);
  (adj[b] ??= []).push(a);
}

// 佇列先進先出：先處理完距離 d 的所有點，才輪到距離 d+1
function bfs(start) {
  const dist = { [start]: 0 }, q = [start];
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    for (const v of adj[u]) if (!(v in dist)) { dist[v] = dist[u] + 1; q.push(v); }
  }
  return [q, dist];
}

const [order, dist] = bfs('A');
console.log('order:', order.join(' '));
console.log('dist:', Object.keys(dist).sort().map((v) => `${v}=${dist[v]}`).join(' '));
