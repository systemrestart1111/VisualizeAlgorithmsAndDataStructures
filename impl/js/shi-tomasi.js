const N = 16;
function preset(name) {
  return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
    if (name === 'checker') return ((r >> 2) + (c >> 2)) % 2 ? 210 : 40;
    let v = 30;
    if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
    if ((r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96) v = 140;
    if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
    return v;
  }));
}
const cl = (x) => Math.min(N - 1, Math.max(0, x));
function blur1(a) {
  const k = [-3, -2, -1, 0, 1, 2, 3].map((i) => Math.exp(-(i * i) / 2));
  let s = 0;
  for (const v of k) s += v;
  for (let i = 0; i < 7; i++) k[i] /= s;
  const h = a.map((row, r) => row.map((_, c) => { let t = 0; for (let j = -3; j <= 3; j++) t += k[j + 3] * a[r][cl(c + j)]; return t; }));
  return h.map((row, r) => row.map((_, c) => { let t = 0; for (let i = -3; i <= 3; i++) t += k[i + 3] * h[cl(r + i)][c]; return t; }));
}

// λmin = trace/2 − √((Sxx−Syy)²/4 + Sxy²)；依分數由大到小貪婪挑選，保持最小間距
function shiTomasi(A, q, dist) {
  const xx = [], yy = [], xy = [];
  for (let r = 0; r < N; r++) {
    xx.push([]); yy.push([]); xy.push([]);
    for (let c = 0; c < N; c++) {
      const ix = (-A[cl(r - 1)][cl(c - 1)] + A[cl(r - 1)][cl(c + 1)] - 2 * A[r][cl(c - 1)] + 2 * A[r][cl(c + 1)] - A[cl(r + 1)][cl(c - 1)] + A[cl(r + 1)][cl(c + 1)]) / 8;
      const iy = (-A[cl(r - 1)][cl(c - 1)] - 2 * A[cl(r - 1)][c] - A[cl(r - 1)][cl(c + 1)] + A[cl(r + 1)][cl(c - 1)] + 2 * A[cl(r + 1)][c] + A[cl(r + 1)][cl(c + 1)]) / 8;
      xx[r].push(ix * ix); yy[r].push(iy * iy); xy[r].push(ix * iy);
    }
  }
  const Sxx = blur1(xx), Syy = blur1(yy), Sxy = blur1(xy);
  const lam = Sxx.map((row, r) => row.map((a, c) => { const d = (a - Syy[r][c]) / 2; return Math.floor(((a + Syy[r][c]) / 2 - Math.sqrt(d * d + Sxy[r][c] * Sxy[r][c])) * 1000 + 0.5) / 1000; }));
  const mx = Math.max(...lam.flat());
  const cand = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (mx > 0 && lam[r][c] >= q * mx) cand.push([r, c]);
  cand.sort((a, b) => lam[b[0]][b[1]] - lam[a[0]][a[1]] || a[0] - b[0] || a[1] - b[1]);
  const chosen = [];
  for (const [r, c] of cand) if (chosen.every(([y, x]) => Math.hypot(r - y, c - x) >= dist)) chosen.push([r, c]);
  return { n: cand.length, chosen };
}

for (const [name, q, dist] of [['checker', 0.1, 3], ['checker', 0.1, 5], ['checker', 0.3, 3], ['shapes', 0.1, 3]]) {
  const { n, chosen } = shiTomasi(preset(name), q, dist);
  console.log(`${name}, quality ${q.toFixed(1)}, min distance ${dist}: ${n} candidates, ${chosen.length} chosen: ${chosen.map(([r, c]) => `(${r},${c})`).join(' ')}`);
}
