const f = (x) => x ** 3 - 2 * x - 5;
const df = (x) => 3 * x * x - 2;

// 用切線逼近：x ← x − f(x) / f'(x)；靠近根時誤差每步大約平方縮小（二次收斂）
let x = 3;
console.log(`x0 = ${x.toFixed(10)}`);
for (let i = 1; i <= 6; i++) {
  x -= f(x) / df(x);
  console.log(`x${i} = ${x.toFixed(10)}`);
}
