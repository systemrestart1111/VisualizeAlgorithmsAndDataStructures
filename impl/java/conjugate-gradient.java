public class ConjugateGradient {
    static double z(double v) { return Math.abs(v) < 5e-7 ? 0.0 : v; }

    // 對稱且 Cholesky 成功才是對稱正定
    static boolean isSpd(double[][] A) {
        int n = A.length;
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) if (A[i][j] != A[j][i]) return false;
        double[][] L = new double[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j <= i; j++) {
                double s = A[i][j];
                for (int k = 0; k < j; k++) s -= L[i][k] * L[j][k];
                if (i == j) { if (s <= 1e-12) return false; L[i][i] = Math.sqrt(s); }
                else L[i][j] = s / L[j][j];
            }
        return true;
    }

    // 方向 p 彼此 A-共軛：α = rᵀr / pᵀAp，β = r_newᵀr_new / rᵀr；至多 n 步
    static int cg(double[][] A, double[] b, double[] x) {
        int n = A.length;
        double[] r = b.clone(), p = b.clone();
        for (int k = 1; k < n + 6; k++) {
            double[] Ap = new double[n], rn = new double[n];
            double rr = 0, pAp = 0, rnn = 0;
            for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) Ap[i] += A[i][j] * p[j];
            for (int i = 0; i < n; i++) rr += r[i] * r[i];
            for (int i = 0; i < n; i++) pAp += p[i] * Ap[i];
            double alpha = rr / pAp;
            for (int i = 0; i < n; i++) { x[i] += alpha * p[i]; rn[i] = r[i] - alpha * Ap[i]; }
            for (double v : rn) rnn += v * v;
            if (Math.sqrt(rnn) < 1e-10) return k;
            double beta = rnn / rr;
            for (int i = 0; i < n; i++) p[i] = rn[i] + beta * p[i];
            r = rn;
        }
        return 0;
    }

    public static void main(String[] args) {
        double[][][] As = {{{3, 2}, {2, 6}}, {{4, 1, 0}, {1, 3, 1}, {0, 1, 2}}, {{4, 1}, {1, 3}}, {{1, 2}, {2, 1}}};
        double[][] bs = {{2, -8}, {1, 2, 3}, {1, 2}, {1, 1}};
        for (int t = 0; t < As.length; t++) {
            double[][] A = As[t];
            double[] b = bs[t];
            int n = A.length;
            if (!isSpd(A)) { System.out.println("not symmetric positive definite: CG not applicable"); continue; }
            double[] x = new double[n];
            int k = cg(A, b, x);
            double res = 0;
            for (int i = 0; i < n; i++) { double s = b[i]; for (int j = 0; j < n; j++) s -= A[i][j] * x[j]; res += s * s; }
            StringBuilder sb = new StringBuilder("x = (");
            for (int i = 0; i < n; i++) sb.append(i > 0 ? ", " : "").append(String.format("%.6f", z(x[i])));
            System.out.println(sb + ") in " + k + " steps (n = " + n + "), residual small " + (Math.sqrt(res) < 1e-9 ? "True" : "False"));
        }
    }
}
