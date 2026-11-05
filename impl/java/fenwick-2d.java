public class Fenwick2d {
    static final int N = 6;
    static int[][] t = new int[N + 1][N + 1], a = new int[N + 1][N + 1];

    // 兩個維度各自沿 lowbit 跳：更新往上、查詢往下（1 起算）
    static void add(int r, int c, int v) { for (int i = r; i <= N; i += i & -i) for (int j = c; j <= N; j += j & -j) t[i][j] += v; }
    static int prefix(int r, int c) { int s = 0; for (int i = r; i > 0; i -= i & -i) for (int j = c; j > 0; j -= j & -j) s += t[i][j]; return s; }
    static int rect(int r1, int c1, int r2, int c2) { return prefix(r2, c2) - prefix(r1 - 1, c2) - prefix(r2, c1 - 1) + prefix(r1 - 1, c1 - 1); }

    public static void main(String[] args) {
        int[][] ups = {{1, 1, 3}, {2, 3, 5}, {4, 2, 2}, {3, 5, 4}, {6, 6, 1}, {5, 4, 6}}, qs = {{1, 1, 6, 6}, {2, 2, 4, 5}, {3, 3, 3, 3}, {4, 1, 6, 4}};
        for (int[] u : ups) { add(u[0], u[1], u[2]); a[u[0]][u[1]] += u[2]; }
        for (int[] q : qs) {
            int brute = 0;
            for (int i = q[0]; i <= q[2]; i++) for (int j = q[1]; j <= q[3]; j++) brute += a[i][j];
            System.out.println("sum(" + q[0] + ", " + q[1] + ", " + q[2] + ", " + q[3] + ") = " + rect(q[0], q[1], q[2], q[3]) + " (brute " + brute + ")");
        }
        add(4, 4, 10);
        System.out.println("after add(4, 4, 10): sum(2, 2, 4, 5) = " + rect(2, 2, 4, 5));
    }
}
