import java.util.Arrays;

public class Hungarian {
    static final int INF = 1_000_000_000;

    // 匈牙利演算法 O(n^3)：以位能 u、v 維持「縮減成本 >= 0」，每次加入一列並沿零成本邊找增廣路徑
    static int[] hungarian(int[][] a) {
        int n = a.length;
        int[] u = new int[n + 1], v = new int[n + 1], p = new int[n + 1], way = new int[n + 1]; // p[j] = 第 j 欄配到的列（1 起算）
        for (int i = 1; i <= n; i++) {
            p[0] = i;
            int j0 = 0;
            int[] minv = new int[n + 1];
            Arrays.fill(minv, INF);
            boolean[] used = new boolean[n + 1];
            do {
                used[j0] = true;
                int i0 = p[j0], delta = INF, j1 = 0;
                for (int j = 1; j <= n; j++)
                    if (!used[j]) {
                        int cur = a[i0 - 1][j - 1] - u[i0] - v[j];
                        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
                        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
                    }
                for (int j = 0; j <= n; j++) {
                    if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
                    else minv[j] -= delta;
                }
                j0 = j1;
            } while (p[j0] != 0);
            do { // 沿 way 回溯翻轉
                int j1 = way[j0];
                p[j0] = p[j1];
                j0 = j1;
            } while (j0 != 0);
        }
        int[] assign = new int[n];
        for (int j = 1; j <= n; j++) assign[p[j] - 1] = j - 1;
        return assign;
    }

    public static void main(String[] args) {
        int[][] cost = {{9, 2, 7, 8}, {6, 4, 3, 7}, {5, 8, 1, 8}, {7, 6, 9, 4}};
        int[] assign = hungarian(cost);
        int total = 0;
        for (int i = 0; i < assign.length; i++) {
            System.out.println("row " + i + " -> col " + assign[i] + " (cost " + cost[i][assign[i]] + ")");
            total += cost[i][assign[i]];
        }
        System.out.println("total cost = " + total);
    }
}
