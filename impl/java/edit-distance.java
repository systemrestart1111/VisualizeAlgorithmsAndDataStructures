import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class EditDistance {
    // dp[i][j] = a 前 i 字變成 b 前 j 字的最少操作數（插入、刪除、替換各算 1）
    public static void main(String[] args) {
        String a = "kitten", b = "sitting";
        int m = a.length(), n = b.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1) ? dp[i - 1][j - 1]
                        : 1 + Math.min(dp[i - 1][j], Math.min(dp[i][j - 1], dp[i - 1][j - 1]));
        List<String> ops = new ArrayList<>();
        for (int i = m, j = n; i > 0 || j > 0;) { // 倒推出一組操作
            if (i > 0 && j > 0 && a.charAt(i - 1) == b.charAt(j - 1)) { i--; j--; }
            else if (i > 0 && j > 0 && dp[i][j] == dp[i - 1][j - 1] + 1) { ops.add("replace " + a.charAt(i - 1) + "->" + b.charAt(j - 1)); i--; j--; }
            else if (i > 0 && dp[i][j] == dp[i - 1][j] + 1) { ops.add("delete " + a.charAt(i - 1)); i--; }
            else { ops.add("insert " + b.charAt(j - 1)); j--; }
        }
        Collections.reverse(ops);
        System.out.println("distance = " + dp[m][n] + "\nops: " + String.join(", ", ops));
    }
}
