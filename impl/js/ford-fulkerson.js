const NAMES = 'SACBDT', n = NAMES.length;
const EDGES = [['S', 'A', 10], ['S', 'C', 10], ['A', 'B', 4], ['A', 'C', 2], ['A', 'D', 8], ['C', 'D', 9], ['D', 'B', 6], ['B', 'T', 10], ['D', 'T', 10]];
const cap = Array.from({ length: n }, () => new Array(n).fill(0)); // 殘餘容量
for (const [a, b, c] of EDGES) cap[NAMES.indexOf(a)][NAMES.indexOf(b)] += c;
const S = NAMES.indexOf('S'), T = NAMES.indexOf('T');

// 在殘餘網路上用 DFS 找一條 S→T 的增廣路徑
function dfs(u, seen, path) {
  if (u === T) return true;
  seen[u] = true;
  for (let v = 0; v < n; v++)
    if (!seen[v] && cap[u][v] > 0) {
      path.push(v);
      if (dfs(v, seen, path)) return true;
      path.pop();
    }
  return false;
}

let flow = 0;
for (;;) {
  const path = [S];
  if (!dfs(S, new Array(n).fill(false), path)) break;
  let b = Infinity;
  for (let i = 0; i + 1 < path.length; i++) b = Math.min(b, cap[path[i]][path[i + 1]]); // 瓶頸
  for (let i = 0; i + 1 < path.length; i++) {
    cap[path[i]][path[i + 1]] -= b;
    cap[path[i + 1]][path[i]] += b; // 反向邊讓之後可以「退回」流量
  }
  flow += b;
  console.log(path.map((x) => NAMES[x]).join(' -> '), `(+${b})`);
}
console.log('max flow =', flow);
// 最後在殘餘網路上從 S 能到達的點就是最小割的 S 側
const reach = new Set([S]), stack = [S];
while (stack.length) {
  const u = stack.pop();
  for (let v = 0; v < n; v++) if (cap[u][v] > 0 && !reach.has(v)) { reach.add(v); stack.push(v); }
}
console.log('min cut S-side:', [...reach].sort((a, b) => a - b).map((v) => NAMES[v]).join(' '));
