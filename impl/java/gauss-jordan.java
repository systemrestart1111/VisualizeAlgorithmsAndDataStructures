import java.util.*;

public class GaussJordan {
    static double z(double v) { return Math.abs(v) < 5e-7 ? 0.0 : v; }

    // 化成簡化列梯形 (RREF)，判斷唯一解／無解／無限多解
    static String gaussJordan(double[][] M) {
        int R = M.length, nv = M[0].length - 1, row = 0;
        List<Integer> piv = new ArrayList<>();
        for (int col = 0; col < nv && row < R; col++) {
            int p = row;
            for (int i = row + 1; i < R; i++) if (Math.abs(M[i][col]) > Math.abs(M[p][col])) p = i;
            if (Math.abs(M[p][col]) < 1e-9) continue; // 沒有主元：自由變數
            double[] t = M[p]; M[p] = M[row]; M[row] = t;
            double pv = M[row][col];
            for (int j = 0; j <= nv; j++) M[row][j] /= pv;
            for (int i = 0; i < R; i++)
                if (i != row && Math.abs(M[i][col]) > 1e-12) { double f = M[i][col]; for (int j = 0; j <= nv; j++) M[i][j] -= f * M[row][j]; }
            piv.add(col);
            row++;
        }
        for (int i = row; i < R; i++) if (Math.abs(M[i][nv]) > 1e-9) return "no solution (row 0 ... 0 | c with c != 0)";
        if (piv.size() < nv) {
            StringBuilder s = new StringBuilder("infinitely many: rank " + piv.size() + " < " + nv + ", free");
            for (int j = 0; j < nv; j++) if (!piv.contains(j)) s.append(" x").append(j + 1);
            return s.toString();
        }
        StringBuilder s = new StringBuilder("unique:");
        for (int i = 0; i < nv; i++) s.append(String.format(" x%d = %.6f", i + 1, z(M[i][nv])));
        return s.toString();
    }

    public static void main(String[] args) {
        double[][][] systems = {
            {{2, 1, -1, 8}, {-3, -1, 2, -11}, {-2, 1, 2, -3}},
            {{1, 2, -1, 3}, {2, 4, -2, 6}, {1, 1, 1, 4}},
            {{1, 1, 2, 3}, {2, 2, 4, 7}, {1, -1, 0, 1}},
            {{0, 2, 4}, {3, 1, 5}},
        };
        for (double[][] s : systems) System.out.println(gaussJordan(s));
    }
}
