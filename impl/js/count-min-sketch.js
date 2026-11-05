const poly = (s, base, mod) => { let h = 0; for (const ch of s) h = (h * base + ch.charCodeAt(0)) % mod; return h; };

// d 列 × w 欄計數器；查詢取 d 個計數的最小值（只會高估，不會低估）
class CountMin {
  constructor(d = 3, w = 8) { this.d = d; this.w = w; this.t = Array.from({ length: d }, () => new Array(w).fill(0)); }
  cols(s) { const h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1; return Array.from({ length: this.d }, (_, i) => (h1 + i * h2) % this.w); }
  update(s, c = 1) { this.cols(s).forEach((j, i) => (this.t[i][j] += c)); }
  query(s) { return Math.min(...this.cols(s).map((j, i) => this.t[i][j])); }
}

const cm = new CountMin();
const truth = { apple: 5, banana: 2, cherry: 3, grape: 1, lemon: 4 };
for (const [k, v] of Object.entries(truth)) cm.update(k, v);
for (const row of cm.t) console.log(row.join(' '));
for (const k of ['apple', 'banana', 'cherry', 'grape', 'lemon', 'kiwi']) {
  const est = cm.query(k), real = truth[k] ?? 0;
  console.log(`${k}: estimate ${est}, true ${real}, ok ${est >= real ? 'True' : 'False'}`);
}
