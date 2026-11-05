const KEYS = [10, 20, 30, 40, 50], P = [15, 10, 5, 10, 20], Q = [5, 10, 5, 5, 5, 10];
const n = KEYS.length;
const e = Array.from({ length: n + 2 }, () => new Array(n + 1).fill(0)), w = e.map((r) => r.slice());
const root = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
for (let i = 1; i <= n + 1; i++) e[i][i - 1] = w[i][i - 1] = Q[i - 1];
for (let len = 1; len <= n; len++)
  for (let i = 1; i + len - 1 <= n; i++) {
    const j = i + len - 1;
    w[i][j] = w[i][j - 1] + P[j - 1] + Q[j];
    e[i][j] = Infinity;
    for (let r = i; r <= j; r++) { const t = e[i][r - 1] + e[r + 1][j] + w[i][j]; if (t < e[i][j]) { e[i][j] = t; root[i][j] = r; } } // 枚舉根
  }
const preorder = (i, j) => (i > j ? [] : [KEYS[root[i][j] - 1], ...preorder(i, root[i][j] - 1), ...preorder(root[i][j] + 1, j)]);
console.log('min expected cost:', e[1][n]);
console.log('root:', KEYS[root[1][n] - 1], '| preorder:', preorder(1, n).join(' '));
