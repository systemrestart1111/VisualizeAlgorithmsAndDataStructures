import java.util.*;

public class MoAlgorithm {
    static int distinct = 0, moves = 0;
    static Map<Integer, Integer> cnt = new HashMap<>();
    static void add(int x) { if (cnt.merge(x, 1, Integer::sum) == 1) distinct++; moves++; }
    static void rem(int x) { if (cnt.merge(x, -1, Integer::sum) == 0) distinct--; moves++; }

    public static void main(String[] args) {
        int[] a = {1, 2, 1, 3, 2, 2, 4, 1, 5, 3, 4, 4};
        int[][] Q = {{0, 4}, {2, 7}, {5, 11}, {1, 3}, {6, 9}, {0, 11}};
        int B = Math.max(1, (int) Math.ceil(Math.sqrt(a.length)));
        // 查詢依 (l 所在塊, r) 排序，左右指標逐格移動並維護相異數
        Integer[] order = new Integer[Q.length];
        for (int i = 0; i < Q.length; i++) order[i] = i;
        Arrays.sort(order, Comparator.comparingInt((Integer i) -> Q[i][0] / B).thenComparingInt(i -> Q[i][1]));
        int L = 0, R = -1;
        int[] ans = new int[Q.length];
        for (int i : order) {
            int l = Q[i][0], r = Q[i][1];
            while (R < r) add(a[++R]);
            while (L > l) add(a[--L]);
            while (R > r) rem(a[R--]);
            while (L < l) rem(a[L++]);
            ans[i] = distinct;
        }
        for (int i = 0; i < Q.length; i++) {
            Set<Integer> s = new HashSet<>();
            for (int j = Q[i][0]; j <= Q[i][1]; j++) s.add(a[j]);
            System.out.println("distinct[" + Q[i][0] + ", " + Q[i][1] + "] = " + ans[i] + " (brute " + s.size() + ")");
        }
        System.out.println("pointer moves: " + moves);
    }
}
