import java.util.*;

public class TarjanOfflineLca {
    static Map<Integer, List<Integer>> children = new HashMap<>();
    static int[] parent = new int[11], ancestor = new int[11];
    static boolean[] visited = new boolean[11];
    static int[][] Q = {{8, 9}, {4, 8}, {6, 10}, {9, 6}, {3, 3}};
    static Integer[] ans = new Integer[Q.length];

    static int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    // 子樹 v 完成後併入 u 的集合；u 結束時回答所有另一端已拜訪的查詢
    static void dfs(int u) {
        ancestor[u] = u;
        for (int v : children.getOrDefault(u, List.of())) {
            dfs(v);
            parent[find(v)] = find(u);
            ancestor[find(u)] = u;
        }
        visited[u] = true;
        for (int i = 0; i < Q.length; i++) {
            int w = Q[i][0] == u ? Q[i][1] : Q[i][1] == u ? Q[i][0] : -1;
            if (w >= 0 && visited[w] && ans[i] == null) ans[i] = ancestor[find(w)];
        }
    }

    public static void main(String[] args) {
        int[][] E = {{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {5, 9}, {7, 10}};
        for (int i = 0; i < 11; i++) parent[i] = i;
        for (int[] e : E) children.computeIfAbsent(e[0], k -> new ArrayList<>()).add(e[1]);
        dfs(1);
        for (int i = 0; i < Q.length; i++) System.out.println("lca(" + Q[i][0] + ", " + Q[i][1] + ") = " + ans[i]);
    }
}
