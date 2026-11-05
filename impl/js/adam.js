const FUNCS = {
  ellipse: [(x, y) => 0.1 * x * x + 2 * y * y, (x, y) => [0.2 * x, 4 * y], [-4.0, 1.5]],
  rosenbrock: [(x, y) => (1 - x) ** 2 + 10 * (y - x * x) ** 2, (x, y) => [-2 * (1 - x) - 40 * x * (y - x * x), 20 * (y - x * x)], [-1.5, 2.0]],
};

// m、v 為梯度與梯度平方的移動平均；偏差修正後 θ −= η·m̂ / (√v̂ + ε)（ε 在根號外）
function adam(name, lr, steps) {
  const [f, grad, start] = FUNCS[name];
  const b1 = 0.9, b2 = 0.999, eps = 1e-8;
  const th = [...start], m = [0, 0], v = [0, 0];
  let first = null;
  for (let t = 1; t <= steps; t++) {
    const g = grad(th[0], th[1]);
    for (let i = 0; i < 2; i++) {
      m[i] = b1 * m[i] + (1 - b1) * g[i];
      v[i] = b2 * v[i] + (1 - b2) * g[i] * g[i];
      const mh = m[i] / (1 - b1 ** t), vh = v[i] / (1 - b2 ** t), step = (lr * mh) / (Math.sqrt(vh) + eps);
      if (t === 1 && i === 0) first = [g[0], mh, vh, step];
      th[i] -= step;
    }
  }
  return { th, fv: f(th[0], th[1]), first };
}
function gd(name, lr, steps) {
  const [f, grad, start] = FUNCS[name];
  let th = [...start];
  for (let t = 0; t < steps; t++) {
    const g = grad(th[0], th[1]);
    th = [th[0] - lr * g[0], th[1] - lr * g[1]];
    if (Math.abs(th[0]) > 1e6 || Math.abs(th[1]) > 1e6) return null;
  }
  return { th, fv: f(th[0], th[1]) };
}

for (const name of ['ellipse', 'rosenbrock'])
  for (const [lr, steps] of [[0.1, 150], [0.03, 150]]) {
    const { th, fv, first: [g0, mh, vh, step] } = adam(name, lr, steps);
    console.log(`${name}, lr ${lr}: first step g = ${g0.toFixed(4)}, m_hat = ${mh.toFixed(4)}, v_hat = ${vh.toFixed(4)}, step = ${step.toFixed(4)}; after ${steps} steps theta = (${th[0].toFixed(4)}, ${th[1].toFixed(4)}), f = ${fv.toFixed(6)}`);
    const r = gd(name, lr, steps);
    console.log(`  plain gradient descent: ${r ? `theta = (${r.th[0].toFixed(4)}, ${r.th[1].toFixed(4)}), f = ${r.fv.toFixed(6)}` : 'diverged'}`);
  }
