import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Queue;

public class TreeDiameter {
    static List<List<Integer>> adj = new ArrayList<>();
    static int[] parent = new int[16], dist = new int[16];

    // 回傳距離最遠的點（距離相同時取最先被發現的點），並填好 parent / dist
    static int bfs(int src) {
        Arrays.fill(dist, -1);
        dist[src] = 0;
        parent[src] = -1;
        Queue<Integer> q = new ArrayDeque<>();
        q.add(src);
        int far = src;
        while (!q.isEmpty()) {
            int u = q.poll();
            if (dist[u] > dist[far]) far = u;
            for (int v : adj.get(u))
                if (dist[v] < 0) { dist[v] = dist[u] + 1; parent[v] = u; q.add(v); }
        }
        return far;
    }

    public static void main(String[] args) {
        int[][] edges = {{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {5, 9}, {6, 10}, {9, 11}, {7, 12}};
        for (int i = 0; i < 16; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int u = bfs(1); // 第一次 BFS：任意點出發的最遠點 u 一定是直徑的端點
        int v = bfs(u); // 第二次 BFS：從 u 出發的最遠點 v
        StringBuilder sb = new StringBuilder("diameter = " + dist[v] + "\npath:");
        for (; v != -1; v = parent[v]) sb.append(' ').append(v);
        System.out.println(sb);
    }
}
