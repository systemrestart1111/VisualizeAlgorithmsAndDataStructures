const EDGES = 'AB BC CA CD DE EF FD FG GH BI'.split(' ');
const nodes = [...new Set(EDGES.join(''))].sort();
const adj = Object.fromEntries(nodes.map((v) => [v, []]));
for (const [a, b] of EDGES) { adj[a].push(b); adj[b].push(a); }

const tin = {}, low = {}, bridges = [], cut = new Set();
let timer = 0;
// low[v] > tin[u]：v 的子樹回不到 u 以上，(u, v) 是橋；low[v] >= tin[u]：u 是割點（根需有兩個以上子樹）
function dfs(u, parent) {
  tin[u] = low[u] = timer++;
  let children = 0;
  for (const v of adj[u]) {
    if (v === parent) continue;
    if (v in tin) low[u] = Math.min(low[u], tin[v]);
    else {
      dfs(v, u);
      low[u] = Math.min(low[u], low[v]);
      children++;
      if (low[v] > tin[u]) bridges.push([u, v].sort().join('-'));
      if (parent !== null && low[v] >= tin[u]) cut.add(u);
    }
  }
  if (parent === null && children > 1) cut.add(u);
}

dfs(nodes[0], null);
console.log('bridges:', bridges.sort().join(' '));
console.log('articulation points:', [...cut].sort().join(' '));
