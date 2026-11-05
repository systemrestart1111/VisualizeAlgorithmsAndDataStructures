import java.util.PriorityQueue;

public class GreedyBestFirst {
    static String[] GRID = {"S.....#.........", ".####.#.#######.", ".#....#.......#.", ".#.#######.##.#.", ".#..........#...",
                            ".#######.#.###.#", ".........#...#..", "########.####.#.", "..............#E"};
    static int R = GRID.length, C = GRID[0].length(), er, ec;
    static int[] DR = {0, 1, 0, -1}, DC = {1, 0, -1, 0};

    static int h(int r, int c) { return Math.abs(r - er) + Math.abs(c - ec); }

    // 只看 h（離終點多近）來決定下一步：通常很快，但不保證最短路徑
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
        int[][] par = new int[R][C];
        boolean[][] seen = new boolean[R][C];
        PriorityQueue<int[]> open = new PriorityQueue<>((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] != b[1] ? a[1] - b[1] : a[2] - b[2]);
        seen[sr][sc] = true;
        open.add(new int[] {h(sr, sc), sr, sc});
        int expanded = 0;
        while (!open.isEmpty()) {
            int[] t = open.poll();
            int r = t[1], c = t[2];
            expanded++;
            if (r == er && c == ec) break;
            for (int d = 0; d < 4; d++) {
                int nr = r + DR[d], nc = c + DC[d];
                if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#' || seen[nr][nc]) continue;
                seen[nr][nc] = true;
                par[nr][nc] = r * C + c;
                open.add(new int[] {h(nr, nc), nr, nc});
            }
        }
        int length = 1;
        for (int p = par[er][ec]; p != sr * C + sc; p = par[p / C][p % C], length++) grid[p / C][p % C] = '*';
        System.out.println("path length = " + length + " expanded = " + expanded);
        for (char[] row : grid) System.out.println(new String(row));
    }
}
