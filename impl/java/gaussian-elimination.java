public class GaussianElimination {
    // 前向消去：每一欄選絕對值最大的列當主元（部分樞軸），再消去下方各列；最後回代求解
    public static void main(String[] args) {
        double[][] M = {{2, 1, -1, 8}, {-3, -1, 2, -11}, {-2, 1, 2, -3}}; // 增廣矩陣 [A | b]
        int n = M.length;
        for (int col = 0; col < n; col++) {
            int piv = col;
            for (int r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
            if (piv != col) {
                double[] t = M[col]; M[col] = M[piv]; M[piv] = t;
                System.out.println("swap rows " + col + " and " + piv);
            }
            for (int r = col + 1; r < n; r++) {
                double factor = M[r][col] / M[col][col];
                for (int c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
            }
        }
        double[] x = new double[n];
        for (int r = n - 1; r >= 0; r--) {
            double s = M[r][n];
            for (int c = r + 1; c < n; c++) s -= M[r][c] * x[c];
            x[r] = s / M[r][r];
        }
        StringBuilder sb = new StringBuilder("solution:");
        for (int i = 0; i < n; i++) sb.append(String.format(" x%d = %.4f", i, Math.abs(x[i]) < 1e-9 ? 0.0 : x[i]));
        System.out.println(sb);
    }
}
