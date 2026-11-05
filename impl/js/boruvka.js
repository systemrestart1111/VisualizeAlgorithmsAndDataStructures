const EDGES = [['A', 'B', 7], ['A', 'D', 5], ['B', 'C', 8], ['B', 'D', 9], ['B', 'E', 7], ['C', 'E', 5],
               ['D', 'E', 15], ['D', 'F', 6], ['E', 'F', 8], ['E', 'G', 9], ['F', 'G', 11]];
const nodes = [...new Set(EDGES.flatMap((e) => e.slice(0, 2)))].sort();
const parent = Object.fromEntries(nodes.map((v) => [v, v]));
function find(x) {
  while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
  return x;
}

// 每一輪：每個連通塊各自找一條最便宜的對外邊（同權重取編號小的），全部一起加入；塊數每輪至少減半
let total = 0, comps = nodes.length, rnd = 0;
while (comps > 1) {
  const cheapest = {};
  EDGES.forEach(([a, b, w], i) => {
    const ra = find(a), rb = find(b);
    if (ra === rb) return;
    for (const r of [ra, rb]) {
      const c = cheapest[r];
      if (c === undefined || w < EDGES[c][2] || (w === EDGES[c][2] && i < c)) cheapest[r] = i;
    }
  });
  const pick = new Set(Object.values(cheapest)), taken = [];
  EDGES.forEach(([a, b, w], i) => {
    if (!pick.has(i) || find(a) === find(b)) return;
    parent[find(a)] = find(b);
    total += w;
    comps--;
    taken.push(`${a}-${b}(${w})`);
  });
  console.log(`round ${++rnd}:`, taken.join(' '));
}
console.log('total weight =', total);
