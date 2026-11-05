public class Backpropagation {
    static int[][] XOR = {{0, 0, 0}, {0, 1, 1}, {1, 0, 1}, {1, 1, 0}};
    static double sg(double z) { return 1 / (1 + Math.exp(-z)); }
    // 2-2-1 網路：參數 W1(4) b1(2) w2(2) b2(1)
    static double forward(double[] t, int a, int b, double[] h) {
        h[0] = sg(t[0] * a + t[1] * b + t[4]);
        h[1] = sg(t[2] * a + t[3] * b + t[5]);
        return sg(t[6] * h[0] + t[7] * h[1] + t[8]);
    }
    static double loss(double[] t) { double s = 0; double[] h = new double[2]; for (int[] x : XOR) { double o = forward(t, x[0], x[1], h); s += 0.5 * (o - x[2]) * (o - x[2]); } return s; }
    // 連鎖律由輸出往回：δ₂ = (ŷ − y)ŷ(1 − ŷ)，δ₁ = w₂δ₂ ⊙ h(1 − h)
    static double[] grad(double[] t) {
        double[] G = new double[9], h = new double[2];
        for (int[] x : XOR) {
            double o = forward(t, x[0], x[1], h);
            double d2 = (o - x[2]) * o * (1 - o);
            G[6] += d2 * h[0]; G[7] += d2 * h[1]; G[8] += d2;
            double d10 = t[6] * d2 * h[0] * (1 - h[0]), d11 = t[7] * d2 * h[1] * (1 - h[1]);
            G[0] += d10 * x[0]; G[1] += d10 * x[1]; G[2] += d11 * x[0]; G[3] += d11 * x[1]; G[4] += d10; G[5] += d11;
        }
        return G;
    }

    public static void main(String[] args) {
        long[] seeds = {3, 1, 3};
        double[] lrs = {2.0, 2.0, 0.5};
        for (int r = 0; r < 3; r++) {
            long s = seeds[r];
            double[] t = new double[9];
            for (int i = 0; i < 9; i++) { s = s * 48271 % 2147483647; t[i] = (s / 2147483647.0 - 0.5) * 2; }
            double[] G = grad(t);
            double eps = 1e-5, maxrel = 0;
            for (int i = 0; i < 9; i++) {
                double[] p = t.clone(), m = t.clone();
                p[i] += eps; m[i] -= eps;
                double num = (loss(p) - loss(m)) / (2 * eps);
                maxrel = Math.max(maxrel, Math.abs(G[i] - num) / Math.max(1e-12, Math.abs(G[i]) + Math.abs(num)));
            }
            System.out.println(String.format("seed %d: initial loss %.6f, gradient check max relative error < 1e-6: %s", seeds[r], loss(t), maxrel < 1e-6 ? "True" : "False"));
            for (int ep = 0; ep < 2000; ep++) { double[] gr = grad(t); for (int i = 0; i < 9; i++) t[i] -= lrs[r] * gr[i]; }
            double[] h = new double[2];
            boolean ok = true;
            StringBuilder sb = new StringBuilder(String.format("  lr %.1f, 2000 epochs: loss %.6f, predictions", lrs[r], loss(t)));
            for (int[] x : XOR) { double o = forward(t, x[0], x[1], h); sb.append(String.format(" %.3f", o)); if ((o >= 0.5) != (x[2] == 1)) ok = false; }
            System.out.println(sb + ", all correct " + (ok ? "True" : "False"));
        }
    }
}
