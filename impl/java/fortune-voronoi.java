import java.util.*;

public class FortuneVoronoi {
    static double[][] S;
    static double L, scale;
    static List<int[]> beach; // {site, ev, id}
    static List<double[]> ev; // {y, cx, cy, r, site, arc, valid, used}
    static int nextId;

    static double[] circum(double[] a, double[] b, double[] c) {
        double d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
        if (Math.abs(d) < 1e-12) return null;
        double A = a[0] * a[0] + a[1] * a[1], B = b[0] * b[0] + b[1] * b[1], C = c[0] * c[0] + c[1] * c[1];
        double ux = (A * (b[1] - c[1]) + B * (c[1] - a[1]) + C * (a[1] - b[1])) / d;
        double uy = (A * (c[0] - b[0]) + B * (a[0] - c[0]) + C * (b[0] - a[0])) / d;
        return new double[]{ux, uy, Math.hypot(a[0] - ux, a[1] - uy)};
    }
    // 焦點 s、準線 y = L 的拋物線在 x 的高度
    static double parab(double[] s, double LL, double x) { return Math.abs(s[1] - LL) < 1e-12 ? Double.POSITIVE_INFINITY : ((x - s[0]) * (x - s[0]) + s[1] * s[1] - LL * LL) / (2 * (s[1] - LL)); }
    // 左弧 a 與右弧 b 的斷點：兩拋物線的交點中，左邊由 a 較低的那一個
    static double breakX(double[] a, double[] b, double LL) {
        double da = 2 * (a[1] - LL), db = 2 * (b[1] - LL);
        if (Math.abs(da) < 1e-12) return a[0];
        if (Math.abs(db) < 1e-12) return b[0];
        double A = 1 / da - 1 / db, B = -2 * (a[0] / da - b[0] / db), C = (a[0] * a[0] + a[1] * a[1] - LL * LL) / da - (b[0] * b[0] + b[1] * b[1] - LL * LL) / db;
        if (Math.abs(A) < 1e-12) return -C / B;
        double disc = Math.sqrt(Math.max(0.0, B * B - 4 * A * C)), r0 = (-B - disc) / (2 * A), r1 = (-B + disc) / (2 * A);
        double eps = 1e-6 * (1 + Math.abs(r0) + Math.abs(r1));
        if (parab(a, LL, r0 - eps) < parab(b, LL, r0 - eps)) return r0;
        if (parab(a, LL, r1 - eps) < parab(b, LL, r1 - eps)) return r1;
        return r0;
    }
    static void check(int k) {
        if (k < 1 || k + 1 >= beach.size() || beach.get(k - 1)[0] == beach.get(k + 1)[0]) return;
        double[] a = S[beach.get(k - 1)[0]], b = S[beach.get(k)[0]], c = S[beach.get(k + 1)[0]];
        double[] cc = circum(a, b, c);
        if (cc == null) return;
        double yb = cc[1] - cc[2], tol = 1e-5 * scale;
        if (yb > L + 1e-9) return;
        if (Math.abs(breakX(a, b, yb) - cc[0]) > tol || Math.abs(breakX(b, c, yb) - cc[0]) > tol) return;
        ev.add(new double[]{yb, cc[0], cc[1], cc[2], -1, beach.get(k)[2], 1, 0});
        beach.get(k)[1] = ev.size() - 1;
    }
    static void kill(int k) { int e = beach.get(k)[1]; if (e >= 0) ev.get(e)[6] = 0; beach.get(k)[1] = -1; }

    // 掃描線由上往下；站點事件切開弧，圓事件讓弧消失並產生 Voronoi 頂點
    static List<double[]> fortune() {
        double xmin = 1e18, xmax = -1e18, ymax = -1e18;
        for (double[] p : S) { xmin = Math.min(xmin, p[0]); xmax = Math.max(xmax, p[0]); ymax = Math.max(ymax, p[1]); }
        scale = xmax - xmin + 6;
        L = ymax + 3;
        beach = new ArrayList<>();
        ev = new ArrayList<>();
        nextId = 0;
        List<double[]> verts = new ArrayList<>();
        for (int i = 0; i < S.length; i++) ev.add(new double[]{S[i][1], 0, 0, 0, i, -1, 1, 0});
        for (;;) {
            int best = -1;
            for (int i = 0; i < ev.size(); i++) {
                double[] e = ev.get(i);
                if (e[7] == 1) continue;
                if (best < 0 || e[0] > ev.get(best)[0] || (e[0] == ev.get(best)[0] && e[4] >= 0 && ev.get(best)[4] < 0)) best = i;
            }
            if (best < 0) break;
            double[] e = ev.get(best);
            e[7] = 1;
            if (e[6] == 0) continue;
            L = e[0];
            if (e[4] >= 0) {
                int p = (int) e[4];
                if (beach.isEmpty()) { beach.add(new int[]{p, -1, nextId++}); continue; }
                int k = 0;
                while (k + 1 < beach.size() && breakX(S[beach.get(k)[0]], S[beach.get(k + 1)[0]], L) < S[p][0]) k++;
                int old = beach.get(k)[0];
                kill(k);
                beach.set(k, new int[]{old, -1, nextId++});
                beach.add(k + 1, new int[]{p, -1, nextId++});
                beach.add(k + 2, new int[]{old, -1, nextId++});
                check(k);
                check(k + 2);
            } else {
                int k = -1;
                for (int i = 0; i < beach.size(); i++) if (beach.get(i)[2] == (int) e[5]) k = i;
                if (k < 1 || k + 1 >= beach.size()) continue;
                verts.add(new double[]{e[1], e[2]});
                beach.remove(k);
                kill(k - 1);
                kill(k);
                check(k - 1);
                check(k);
            }
        }
        return uniqSorted(verts);
    }
    static List<double[]> uniqSorted(List<double[]> v) {
        List<double[]> out = new ArrayList<>();
        for (double[] p : v) { boolean dup = false; for (double[] q : out) if (Math.hypot(p[0] - q[0], p[1] - q[1]) <= 1e-6) dup = true; if (!dup) out.add(p); }
        out.sort((a, b) -> a[0] != b[0] ? Double.compare(a[0], b[0]) : Double.compare(a[1], b[1]));
        return out;
    }
    // 暴力：外接圓內沒有其他站點的三點組，圓心就是 Voronoi 頂點
    static List<double[]> brute() {
        List<double[]> out = new ArrayList<>();
        int n = S.length;
        for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) for (int k = j + 1; k < n; k++) {
            double[] cc = circum(S[i], S[j], S[k]);
            if (cc == null) continue;
            boolean empty = true;
            for (double[] s : S) if (Math.hypot(s[0] - cc[0], s[1] - cc[1]) < cc[2] - 1e-7) empty = false;
            if (empty) out.add(new double[]{cc[0], cc[1]});
        }
        return uniqSorted(out);
    }
    static double f3(double v) { return Math.abs(v) < 5e-4 ? 0.0 : v; }
    static long seed = 11;
    static long rnd() { seed = seed * 48271 % 2147483647; return seed; }

    public static void main(String[] args) {
        double[][] t2 = new double[12][];
        for (int i = 0; i < 12; i++) { double x = rnd() % 100000 / 5000.0; double y = rnd() % 100000 / 5000.0; t2[i] = new double[]{x, y}; }
        double[][][] tests = {{{3, 3}, {12, 4}, {7, 9}, {2, 13}, {15, 12}, {10, 16}, {17, 7}}, t2, {{0, 0}, {10, 1}, {5, 9}}};
        for (double[][] t : tests) {
            S = t;
            List<double[]> v = fortune(), b = brute();
            boolean same = v.size() == b.size();
            for (int i = 0; same && i < v.size(); i++) if (Math.hypot(v.get(i)[0] - b.get(i)[0], v.get(i)[1] - b.get(i)[1]) >= 1e-6) same = false;
            System.out.println(S.length + " sites: " + v.size() + " Voronoi vertices (brute force agrees " + (same ? "True" : "False") + ")");
            StringBuilder sb = new StringBuilder(" ");
            for (double[] p : v) sb.append(String.format(" (%.3f, %.3f)", f3(p[0]), f3(p[1])));
            System.out.println(sb);
        }
    }
}
