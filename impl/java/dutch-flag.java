import java.util.Arrays;
import java.util.stream.Collectors;

public class DutchFlag {
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }

    // 荷蘭國旗：lt 左邊 < p，gt 右邊 > p，中間 = p；一次掃描完成
    public static void main(String[] args) {
        int[] a = {2, 0, 1, 2, 1, 0, 0, 2, 1, 1, 0, 2, 1, 0};
        int p = 1, lt = 0, i = 0, gt = a.length - 1;
        while (i <= gt) {
            if (a[i] < p) swap(a, lt++, i++);
            else if (a[i] > p) swap(a, i, gt--);
            else i++;
        }
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
        System.out.println("< p: [0, " + lt + "), = p: [" + lt + ", " + gt + "], > p: (" + gt + ", " + a.length + ")");
    }
}
