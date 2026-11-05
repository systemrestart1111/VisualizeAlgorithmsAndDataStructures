const GRID = ['S..#....', '.#.#.##.', '.#...#..', '.####.#.', '......#E'];
const R = 5, C = 8, er = 4, ec = 7, FOUND = -1;
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const h = (r, c) => Math.abs(r - er) + Math.abs(c - ec);
const path = [0], inPath = new Set([0]);

// 深度優先，但 f = g + h 超過門檻就剪掉；回傳被剪掉的最小 f 作為下一輪門檻
function search(g, bound) {
  const u = path[path.length - 1], r = Math.floor(u / C), c = u % C;
  const f = g + h(r, c);
  if (f > bound) return f;
  if (r === er && c === ec) return FOUND;
  let mn = Infinity;
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc, v = nr * C + nc;
    if (nr < 0 || nr >= R || nc < 0 || nc >= C || GRID[nr][nc] === '#' || inPath.has(v)) continue;
    path.push(v);
    inPath.add(v);
    const t = search(g + 1, bound);
    if (t === FOUND) return FOUND;
    mn = Math.min(mn, t);
    path.pop();
    inPath.delete(v);
  }
  return mn;
}

// 疊代加深：門檻從 h(S) 開始，每輪提高到上一輪被剪掉的最小 f，記憶體只需 O(路徑長)
let bound = h(0, 0);
const bounds = [];
for (;;) {
  bounds.push(bound);
  const t = search(0, bound);
  if (t === FOUND || t === Infinity) break;
  bound = t;
}
console.log('bounds:', bounds.join(' '));
console.log('path length =', path.length - 1);
const rows = GRID.map((r) => [...r]);
for (const p of path.slice(1, -1)) rows[Math.floor(p / C)][p % C] = '*';
console.log(rows.map((r) => r.join('')).join('\n'));
