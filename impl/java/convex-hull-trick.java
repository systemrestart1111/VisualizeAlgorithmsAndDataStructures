import java.util.*;

public class ConvexHullTrick {
    static long f(long[] l, long X) { return l[0] * X + l[1]; }
    static boolean bad(long[] l1, long[] l2, long[] l3) { return (l3[1] - l1[1]) * (l1[0] - l2[0]) <= (l2[1] - l1[1]) * (l1[0] - l3[0]); }

    // dp[i] = min_j dp[j] + (x_i − x_j)² + C；直線 y = −2x_j·X + dp[j] + x_j²，斜率遞減、查詢遞增
    static long[] frog(long[] x, long C) {
        int n = x.length;
        long[] dp = new long[n];
        ArrayDeque<long[]> dq = new ArrayDeque<>();
        dq.add(new long[]{-2 * x[0], x[0] * x[0]});
        for (int i = 1; i < n; i++) {
            while (dq.size() >= 2) {
                long[] a = dq.pollFirst(), b = dq.peekFirst();
                if (f(b, x[i]) <= f(a, x[i])) continue;
                dq.addFirst(a);
                break;
            }
            dp[i] = f(dq.peekFirst(), x[i]) + x[i] * x[i] + C;
            long[] nl = {-2 * x[i], dp[i] + x[i] * x[i]};
            while (dq.size() >= 2) {
                long[] last = dq.pollLast(), prev = dq.peekLast();
                if (bad(prev, last, nl)) continue;
                dq.addLast(last);
                break;
            }
            dq.addLast(nl);
        }
        return dp;
    }

    public static void main(String[] args) {
        long[] x = {1, 3, 4, 7, 8, 11, 12, 15};
        for (long C : new long[]{10, 0, 100}) {
            long[] dp = frog(x, C), nd = new long[x.length];
            for (int i = 1; i < x.length; i++) { nd[i] = Long.MAX_VALUE; for (int j = 0; j < i; j++) nd[i] = Math.min(nd[i], nd[j] + (x[i] - x[j]) * (x[i] - x[j]) + C); }
            StringBuilder sb = new StringBuilder("C = " + C + ": dp =");
            for (long v : dp) sb.append(' ').append(v);
            System.out.println(sb + " | naive last = " + nd[x.length - 1]);
        }
    }
}
