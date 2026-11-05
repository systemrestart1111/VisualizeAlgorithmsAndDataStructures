const COST = [[9, 2, 7, 8], [6, 4, 3, 7], [5, 8, 1, 8], [7, 6, 9, 4]]; // COST[工人][工作]
const n = COST.length;
const popcount = (x) => x.toString(2).split('1').length - 1;

// dp[mask] = mask 這些工作已分配給前 popcount(mask) 位工人時的最小成本
const dp = new Array(1 << n).fill(Infinity), choice = new Array(1 << n).fill(-1);
dp[0] = 0;
for (let mask = 0; mask < 1 << n; mask++) {
  if (dp[mask] === Infinity) continue;
  const k = popcount(mask); // 下一位要分配的工人
  if (k === n) continue;
  for (let j = 0; j < n; j++)
    if (!((mask >> j) & 1)) {
      const nm = mask | (1 << j);
      if (dp[mask] + COST[k][j] < dp[nm]) { dp[nm] = dp[mask] + COST[k][j]; choice[nm] = j; }
    }
}
const full = (1 << n) - 1, assign = new Array(n);
for (let k = n - 1, mask = full; k >= 0; k--) { assign[k] = choice[mask]; mask ^= 1 << choice[mask]; } // 倒推每位工人分到的工作
assign.forEach((j, k) => console.log(`worker ${k} -> job ${j} (cost ${COST[k][j]})`));
console.log('min total cost =', dp[full]);
