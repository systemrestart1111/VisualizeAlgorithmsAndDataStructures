public class HarrisCorner {
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

    // 結構張量 M（高斯加權），R = det(M) − k·trace(M)²；R 四捨五入成整數後做 3×3 非極大值抑制
    static void harris(String name, double[][] A, double k) {
        double[][] xx = new double[N][N], yy = new double[N][N], xy = new double[N][N];
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                double ix = (-A[cl(r - 1)][cl(c - 1)] + A[cl(r - 1)][cl(c + 1)] - 2 * A[r][cl(c - 1)] + 2 * A[r][cl(c + 1)] - A[cl(r + 1)][cl(c - 1)] + A[cl(r + 1)][cl(c + 1)]) / 8;
                double iy = (-A[cl(r - 1)][cl(c - 1)] - 2 * A[cl(r - 1)][c] - A[cl(r - 1)][cl(c + 1)] + A[cl(r + 1)][cl(c - 1)] + 2 * A[cl(r + 1)][c] + A[cl(r + 1)][cl(c + 1)]) / 8;
                xx[r][c] = ix * ix; yy[r][c] = iy * iy; xy[r][c] = ix * iy;
            }
        double[][] Sxx = blur1(xx), Syy = blur1(yy), Sxy = blur1(xy);
        long[][] R = new long[N][N];
        long mx = Long.MIN_VALUE, mn = Long.MAX_VALUE;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                double t = Sxx[r][c] + Syy[r][c];
                R[r][c] = (long) Math.floor(Sxx[r][c] * Syy[r][c] - Sxy[r][c] * Sxy[r][c] - k * t * t + 0.5);
                mx = Math.max(mx, R[r][c]); mn = Math.min(mn, R[r][c]);
            }
        StringBuilder sb = new StringBuilder();
        int nc = 0, edges = 0;
        for (int i = 0; i < N; i++)
            for (int j = 0; j < N; j++) {
                if (R[i][j] < 0.1 * mn) edges++;
                if (R[i][j] <= 0.1 * mx) continue;
                boolean ok = true;
                for (int a = -1; a <= 1; a++)
                    for (int b = -1; b <= 1; b++) {
                        int y = i + a, x = j + b;
                        if ((a != 0 || b != 0) && y >= 0 && y < N && x >= 0 && x < N && (R[y][x] > R[i][j] || (R[y][x] == R[i][j] && (a < 0 || (a == 0 && b < 0))))) ok = false;
                    }
                if (ok) { nc++; sb.append(" (").append(i).append(',').append(j).append(')'); }
            }
        System.out.println(String.format("%s, k = %.2f: max R = %d, edge pixels %d, %d corners:", name, k, mx, edges, nc) + sb);
    }

    public static void main(String[] args) {
        for (String name : new String[]{"checker", "shapes"})
            for (double k : new double[]{0.04, 0.06}) harris(name, preset(name.equals("checker")), k);
    }
}
