import java.util.Arrays;
import java.util.stream.Collectors;

public class GnomeSort {
    // 像侏儒整理花盆：順序正確就前進，否則交換並後退一步
    static void gnomeSort(int[] a) {
        int i = 0;
        while (i < a.length) {
            if (i == 0 || a[i - 1] <= a[i]) i++;
            else {
                int t = a[i]; a[i] = a[i - 1]; a[i - 1] = t;
                i--;
            }
        }
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
        gnomeSort(a);
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
