const N = 16;
const N4 = [[-1, 0], [0, -1], [0, 1], [1, 0]];

function terrain(name) {
  if (name === 'two basins') return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => Math.floor(Math.min((r - 4) ** 2 + (c - 4) ** 2, (r - 11) ** 2 + (c - 11) ** 2) / 4)));
  const B = Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => (r - 5.5) ** 2 + (c - 5) ** 2 <= 16 || (r - 9) ** 2 + (c - 10.5) ** 2 <= 16 || (r - 13) ** 2 + (c - 2.5) ** 2 <= 3.5));
  const bg = [];
  B.forEach((row, r) => row.forEach((v, c) => { if (!v) bg.push([r, c]); }));
  return B.map((row, r) => row.map((v, c) => (v ? -Math.floor(Math.min(...bg.map(([y, x]) => Math.hypot(y - r, x - c))) * 10 + 0.5) / 10 : 1)));
}

// 最小堆：先比高度，同高度比入列順序（先進先出）
class Heap {
  constructor() { this.a = []; }
  less(x, y) { return x[0] < y[0] || (x[0] === y[0] && x[1] < y[1]); }
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

// 區域極小值各給一個編號；優先佇列每次取最低者（同高度先進先出），把未標記的鄰居標成同一編號
function watershed(H) {
  const lab = H.map((row) => row.map(() => 0)), seen = H.map((row) => row.map(() => false));
  let n = 0;
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      if (seen[i][j]) continue;
      const comp = [[i, j]];
      seen[i][j] = true;
      let isMin = true;
      for (let k = 0; k < comp.length; k++)
        for (const [dy, dx] of N4) {
          const y = comp[k][0] + dy, x = comp[k][1] + dx;
          if (y < 0 || y >= N || x < 0 || x >= N) continue;
          if (H[y][x] < H[i][j]) isMin = false;
          else if (H[y][x] === H[i][j] && !seen[y][x]) { seen[y][x] = true; comp.push([y, x]); }
        }
      if (isMin) { n++; for (const [y, x] of comp) lab[y][x] = n; }
    }
  const heap = new Heap();
  let seq = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (lab[i][j]) heap.push([H[i][j], seq++, i, j]);
  while (heap.a.length) {
    const [, , i, j] = heap.pop();
    for (const [dy, dx] of N4) {
      const y = i + dy, x = j + dx;
      if (y >= 0 && y < N && x >= 0 && x < N && !lab[y][x]) { lab[y][x] = lab[i][j]; heap.push([H[y][x], seq++, y, x]); }
    }
  }
  return { n, lab };
}

for (const name of ['blob distance', 'two basins']) {
  const { n, lab } = watershed(terrain(name));
  const sizes = Array.from({ length: n }, (_, k) => lab.flat().filter((v) => v === k + 1).length).sort((x, y) => y - x);
  let boundary = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if ((c + 1 < N && lab[r][c + 1] !== lab[r][c]) || (r + 1 < N && lab[r + 1][c] !== lab[r][c])) boundary++;
  console.log(`${name}: ${n} regions, sizes [${sizes.join(', ')}], watershed boundary pixels ${boundary}`);
}
