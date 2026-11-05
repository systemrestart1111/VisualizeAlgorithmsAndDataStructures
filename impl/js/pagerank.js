const EDGES = 'AB AC BC CA DC EA ED FE BD DA'.split(' ');
const nodes = [...new Set(EDGES.join(''))].sort();
const out = Object.fromEntries(nodes.map((v) => [v, EDGES.filter((e) => e[0] === v).map((e) => e[1])]));
const N = nodes.length, D = 0.85;

// PR(v) = (1-d)/N + d·Σ PR(u)/出度(u)（u 指向 v）；重複套用直到收斂（冪迭代）
let pr = Object.fromEntries(nodes.map((v) => [v, 1 / N]));
for (let it = 1; it <= 20; it++) {
  const nw = Object.fromEntries(nodes.map((v) => [v, (1 - D) / N]));
  for (const u of nodes) for (const v of out[u]) nw[v] += (D * pr[u]) / out[u].length;
  pr = nw;
  if ([1, 5, 20].includes(it)) console.log(`iteration ${String(it).padStart(2)}:`, nodes.map((v) => `${v}=${pr[v].toFixed(4)}`).join(' '));
}
console.log('ranking:', [...nodes].sort((a, b) => pr[b] - pr[a]).join(' > '));
console.log(`sum = ${Object.values(pr).reduce((s, x) => s + x, 0).toFixed(4)}`);
