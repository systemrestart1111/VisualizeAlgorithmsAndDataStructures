import java.util.*;

public class PersistentSegmentTree {
    // 節點存在陣列中；更新只複製根到葉的路徑，其餘子樹共用
    static List<int[]> nodes = new ArrayList<>(); // {sum, 左子, 右子}
    static List<Integer> roots = new ArrayList<>();
    static int n = 8;

    static int mk(int s, int l, int r) { nodes.add(new int[]{s, l, r}); return nodes.size() - 1; }
    static int build(int[] a, int lo, int hi) {
        if (lo == hi) return mk(a[lo], -1, -1);
        int m = (lo + hi) / 2, L = build(a, lo, m), R = build(a, m + 1, hi);
        return mk(nodes.get(L)[0] + nodes.get(R)[0], L, R);
    }
    static int update(int node, int lo, int hi, int i, int v) {
        if (lo == hi) return mk(v, -1, -1);
        int m = (lo + hi) / 2, L = nodes.get(node)[1], R = nodes.get(node)[2];
        if (i <= m) L = update(L, lo, m, i, v); else R = update(R, m + 1, hi, i, v);
        return mk(nodes.get(L)[0] + nodes.get(R)[0], L, R);
    }
    static int query(int node, int lo, int hi, int l, int r) {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r) return nodes.get(node)[0];
        int m = (lo + hi) / 2;
        return query(nodes.get(node)[1], lo, m, l, r) + query(nodes.get(node)[2], m + 1, hi, l, r);
    }
    // 以最新版本為基礎建立新版本
    static void set(int i, int v) { roots.add(update(roots.get(roots.size() - 1), 0, n - 1, i, v)); }

    public static void main(String[] args) {
        roots.add(build(new int[]{4, 1, 3, 5, 2, 6, 1, 3}, 0, n - 1));
        set(2, 7);
        set(5, 0);
        for (int v = 0; v < 3; v++) System.out.println("version " + v + ": sum[0,7] = " + query(roots.get(v), 0, n - 1, 0, 7) + ", sum[2,5] = " + query(roots.get(v), 0, n - 1, 2, 5));
        System.out.println("total nodes: " + nodes.size() + " (15 + 4 + 4)");
    }
}
