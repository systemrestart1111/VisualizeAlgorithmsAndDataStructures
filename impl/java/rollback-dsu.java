import java.util.*;

public class RollbackDsu {
    static int[] p = new int[8], sz = new int[8];
    static Deque<int[]> hist = new ArrayDeque<>();

    static int find(int x) { while (p[x] != x) x = p[x]; return x; }   // 不做路徑壓縮
    // 依大小合併；每次合併推入紀錄
    static boolean union(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;
        if (sz[rx] > sz[ry]) { int t = rx; rx = ry; ry = t; }
        p[rx] = ry;
        sz[ry] += sz[rx];
        hist.push(new int[]{rx, ry});
        return true;
    }
    static void rollback(int snap) {
        while (hist.size() > snap) { int[] h = hist.pop(); p[h[0]] = h[0]; sz[h[1]] -= sz[h[0]]; }
    }
    static void show(String label) {
        StringBuilder sb = new StringBuilder(label);
        for (int x : p) sb.append(' ').append(x);
        sb.append(" | sizes:");
        for (int x : sz) sb.append(' ').append(x);
        System.out.println(sb);
    }

    public static void main(String[] args) {
        for (int i = 0; i < 8; i++) { p[i] = i; sz[i] = 1; }
        union(0, 1); union(2, 3);
        int s = hist.size();
        union(1, 3); union(4, 5); union(5, 0);
        show("parents:");
        System.out.println("same(4, 2): " + (find(4) == find(2) ? "True" : "False"));
        rollback(s);
        show("after rollback:");
        System.out.println("same(4, 2): " + (find(4) == find(2) ? "True" : "False") + " | same(0, 1): " + (find(0) == find(1) ? "True" : "False"));
    }
}
