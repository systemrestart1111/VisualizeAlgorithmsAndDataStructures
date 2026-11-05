const NAMES = 'SABCT', n = NAMES.length;
const EDGES = [['S', 'A', 4, 1], ['S', 'B', 2, 2], ['A', 'B', 2, 1], ['A', 'C', 2, 3], ['B', 'C', 5, 1], ['A', 'T', 1, 6], ['C', 'T', 4, 2], ['B', 'T', 1, 5]]; // (起點, 終點, 容量, 單位費用)
const cap = Array.from({ length: n }, () => new Array(n).fill(0));
const cost = Array.from({ length: n }, () => new Array(n).fill(0));
for (const [a, b, c, w] of EDGES) {
  const u = NAMES.indexOf(a), v = NAMES.indexOf(b);
  cap[u][v] = c; cost[u][v] = w; cost[v][u] = -w; // 反向邊費用為負，退流時可以把費用扣回來
}
const S = NAMES.indexOf('S'), T = NAMES.indexOf('T');

// 在殘餘網路上找費用最小的 S→T 路徑（有負費用的反向邊，所以用 SPFA / Bellman-Ford）
function spfa() {
  const dist = new Array(n).fill(Infinity), parent = new Array(n).fill(-1), inq = new Array(n).fill(false);
  dist[S] = 0;
  const q = [S];
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    inq[u] = false;
    for (let v = 0; v < n; v++)
      if (cap[u][v] > 0 && dist[u] + cost[u][v] < dist[v]) {
        dist[v] = dist[u] + cost[u][v];
        parent[v] = u;
        if (!inq[v]) { inq[v] = true; q.push(v); }
      }
  }
  return [dist, parent];
}

let flow = 0, total = 0;
for (;;) {
  const [dist, parent] = spfa();
  if (dist[T] === Infinity) break;
  const path = [T];
  for (let v = T; v !== S; ) { v = parent[v]; path.unshift(v); }
  let b = Infinity;
  for (let i = 0; i + 1 < path.length; i++) b = Math.min(b, cap[path[i]][path[i + 1]]);
  for (let i = 0; i + 1 < path.length; i++) { cap[path[i]][path[i + 1]] -= b; cap[path[i + 1]][path[i]] += b; }
  flow += b;
  total += b * dist[T];
  console.log(path.map((x) => NAMES[x]).join(' -> '), `flow ${b} x cost ${dist[T]}`);
}
console.log('max flow =', flow, 'min cost =', total);
