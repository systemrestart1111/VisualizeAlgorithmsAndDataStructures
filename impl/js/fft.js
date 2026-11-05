// 迭代版 Cooley–Tukey：先做位元反轉排列，再由長度 2、4、8… 逐層做蝴蝶運算，O(n log n)
// 以 re[]、im[] 兩個陣列表示複數
function fft(re, im, invert) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { // 位元反轉
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j |= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = ((2 * Math.PI) / len) * (invert ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const p = i + k, q = i + k + len / 2;
        const vr = re[q] * cr - im[q] * ci, vi = re[q] * ci + im[q] * cr;
        re[q] = re[p] - vr; im[q] = im[p] - vi;
        re[p] += vr; im[p] += vi;
        [cr, ci] = [cr * wr - ci * wi, cr * wi + ci * wr];
      }
    }
  }
  if (invert) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}

// 在「點值表示」下多項式相乘只需逐點相乘：FFT → 相乘 → 逆 FFT
function multiply(A, B) {
  let n = 1;
  while (n < A.length + B.length - 1) n <<= 1;
  const ar = [...A, ...new Array(n - A.length).fill(0)], ai = new Array(n).fill(0);
  const br = [...B, ...new Array(n - B.length).fill(0)], bi = new Array(n).fill(0);
  fft(ar, ai, false);
  fft(br, bi, false);
  for (let i = 0; i < n; i++) [ar[i], ai[i]] = [ar[i] * br[i] - ai[i] * bi[i], ar[i] * bi[i] + ai[i] * br[i]];
  fft(ar, ai, true);
  return ar.slice(0, A.length + B.length - 1).map(Math.round);
}

console.log('A x B =', multiply([1, 2, 3], [4, 5, 6]).join(' ')); // 係數由低次到高次
