const poly = (s, base, mod) => { let h = 0; for (const ch of s) h = (h * base + ch.charCodeAt(0)) % mod; return h; };
const fmix32 = (h) => { h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; };

class HyperLogLog {
  constructor(p = 4) { this.p = p; this.m = 1 << p; this.M = new Array(this.m).fill(0); }
  add(s) {
    const x = fmix32(poly(s, 31, 4294967291));
    const j = x >>> (32 - this.p);              // 前 p 位選暫存器
    const w = (x << this.p) >>> 0;              // 其餘位元
    const rho = Math.min(32 - this.p + 1, Math.clz32(w) + 1);
    this.M[j] = Math.max(this.M[j], rho);
  }
  estimate() {
    const z = this.M.reduce((s, r) => s + 2 ** -r, 0);
    let e = (0.673 * this.m * this.m) / z;
    const v = this.M.filter((r) => r === 0).length;
    if (e <= 2.5 * this.m && v > 0) e = this.m * Math.log(this.m / v);   // 小基數：線性計數校正
    return e;
  }
}

for (const n of [5, 50, 1000, 20000]) {
  const h = new HyperLogLog();
  for (let i = 1; i <= n; i++) h.add(`item${i}`);
  for (let i = 1; i <= n; i += 2) h.add(`item${i}`);
  console.log(`n = ${n}: estimate ${h.estimate().toFixed(2)}, registers ${h.M.join(' ')}`);
}
