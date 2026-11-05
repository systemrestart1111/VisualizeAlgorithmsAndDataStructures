import java.util.Arrays;
import java.util.stream.Collectors;

public class BitonicSort {
    // 雙調排序（n 為 2 的冪）：比較網路，每一層的比較互不相依，適合平行硬體
    static void bitonicSort(int[] a) {
        int n = a.length;
        for (int k = 2; k <= n; k *= 2)
            for (int j = k / 2; j > 0; j /= 2)
                for (int i = 0; i < n; i++) {
                    int p = i ^ j;
                    if (p > i) {
                        boolean up = (i & k) == 0;
                        if ((a[i] > a[p]) == up) { int t = a[i]; a[i] = a[p]; a[p] = t; }
                    }
                }
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14};
        bitonicSort(a);
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
