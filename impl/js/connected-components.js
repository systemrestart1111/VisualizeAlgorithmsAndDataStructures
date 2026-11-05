const NODES = 'ABCDEFGHIJ'; // J 是孤立點
const parent = Object.fromEntries([...NODES].map((v) => [v, v]));
function find(x) {
  while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } // 路徑壓縮
  return x;
}

// 用並查集合併每條邊的兩端，最後同一個根的點屬於同一個連通分量
for (const [a, b] of 'AB BC CA DE FG GH HF FI'.split(' ')) parent[find(a)] = find(b);
const groups = new Map();
for (const v of NODES) {
  const r = find(v);
  if (!groups.has(r)) groups.set(r, []);
  groups.get(r).push(v);
}
console.log('components:', groups.size);
for (const g of groups.values()) console.log(' ', g.join(' '));
