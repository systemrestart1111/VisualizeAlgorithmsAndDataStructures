public class Shoelace {
    static long cross(long[] o, long[] a, long[] b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    static boolean on(long[] p, long[] q, long[] x) { return Math.min(p[0], q[0]) <= x[0] && x[0] <= Math.max(p[0], q[0]) && Math.min(p[1], q[1]) <= x[1] && x[1] <= Math.max(p[1], q[1]); }
    // 閉線段是否相交（含端點接觸）
    static boolean touch(long[] a, long[] b, long[] c, long[] d) {
        long d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
        if (d1 != 0 && d2 != 0 && d3 != 0 && d4 != 0 && ((d1 > 0) != (d2 > 0)) && ((d3 > 0) != (d4 > 0))) return true;
        return (d1 == 0 && on(c, d, a)) || (d2 == 0 && on(c, d, b)) || (d3 == 0 && on(a, b, c)) || (d4 == 0 && on(a, b, d));
    }
    static boolean isSimple(long[][] P) {
        int n = P.length;
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) {
                if (j == i + 1 || (i == 0 && j == n - 1)) continue;
                if (touch(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) return false;
            }
        return true;
    }
    static long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }

    public static void main(String[] args) {
        long[][][] polys = {{{1, 1}, {7, 2}, {9, 6}, {5, 9}, {4, 5}, {1, 7}}, {{1, 7}, {4, 5}, {5, 9}, {9, 6}, {7, 2}, {1, 1}}, {{0, 0}, {6, 0}, {6, 4}, {3, 2}, {0, 4}}, {{0, 0}, {8, 6}, {8, 0}, {0, 6}}};
        for (long[][] P : polys) {
            int n = P.length;
            // S = Σ (xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)；有向面積 S/2，正為逆時針
            long s = 0, B = 0;
            for (int i = 0; i < n; i++) { int j = (i + 1) % n; s += P[i][0] * P[j][1] - P[j][0] * P[i][1]; }
            double A = s / 2.0;
            if (!isSimple(P)) { System.out.println(String.format("signed area %.1f, but polygon is not simple: result is not its area", A)); continue; }
            for (int i = 0; i < n; i++) { int j = (i + 1) % n; B += gcd(Math.abs(P[j][0] - P[i][0]), Math.abs(P[j][1] - P[i][1])); }
            double absA = Math.abs(A);
            System.out.println(String.format("signed area %.1f (%s), area %.1f, Pick: B = %d, I = %.0f", A, A > 0 ? "counter-clockwise" : "clockwise", absA, B, absA - B / 2.0 + 1));
        }
    }
}
