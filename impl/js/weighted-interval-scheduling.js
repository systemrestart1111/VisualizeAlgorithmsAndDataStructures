const IV = [[0, 3, 2], [2, 9, 20], [3, 5, 3], [5, 7, 4], [7, 10, 3], [9, 12, 6], [10, 14, 2]];

// 依結束時間排序；dp[j] = max(dp[j−1], w_j + dp[p(j)])，p(j) 以二分搜尋找最後一個相容活動
function schedule(iv) {
  const s = [...iv].sort((x, y) => x[1] - y[1] || x[0] - y[0]);
  const n = s.length;
  const p = s.map(([st]) => { let lo = 0, hi = n; while (lo < hi) { const m = (lo + hi) >> 1; if (s[m][1] <= st) lo = m + 1; else hi = m; } return lo; });
  const dp = new Array(n + 1).fill(0);
  for (let j = 1; j <= n; j++) dp[j] = Math.max(dp[j - 1], s[j - 1][2] + dp[p[j - 1]]);
  const pick = [];
  for (let j = n; j > 0;) { if (dp[j] !== dp[j - 1]) { pick.unshift(s[j - 1]); j = p[j - 1]; } else j--; }
  return [dp[n], pick, s];
}

const [best, pick, sorted] = schedule(IV);
console.log('best total:', best, 'chosen:', pick.map(([a, b, w]) => `[${a},${b})w${w}`).join(' '));
let last = -Infinity, greedy = 0;
for (const [a, b, w] of sorted) if (a >= last) { greedy += w; last = b; }
console.log('earliest-finish greedy:', greedy);
