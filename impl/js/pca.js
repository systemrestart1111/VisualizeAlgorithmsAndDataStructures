const PTS = [[2.0, 1.6], [3.1, 2.4], [4.2, 2.6], [5.0, 3.5], [5.9, 3.7], [6.8, 4.6], [7.7, 4.4], [8.9, 5.6], [4.6, 3.6], [6.1, 3.0]];

// 中心化（可選標準化）→ 共變異數矩陣 → 2×2 對稱矩陣的特徵分解
function pca(P, standardize) {
  const n = P.length;
  let mx = 0, my = 0;
  for (const [x, y] of P) { mx += x; my += y; }
  mx /= n; my /= n;
  let X = P.map(([x, y]) => [x - mx, y - my]);
  if (standardize) {
    let sx = 0, sy = 0;
    for (const [x, y] of X) { sx += x * x; sy += y * y; }
    sx = Math.sqrt(sx / (n - 1)); sy = Math.sqrt(sy / (n - 1));
    X = X.map(([x, y]) => [x / sx, y / sy]);
  }
  let a = 0, b = 0, c = 0;
  for (const [x, y] of X) { a += x * x; b += x * y; c += y * y; }
  a /= n - 1; b /= n - 1; c /= n - 1;
  const tr = a + c, det = a * c - b * b, disc = Math.sqrt(Math.max(0, (tr / 2) ** 2 - det));
  const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
  let v = Math.abs(b) > 1e-12 ? [l1 - c, b] : a >= c ? [1, 0] : [0, 1];
  const nv = Math.hypot(v[0], v[1]);
  v = [v[0] / nv, v[1] / nv];
  if (v[0] < 0) v = [-v[0], -v[1]];
  return { a, b, c, l1, l2, v, z: X.map(([x, y]) => x * v[0] + y * v[1]) };
}

for (const [name, P] of [['original', PTS], ['x scaled by 10', PTS.map(([x, y]) => [10 * x, y])]])
  for (const std of [false, true]) {
    const { a, b, c, l1, l2, v, z } = pca(P, std);
    console.log(`${name}, ${std ? 'standardized' : 'centered'}: cov [${a.toFixed(3)} ${b.toFixed(3)}; ${b.toFixed(3)} ${c.toFixed(3)}], eigenvalues ${l1.toFixed(3)} ${l2.toFixed(3)} (sum ${(l1 + l2).toFixed(3)} = trace ${(a + c).toFixed(3)}), PC1 (${v[0].toFixed(3)}, ${v[1].toFixed(3)}) explains ${((100 * l1) / (l1 + l2)).toFixed(2)}%, first projections ${z[0].toFixed(3)} ${z[1].toFixed(3)}`);
  }
