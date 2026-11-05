public class ConceptEigen {
    // 2×2 矩陣的特徵值：λ² − tr·λ + det = 0
    public static void main(String[] args) {
        int[][] Ms = {{2, 1, 1, 2}, {4, 1, 2, 3}, {0, -1, 1, 0}};
        for (int[] M : Ms) {
            double a = M[0], b = M[1], c = M[2], d = M[3];
            System.out.printf("A = [[%d, %d], [%d, %d]]%n", M[0], M[1], M[2], M[3]);
            double tr = a + d, det = a * d - b * c, disc = tr * tr - 4 * det;
            if (disc < 0) { System.out.println("  no real eigenvalues"); continue; }
            for (int s = 0; s < 2; s++) {
                double lam = (tr + (s == 1 ? -1 : 1) * Math.sqrt(disc)) / 2, x, y;
                if (b != 0) { x = b; y = lam - a; }
                else if (c != 0) { x = lam - d; y = c; }
                else if (a == lam) { x = 1; y = 0; }
                else { x = 0; y = 1; }
                double n = Math.hypot(x, y);
                x /= n; y /= n;
                double ax = a * x + b * y, ay = c * x + d * y;
                System.out.printf("  lambda = %.4f  v = (%.4f, %.4f)  Av = (%.4f, %.4f)  ok = %s%n", lam, x, y, ax, ay, Math.abs(ax - lam * x) < 1e-9 && Math.abs(ay - lam * y) < 1e-9 ? "True" : "False");
            }
        }
    }
}
