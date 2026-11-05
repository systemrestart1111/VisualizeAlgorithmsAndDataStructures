import java.util.Arrays;
import java.util.stream.Collectors;

public class IntroSort {
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    static void insertionSort(int[] a, int lo, int hi) {
        for (int i = lo + 1; i <= hi; i++) {
            int key = a[i], j = i - 1;
            while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j--; }
            a[j + 1] = key;
        }
    }

    static void sift(int[] a, int lo, int i, int size) {
        for (;;) {
            int big = i, l = 2 * i + 1, r = 2 * i + 2;
            if (l < size && a[lo + l] > a[lo + big]) big = l;
            if (r < size && a[lo + r] > a[lo + big]) big = r;
            if (big == i) return;
            swap(a, lo + i, lo + big);
            i = big;
        }
    }

    static void heapSortRange(int[] a, int lo, int hi) {
        int n = hi - lo + 1;
        for (int i = n / 2 - 1; i >= 0; i--) sift(a, lo, i, n);
        for (int end = n - 1; end > 0; end--) { swap(a, lo, lo + end); sift(a, lo, 0, end); }
    }

    static int partition(int[] a, int lo, int hi) {
        int pivot = a[hi], i = lo;
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) swap(a, i++, j);
        swap(a, i, hi);
        return i;
    }

    // 快速排序為主；區間很小改用插入排序，遞迴太深改用堆積排序，保證 O(n log n)
    static void intro(int[] a, int lo, int hi, int depth, int small) {
        if (hi - lo + 1 <= small) insertionSort(a, lo, hi);
        else if (depth == 0) heapSortRange(a, lo, hi);
        else {
            int p = partition(a, lo, hi);
            intro(a, lo, p - 1, depth - 1, small);
            intro(a, p + 1, hi, depth - 1, small);
        }
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23, 50, 8};
        int depth = 2 * (31 - Integer.numberOfLeadingZeros(a.length));
        intro(a, 0, a.length - 1, depth, 4);
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
