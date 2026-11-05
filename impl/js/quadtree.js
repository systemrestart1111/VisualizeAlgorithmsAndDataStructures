const CAP = 1, MAXD = 5;
class QT {
  constructor(x0, y0, s, depth) { Object.assign(this, { x0, y0, s, depth }); this.pts = []; this.kids = null; }
  // 葉格滿了且未達最大深度就分成四格，原本的點往下移
  insert(p) {
    if (!this.kids) {
      if (this.pts.length < CAP || this.depth >= MAXD) { this.pts.push(p); return; }
      const h = this.s / 2;
      this.kids = [[0, 0], [h, 0], [0, h], [h, h]].map(([dx, dy]) => new QT(this.x0 + dx, this.y0 + dy, h, this.depth + 1));
      const old = this.pts;
      this.pts = [];
      for (const q of old) this.insert(q);
    }
    const h = this.s / 2;
    const k = (p[0] >= this.x0 + h ? 1 : 0) + (p[1] >= this.y0 + h ? 2 : 0);
    this.kids[k].insert(p);
  }
  // 只走進與查詢矩形相交的格子；回傳拜訪的格子數
  range(x1, y1, x2, y2, out) {
    if (this.x0 > x2 || this.x0 + this.s <= x1 || this.y0 > y2 || this.y0 + this.s <= y1) return 0;
    for (const p of this.pts) if (p[0] >= x1 && p[0] <= x2 && p[1] >= y1 && p[1] <= y2) out.push(p);
    return 1 + (this.kids ?? []).reduce((v, c) => v + c.range(x1, y1, x2, y2, out), 0);
  }
  count() { return 1 + (this.kids ?? []).reduce((c, k) => c + k.count(), 0); }
}

const root = new QT(0, 0, 64, 0);
for (const p of [[10, 10], [50, 12], [20, 40], [30, 35], [55, 55], [8, 52], [40, 20], [45, 22], [45, 22], [45, 22]]) root.insert(p);
console.log('cells:', root.count());
for (const r of [[10, 10, 40, 40], [40, 10, 63, 30], [0, 0, 63, 63], [60, 0, 63, 5]]) {
  const out = [];
  const v = root.range(...r, out);
  out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  console.log(`range (${r.join(', ')}): ${out.length} points [${out.map((p) => `(${p[0]}, ${p[1]})`).join(', ')}] visited ${v}`);
}
