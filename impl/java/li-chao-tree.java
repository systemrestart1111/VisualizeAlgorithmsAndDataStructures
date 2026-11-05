import java.util.*;

public class LiChaoTree {
    static final int X = 15;
    static Map<Integer, int[]> tree = new HashMap<>();
    static int f(int[] l, int x) { return l[0] * x + l[1]; }

    // 每個節點保存在中點較小的直線；另一條只可能在某一半較小，遞迴進入那一半
    static void insert(int[] line, int o, int l, int r) {
        if (!tree.containsKey(o)) { tree.put(o, line); return; }
        int m = (l + r) / 2;
        int[] cur = tree.get(o);
        if (f(line, m) < f(cur, m)) { tree.put(o, line); line = cur; }
        if (l == r) return;
        if (f(line, l) < f(tree.get(o), l)) insert(line, 2 * o, l, m);
        else if (f(line, r) < f(tree.get(o), r)) insert(line, 2 * o + 1, m + 1, r);
    }
    static int query(int x) {
        int o = 1, l = 0, r = X, best = Integer.MAX_VALUE;
        while (tree.containsKey(o)) {
            best = Math.min(best, f(tree.get(o), x));
            if (l == r) break;
            int m = (l + r) / 2;
            if (x <= m) { o = 2 * o; r = m; } else { o = 2 * o + 1; l = m + 1; }
        }
        return best;
    }

    public static void main(String[] args) {
        int[][] lines = {{1, 2}, {-1, 10}, {0, 6}, {2, -6}, {-2, 20}, {1, 3}};
        for (int[] ln : lines) insert(ln, 1, 0, X);
        for (int x = 0; x <= X; x += 3) {
            int brute = Integer.MAX_VALUE;
            for (int[] ln : lines) brute = Math.min(brute, f(ln, x));
            System.out.printf("x = %2d: li chao %d, brute %d%n", x, query(x), brute);
        }
    }
}
