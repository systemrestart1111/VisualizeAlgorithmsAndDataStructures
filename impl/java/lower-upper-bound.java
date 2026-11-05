public class LowerUpperBound {
    // 第一個 >= t 的位置
    static int lowerBound(int[] a, int t) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] < t) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    // 第一個 > t 的位置
    static int upperBound(int[] a, int t) {
        int lo = 0, hi = a.length;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] <= t) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }

    public static void main(String[] args) {
        int[] a = {2, 4, 4, 4, 7, 9, 9, 12, 15, 15, 15, 18};
        int lb = lowerBound(a, 9), ub = upperBound(a, 9);
        System.out.println("lower_bound(9) = " + lb);
        System.out.println("upper_bound(9) = " + ub);
        System.out.println("count of 9 = " + (ub - lb));
    }
}
