const LEAVES = [3, 5, 6, 9, 1, 2, 0, -1, 8, 4, 7, 2, 5, 1, 3, 6], B = 2; // B = 分支數

// 由下往上：MAX 層取子節點最大值、MIN 層取最小值（根為 MAX，層數交替）
let depth = 0;
while (B ** depth < LEAVES.length) depth++;
let vals = [...LEAVES];
for (let d = depth - 1; d >= 0; d--) {
  const isMax = d % 2 === 0, next = [];
  for (let i = 0; i < vals.length; i += B) next.push((isMax ? Math.max : Math.min)(...vals.slice(i, i + B)));
  vals = next;
  console.log(`level ${d} (${isMax ? 'MAX' : 'MIN'}):`, vals.join(' '));
}
console.log('root value =', vals[0]);
