public class RodCutting {
    public static void main(String[] args) {
        int[] p = {1, 5, 8, 9, 10, 17, 17, 20};
        int n = p.length;
        int[] dp = new int[n + 1], cut = new int[n + 1];
        // dp[i] = max(p[k] + dp[i − k])，cut[i] 記錄最佳的第一段長度
        for (int i = 1; i <= n; i++) {
            dp[i] = -1;
            for (int k = 1; k <= i; k++) if (p[k - 1] + dp[i - k] > dp[i]) { dp[i] = p[k - 1] + dp[i - k]; cut[i] = k; }
        }
        StringBuilder sb = new StringBuilder("dp:");
        for (int x : dp) sb.append(' ').append(x);
        System.out.println(sb);
        sb = new StringBuilder("best: " + dp[n] + " cut into ");
        for (int m = n, first = 1; m > 0; m -= cut[m], first = 0) sb.append(first == 1 ? "" : " + ").append(cut[m]);
        System.out.println(sb);
        int brute = 0;
        for (int mask = 0; mask < 1 << (n - 1); mask++) {
            int s = 0, len = 1;
            for (int i = 0; i < n - 1; i++) { if ((mask >> i & 1) == 1) { s += p[len - 1]; len = 1; } else len++; }
            brute = Math.max(brute, s + p[len - 1]);
        }
        System.out.println("brute force: " + brute);
    }
}
