const EDGES = [['A', 'B', -2], ['A', 'C', 4], ['B', 'C', 3], ['B', 'D', 2], ['B', 'E', 6], ['C', 'E', -1], ['D', 'A', 1], ['D', 'E', 5], ['E', 'D', 2]];
const nodes = 'ABCDE', n = nodes.length;
const E = EDGES.map(([a, b, w]) => [nodes.indexOf(a), nodes.indexOf(b), w]);

// 1. 加一個虛擬點 q 連到所有點（權重 0），用 Bellman-Ford 求位能 h
const h = new Array(n).fill(0);
for (let it = 0; it < n; it++) for (const [a, b, w] of E) h[b] = Math.min(h[b], h[a] + w);
if (E.some(([a, b, w]) => h[a] + w < h[b])) { // 再鬆弛一輪仍能變短：有負環
  console.log('negative cycle detected');
  process.exit(0);
}
console.log('h:', h.join(' '));

// 2. 重新加權 w'(u,v) = w + h[u] - h[v] >= 0，之後每個點各跑一次 Dijkstra
const w2 = Array.from({ length: n }, () => new Array(n).fill(Infinity));
for (const [a, b, w] of E) w2[a][b] = w + h[a] - h[b];
function dijkstra(s) {
  const dist = new Array(n).fill(Infinity), done = new Array(n).fill(false);
  dist[s] = 0;
  for (;;) {
    let u = -1;
    for (let v = 0; v < n; v++) if (!done[v] && dist[v] < Infinity && (u < 0 || dist[v] < dist[u])) u = v;
    if (u < 0) break;
    done[u] = true;
    for (let v = 0; v < n; v++) if (dist[u] + w2[u][v] < dist[v]) dist[v] = dist[u] + w2[u][v];
  }
  return dist;
}

// 3. 還原真實距離 d(u,v) = d'(u,v) - h[u] + h[v]
console.log('   ' + [...nodes].map((v) => v.padStart(4)).join(''));
for (let s = 0; s < n; s++) {
  const d = dijkstra(s);
  console.log(nodes[s].padStart(3) + d.map((x, t) => (x === Infinity ? 'inf' : String(x - h[s] + h[t])).padStart(4)).join(''));
}
