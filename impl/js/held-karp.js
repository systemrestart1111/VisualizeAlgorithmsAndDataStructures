const PTS = [[0, 0], [4, 1], [6, 4], [3, 6], [1, 4], [5, 7]];
const n = PTS.length;
const EPS = 1e-9; // 浮點數比較加上容許誤差：平手時固定選編號小的城市，不受各平台浮點運算細節影響
const d = PTS.map((a) => PTS.map((b) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)));

// dp[mask][j] = 從城市 0 出發、恰好走過 mask 中的城市、最後停在 j 的最短距離
const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(Infinity));
const par = Array.from({ length: 1 << n }, () => new Array(n).fill(-1));
dp[1][0] = 0;
for (let mask = 0; mask < 1 << n; mask++) {
  if (!(mask & 1)) continue;
  for (let j = 0; j < n; j++) {
    if (dp[mask][j] === Infinity || !((mask >> j) & 1)) continue;
    for (let k = 0; k < n; k++) {
      if ((mask >> k) & 1) continue;
      const nm = mask | (1 << k);
      if (dp[mask][j] + d[j][k] < dp[nm][k] - EPS) { dp[nm][k] = dp[mask][j] + d[j][k]; par[nm][k] = j; }
    }
  }
}
const full = (1 << n) - 1;
let best = Infinity, last = -1;
for (let j = 1; j < n; j++) if (dp[full][j] + d[j][0] < best - EPS) { best = dp[full][j] + d[j][0]; last = j; }
const tour = [];
for (let mask = full; last !== -1; ) { // 沿 par 倒推路線
  const p = par[mask][last];
  tour.unshift(last);
  mask ^= 1 << last;
  last = p;
}
tour.push(0);
console.log('tour:', tour.join(' -> '));
console.log(`length = ${best.toFixed(4)}`);
