import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ClosestPair {
    static long d2(long[] a, long[] b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }

    // 回傳 {d², 第一點, 第二點}
    // 分治：左右兩半各自求解，再檢查跨中線、寬度 < d 的帶狀區域（每點只需比較常數個鄰居）
    static Object[] closest(long[][] p) {
        int n = p.length;
        if (n <= 3) {
            Object[] best = {Long.MAX_VALUE, null, null};
            for (int i = 0; i < n; i++)
                for (int j = i + 1; j < n; j++)
                    if (d2(p[i], p[j]) < (long) best[0]) best = new Object[] {d2(p[i], p[j]), p[i], p[j]};
            return best;
        }
        int mid = n / 2;
        long mx = p[mid][0];
        Object[] l = closest(Arrays.copyOfRange(p, 0, mid)), r = closest(Arrays.copyOfRange(p, mid, n));
        Object[] best = (long) l[0] <= (long) r[0] ? l : r;
        List<long[]> strip = new ArrayList<>();
        for (long[] q : p) if ((q[0] - mx) * (q[0] - mx) < (long) best[0]) strip.add(q);
        strip.sort((a, b) -> a[1] != b[1] ? Long.compare(a[1], b[1]) : Long.compare(a[0], b[0]));
        for (int i = 0; i < strip.size(); i++)
            for (int j = i + 1; j < strip.size(); j++) {
                long dy = strip.get(j)[1] - strip.get(i)[1];
                if (dy * dy >= (long) best[0]) break;
                if (d2(strip.get(i), strip.get(j)) < (long) best[0]) best = new Object[] {d2(strip.get(i), strip.get(j)), strip.get(i), strip.get(j)};
            }
        return best;
    }

    public static void main(String[] args) {
        long[][] pts = {{2, 3}, {12, 30}, {40, 50}, {5, 1}, {12, 10}, {3, 4}, {25, 18}, {33, 8}, {18, 25}, {45, 22}, {8, 40}, {30, 35}, {22, 5}};
        long brute = Long.MAX_VALUE;
        for (int i = 0; i < pts.length; i++)
            for (int j = i + 1; j < pts.length; j++) brute = Math.min(brute, d2(pts[i], pts[j]));
        Arrays.sort(pts, (a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]));
        Object[] b = closest(pts);
        long[] a = (long[]) b[1], c = (long[]) b[2];
        if (a[0] > c[0] || (a[0] == c[0] && a[1] > c[1])) { long[] t = a; a = c; c = t; }
        System.out.println("closest pair: (" + a[0] + "," + a[1] + ") (" + c[0] + "," + c[1] + ")");
        System.out.println(String.format("distance = %.4f", Math.sqrt((long) b[0])));
        System.out.println("brute force d^2 = " + brute);
    }
}
