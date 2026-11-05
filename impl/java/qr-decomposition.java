public class QrDecomposition {
    static double z(double v) { return Math.abs(v) < 5e-7 ? 0.0 : v; }

    // 修正版 Gram–Schmidt：依序扣掉在每個 q 上的投影，剩下的正規化成新的 q；回傳 −1 成功，否則為相依的欄
    static int qr(double[][] A, double[][] Q, double[][] R) {
        int m = A.length, n = A[0].length;
        for (int j = 0; j < n; j++) {
            double[] v = new double[m];
            for (int i = 0; i < m; i++) v[i] = A[i][j];
            for (int i = 0; i < j; i++) {
                double s = 0;
                for (int k = 0; k < m; k++) s += Q[k][i] * v[k];
                R[i][j] = s;
                for (int k = 0; k < m; k++) v[k] -= s * Q[k][i];
            }
            double nv = 0;
            for (double x : v) nv += x * x;
            nv = Math.sqrt(nv);
            if (nv < 1e-9) return j;
            R[j][j] = nv;
            for (int k = 0; k < m; k++) Q[k][j] = v[k] / nv;
        }
        return -1;
    }

    public static void main(String[] args) {
        double[][][] tests = {{{12, -51, 4}, {6, 167, -68}, {-4, 24, -41}}, {{1, 1}, {1, 0}, {0, 1}}, {{1, 2}, {2, 4}}};
        for (double[][] A : tests) {
            int m = A.length, n = A[0].length;
            double[][] Q = new double[m][n], R = new double[n][n];
            int bad = qr(A, Q, R);
            if (bad >= 0) { System.out.println("column " + (bad + 1) + " is linearly dependent"); continue; }
            for (double[] row : Q) { StringBuilder sb = new StringBuilder("Q:"); for (double v : row) sb.append(String.format(" %.6f", z(v))); System.out.println(sb); }
            for (double[] row : R) { StringBuilder sb = new StringBuilder("R:"); for (double v : row) sb.append(String.format(" %.6f", z(v))); System.out.println(sb); }
            double e1 = 0, e2 = 0;
            for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) { double s = 0; for (int k = 0; k < m; k++) s += Q[k][i] * Q[k][j]; e1 = Math.max(e1, Math.abs(s - (i == j ? 1 : 0))); }
            for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) { double s = 0; for (int k = 0; k < n; k++) s += Q[i][k] * R[k][j]; e2 = Math.max(e2, Math.abs(s - A[i][j])); }
            System.out.println("QtQ = I: " + (e1 < 1e-9 ? "True" : "False") + ", QR = A: " + (e2 < 1e-9 ? "True" : "False"));
        }
    }
}
