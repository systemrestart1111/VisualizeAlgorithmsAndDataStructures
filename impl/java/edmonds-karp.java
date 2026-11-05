import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Deque;
import java.util.List;

public class EdmondsKarp {
    static final String NAMES = "SACBDT";
    static final int N = 6, S = 0, T = 5;
    static int[][] cap = new int[N][N];

    // 用 BFS 找「邊數最少」的增廣路徑，保證總共只需 O(VE) 次增廣
    static int[] bfs() {
        int[] parent = new int[N];
        Arrays.fill(parent, -1);
        parent[S] = S;
        Deque<Integer> q = new ArrayDeque<>(List.of(S));
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v = 0; v < N; v++)
                if (parent[v] < 0 && cap[u][v] > 0) { parent[v] = u; q.add(v); }
        }
        return parent[T] >= 0 ? parent : null;
    }

    public static void main(String[] args) {
        String[] edges = {"SA10", "SC10", "AB4", "AC2", "AD8", "CD9", "DB6", "BT10", "DT10"};
        for (String e : edges) cap[NAMES.indexOf(e.charAt(0))][NAMES.indexOf(e.charAt(1))] += Integer.parseInt(e.substring(2));
        int flow = 0;
        for (int[] parent = bfs(); parent != null; parent = bfs()) {
            List<Integer> path = new ArrayList<>();
            for (int v = T; v != S; v = parent[v]) path.add(v);
            path.add(S);
            Collections.reverse(path);
            int b = Integer.MAX_VALUE;
            for (int i = 0; i + 1 < path.size(); i++) b = Math.min(b, cap[path.get(i)][path.get(i + 1)]);
            for (int i = 0; i + 1 < path.size(); i++) { cap[path.get(i)][path.get(i + 1)] -= b; cap[path.get(i + 1)][path.get(i)] += b; }
            flow += b;
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < path.size(); i++) sb.append(i > 0 ? " -> " : "").append(NAMES.charAt(path.get(i)));
            System.out.println(sb + " (+" + b + ")");
        }
        System.out.println("max flow = " + flow);
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
