const adj = {};
for (const [a, b] of 'AB BC CD DB AE EF'.split(' ')) { // 有向圖
  (adj[a] ??= []).push(b);
  adj[b] ??= [];
}
const color = {}, parent = {};

// 三色 DFS：遇到灰色（仍在遞迴堆疊上）的點就是一條回邊，代表有環
function dfs(u) {
  color[u] = 1;
  for (const v of adj[u]) {
    if (color[v] === 1) {
      const path = [];
      for (let x = u; x !== v; x = parent[x]) path.unshift(x);
      return [v, ...path, v];
    }
    if (!color[v]) {
      parent[v] = u;
      const found = dfs(v);
      if (found) return found;
    }
  }
  color[u] = 2;
  return null;
}

let cyc = null;
for (const s of Object.keys(adj).sort()) if (!color[s] && (cyc = dfs(s))) break;
console.log(cyc ? 'cycle: ' + cyc.join(' -> ') : 'no cycle');
