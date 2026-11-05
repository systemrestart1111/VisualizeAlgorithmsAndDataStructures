import java.util.Arrays;
import java.util.stream.Collectors;

public class CombSort {
    // 比較間隔 gap 的元素，gap 每輪除以 1.3；gap 縮到 1 且沒有交換時結束
    static void combSort(int[] a) {
        int n = a.length, gap = n;
        boolean done = false;
        while (!done) {
            gap = Math.max(1, (int) (gap / 1.3));
            done = gap == 1;
            for (int i = 0; i + gap < n; i++)
                if (a[i] > a[i + gap]) {
                    int t = a[i]; a[i] = a[i + gap]; a[i + gap] = t;
                    done = false;
                }
        }
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
        combSort(a);
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
