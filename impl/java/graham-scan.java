import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class GrahamScan {
    static long cross(long[] o, long[] a, long[] b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    static long d2(long[] a, long[] b) { return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]); }

    // 以最低點為基準依極角排序，依序加入；若形成右轉（非逆時針）就把堆疊頂端彈出
    static List<long[]> grahamScan(long[][] pts) {
        int b = 0;
        for (int i = 1; i < pts.length; i++)
            if (pts[i][1] < pts[b][1] || (pts[i][1] == pts[b][1] && pts[i][0] < pts[b][0])) b = i;
        long[] t = pts[0]; pts[0] = pts[b]; pts[b] = t;
        long[] p0 = pts[0];
        Arrays.sort(pts, 1, pts.length, (x, y) -> {
            long c = cross(p0, x, y);
            if (c != 0) return c > 0 ? -1 : 1;
            return Long.compare(d2(p0, x), d2(p0, y)); // 共線時近的在前
        });
        List<long[]> st = new ArrayList<>();
        for (long[] p : pts) {
            while (st.size() >= 2 && cross(st.get(st.size() - 2), st.get(st.size() - 1), p) <= 0) st.remove(st.size() - 1);
            st.add(p);
        }
        return st;
    }

    public static void main(String[] args) {
        long[][] pts = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}};
        StringBuilder sb = new StringBuilder("hull (counter-clockwise):");
        for (long[] p : grahamScan(pts)) sb.append(" (").append(p[0]).append(',').append(p[1]).append(')');
        System.out.println(sb);
    }
}
