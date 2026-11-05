import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Queue;

public class DagShortestPath {
    public static void main(String[] args) {
        int n = 6;
        int[][] edges = {{0, 1, 5}, {0, 2, 3}, {1, 2, 2}, {1, 3, 6}, {2, 3, 7}, {2, 4, 4}, {2, 5, 2}, {3, 4, -1}, {3, 5, 1}, {4, 5, -2}};
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[n];
        for (int[] e : edges) { adj.get(e[0]).add(new int[] {e[1], e[2]}); indeg[e[1]]++; }
        // 先求拓撲順序；依此順序鬆弛，處理到某點時它的所有前驅都已確定，因此負權也沒問題
        Queue<Integer> q = new ArrayDeque<>();
        List<Integer> topo = new ArrayList<>();
        for (int v = 0; v < n; v++) if (indeg[v] == 0) q.add(v);
        while (!q.isEmpty()) {
            int u = q.poll();
            topo.add(u);
            for (int[] e : adj.get(u)) if (--indeg[e[0]] == 0) q.add(e[0]);
        }
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[0] = 0;
        for (int u : topo) {
            if (dist[u] == Integer.MAX_VALUE) continue;
            for (int[] e : adj.get(u)) dist[e[0]] = Math.min(dist[e[0]], dist[u] + e[1]);
        }
        StringBuilder a = new StringBuilder("topological order:"), b = new StringBuilder("dist:");
        for (int v : topo) a.append(' ').append((char) ('A' + v));
        for (int v = 0; v < n; v++) b.append(' ').append((char) ('A' + v)).append('=').append(dist[v]);
        System.out.println(a + "\n" + b);
    }
}
