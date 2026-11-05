import java.util.*;

public class FloodFill {
    // 外框（色 2）左上角缺一格，內部只能斜著碰到外面
    static int[][] grid() {
        int[][] a = new int[12][12];
        for (int i = 0; i < 12; i++) for (int j = 0; j < 12; j++) a[i][j] = i >= 2 && i <= 9 && j >= 2 && j <= 9 && (i == 2 || i == 9 || j == 2 || j == 9) ? 2 : 1;
        a[2][2] = 1;
        for (int i = 5; i <= 6; i++) for (int j = 5; j <= 6; j++) a[i][j] = 3;
        return a;
    }
    // BFS 把與種子相連、顏色相同的格子塗成新顏色；新舊色相同時直接結束
    static int flood(int[][] a, int sr, int sc, int nw, int conn) {
        int[][] nb = conn == 4 ? new int[][]{{-1, 0}, {0, -1}, {0, 1}, {1, 0}} : new int[][]{{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};
        int old = a[sr][sc];
        if (old == nw) return 0;
        a[sr][sc] = nw;
        ArrayDeque<int[]> q = new ArrayDeque<>();
        q.add(new int[]{sr, sc});
        int count = 1;
        while (!q.isEmpty()) {
            int[] p = q.poll();
            for (int[] d : nb) {
                int y = p[0] + d[0], x = p[1] + d[1];
                if (y >= 0 && y < 12 && x >= 0 && x < 12 && a[y][x] == old) { a[y][x] = nw; count++; q.add(new int[]{y, x}); }
            }
        }
        return count;
    }

    public static void main(String[] args) {
        int[][] tests = {{4, 4, 4, 4}, {4, 4, 4, 8}, {0, 0, 5, 4}, {5, 5, 3, 4}, {5, 5, 1, 8}, {2, 5, 4, 4}};
        for (int[] t : tests) {
            int[][] a = grid();
            int n = flood(a, t[0], t[1], t[2], t[3]), sum = 0;
            for (int[] row : a) for (int v : row) sum += v;
            System.out.println("seed (" + t[0] + "," + t[1] + ") -> color " + t[2] + ", " + t[3] + "-connected: " + n + " cells filled" + (n == 0 ? " (same color, nothing to do)" : "") + ", grid sum " + sum);
        }
    }
}
