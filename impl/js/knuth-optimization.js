// opt[i][j−1] ≤ opt[i][j] ≤ opt[i+1][j]：只在這個範圍內枚舉切點
function run(a) {
  const n = a.length, S = [0];
  for (const x of a) S.push(S.at(-1) + x);
  const dp = Array.from({ length: n }, () => new Array(n).fill(0)), nd = dp.map((r) => r.slice());
  const opt = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? i : 0)));
  let e1 = 0, e2 = 0;
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let m = opt[i][j - 1]; m <= Math.min(opt[i + 1][j], j - 1); m++) { e1++; const t = dp[i][m] + dp[m + 1][j] + S[j + 1] - S[i]; if (t < dp[i][j]) { dp[i][j] = t; opt[i][j] = m; } }
      nd[i][j] = Infinity;
      for (let m = i; m < j; m++) { e2++; nd[i][j] = Math.min(nd[i][j], nd[i][m] + nd[m + 1][j] + S[j + 1] - S[i]); }
    }
  console.log(`[${a.join(', ')}]: knuth ${dp[0][n - 1]} (${e1} evals), naive ${nd[0][n - 1]} (${e2} evals)`);
}

run([4, 1, 7, 3, 9, 2, 6, 5]);
run([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
