public class GaussianBlur {
    static final int N = 16;

    static double[][] noisy() {
        double[][] a = new double[N][N];
        long s = 7;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                int v = 30;
                if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
                if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
                if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
                s = s * 48271 % 2147483647;
                int t = (int) (s % 100);
                a[r][c] = t < 5 ? 0 : t < 10 ? 255 : v;
            }
        return a;
    }
    // 一維高斯：半徑 ⌈3σ⌉（最多 3），正規化成總和 1
    static double[] kernel(double sigma) {
        int rad = Math.min(3, (int) Math.ceil(3 * sigma));
        double[] k = new double[2 * rad + 1];
        double s = 0;
        for (int i = 0; i <= 2 * rad; i++) { k[i] = Math.exp(-((i - rad) * (i - rad)) / (2 * sigma * sigma)); s += k[i]; }
        for (int i = 0; i < k.length; i++) k[i] /= s;
        return k;
    }
    static double at(double[][] a, int r, int c, boolean zero) {
        if (r >= 0 && r < N && c >= 0 && c < N) return a[r][c];
        if (zero) return 0;
        return a[Math.min(N - 1, Math.max(0, r))][Math.min(N - 1, Math.max(0, c))];
    }
    // 可分離：先水平再垂直
    static double[][] blur(double[][] a, double sigma, boolean zero) {
        double[] k = kernel(sigma);
        int rad = k.length / 2;
        double[][] h = new double[N][N], out = new double[N][N];
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double s = 0; for (int j = -rad; j <= rad; j++) s += k[j + rad] * at(a, r, c + j, zero); h[r][c] = s; }
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double s = 0; for (int i = -rad; i <= rad; i++) s += k[i + rad] * at(h, r + i, c, zero); out[r][c] = s; }
        return out;
    }

    public static void main(String[] args) {
        double[][] A = noisy();
        for (double sigma : new double[]{0.6, 1.0, 2.0}) {
            double[][] out = blur(A, sigma, false);
            StringBuilder sb = new StringBuilder(String.format("sigma %.1f: kernel", sigma));
            for (double v : kernel(sigma)) sb.append(String.format(" %.6f", v));
            System.out.println(sb);
            double sum = 0;
            for (double[] row : out) for (double v : row) sum += v;
            System.out.println(String.format("  out(5,4) = %.3f, out(8,8) = %.3f, out(0,0) = %.3f, sum = %.3f", out[5][4], out[8][8], out[0][0], sum));
        }
        double[][] C = new double[N][N];
        for (double[] row : C) java.util.Arrays.fill(row, 120);
        for (boolean zero : new boolean[]{false, true}) {
            double[][] out = blur(C, 1.0, zero);
            double dev = 0;
            for (double[] row : out) for (double v : row) dev = Math.max(dev, Math.abs(v - 120));
            System.out.println(String.format("constant image, border %s: max deviation %.3f", zero ? "zero" : "replicate", dev));
        }
    }
}
