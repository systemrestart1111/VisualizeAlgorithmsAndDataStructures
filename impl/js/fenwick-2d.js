// 兩個維度各自沿 lowbit 跳：更新往上、查詢往下（1 起算）
class Fenwick2D {
  constructor(n, m) { this.n = n; this.m = m; this.t = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0)); }
  add(r, c, v) { for (let i = r; i <= this.n; i += i & -i) for (let j = c; j <= this.m; j += j & -j) this.t[i][j] += v; }
  prefix(r, c) { let s = 0; for (let i = r; i > 0; i -= i & -i) for (let j = c; j > 0; j -= j & -j) s += this.t[i][j]; return s; }
  rect(r1, c1, r2, c2) { return this.prefix(r2, c2) - this.prefix(r1 - 1, c2) - this.prefix(r2, c1 - 1) + this.prefix(r1 - 1, c1 - 1); }
}

const f = new Fenwick2D(6, 6);
const a = Array.from({ length: 7 }, () => new Array(7).fill(0));
for (const [r, c, v] of [[1, 1, 3], [2, 3, 5], [4, 2, 2], [3, 5, 4], [6, 6, 1], [5, 4, 6]]) { f.add(r, c, v); a[r][c] += v; }
for (const q of [[1, 1, 6, 6], [2, 2, 4, 5], [3, 3, 3, 3], [4, 1, 6, 4]]) {
  let brute = 0;
  for (let i = q[0]; i <= q[2]; i++) for (let j = q[1]; j <= q[3]; j++) brute += a[i][j];
  console.log(`sum(${q.join(', ')}) = ${f.rect(...q)} (brute ${brute})`);
}
f.add(4, 4, 10);
console.log('after add(4, 4, 10): sum(2, 2, 4, 5) =', f.rect(2, 2, 4, 5));
