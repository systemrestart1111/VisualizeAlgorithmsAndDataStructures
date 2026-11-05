import java.util.Arrays;

public class KMeans {
    // Lloyd 演算法：重複「每點分給最近的中心」與「中心移到所屬點的平均位置」，直到分群不再改變
    // （這裡用前 k 個點當初始中心，方便重現。這組資料的前 3 點都在同一群，結果會卡在局部最佳解（左下群被拆成兩半），可看出初始化的影響；實務上常用 k-means++ 改善）
    public static void main(String[] args) {
        double[][] P = {{1, 2}, {2, 1}, {2, 3}, {3, 2}, {7, 8}, {8, 7}, {8, 9}, {9, 8}, {1, 8}, {2, 7}, {2, 9}, {3, 8}};
        int K = 3, n = P.length;
        double[][] cent = new double[K][];
        for (int c = 0; c < K; c++) cent[c] = P[c].clone();
        int[] assign = new int[n];
        Arrays.fill(assign, -1);
        for (int it = 1; it <= 20; it++) {
            int[] nw = new int[n];
            for (int i = 0; i < n; i++) {
                int best = 0;
                double bd = 1e18;
                for (int c = 0; c < K; c++) {
                    double dx = P[i][0] - cent[c][0], dy = P[i][1] - cent[c][1], d = dx * dx + dy * dy;
                    if (d < bd - 1e-9) { best = c; bd = d; } // 容許誤差：距離相同時固定選編號小的中心
                }
                nw[i] = best;
            }
            if (Arrays.equals(nw, assign)) break;
            assign = nw;
            for (int c = 0; c < K; c++) {
                double sx = 0, sy = 0;
                int m = 0;
                for (int i = 0; i < n; i++) if (assign[i] == c) { sx += P[i][0]; sy += P[i][1]; m++; }
                if (m > 0) cent[c] = new double[] {sx / m, sy / m};
            }
            StringBuilder sb = new StringBuilder("iteration " + it + ":");
            for (double[] c : cent) sb.append(String.format(" (%.4f, %.4f)", c[0], c[1]));
            System.out.println(sb);
        }
        StringBuilder sb = new StringBuilder("labels:");
        for (int a : assign) sb.append(' ').append(a);
        System.out.println(sb);
    }
}
