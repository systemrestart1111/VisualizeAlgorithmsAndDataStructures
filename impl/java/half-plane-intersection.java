import java.util.*;

public class HalfPlaneIntersection {
    // 有向線 {px, py, dx, dy, box}
    static boolean out(double[] h, double x, double y) { return h[2] * (y - h[1]) - h[3] * (x - h[0]) < -1e-9; }
    static double[] inter(double[] s, double[] t) {
        double al = ((t[0] - s[0]) * t[3] - (t[1] - s[1]) * t[2]) / (s[2] * t[3] - s[3] * t[2]);
        return new double[]{s[0] + s[2] * al, s[1] + s[3] * al};
    }
    static double f3(double v) { return Math.abs(v) < 5e-4 ? 0.0 : v; }

    // 每個 a·x + b·y ≤ c 轉成有向線（可行側在左），加大方框，依角度排序後用雙端佇列
    static void run(double[][] cons) {
        List<double[]> H = new ArrayList<>();
        double M = 50;
        for (double[] c : cons) {
            double a = c[0], b = c[1], cc = c[2], n2 = a * a + b * b;
            H.add(new double[]{a * cc / n2, b * cc / n2, -b, a, 0});
            M = Math.max(M, Math.abs(cc) / Math.hypot(a, b));
        }
        M *= 4;
        H.add(new double[]{M, -M, 0, 1, 1});
        H.add(new double[]{M, M, -1, 0, 1});
        H.add(new double[]{-M, M, 0, -1, 1});
        H.add(new double[]{-M, -M, 1, 0, 1});
        H.sort(Comparator.comparingDouble(h -> Math.atan2(h[3], h[2])));
        List<double[]> dq = new ArrayList<>();
        for (double[] h : H) {
            while (dq.size() >= 2) { double[] x = inter(dq.get(dq.size() - 1), dq.get(dq.size() - 2)); if (!out(h, x[0], x[1])) break; dq.remove(dq.size() - 1); }
            while (dq.size() >= 2) { double[] x = inter(dq.get(0), dq.get(1)); if (!out(h, x[0], x[1])) break; dq.remove(0); }
            if (!dq.isEmpty()) {
                double[] last = dq.get(dq.size() - 1);
                if (Math.abs(h[2] * last[3] - h[3] * last[2]) < 1e-12) {
                    if (h[2] * last[2] + h[3] * last[3] < 0) { System.out.println("empty intersection"); return; }
                    if (out(h, last[0], last[1])) dq.remove(dq.size() - 1);
                    else continue;
                }
            }
            dq.add(h);
        }
        while (dq.size() >= 3) { double[] x = inter(dq.get(dq.size() - 1), dq.get(dq.size() - 2)); if (!out(dq.get(0), x[0], x[1])) break; dq.remove(dq.size() - 1); }
        while (dq.size() >= 3) { double[] x = inter(dq.get(0), dq.get(1)); if (!out(dq.get(dq.size() - 1), x[0], x[1])) break; dq.remove(0); }
        if (dq.size() < 3) { System.out.println("empty intersection"); return; }
        List<double[]> poly = new ArrayList<>();
        boolean boxed = false;
        for (int i = 0; i < dq.size(); i++) {
            if (dq.get(i)[4] == 1) boxed = true;
            double[] p = inter(dq.get(i), dq.get((i + 1) % dq.size()));
            if (poly.isEmpty() || Math.hypot(p[0] - poly.get(poly.size() - 1)[0], p[1] - poly.get(poly.size() - 1)[1]) > 1e-9) poly.add(p);
        }
        if (poly.size() > 1 && Math.hypot(poly.get(0)[0] - poly.get(poly.size() - 1)[0], poly.get(0)[1] - poly.get(poly.size() - 1)[1]) <= 1e-9) poly.remove(poly.size() - 1);
        int np = poly.size();
        if (boxed) { System.out.println("unbounded: clipped by the bounding box (" + np + " vertices)"); return; }
        int s = 0;
        for (int i = 1; i < np; i++) {
            long xi = Math.round(poly.get(i)[0] * 1e6), xs = Math.round(poly.get(s)[0] * 1e6), yi = Math.round(poly.get(i)[1] * 1e6), ys = Math.round(poly.get(s)[1] * 1e6);
            if (xi < xs || (xi == xs && yi < ys)) s = i;
        }
        double area = 0;
        for (int i = 0; i < np; i++) { double[] p = poly.get(i), q = poly.get((i + 1) % np); area += p[0] * q[1] - q[0] * p[1]; }
        StringBuilder sb = new StringBuilder(String.format("%d-gon, area %.3f:", np, f3(Math.abs(area) / 2)));
        for (int i = 0; i < np; i++) { double[] p = poly.get((s + i) % np); sb.append(String.format(" (%.3f, %.3f)", f3(p[0]), f3(p[1]))); }
        System.out.println(sb);
    }

    public static void main(String[] args) {
        run(new double[][]{{1, 1, 10}, {-1, 0, 0}, {0, -1, 0}, {1, -2, 4}, {-2, 1, 6}, {1, 0, 7}});
        run(new double[][]{{1, 0, 2}, {-1, 0, -5}, {0, 1, 5}, {0, -1, 0}});
        run(new double[][]{{1, 1, 4}, {1, -1, 2}, {-1, 0, 1}, {1, 1, 6}});
        run(new double[][]{{-1, 0, 0}, {0, -1, 0}});
    }
}
