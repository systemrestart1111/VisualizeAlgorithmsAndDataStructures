const N = 16;
const clean = [], A = [];
let s = 7;
for (let r = 0; r < N; r++) {
  clean.push([]); A.push([]);
  for (let c = 0; c < N; c++) {
    let v = 30;
    if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
    if ((r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96) v = 140;
    if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
    clean[r].push(v);
    s = (s * 48271) % 2147483647;
    const t = s % 100;
    A[r].push(t < 5 ? 0 : t < 10 ? 255 : v);
  }
}
const cl = (x) => Math.min(N - 1, Math.max(0, x));
const window = (a, r, c, rad) => { const w = []; for (let i = -rad; i <= rad; i++) for (let j = -rad; j <= rad; j++) w.push(a[cl(r + i)][cl(c + j)]); return w; };
// 每個像素換成視窗內的中位數（邊界複製）；對照平均濾波
const median = (a, rad) => a.map((row, r) => row.map((_, c) => { const w = window(a, r, c, rad).sort((x, y) => x - y); return w[w.length >> 1]; }));
const mean = (a, rad) => a.map((row, r) => row.map((_, c) => window(a, r, c, rad).reduce((x, y) => x + y, 0) / (2 * rad + 1) ** 2));
const noise = (a) => a.flat().filter((v) => v === 0 || v === 255).length;
const bad = (a) => a.flat().filter((v, i) => Math.abs(v - clean.flat()[i]) > 40).length;

console.log(`input: ${noise(A)} impulse pixels, ${bad(A)} pixels off by > 40`);
for (const rad of [1, 2]) {
  const m = median(A, rad), avg = mean(A, rad);
  console.log(`${2 * rad + 1}x${2 * rad + 1}: median leaves ${noise(m)} impulses, ${bad(m)} off by > 40 (sum ${m.flat().reduce((x, y) => x + y, 0)}); mean filter ${bad(avg)} off by > 40`);
}
