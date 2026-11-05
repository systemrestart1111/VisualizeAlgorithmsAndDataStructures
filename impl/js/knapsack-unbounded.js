const ITEMS = [[2, 3], [3, 5], [4, 7], [5, 8]]; // (重量, 價值)，每種可拿無限次
const W = 11;

// 一維 dp[w] 由小到大更新：dp[w - wi] 可能已經包含第 i 種，因此同一種能重複拿
const dp = new Array(W + 1).fill(0);
for (let w = 1; w <= W; w++) for (const [wi, vi] of ITEMS) if (w >= wi) dp[w] = Math.max(dp[w], dp[w - wi] + vi);
console.log('best value =', dp[W]);
console.log('dp:', dp.join(' '));
