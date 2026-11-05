const A = [3, 34, 4, 12, 5, 2], T = 9, n = A.length;

// dp[i][s] = 前 i 個數能否湊出 s = dp[i-1][s] or dp[i-1][s - a[i]]
const dp = Array.from({ length: n + 1 }, () => new Array(T + 1).fill(false));
dp[0][0] = true;
for (let i = 1; i <= n; i++)
  for (let s = 0; s <= T; s++) dp[i][s] = dp[i - 1][s] || (s >= A[i - 1] && dp[i - 1][s - A[i - 1]]);
console.log('possible =', dp[n][T] ? 'True' : 'False');
if (dp[n][T]) {
  const pick = [];
  for (let i = n, s = T; i >= 1; i--) // 若不用第 i 個就湊不出來，代表一定要用它
    if (!dp[i - 1][s]) { pick.unshift(A[i - 1]); s -= A[i - 1]; }
  console.log('subset:', pick.join(' '));
}
