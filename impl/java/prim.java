import java.util.Arrays;

public class Prim {
    public static void main(String[] args) {
        int n = 7, INF = 1_000_000;
        int[][] edges = {{0, 1, 7}, {0, 3, 5}, {1, 2, 8}, {1, 3, 9}, {1, 4, 7}, {2, 4, 5}, {3, 4, 15}, {3, 5, 6}, {4, 5, 8}, {4, 6, 9}, {5, 6, 11}};
        int[][] w = new int[n][n];
        for (int[] e : edges) w[e[0]][e[1]] = w[e[1]][e[0]] = e[2];
        // key[v] = 把 v 接到目前這棵樹的最便宜邊；每次加入 key 最小的點，再更新鄰居的 key
        int[] key = new int[n], parent = new int[n];
        Arrays.fill(key, INF);
        Arrays.fill(parent, -1);
        boolean[] inTree = new boolean[n];
        key[0] = 0;
        int total = 0;
        for (int it = 0; it < n; it++) {
            int u = -1;
            for (int v = 0; v < n; v++)
                if (!inTree[v] && (u < 0 || key[v] < key[u])) u = v;
            inTree[u] = true;
            if (parent[u] >= 0) {
                total += key[u];
                System.out.println("take " + (char) ('A' + parent[u]) + "-" + (char) ('A' + u) + " (" + key[u] + ")");
            }
            for (int v = 0; v < n; v++)
                if (!inTree[v] && w[u][v] > 0 && w[u][v] < key[v]) { key[v] = w[u][v]; parent[v] = u; }
        }
        System.out.println("total weight = " + total);
    }
}
