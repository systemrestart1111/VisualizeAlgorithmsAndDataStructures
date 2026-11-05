const COINS = [1, 3, 4], A = 10;

// 最少硬幣數：dp[a] = min(dp[a - c] + 1)；記下每個金額最後用的硬幣以便還原
const dp = [0, ...new Array(A).fill(Infinity)], last = new Array(A + 1).fill(0);
for (let a = 1; a <= A; a++)
  for (const c of COINS) if (a >= c && dp[a - c] + 1 < dp[a]) { dp[a] = dp[a - c] + 1; last[a] = c; }
const used = [];
for (let a = A; a > 0; a -= last[a]) used.push(last[a]);
console.log('min coins =', dp[A], '->', used.join(' '));

// 組合數：外層跑硬幣、內層跑金額，每種組合只會以固定的硬幣順序被數到一次
const ways = [1, ...new Array(A).fill(0)];
for (const c of COINS) for (let a = c; a <= A; a++) ways[a] += ways[a - c];
console.log('ways =', ways[A]);
