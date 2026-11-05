const pw = (b, e, m) => { let r = 1n; b %= m; while (e) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; } return r; };
const md = (x, p) => ((x % p) + p) % p;

// 位元反轉 + 蝴蝶；單位根 w = g^((p−1)/len)，逆轉換用 w⁻¹ 並乘 n⁻¹
function ntt(a, invert, p, g) {
  const n = a.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j |= bit;
    if (i < j) [a[i], a[j]] = [a[j], a[i]];
  }
  for (let len = 2; len <= n; len <<= 1) {
    let w = pw(g, (p - 1n) / BigInt(len), p);
    if (invert) w = pw(w, p - 2n, p);
    for (let i = 0; i < n; i += len) {
      let wj = 1n;
      for (let k = 0; k < len / 2; k++) {
        const u = a[i + k], v = (a[i + k + len / 2] * wj) % p;
        a[i + k] = (u + v) % p;
        a[i + k + len / 2] = md(u - v, p);
        wj = (wj * w) % p;
      }
    }
  }
  if (invert) { const ninv = pw(BigInt(n), p - 2n, p); for (let i = 0; i < n; i++) a[i] = (a[i] * ninv) % p; }
}

function run(x, y, p, g) {
  const len = x.length + y.length - 1;
  let n = 1;
  while (n < len) n <<= 1;
  if ((p - 1n) % BigInt(n)) { console.log(`mod ${p}: length ${len} padded size does not divide p-1, cannot transform`); return; }
  const X = x.map((v) => md(BigInt(v), p)), Y = y.map((v) => md(BigInt(v), p));
  const A = [...X, ...new Array(n - X.length).fill(0n)], B = [...Y, ...new Array(n - Y.length).fill(0n)];
  ntt(A, false, p, g);
  ntt(B, false, p, g);
  const C = A.map((v, i) => (v * B[i]) % p);
  ntt(C, true, p, g);
  const N = new Array(len).fill(0n);
  X.forEach((u, i) => Y.forEach((v, j) => { N[i + j] = (N[i + j] + u * v) % p; }));
  const res = C.slice(0, len);
  console.log(`mod ${p}: ${res.join(' ')} (naive match ${res.every((v, i) => v === N[i]) ? 'True' : 'False'})`);
}

let s = 2024;
const rnd = () => (s = (s * 48271) % 2147483647);
const big1 = Array.from({ length: 10 }, () => rnd() % 998244353);
const big2 = Array.from({ length: 7 }, () => rnd() % 998244353);
run([1, 2, 3, 4], [5, 6, 7], 998244353n, 3n);
run([1, 2, 3, 4], [5, 6, 7], 17n, 3n);
run([3, -1, 4], [1, 5, 9, 2, 6], 97n, 5n);
run(big1, big2, 998244353n, 3n);
run(new Array(10).fill(1), new Array(10).fill(1), 17n, 3n);
