const P = [30, 35, 15, 5, 10, 20, 25]; // 矩陣 i 的大小為 P[i-1] x P[i]
const n = P.length - 1;

// m[i][j] = 計算 A_i..A_j 的最少純量乘法數；枚舉最後一次相乘的切點 k
const m = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
const s = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
for (let len = 2; len <= n; len++)
  for (let i = 1; i + len - 1 <= n; i++) {
    const j = i + len - 1;
    m[i][j] = Infinity;
    for (let k = i; k < j; k++) {
      const cost = m[i][k] + m[k + 1][j] + P[i - 1] * P[k] * P[j];
      if (cost < m[i][j]) { m[i][j] = cost; s[i][j] = k; }
    }
  }
const paren = (i, j) => (i === j ? `A${i}` : `(${paren(i, s[i][j])}${paren(s[i][j] + 1, j)})`);
console.log('min multiplications =', m[1][n]);
console.log('order:', paren(1, n));
