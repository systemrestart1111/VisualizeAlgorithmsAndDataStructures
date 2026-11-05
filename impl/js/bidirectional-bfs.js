const GRID = ['S.....#.........', '.####.#.#######.', '.#....#.......#.', '.#.#######.##.#.', '.#..........#...',
              '.#######.#.###.#', '.........#...#..', '########.####.#.', '..............#E'];
const R = GRID.length, C = GRID[0].length;
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
let best = null; // [長度, 接合格]

// 把一側展開一整層；若碰到另一側已拜訪的格子，記下最短的接合點
function expand(frontier, dist, other) {
  const nxt = [];
  for (const u of frontier) {
    const r = Math.floor(u / C), c = u % C;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc, v = nr * C + nc;
      if (nr < 0 || nr >= R || nc < 0 || nc >= C || GRID[nr][nc] === '#') continue;
      if (other.has(v)) {
        const cand = dist.get(u) + 1 + other.get(v);
        if (!best || cand < best[0]) best = [cand, v];
      }
      if (!dist.has(v)) { dist.set(v, dist.get(u) + 1); nxt.push(v); }
    }
  }
  return nxt;
}

// 從起點與終點同時做 BFS，每次展開較小的那一側；兩邊相遇時即得最短路徑
const ds = new Map(), de = new Map();
let fs = [], fe = [];
GRID.forEach((row, r) => [...row].forEach((ch, c) => {
  if (ch === 'S') { fs.push(r * C + c); ds.set(r * C + c, 0); }
  if (ch === 'E') { fe.push(r * C + c); de.set(r * C + c, 0); }
}));
while (fs.length && fe.length) {
  if (fs.length <= fe.length) fs = expand(fs, ds, de);
  else fe = expand(fe, de, ds);
  if (best) break;
}
console.log('path length =', best[0]);
console.log(`meet at (${Math.floor(best[1] / C)}, ${best[1] % C})`);
console.log('visited cells =', ds.size + de.size);
