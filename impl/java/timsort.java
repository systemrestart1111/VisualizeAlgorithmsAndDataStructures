import java.util.Arrays;
import java.util.stream.Collectors;

public class TimSort {
    static void insertionSort(int[] a, int lo, int hi) {
        for (int i = lo + 1; i < hi; i++) {
            int key = a[i], j = i - 1;
            while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j--; }
            a[j + 1] = key;
        }
    }

    static void merge(int[] a, int lo, int mid, int hi) {
        int[] tmp = new int[hi - lo];
        int i = lo, j = mid, k = 0;
        while (i < mid && j < hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i < mid) tmp[k++] = a[i++];
        while (j < hi) tmp[k++] = a[j++];
        System.arraycopy(tmp, 0, a, lo, tmp.length);
    }

    // 簡化版 TimSort：先把每段 minrun 個元素用插入排序排好，再兩兩合併、長度倍增
    static void timSort(int[] a, int minrun) {
        int n = a.length;
        for (int lo = 0; lo < n; lo += minrun) insertionSort(a, lo, Math.min(lo + minrun, n));
        for (int size = minrun; size < n; size *= 2)
            for (int lo = 0; lo < n; lo += 2 * size) {
                int mid = Math.min(lo + size, n), hi = Math.min(lo + 2 * size, n);
                if (mid < hi) merge(a, lo, mid, hi);
            }
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23};
        timSort(a, 4);
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
