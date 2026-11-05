// 每 B 個一塊並預存塊總和；查詢時完整的塊直接用總和，兩端零散元素逐一相加
class SqrtDecomposition {
  constructor(a, B = 4) {
    this.a = a.slice(); this.B = B;
    this.sums = Array.from({ length: Math.ceil(a.length / B) }, (_, b) => a.slice(b * B, (b + 1) * B).reduce((x, y) => x + y, 0));
  }
  set(i, v) { this.sums[Math.floor(i / this.B)] += v - this.a[i]; this.a[i] = v; }
  query(l, r) {
    let s = 0, i = l;
    while (i <= r) {
      if (i % this.B === 0 && i + this.B - 1 <= r) { s += this.sums[i / this.B]; i += this.B; }
      else s += this.a[i++];
    }
    return s;
  }
}

const d = new SqrtDecomposition([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3]);
console.log('blocks:', d.sums.join(' '));
console.log('sum[2, 13] =', d.query(2, 13));
d.set(5, 0);
console.log('after a[5] = 0, blocks:', d.sums.join(' '));
console.log('sum[4, 7] =', d.query(4, 7), '| sum[0, 15] =', d.query(0, 15), '| sum[9, 9] =', d.query(9, 9));
