public class LongestCommonSubstring {
    // 相同字元沿對角線延伸，不同就歸零；表中最大值即答案（必須連續）。L 為對照用的最長共同子序列
    static void run(String a, String b) {
        int n = a.length(), m = b.length(), best = 0, end = 0;
        int[][] dp = new int[n + 1][m + 1], L = new int[n + 1][m + 1];
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++) {
                if (a.charAt(i - 1) == b.charAt(j - 1)) { dp[i][j] = dp[i - 1][j - 1] + 1; if (dp[i][j] > best) { best = dp[i][j]; end = i; } }
                L[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? L[i - 1][j - 1] + 1 : Math.max(L[i - 1][j], L[i][j - 1]);
            }
        System.out.println(a + " / " + b + ": substring '" + a.substring(end - best, end) + "' (" + best + "), subsequence length " + L[n][m]);
    }

    public static void main(String[] args) {
        run("ABABCABA", "BABCAACB");
        run("ABCDXYZ", "XYZABCD");
        run("ABC", "DEF");
    }
}
