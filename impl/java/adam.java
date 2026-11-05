public class Adam {
    static double f(int k, double x, double y) { return k == 0 ? 0.1 * x * x + 2 * y * y : (1 - x) * (1 - x) + 10 * (y - x * x) * (y - x * x); }
    static double[] grad(int k, double x, double y) { return k == 0 ? new double[]{0.2 * x, 4 * y} : new double[]{-2 * (1 - x) - 40 * x * (y - x * x), 20 * (y - x * x)}; }

    public static void main(String[] args) {
        String[] names = {"ellipse", "rosenbrock"};
        double[][] starts = {{-4.0, 1.5}, {-1.5, 2.0}};
        for (int k = 0; k < 2; k++)
            for (double lr : new double[]{0.1, 0.03}) {
                // m、v 為梯度與梯度平方的移動平均；偏差修正後 θ −= η·m̂ / (√v̂ + ε)（ε 在根號外）
                double b1 = 0.9, b2 = 0.999, eps = 1e-8;
                double[] th = starts[k].clone(), m = new double[2], v = new double[2];
                double fg = 0, fmh = 0, fvh = 0, fstep = 0;
                for (int t = 1; t <= 150; t++) {
                    double[] g = grad(k, th[0], th[1]);
                    for (int i = 0; i < 2; i++) {
                        m[i] = b1 * m[i] + (1 - b1) * g[i];
                        v[i] = b2 * v[i] + (1 - b2) * g[i] * g[i];
                        double mh = m[i] / (1 - Math.pow(b1, t)), vh = v[i] / (1 - Math.pow(b2, t)), step = lr * mh / (Math.sqrt(vh) + eps);
                        if (t == 1 && i == 0) { fg = g[0]; fmh = mh; fvh = vh; fstep = step; }
                        th[i] -= step;
                    }
                }
                System.out.println(String.format("%s, lr %s: first step g = %.4f, m_hat = %.4f, v_hat = %.4f, step = %.4f; after 150 steps theta = (%.4f, %.4f), f = %.6f", names[k], lr, fg, fmh, fvh, fstep, th[0], th[1], f(k, th[0], th[1])));
                double[] p = starts[k].clone();
                boolean div = false;
                for (int t = 0; t < 150; t++) {
                    double[] g = grad(k, p[0], p[1]);
                    p[0] -= lr * g[0]; p[1] -= lr * g[1];
                    if (Math.abs(p[0]) > 1e6 || Math.abs(p[1]) > 1e6) { div = true; break; }
                }
                System.out.println(div ? "  plain gradient descent: diverged" : String.format("  plain gradient descent: theta = (%.4f, %.4f), f = %.6f", p[0], p[1], f(k, p[0], p[1])));
            }
    }
}
