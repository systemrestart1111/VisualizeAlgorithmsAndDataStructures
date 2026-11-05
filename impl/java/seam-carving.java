import java.util.*;

public class SeamCarving {
    static final int N = 16;

    static List<List<Integer>> preset(boolean step) {
        List<List<Integer>> a = new ArrayList<>();
        for (int r = 0; r < N; r++) {
            List<Integer> row = new ArrayList<>();
            for (int c = 0; c < N; c++) {
                if (step) { row.add((c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0)); continue; }
                int v = 30;
                if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
                if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
                if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
                row.add(v);
            }
            a.add(row);
        }
        return a;
    }

    // e = |Gx| + |Gy|；M[r][c] = e + min(M[r−1][c−1..c+1])；最後一列取最小，再往上追溯
    static int findSeam(List<List<Integer>> A, int[] seam) {
        int W = A.get(0).size();
        int[][] M = new int[N][W];
        for (int r = 0; r < N; r++)
            for (int c = 0; c < W; c++) {
                int gx = g(A, r - 1, c + 1, W) + 2 * g(A, r, c + 1, W) + g(A, r + 1, c + 1, W) - g(A, r - 1, c - 1, W) - 2 * g(A, r, c - 1, W) - g(A, r + 1, c - 1, W);
                int gy = g(A, r + 1, c - 1, W) + 2 * g(A, r + 1, c, W) + g(A, r + 1, c + 1, W) - g(A, r - 1, c - 1, W) - 2 * g(A, r - 1, c, W) - g(A, r - 1, c + 1, W);
                M[r][c] = Math.abs(gx) + Math.abs(gy);
            }
        for (int r = 1; r < N; r++)
            for (int c = 0; c < W; c++) {
                int m = M[r - 1][c];
                if (c > 0) m = Math.min(m, M[r - 1][c - 1]);
                if (c < W - 1) m = Math.min(m, M[r - 1][c + 1]);
                M[r][c] += m;
            }
        int best = 0;
        for (int c = 1; c < W; c++) if (M[N - 1][c] < M[N - 1][best]) best = c;
        seam[N - 1] = best;
        for (int r = N - 2; r >= 0; r--) {
            int b = seam[r + 1];
            for (int k : new int[]{seam[r + 1] - 1, seam[r + 1] + 1}) if (k >= 0 && k < W && M[r][k] < M[r][b]) b = k;
            seam[r] = b;
        }
        return M[N - 1][seam[N - 1]];
    }
    static int g(List<List<Integer>> A, int r, int c, int W) { return A.get(Math.min(N - 1, Math.max(0, r))).get(Math.min(W - 1, Math.max(0, c))); }

    public static void main(String[] args) {
        for (String name : new String[]{"shapes", "step"}) {
            List<List<Integer>> A = preset(name.equals("step"));
            for (int s = 1; s <= 3; s++) {
                int[] seam = new int[N];
                int cost = findSeam(A, seam);
                boolean ok = true;
                for (int r = 1; r < N; r++) if (Math.abs(seam[r] - seam[r - 1]) > 1) ok = false;
                StringBuilder sb = new StringBuilder();
                for (int c : seam) sb.append(' ').append(c);
                System.out.println(name + " seam " + s + ": cost " + cost + ", columns" + sb + ", connected " + (ok ? "True" : "False"));
                for (int r = 0; r < N; r++) A.get(r).remove(seam[r]);
            }
            int sum = 0;
            for (List<Integer> row : A) for (int v : row) sum += v;
            System.out.println(name + ": width now " + A.get(0).size() + ", pixel sum " + sum);
        }
    }
}
