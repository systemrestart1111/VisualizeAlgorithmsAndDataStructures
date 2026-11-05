public class PointInPolygon {
    // 射線法：從點往右射一條水平線，與多邊形的邊相交奇數次就在內部
    static boolean inside(long x, long y, long[][] poly) {
        boolean res = false;
        for (int i = 0; i < poly.length; i++) {
            long[] a = poly[i], b = poly[(i + 1) % poly.length];
            if ((a[1] > y) != (b[1] > y)) { // 這條邊跨過水平線
                // 交點 x 座標 > x 才算在右側；改寫成乘法以避免除法誤差
                long v = (b[0] - a[0]) * (y - a[1]) - (x - a[0]) * (b[1] - a[1]);
                if (b[1] > a[1] ? v > 0 : v < 0) res = !res;
            }
        }
        return res;
    }

    public static void main(String[] args) {
        long[][] poly = {{2, 1}, {9, 2}, {11, 7}, {7, 5}, {5, 10}, {1, 7}};
        for (long[] q : new long[][] {{5, 4}, {8, 7}, {3, 8}, {10, 3}})
            System.out.println("(" + q[0] + "," + q[1] + "): " + (inside(q[0], q[1], poly) ? "inside" : "outside"));
    }
}
