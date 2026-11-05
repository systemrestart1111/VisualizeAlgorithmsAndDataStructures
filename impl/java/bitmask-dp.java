import java.util.Arrays;

public class BitmaskDP {
    // dp[mask] = mask 這些工作已分配給前 popcount(mask) 位工人時的最小成本
    public static void main(String[] args) {
        int[][] cost = {{9, 2, 7, 8}, {6, 4, 3, 7}, {5, 8, 1, 8}, {7, 6, 9, 4}}; // cost[工人][工作]
        int n = cost.length, INF = 1_000_000_000;
        int[] dp = new int[1 << n], choice = new int[1 << n];
        Arrays.fill(dp, INF);
        Arrays.fill(choice, -1);
        dp[0] = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (dp[mask] == INF) continue;
            int k = Integer.bitCount(mask); // 下一位要分配的工人
            if (k == n) continue;
            for (int j = 0; j < n; j++)
                if ((mask >> j & 1) == 0) {
                    int nm = mask | 1 << j;
                    if (dp[mask] + cost[k][j] < dp[nm]) { dp[nm] = dp[mask] + cost[k][j]; choice[nm] = j; }
                }
        }
        int full = (1 << n) - 1, mask = full;
        int[] assign = new int[n];
        for (int k = n - 1; k >= 0; k--) { assign[k] = choice[mask]; mask ^= 1 << choice[mask]; } // 倒推每位工人分到的工作
        for (int k = 0; k < n; k++) System.out.println("worker " + k + " -> job " + assign[k] + " (cost " + cost[k][assign[k]] + ")");
        System.out.println("min total cost = " + dp[full]);
    }
}
