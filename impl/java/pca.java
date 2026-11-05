public class Pca {
    static double[][] P0 = {{2.0, 1.6}, {3.1, 2.4}, {4.2, 2.6}, {5.0, 3.5}, {5.9, 3.7}, {6.8, 4.6}, {7.7, 4.4}, {8.9, 5.6}, {4.6, 3.6}, {6.1, 3.0}};

    // 中心化（可選標準化）→ 共變異數矩陣 → 2×2 對稱矩陣的特徵分解
    static void pca(String name, double scale, boolean standardize) {
        int n = P0.length;
        double[][] X = new double[n][2];
        double mx = 0, my = 0;
        for (double[] p : P0) { mx += p[0] * scale; my += p[1]; }
        mx /= n; my /= n;
        for (int i = 0; i < n; i++) { X[i][0] = P0[i][0] * scale - mx; X[i][1] = P0[i][1] - my; }
        if (standardize) {
            double sx = 0, sy = 0;
            for (double[] p : X) { sx += p[0] * p[0]; sy += p[1] * p[1]; }
            sx = Math.sqrt(sx / (n - 1)); sy = Math.sqrt(sy / (n - 1));
            for (double[] p : X) { p[0] /= sx; p[1] /= sy; }
        }
        double a = 0, b = 0, c = 0;
        for (double[] p : X) { a += p[0] * p[0]; b += p[0] * p[1]; c += p[1] * p[1]; }
        a /= n - 1; b /= n - 1; c /= n - 1;
        double tr = a + c, det = a * c - b * b, disc = Math.sqrt(Math.max(0.0, (tr / 2) * (tr / 2) - det));
        double l1 = tr / 2 + disc, l2 = tr / 2 - disc, v0, v1;
        if (Math.abs(b) > 1e-12) { v0 = l1 - c; v1 = b; } else if (a >= c) { v0 = 1; v1 = 0; } else { v0 = 0; v1 = 1; }
        double nv = Math.hypot(v0, v1);
        v0 /= nv; v1 /= nv;
        if (v0 < 0) { v0 = -v0; v1 = -v1; }
        System.out.println(String.format("%s, %s: cov [%.3f %.3f; %.3f %.3f], eigenvalues %.3f %.3f (sum %.3f = trace %.3f), PC1 (%.3f, %.3f) explains %.2f%%, first projections %.3f %.3f",
                name, standardize ? "standardized" : "centered", a, b, b, c, l1, l2, l1 + l2, a + c, v0, v1, 100 * l1 / (l1 + l2), X[0][0] * v0 + X[0][1] * v1, X[1][0] * v0 + X[1][1] * v1));
    }

    public static void main(String[] args) {
        pca("original", 1, false);
        pca("original", 1, true);
        pca("x scaled by 10", 10, false);
        pca("x scaled by 10", 10, true);
    }
}
