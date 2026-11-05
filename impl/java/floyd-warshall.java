import java.util.Arrays;

public class FloydWarshall {
    static final int INF = 1_000_000_000;

    public static void main(String[] args) {
        int n = 5;
        int[][] edges = {{0, 1, 3}, {0, 2, 8}, {0, 4, -4}, {1, 3, 1}, {1, 4, 7}, {2, 1, 4}, {3, 0, 2}, {3, 2, -5}, {4, 3, 6}};
        int[][] d = new int[n][n];
        for (int i = 0; i < n; i++) { Arrays.fill(d[i], INF); d[i][i] = 0; }
        for (int[] e : edges) d[e[0]][e[1]] = e[2];
        // 依序允許經過中繼點 k：d[i][j] = min(d[i][j], d[i][k] + d[k][j])
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (d[i][k] < INF && d[k][j] < INF && d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
        StringBuilder sb = new StringBuilder("   ");
        for (int j = 0; j < n; j++) sb.append(String.format("%4c", 'A' + j));
        System.out.println(sb);
        for (int i = 0; i < n; i++) {
            sb = new StringBuilder(String.format("%3c", 'A' + i));
            for (int j = 0; j < n; j++) sb.append(String.format("%4s", d[i][j] >= INF ? "inf" : String.valueOf(d[i][j])));
            System.out.println(sb);
        }
    }
}
