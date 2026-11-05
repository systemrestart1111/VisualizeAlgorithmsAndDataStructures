public class MatrixChain {
    static int[][] s;

    static String paren(int i, int j) {
        return i == j ? "A" + i : "(" + paren(i, s[i][j]) + paren(s[i][j] + 1, j) + ")";
    }

    // m[i][j] = 計算 A_i..A_j 的最少純量乘法數；枚舉最後一次相乘的切點 k
    public static void main(String[] args) {
        long[] p = {30, 35, 15, 5, 10, 20, 25}; // 矩陣 i 的大小為 p[i-1] x p[i]
        int n = p.length - 1;
        long[][] m = new long[n + 1][n + 1];
        s = new int[n + 1][n + 1];
        for (int len = 2; len <= n; len++)
            for (int i = 1; i + len - 1 <= n; i++) {
                int j = i + len - 1;
                m[i][j] = Long.MAX_VALUE;
                for (int k = i; k < j; k++) {
                    long cost = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j];
                    if (cost < m[i][j]) { m[i][j] = cost; s[i][j] = k; }
                }
            }
        System.out.println("min multiplications = " + m[1][n] + "\norder: " + paren(1, n));
    }
}
