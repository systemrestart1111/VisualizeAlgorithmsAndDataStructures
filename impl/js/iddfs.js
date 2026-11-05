const EDGES = ['AB', 'AC', 'BD', 'BE', 'CF', 'CG', 'DH', 'EI', 'FJ', 'GK', 'EF'];
const adj = {};
for (const [u, v] of EDGES) { (adj[u] ??= []).push(v); (adj[v] ??= []).push(u); }
for (const k in adj) adj[k].sort();

// 深度上限 0、1、2…逐一做深度受限 DFS；回傳 [路徑, 每輪拜訪數]
function iddfs(s, t) {
  const counts = [];
  for (let limit = 0; limit <= Object.keys(adj).length; limit++) {
    let visits = 0;
    const path = [];
    const dls = (u, lim) => {
      visits++;
      path.push(u);
      if (u === t) return true;
      if (lim > 0) for (const v of adj[u]) if (!path.includes(v) && dls(v, lim - 1)) return true;
      path.pop();
      return false;
    };
    const found = dls(s, limit);
    counts.push(visits);
    if (found) return [path, counts];
  }
  return [null, counts];
}

for (const t of ['J', 'H', 'A']) {
  const [path, counts] = iddfs('A', t);
  console.log(`A -> ${t}: depth ${path.length - 1}, path ${path.join(' -> ')}, visits per limit [${counts.join(', ')}], total ${counts.reduce((a, b) => a + b, 0)}`);
}
