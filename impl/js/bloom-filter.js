const poly = (s, base, mod) => { let h = 0; for (const ch of s) h = (h * base + ch.charCodeAt(0)) % mod; return h; };
// 雙重雜湊：h_i = (h1 + i·h2) mod m
const hashes = (s, k, m) => { const h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1; return Array.from({ length: k }, (_, i) => (h1 + i * h2) % m); };

class Bloom {
  constructor(m = 32, k = 3) { this.m = m; this.k = k; this.bits = new Array(m).fill(0); }
  add(s) { for (const p of hashes(s, this.k, this.m)) this.bits[p] = 1; }
  // 有任一位元為 0 → 確定不存在；全為 1 → 可能存在
  mightContain(s) { return hashes(s, this.k, this.m).every((p) => this.bits[p]); }
}

const bf = new Bloom();
const ins = ['apple', 'banana', 'cherry', 'grape'];
ins.forEach((w) => bf.add(w));
console.log('bits:', bf.bits.join(''));
for (const w of ['apple', 'banana', 'cherry', 'grape', 'kiwi', 'lemon', 'mango', 'peach', 'plum', 'fig']) {
  const maybe = bf.mightContain(w);
  console.log(`${w}: ${maybe ? 'maybe' : 'no'}${maybe && !ins.includes(w) ? ' (false positive)' : ''}`);
}
