// 查詢依 (l 所在塊, r) 排序，左右指標逐格移動並維護相異數
function mo(a, queries) {
  const B = Math.max(1, Math.ceil(Math.sqrt(a.length)));
  const order = queries.map((_, i) => i).sort((i, j) => Math.floor(queries[i][0] / B) - Math.floor(queries[j][0] / B) || queries[i][1] - queries[j][1] || i - j);
  const cnt = new Map();
  let distinct = 0, moves = 0, L = 0, R = -1;
  const add = (x) => { cnt.set(x, (cnt.get(x) ?? 0) + 1); if (cnt.get(x) === 1) distinct++; moves++; };
  const rem = (x) => { cnt.set(x, cnt.get(x) - 1); if (cnt.get(x) === 0) distinct--; moves++; };
  const ans = [];
  for (const i of order) {
    const [l, r] = queries[i];
    while (R < r) add(a[++R]);
    while (L > l) add(a[--L]);
    while (R > r) rem(a[R--]);
    while (L < l) rem(a[L++]);
    ans[i] = distinct;
  }
  return [ans, moves];
}

const a = [1, 2, 1, 3, 2, 2, 4, 1, 5, 3, 4, 4];
const qs = [[0, 4], [2, 7], [5, 11], [1, 3], [6, 9], [0, 11]];
const [ans, moves] = mo(a, qs);
qs.forEach(([l, r], i) => console.log(`distinct[${l}, ${r}] = ${ans[i]} (brute ${new Set(a.slice(l, r + 1)).size})`));
console.log('pointer moves:', moves);
