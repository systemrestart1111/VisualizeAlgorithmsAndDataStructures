import java.util.*;

public class AliasMethod {
    static double[] prob;
    static int[] alias;

    // Vose 別名法：縮放成平均 1，矮欄用高欄補滿，每欄最多兩個選項
    static void build(double[] W) {
        double total = 0;
        for (double w : W) { if (w < 0) throw new IllegalArgumentException("weights must be non-negative"); total += w; }
        if (total <= 0) throw new IllegalArgumentException("total weight must be positive");
        int n = W.length;
        double[] p = new double[n];
        prob = new double[n];
        alias = new int[n];
        Arrays.fill(alias, -1);
        Deque<Integer> small = new ArrayDeque<>(), large = new ArrayDeque<>();
        for (int i = 0; i < n; i++) { p[i] = W[i] / total * n; if (p[i] < 1) small.push(i); else large.push(i); }
        while (!small.isEmpty() && !large.isEmpty()) {
            int s = small.pop(), l = large.pop();
            prob[s] = p[s]; alias[s] = l;
            p[l] -= 1 - p[s];
            if (p[l] < 1) small.push(l); else large.push(l);
        }
        for (int i : small) { prob[i] = 1; alias[i] = i; }
        for (int i : large) { prob[i] = 1; alias[i] = i; }
    }
    static String list(double[] W) { StringBuilder sb = new StringBuilder("["); for (int i = 0; i < W.length; i++) sb.append(i > 0 ? ", " : "").append((long) W[i]); return sb + "]"; }

    public static void main(String[] args) {
        for (double[] W : new double[][]{{5, 1, 3, 1, 8, 2}, {0, 3, 0, 1}, {1, 1, 1, 1}, {7}}) {
            build(W);
            long st = 7;
            int n = W.length, N = 10000;
            int[] cnt = new int[n];
            // 隨機選一欄，再擲硬幣決定取本身或別名：O(1)
            for (int k = 0; k < N; k++) { st = st * 48271 % 2147483647; int i = (int) (st % n); st = st * 48271 % 2147483647; cnt[st / 2147483647.0 < prob[i] ? i : alias[i]]++; }
            double total = 0, chi = 0;
            for (double w : W) total += w;
            for (int i = 0; i < n; i++) if (W[i] > 0) { double e = W[i] / total * N; chi += (cnt[i] - e) * (cnt[i] - e) / e; }
            StringBuilder sb = new StringBuilder("weights " + list(W) + ": prob");
            for (double p : prob) sb.append(String.format(" %.4f", p));
            sb.append(", alias");
            for (int a : alias) sb.append(' ').append(a);
            sb.append(", counts");
            for (int c : cnt) sb.append(' ').append(c);
            System.out.println(sb + String.format(", chi-square %.3f", chi));
        }
        for (double[] W : new double[][]{{1, -1}, {0, 0}}) {
            try { build(W); } catch (IllegalArgumentException e) { System.out.println("weights " + list(W) + ": " + e.getMessage()); }
        }
    }
}
