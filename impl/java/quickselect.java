public class Quickselect {
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    static int partition(int[] a, int lo, int hi) {
        int pivot = a[hi], i = lo;
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) swap(a, i++, j);
        swap(a, i, hi);
        return i;
    }

    // 找第 k 小（0 起算）：分割後只往含有第 k 個位置的那一邊繼續，平均 O(n)
    static int quickselect(int[] a, int k) {
        int lo = 0, hi = a.length - 1;
        for (;;) {
            int p = partition(a, lo, hi);
            if (p == k) return a[p];
            if (k < p) hi = p - 1;
            else lo = p + 1;
        }
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
        System.out.println("k = 5 -> " + quickselect(a, 5));
    }
}
