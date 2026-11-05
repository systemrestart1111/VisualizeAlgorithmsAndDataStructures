import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;
import java.util.List;

public class Dinic {
    static final String NAMES = "SACBDT";
    static final int N = 6, S = 0, T = 5;
    static int[][] cap = new int[N][N];
    static int[] level = new int[N], it = new int[N];

    // 建立層次圖：level[v] = S 到 v 的最少邊數
    static boolean bfsLevel() {
        Arrays.fill(level, -1);
        level[S] = 0;
        Deque<Integer> q = new ArrayDeque<>(List.of(S));
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v = 0; v < N; v++)
                if (level[v] < 0 && cap[u][v] > 0) { level[v] = level[u] + 1; q.add(v); }
        }
        return level[T] >= 0;
    }

    // 只沿 level 加一的邊前進（阻塞流）；it[u] 記錄 u 下一條要試的邊，走不通的邊不再重試
    static int dfs(int u, int pushed) {
        if (u == T) return pushed;
        for (; it[u] < N; it[u]++) {
            int v = it[u];
            if (cap[u][v] > 0 && level[v] == level[u] + 1) {
                int d = dfs(v, Math.min(pushed, cap[u][v]));
                if (d > 0) { cap[u][v] -= d; cap[v][u] += d; return d; }
            }
        }
        return 0;
    }

    public static void main(String[] args) {
        String[] edges = {"SA10", "SC10", "AB4", "AC2", "AD8", "CD9", "DB6", "BT10", "DT10"};
        for (String e : edges) cap[NAMES.indexOf(e.charAt(0))][NAMES.indexOf(e.charAt(1))] += Integer.parseInt(e.substring(2));
        int flow = 0, phase = 0;
        while (bfsLevel()) {
            int got = 0, d;
            Arrays.fill(it, 0);
            while ((d = dfs(S, Integer.MAX_VALUE)) > 0) got += d;
            flow += got;
            StringBuilder sb = new StringBuilder("phase " + (++phase) + ": levels");
            for (int v = 0; v < N; v++) if (level[v] >= 0) sb.append(' ').append(NAMES.charAt(v)).append('=').append(level[v]);
            System.out.println(sb + " blocking flow +" + got);
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
