const ITEMS = [[2, 3, 3], [3, 4, 2], [4, 6, 4]]; // (重量, 價值, 數量)
const W = 12;

// 二進位拆分：數量 c 拆成 1, 2, 4, …, 餘數 這幾包，任意 0..c 件都能由它們組合出來，之後當成 0/1 背包
const pieces = [];
for (const [w, v, count] of ITEMS)
  for (let c = count, k = 1; c > 0; k *= 2) {
    const take = Math.min(k, c);
    pieces.push([w * take, v * take]);
    c -= take;
  }
console.log('pieces:', pieces.map(([w, v]) => `(${w},${v})`).join(' '));
const dp = new Array(W + 1).fill(0);
for (const [pw, pv] of pieces) for (let w = W; w >= pw; w--) dp[w] = Math.max(dp[w], dp[w - pw] + pv); // 容量由大到小
console.log('best value =', dp[W]);
