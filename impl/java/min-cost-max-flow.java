import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Deque;
import java.util.List;

public class MinCostMaxFlow {
    static final String NAMES = "SABCT";
    static final int N = 5, S = 0, T = 4, INF = 1_000_000_000;
    static int[][] cap = new int[N][N], cost = new int[N][N];
    static int[] dist = new int[N], parent = new int[N];

    // 在殘餘網路上找費用最小的 S→T 路徑（有負費用的反向邊，所以用 SPFA / Bellman-Ford）
    static boolean spfa() {
        boolean[] inq = new boolean[N];
        Arrays.fill(dist, INF);
        Arrays.fill(parent, -1);
        dist[S] = 0;
        Deque<Integer> q = new ArrayDeque<>(List.of(S));
        while (!q.isEmpty()) {
            int u = q.poll();
            inq[u] = false;
            for (int v = 0; v < N; v++)
                if (cap[u][v] > 0 && dist[u] + cost[u][v] < dist[v]) {
                    dist[v] = dist[u] + cost[u][v];
                    parent[v] = u;
                    if (!inq[v]) { inq[v] = true; q.add(v); }
                }
        }
        return dist[T] < INF;
    }

    public static void main(String[] args) {
        String[] edges = {"SA 4 1", "SB 2 2", "AB 2 1", "AC 2 3", "BC 5 1", "AT 1 6", "CT 4 2", "BT 1 5"}; // 容量 單位費用
        for (String e : edges) {
            int u = NAMES.indexOf(e.charAt(0)), v = NAMES.indexOf(e.charAt(1));
            String[] p = e.substring(3).split(" ");
            cap[u][v] = Integer.parseInt(p[0]);
            cost[u][v] = Integer.parseInt(p[1]);
            cost[v][u] = -cost[u][v]; // 反向邊費用為負，退流時可以把費用扣回來
        }
        int flow = 0, total = 0;
        while (spfa()) {
            List<Integer> path = new ArrayList<>();
            for (int v = T; v != S; v = parent[v]) path.add(v);
            path.add(S);
            Collections.reverse(path);
            int b = INF;
            for (int i = 0; i + 1 < path.size(); i++) b = Math.min(b, cap[path.get(i)][path.get(i + 1)]);
            for (int i = 0; i + 1 < path.size(); i++) { cap[path.get(i)][path.get(i + 1)] -= b; cap[path.get(i + 1)][path.get(i)] += b; }
            flow += b;
            total += b * dist[T];
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < path.size(); i++) sb.append(i > 0 ? " -> " : "").append(NAMES.charAt(path.get(i)));
            System.out.println(sb + " flow " + b + " x cost " + dist[T]);
        }
        System.out.println("max flow = " + flow + " min cost = " + total);
    }
}
