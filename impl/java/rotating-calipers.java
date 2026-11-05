import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class RotatingCalipers {
    static long cross(long[] o, long[] a, long[] b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    static long d2(long[] a, long[] b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }

    static List<long[]> convexHull(long[][] pts) {
        long[][] p = pts.clone();
        Arrays.sort(p, (a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]));
        List<long[]> h = new ArrayList<>();
        for (int pass = 0; pass < 2; pass++) {
            int start = h.size();
            for (int i = 0; i < p.length; i++) {
                long[] q = pass == 0 ? p[i] : p[p.length - 1 - i];
                while (h.size() >= start + 2 && cross(h.get(h.size() - 2), h.get(h.size() - 1), q) <= 0) h.remove(h.size() - 1);
                h.add(q);
            }
            h.remove(h.size() - 1);
        }
        return h;
    }

    public static void main(String[] args) {
        long[][] pts = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}};
        List<long[]> h = convexHull(pts);
        int m = h.size(), j = 1;
        // 旋轉卡尺：沿凸包每條邊，把對面的「最遠點」指標 j 單調往前推；最遠點對一定是某組對蹠點
        long best = 0;
        long[] ba = h.get(0), bb = h.get(0);
        for (int i = 0; i < m; i++) {
            int ni = (i + 1) % m;
            while (Math.abs(cross(h.get(i), h.get(ni), h.get((j + 1) % m))) > Math.abs(cross(h.get(i), h.get(ni), h.get(j)))) j = (j + 1) % m;
            for (long[] a : new long[][] {h.get(i), h.get(ni)})
                if (d2(a, h.get(j)) > best) { best = d2(a, h.get(j)); ba = a; bb = h.get(j); }
        }
        long brute = 0;
        for (long[] a : pts) for (long[] b : pts) brute = Math.max(brute, d2(a, b));
        StringBuilder sb = new StringBuilder("hull:");
        for (long[] p : h) sb.append(" (").append(p[0]).append(',').append(p[1]).append(')');
        System.out.println(sb);
        System.out.println(String.format("farthest pair: (%d,%d) (%d,%d), distance = %.4f", ba[0], ba[1], bb[0], bb[1], Math.sqrt(best)));
        System.out.println("brute force d^2 = " + brute);
    }
}
