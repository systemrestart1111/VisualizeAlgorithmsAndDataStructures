public class LCS {
    // dp[i][j] = a 前 i 字與 b 前 j 字的 LCS 長度；字元相同取左上 +1，否則取上方與左方較大者
    public static void main(String[] args) {
        String a = "ABCBDAB", b = "BDCABA";
        int m = a.length(), n = b.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        StringBuilder out = new StringBuilder();
        for (int i = m, j = n; i > 0 && j > 0;) { // 由右下角倒推還原一組 LCS
            if (a.charAt(i - 1) == b.charAt(j - 1)) { out.append(a.charAt(i - 1)); i--; j--; }
            else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
            else j--;
        }
        System.out.println("LCS length = " + dp[m][n] + "\none LCS = " + out.reverse());
    }
}
