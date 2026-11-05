public class LuDecomposition {
    static double z(double v) { return Math.abs(v) < 5e-7 ? 0.0 : v; }

    // PA = LU（部分樞軸）；交換列時 L 已算好的欄也要一起交換；回傳 −1 成功，否則為奇異的欄
    static int lu(double[][] A, int[] perm, double[][] L, double[][] U) {
        int n = A.length;
        for (int i = 0; i < n; i++) { perm[i] = i; U[i] = A[i].clone(); L[i][i] = 1; }
        for (int k = 0; k < n; k++) {
            int p = k;
            for (int i = k + 1; i < n; i++) if (Math.abs(U[i][k]) > Math.abs(U[p][k])) p = i;
            if (p != k) {
                double[] t = U[k]; U[k] = U[p]; U[p] = t;
                int ti = perm[k]; perm[k] = perm[p]; perm[p] = ti;
                for (int j = 0; j < k; j++) { double s = L[k][j]; L[k][j] = L[p][j]; L[p][j] = s; }
            }
            if (Math.abs(U[k][k]) < 1e-12) return k;
            for (int i = k + 1; i < n; i++) {
                double f = U[i][k] / U[k][k];
                L[i][k] = f;
                for (int j = k; j < n; j++) U[i][j] -= f * U[k][j];
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        double[][][] tests = {{{2, 1, 1, 0}, {4, 3, 3, 1}, {8, 7, 9, 5}, {6, 7, 9, 8}}, {{1, 2, 3}, {2, 4, 6}, {1, 0, 1}}, {{0, 1}, {1, 0}}};
        for (double[][] A : tests) {
            int n = A.length;
            int[] perm = new int[n];
            double[][] L = new double[n][n], U = new double[n][];
            int bad = lu(A, perm, L, U);
            if (bad >= 0) { System.out.println("singular: no pivot in column " + (bad + 1)); continue; }
            StringBuilder sb = new StringBuilder("perm:");
            for (int p : perm) sb.append(' ').append(p);
            System.out.println(sb);
            for (int i = 0; i < n; i++) {
                StringBuilder row = new StringBuilder("L:");
                for (double v : L[i]) row.append(String.format(" %.6f", z(v)));
                row.append(" | U:");
                for (double v : U[i]) row.append(String.format(" %.6f", z(v)));
                System.out.println(row);
            }
            double err = 0;
            for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) { double s = 0; for (int k = 0; k < n; k++) s += L[i][k] * U[k][j]; err = Math.max(err, Math.abs(A[perm[i]][j] - s)); }
            System.out.println("PA = LU: " + (err < 1e-9 ? "True" : "False"));
        }
    }
}
