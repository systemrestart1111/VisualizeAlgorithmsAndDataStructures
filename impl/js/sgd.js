let st = 9;
const nxt = () => (st = (st * 48271) % 2147483647);
const P = Array.from({ length: 12 }, (_, i) => { const x = 0.5 + i * 0.8; return [x, 2 * x + 1 + (nxt() / 2147483647 - 0.5) * 4]; });
const mse = (w, b) => P.reduce((s, [x, y]) => s + (w * x + b - y) ** 2, 0) / P.length;

// 每輪先 Fisher–Yates 洗牌，再逐筆更新：w −= η·2e·x，b −= η·2e
function sgd(lr, epochs, seed) {
  st = seed;
  let w = 0, b = 0;
  for (let ep = 1; ep <= epochs; ep++) {
    const ord = P.map((_, i) => i);
    for (let i = ord.length - 1; i > 0; i--) { const j = nxt() % (i + 1); [ord[i], ord[j]] = [ord[j], ord[i]]; }
    for (const i of ord) { const [x, y] = P[i]; const e = w * x + b - y; w -= lr * 2 * e * x; b -= lr * 2 * e; }
    if (mse(w, b) > 1e6) return { div: ep };
  }
  return { w, b };
}
function batch(lr, epochs) {
  const n = P.length;
  let w = 0, b = 0;
  for (let ep = 0; ep < epochs; ep++) {
    let gw = 0, gb = 0;
    for (const [x, y] of P) gw += (2 / n) * (w * x + b - y) * x;
    for (const [x, y] of P) gb += (2 / n) * (w * x + b - y);
    w -= lr * gw; b -= lr * gb;
  }
  return { w, b };
}

for (const lr of [0.01, 0.002, 0.03]) {
  const r = sgd(lr, 15, 42), bg = batch(lr, 15);
  const s = r.div ? `diverged at epoch ${r.div}` : `w = ${r.w.toFixed(4)}, b = ${r.b.toFixed(4)}, MSE ${mse(r.w, r.b).toFixed(4)}`;
  console.log(`lr ${lr}, 15 epochs: SGD ${s}; batch GD w = ${bg.w.toFixed(4)}, b = ${bg.b.toFixed(4)}, MSE ${mse(bg.w, bg.b).toFixed(4)}`);
}
