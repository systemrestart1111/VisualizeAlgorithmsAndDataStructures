const N = 16;
const shapes = () => Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
  let v = 30;
  if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
  if ((r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96) v = 140;
  if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
  return v;
}));
// 超出範圍時依邊界模式取值：補 0、複製邊緣、鏡射
function at(a, r, c, mode) {
  if (r >= 0 && r < N && c >= 0 && c < N) return a[r][c];
  if (mode === 'zero') return 0;
  if (mode === 'replicate') return a[Math.min(N - 1, Math.max(0, r))][Math.min(N - 1, Math.max(0, c))];
  const ref = (i) => { while (i < 0 || i >= N) i = i < 0 ? -i : 2 * (N - 1) - i; return i; };
  return a[ref(r)][ref(c)];
}
// 相關運算：核心中心對準像素，對應位置相乘後加總
const conv = (a, K, mode) => a.map((row, r) => row.map((_, c) => { let s = 0; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) s += K[i + 1][j + 1] * at(a, r + i, c + j, mode); return s; }));

const A = shapes();
const KS = { sharpen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], laplace: [[0, 1, 0], [1, -4, 1], [0, 1, 0]], emboss: [[-2, -1, 0], [-1, 1, 1], [0, 1, 2]] };
for (const [name, K] of Object.entries(KS))
  for (const mode of ['zero', 'replicate', 'reflect']) {
    const out = conv(A, K, mode), flat = out.flat();
    console.log(`${name}/${mode}: sum ${flat.reduce((a, b) => a + b, 0)}, out(0,0) = ${out[0][0]}, out(5,4) = ${out[5][4]}, min ${Math.min(...flat)}, max ${Math.max(...flat)}`);
  }
