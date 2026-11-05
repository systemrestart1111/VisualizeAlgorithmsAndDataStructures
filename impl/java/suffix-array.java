import java.util.Arrays;
import java.util.Comparator;

public class SuffixArray {
    // 倍增法：先依第 1 個字元排名，之後每輪用 (前 k 字元排名, 接下來 k 字元排名) 排序，比較長度每輪加倍
    static Integer[] suffixArray(String s) {
        int n = s.length();
        Integer[] sa = new Integer[n];
        int[] rank = new int[n];
        for (int i = 0; i < n; i++) { sa[i] = i; rank[i] = s.charAt(i); }
        for (int k = 1;; k *= 2) {
            final int kk = k;
            final int[] r = rank;
            Comparator<Integer> cmp = Comparator.<Integer>comparingInt(i -> r[i]).thenComparingInt(i -> i + kk < n ? r[i + kk] : -1);
            Arrays.sort(sa, cmp);
            int[] nw = new int[n];
            for (int j = 1; j < n; j++) nw[sa[j]] = nw[sa[j - 1]] + (cmp.compare(sa[j - 1], sa[j]) != 0 ? 1 : 0);
            rank = nw;
            StringBuilder sb = new StringBuilder("k=" + k + ": ranks");
            for (int x : rank) sb.append(' ').append(x);
            System.out.println(sb);
            if (rank[sa[n - 1]] == n - 1) return sa; // 排名全部不同就完成
        }
    }

    public static void main(String[] args) {
        String s = "banana$";
        Integer[] sa = suffixArray(s);
        StringBuilder sb = new StringBuilder("SA:");
        for (int i : sa) sb.append(' ').append(i);
        System.out.println(sb);
        for (int i : sa) System.out.println(String.format("%2d %s", i, s.substring(i)));
    }
}
