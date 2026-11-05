// 依大小合併、不做路徑壓縮；每次合併推入紀錄，可撤回到快照
class RollbackDSU {
  constructor(n) { this.p = [...Array(n).keys()]; this.sz = new Array(n).fill(1); this.hist = []; }
  find(x) { while (this.p[x] !== x) x = this.p[x]; return x; }
  union(x, y) {
    let rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;
    if (this.sz[rx] > this.sz[ry]) [rx, ry] = [ry, rx];
    this.p[rx] = ry;
    this.sz[ry] += this.sz[rx];
    this.hist.push([rx, ry]);
    return true;
  }
  snapshot() { return this.hist.length; }
  rollback(snap) {
    while (this.hist.length > snap) { const [rx, ry] = this.hist.pop(); this.p[rx] = rx; this.sz[ry] -= this.sz[rx]; }
  }
}

const d = new RollbackDSU(8);
d.union(0, 1); d.union(2, 3);
const s = d.snapshot();
d.union(1, 3); d.union(4, 5); d.union(5, 0);
console.log('parents:', d.p.join(' '), '| sizes:', d.sz.join(' '));
console.log('same(4, 2):', d.find(4) === d.find(2) ? 'True' : 'False');
d.rollback(s);
console.log('after rollback:', d.p.join(' '), '| sizes:', d.sz.join(' '));
console.log('same(4, 2):', d.find(4) === d.find(2) ? 'True' : 'False', '| same(0, 1):', d.find(0) === d.find(1) ? 'True' : 'False');
