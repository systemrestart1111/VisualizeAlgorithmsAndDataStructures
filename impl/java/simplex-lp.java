import java.util.*;

public class SimplexLp {
    static final double EPS = 1e-9;
    static double z(double v) { return Math.abs(v) < 5e-7 ? 0.0 : v; }

    static List<double[]> T;
    static List<Integer> basis;
    static int N, pivots;

    static void pivot(int pr, int pc) {
        double[] row = T.get(pr);
        double pv = row[pc];
        for (int j = 0; j <= N; j++) row[j] /= pv;
        for (int i = 0; i < T.size(); i++) {
            double[] ri = T.get(i);
            if (i != pr && Math.abs(ri[pc]) > 1e-15) { double f = ri[pc]; for (int j = 0; j <= N; j++) ri[j] -= f * row[j]; }
        }
        basis.set(pr, pc);
    }
    // 單純形迭代，入基／出基都用 Bland 法則（編號最小者）避免退化循環
    static boolean solve(double[] cost, int allowed) {
        for (;;) {
            int e = -1;
            for (int j = 0; j < allowed && e < 0; j++) {
                if (basis.contains(j)) continue;
                double red = 0;
                for (int i = 0; i < T.size(); i++) red += cost[basis.get(i)] * T.get(i)[j];
                if (red - cost[j] < -EPS) e = j;
            }
            if (e < 0) return true;
            int l = -1;
            double best = Double.POSITIVE_INFINITY;
            for (int i = 0; i < T.size(); i++)
                if (T.get(i)[e] > EPS) {
                    double q = T.get(i)[N] / T.get(i)[e];
                    if (q < best - 1e-12 || (Math.abs(q - best) <= 1e-12 && basis.get(i) < basis.get(l))) { best = q; l = i; }
                }
            if (l < 0) return false;
            pivot(l, e);
            pivots++;
        }
    }

    // 兩階段單純形法；ge[i] 為 true 代表 >=
    static String simplex(double[] c0, double[][] A, boolean[] ge, double[] b0, boolean isMin) {
        int n = c0.length, m = A.length, K = 0;
        double[] c = new double[n], b = new double[m];
        double[][] a = new double[m][];
        int[] art = new int[m];
        for (int j = 0; j < n; j++) c[j] = isMin ? -c0[j] : c0[j];
        for (int i = 0; i < m; i++) {
            a[i] = A[i].clone();
            b[i] = b0[i];
            if (ge[i]) { for (int j = 0; j < n; j++) a[i][j] = -a[i][j]; b[i] = -b[i]; }
            art[i] = b[i] < 0 ? K++ : -1;
        }
        N = n + m + K;
        pivots = 0;
        T = new ArrayList<>();
        basis = new ArrayList<>();
        for (int i = 0; i < m; i++) {
            double[] row = new double[N + 1];
            double sg = b[i] < 0 ? -1 : 1;
            for (int j = 0; j < n; j++) row[j] = sg * a[i][j];
            row[n + i] = sg;
            row[N] = sg * b[i];
            if (art[i] >= 0) { row[n + m + art[i]] = 1; basis.add(n + m + art[i]); } else basis.add(n + i);
            T.add(row);
        }
        if (K > 0) {
            double[] cost1 = new double[N];
            for (int j = n + m; j < N; j++) cost1[j] = -1;
            solve(cost1, N);
            double z1 = 0;
            for (int i = 0; i < T.size(); i++) z1 += cost1[basis.get(i)] * T.get(i)[N];
            if (z1 < -1e-7) return "infeasible";
            for (int i = T.size() - 1; i >= 0; i--) {
                if (basis.get(i) < n + m) continue;
                int j = -1;
                for (int k = 0; k < n + m; k++) if (Math.abs(T.get(i)[k]) > EPS) { j = k; break; }
                if (j < 0) { T.remove(i); basis.remove(i); } else pivot(i, j);
            }
        }
        double[] cost2 = new double[N];
        for (int j = 0; j < n; j++) cost2[j] = c[j];
        if (!solve(cost2, n + m)) return "unbounded";
        double[] x = new double[n];
        for (int i = 0; i < T.size(); i++) if (basis.get(i) < n) x[basis.get(i)] = T.get(i)[N];
        double zz = 0;
        for (int j = 0; j < n; j++) zz += c0[j] * x[j];
        StringBuilder s = new StringBuilder(String.format("optimal %s = %.6f at x = (", isMin ? "min" : "max", z(zz)));
        for (int j = 0; j < n; j++) s.append(j > 0 ? ", " : "").append(String.format("%.6f", z(x[j])));
        return s + "), " + pivots + " pivots";
    }

    public static void main(String[] args) {
        System.out.println("classic: " + simplex(new double[]{3, 5}, new double[][]{{1, 0}, {0, 2}, {3, 2}}, new boolean[]{false, false, false}, new double[]{4, 12, 18}, false));
        System.out.println("unbounded: " + simplex(new double[]{1, 1}, new double[][]{{1, -1}, {-1, 1}}, new boolean[]{false, false}, new double[]{2, 3}, false));
        System.out.println("infeasible: " + simplex(new double[]{1, 1}, new double[][]{{1, 1}, {1, 1}}, new boolean[]{false, true}, new double[]{2, 5}, false));
        System.out.println("min with >=: " + simplex(new double[]{2, 3}, new double[][]{{1, 1}, {1, 3}, {1, 0}}, new boolean[]{true, true, false}, new double[]{4, 6, 5}, true));
        System.out.println("degenerate: " + simplex(new double[]{2, 1}, new double[][]{{1, 1}, {1, 0}, {2, 1}}, new boolean[]{false, false, false}, new double[]{4, 2, 6}, false));
        System.out.println("Beale cycling: " + simplex(new double[]{0.75, -20, 0.5, -6}, new double[][]{{0.25, -8, -1, 9}, {0.5, -12, -0.5, 3}, {0, 0, 1, 0}}, new boolean[]{false, false, false}, new double[]{0, 0, 1}, false));
    }
}
