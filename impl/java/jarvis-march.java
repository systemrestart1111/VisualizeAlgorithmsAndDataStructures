import java.util.ArrayList;
import java.util.List;

public class JarvisMarch {
    static long cross(long[] o, long[] a, long[] b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    static long d2(long[] a, long[] b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }

    // 禮物包裝法：從最左點出發，每次找「所有點都在它左側」的下一個點，O(nh)
    static List<long[]> jarvisMarch(long[][] pts) {
        long[] start = pts[0];
        for (long[] p : pts) if (p[0] < start[0] || (p[0] == start[0] && p[1] < start[1])) start = p;
        List<long[]> hull = new ArrayList<>();
        long[] p = start;
        do {
            hull.add(p);
            long[] q = pts[0] == p ? pts[1] : pts[0];
            for (long[] r : pts) {
                long c = cross(p, q, r);
                if (c < 0 || (c == 0 && d2(p, r) > d2(p, q))) q = r; // r 在 p→q 右側，或共線但更遠
            }
            p = q;
        } while (p != start);
        return hull;
    }

    public static void main(String[] args) {
        long[][] pts = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}};
        StringBuilder sb = new StringBuilder("hull (counter-clockwise):");
        for (long[] p : jarvisMarch(pts)) sb.append(" (").append(p[0]).append(',').append(p[1]).append(')');
        System.out.println(sb);
    }
}
