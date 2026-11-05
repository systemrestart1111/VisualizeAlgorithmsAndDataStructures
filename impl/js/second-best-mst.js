const EDGES = [['A', 'B', 4], ['A', 'C', 3], ['B', 'C', 1], ['B', 'D', 2], ['C', 'D', 4], ['C', 'E', 5], ['D', 'E', 6], ['D', 'F', 7], ['E', 'F', 3]];

function kruskal() {
  const p = {};
  for (const [u, v] of EDGES) { p[u] = u; p[v] = v; }
  const find = (x) => { while (p[x] !== x) { p[x] = p[p[x]]; x = p[x]; } return x; };
  const tree = [];
  for (const i of EDGES.map((_, i) => i).sort((a, b) => EDGES[a][2] - EDGES[b][2] || a - b)) {
    const a = find(EDGES[i][0]), b = find(EDGES[i][1]);
    if (a !== b) { p[a] = b; tree.push(i); }
  }
  return tree;
}
// 樹上 a 到 b 的路徑（回傳邊的編號）
function pathEdges(tree, a, b) {
  const prev = { [a]: null }, q = [a];
  for (let h = 0; h < q.length; h++) for (const i of tree) {
    const [u, v] = EDGES[i], x = q[h], y = u === x ? v : v === x ? u : null;
    if (y && !(y in prev)) { prev[y] = [x, i]; q.push(y); }
  }
  const out = [];
  for (let x = b; x !== a; x = prev[x][0]) out.push(prev[x][1]);
  return out;
}

const tree = kruskal();
const W = tree.reduce((s, i) => s + EDGES[i][2], 0);
console.log('MST weight:', W, 'edges:', tree.map((i) => EDGES[i][0] + EDGES[i][1]).join(' '));
for (const strict of [false, true]) {
  let best = null;
  EDGES.forEach(([u, v, w], i) => {
    if (tree.includes(i)) return;
    const cand = pathEdges(tree, u, v).filter((j) => !strict || EDGES[j][2] < w);
    if (cand.length) { const m = Math.max(...cand.map((j) => EDGES[j][2])); best = best === null ? W - m + w : Math.min(best, W - m + w); }
  });
  console.log(strict ? 'strict' : 'allow equal', 'second best:', best);
}
