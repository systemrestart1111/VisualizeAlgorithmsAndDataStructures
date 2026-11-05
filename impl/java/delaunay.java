import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Delaunay {
    static long[][] P = {{3, 3}, {12, 4}, {7, 9}, {2, 13}, {15, 12}, {10, 16}, {17, 7}, {8, 2}, {5, 6},
                         {-1000, -1000}, {1000, -1000}, {0, 1000}}; // 最後三點是包住所有點的超級三角形
    static final int N = 9;

    static long orient(int a, int b, int c) { return (P[b][0] - P[a][0]) * (P[c][1] - P[a][1]) - (P[b][1] - P[a][1]) * (P[c][0] - P[a][0]); }

    // 點 d 是否在三角形 t 的外接圓內（整數行列式，沒有浮點誤差）
    static boolean inCircumcircle(int[] t, int d) {
        int a = t[0], b = t[1], c = t[2];
        if (orient(a, b, c) < 0) { int tmp = b; b = c; c = tmp; } // 調整成逆時針
        int[] v = {a, b, c};
        long[][] r = new long[3][3];
        for (int i = 0; i < 3; i++) {
            long x = P[v[i]][0] - P[d][0], y = P[v[i]][1] - P[d][1];
            r[i][0] = x; r[i][1] = y; r[i][2] = x * x + y * y;
        }
        long det = r[0][0] * (r[1][1] * r[2][2] - r[2][1] * r[1][2]) - r[0][1] * (r[1][0] * r[2][2] - r[2][0] * r[1][2])
                + r[0][2] * (r[1][0] * r[2][1] - r[2][0] * r[1][1]);
        return det > 0;
    }

    // Bowyer–Watson：逐一加入點；刪掉外接圓包含新點的三角形，留下的多邊形空洞再與新點連成三角形
    public static void main(String[] args) {
        List<int[]> tris = new ArrayList<>();
        tris.add(new int[] {N, N + 1, N + 2});
        for (int p = 0; p < N; p++) {
            List<int[]> keep = new ArrayList<>();
            Map<Long, Integer> cnt = new LinkedHashMap<>();
            for (int[] t : tris) {
                if (!inCircumcircle(t, p)) { keep.add(t); continue; }
                for (int k = 0; k < 3; k++) {
                    int u = Math.min(t[k], t[(k + 1) % 3]), w = Math.max(t[k], t[(k + 1) % 3]);
                    cnt.merge((long) u * 100 + w, 1, Integer::sum);
                }
            }
            tris = keep;
            for (Map.Entry<Long, Integer> e : cnt.entrySet()) // 只出現一次的邊是空洞的邊界
                if (e.getValue() == 1) tris.add(new int[] {(int) (e.getKey() / 100), (int) (e.getKey() % 100), p});
        }
        List<int[]> res = new ArrayList<>();
        for (int[] t : tris) {
            if (t[0] >= N || t[1] >= N || t[2] >= N) continue; // 去掉碰到超級三角形的三角形
            int[] s = t.clone();
            Arrays.sort(s);
            res.add(s);
        }
        res.sort((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] != b[1] ? a[1] - b[1] : a[2] - b[2]);
        System.out.println("triangles: " + res.size());
        for (int[] t : res) {
            StringBuilder sb = new StringBuilder("  (" + t[0] + ", " + t[1] + ", " + t[2] + ")");
            for (int v : t) sb.append(" (").append(P[v][0]).append(',').append(P[v][1]).append(')');
            System.out.println(sb);
        }
    }
}
