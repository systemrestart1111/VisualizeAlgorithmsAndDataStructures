public class Clahe {
    static final int N = 16;

    static int[][] preset(boolean low) {
        int[][] a = new int[N][N];
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                int v = 30;
                if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
                if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
                if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
                if (low) v = 95 + (int) Math.floor((v - 30) / 170.0 * 35 + 0.5) + (r / 4) * 3;
                a[r][c] = v;
            }
        return a;
    }
    static int rnd(double x) { return x >= 0 ? (int) (x + 0.5) : -(int) (-x + 0.5); }

    // 每格直方圖裁切上限後平均分回（總數不變），各自求對應表，再以雙線性內插消除接縫
    static void clahe(String name, int[][] A, int T, int clip) {
        int ts = N / T, P = ts * ts, limit = Math.max(1, (clip * P + 255) / 256);
        boolean ok = true;
        int[][][] maps = new int[T][T][256];
        for (int ti = 0; ti < T; ti++)
            for (int tj = 0; tj < T; tj++) {
                int[] h = new int[256];
                int excess = 0, tot = 0, s = 0;
                for (int i = 0; i < ts; i++) for (int j = 0; j < ts; j++) h[A[ti * ts + i][tj * ts + j]]++;
                for (int v = 0; v < 256; v++) if (h[v] > limit) { excess += h[v] - limit; h[v] = limit; }
                for (int v = 0; v < 256; v++) { h[v] += excess / 256 + (v < excess % 256 ? 1 : 0); tot += h[v]; }
                if (tot != P) ok = false;
                for (int v = 0; v < 256; v++) { s += h[v]; maps[ti][tj][v] = rnd(s * 255.0 / P); }
            }
        int[][] no = new int[N][N], out = new int[N][N];
        int sum = 0;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                int v = A[r][c];
                no[r][c] = maps[r / ts][c / ts][v];
                double fy = (r + 0.5) / ts - 0.5, fx = (c + 0.5) / ts - 0.5;
                int y0 = Math.max(0, Math.min(T - 1, (int) Math.floor(fy))), x0 = Math.max(0, Math.min(T - 1, (int) Math.floor(fx)));
                int y1 = Math.min(T - 1, y0 + 1), x1 = Math.min(T - 1, x0 + 1);
                double wy = Math.max(0.0, Math.min(1.0, fy - y0)), wx = Math.max(0.0, Math.min(1.0, fx - x0));
                out[r][c] = rnd((1 - wy) * ((1 - wx) * maps[y0][x0][v] + wx * maps[y0][x1][v]) + wy * ((1 - wx) * maps[y1][x0][v] + wx * maps[y1][x1][v]));
                sum += out[r][c];
            }
        int s1 = 0, s2 = 0;
        for (int k = 1; k < T; k++)
            for (int i = 0; i < N; i++) {
                s1 += Math.abs(no[i][k * ts] - no[i][k * ts - 1]) + Math.abs(no[k * ts][i] - no[k * ts - 1][i]);
                s2 += Math.abs(out[i][k * ts] - out[i][k * ts - 1]) + Math.abs(out[k * ts][i] - out[k * ts - 1][i]);
            }
        System.out.println(name + ", " + T + "x" + T + " tiles, clip " + clip + ": limit " + limit + ", totals preserved " + (ok ? "True" : "False") + ", seam without/with interpolation " + s1 + "/" + s2 + ", output sum " + sum);
    }

    public static void main(String[] args) {
        int[][] cfg = {{2, 8}, {4, 4}, {2, 32}};
        int[][] low = preset(true), sh = preset(false);
        for (int[] c : cfg) clahe("lowcontrast", low, c[0], c[1]);
        for (int[] c : cfg) clahe("shapes", sh, c[0], c[1]);
    }
}
