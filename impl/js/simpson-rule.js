// 係數 1, 4, 2, 4, …, 2, 4, 1 乘 h/3；n 必須是偶數
function simpson(f, a, b, n) {
  if (n % 2) return null;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
  return (s * h) / 3;
}
function trapezoid(f, a, b, n) {
  const h = (b - a) / n;
  let s = 0;
  for (let i = 1; i < n; i++) s += f(a + i * h);
  return ((f(a) + f(b)) / 2) * h + s * h;
}

const tests = [
  ['sin x on [0, pi]', Math.sin, 0, Math.PI, 2.0],
  ['4/(1+x^2) on [0, 1]', (x) => 4 / (1 + x * x), 0, 1, Math.PI],
  ['x^3-2x+1 on [0, 2]', (x) => x * x * x - 2 * x + 1, 0, 2, 2.0],
  ['sqrt x on [0, 1]', Math.sqrt, 0, 1, 2 / 3],
];
for (const [name, f, a, b, exact] of tests)
  for (const n of [2, 6, 12, 24]) {
    const s = simpson(f, a, b, n);
    console.log(`${name}, n = ${n}: simpson ${s.toFixed(10)} (err ${Math.abs(s - exact).toFixed(10)}), trapezoid err ${Math.abs(trapezoid(f, a, b, n) - exact).toFixed(10)}`);
  }
console.log(`n = 5: ${simpson(Math.sin, 0, 1, 5) === null ? 'n must be even' : 'ok'}`);
