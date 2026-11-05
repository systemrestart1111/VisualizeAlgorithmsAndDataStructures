const poly = (s, base, mod) => { let h = 0; for (const ch of s) h = (h * base + ch.charCodeAt(0)) % mod; return h; };
const hashes = (s, k, m) => { const h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1; return Array.from({ length: k }, (_, i) => (h1 + i * h2) % m); };

// 每格是 4 位元計數器（上限 15）：飽和後不再增減，避免溢位造成漏判
class CountingBloom {
  constructor(m = 16, k = 3) { this.m = m; this.k = k; this.c = new Array(m).fill(0); this.MAX = 15; }
  add(s) { for (const p of hashes(s, this.k, this.m)) if (this.c[p] < this.MAX) this.c[p]++; }
  query(s) { return hashes(s, this.k, this.m).every((p) => this.c[p] > 0); }
  remove(s) {
    if (!this.query(s)) return false; // 確定不存在：拒絕刪除
    for (const p of hashes(s, this.k, this.m)) if (this.c[p] < this.MAX) this.c[p]--;
    return true;
  }
}

const cb = new CountingBloom();
['apple', 'banana', 'cherry'].forEach((w) => cb.add(w));
console.log('counters:', cb.c.join(' '));
console.log('remove banana:', cb.remove('banana') ? 'True' : 'False');
console.log('counters:', cb.c.join(' '));
for (const w of ['apple', 'banana', 'cherry', 'kiwi']) console.log(`${w}: ${cb.query(w) ? 'maybe' : 'no'}`);
console.log('remove kiwi:', cb.remove('kiwi') ? 'True' : 'False');
for (let i = 0; i < 20; i++) cb.add('apple');
console.log('after 20 more apple:', cb.c.join(' '));
