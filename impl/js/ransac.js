class PM {
  constructor(seed) { this.s = seed; }
  next() { this.s = (this.s * 48271) % 2147483647; return this.s; }
  int(n) { return this.next() % n; }
  real() { return this.next() / 2147483647; }
}
function data() {
  const g = new PM(7), pts = [];
  for (let i = 0; i < 20; i++) { const x = 0.5 + (i * 9) / 19; pts.push([x, 0.6 * x + 2 + (g.real() - 0.5) * 0.6]); }
  for (let i = 0; i < 10; i++) { const x = g.real() * 10; pts.push([x, g.real() * 10]); }
  return pts;
}
function lsq(P) {
  const n = P.length;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const [x, y] of P) { sx += x; sy += y; sxx += x * x; sxy += x * y; }
  const det = n * sxx - sx * sx;
  return det ? [(n * sxy - sx * sy) / det, (sxx * sy - sx * sxy) / det] : [0, sy / n];
}
// 隨機抽兩點定直線，數誤差門檻內的內點，保留最多者；最後只用內點重新擬合
function ransac(P, seed, iters, thr) {
  const g = new PM(seed);
  let best = null;
  for (let it = 0; it < iters; it++) {
    const i = g.int(P.length);
    let j = g.int(P.length), tries = 0;
    while (P[i][0] === P[j][0] && P[i][1] === P[j][1] && tries < 10) { j = g.int(P.length); tries++; }
    if (P[i][0] === P[j][0] && P[i][1] === P[j][1]) continue;
    const [x1, y1] = P[i], [x2, y2] = P[j];
    const A = y2 - y1, B = x1 - x2, C = -(A * x1 + B * y1), nrm = Math.hypot(A, B);
    const inl = [];
    P.forEach(([x, y], k) => { if (Math.abs(A * x + B * y + C) / nrm < thr) inl.push(k); });
    if (!best || inl.length > best.length) best = inl;
  }
  const [a, b] = lsq(best.map((k) => P[k]));
  return { n: best.length, real: best.filter((k) => k < 20).length, a, b };
}

const P = data();
const [a0, b0] = lsq(P);
console.log(`least squares on all 30 points: y = ${a0.toFixed(3)}x + ${b0.toFixed(3)}`);
for (const [seed, iters, thr] of [[42, 20, 0.5], [1, 5, 0.5], [2024, 50, 0.3], [42, 20, 1.0]]) {
  const { n, real, a, b } = ransac(P, seed, iters, thr);
  console.log(`seed ${seed}, ${iters} iterations, threshold ${thr.toFixed(1)}: ${n} inliers (${real} true), refit y = ${a.toFixed(3)}x + ${b.toFixed(3)}`);
}
