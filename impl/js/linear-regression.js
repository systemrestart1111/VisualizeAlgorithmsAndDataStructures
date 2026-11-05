function data(exact, seed = 42) {
  let s = seed;
  return Array.from({ length: 12 }, (_, i) => {
    const x = 0.5 + i * 0.8;
    if (exact) return [x, 2 * x + 1];
    s = (s * 48271) % 2147483647;
    return [x, 2 * x + 1 + (s / 2147483647 - 0.5) * 4];
  });
}
const mse = (P, w, b) => P.reduce((s, [x, y]) => s + (w * x + b - y) ** 2, 0) / P.length;
// 正規方程：w = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²)，b = (Σy − wΣx) / n
function closedForm(P) {
  const n = P.length;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const [x, y] of P) { sx += x; sy += y; sxx += x * x; sxy += x * y; }
  const w = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  return [w, (sy - w * sx) / n];
}
// 沿 ∂MSE/∂w = (2/n)Σe·x、∂MSE/∂b = (2/n)Σe 的反方向更新
function gradientDescent(P, lr, epochs) {
  const n = P.length;
  let w = 0, b = 0;
  for (let ep = 1; ep <= epochs; ep++) {
    let gw = 0, gb = 0;
    for (const [x, y] of P) { const e = w * x + b - y; gw += (2 / n) * e * x; gb += (2 / n) * e; }
    w -= lr * gw; b -= lr * gb;
    if (mse(P, w, b) > 1e6) return { div: ep };
  }
  return { w, b };
}

for (const exact of [false, true]) {
  const P = data(exact);
  const [w, b] = closedForm(P);
  console.log(`${exact ? 'exact' : 'noisy'} data: closed form w = ${w.toFixed(4)}, b = ${b.toFixed(4)}, MSE = ${mse(P, w, b).toFixed(4)}`);
  for (const [lr, epochs] of [[0.02, 200], [0.02, 2000], [0.005, 200], [0.05, 200]]) {
    const r = gradientDescent(P, lr, epochs);
    if (r.div) console.log(`  lr ${lr}: diverged at epoch ${r.div}`);
    else console.log(`  lr ${lr}, ${epochs} epochs: w = ${r.w.toFixed(4)}, b = ${r.b.toFixed(4)}, MSE = ${mse(P, r.w, r.b).toFixed(4)}`);
  }
}
