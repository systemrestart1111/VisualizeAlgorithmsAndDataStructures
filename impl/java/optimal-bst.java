public class OptimalBst {
    static int[] KEYS = {10, 20, 30, 40, 50}, P = {15, 10, 5, 10, 20}, Q = {5, 10, 5, 5, 5, 10};
    static int n = KEYS.length;
    static int[][] root = new int[n + 1][n + 1];

    static void preorder(int i, int j, StringBuilder sb) {
        if (i > j) return;
        int r = root[i][j];
        sb.append(' ').append(KEYS[r - 1]);
        preorder(i, r - 1, sb);
        preorder(r + 1, j, sb);
    }

    public static void main(String[] args) {
        int[][] e = new int[n + 2][n + 1], w = new int[n + 2][n + 1];
        for (int i = 1; i <= n + 1; i++) e[i][i - 1] = w[i][i - 1] = Q[i - 1];
        for (int len = 1; len <= n; len++)
            for (int i = 1; i + len - 1 <= n; i++) {
                int j = i + len - 1;
                w[i][j] = w[i][j - 1] + P[j - 1] + Q[j];
                e[i][j] = Integer.MAX_VALUE;
                for (int r = i; r <= j; r++) { int t = e[i][r - 1] + e[r + 1][j] + w[i][j]; if (t < e[i][j]) { e[i][j] = t; root[i][j] = r; } } // 枚舉根
            }
        System.out.println("min expected cost: " + e[1][n]);
        StringBuilder sb = new StringBuilder("root: " + KEYS[root[1][n] - 1] + " | preorder:");
        preorder(1, n, sb);
        System.out.println(sb);
    }
}
