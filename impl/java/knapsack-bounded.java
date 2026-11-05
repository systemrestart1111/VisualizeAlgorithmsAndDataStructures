import java.util.ArrayList;
import java.util.List;

public class KnapsackBounded {
    // 二進位拆分：數量 c 拆成 1, 2, 4, …, 餘數 這幾包，任意 0..c 件都能由它們組合出來，之後當成 0/1 背包
    public static void main(String[] args) {
        int[][] items = {{2, 3, 3}, {3, 4, 2}, {4, 6, 4}}; // (重量, 價值, 數量)
        int W = 12;
        List<int[]> pieces = new ArrayList<>();
        for (int[] it : items)
            for (int c = it[2], k = 1; c > 0; k *= 2) {
                int take = Math.min(k, c);
                pieces.add(new int[] {it[0] * take, it[1] * take});
                c -= take;
            }
        StringBuilder sb = new StringBuilder("pieces:");
        for (int[] p : pieces) sb.append(" (").append(p[0]).append(',').append(p[1]).append(')');
        System.out.println(sb);
        int[] dp = new int[W + 1];
        for (int[] p : pieces)
            for (int w = W; w >= p[0]; w--) dp[w] = Math.max(dp[w], dp[w - p[0]] + p[1]); // 容量由大到小
        System.out.println("best value = " + dp[W]);
    }
}
