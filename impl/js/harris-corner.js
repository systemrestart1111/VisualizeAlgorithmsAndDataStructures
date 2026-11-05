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

// 結構張量 M（高斯加權），R = det(M) − k·trace(M)²；R 四捨五入成整數後做 3×3 非極大值抑制
function harris(A, k) {
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
  const R = Sxx.map((row, r) => row.map((a, c) => { const t = a + Syy[r][c]; return Math.floor(a * Syy[r][c] - Sxy[r][c] * Sxy[r][c] - k * t * t + 0.5); }));
  const mx = Math.max(...R.flat()), mn = Math.min(...R.flat());
  const corners = [];
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      if (R[i][j] <= 0.1 * mx) continue;
      let ok = true;
      for (let a = -1; a <= 1; a++)
        for (let b = -1; b <= 1; b++) {
          const y = i + a, x = j + b;
          if ((a || b) && y >= 0 && y < N && x >= 0 && x < N && (R[y][x] > R[i][j] || (R[y][x] === R[i][j] && (a < 0 || (a === 0 && b < 0))))) ok = false;
        }
      if (ok) corners.push([i, j]);
    }
  return { corners, mx, edges: R.flat().filter((v) => v < 0.1 * mn).length };
}

for (const name of ['checker', 'shapes'])
  for (const k of [0.04, 0.06]) {
    const { corners, mx, edges } = harris(preset(name), k);
    console.log(`${name}, k = ${k.toFixed(2)}: max R = ${mx}, edge pixels ${edges}, ${corners.length} corners: ${corners.map(([i, j]) => `(${i},${j})`).join(' ')}`);
  }
