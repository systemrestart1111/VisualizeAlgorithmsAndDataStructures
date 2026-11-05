// 區間加值 + 區間求和；lazy[o] 記錄「整段都要加、但還沒往下推」的值，兩種操作都是 O(log n)
class SegmentTree {
  constructor(a) {
    this.n = a.length;
    this.sum = new Array(4 * this.n).fill(0);
    this.lazy = new Array(4 * this.n).fill(0);
    this.build(1, 0, this.n - 1, a);
  }
  build(o, l, r, a) {
    if (l === r) { this.sum[o] = a[l]; return; }
    const m = (l + r) >> 1;
    this.build(2 * o, l, m, a);
    this.build(2 * o + 1, m + 1, r, a);
    this.sum[o] = this.sum[2 * o] + this.sum[2 * o + 1];
  }
  apply(o, l, r, v) {
    this.sum[o] += v * (r - l + 1);
    this.lazy[o] += v;
  }
  push(o, l, r) {
    if (this.lazy[o]) { // 要往下走之前，才把延遲的加值交給兩個子節點
      const m = (l + r) >> 1;
      this.apply(2 * o, l, m, this.lazy[o]);
      this.apply(2 * o + 1, m + 1, r, this.lazy[o]);
      this.lazy[o] = 0;
    }
  }
  add(ql, qr, v, o = 1, l = 0, r = this.n - 1) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { this.apply(o, l, r, v); return; } // 整段被覆蓋：只更新這個節點並記下 lazy
    this.push(o, l, r);
    const m = (l + r) >> 1;
    this.add(ql, qr, v, 2 * o, l, m);
    this.add(ql, qr, v, 2 * o + 1, m + 1, r);
    this.sum[o] = this.sum[2 * o] + this.sum[2 * o + 1];
  }
  query(ql, qr, o = 1, l = 0, r = this.n - 1) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return this.sum[o];
    this.push(o, l, r);
    const m = (l + r) >> 1;
    return this.query(ql, qr, 2 * o, l, m) + this.query(ql, qr, 2 * o + 1, m + 1, r);
  }
}

const show = (st) => console.log(`array: [${Array.from({ length: st.n }, (_, i) => st.query(i, i)).join(' ')}]`);

const st = new SegmentTree([5, 8, 6, 3, 2, 7, 2, 6]);
show(st);
console.log('sum[2, 5] =', st.query(2, 5));
st.add(1, 4, 3); console.log('add +3 on [1, 4]');
console.log('sum[0, 7] =', st.query(0, 7));
console.log('sum[3, 6] =', st.query(3, 6));
st.add(4, 7, -2); console.log('add -2 on [4, 7]');
show(st);
console.log('sum[0, 7] =', st.query(0, 7));
