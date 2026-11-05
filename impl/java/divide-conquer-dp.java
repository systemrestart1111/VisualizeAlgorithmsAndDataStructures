public class DivideConquerDp {
    static long[] S, prev, cur;
    static int evals = 0;
    static long cost(int i, int j) { return (S[j] - S[i]) * (S[j] - S[i]); }

    // 最佳切點單調：先算 mid，再把左右兩半的搜尋範圍限制在 opt 兩側
    static void solve(int l, int r, int optl, int optr) {
        if (l > r) return;
        int mid = (l + r) / 2, bi = optl;
        long best = Long.MAX_VALUE;
        for (int i = optl; i <= Math.min(mid - 1, optr); i++) { evals++; long v = prev[i] + cost(i, mid); if (v < best) { best = v; bi = i; } }
        cur[mid] = best;
        solve(l, mid - 1, optl, bi);
        solve(mid + 1, r, bi, optr);
    }

    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8};
        int n = a.length, K = 4, naive = 0;
        S = new long[n + 1];
        for (int i = 0; i < n; i++) S[i + 1] = S[i] + a[i];
        prev = new long[n + 1];
        for (int j = 0; j <= n; j++) prev[j] = cost(0, j);
        for (int g = 2; g <= K; g++) { cur = new long[n + 1]; solve(1, n, 0, n - 1); prev = cur; }
        long[] nd = new long[n + 1];
        for (int j = 0; j <= n; j++) nd[j] = cost(0, j);
        for (int g = 2; g <= K; g++) {
            long[] nc = new long[n + 1];
            for (int j = 1; j <= n; j++) { nc[j] = Long.MAX_VALUE; for (int i = 0; i < j; i++) { naive++; nc[j] = Math.min(nc[j], nd[i] + cost(i, j)); } }
            nd = nc;
        }
        System.out.println("min sum of squares: " + prev[n] + " | naive: " + nd[n]);
        System.out.println("transitions evaluated: " + evals + " vs " + naive);
    }
}
