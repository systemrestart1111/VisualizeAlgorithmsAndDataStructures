public class Sgd {
    static double[] X = new double[12], Y = new double[12];
    static long st;
    static long nxt() { st = st * 48271 % 2147483647; return st; }
    static double mse(double w, double b) { double s = 0; for (int i = 0; i < 12; i++) s += (w * X[i] + b - Y[i]) * (w * X[i] + b - Y[i]); return s / 12; }

    public static void main(String[] args) {
        st = 9;
        for (int i = 0; i < 12; i++) { X[i] = 0.5 + i * 0.8; Y[i] = 2 * X[i] + 1 + (nxt() / 2147483647.0 - 0.5) * 4; }
        for (double lr : new double[]{0.01, 0.002, 0.03}) {
            // 每輪先 Fisher–Yates 洗牌，再逐筆更新：w −= η·2e·x，b −= η·2e
            double w = 0, b = 0;
            int div = 0;
            st = 42;
            for (int ep = 1; ep <= 15 && div == 0; ep++) {
                int[] ord = new int[12];
                for (int i = 0; i < 12; i++) ord[i] = i;
                for (int i = 11; i > 0; i--) { int j = (int) (nxt() % (i + 1)), t = ord[i]; ord[i] = ord[j]; ord[j] = t; }
                for (int i : ord) { double e = w * X[i] + b - Y[i]; w -= lr * 2 * e * X[i]; b -= lr * 2 * e; }
                if (mse(w, b) > 1e6) div = ep;
            }
            double bw = 0, bb = 0;
            for (int ep = 0; ep < 15; ep++) {
                double gw = 0, gb = 0;
                for (int i = 0; i < 12; i++) gw += 2.0 / 12 * (bw * X[i] + bb - Y[i]) * X[i];
                for (int i = 0; i < 12; i++) gb += 2.0 / 12 * (bw * X[i] + bb - Y[i]);
                bw -= lr * gw; bb -= lr * gb;
            }
            String sgdPart = div > 0 ? "diverged at epoch " + div : String.format("w = %.4f, b = %.4f, MSE %.4f", w, b, mse(w, b));
            System.out.println("lr " + lr + ", 15 epochs: SGD " + sgdPart + String.format("; batch GD w = %.4f, b = %.4f, MSE %.4f", bw, bb, mse(bw, bb)));
        }
    }
}
