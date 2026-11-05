public class LinearRegression {
    static double[] X = new double[12], Y = new double[12];
    static String g(double v) { return v == Math.rint(v) ? String.valueOf((long) v) : String.valueOf(v); }

    static void data(boolean exact) {
        long s = 42;
        for (int i = 0; i < 12; i++) {
            X[i] = 0.5 + i * 0.8;
            if (exact) Y[i] = 2 * X[i] + 1;
            else { s = s * 48271 % 2147483647; Y[i] = 2 * X[i] + 1 + (s / 2147483647.0 - 0.5) * 4; }
        }
    }
    static double mse(double w, double b) { double s = 0; for (int i = 0; i < 12; i++) s += (w * X[i] + b - Y[i]) * (w * X[i] + b - Y[i]); return s / 12; }

    public static void main(String[] args) {
        double[] lrs = {0.02, 0.02, 0.005, 0.05};
        int[] eps = {200, 2000, 200, 200};
        for (boolean exact : new boolean[]{false, true}) {
            data(exact);
            // 正規方程：w = (nΣxy − ΣxΣy) / (nΣx² − (Σx)²)，b = (Σy − wΣx) / n
            double sx = 0, sy = 0, sxx = 0, sxy = 0;
            for (int i = 0; i < 12; i++) { sx += X[i]; sy += Y[i]; sxx += X[i] * X[i]; sxy += X[i] * Y[i]; }
            double w = (12 * sxy - sx * sy) / (12 * sxx - sx * sx), b = (sy - w * sx) / 12;
            System.out.println(String.format("%s data: closed form w = %.4f, b = %.4f, MSE = %.4f", exact ? "exact" : "noisy", w, b, mse(w, b)));
            for (int k = 0; k < 4; k++) {
                // 沿 ∂MSE/∂w = (2/n)Σe·x、∂MSE/∂b = (2/n)Σe 的反方向更新
                double ww = 0, bb = 0;
                int div = 0;
                for (int ep = 1; ep <= eps[k]; ep++) {
                    double gw = 0, gb = 0;
                    for (int i = 0; i < 12; i++) { double e = ww * X[i] + bb - Y[i]; gw += 2.0 / 12 * e * X[i]; gb += 2.0 / 12 * e; }
                    ww -= lrs[k] * gw; bb -= lrs[k] * gb;
                    if (mse(ww, bb) > 1e6) { div = ep; break; }
                }
                if (div > 0) System.out.println("  lr " + g(lrs[k]) + ": diverged at epoch " + div);
                else System.out.println(String.format("  lr %s, %d epochs: w = %.4f, b = %.4f, MSE = %.4f", g(lrs[k]), eps[k], ww, bb, mse(ww, bb)));
            }
        }
    }
}
