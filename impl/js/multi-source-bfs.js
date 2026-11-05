const GRID = ['S....#....', '.##..#.##.', '....#....S', '.#.....#..', '.#.##.....', '...#...S..'];

// 所有起點同時入佇列、距離 0，第一次碰到某格時就是到最近起點的距離
function multiBfs(grid) {
  const R = grid.length, C = grid[0].length;
  const dist = Array.from({ length: R }, () => new Array(C).fill(-1));
  const q = [];
  for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) if (grid[i][j] === 'S') { dist[i][j] = 0; q.push([i, j]); }
  for (let h = 0; h < q.length; h++) {
    const [i, j] = q[h];
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj;
      if (a < 0 || b < 0 || a >= R || b >= C || grid[a][b] === '#' || dist[a][b] >= 0) continue;
      dist[a][b] = dist[i][j] + 1;
      q.push([a, b]);
    }
  }
  return dist;
}

const dist = multiBfs(GRID);
dist.forEach((row, i) => console.log(row.map((d, j) => (GRID[i][j] === '#' ? ' #' : d < 0 ? ' .' : String(d).padStart(2))).join(' ')));
console.log('farthest cell distance:', Math.max(...dist.flat()));
