public class RandomizedQuickselect {
    static long state = 42;

    // Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
    static int randInt(int k) {
        state = state * 48271 % 2147483647;
        return (int) (state % k);
    }

    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    // 隨機選 pivot，讓已排序等「最壞輸入」也只有極低機率退化成 O(n²)；期望時間 O(n)
    static int quickselect(int[] a, int k) {
        int lo = 0, hi = a.length - 1;
        for (;;) {
            swap(a, lo + randInt(hi - lo + 1), hi);
            int pivot = a[hi], i = lo;
            for (int j = lo; j < hi; j++)
                if (a[j] < pivot) swap(a, i++, j);
            swap(a, i, hi);
            System.out.println("range [" + lo + ", " + hi + "] pivot " + pivot + " -> position " + i);
            if (i == k) return a[i];
            if (k < i) hi = i - 1;
            else lo = i + 1;
        }
    }

    public static void main(String[] args) {
        int[] a = new int[14];
        for (int i = 0; i < 14; i++) a[i] = i + 1;
        int r = quickselect(a, 3);
        System.out.println("k = 3 -> " + r);
    }
}
