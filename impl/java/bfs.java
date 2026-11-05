import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Queue;

public class BFS {
    // 佇列先進先出：先處理完距離 d 的所有點，才輪到距離 d+1
    public static void main(String[] args) {
        String[] edges = "AB AC BD BE CF EF DG EG FH GH".split(" "); // 無向圖，每兩個字母是一條邊
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < 26; i++) adj.add(new ArrayList<>());
        int n = 0;
        for (String e : edges) {
            int a = e.charAt(0) - 'A', b = e.charAt(1) - 'A';
            adj.get(a).add(b);
            adj.get(b).add(a);
            n = Math.max(n, Math.max(a, b) + 1);
        }
        int[] dist = new int[n];
        Arrays.fill(dist, -1);
        Queue<Integer> q = new ArrayDeque<>();
        dist[0] = 0;
        q.add(0);
        StringBuilder order = new StringBuilder("order:");
        while (!q.isEmpty()) {
            int u = q.poll();
            order.append(' ').append((char) ('A' + u));
            for (int v : adj.get(u))
                if (dist[v] < 0) { dist[v] = dist[u] + 1; q.add(v); }
        }
        StringBuilder d = new StringBuilder("dist:");
        for (int v = 0; v < n; v++) d.append(' ').append((char) ('A' + v)).append('=').append(dist[v]);
        System.out.println(order + "\n" + d);
    }
}
