public class LogisticRegression {
    // 依正負號選擇不會溢位的寫法
    static double sigmoid(double z) { return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)); }
    // 交叉熵的穩定形式：max(z, 0) − y·z + log(1 + e^(−|z|))，不會出現 log(0)
    static double logLoss(double z, int y) { return Math.max(z, 0) - y * z + Math.log1p(Math.exp(-Math.abs(z))); }
    static String g(double v) { return v == Math.rint(v) ? String.valueOf((long) v) : String.valueOf(v); }

    public static void main(String[] args) {
        System.out.println(String.format("stable loss for z = 40, y = 0: %.4f; for z = -40, y = 1: %.4f; z = 0: %.4f", logLoss(40, 0), logLoss(-40, 1), logLoss(0, 1)));
        int[] seps = {3, 6};
        double[][] lrs = {{0.5, 0.1, 0.5}, {0.1, 0.1, 0.02}};
        int[][] eps = {{300, 300, 3000}, {300, 3000, 3000}};
        for (int s = 0; s < 2; s++) {
            long st = 42;
            double[] x1 = new double[24], x2 = new double[24];
            int[] y = new int[24];
            for (int i = 0; i < 24; i++) {
                y[i] = i % 2;
                double c = y[i] == 1 ? 6 : 3;
                st = st * 48271 % 2147483647; x1[i] = c + (st / 2147483647.0 - 0.5) * seps[s];
                st = st * 48271 % 2147483647; x2[i] = c + (st / 2147483647.0 - 0.5) * seps[s];
            }
            for (int k = 0; k < 3; k++) {
                double w1 = 0, w2 = 0, b = 0;
                for (int ep = 0; ep < eps[s][k]; ep++) {
                    double g1 = 0, g2 = 0, gb = 0;
                    for (int i = 0; i < 24; i++) { double e = sigmoid(w1 * x1[i] + w2 * x2[i] + b) - y[i]; g1 += e * x1[i] / 24; g2 += e * x2[i] / 24; gb += e / 24; }
                    w1 -= lrs[s][k] * g1; w2 -= lrs[s][k] * g2; b -= lrs[s][k] * gb;
                }
                double loss = 0;
                int acc = 0;
                for (int i = 0; i < 24; i++) { double z = w1 * x1[i] + w2 * x2[i] + b; loss += logLoss(z, y[i]); if ((sigmoid(z) >= 0.5 ? 1 : 0) == y[i]) acc++; }
                System.out.println(String.format("spread %d, lr %s, %d epochs: w = (%.3f, %.3f), b = %.3f, loss %.4f, accuracy %d/24", seps[s], g(lrs[s][k]), eps[s][k], w1, w2, b, loss / 24, acc));
            }
        }
    }
}
