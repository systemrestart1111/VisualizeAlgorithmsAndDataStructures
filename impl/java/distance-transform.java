import java.util.*;

public class DistanceTransform {
    static final int N = 16;

    static int[][] make(int t) {
        int[][] a = new int[N][N];
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++)
                a[r][c] = (t == 0 ? ((r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5)
                                  : ((r >= 2 && r <= 6 && c >= 2 && c <= 7) || (r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96)) ? 1 : 0;
        return a;
    }
    // 所有背景像素同時入列的多源 BFS：4 鄰接得 L1、8 鄰接得 L∞（都不是歐氏距離）
    static int[][] distance(int[][] B, int[][] nb) {
        final int INF = 1000000;
        int[][] d = new int[N][N];
        ArrayDeque<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { d[r][c] = B[r][c] == 1 ? INF : 0; if (B[r][c] == 0) q.add(new int[]{r, c}); }
        while (!q.isEmpty()) {
            int[] p = q.poll();
            for (int[] k : nb) {
                int y = p[0] + k[0], x = p[1] + k[1];
                if (y >= 0 && y < N && x >= 0 && x < N && d[y][x] == INF) { d[y][x] = d[p[0]][p[1]] + 1; q.add(new int[]{y, x}); }
            }
        }
        return d;
    }

    public static void main(String[] args) {
        int[][] D4 = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}}, D8 = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};
        String[] names = {"blobs", "shapes"};
        for (int t = 0; t < 2; t++) {
            int[][] B = make(t);
            for (int m = 0; m < 2; m++) {
                int[][] d = distance(B, m == 0 ? D4 : D8);
                int mx = 0;
                for (int[] row : d) for (int v : row) mx = Math.max(mx, v);
                int[] hist = new int[mx + 1];
                boolean ok = true;
                for (int r = 0; r < N; r++)
                    for (int c = 0; c < N; c++) {
                        if (d[r][c] > 0) hist[d[r][c]]++;
                        if (B[r][c] == 0) continue;
                        int best = Integer.MAX_VALUE;
                        for (int y = 0; y < N; y++) for (int x = 0; x < N; x++) if (B[y][x] == 0) { int dy = Math.abs(y - r), dx = Math.abs(x - c); best = Math.min(best, m == 0 ? dy + dx : Math.max(dy, dx)); }
                        if (best != d[r][c]) ok = false;
                    }
                StringBuilder sb = new StringBuilder();
                for (int k = 1; k <= mx; k++) sb.append(k > 1 ? ", " : "").append(hist[k]);
                System.out.println(names[t] + ", " + (m == 0 ? "L1" : "Linf") + ": max distance " + mx + ", pixels per distance [" + sb + "], matches brute force " + (ok ? "True" : "False"));
            }
        }
    }
}
