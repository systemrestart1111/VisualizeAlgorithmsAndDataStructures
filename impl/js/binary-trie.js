const W = 5;
// 固定 W 位元，由高位到低位；每個節點記錄經過的數字個數，支援重複與刪除
class BinaryTrie {
  constructor() { this.ch = [[-1, -1]]; this.cnt = [0]; }
  add(x, d) {
    let u = 0;
    this.cnt[0] += d;
    for (let i = W - 1; i >= 0; i--) {
      const b = (x >> i) & 1;
      if (this.ch[u][b] < 0) { this.ch[u][b] = this.cnt.length; this.ch.push([-1, -1]); this.cnt.push(0); }
      u = this.ch[u][b];
      this.cnt[u] += d;
    }
  }
  // 每一位盡量走與 x 相反的分支
  maxXor(x) {
    let u = 0, y = 0;
    for (let i = W - 1; i >= 0; i--) {
      const b = (x >> i) & 1, v = this.ch[u][1 - b];
      if (v >= 0 && this.cnt[v] > 0) { u = v; y |= (1 - b) << i; }
      else { u = this.ch[u][b]; y |= b << i; }
    }
    return y;
  }
}

const t = new BinaryTrie();
for (const x of [3, 10, 5, 25, 2, 8]) t.add(x, 1);
for (const x of [5, 25, 7, 31, 0]) { const y = t.maxXor(x); console.log(`max xor with ${String(x).padStart(2)}: ${String(y).padStart(2)} -> ${x ^ y}`); }
t.add(25, -1);
const y = t.maxXor(5);
console.log(`after delete 25, max xor with 5: ${y} -> ${5 ^ y}`);
