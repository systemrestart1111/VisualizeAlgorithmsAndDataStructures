const f = (x) => (x - 2) ** 2 + 1; // 最小值在 x = 2
const df = (x) => 2 * (x - 2);

// 沿負梯度方向前進：x ← x − η·f'(x)；η 太大會震盪甚至發散，太小則收斂很慢
let x = 5.5;
const lr = 0.1;
console.log(`step  0: x = ${x.toFixed(6)}, f(x) = ${f(x).toFixed(6)}`);
for (let step = 1; step <= 20; step++) {
  x -= lr * df(x);
  if (step <= 5 || step % 5 === 0) console.log(`step ${String(step).padStart(2)}: x = ${x.toFixed(6)}, f(x) = ${f(x).toFixed(6)}`);
}
