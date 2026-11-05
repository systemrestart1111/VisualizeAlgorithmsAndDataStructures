public class PowerIteration {
    static double z(double v) { return Math.abs(v) < 5e-7 ? 0.0 : v; }
    static double lam;

    // x ← Ax / ‖Ax‖；Rayleigh 商 xᵀAx 估計主特徵值；方向不再改變（含正負號翻轉）即收斂。回傳步數，0 為不收斂
    static int powerIteration(double[][] A, double[] x) {
        int n = A.length;
        double nx = 0;
        for (double v : x) nx += v * v;
        nx = Math.sqrt(nx);
        for (int i = 0; i < n; i++) x[i] /= nx;
        for (int k = 1; k <= 60; k++) {
            double[] y = new double[n];
            double ny = 0, l = 0, dm = 0, dp = 0;
            for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) y[i] += A[i][j] * x[j];
            for (int i = 0; i < n; i++) l += x[i] * y[i];
            for (int i = 0; i < n; i++) ny += y[i] * y[i];
            ny = Math.sqrt(ny);
            for (int i = 0; i < n; i++) { double v = y[i] / ny; dm += (v - x[i]) * (v - x[i]); dp += (v + x[i]) * (v + x[i]); x[i] = v; }
            lam = l;
            if (Math.min(Math.sqrt(dm), Math.sqrt(dp)) < 1e-10) return k;
        }
        return 0;
    }

    public static void main(String[] args) {
        double[][][] As = {{{2, 1}, {1, 3}}, {{2, 0, 0}, {0, 1, 0}, {0, 0, 3}}, {{4, 1}, {2, 3}}, {{0, 1}, {1, 0}}};
        double[][] xs = {{1, 0}, {1, 1, 1}, {1, 1}, {1, 0}};
        for (int t = 0; t < As.length; t++) {
            double[] x = xs[t].clone();
            int k = powerIteration(As[t], x);
            if (k == 0) { System.out.println("no convergence in 60 steps (|lambda1| = |lambda2|?)"); continue; }
            StringBuilder sb = new StringBuilder(String.format("lambda = %.6f, x = (", z(lam)));
            for (int i = 0; i < x.length; i++) sb.append(i > 0 ? ", " : "").append(String.format("%.6f", z(x[i])));
            System.out.println(sb + "), steps " + k);
        }
    }
}
