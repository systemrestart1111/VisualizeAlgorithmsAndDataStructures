const GRID = ['S.....#.........', '.####.#.#######.', '.#....#.......#.', '.#.#######.##.#.', '.#..........#...',
              '.#######.#.###.#', '.........#...#..', '########.####.#.', '..............#E'];
const R = GRID.length, C = GRID[0].length;
const find = (ch) => { for (let r = 0; r < R; r++) { const c = GRID[r].indexOf(ch); if (c >= 0) return [r, c]; } };
const [sr, sc] = find('S'), [er, ec] = find('E');
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];
const h = (r, c) => Math.abs(r - er) + Math.abs(c - ec);
const less = (a, b) => { for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };

// 只看 h（離終點多近）來決定下一步：通常很快，但不保證最短路徑
const parent = new Map([[sr * C + sc, null]]);
const open = [[h(sr, sc), sr, sc]];
let expanded = 0;
while (open.length) {
  let best = 0;
  for (let i = 1; i < open.length; i++) if (less(open[i], open[best])) best = i;
  const [, r, c] = open[best];
  open[best] = open[open.length - 1];
  open.pop();
  expanded++;
  if (r === er && c === ec) break;
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc, nk = nr * C + nc;
    if (nr < 0 || nr >= R || nc < 0 || nc >= C || GRID[nr][nc] === '#' || parent.has(nk)) continue;
    parent.set(nk, r * C + c);
    open.push([h(nr, nc), nr, nc]);
  }
}
const rows = GRID.map((row) => [...row]);
let length = 1;
for (let p = parent.get(er * C + ec); p !== sr * C + sc; p = parent.get(p), length++) rows[Math.floor(p / C)][p % C] = '*';
console.log('path length =', length, 'expanded =', expanded);
console.log(rows.map((r) => r.join('')).join('\n'));
