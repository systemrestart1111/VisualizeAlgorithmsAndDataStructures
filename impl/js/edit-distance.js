// dp[i][j] = a 前 i 字變成 b 前 j 字的最少操作數（插入、刪除、替換各算 1）
function editDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  const ops = [];
  for (let i = m, j = n; i || j; ) { // 倒推出一組操作
    if (i && j && a[i - 1] === b[j - 1]) { i--; j--; }
    else if (i && j && dp[i][j] === dp[i - 1][j - 1] + 1) { ops.unshift(`replace ${a[i - 1]}->${b[j - 1]}`); i--; j--; }
    else if (i && dp[i][j] === dp[i - 1][j] + 1) { ops.unshift(`delete ${a[i - 1]}`); i--; }
    else { ops.unshift(`insert ${b[j - 1]}`); j--; }
  }
  return [dp[m][n], ops];
}

const [d, ops] = editDistance('kitten', 'sitting');
console.log('distance =', d);
console.log('ops:', ops.join(', '));
