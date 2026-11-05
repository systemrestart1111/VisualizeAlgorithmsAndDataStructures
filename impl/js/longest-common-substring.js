// 相同字元沿對角線延伸，不同就歸零；表中最大值即答案（必須連續）。L 為對照用的最長共同子序列
function run(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0)), L = dp.map((r) => r.slice());
  let best = 0, end = 0;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; if (dp[i][j] > best) { best = dp[i][j]; end = i; } }
      L[i][j] = a[i - 1] === b[j - 1] ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);
    }
  console.log(`${a} / ${b}: substring '${a.slice(end - best, end)}' (${best}), subsequence length ${L[n][m]}`);
}

run('ABABCABA', 'BABCAACB');
run('ABCDXYZ', 'XYZABCD');
run('ABC', 'DEF');
