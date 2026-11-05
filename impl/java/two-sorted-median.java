import java.util.Arrays;

public class TwoSortedMedian {
    // 在較短陣列上二分切點，使左半共 (m+n+1)/2 個且左半最大 ≤ 右半最小
    static double median(int[] a, int[] b) {
        if (a.length > b.length) return median(b, a);
        int m = a.length, n = b.length, half = (m + n + 1) / 2, lo = 0, hi = m;
        while (lo <= hi) {
            int i = (lo + hi) / 2, j = half - i;
            double l1 = i > 0 ? a[i - 1] : Double.NEGATIVE_INFINITY, r1 = i < m ? a[i] : Double.POSITIVE_INFINITY;
            double l2 = j > 0 ? b[j - 1] : Double.NEGATIVE_INFINITY, r2 = j < n ? b[j] : Double.POSITIVE_INFINITY;
            if (l1 <= r2 && l2 <= r1) return (m + n) % 2 == 1 ? Math.max(l1, l2) : (Math.max(l1, l2) + Math.min(r1, r2)) / 2;
            if (l1 > r2) hi = i - 1; else lo = i + 1;
        }
        return 0;
    }

    public static void main(String[] args) {
        int[][][] tests = {{{1, 3, 8, 9, 15}, {7, 11, 18, 19, 21, 25}}, {{}, {2, 3}}, {{1, 2}, {3, 4}}, {{5}, {1, 2, 3, 4}}};
        for (int[][] t : tests) System.out.println(Arrays.toString(t[0]) + " " + Arrays.toString(t[1]) + String.format(" median = %.1f", median(t[0], t[1])));
    }
}
