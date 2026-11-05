import java.util.*;

public class WeightedIntervalScheduling {
    public static void main(String[] args) {
        int[][] a = {{0, 3, 2}, {2, 9, 20}, {3, 5, 3}, {5, 7, 4}, {7, 10, 3}, {9, 12, 6}, {10, 14, 2}};
        Arrays.sort(a, (x, y) -> x[1] != y[1] ? Integer.compare(x[1], y[1]) : Integer.compare(x[0], y[0]));
        int n = a.length;
        // p[j] = 結束 ≤ s_j 的活動個數；dp[j] = max(dp[j−1], w_j + dp[p(j)])
        int[] p = new int[n], dp = new int[n + 1];
        for (int j = 0; j < n; j++) { int lo = 0, hi = n; while (lo < hi) { int m = (lo + hi) / 2; if (a[m][1] <= a[j][0]) lo = m + 1; else hi = m; } p[j] = lo; }
        for (int j = 1; j <= n; j++) dp[j] = Math.max(dp[j - 1], a[j - 1][2] + dp[p[j - 1]]);
        LinkedList<int[]> pick = new LinkedList<>();
        for (int j = n; j > 0;) { if (dp[j] != dp[j - 1]) { pick.addFirst(a[j - 1]); j = p[j - 1]; } else j--; }
        StringBuilder sb = new StringBuilder("best total: " + dp[n] + " chosen:");
        for (int[] x : pick) sb.append(" [").append(x[0]).append(',').append(x[1]).append(")w").append(x[2]);
        System.out.println(sb);
        int last = -1000, greedy = 0;
        for (int[] x : a) if (x[0] >= last) { greedy += x[2]; last = x[1]; }
        System.out.println("earliest-finish greedy: " + greedy);
    }
}
