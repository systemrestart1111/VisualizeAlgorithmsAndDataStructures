import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SubsetSum {
    // dp[i][s] = 前 i 個數能否湊出 s = dp[i-1][s] or dp[i-1][s - a[i]]
    public static void main(String[] args) {
        int[] a = {3, 34, 4, 12, 5, 2};
        int n = a.length, T = 9;
        boolean[][] dp = new boolean[n + 1][T + 1];
        dp[0][0] = true;
        for (int i = 1; i <= n; i++)
            for (int s = 0; s <= T; s++)
                dp[i][s] = dp[i - 1][s] || (s >= a[i - 1] && dp[i - 1][s - a[i - 1]]);
        System.out.println("possible = " + (dp[n][T] ? "True" : "False"));
        if (dp[n][T]) {
            List<Integer> pick = new ArrayList<>();
            for (int i = n, s = T; i >= 1; i--) // 若不用第 i 個就湊不出來，代表一定要用它
                if (!dp[i - 1][s]) { pick.add(a[i - 1]); s -= a[i - 1]; }
            Collections.reverse(pick);
            StringBuilder sb = new StringBuilder("subset:");
            for (int x : pick) sb.append(' ').append(x);
            System.out.println(sb);
        }
    }
}
