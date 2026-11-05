// dp[i][j] = a 前 i 字與 b 前 j 字的 LCS 長度；字元相同取左上 +1，否則取上方與左方較大者
function lcs(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  let out = '';
  for (let i = m, j = n; i && j; ) { // 由右下角倒推還原一組 LCS
    if (a[i - 1] === b[j - 1]) { out = a[i - 1] + out; i--; j--; }
    else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
    else j--;
  }
  return [dp[m][n], out];
}

const [len, s] = lcs('ABCBDAB', 'BDCABA');
console.log('LCS length =', len);
console.log('one LCS =', s);
