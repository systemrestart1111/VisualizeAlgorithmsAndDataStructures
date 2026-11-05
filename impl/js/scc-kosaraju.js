const EDGES = 'AB BC CA BD DE EF FD GF GH HI IG IJ'.split(' ');
const nodes = [...new Set(EDGES.join(''))].sort();
const adj = Object.fromEntries(nodes.map((v) => [v, []]));
const radj = Object.fromEntries(nodes.map((v) => [v, []]));
for (const [a, b] of EDGES) { adj[a].push(b); radj[b].push(a); } // radj 為反向圖

const order = [], seen = new Set();
function dfs1(u) { // 第一次 DFS：記錄完成順序
  seen.add(u);
  for (const v of adj[u]) if (!seen.has(v)) dfs1(v);
  order.push(u);
}
function dfs2(u, comp) { // 第二次 DFS：在反向圖上，依完成時間由晚到早出發
  seen.add(u);
  comp.push(u);
  for (const v of radj[u]) if (!seen.has(v)) dfs2(v, comp);
}

for (const v of nodes) if (!seen.has(v)) dfs1(v);
seen.clear();
for (const u of [...order].reverse()) {
  if (seen.has(u)) continue;
  const comp = [];
  dfs2(u, comp);
  console.log('SCC:', comp.sort().join(' '));
}
