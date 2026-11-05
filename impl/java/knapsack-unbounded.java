public class KnapsackUnbounded {
    // 一維 dp[w] 由小到大更新：dp[w - wi] 可能已經包含第 i 種，因此同一種能重複拿
    public static void main(String[] args) {
        int[][] items = {{2, 3}, {3, 5}, {4, 7}, {5, 8}}; // (重量, 價值)，每種可拿無限次
        int W = 11;
        int[] dp = new int[W + 1];
        for (int w = 1; w <= W; w++)
            for (int[] it : items)
                if (w >= it[0]) dp[w] = Math.max(dp[w], dp[w - it[0]] + it[1]);
        StringBuilder sb = new StringBuilder("best value = " + dp[W] + "\ndp:");
        for (int x : dp) sb.append(' ').append(x);
        System.out.println(sb);
    }
}
