import java.util.Arrays;
import java.util.stream.Collectors;

public class ArrayRotation {
    static void reverse(int[] a, int i, int j) {
        while (i < j) { int t = a[i]; a[i++] = a[j]; a[j--] = t; }
    }

    // 三次反轉：整段反轉，再分別反轉前 k 個與其餘部分
    static void rotateRight(int[] a, int k) {
        int n = a.length;
        k %= n;
        reverse(a, 0, n - 1);
        reverse(a, 0, k - 1);
        reverse(a, k, n - 1);
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        rotateRight(a, 3);
        System.out.println(Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(" ")));
    }
}
