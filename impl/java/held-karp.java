import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class HeldKarp {
    // dp[mask][j] = 從城市 0 出發、恰好走過 mask 中的城市、最後停在 j 的最短距離
    public static void main(String[] args) {
        double[][] pts = {{0, 0}, {4, 1}, {6, 4}, {3, 6}, {1, 4}, {5, 7}};
        int n = pts.length;
        double INF = 1e18;
        double EPS = 1e-9; // 浮點數比較加上容許誤差：平手時固定選編號小的城市，不受各平台浮點運算細節影響
        double[][] d = new double[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) d[i][j] = Math.sqrt((pts[i][0] - pts[j][0]) * (pts[i][0] - pts[j][0]) + (pts[i][1] - pts[j][1]) * (pts[i][1] - pts[j][1]));
        double[][] dp = new double[1 << n][n];
        int[][] par = new int[1 << n][n];
        for (double[] row : dp) Arrays.fill(row, INF);
        for (int[] row : par) Arrays.fill(row, -1);
        dp[1][0] = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            if ((mask & 1) == 0) continue;
            for (int j = 0; j < n; j++) {
                if (dp[mask][j] >= INF || (mask >> j & 1) == 0) continue;
                for (int k = 0; k < n; k++) {
                    if ((mask >> k & 1) == 1) continue;
                    int nm = mask | 1 << k;
                    if (dp[mask][j] + d[j][k] < dp[nm][k] - EPS) { dp[nm][k] = dp[mask][j] + d[j][k]; par[nm][k] = j; }
                }
            }
        }
        int full = (1 << n) - 1, last = -1;
        double best = INF;
        for (int j = 1; j < n; j++)
            if (dp[full][j] + d[j][0] < best - EPS) { best = dp[full][j] + d[j][0]; last = j; }
        List<Integer> tour = new ArrayList<>();
        for (int mask = full; last != -1;) { // 沿 par 倒推路線
            int p = par[mask][last];
            tour.add(last);
            mask ^= 1 << last;
            last = p;
        }
        Collections.reverse(tour);
        tour.add(0);
        StringBuilder sb = new StringBuilder("tour: ");
        for (int i = 0; i < tour.size(); i++) sb.append(i > 0 ? " -> " : "").append(tour.get(i));
        System.out.println(sb);
        System.out.println(String.format("length = %.4f", best));
    }
}
