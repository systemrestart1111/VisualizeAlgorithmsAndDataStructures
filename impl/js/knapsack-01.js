const ITEMS = [[1, 1], [3, 4], [4, 5], [5, 7]]; // (重量, 價值)
const W = 7, n = ITEMS.length;

// dp[i][w] = 只考慮前 i 件、容量 w 時的最大價值；第 i 件「不拿」或「拿」（每件只能拿一次）
const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
for (let i = 1; i <= n; i++) {
  const [wi, vi] = ITEMS[i - 1];
  for (let w = 0; w <= W; w++) dp[i][w] = Math.max(dp[i - 1][w], w >= wi ? dp[i - 1][w - wi] + vi : 0);
}
const chosen = [];
for (let i = n, w = W; i >= 1; i--) // 從表格倒推：值有變化就代表拿了第 i 件
  if (dp[i][w] !== dp[i - 1][w]) { chosen.unshift(i); w -= ITEMS[i - 1][0]; }
console.log('best value =', dp[n][W]);
console.log('items (1-based):', chosen.join(' '));
console.log('last row:', dp[n].join(' '));
