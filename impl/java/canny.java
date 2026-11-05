import java.util.*;

public class Canny {
    static final int N = 16;

    static double[][] preset(String name) {
        double[][] a = new double[N][N];
        long s = 7;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                if (name.equals("step")) { a[r][c] = (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0); continue; }
                int v = 30;
                if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
                if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
                if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
                if (name.equals("noisy")) { s = s * 48271 % 2147483647; int t = (int) (s % 100); v = t < 5 ? 0 : t < 10 ? 255 : v; }
                a[r][c] = v;
            }
        return a;
    }
    static int cl(int x) { return Math.min(N - 1, Math.max(0, x)); }

    // 高斯模糊 → Sobel → 沿梯度方向細化 → 雙門檻 → 從強邊 BFS 連結弱邊
    static void canny(String name, double[][] A, double lo, double hi) {
        double[] k = new double[7];
        double s = 0;
        for (int i = 0; i < 7; i++) { k[i] = Math.exp(-((i - 3) * (i - 3)) / 2.0); s += k[i]; }
        for (int i = 0; i < 7; i++) k[i] /= s;
        double[][] h = new double[N][N], B = new double[N][N], gx = new double[N][N], gy = new double[N][N], M = new double[N][N], thin = new double[N][N];
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int j = -3; j <= 3; j++) t += k[j + 3] * A[r][cl(c + j)]; h[r][c] = t; }
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int i = -3; i <= 3; i++) t += k[i + 3] * h[cl(r + i)][c]; B[r][c] = t; }
        double mx = 0;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                gx[r][c] = -B[cl(r - 1)][cl(c - 1)] + B[cl(r - 1)][cl(c + 1)] - 2 * B[r][cl(c - 1)] + 2 * B[r][cl(c + 1)] - B[cl(r + 1)][cl(c - 1)] + B[cl(r + 1)][cl(c + 1)];
                gy[r][c] = -B[cl(r - 1)][cl(c - 1)] - 2 * B[cl(r - 1)][c] - B[cl(r - 1)][cl(c + 1)] + B[cl(r + 1)][cl(c - 1)] + 2 * B[cl(r + 1)][c] + B[cl(r + 1)][cl(c + 1)];
                M[r][c] = Math.floor(Math.hypot(gx[r][c], gy[r][c]) * 10000 + 0.5) / 10000;
                mx = Math.max(mx, M[r][c]);
            }
        if (mx == 0) mx = 1;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                double ang = Math.toDegrees(Math.atan2(gy[r][c], gx[r][c]));
                if (ang < 0) ang += 180;
                int di, dj;
                if (ang < 22.5 || ang >= 157.5) { di = 0; dj = 1; } else if (ang < 67.5) { di = 1; dj = 1; } else if (ang < 112.5) { di = 1; dj = 0; } else { di = 1; dj = -1; }
                double n1 = r + di >= 0 && r + di < N && c + dj >= 0 && c + dj < N ? M[r + di][c + dj] : 0;
                double n2 = r - di >= 0 && r - di < N && c - dj >= 0 && c - dj < N ? M[r - di][c - dj] : 0;
                thin[r][c] = M[r][c] >= n1 && M[r][c] >= n2 ? M[r][c] : 0;
            }
        int[][] lab = new int[N][N];
        int strong = 0, weak = 0, promoted = 0, edges = 0;
        ArrayDeque<int[]> q = new ArrayDeque<>();
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                lab[r][c] = thin[r][c] >= hi * mx ? 2 : thin[r][c] >= lo * mx ? 1 : 0;
                if (lab[r][c] == 2) { strong++; q.add(new int[]{r, c}); }
                if (lab[r][c] == 1) weak++;
            }
        while (!q.isEmpty()) {
            int[] p = q.poll();
            for (int a = -1; a <= 1; a++)
                for (int b = -1; b <= 1; b++) {
                    int y = p[0] + a, x = p[1] + b;
                    if (y >= 0 && y < N && x >= 0 && x < N && lab[y][x] == 1) { lab[y][x] = 2; promoted++; q.add(new int[]{y, x}); }
                }
        }
        for (int[] row : lab) for (int v : row) if (v == 2) edges++;
        System.out.println(name + ", low " + lo + " high " + hi + ": strong " + strong + ", weak " + weak + ", promoted " + promoted + ", dropped " + (weak - promoted) + ", edge pixels " + edges);
    }

    public static void main(String[] args) {
        for (String name : new String[]{"shapes", "noisy", "step"}) {
            double[][] A = preset(name);
            canny(name, A, 0.15, 0.4);
            canny(name, A, 0.1, 0.3);
        }
    }
}
