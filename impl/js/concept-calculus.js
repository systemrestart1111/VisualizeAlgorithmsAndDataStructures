const f = (x) => x * x, df = (x) => 2 * x;
const g = (x, y) => x * x + 2 * y * y;

const x0 = 1.0;
console.log(`exact f'(${x0.toFixed(1)}) = ${df(x0).toFixed(6)}`);
for (let i = 0, h = 1.0; i < 6; i++, h /= 2) {
  const forward = (f(x0 + h) - f(x0)) / h;
  const central = (f(x0 + h) - f(x0 - h)) / (2 * h);
  console.log(`h = ${h.toFixed(5)}  forward = ${forward.toFixed(6)}  central = ${central.toFixed(6)}  error = ${Math.abs(forward - df(x0)).toFixed(6)}`);
}
const eps = 1e-3;
console.log(`grad g(1,1) analytic = (2.000, 4.000), numeric = (${((g(1 + eps, 1) - g(1 - eps, 1)) / (2 * eps)).toFixed(3)}, ${((g(1, 1 + eps) - g(1, 1 - eps)) / (2 * eps)).toFixed(3)})`);
