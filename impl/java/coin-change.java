import java.util.Arrays;

public class CoinChange {
    public static void main(String[] args) {
        int[] coins = {1, 3, 4};
        int A = 10, INF = 1_000_000;
        // 最少硬幣數：dp[a] = min(dp[a - c] + 1)；記下每個金額最後用的硬幣以便還原
        int[] dp = new int[A + 1], last = new int[A + 1];
        Arrays.fill(dp, INF);
        dp[0] = 0;
        for (int a = 1; a <= A; a++)
            for (int c : coins)
                if (a >= c && dp[a - c] + 1 < dp[a]) { dp[a] = dp[a - c] + 1; last[a] = c; }
        StringBuilder sb = new StringBuilder("min coins = " + dp[A] + " ->");
        for (int a = A; a > 0; a -= last[a]) sb.append(' ').append(last[a]);
        System.out.println(sb);
        // 組合數：外層跑硬幣、內層跑金額，每種組合只會以固定的硬幣順序被數到一次
        long[] ways = new long[A + 1];
        ways[0] = 1;
        for (int c : coins)
            for (int a = c; a <= A; a++) ways[a] += ways[a - c];
        System.out.println("ways = " + ways[A]);
    }
}
