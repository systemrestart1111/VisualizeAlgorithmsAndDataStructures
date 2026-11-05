const EDGES = 'AB AC AD BC BE CD CE DF EF CF'.split(' ');
const nodes = [...new Set(EDGES.join(''))].sort();
const adj = Object.fromEntries(nodes.map((v) => [v, new Set()]));
for (const [a, b] of EDGES) { adj[a].add(b); adj[b].add(a); }

// 依序替每個點試顏色 1..m，與已著色的鄰居衝突就換色；都不行就回溯到上一個點
function colorGraph(m) {
  const color = {};
  function bt(i) {
    if (i === nodes.length) return true;
    const v = nodes[i];
    for (let c = 1; c <= m; c++) {
      if ([...adj[v]].some((u) => color[u] === c)) continue;
      color[v] = c;
      if (bt(i + 1)) return true;
      delete color[v];
    }
    return false;
  }
  return bt(0) ? color : null;
}

for (const m of [3, 4]) {
  const res = colorGraph(m);
  console.log(`m = ${m}:`, res ? nodes.map((v) => `${v}=${res[v]}`).join(' ') : 'no solution');
}
