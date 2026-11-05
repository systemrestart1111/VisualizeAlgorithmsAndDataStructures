const EDGES = [['A', 'B', 3], ['A', 'C', 8], ['A', 'E', -4], ['B', 'D', 1], ['B', 'E', 7], ['C', 'B', 4], ['D', 'A', 2], ['D', 'C', -5], ['E', 'D', 6]];
const nodes = 'ABCDE', n = nodes.length;
const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));
for (const [a, b, w] of EDGES) d[nodes.indexOf(a)][nodes.indexOf(b)] = w;

// 依序允許經過中繼點 k：d[i][j] = min(d[i][j], d[i][k] + d[k][j])
for (let k = 0; k < n; k++)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];

console.log('   ' + [...nodes].map((v) => v.padStart(4)).join(''));
for (let i = 0; i < n; i++) console.log(nodes[i].padStart(3) + d[i].map((x) => (x === Infinity ? 'inf' : String(x)).padStart(4)).join(''));
