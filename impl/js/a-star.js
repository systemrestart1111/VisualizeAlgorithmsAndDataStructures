const GRID = ['S.....#.........', '.####.#.#######.', '.#....#.......#.', '.#.#######.##.#.', '.#..........#...',
              '.#######.#.###.#', '.........#...#..', '########.####.#.', '..............#E'];
const R = GRID.length, C = GRID[0].length;
const find = (ch) => { for (let r = 0; r < R; r++) { const c = GRID[r].indexOf(ch); if (c >= 0) return [r, c]; } };
const [sr, sc] = find('S'), [er, ec] = find('E');
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const h = (r, c) => Math.abs(r - er) + Math.abs(c - ec); // 曼哈頓距離：不會高估，因此 A* 保證最短
const less = (a, b) => { for (let i = 0; i < 4; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };

// 依 f = g + h 由小到大展開（同分時比 h，再比座標）；開放串列用線性掃描取最小
const g = new Map([[sr * C + sc, 0]]), parent = new Map(), closed = new Set();
const open = [[h(sr, sc), h(sr, sc), sr, sc]];
let expanded = 0;
while (open.length) {
  let best = 0;
  for (let i = 1; i < open.length; i++) if (less(open[i], open[best])) best = i;
  const [, , r, c] = open[best];
  open[best] = open[open.length - 1];
  open.pop();
  const k = r * C + c;
  if (closed.has(k)) continue;
  closed.add(k);
  expanded++;
  if (r === er && c === ec) break;
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc, nk = nr * C + nc;
    if (nr < 0 || nr >= R || nc < 0 || nc >= C || GRID[nr][nc] === '#') continue;
    if (g.get(k) + 1 < (g.get(nk) ?? Infinity)) {
      g.set(nk, g.get(k) + 1);
      parent.set(nk, k);
      open.push([g.get(nk) + h(nr, nc), h(nr, nc), nr, nc]);
    }
  }
}
console.log('path length =', g.get(er * C + ec), 'expanded =', expanded);
const rows = GRID.map((row) => [...row]);
for (let p = parent.get(er * C + ec); p !== sr * C + sc; p = parent.get(p)) rows[Math.floor(p / C)][p % C] = '*';
console.log(rows.map((r) => r.join('')).join('\n'));
