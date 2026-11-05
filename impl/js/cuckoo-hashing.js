const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };

// 兩張表；鍵只能在 T1[x mod N] 或 T2[(x / N) mod N]。踢太多次視為循環，換更大的質數表重建
class Cuckoo {
  constructor(n = 7) { this.n = n; this.t = [new Array(n).fill(null), new Array(n).fill(null)]; }
  h(i, x) { return i === 0 ? x % this.n : Math.floor(x / this.n) % this.n; }
  find(x) { return this.t[0][this.h(0, x)] === x || this.t[1][this.h(1, x)] === x; }
  place(x) {
    let cur = x;
    for (let k = 0; k < 2 * this.n; k++)
      for (const i of [0, 1]) {
        const p = this.h(i, cur);
        [this.t[i][p], cur] = [cur, this.t[i][p]];
        if (cur === null) return null;
      }
    return cur;
  }
  insert(x) {
    if (this.find(x)) return;
    const left = this.place(x);
    if (left === null) return;
    const items = [...this.t.flat().filter((v) => v !== null), left];
    for (;;) {
      let n = this.n + 1;
      while (!isPrime(n)) n++;
      this.n = n;
      this.t = [new Array(n).fill(null), new Array(n).fill(null)];
      if (items.every((v) => this.place(v) === null)) break;
    }
    console.log(`  rehash -> N = ${this.n}`);
  }
  delete(x) { for (const i of [0, 1]) if (this.t[i][this.h(i, x)] === x) this.t[i][this.h(i, x)] = null; }
}

const c = new Cuckoo();
for (const x of [20, 50, 53, 75, 100, 67, 105, 3, 36, 39, 6]) { console.log('insert', x); c.insert(x); }
const show = (row) => row.map((v) => (v === null ? '.' : v)).join(' ');
console.log('T1:', show(c.t[0]));
console.log('T2:', show(c.t[1]));
console.log('find 36:', c.find(36) ? 'True' : 'False', '| find 37:', c.find(37) ? 'True' : 'False');
c.delete(36);
console.log('after delete 36, find 36:', c.find(36) ? 'True' : 'False');
