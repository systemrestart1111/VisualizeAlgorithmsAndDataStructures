let state = 42;
// Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
const randInt = (k) => (state = (state * 48271) % 2147483647) % k;

// 二維隨機漫步：每步等機率往上下左右走一格；n 步後離原點的距離期望值約為 √n
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
let x = 0, y = 0, far = 0;
for (let step = 1; step <= 400; step++) {
  const [dx, dy] = DIRS[randInt(4)];
  x += dx;
  y += dy;
  far = Math.max(far, x * x + y * y);
  if ([100, 200, 400].includes(step)) console.log(`step ${step}: position (${x}, ${y}), distance = ${Math.sqrt(x * x + y * y).toFixed(4)}`);
}
console.log(`farthest distance = ${Math.sqrt(far).toFixed(4)}, sqrt(n) = ${Math.sqrt(400).toFixed(4)}`);
