const MAZE = ['S.#.......#.....', '.##.#####.#.###.', '....#...#...#...', '.####.#.#####.#.', '......#.......#.',
              '#######.#####.#.', '......#.#.....#.', '.####.#.#.#####.', '.#....#...#....E'];
const R = MAZE.length, C = MAZE[0].length;
const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // 右、下、左、上
const grid = MAZE.map((row) => [...row]);
const seen = new Set();

// 往四個方向深入；走到死路就退回上一格換方向（回溯），到達 E 時整條路徑都還在遞迴堆疊上
function dfs(r, c) {
  if (grid[r][c] === 'E') return true;
  seen.add(r * C + c);
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] === '#' || seen.has(nr * C + nc)) continue;
    if (grid[nr][nc] === '.') grid[nr][nc] = '*';
    if (dfs(nr, nc)) return true;
    if (grid[nr][nc] === '*') grid[nr][nc] = '.';
  }
  return false;
}

const found = dfs(0, 0);
const len = grid.flat().filter((ch) => ch === '*').length + 1;
console.log('found:', found ? 'True' : 'False', 'path length =', len);
console.log(grid.map((row) => row.join('')).join('\n'));
