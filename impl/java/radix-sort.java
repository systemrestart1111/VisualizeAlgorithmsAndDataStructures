import java.util.Arrays;

public class RadixSort {
    static String join(int[] a) {
        StringBuilder sb = new StringBuilder();
        for (int x : a) sb.append(' ').append(x);
        return sb.toString();
    }

    // LSD 基數排序：從個位數開始，每一位做一次穩定的計數排序
    static void radixSort(int[] a) {
        int mx = Arrays.stream(a).max().getAsInt();
        int[] out = new int[a.length];
        for (int exp = 1; mx / exp > 0; exp *= 10) {
            int[] cnt = new int[10];
            for (int x : a) cnt[x / exp % 10]++;
            for (int d = 1; d < 10; d++) cnt[d] += cnt[d - 1];
            for (int i = a.length - 1; i >= 0; i--) out[--cnt[a[i] / exp % 10]] = a[i];
            System.arraycopy(out, 0, a, 0, a.length);
            System.out.println("digit " + exp + ":" + join(a));
        }
    }

    public static void main(String[] args) {
        int[] a = {170, 45, 75, 90, 802, 24, 2, 66, 431, 318, 59, 7};
        radixSort(a);
        System.out.println("sorted:" + join(a));
    }
}
