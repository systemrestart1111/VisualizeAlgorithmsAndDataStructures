import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class FordFulkerson {
    static final String NAMES = "SACBDT";
    static final int N = 6, S = 0, T = 5;
    static int[][] cap = new int[N][N];

    // 在殘餘網路上用 DFS 找一條 S→T 的增廣路徑
    static boolean dfs(int u, boolean[] seen, List<Integer> path) {
        if (u == T) return true;
        seen[u] = true;
        for (int v = 0; v < N; v++)
            if (!seen[v] && cap[u][v] > 0) {
                path.add(v);
                if (dfs(v, seen, path)) return true;
                path.remove(path.size() - 1);
            }
        return false;
    }

    public static void main(String[] args) {
        String[] edges = {"SA10", "SC10", "AB4", "AC2", "AD8", "CD9", "DB6", "BT10", "DT10"};
        for (String e : edges) cap[NAMES.indexOf(e.charAt(0))][NAMES.indexOf(e.charAt(1))] += Integer.parseInt(e.substring(2)); // 殘餘容量
        int flow = 0;
        for (;;) {
            List<Integer> path = new ArrayList<>(List.of(S));
            if (!dfs(S, new boolean[N], path)) break;
            int b = Integer.MAX_VALUE;
            for (int i = 0; i + 1 < path.size(); i++) b = Math.min(b, cap[path.get(i)][path.get(i + 1)]); // 瓶頸
            for (int i = 0; i + 1 < path.size(); i++) {
                cap[path.get(i)][path.get(i + 1)] -= b;
                cap[path.get(i + 1)][path.get(i)] += b; // 反向邊讓之後可以「退回」流量
            }
            flow += b;
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < path.size(); i++) sb.append(i > 0 ? " -> " : "").append(NAMES.charAt(path.get(i)));
            System.out.println(sb + " (+" + b + ")");
        }
        System.out.println("max flow = " + flow);
        // 最後在殘餘網路上從 S 能到達的點就是最小割的 S 側
        boolean[] reach = new boolean[N];
        Deque<Integer> st = new ArrayDeque<>(List.of(S));
        reach[S] = true;
        while (!st.isEmpty()) {
            int u = st.pop();
            for (int v = 0; v < N; v++) if (cap[u][v] > 0 && !reach[v]) { reach[v] = true; st.push(v); }
        }
        StringBuilder sb = new StringBuilder("min cut S-side:");
        for (int v = 0; v < N; v++) if (reach[v]) sb.append(' ').append(NAMES.charAt(v));
        System.out.println(sb);
    }
}
