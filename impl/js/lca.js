const EDGES = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [5, 8], [5, 9], [6, 10], [9, 11], [7, 12]];
const N = 13, LOG = 4;
const adj = Array.from({ length: N }, () => []);
for (const [a, b] of EDGES) { adj[a].push(b); adj[b].push(a); }

// up[k][v] = v 往上第 2^k 個祖先（倍增法）
const up = Array.from({ length: LOG }, () => new Array(N).fill(0));
const depth = new Array(N).fill(0);
(function dfs(u, p) {
  for (const v of adj[u]) if (v !== p) { up[0][v] = u; depth[v] = depth[u] + 1; dfs(v, u); }
})(1, 0);
up[0][1] = 1;
for (let k = 1; k < LOG; k++) for (let v = 1; v < N; v++) up[k][v] = up[k - 1][up[k - 1][v]];

// 先把較深的點往上跳到同一深度，再兩點同時從大步到小步往上跳
function lca(a, b) {
  if (depth[a] < depth[b]) [a, b] = [b, a];
  const diff = depth[a] - depth[b];
  for (let k = 0; k < LOG; k++) if ((diff >> k) & 1) a = up[k][a];
  if (a === b) return a;
  for (let k = LOG - 1; k >= 0; k--) if (up[k][a] !== up[k][b]) { a = up[k][a]; b = up[k][b]; }
  return up[0][a];
}

for (const [a, b] of [[8, 11], [10, 12], [4, 11]]) console.log(`LCA(${a}, ${b}) = ${lca(a, b)}`);
