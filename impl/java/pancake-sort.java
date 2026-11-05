import java.util.*;

public class PancakeSort {
    static void flip(int[] a, int k) { for (int i = 0, j = k; i < j; i++, j--) { int t = a[i]; a[i] = a[j]; a[j] = t; } }

    // 只用前綴翻轉：最大值先翻到最前面，再翻到未排序部分的底部
    static List<Integer> pancakeSort(int[] a) {
        List<Integer> flips = new ArrayList<>();
        for (int size = a.length; size > 1; size--) {
            int m = 0;
            for (int i = 1; i < size; i++) if (a[i] > a[m]) m = i;
            if (m == size - 1) continue;
            if (m != 0) { flip(a, m); flips.add(m); }
            flip(a, size - 1);
            flips.add(size - 1);
        }
        return flips;
    }

    public static void main(String[] args) {
        int[] a = {3, 6, 1, 8, 4, 9, 2, 7, 5};
        List<Integer> f = pancakeSort(a);
        StringBuilder sb = new StringBuilder("sorted:");
        for (int x : a) sb.append(' ').append(x);
        System.out.println(sb);
        sb = new StringBuilder("flips: " + f.size() + " prefix lengths:");
        for (int k : f) sb.append(' ').append(k + 1);
        System.out.println(sb);
    }
}
