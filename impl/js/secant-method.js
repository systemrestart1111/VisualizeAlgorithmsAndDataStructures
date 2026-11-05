const FUNCS = {
  'x^3-2x-5': (x) => x * x * x - 2 * x - 5,
  'cos x - x': (x) => Math.cos(x) - x,
  'x^2-2': (x) => x * x - 2,
  'atan x': Math.atan,
};

// x2 = x1 − f(x1)(x1 − x0) / (f(x1) − f(x0))；分母趨近 0 或 |x| 爆增時停止
function secant(f, x0, x1) {
  for (let k = 1; k <= 25; k++) {
    const f0 = f(x0), f1 = f(x1);
    if (Math.abs(f1 - f0) < 1e-14) return 'flat secant (f(x0) = f(x1)), stop';
    const x2 = x1 - (f1 * (x1 - x0)) / (f1 - f0);
    if (!Number.isFinite(x2) || Math.abs(x2) > 1e6) return `diverged after ${k} steps`;
    if (Math.abs(x2 - x1) < 1e-12) return `root ${(Math.abs(x2) < 5e-11 ? 0 : x2).toFixed(10)} after ${k} steps`;
    [x0, x1] = [x1, x2];
  }
  return 'no convergence in 25 steps';
}

for (const [name, x0, x1] of [['x^3-2x-5', 1, 3], ['cos x - x', 0, 1], ['x^2-2', 1, 2], ['x^2-2', -1, 1], ['atan x', 1, 2], ['atan x', 3, 5]])
  console.log(`${name}, x0 = ${x0}, x1 = ${x1}: ${secant(FUNCS[name], x0, x1)}`);
