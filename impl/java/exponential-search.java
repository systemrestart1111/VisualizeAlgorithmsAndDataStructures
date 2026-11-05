public class ExponentialSearch {
    static int binarySearch(int[] a, int t, int lo, int hi) {
        while (lo <= hi) {
            int mid = (lo + hi) >>> 1;
            if (a[mid] == t) return mid;
            if (a[mid] < t) lo = mid + 1;
            else hi = mid - 1;
        }
        return -1;
    }

    // 範圍以 1, 2, 4, 8… 倍增，找到包含 t 的區間後做二分搜尋
    static int exponentialSearch(int[] a, int t) {
        int n = a.length;
        if (n == 0) return -1;
        if (a[0] == t) return 0;
        int i = 1;
        while (i < n && a[i] <= t) i *= 2;
        return binarySearch(a, t, i / 2, Math.min(i, n - 1));
    }

    public static void main(String[] args) {
        int[] a = {2, 5, 8, 11, 15, 19, 24, 28, 33, 39, 44, 50, 57, 63, 70, 78, 85, 93};
        System.out.println("search 57 -> " + exponentialSearch(a, 57));
        System.out.println("search 60 -> " + exponentialSearch(a, 60));
    }
}
