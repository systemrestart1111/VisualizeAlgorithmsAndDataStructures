// d[x] = val[x] − val[parent[x]]；路徑壓縮時把差值累加起來
class WeightedDSU {
  constructor(n) { this.p = [...Array(n).keys()]; this.d = new Array(n).fill(0); }
  find(x) {
    if (this.p[x] === x) return [x, 0];
    const [r, w] = this.find(this.p[x]);
    this.d[x] += w;
    this.p[x] = r;
    return [r, this.d[x]];
  }
  // 加入條件 val[x] − val[y] = w；與既有關係矛盾時回傳 false
  relate(x, y, w) {
    const [rx, dx] = this.find(x), [ry, dy] = this.find(y);
    if (rx === ry) return dx - dy === w;
    this.p[rx] = ry;
    this.d[rx] = w - dx + dy;
    return true;
  }
  diff(x, y) {
    const [rx, dx] = this.find(x), [ry, dy] = this.find(y);
    return rx === ry ? dx - dy : null;
  }
}

const u = new WeightedDSU(8);
for (const [x, y, w] of [[1, 0, 3], [2, 1, 2], [4, 3, -1], [5, 4, 4]]) u.relate(x, y, w);
for (const [x, y] of [[2, 0], [5, 3], [0, 2], [2, 5]]) console.log(`val[${x}] - val[${y}] =`, u.diff(x, y) ?? 'unknown');
console.log('relate(5, 2, 1):', u.relate(5, 2, 1) ? 'True' : 'False');
console.log('val[3] - val[0] =', u.diff(3, 0));
const a = u.relate(3, 0, 0), b = u.relate(3, 0, -4);
console.log('relate(3, 0, 0) consistent:', a ? 'True' : 'False', '| relate(3, 0, -4) consistent:', b ? 'True' : 'False');
