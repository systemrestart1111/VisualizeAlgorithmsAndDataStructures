import java.util.Arrays;
import java.util.stream.Collectors;

public class DifferenceArray {
    // 差分陣列：區間 [l, r] 加 v 只需 d[l] += v、d[r+1] -= v，最後做一次前綴和還原
    static void applyUpdates(int[] a, int[][] ops) {
        int[] d = new int[a.length + 1];
        for (int[] op : ops) {
            d[op[0]] += op[2];
            d[op[1] + 1] -= op[2];
        }
        int run = 0;
        for (int i = 0; i < a.length; i++) {
            run += d[i];
            a[i] += run;
        }
    }

    public static void main(String[] args) {
        int[] a = new int[10];
        Arrays.fill(a, 5);
        applyUpdates(a, new int[][] {{1, 4, 3}, {3, 7, 2}, {0, 2, -1}, {6, 9, 5}});
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
