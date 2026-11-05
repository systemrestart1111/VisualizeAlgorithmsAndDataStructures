// 節點存在陣列中（{sum, l, r}）；更新只複製根到葉的路徑，其餘子樹共用
class PersistentSegTree {
  constructor(a) { this.n = a.length; this.nodes = []; this.roots = [this.build(a, 0, this.n - 1)]; }
  mk(sum, l = -1, r = -1) { this.nodes.push({ sum, l, r }); return this.nodes.length - 1; }
  build(a, lo, hi) {
    if (lo === hi) return this.mk(a[lo]);
    const m = (lo + hi) >> 1, L = this.build(a, lo, m), R = this.build(a, m + 1, hi);
    return this.mk(this.nodes[L].sum + this.nodes[R].sum, L, R);
  }
  update(node, lo, hi, i, v) {
    if (lo === hi) return this.mk(v);
    const m = (lo + hi) >> 1;
    let { l: L, r: R } = this.nodes[node];
    if (i <= m) L = this.update(L, lo, m, i, v); else R = this.update(R, m + 1, hi, i, v);
    return this.mk(this.nodes[L].sum + this.nodes[R].sum, L, R);
  }
  // 以最新版本為基礎建立新版本
  set(i, v) { this.roots.push(this.update(this.roots.at(-1), 0, this.n - 1, i, v)); }
  query(ver, l, r) {
    const go = (node, lo, hi) => {
      if (r < lo || hi < l) return 0;
      if (l <= lo && hi <= r) return this.nodes[node].sum;
      const m = (lo + hi) >> 1;
      return go(this.nodes[node].l, lo, m) + go(this.nodes[node].r, m + 1, hi);
    };
    return go(this.roots[ver], 0, this.n - 1);
  }
}

const t = new PersistentSegTree([4, 1, 3, 5, 2, 6, 1, 3]);
t.set(2, 7);
t.set(5, 0);
for (let v = 0; v < 3; v++) console.log(`version ${v}: sum[0,7] = ${t.query(v, 0, 7)}, sum[2,5] = ${t.query(v, 2, 5)}`);
console.log(`total nodes: ${t.nodes.length} (15 + 4 + 4)`);
