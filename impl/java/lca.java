import java.util.ArrayList;
import java.util.List;

public class LowestCommonAncestor {
    static final int N = 13, LOG = 4;
    static List<List<Integer>> adj = new ArrayList<>();
    static int[][] up = new int[LOG][N];
    static int[] depth = new int[N];

    // DFS 求每個點的父節點與深度
    static void dfs(int u, int p) {
        for (int v : adj.get(u))
            if (v != p) { up[0][v] = u; depth[v] = depth[u] + 1; dfs(v, u); }
    }

    // 先把較深的點往上跳到同一深度，再兩點同時從大步到小步往上跳
    static int lca(int a, int b) {
        if (depth[a] < depth[b]) { int t = a; a = b; b = t; }
        int diff = depth[a] - depth[b];
        for (int k = 0; k < LOG; k++)
            if ((diff >> k & 1) == 1) a = up[k][a];
        if (a == b) return a;
        for (int k = LOG - 1; k >= 0; k--)
            if (up[k][a] != up[k][b]) { a = up[k][a]; b = up[k][b]; }
        return up[0][a];
    }

    public static void main(String[] args) {
        int[][] edges = {{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {5, 9}, {6, 10}, {9, 11}, {7, 12}};
        for (int i = 0; i < N; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        up[0][1] = 1;
        dfs(1, 0);
        for (int k = 1; k < LOG; k++) // up[k][v] = v 往上第 2^k 個祖先（倍增法）
            for (int v = 1; v < N; v++) up[k][v] = up[k - 1][up[k - 1][v]];
        for (int[] q : new int[][] {{8, 11}, {10, 12}, {4, 11}})
            System.out.println("LCA(" + q[0] + ", " + q[1] + ") = " + lca(q[0], q[1]));
    }
}
