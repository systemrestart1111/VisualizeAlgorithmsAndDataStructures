import java.util.function.ToIntFunction;

public class BinaryInsertionSort {
    // 二分找第一個 > key 的位置（upper bound），相等鍵保持原順序。回傳 {比較, 搬移}
    static <T> int[] sort(T[] a, ToIntFunction<T> key) {
        int comps = 0, moves = 0;
        for (int i = 1; i < a.length; i++) {
            T x = a[i];
            int lo = 0, hi = i;
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                comps++;
                if (key.applyAsInt(a[mid]) <= key.applyAsInt(x)) lo = mid + 1; else hi = mid;
            }
            for (int j = i; j > lo; j--) { a[j] = a[j - 1]; moves++; }
            a[lo] = x;
        }
        return new int[]{comps, moves};
    }

    public static void main(String[] args) {
        Integer[] a = {5, 2, 8, 2, 9, 1, 5, 6, 3, 5};
        int[] r = sort(a, x -> x);
        StringBuilder sb = new StringBuilder("sorted:");
        for (int x : a) sb.append(' ').append(x);
        System.out.println(sb);
        System.out.println("comparisons: " + r[0] + " moves: " + r[1]);
        String[] p = {"3a", "1b", "3c", "2d", "1e"};
        sort(p, s -> s.charAt(0) - '0');
        System.out.println("stable: " + String.join(" ", p));
    }
}
