import java.util.Arrays;

public class InversionCount {
    // 合併排序：右邊元素先被取出時，左半剩下的都比它大；相等先取左邊（不算逆序）
    static long count(int[] a, int l, int r) {
        if (r - l <= 1) return 0;
        int m = (l + r) / 2;
        long c = count(a, l, m) + count(a, m, r);
        int[] tmp = new int[r - l];
        int i = l, j = m, k = 0;
        while (i < m || j < r) {
            if (j == r || (i < m && a[i] <= a[j])) tmp[k++] = a[i++];
            else { c += m - i; tmp[k++] = a[j++]; }
        }
        System.arraycopy(tmp, 0, a, l, tmp.length);
        return c;
    }

    public static void main(String[] args) {
        int[][] tests = {{8, 4, 2, 1, 7, 3, 5, 3}, {1, 2, 3}, {3, 3, 3}, {5, 4, 3, 2, 1}};
        for (int[] src : tests) {
            int brute = 0;
            for (int i = 0; i < src.length; i++) for (int j = i + 1; j < src.length; j++) if (src[i] > src[j]) brute++;
            System.out.println(Arrays.toString(src) + " inversions: " + count(src.clone(), 0, src.length) + " brute: " + brute);
        }
    }
}
