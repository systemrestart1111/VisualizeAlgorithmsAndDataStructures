public class IntervalDP {
    static int[] stones = {4, 1, 2, 3, 5, 2};
    static int[][] cut;

    static String show(int i, int j) {
        return i == j ? String.valueOf(stones[i]) : "(" + show(i, cut[i][j]) + "+" + show(cut[i][j] + 1, j) + ")";
    }

    // 石子合併：每次合併相鄰兩堆，成本為兩堆重量和
    // dp[i][j] = 把第 i..j 堆合成一堆的最小成本 = min(dp[i][k] + dp[k+1][j]) + sum(i..j)
    public static void main(String[] args) {
        int n = stones.length;
        int[] pre = new int[n + 1];
        for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + stones[i];
        int[][] dp = new int[n][n];
        cut = new int[n][n];
        for (int len = 2; len <= n; len++)
            for (int i = 0; i + len - 1 < n; i++) {
                int j = i + len - 1;
                dp[i][j] = Integer.MAX_VALUE;
                for (int k = i; k < j; k++)
                    if (dp[i][k] + dp[k + 1][j] < dp[i][j]) { dp[i][j] = dp[i][k] + dp[k + 1][j]; cut[i][j] = k; }
                dp[i][j] += pre[j + 1] - pre[i];
            }
        System.out.println("min cost = " + dp[0][n - 1] + "\nmerge order: " + show(0, n - 1));
    }
}
