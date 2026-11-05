const N = 16;
function preset(name) {
  let s = 7;
  return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
    if (name === 'step') return (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0);
    let v = 30;
    if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
    if ((r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96) v = 140;
    if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
    if (name === 'noisy') { s = (s * 48271) % 2147483647; const t = s % 100; v = t < 5 ? 0 : t < 10 ? 255 : v; }
    return v;
  }));
}
const cl = (x) => Math.min(N - 1, Math.max(0, x));

// 高斯模糊 → Sobel → 沿梯度方向細化 → 雙門檻 → 從強邊 BFS 連結弱邊
function canny(A, lo, hi) {
  const k = [-3, -2, -1, 0, 1, 2, 3].map((i) => Math.exp(-(i * i) / 2));
  let s = 0;
  for (const v of k) s += v;
  for (let i = 0; i < 7; i++) k[i] /= s;
  const h = A.map((row, r) => row.map((_, c) => { let t = 0; for (let j = -3; j <= 3; j++) t += k[j + 3] * A[r][cl(c + j)]; return t; }));
  const B = h.map((row, r) => row.map((_, c) => { let t = 0; for (let i = -3; i <= 3; i++) t += k[i + 3] * h[cl(r + i)][c]; return t; }));
  const gx = B.map((row, r) => row.map((_, c) => -B[cl(r - 1)][cl(c - 1)] + B[cl(r - 1)][cl(c + 1)] - 2 * B[r][cl(c - 1)] + 2 * B[r][cl(c + 1)] - B[cl(r + 1)][cl(c - 1)] + B[cl(r + 1)][cl(c + 1)]));
  const gy = B.map((row, r) => row.map((_, c) => -B[cl(r - 1)][cl(c - 1)] - 2 * B[cl(r - 1)][c] - B[cl(r - 1)][cl(c + 1)] + B[cl(r + 1)][cl(c - 1)] + 2 * B[cl(r + 1)][c] + B[cl(r + 1)][cl(c + 1)]));
  const M = gx.map((row, r) => row.map((v, c) => Math.floor(Math.hypot(v, gy[r][c]) * 10000 + 0.5) / 10000));
  const get = (r, c) => (r >= 0 && r < N && c >= 0 && c < N ? M[r][c] : 0);
  const thin = M.map((row, r) => row.map((v, c) => {
    let ang = (Math.atan2(gy[r][c], gx[r][c]) * 180) / Math.PI;
    if (ang < 0) ang += 180;
    const [di, dj] = ang < 22.5 || ang >= 157.5 ? [0, 1] : ang < 67.5 ? [1, 1] : ang < 112.5 ? [1, 0] : [1, -1];
    return v >= get(r + di, c + dj) && v >= get(r - di, c - dj) ? v : 0;
  }));
  const mx = Math.max(...M.flat()) || 1;
  const lab = thin.map((row) => row.map((v) => (v >= hi * mx ? 2 : v >= lo * mx ? 1 : 0)));
  const strong = lab.flat().filter((v) => v === 2).length, weak = lab.flat().filter((v) => v === 1).length;
  const queue = [];
  lab.forEach((row, r) => row.forEach((v, c) => { if (v === 2) queue.push([r, c]); }));
  let promoted = 0;
  for (let qi = 0; qi < queue.length; qi++) {
    const [r, c] = queue[qi];
    for (let a = -1; a <= 1; a++)
      for (let b = -1; b <= 1; b++) {
        const y = r + a, x = c + b;
        if (y >= 0 && y < N && x >= 0 && x < N && lab[y][x] === 1) { lab[y][x] = 2; promoted++; queue.push([y, x]); }
      }
  }
  return { strong, weak, promoted, edges: lab.flat().filter((v) => v === 2).length };
}

for (const name of ['shapes', 'noisy', 'step']) {
  const A = preset(name);
  for (const [lo, hi] of [[0.15, 0.4], [0.1, 0.3]]) {
    const { strong, weak, promoted, edges } = canny(A, lo, hi);
    console.log(`${name}, low ${lo} high ${hi}: strong ${strong}, weak ${weak}, promoted ${promoted}, dropped ${weak - promoted}, edge pixels ${edges}`);
  }
}
