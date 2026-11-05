import java.util.*;

public class MeetInMiddle {
    static int[] subsetSums(int[] xs, int from, int to) {
        int n = to - from;
        int[] s = new int[1 << n];
        for (int m = 0; m < (1 << n); m++) for (int i = 0; i < n; i++) if ((m >> i & 1) == 1) s[m] += xs[from + i];
        return s;
    }
    // 兩半各列舉子集合和；右半排序後，對每個左半和二分搜尋 ≤ T − s 的最大值
    static int bestAtMost(int[] a, int T) {
        int h = a.length / 2;
        int[] L = subsetSums(a, 0, h), R = subsetSums(a, h, a.length);
        Arrays.sort(R);
        int best = -1;
        for (int s : L) {
            if (s > T) continue;
            int lo = 0, hi = R.length - 1, idx = -1;
            while (lo <= hi) { int m = (lo + hi) / 2; if (R[m] <= T - s) { idx = m; lo = m + 1; } else hi = m - 1; }
            best = Math.max(best, s + R[idx]);
        }
        return best;
    }

    public static void main(String[] args) {
        int[] a = {7, 3, 12, 18, 5, 9, 14, 2};
        int[] all = subsetSums(a, 0, a.length);
        for (int T : new int[]{30, 10, 1, 1000}) {
            int brute = 0;
            for (int s : all) if (s <= T) brute = Math.max(brute, s);
            System.out.println("T = " + T + ": best = " + bestAtMost(a, T) + " brute = " + brute);
        }
    }
}
