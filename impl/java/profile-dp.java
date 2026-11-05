import java.util.*;

public class ProfileDp {
    static int R;
    static Map<Integer, Long> nd;

    // 遮罩 cur 為本欄已被佔的列，nxt 為下一欄被橫放骨牌佔走的列
    static void fill(int row, int cur, int nxt, long ways) {
        if (row == R) { nd.merge(nxt, ways, Long::sum); return; }
        if ((cur >> row & 1) == 1) { fill(row + 1, cur, nxt, ways); return; }
        fill(row + 1, cur, nxt | (1 << row), ways);                                     // 橫放
        if (row + 1 < R && (cur >> (row + 1) & 1) == 0) fill(row + 2, cur, nxt, ways);   // 直放
    }
    static long tilings(int r, int C) {
        R = r;
        Map<Integer, Long> dp = new HashMap<>(Map.of(0, 1L));
        for (int c = 0; c < C; c++) {
            nd = new HashMap<>();
            for (Map.Entry<Integer, Long> e : dp.entrySet()) fill(0, e.getKey(), 0, e.getValue());
            dp = nd;
        }
        return dp.getOrDefault(0, 0L);
    }
    static boolean[][] g;
    static int BR, BC;
    static long go(int pos) {
        if (pos == BR * BC) return 1;
        int i = pos / BC, j = pos % BC;
        if (g[i][j]) return go(pos + 1);
        long t = 0;
        if (j + 1 < BC && !g[i][j + 1]) { g[i][j] = g[i][j + 1] = true; t += go(pos + 1); g[i][j] = g[i][j + 1] = false; }
        if (i + 1 < BR) { g[i][j] = g[i + 1][j] = true; t += go(pos + 1); g[i][j] = g[i + 1][j] = false; }
        return t;
    }

    public static void main(String[] args) {
        int[][] tests = {{3, 4}, {2, 8}, {4, 4}, {3, 3}, {4, 6}, {6, 6}};
        for (int[] t : tests) {
            StringBuilder sb = new StringBuilder(t[0] + "x" + t[1] + ": " + tilings(t[0], t[1]) + " tilings");
            if (t[0] * t[1] <= 24) { BR = t[0]; BC = t[1]; g = new boolean[BR][BC]; sb.append(" (brute ").append(go(0)).append(")"); }
            System.out.println(sb);
        }
    }
}
