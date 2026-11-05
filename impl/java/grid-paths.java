public class GridPaths {
    public static void main(String[] args) {
        String[] grid = {"1312", "1#14", "4213", "21#1"}; // 只能往右或往下，# 為障礙
        int R = 4, C = 4, INF = 1_000_000;
        int[][] count = new int[R][C], best = new int[R][C];
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++) {
                best[r][c] = INF;
                if (grid[r].charAt(c) == '#') continue;
                int v = grid[r].charAt(c) - '0';
                if (r == 0 && c == 0) { count[r][c] = 1; best[r][c] = v; continue; }
                count[r][c] = (r > 0 ? count[r - 1][c] : 0) + (c > 0 ? count[r][c - 1] : 0);                 // 路徑數：上方 + 左方
                best[r][c] = Math.min(r > 0 ? best[r - 1][c] : INF, c > 0 ? best[r][c - 1] : INF) + v;      // 最小路徑和
            }
        System.out.println("paths = " + count[R - 1][C - 1] + "\nmin path sum = " + best[R - 1][C - 1]);
    }
}
