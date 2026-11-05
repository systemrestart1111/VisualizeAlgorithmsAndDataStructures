import java.util.*;

public class ReroutingDp {
    public static void main(String[] args) {
        int n = 10;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] e : new int[][]{{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {5, 9}, {7, 10}}) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        List<Integer> order = new ArrayList<>(List.of(1));
        int[] par = new int[n + 1], sz = new int[n + 1], down = new int[n + 1], ans = new int[n + 1];
        par[1] = -1;
        for (int i = 0; i < order.size(); i++) for (int v : adj.get(order.get(i))) if (par[v] == 0 && v != 1) { par[v] = order.get(i); order.add(v); }
        // 第一次：由下往上算子樹大小與子樹內距離和
        for (int i = n - 1; i >= 0; i--) {
            int u = order.get(i);
            sz[u] = 1;
            for (int v : adj.get(u)) if (par[v] == u) { sz[u] += sz[v]; down[u] += down[v] + sz[v]; }
        }
        // 第二次：換根 ans[v] = ans[u] − sz[v] + (n − sz[v])
        ans[1] = down[1];
        for (int u : order) for (int v : adj.get(u)) if (par[v] == u) ans[v] = ans[u] - sz[v] + (n - sz[v]);
        int best = 1;
        StringBuilder sb = new StringBuilder("sum of distances:");
        for (int v = 1; v <= n; v++) { sb.append(' ').append(v).append(':').append(ans[v]); if (ans[v] < ans[best]) best = v; }
        System.out.println(sb);
        System.out.println("best center: " + best + " with " + ans[best]);
    }
}
