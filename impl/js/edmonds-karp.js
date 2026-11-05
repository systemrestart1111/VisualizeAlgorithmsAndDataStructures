const NAMES = 'SACBDT', n = NAMES.length;
const EDGES = [['S', 'A', 10], ['S', 'C', 10], ['A', 'B', 4], ['A', 'C', 2], ['A', 'D', 8], ['C', 'D', 9], ['D', 'B', 6], ['B', 'T', 10], ['D', 'T', 10]];
const cap = Array.from({ length: n }, () => new Array(n).fill(0));
for (const [a, b, c] of EDGES) cap[NAMES.indexOf(a)][NAMES.indexOf(b)] += c;
const S = NAMES.indexOf('S'), T = NAMES.indexOf('T');

// 用 BFS 找「邊數最少」的增廣路徑，保證總共只需 O(VE) 次增廣
function bfs() {
  const parent = new Array(n).fill(-1);
  parent[S] = S;
  const q = [S];
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    for (let v = 0; v < n; v++) if (parent[v] < 0 && cap[u][v] > 0) { parent[v] = u; q.push(v); }
  }
  return parent[T] >= 0 ? parent : null;
}

let flow = 0;
for (let parent = bfs(); parent; parent = bfs()) {
  const path = [T];
  for (let v = T; v !== S; ) { v = parent[v]; path.unshift(v); }
  let b = Infinity;
  for (let i = 0; i + 1 < path.length; i++) b = Math.min(b, cap[path[i]][path[i + 1]]);
  for (let i = 0; i + 1 < path.length; i++) { cap[path[i]][path[i + 1]] -= b; cap[path[i + 1]][path[i]] += b; }
  flow += b;
  console.log(path.map((x) => NAMES[x]).join(' -> '), `(+${b})`);
}
console.log('max flow =', flow);
const reach = new Set([S]), stack = [S];
while (stack.length) {
  const u = stack.pop();
  for (let v = 0; v < n; v++) if (cap[u][v] > 0 && !reach.has(v)) { reach.add(v); stack.push(v); }
}
console.log('min cut S-side:', [...reach].sort((a, b) => a - b).map((v) => NAMES[v]).join(' '));
