import java.util.ArrayList;
import java.util.List;

public class HeavyLightDecomposition {
    static final int N = 15;
    static List<List<Integer>> children = new ArrayList<>();
    static int[] parent = new int[N], depth = new int[N], size = new int[N], heavy = new int[N], head = new int[N], pos = new int[N];
    static List<Integer> order = new ArrayList<>();

    // 計算子樹大小；子樹最大的孩子是重兒子（相同時取先出現的）
    static void dfsSize(int u) {
        size[u] = 1;
        for (int v : children.get(u)) {
            parent[v] = u;
            depth[v] = depth[u] + 1;
            dfsSize(v);
            size[u] += size[v];
            if (heavy[u] == 0 || size[v] > size[heavy[u]]) heavy[u] = v;
        }
    }

    // 沿重兒子延伸同一條重鏈（head 相同、pos 連續），輕兒子各自開新鏈
    static void decompose(int u, int h) {
        head[u] = h;
        pos[u] = order.size();
        order.add(u);
        if (heavy[u] != 0) decompose(heavy[u], h);
        for (int v : children.get(u))
            if (v != heavy[u]) decompose(v, v);
    }

    static void printRange(int lo, int hi) {
        StringBuilder sb = new StringBuilder(" ");
        for (int i = lo; i <= hi; i++) sb.append(' ').append(order.get(i));
        System.out.println(sb);
    }

    // 路徑 a–b 拆成 O(log n) 段，每段都是重鏈上 pos 連續的一段
    static void pathSegments(int a, int b) {
        while (head[a] != head[b]) {
            if (depth[head[a]] < depth[head[b]]) { int t = a; a = b; b = t; }
            printRange(pos[head[a]], pos[a]);
            a = parent[head[a]];
        }
        printRange(Math.min(pos[a], pos[b]), Math.max(pos[a], pos[b]));
    }

    public static void main(String[] args) {
        int[][] edges = {{1, 2}, {1, 3}, {1, 4}, {2, 5}, {2, 6}, {3, 7}, {5, 8}, {5, 9}, {5, 10}, {7, 11}, {9, 12}, {4, 13}, {13, 14}};
        for (int i = 0; i < N; i++) children.add(new ArrayList<>());
        for (int[] e : edges) children.get(e[0]).add(e[1]);
        dfsSize(1);
        decompose(1, 1);
        System.out.println("chains:");
        for (int u : order) {
            if (head[u] != u) continue;
            StringBuilder sb = new StringBuilder(" ");
            for (int v = u; v != 0; v = heavy[v]) sb.append(' ').append(v);
            System.out.println(sb);
        }
        System.out.println("path(12, 14) segments:");
        pathSegments(12, 14);
    }
}
