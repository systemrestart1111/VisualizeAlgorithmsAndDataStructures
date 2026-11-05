import java.util.Arrays;

public class KnuthOptimization {
    // opt[i][j−1] ≤ opt[i][j] ≤ opt[i+1][j]：只在這個範圍內枚舉切點
    static void run(int[] a) {
        int n = a.length, e1 = 0, e2 = 0;
        int[] S = new int[n + 1];
        for (int i = 0; i < n; i++) S[i + 1] = S[i] + a[i];
        int[][] dp = new int[n][n], opt = new int[n][n], nd = new int[n][n];
        for (int i = 0; i < n; i++) opt[i][i] = i;
        for (int len = 2; len <= n; len++)
            for (int i = 0; i + len - 1 < n; i++) {
                int j = i + len - 1;
                dp[i][j] = Integer.MAX_VALUE;
                for (int m = opt[i][j - 1]; m <= Math.min(opt[i + 1][j], j - 1); m++) { e1++; int t = dp[i][m] + dp[m + 1][j] + S[j + 1] - S[i]; if (t < dp[i][j]) { dp[i][j] = t; opt[i][j] = m; } }
                nd[i][j] = Integer.MAX_VALUE;
                for (int m = i; m < j; m++) { e2++; nd[i][j] = Math.min(nd[i][j], nd[i][m] + nd[m + 1][j] + S[j + 1] - S[i]); }
            }
        System.out.println(Arrays.toString(a) + ": knuth " + dp[0][n - 1] + " (" + e1 + " evals), naive " + nd[0][n - 1] + " (" + e2 + " evals)");
    }

    public static void main(String[] args) {
        run(new int[]{4, 1, 7, 3, 9, 2, 6, 5});
        run(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12});
    }
}
