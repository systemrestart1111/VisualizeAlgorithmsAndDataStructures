import java.util.Arrays;
import java.util.stream.Collectors;

public class HeapSort {
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    // 把 a[i] 往下沉，直到它比兩個子節點都大（最大堆積）
    static void siftDown(int[] a, int i, int n) {
        for (;;) {
            int big = i, l = 2 * i + 1, r = 2 * i + 2;
            if (l < n && a[l] > a[big]) big = l;
            if (r < n && a[r] > a[big]) big = r;
            if (big == i) return;
            swap(a, i, big);
            i = big;
        }
    }

    static void heapSort(int[] a) {
        int n = a.length;
        for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n); // 由下往上建堆
        for (int end = n - 1; end > 0; end--) {                 // 每次把最大值換到尾端
            swap(a, 0, end);
            siftDown(a, 0, end);
        }
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
        heapSort(a);
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
