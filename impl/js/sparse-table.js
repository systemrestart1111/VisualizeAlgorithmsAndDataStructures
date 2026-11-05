// st[j][i] = min(a[i .. i + 2^j − 1])
function build(a) {
  const st = [a.slice()];
  for (let j = 1; 1 << j <= a.length; j++) st.push(Array.from({ length: a.length - (1 << j) + 1 }, (_, i) => Math.min(st[j - 1][i], st[j - 1][i + (1 << (j - 1))])));
  return st;
}
// 兩段長度 2^k 的區間可以重疊：只適用於 min／max／gcd 等冪等運算
const query = (st, l, r) => { const k = 31 - Math.clz32(r - l + 1); return Math.min(st[k][l], st[k][r - (1 << k) + 1]); };

const a = [5, 2, 8, 6, 3, 7, 1, 9, 4, 6, 2, 8];
const st = build(a);
st.forEach((row, j) => console.log(`2^${j}:`, row.join(' ')));
for (const [l, r] of [[0, 4], [3, 9], [6, 6], [0, 11], [8, 11], [2, 5]]) console.log(`min[${l}, ${r}] = ${query(st, l, r)} (brute ${Math.min(...a.slice(l, r + 1))})`);
