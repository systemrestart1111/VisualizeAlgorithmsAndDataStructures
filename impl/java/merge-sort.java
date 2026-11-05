import java.util.Arrays;
import java.util.stream.Collectors;

public class MergeSort {
    // 分成左右兩半各自排序，再把兩個有序序列合併
    static void mergeSort(int[] a, int[] tmp, int lo, int hi) {
        if (hi - lo <= 1) return;
        int mid = (lo + hi) >>> 1;
        mergeSort(a, tmp, lo, mid);
        mergeSort(a, tmp, mid, hi);
        int i = lo, j = mid, k = lo;
        while (i < mid && j < hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
        while (i < mid) tmp[k++] = a[i++];
        while (j < hi) tmp[k++] = a[j++];
        System.arraycopy(tmp, lo, a, lo, hi - lo);
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47};
        mergeSort(a, new int[a.length], 0, a.length);
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
