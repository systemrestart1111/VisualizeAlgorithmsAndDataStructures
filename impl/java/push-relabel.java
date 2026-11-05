import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;

public class PushRelabel {
    static final String NAMES = "SACBDT";
    static final int N = 6, S = 0, T = 5;

    public static void main(String[] args) {
        int[][] cap = new int[N][N];
        String[] edges = {"SA10", "SC10", "AB4", "AC2", "AD8", "CD9", "DB6", "BT10", "DT10"};
        for (String e : edges) cap[NAMES.indexOf(e.charAt(0))][NAMES.indexOf(e.charAt(1))] += Integer.parseInt(e.substring(2));
        // 前置流：先把 S 的出邊全部灌滿；之後不斷把「溢出」的點的多餘流量往較低的鄰居推，推不動就把自己抬高
        int[] height = new int[N], excess = new int[N];
        Deque<Integer> active = new ArrayDeque<>();
        int pushes = 0, relabels = 0;
        height[S] = N;
        for (int v = 0; v < N; v++)
            if (cap[S][v] > 0) {
                excess[v] += cap[S][v];
                cap[v][S] += cap[S][v];
                cap[S][v] = 0;
                if (v != T) active.add(v);
            }
        while (!active.isEmpty()) { // FIFO：依序處理溢出的點
            int u = active.poll();
            while (excess[u] > 0) {
                for (int v = 0; v < N && excess[u] > 0; v++)
                    if (cap[u][v] > 0 && height[u] == height[v] + 1) { // 只能往低一層推
                        int d = Math.min(excess[u], cap[u][v]);
                        cap[u][v] -= d; cap[v][u] += d;
                        excess[u] -= d; excess[v] += d;
                        pushes++;
                        if (v != S && v != T && excess[v] == d) active.add(v);
                    }
                if (excess[u] > 0) { // 推不出去：抬高到比最低的可達鄰居高一層
                    int mn = Integer.MAX_VALUE;
                    for (int v = 0; v < N; v++) if (cap[u][v] > 0) mn = Math.min(mn, height[v]);
                    height[u] = mn + 1;
                    relabels++;
                }
            }
        }
        System.out.println("max flow = " + excess[T] + "\npushes = " + pushes + " relabels = " + relabels);
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
