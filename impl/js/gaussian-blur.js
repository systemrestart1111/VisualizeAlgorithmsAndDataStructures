const N = 16;
function noisy() {
  let s = 7;
  return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
    let v = 30;
    if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
    if ((r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96) v = 140;
    if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
    s = (s * 48271) % 2147483647;
    const t = s % 100;
    return t < 5 ? 0 : t < 10 ? 255 : v;
  }));
}
// 一維高斯：半徑 ⌈3σ⌉（最多 3），正規化成總和 1
function kernel(sigma) {
  const rad = Math.min(3, Math.ceil(3 * sigma));
  const k = Array.from({ length: 2 * rad + 1 }, (_, i) => Math.exp(-((i - rad) ** 2) / (2 * sigma * sigma)));
  let s = 0;
  for (const v of k) s += v;
  return k.map((v) => v / s);
}
const at = (a, r, c, zero) => (r >= 0 && r < N && c >= 0 && c < N ? a[r][c] : zero ? 0 : a[Math.min(N - 1, Math.max(0, r))][Math.min(N - 1, Math.max(0, c))]);
// 可分離：先水平再垂直
function blur(a, sigma, zero) {
  const k = kernel(sigma), rad = k.length >> 1;
  const h = a.map((row, r) => row.map((_, c) => { let s = 0; for (let j = -rad; j <= rad; j++) s += k[j + rad] * at(a, r, c + j, zero); return s; }));
  return h.map((row, r) => row.map((_, c) => { let s = 0; for (let i = -rad; i <= rad; i++) s += k[i + rad] * at(h, r + i, c, zero); return s; }));
}

const A = noisy();
for (const sigma of [0.6, 1.0, 2.0]) {
  const out = blur(A, sigma, false);
  let sum = 0;
  for (const v of out.flat()) sum += v;
  console.log(`sigma ${sigma.toFixed(1)}: kernel ${kernel(sigma).map((v) => v.toFixed(6)).join(' ')}`);
  console.log(`  out(5,4) = ${out[5][4].toFixed(3)}, out(8,8) = ${out[8][8].toFixed(3)}, out(0,0) = ${out[0][0].toFixed(3)}, sum = ${sum.toFixed(3)}`);
}
const C = Array.from({ length: N }, () => new Array(N).fill(120));
for (const zero of [false, true]) {
  const out = blur(C, 1.0, zero);
  console.log(`constant image, border ${zero ? 'zero' : 'replicate'}: max deviation ${Math.max(...out.flat().map((v) => Math.abs(v - 120))).toFixed(3)}`);
}
