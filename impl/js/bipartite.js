const adj = {};
for (const [a, b] of 'AB AD BC CD CF EF EB GH DG'.split(' ')) {
  (adj[a] ??= []).push(b);
  (adj[b] ??= []).push(a);
}

// BFS 二著色：相鄰點必須不同色；若遇到同色的鄰居就不是二分圖
function bipartite() {
  const color = {};
  for (const s of Object.keys(adj).sort()) {
    if (s in color) continue;
    color[s] = 0;
    const q = [s];
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      for (const v of adj[u]) {
        if (!(v in color)) { color[v] = 1 - color[u]; q.push(v); }
        else if (color[v] === color[u]) return null;
      }
    }
  }
  return color;
}

const c = bipartite();
if (!c) console.log('not bipartite');
else for (const k of [0, 1]) console.log(`set ${k}:`, Object.keys(c).filter((v) => c[v] === k).sort().join(' '));
