import java.util.Arrays;

public class Johnson {
    static final int INF = 1_000_000_000;

    public static void main(String[] args) {
        int n = 5;
        int[][] E = {{0, 1, -2}, {0, 2, 4}, {1, 2, 3}, {1, 3, 2}, {1, 4, 6}, {2, 4, -1}, {3, 0, 1}, {3, 4, 5}, {4, 3, 2}};
        int[] h = new int[n];
        // 1. 加一個虛擬點 q 連到所有點（權重 0），用 Bellman-Ford 求位能 h
        for (int it = 0; it < n; it++)
            for (int[] e : E)
                if (h[e[0]] + e[2] < h[e[1]]) h[e[1]] = h[e[0]] + e[2];
        for (int[] e : E) // 再鬆弛一輪仍能變短：有負環
            if (h[e[0]] + e[2] < h[e[1]]) { System.out.println("negative cycle detected"); return; }
        StringBuilder sb = new StringBuilder("h:");
        for (int x : h) sb.append(' ').append(x);
        System.out.println(sb);
        // 2. 重新加權 w'(u,v) = w + h[u] - h[v] >= 0，之後每個點各跑一次 Dijkstra
        int[][] w2 = new int[n][n];
        for (int[] row : w2) Arrays.fill(row, INF);
        for (int[] e : E) w2[e[0]][e[1]] = e[2] + h[e[0]] - h[e[1]];
        sb = new StringBuilder("   ");
        for (int j = 0; j < n; j++) sb.append(String.format("%4c", 'A' + j));
        System.out.println(sb);
        for (int s = 0; s < n; s++) {
            int[] dist = new int[n];
            boolean[] done = new boolean[n];
            Arrays.fill(dist, INF);
            dist[s] = 0;
            for (int it = 0; it < n; it++) {
                int u = -1;
                for (int v = 0; v < n; v++)
                    if (!done[v] && dist[v] < INF && (u < 0 || dist[v] < dist[u])) u = v;
                if (u < 0) break;
                done[u] = true;
                for (int v = 0; v < n; v++)
                    if (w2[u][v] < INF && dist[u] + w2[u][v] < dist[v]) dist[v] = dist[u] + w2[u][v];
            }
            // 3. 還原真實距離 d(u,v) = d'(u,v) - h[u] + h[v]
            sb = new StringBuilder(String.format("%3c", 'A' + s));
            for (int t = 0; t < n; t++) sb.append(String.format("%4s", dist[t] >= INF ? "inf" : String.valueOf(dist[t] - h[s] + h[t])));
            System.out.println(sb);
        }
    }
}
