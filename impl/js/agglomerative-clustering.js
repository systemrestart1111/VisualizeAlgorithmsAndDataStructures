const PTS = [[1.8, 2.5], [3.1, 3.4], [2.2, 4.0], [3.0, 2.1], [6.4, 7.0], [7.6, 8.1], [7.2, 6.6], [6.6, 8.4], [8.1, 2.9], [7.0, 2.0], [7.9, 1.6]];
const d = (i, j) => Math.sqrt((PTS[i][0] - PTS[j][0]) ** 2 + (PTS[i][1] - PTS[j][1]) ** 2);
const setStr = (v) => `{${[...v].sort((a, b) => a - b).join(',')}}`;

// 最小堆：先比距離，再比群編號
class Heap {
  constructor() { this.a = []; }
  less(x, y) { return x[0] < y[0] || (x[0] === y[0] && (x[1] < y[1] || (x[1] === y[1] && x[2] < y[2]))); }
  push(it) { const a = this.a; a.push(it); let i = a.length - 1; while (i > 0 && this.less(it, a[(i - 1) >> 1])) { a[i] = a[(i - 1) >> 1]; i = (i - 1) >> 1; } a[i] = it; }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i, best = last;
        if (l < a.length && this.less(a[l], best)) { best = a[l]; m = l; }
        if (r < a.length && this.less(a[r], best)) { best = a[r]; m = r; }
        if (m === i) break;
        a[i] = a[m];
        i = m;
      }
      a[i] = last;
    }
    return top;
  }
}

// 最小堆存所有群對距離；取出時若有一群已被合併就略過（延遲刪除）
function agglomerative(linkage, k) {
  const n = PTS.length;
  const link = (A, B) => { const ds = A.flatMap((i) => B.map((j) => d(i, j))); return linkage === 'single' ? Math.min(...ds) : linkage === 'complete' ? Math.max(...ds) : ds.reduce((s, v) => s + v, 0) / ds.length; };
  const clusters = new Map(PTS.map((_, i) => [i, [i]]));
  const heap = new Heap();
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) heap.push([link([i], [j]), i, j]);
  let nxt = n;
  const merges = [], hist = [];
  while (clusters.size > 1) {
    const [dist, a, b] = heap.pop();
    if (!clusters.has(a) || !clusters.has(b)) continue;
    const A = clusters.get(a), B = clusters.get(b);
    clusters.delete(a); clusters.delete(b);
    merges.push(`${setStr(A)}+${setStr(B)}@${dist.toFixed(3)}`);
    hist.push([a, b]);
    clusters.set(nxt, [...A, ...B]);
    for (const [cid, mem] of clusters) if (cid !== nxt) heap.push([link(mem, [...A, ...B]), Math.min(cid, nxt), Math.max(cid, nxt)]);
    nxt++;
  }
  const groups = new Map(PTS.map((_, i) => [i, [i]]));
  hist.slice(0, n - k).forEach(([a, b], s) => { groups.set(n + s, [...groups.get(a), ...groups.get(b)]); groups.delete(a); groups.delete(b); });
  return { merges, groups: [...groups.values()].map((g) => [...g].sort((x, y) => x - y)).sort((x, y) => x[0] - y[0]) };
}

for (const linkage of ['single', 'complete', 'average']) {
  const { merges, groups } = agglomerative(linkage, 3);
  console.log(`${linkage}: ${merges.join(' ')}`);
  console.log(`  3 clusters: ${groups.map(setStr).join(' ')}`);
}
