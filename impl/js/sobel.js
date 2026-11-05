const N = 16;
function preset(name) {
  return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
    if (name === 'step') return (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0);
    if (name === 'checker') return ((r >> 2) + (c >> 2)) % 2 ? 210 : 40;
    let v = 30;
    if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
    if ((r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96) v = 140;
    if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
    return v;
  }));
}
const KX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], KY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
const conv = (a, K) => a.map((row, r) => row.map((_, c) => { let s = 0; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) s += K[i + 1][j + 1] * a[Math.min(N - 1, Math.max(0, r + i))][Math.min(N - 1, Math.max(0, c + j))]; return s; }));

for (const name of ['shapes', 'step', 'checker']) {
  const A = preset(name), gx = conv(A, KX), gy = conv(A, KY);
  let mx = 0, flat = 0, zero = true;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) mx = Math.max(mx, Math.hypot(gx[r][c], gy[r][c]));
  for (let r = 1; r < N - 1; r++)
    for (let c = 1; c < N - 1; c++) {
      let same = true;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) if (A[r + i][c + j] !== A[r][c]) same = false;
      if (same) { flat++; if (gx[r][c] || gy[r][c]) zero = false; }
    }
  const sumAbs = (g) => g.flat().reduce((s, v) => s + Math.abs(v), 0);
  console.log(`${name}: sum|Gx| = ${sumAbs(gx)}, sum|Gy| = ${sumAbs(gy)}, Gx(5,7) = ${gx[5][7]}, Gy(6,4) = ${gy[6][4]}, max magnitude ${mx.toFixed(2)}, ${flat} flat pixels all zero ${zero ? 'True' : 'False'}`);
}
