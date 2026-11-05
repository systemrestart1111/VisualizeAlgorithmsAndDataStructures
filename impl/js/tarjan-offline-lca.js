const EDGES = [[1, 2], [1, 3], [2, 4], [2, 5], [3, 6], [3, 7], [5, 8], [5, 9], [7, 10]];
const QUERIES = [[8, 9], [4, 8], [6, 10], [9, 6], [3, 3]];
const children = {}, parent = {};
for (const [p, c] of EDGES) { (children[p] ??= []).push(c); parent[p] = p; parent[c] = c; }
const ancestor = {}, visited = new Set(), ans = {};
const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };

// 子樹 v 完成後併入 u 的集合；u 結束時回答所有另一端已拜訪的查詢
function dfs(u) {
  ancestor[u] = u;
  for (const v of children[u] ?? []) {
    dfs(v);
    parent[find(v)] = find(u);
    ancestor[find(u)] = u;
  }
  visited.add(u);
  QUERIES.forEach(([a, b], i) => {
    const w = a === u ? b : b === u ? a : null;
    if (w !== null && visited.has(w) && !(i in ans)) ans[i] = ancestor[find(w)];
  });
}

dfs(1);
QUERIES.forEach(([a, b], i) => console.log(`lca(${a}, ${b}) = ${ans[i]}`));
