import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Knapsack01 {
    // dp[i][w] = 只考慮前 i 件、容量 w 時的最大價值；第 i 件「不拿」或「拿」（每件只能拿一次）
    public static void main(String[] args) {
        int[][] items = {{1, 1}, {3, 4}, {4, 5}, {5, 7}}; // (重量, 價值)
        int n = items.length, W = 7;
        int[][] dp = new int[n + 1][W + 1];
        for (int i = 1; i <= n; i++)
            for (int w = 0; w <= W; w++) {
                dp[i][w] = dp[i - 1][w];
                if (w >= items[i - 1][0]) dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - items[i - 1][0]] + items[i - 1][1]);
            }
        List<Integer> chosen = new ArrayList<>();
        for (int i = n, w = W; i >= 1; i--) // 從表格倒推：值有變化就代表拿了第 i 件
            if (dp[i][w] != dp[i - 1][w]) { chosen.add(i); w -= items[i - 1][0]; }
        Collections.reverse(chosen);
        StringBuilder sb = new StringBuilder("best value = " + dp[n][W] + "\nitems (1-based):");
        for (int i : chosen) sb.append(' ').append(i);
        sb.append("\nlast row:");
        for (int x : dp[n]) sb.append(' ').append(x);
        System.out.println(sb);
    }
}
