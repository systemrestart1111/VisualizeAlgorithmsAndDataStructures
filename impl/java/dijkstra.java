import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.PriorityQueue;

public class Dijkstra {
    // 每次取出目前距離最小且尚未確定的點，確定它的距離並鬆弛所有出邊（邊權須非負）
    public static void main(String[] args) {
        int n = 6;
        int[][] edges = {{0, 1, 4}, {0, 2, 2}, {1, 2, 5}, {1, 3, 10}, {2, 4, 3}, {4, 3, 4}, {3, 5, 11}, {4, 5, 8}, {2, 5, 12}, {1, 4, 6}};
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(new int[] {e[1], e[2]}); adj.get(e[1]).add(new int[] {e[0], e[2]}); } // 無向圖
        int[] dist = new int[n], parent = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        Arrays.fill(parent, -1);
        boolean[] done = new boolean[n];
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));
        dist[0] = 0;
        pq.add(new int[] {0, 0});
        while (!pq.isEmpty()) {
            int[] t = pq.poll();
            int d = t[0], u = t[1];
            if (done[u]) continue;
            done[u] = true;
            for (int[] e : adj.get(u))
                if (d + e[1] < dist[e[0]]) {
                    dist[e[0]] = d + e[1];
                    parent[e[0]] = u;
                    pq.add(new int[] {dist[e[0]], e[0]});
                }
        }
        for (int v = 0; v < n; v++) {
            StringBuilder path = new StringBuilder();
            for (int x = v; x >= 0; x = parent[x]) path.insert(0, (parent[x] >= 0 ? " -> " : "") + (char) ('A' + x));
            System.out.println(String.format("%c: %2d  path %s", 'A' + v, dist[v], path));
        }
    }
}
