import java.util.Arrays;
import java.util.PriorityQueue;

public class AStar {
    static String[] GRID = {"S.....#.........", ".####.#.#######.", ".#....#.......#.", ".#.#######.##.#.", ".#..........#...",
                            ".#######.#.###.#", ".........#...#..", "########.####.#.", "..............#E"};
    static int R = GRID.length, C = GRID[0].length(), er, ec;
    static int[] DR = {0, 1, 0, -1}, DC = {1, 0, -1, 0};

    static int h(int r, int c) { return Math.abs(r - er) + Math.abs(c - ec); } // 曼哈頓距離：不會高估，因此 A* 保證最短

    // 依 f = g + h 由小到大展開（同分時比 h，再比座標）
    public static void main(String[] args) {
        char[][] grid = new char[R][];
        int sr = 0, sc = 0;
        for (int r = 0; r < R; r++) {
            grid[r] = GRID[r].toCharArray();
            for (int c = 0; c < C; c++) {
                if (grid[r][c] == 'S') { sr = r; sc = c; }
                if (grid[r][c] == 'E') { er = r; ec = c; }
            }
        }
        int[][] g = new int[R][C], par = new int[R][C];
        for (int[] row : g) Arrays.fill(row, 1 << 30);
        boolean[][] closed = new boolean[R][C];
        PriorityQueue<int[]> open = new PriorityQueue<>((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] != b[1] ? a[1] - b[1] : a[2] != b[2] ? a[2] - b[2] : a[3] - b[3]);
        g[sr][sc] = 0;
        open.add(new int[] {h(sr, sc), h(sr, sc), sr, sc});
        int expanded = 0;
        while (!open.isEmpty()) {
            int[] t = open.poll();
            int r = t[2], c = t[3];
            if (closed[r][c]) continue;
            closed[r][c] = true;
            expanded++;
            if (r == er && c == ec) break;
            for (int d = 0; d < 4; d++) {
                int nr = r + DR[d], nc = c + DC[d];
                if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#') continue;
                if (g[r][c] + 1 < g[nr][nc]) {
                    g[nr][nc] = g[r][c] + 1;
                    par[nr][nc] = r * C + c;
                    open.add(new int[] {g[nr][nc] + h(nr, nc), h(nr, nc), nr, nc});
                }
            }
        }
        System.out.println("path length = " + g[er][ec] + " expanded = " + expanded);
        for (int p = par[er][ec]; p != sr * C + sc; p = par[p / C][p % C]) grid[p / C][p % C] = '*';
        for (char[] row : grid) System.out.println(new String(row));
    }
}
