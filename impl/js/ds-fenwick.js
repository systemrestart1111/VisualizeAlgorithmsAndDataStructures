// t[i] 負責區間 (i - lowbit(i), i]；更新與前綴和都只走 O(log n) 個位置（索引從 1 開始）
class Fenwick {
  constructor(a) {
    this.n = a.length;
    this.t = new Array(this.n + 1).fill(0);
    a.forEach((v, i) => this.add(i + 1, v));
  }
  add(i, v) {
    for (; i <= this.n; i += i & -i) this.t[i] += v; // 往上走到下一個也涵蓋 i 的位置
  }
  prefix(i) {
    let s = 0;
    for (; i > 0; i -= i & -i) s += this.t[i]; // 去掉最低位的 1
    return s;
  }
  rangeSum(l, r) { return this.prefix(r) - this.prefix(l - 1); }
}

const f = new Fenwick([3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3, 1]);
console.log('t[1..12] =', f.t.slice(1).join(' '));
console.log('prefix(7) =', f.prefix(7));
console.log('sum[3, 9] =', f.rangeSum(3, 9));
f.add(5, 4); console.log('add +4 at 5');
console.log('prefix(7) =', f.prefix(7));
console.log('sum[3, 9] =', f.rangeSum(3, 9));
console.log('t[1..12] =', f.t.slice(1).join(' '));
