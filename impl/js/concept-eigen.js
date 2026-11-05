// 2×2 矩陣的特徵值：λ² − tr·λ + det = 0
function eigen2(a, b, c, d) {
  const tr = a + d, det = a * d - b * c, disc = tr * tr - 4 * det;
  if (disc < 0) return null;
  return [1, -1].map((s) => {
    const lam = (tr + s * Math.sqrt(disc)) / 2;
    const v = b !== 0 ? [b, lam - a] : c !== 0 ? [lam - d, c] : a === lam ? [1, 0] : [0, 1];
    const n = Math.hypot(...v);
    return [lam, [v[0] / n, v[1] / n]];
  });
}

for (const [a, b, c, d] of [[2, 1, 1, 2], [4, 1, 2, 3], [0, -1, 1, 0]]) {
  console.log(`A = [[${a}, ${b}], [${c}, ${d}]]`);
  const res = eigen2(a, b, c, d);
  if (!res) { console.log('  no real eigenvalues'); continue; }
  for (const [lam, [x, y]] of res) {
    const ax = a * x + b * y, ay = c * x + d * y;
    const ok = Math.abs(ax - lam * x) < 1e-9 && Math.abs(ay - lam * y) < 1e-9;
    console.log(`  lambda = ${lam.toFixed(4)}  v = (${x.toFixed(4)}, ${y.toFixed(4)})  Av = (${ax.toFixed(4)}, ${ay.toFixed(4)})  ok = ${ok ? 'True' : 'False'}`);
  }
}
