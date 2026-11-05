const EDGES = 'AB BC CA BD DE EF FD GF GH HI IG IJ'.split(' '); // 有向圖
const nodes = [...new Set(EDGES.join(''))].sort();
const adj = Object.fromEntries(nodes.map((v) => [v, []]));
for (const [a, b] of EDGES) adj[a].push(b);

const index = {}, low = {}, onStack = new Set(), stack = [];
let counter = 0;
// low[u] = u 經由子樹與至多一條回邊能到達的最小編號；low == 編號時，u 是一個強連通分量的根
function dfs(u) {
  index[u] = low[u] = counter++;
  stack.push(u);
  onStack.add(u);
  for (const v of adj[u]) {
    if (!(v in index)) { dfs(v); low[u] = Math.min(low[u], low[v]); }
    else if (onStack.has(v)) low[u] = Math.min(low[u], index[v]);
  }
  if (low[u] === index[u]) {
    const comp = [];
    let v;
    do { v = stack.pop(); onStack.delete(v); comp.push(v); } while (v !== u);
    console.log('SCC:', comp.sort().join(' '));
  }
}

for (const v of nodes) if (!(v in index)) dfs(v);
