import java.util.*;

public class ShiTomasi {
    static final int N = 16;

    static double[][] preset(boolean checker) {
        double[][] a = new double[N][N];
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                if (checker) { a[r][c] = ((r >> 2) + (c >> 2)) % 2 == 1 ? 210 : 40; continue; }
                int v = 30;
                if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
                if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
                if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
                a[r][c] = v;
            }
        return a;
    }
    static int cl(int x) { return Math.min(N - 1, Math.max(0, x)); }
    static double[][] blur1(double[][] a) {
        double[] k = new double[7];
        double s = 0;
        for (int i = 0; i < 7; i++) { k[i] = Math.exp(-((i - 3) * (i - 3)) / 2.0); s += k[i]; }
        for (int i = 0; i < 7; i++) k[i] /= s;
        double[][] h = new double[N][N], out = new double[N][N];
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int j = -3; j <= 3; j++) t += k[j + 3] * a[r][cl(c + j)]; h[r][c] = t; }
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int i = -3; i <= 3; i++) t += k[i + 3] * h[cl(r + i)][c]; out[r][c] = t; }
        return out;
    }

    // λmin = trace/2 − √((Sxx−Syy)²/4 + Sxy²)；依分數由大到小貪婪挑選，保持最小間距
    static void shiTomasi(String name, double[][] A, double q, int dist) {
        double[][] xx = new double[N][N], yy = new double[N][N], xy = new double[N][N];
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                double ix = (-A[cl(r - 1)][cl(c - 1)] + A[cl(r - 1)][cl(c + 1)] - 2 * A[r][cl(c - 1)] + 2 * A[r][cl(c + 1)] - A[cl(r + 1)][cl(c - 1)] + A[cl(r + 1)][cl(c + 1)]) / 8;
                double iy = (-A[cl(r - 1)][cl(c - 1)] - 2 * A[cl(r - 1)][c] - A[cl(r - 1)][cl(c + 1)] + A[cl(r + 1)][cl(c - 1)] + 2 * A[cl(r + 1)][c] + A[cl(r + 1)][cl(c + 1)]) / 8;
                xx[r][c] = ix * ix; yy[r][c] = iy * iy; xy[r][c] = ix * iy;
            }
        double[][] Sxx = blur1(xx), Syy = blur1(yy), Sxy = blur1(xy), lam = new double[N][N];
        double mx = -Double.MAX_VALUE;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                double d = (Sxx[r][c] - Syy[r][c]) / 2;
                lam[r][c] = Math.floor(((Sxx[r][c] + Syy[r][c]) / 2 - Math.sqrt(d * d + Sxy[r][c] * Sxy[r][c])) * 1000 + 0.5) / 1000;
                mx = Math.max(mx, lam[r][c]);
            }
        List<int[]> cand = new ArrayList<>(), chosen = new ArrayList<>();
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) if (mx > 0 && lam[r][c] >= q * mx) cand.add(new int[]{r, c});
        cand.sort((a, b) -> lam[a[0]][a[1]] != lam[b[0]][b[1]] ? Double.compare(lam[b[0]][b[1]], lam[a[0]][a[1]]) : a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
        for (int[] p : cand) {
            boolean ok = true;
            for (int[] s : chosen) if (Math.hypot(p[0] - s[0], p[1] - s[1]) < dist) ok = false;
            if (ok) chosen.add(p);
        }
        StringBuilder sb = new StringBuilder(String.format("%s, quality %.1f, min distance %d: %d candidates, %d chosen:", name, q, dist, cand.size(), chosen.size()));
        for (int[] p : chosen) sb.append(" (").append(p[0]).append(',').append(p[1]).append(')');
        System.out.println(sb);
    }

    public static void main(String[] args) {
        double[][] ch = preset(true), sh = preset(false);
        shiTomasi("checker", ch, 0.1, 3);
        shiTomasi("checker", ch, 0.1, 5);
        shiTomasi("checker", ch, 0.3, 3);
        shiTomasi("shapes", sh, 0.1, 3);
    }
}
