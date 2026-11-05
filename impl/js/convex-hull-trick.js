// dp[i] = min_j dp[j] + (x_i − x_j)² + C；直線 y = −2x_j·X + dp[j] + x_j²，斜率遞減、查詢遞增
function frog(x, C) {
  const n = x.length, dp = new Array(n).fill(0);
  const f = (l, X) => l[0] * X + l[1];
  const bad = (l1, l2, l3) => (l3[1] - l1[1]) * (l1[0] - l2[0]) <= (l2[1] - l1[1]) * (l1[0] - l3[0]);
  const dq = [[-2 * x[0], x[0] * x[0]]];
  for (let i = 1; i < n; i++) {
    while (dq.length >= 2 && f(dq[1], x[i]) <= f(dq[0], x[i])) dq.shift();
    dp[i] = f(dq[0], x[i]) + x[i] * x[i] + C;
    const L = [-2 * x[i], dp[i] + x[i] * x[i]];
    while (dq.length >= 2 && bad(dq.at(-2), dq.at(-1), L)) dq.pop();
    dq.push(L);
  }
  return dp;
}
function naive(x, C) {
  const dp = [0];
  for (let i = 1; i < x.length; i++) dp[i] = Math.min(...dp.map((d, j) => d + (x[i] - x[j]) ** 2 + C));
  return dp;
}

const x = [1, 3, 4, 7, 8, 11, 12, 15];
for (const C of [10, 0, 100]) console.log(`C = ${C}: dp = ${frog(x, C).join(' ')} | naive last = ${naive(x, C).at(-1)}`);
