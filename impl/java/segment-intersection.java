public class SegmentIntersection {
    static long cross(long[] o, long[] a, long[] b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }

    // 已知 p、q、r 共線：r 是否落在 pq 的範圍內
    static boolean onSegment(long[] p, long[] q, long[] r) {
        return Math.min(p[0], q[0]) <= r[0] && r[0] <= Math.max(p[0], q[0]) && Math.min(p[1], q[1]) <= r[1] && r[1] <= Math.max(p[1], q[1]);
    }

    // 兩條線段互相「跨立」（各自的兩端點分別在另一條線的兩側），或端點恰好落在另一條線段上
    static boolean intersect(long[] p1, long[] p2, long[] p3, long[] p4) {
        long d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2), d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4);
        if (((d1 > 0) != (d2 > 0)) && d1 != 0 && d2 != 0 && ((d3 > 0) != (d4 > 0)) && d3 != 0 && d4 != 0) return true;
        return (d1 == 0 && onSegment(p3, p4, p1)) || (d2 == 0 && onSegment(p3, p4, p2))
                || (d3 == 0 && onSegment(p1, p2, p3)) || (d4 == 0 && onSegment(p1, p2, p4));
    }

    public static void main(String[] args) {
        long[][] segs = {{1, 1, 9, 7, 2, 8, 8, 2}, {1, 1, 4, 4, 5, 5, 9, 2}, {2, 2, 8, 2, 5, 2, 5, 7}, {1, 6, 4, 9, 6, 1, 9, 4}};
        for (long[] s : segs) {
            boolean hit = intersect(new long[] {s[0], s[1]}, new long[] {s[2], s[3]}, new long[] {s[4], s[5]}, new long[] {s[6], s[7]});
            System.out.println(String.format("(%d,%d)-(%d,%d) vs (%d,%d)-(%d,%d): %s", s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], hit ? "intersect" : "no"));
        }
    }
}
