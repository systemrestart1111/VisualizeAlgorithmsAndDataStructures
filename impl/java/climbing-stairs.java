public class ClimbingStairs {
    // dp[i] = 爬到第 i 階的方法數 = Σ dp[i - s]（s 為每次可爬的階數）
    static long[] climb(int n, int[] steps) {
        long[] dp = new long[n + 1];
        dp[0] = 1;
        for (int i = 1; i <= n; i++)
            for (int s : steps)
                if (i >= s) dp[i] += dp[i - s];
        return dp;
    }

    public static void main(String[] args) {
        long[] dp = climb(8, new int[] {1, 2});
        StringBuilder sb = new StringBuilder("ways(8) = " + dp[8] + "\ndp:");
        for (long x : dp) sb.append(' ').append(x);
        System.out.println(sb);
    }
}
