// Warshall：依序讓每個頂點 k 當中繼站，R[i][j] |= R[i][k] && R[k][j]
function closure(nodes, edges, reflexive = false) {
  const n = nodes.length;
  const R = nodes.map((_, i) => nodes.map((_, j) => (reflexive && i === j ? 1 : 0)));
  for (const [u, v] of edges) R[nodes.indexOf(u)][nodes.indexOf(v)] = 1;
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) R[i][j] = R[i][j] || (R[i][k] && R[k][j]) ? 1 : 0;
  return R;
}

const nodes = ['A', 'B', 'C', 'D', 'E', 'F'];
const edges = [['A', 'B'], ['B', 'C'], ['C', 'A'], ['C', 'D'], ['E', 'D'], ['E', 'F']];
for (const refl of [false, true]) {
  const R = closure(nodes, edges, refl);
  console.log(refl ? 'reflexive' : 'non-reflexive');
  console.log('  ' + nodes.join(' '));
  R.forEach((row, i) => console.log(nodes[i], row.join(' ')));
}
