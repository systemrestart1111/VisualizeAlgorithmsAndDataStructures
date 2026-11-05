// 線性探測 + 劫富濟貧：遇到探測距離比自己小的元素就交換；刪除用後移
class RobinHood {
  constructor(m = 11) { this.m = m; this.t = new Array(m).fill(null); }
  find(x) {
    for (let i = x % this.m, d = 0; d < this.m; i = (i + 1) % this.m, d++) {
      const s = this.t[i];
      if (!s || s.d < d) return -1;
      if (s.k === x) return i;
    }
    return -1;
  }
  insert(x) {
    if (this.find(x) >= 0) return;
    let cur = { k: x, d: 0 };
    for (let i = x % this.m; ; i = (i + 1) % this.m) {
      const s = this.t[i];
      if (!s) { this.t[i] = cur; return; }
      if (s.d < cur.d) { this.t[i] = cur; cur = s; }
      cur = { k: cur.k, d: cur.d + 1 };
    }
  }
  delete(x) {
    let i = this.find(x);
    if (i < 0) return;
    this.t[i] = null;
    for (let j = (i + 1) % this.m; this.t[j] && this.t[j].d > 0; i = j, j = (j + 1) % this.m) {
      this.t[i] = { k: this.t[j].k, d: this.t[j].d - 1 };
      this.t[j] = null;
    }
  }
  show() { return this.t.map((s) => (s ? `${s.k}/${s.d}` : '.')).join(' '); }
}

const r = new RobinHood();
for (const x of [22, 33, 1, 12, 44, 5, 16, 27]) r.insert(x);
console.log('table:', r.show());
console.log('find 27:', r.find(27), '| find 9:', r.find(9));
r.delete(33);
console.log('after delete 33:', r.show());
console.log('find 44:', r.find(44), '| find 27:', r.find(27));
