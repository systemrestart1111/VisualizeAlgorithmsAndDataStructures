import java.util.*;

public class CuckooHashing {
    static int n = 7;
    static Integer[][] t = new Integer[2][7];

    static boolean isPrime(int x) { if (x < 2) return false; for (int d = 2; d * d <= x; d++) if (x % d == 0) return false; return true; }
    static int h(int i, int x) { return i == 0 ? x % n : (x / n) % n; }
    static boolean find(int x) { return Objects.equals(t[0][h(0, x)], x) || Objects.equals(t[1][h(1, x)], x); }
    // 兩張表；鍵只能在 T1[x mod N] 或 T2[(x / N) mod N]。成功回傳 null，循環時回傳手上剩下的鍵
    static Integer place(int x) {
        Integer cur = x;
        for (int k = 0; k < 2 * n; k++)
            for (int i = 0; i < 2; i++) {
                int p = h(i, cur);
                Integer old = t[i][p];
                t[i][p] = cur;
                cur = old;
                if (cur == null) return null;
            }
        return cur;
    }
    static void insert(int x) {
        if (find(x)) return;
        Integer left = place(x);
        if (left == null) return;
        List<Integer> items = new ArrayList<>();
        for (Integer[] row : t) for (Integer v : row) if (v != null) items.add(v);
        items.add(left);
        for (;;) {
            int m = n + 1;
            while (!isPrime(m)) m++;
            n = m;
            t = new Integer[2][n];
            boolean ok = true;
            for (int v : items) if (place(v) != null) { ok = false; break; }
            if (ok) break;
        }
        System.out.println("  rehash -> N = " + n);
    }
    static String show(Integer[] row) { StringBuilder sb = new StringBuilder(); for (Integer v : row) sb.append(' ').append(v == null ? "." : v.toString()); return sb.toString(); }

    public static void main(String[] args) {
        for (int x : new int[]{20, 50, 53, 75, 100, 67, 105, 3, 36, 39, 6}) { System.out.println("insert " + x); insert(x); }
        System.out.println("T1:" + show(t[0]));
        System.out.println("T2:" + show(t[1]));
        System.out.println("find 36: " + (find(36) ? "True" : "False") + " | find 37: " + (find(37) ? "True" : "False"));
        for (int i = 0; i < 2; i++) if (Objects.equals(t[i][h(i, 36)], 36)) t[i][h(i, 36)] = null;
        System.out.println("after delete 36, find 36: " + (find(36) ? "True" : "False"));
    }
}
