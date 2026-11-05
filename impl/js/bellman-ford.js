const EDGES = [['A', 'B', 6], ['A', 'C', 7], ['B', 'D', 5], ['B', 'C', 8], ['B', 'E', -4], ['C', 'D', -3], ['C', 'E', 9], ['D', 'B', -2], ['E', 'D', 7], ['E', 'A', 2]]; // 有向圖，可含負權
const nodes = [...new Set(EDGES.flatMap((e) => e.slice(0, 2)))].sort();

// 對所有邊做 V-1 輪鬆弛；第 V 輪若還能變短，代表有負環
function bellmanFord(src) {
  const dist = Object.fromEntries(nodes.map((v) => [v, Infinity]));
  dist[src] = 0;
  for (let it = 0; it < nodes.length - 1; it++) {
    let changed = false;
    for (const [a, b, w] of EDGES) if (dist[a] + w < dist[b]) { dist[b] = dist[a] + w; changed = true; }
    if (!changed) break;
  }
  return [dist, EDGES.some(([a, b, w]) => dist[a] + w < dist[b])];
}

const [dist, neg] = bellmanFord('A');
console.log('dist:', nodes.map((v) => `${v}=${dist[v]}`).join(' '));
console.log('negative cycle:', neg ? 'True' : 'False');
