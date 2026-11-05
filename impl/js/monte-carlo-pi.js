let state = 42;
// Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
const randInt = (k) => (state = (state * 48271) % 2147483647) % k;

// 在邊長 R 的正方形內隨機撒點，落在四分之一圓內的比例 ≈ π/4（座標用整數，避免浮點誤差）
const R = 100000, N = 2000;
let inside = 0;
for (let i = 1; i <= N; i++) {
  const x = randInt(R), y = randInt(R);
  if (x * x + y * y < R * R) inside++;
  if ([100, 500, 1000, 2000].includes(i)) console.log(`n = ${String(i).padStart(4)}: pi ~ ${((4 * inside) / i).toFixed(4)}`);
}
