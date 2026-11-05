import java.util.Arrays;
import java.util.stream.Collectors;

public class OddEvenSort {
    // 奇偶換位排序：交替比較 (奇, 偶) 與 (偶, 奇) 相鄰對，直到沒有交換
    static void oddEvenSort(int[] a) {
        boolean done = false;
        while (!done) {
            done = true;
            for (int start = 1; start >= 0; start--)
                for (int i = start; i + 1 < a.length; i += 2)
                    if (a[i] > a[i + 1]) {
                        int t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
                        done = false;
                    }
        }
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
        oddEvenSort(a);
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
