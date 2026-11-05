const EDGES = 'AC BC BD CE DF EF EG FH GH'.split(' ');
const nodes = [...new Set(EDGES.join(''))].sort();
const adj = Object.fromEntries(nodes.map((v) => [v, []]));
for (const [a, b] of EDGES) adj[a].push(b);

const post = [], seen = new Set();
// 一個點在它所有後繼都處理完後才加入 post；post 反過來就是拓撲順序
function dfs(u) {
  seen.add(u);
  for (const v of adj[u]) if (!seen.has(v)) dfs(v);
  post.push(u);
}

for (const v of nodes) if (!seen.has(v)) dfs(v);
console.log('post-order:', post.join(' '));
console.log('topological:', [...post].reverse().join(' '));
