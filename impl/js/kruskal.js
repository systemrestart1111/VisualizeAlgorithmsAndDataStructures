const EDGES = [['A', 'B', 7], ['A', 'D', 5], ['B', 'C', 8], ['B', 'D', 9], ['B', 'E', 7], ['C', 'E', 5],
               ['D', 'E', 15], ['D', 'F', 6], ['E', 'F', 8], ['E', 'G', 9], ['F', 'G', 11]];
const parent = {};
function find(x) {
  parent[x] ??= x;
  while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
  return x;
}

// 邊依權重由小到大檢查；兩端不在同一棵樹（並查集）才加入，避免形成環
let total = 0;
for (const [a, b, w] of [...EDGES].sort((x, y) => x[2] - y[2])) { // sort 是穩定排序，同權重保持輸入順序
  const ra = find(a), rb = find(b);
  if (ra === rb) continue;
  parent[ra] = rb;
  total += w;
  console.log(`take ${a}-${b} (${w})`);
}
console.log('total weight =', total);
