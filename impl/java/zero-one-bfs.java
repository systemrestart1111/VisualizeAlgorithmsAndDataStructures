import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;
import java.util.List;

public class ZeroOneBFS {
    public static void main(String[] args) {
        int n = 7;
        int[][] edges = {{0, 1, 0}, {0, 2, 1}, {1, 3, 1}, {1, 2, 0}, {2, 4, 1}, {3, 4, 0}, {3, 5, 1}, {4, 6, 0}, {5, 6, 1}, {4, 5, 1}};
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(new int[] {e[1], e[2]}); adj.get(e[1]).add(new int[] {e[0], e[2]}); } // 無向圖，邊權只有 0 或 1
        // 雙端佇列：權重 0 的鄰居放前面、權重 1 的放後面，佇列始終依距離排序，效果等同 Dijkstra 但只需 O(V+E)
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        Deque<Integer> dq = new ArrayDeque<>();
        dist[0] = 0;
        dq.add(0);
        while (!dq.isEmpty()) {
            int u = dq.pollFirst();
            for (int[] e : adj.get(u))
                if (dist[u] + e[1] < dist[e[0]]) {
                    dist[e[0]] = dist[u] + e[1];
                    if (e[1] == 0) dq.addFirst(e[0]);
                    else dq.addLast(e[0]);
                }
        }
        StringBuilder sb = new StringBuilder("dist:");
        for (int v = 0; v < n; v++) sb.append(' ').append((char) ('A' + v)).append('=').append(dist[v]);
        System.out.println(sb);
    }
}
