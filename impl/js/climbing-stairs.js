// dp[i] = 爬到第 i 階的方法數 = Σ dp[i - s]（s 為每次可爬的階數）
function climb(n, steps) {
  const dp = [1];
  for (let i = 1; i <= n; i++) dp[i] = steps.reduce((s, k) => s + (i >= k ? dp[i - k] : 0), 0);
  return dp;
}

const dp = climb(8, [1, 2]);
console.log('ways(8) =', dp[8]);
console.log('dp:', dp.join(' '));
