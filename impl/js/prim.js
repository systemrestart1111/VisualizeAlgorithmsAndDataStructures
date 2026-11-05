const EDGES = [['A', 'B', 7], ['A', 'D', 5], ['B', 'C', 8], ['B', 'D', 9], ['B', 'E', 7], ['C', 'E', 5],
               ['D', 'E', 15], ['D', 'F', 6], ['E', 'F', 8], ['E', 'G', 9], ['F', 'G', 11]];
const nodes = [...new Set(EDGES.flatMap((e) => e.slice(0, 2)))].sort();
const w = {};
for (const [a, b, c] of EDGES) { w[a + b] = c; w[b + a] = c; }

// key[v] = 把 v 接到目前這棵樹的最便宜邊；每次加入 key 最小的點，再更新鄰居的 key
const key = Object.fromEntries(nodes.map((v) => [v, Infinity])), parent = {}, inTree = new Set();
key.A = 0;
let total = 0;
for (let it = 0; it < nodes.length; it++) {
  let u = null;
  for (const v of nodes) if (!inTree.has(v) && (u === null || key[v] < key[u])) u = v;
  inTree.add(u);
  if (parent[u]) {
    total += key[u];
    console.log(`take ${parent[u]}-${u} (${key[u]})`);
  }
  for (const v of nodes) if (!inTree.has(v) && w[u + v] !== undefined && w[u + v] < key[v]) { key[v] = w[u + v]; parent[v] = u; }
}
console.log('total weight =', total);
