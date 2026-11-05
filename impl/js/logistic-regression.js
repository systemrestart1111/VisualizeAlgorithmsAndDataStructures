// 依正負號選擇不會溢位的寫法
const sigmoid = (z) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));
// 交叉熵的穩定形式：max(z, 0) − y·z + log(1 + e^(−|z|))，不會出現 log(0)
const logLoss = (z, y) => Math.max(z, 0) - y * z + Math.log1p(Math.exp(-Math.abs(z)));

function data(seed, sep) {
  let s = seed;
  const real = () => (s = (s * 48271) % 2147483647) / 2147483647;
  return Array.from({ length: 24 }, (_, i) => { const y = i % 2, c = y ? 6 : 3; const x1 = c + (real() - 0.5) * sep; const x2 = c + (real() - 0.5) * sep; return [x1, x2, y]; });
}
function train(D, lr, epochs) {
  const n = D.length;
  let w1 = 0, w2 = 0, b = 0;
  for (let ep = 0; ep < epochs; ep++) {
    let g1 = 0, g2 = 0, gb = 0;
    for (const [x1, x2, y] of D) { const e = sigmoid(w1 * x1 + w2 * x2 + b) - y; g1 += (e * x1) / n; g2 += (e * x2) / n; gb += e / n; }
    w1 -= lr * g1; w2 -= lr * g2; b -= lr * gb;
  }
  let loss = 0, acc = 0;
  for (const [x1, x2, y] of D) { const z = w1 * x1 + w2 * x2 + b; loss += logLoss(z, y); if ((sigmoid(z) >= 0.5 ? 1 : 0) === y) acc++; }
  return { w1, w2, b, loss: loss / n, acc };
}

console.log(`stable loss for z = 40, y = 0: ${logLoss(40, 0).toFixed(4)}; for z = -40, y = 1: ${logLoss(-40, 1).toFixed(4)}; z = 0: ${logLoss(0, 1).toFixed(4)}`);
for (const [sep, configs] of [[3, [[0.5, 300], [0.1, 300], [0.5, 3000]]], [6, [[0.1, 300], [0.1, 3000], [0.02, 3000]]]]) {
  const D = data(42, sep);
  for (const [lr, epochs] of configs) {
    const { w1, w2, b, loss, acc } = train(D, lr, epochs);
    console.log(`spread ${sep}, lr ${lr}, ${epochs} epochs: w = (${w1.toFixed(3)}, ${w2.toFixed(3)}), b = ${b.toFixed(3)}, loss ${loss.toFixed(4)}, accuracy ${acc}/24`);
  }
}
