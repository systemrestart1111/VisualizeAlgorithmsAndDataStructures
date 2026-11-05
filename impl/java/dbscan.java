import java.util.*;

public class Dbscan {
    static double[][] P = {{2.1, 3.0}, {2.8, 2.4}, {3.4, 3.6}, {2.5, 4.1}, {3.9, 2.7}, {1.8, 2.2}, {3.0, 3.1}, {2.2, 3.8},
                           {7.0, 7.4}, {7.8, 6.6}, {8.3, 7.9}, {6.9, 6.4}, {7.5, 8.2}, {8.6, 6.9}, {7.2, 7.0},
                           {6.6, 2.1}, {7.4, 2.9}, {7.9, 2.2}, {6.9, 3.2},
                           {5.0, 5.2}, {0.5, 9.0}, {9.5, 0.6}, {4.6, 8.8}};

    // N(p) 含 p 自己；|N(p)| ≥ minPts 為核心點；從核心點 BFS 擴張，其餘為雜訊
    static void dbscan(double eps, int minPts) {
        int n = P.length, c = -1;
        List<List<Integer>> nb = new ArrayList<>();
        boolean[] core = new boolean[n];
        int[] lab = new int[n];
        Arrays.fill(lab, -1);
        for (int i = 0; i < n; i++) {
            List<Integer> s = new ArrayList<>();
            for (int j = 0; j < n; j++) { double dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1]; if (dx * dx + dy * dy <= eps * eps) s.add(j); }
            nb.add(s);
            core[i] = s.size() >= minPts;
        }
        for (int i = 0; i < n; i++) {
            if (lab[i] >= 0 || !core[i]) continue;
            lab[i] = ++c;
            ArrayDeque<Integer> q = new ArrayDeque<>();
            q.add(i);
            while (!q.isEmpty()) {
                int cur = q.poll();
                for (int j : nb.get(cur)) if (lab[j] < 0) { lab[j] = c; if (core[j]) q.add(j); }
            }
        }
        int nc = 0, border = 0, noise = 0;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) { if (core[i]) nc++; if (lab[i] >= 0 && !core[i]) border++; if (lab[i] < 0) noise++; sb.append(' ').append(lab[i]); }
        System.out.println(String.format("eps %.1f, minPts %d: %d clusters, core %d, border %d, noise %d; labels", eps, minPts, c + 1, nc, border, noise) + sb);
    }

    public static void main(String[] args) {
        dbscan(1.2, 4);
        dbscan(0.8, 4);
        dbscan(2.0, 4);
        dbscan(1.2, 3);
        dbscan(1.2, 6);
    }
}
