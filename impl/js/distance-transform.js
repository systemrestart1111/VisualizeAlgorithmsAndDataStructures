const N = 16;
const N4 = [[-1, 0], [0, -1], [0, 1], [1, 0]];
const N8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const blobs = () => Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => ((r - 5.5) ** 2 + (c - 5) ** 2 <= 16 || (r - 9) ** 2 + (c - 10.5) ** 2 <= 16 || (r - 13) ** 2 + (c - 2.5) ** 2 <= 3.5 ? 1 : 0)));
const shapesBin = () => Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => ((r >= 2 && r <= 6 && c >= 2 && c <= 7) || (r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96 ? 1 : 0)));

// 所有背景像素同時入列的多源 BFS：4 鄰接得 L1、8 鄰接得 L∞（都不是歐氏距離）
function distance(B, nb) {
  const INF = 1e9, d = B.map((row) => row.map((v) => (v ? INF : 0)));
  const q = [];
  B.forEach((row, r) => row.forEach((v, c) => { if (!v) q.push([r, c]); }));
  for (let qi = 0; qi < q.length; qi++) {
    const [r, c] = q[qi];
    for (const [dr, dc] of nb) {
      const y = r + dr, x = c + dc;
      if (y >= 0 && y < N && x >= 0 && x < N && d[y][x] === INF) { d[y][x] = d[r][c] + 1; q.push([y, x]); }
    }
  }
  return d;
}

for (const [name, B] of [['blobs', blobs()], ['shapes', shapesBin()]]) {
  const bg = [];
  B.forEach((row, r) => row.forEach((v, c) => { if (!v) bg.push([r, c]); }));
  for (const [metric, nb] of [['L1', N4], ['Linf', N8]]) {
    const d = distance(B, nb);
    const mx = Math.max(...d.flat());
    const hist = Array.from({ length: mx }, (_, k) => d.flat().filter((v) => v === k + 1).length);
    const f = metric === 'L1' ? (y, x, r, c) => Math.abs(y - r) + Math.abs(x - c) : (y, x, r, c) => Math.max(Math.abs(y - r), Math.abs(x - c));
    let ok = true;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (B[r][c] && d[r][c] !== Math.min(...bg.map(([y, x]) => f(y, x, r, c)))) ok = false;
    console.log(`${name}, ${metric}: max distance ${mx}, pixels per distance [${hist.join(', ')}], matches brute force ${ok ? 'True' : 'False'}`);
  }
}
