const XOR = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
const sg = (z) => 1 / (1 + Math.exp(-z));
// 2-2-1 網路：參數 W1(4) b1(2) w2(2) b2(1)
function forward(t, a, b) {
  const h = [sg(t[0] * a + t[1] * b + t[4]), sg(t[2] * a + t[3] * b + t[5])];
  return { h, o: sg(t[6] * h[0] + t[7] * h[1] + t[8]) };
}
const loss = (t) => XOR.reduce((s, [a, b, y]) => s + 0.5 * (forward(t, a, b).o - y) ** 2, 0);
// 連鎖律由輸出往回：δ₂ = (ŷ − y)ŷ(1 − ŷ)，δ₁ = w₂δ₂ ⊙ h(1 − h)
function grad(t) {
  const G = new Array(9).fill(0);
  for (const [a, b, y] of XOR) {
    const { h, o } = forward(t, a, b);
    const d2 = (o - y) * o * (1 - o);
    G[6] += d2 * h[0]; G[7] += d2 * h[1]; G[8] += d2;
    const d10 = t[6] * d2 * h[0] * (1 - h[0]), d11 = t[7] * d2 * h[1] * (1 - h[1]);
    G[0] += d10 * a; G[1] += d10 * b; G[2] += d11 * a; G[3] += d11 * b; G[4] += d10; G[5] += d11;
  }
  return G;
}

for (const [seed, lr, epochs] of [[3, 2.0, 2000], [1, 2.0, 2000], [3, 0.5, 2000]]) {
  let s = seed;
  let t = Array.from({ length: 9 }, () => ((s = (s * 48271) % 2147483647) / 2147483647 - 0.5) * 2);
  const G = grad(t), eps = 1e-5;
  let maxrel = 0;
  for (let i = 0; i < 9; i++) {
    const p = [...t], m = [...t];
    p[i] += eps; m[i] -= eps;
    const num = (loss(p) - loss(m)) / (2 * eps);
    maxrel = Math.max(maxrel, Math.abs(G[i] - num) / Math.max(1e-12, Math.abs(G[i]) + Math.abs(num)));
  }
  console.log(`seed ${seed}: initial loss ${loss(t).toFixed(6)}, gradient check max relative error < 1e-6: ${maxrel < 1e-6 ? 'True' : 'False'}`);
  for (let ep = 0; ep < epochs; ep++) { const gr = grad(t); t = t.map((v, i) => v - lr * gr[i]); }
  const preds = XOR.map(([a, b]) => forward(t, a, b).o);
  const ok = preds.every((p, i) => (p >= 0.5) === (XOR[i][2] === 1));
  console.log(`  lr ${lr.toFixed(1)}, ${epochs} epochs: loss ${loss(t).toFixed(6)}, predictions ${preds.map((p) => p.toFixed(3)).join(' ')}, all correct ${ok ? 'True' : 'False'}`);
}
