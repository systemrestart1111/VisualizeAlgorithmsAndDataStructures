const STONES = [4, 1, 2, 3, 5, 2], n = STONES.length;

// 石子合併：每次合併相鄰兩堆，成本為兩堆重量和
// dp[i][j] = 把第 i..j 堆合成一堆的最小成本 = min(dp[i][k] + dp[k+1][j]) + sum(i..j)
const pre = [0];
for (const x of STONES) pre.push(pre[pre.length - 1] + x);
const dp = Array.from({ length: n }, () => new Array(n).fill(0));
const cut = Array.from({ length: n }, () => new Array(n).fill(0));
for (let len = 2; len <= n; len++)
  for (let i = 0; i + len - 1 < n; i++) {
    const j = i + len - 1;
    dp[i][j] = Infinity;
    for (let k = i; k < j; k++) if (dp[i][k] + dp[k + 1][j] < dp[i][j]) { dp[i][j] = dp[i][k] + dp[k + 1][j]; cut[i][j] = k; }
    dp[i][j] += pre[j + 1] - pre[i];
  }
const show = (i, j) => (i === j ? String(STONES[i]) : `(${show(i, cut[i][j])}+${show(cut[i][j] + 1, j)})`);
console.log('min cost =', dp[0][n - 1]);
console.log('merge order:', show(0, n - 1));
