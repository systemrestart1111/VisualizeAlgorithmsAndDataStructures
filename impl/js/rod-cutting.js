// dp[i] = max(p[k] + dp[i − k])，cut[i] 記錄最佳的第一段長度
function rodCut(p) {
  const n = p.length, dp = new Array(n + 1).fill(0), cut = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    dp[i] = -1;
    for (let k = 1; k <= i; k++) if (p[k - 1] + dp[i - k] > dp[i]) { dp[i] = p[k - 1] + dp[i - k]; cut[i] = k; }
  }
  const parts = [];
  for (let m = n; m; m -= cut[m]) parts.push(cut[m]);
  return [dp, parts];
}

const p = [1, 5, 8, 9, 10, 17, 17, 20];
const [dp, parts] = rodCut(p);
console.log('dp:', dp.join(' '));
console.log('best:', dp.at(-1), 'cut into', parts.join(' + '));
let brute = 0;
for (let mask = 0; mask < 1 << (p.length - 1); mask++) {
  let s = 0, len = 1;
  for (let i = 0; i < p.length - 1; i++) { if ((mask >> i) & 1) { s += p[len - 1]; len = 1; } else len++; }
  brute = Math.max(brute, s + p[len - 1]);
}
console.log('brute force:', brute);
