import java.util.Arrays;

public class BellmanFord {
    // 對所有邊做 V-1 輪鬆弛；第 V 輪若還能變短，代表有負環
    public static void main(String[] args) {
        int[][] edges = {{0, 1, 6}, {0, 2, 7}, {1, 3, 5}, {1, 2, 8}, {1, 4, -4}, {2, 3, -3}, {2, 4, 9}, {3, 1, -2}, {4, 3, 7}, {4, 0, 2}}; // 有向圖，可含負權
        int n = 5;
        long[] dist = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE);
        dist[0] = 0;
        for (int it = 0; it < n - 1; it++) {
            boolean changed = false;
            for (int[] e : edges)
                if (dist[e[0]] != Long.MAX_VALUE && dist[e[0]] + e[2] < dist[e[1]]) { dist[e[1]] = dist[e[0]] + e[2]; changed = true; }
            if (!changed) break;
        }
        boolean neg = false;
        for (int[] e : edges)
            if (dist[e[0]] != Long.MAX_VALUE && dist[e[0]] + e[2] < dist[e[1]]) neg = true;
        StringBuilder sb = new StringBuilder("dist:");
        for (int v = 0; v < n; v++) sb.append(' ').append((char) ('A' + v)).append('=').append(dist[v]);
        System.out.println(sb + "\nnegative cycle: " + (neg ? "True" : "False"));
    }
}
