import java.util.Arrays;

public class GraphColoring {
    static final int N = 6;
    static boolean[][] adj = new boolean[N][N];
    static int[] color = new int[N];
    static int m;

    // 依序替每個點試顏色 1..m，與已著色的鄰居衝突就換色；都不行就回溯到上一個點
    static boolean bt(int v) {
        if (v == N) return true;
        for (int c = 1; c <= m; c++) {
            boolean ok = true;
            for (int u = 0; u < N; u++)
                if (adj[v][u] && color[u] == c) ok = false;
            if (!ok) continue;
            color[v] = c;
            if (bt(v + 1)) return true;
            color[v] = 0;
        }
        return false;
    }

    public static void main(String[] args) {
        for (String e : "AB AC AD BC BE CD CE DF EF CF".split(" "))
            adj[e.charAt(0) - 'A'][e.charAt(1) - 'A'] = adj[e.charAt(1) - 'A'][e.charAt(0) - 'A'] = true;
        for (m = 3; m <= 4; m++) {
            Arrays.fill(color, 0);
            StringBuilder sb = new StringBuilder("m = " + m + ":");
            if (!bt(0)) sb.append(" no solution");
            else for (int v = 0; v < N; v++) sb.append(' ').append((char) ('A' + v)).append('=').append(color[v]);
            System.out.println(sb);
        }
    }
}
