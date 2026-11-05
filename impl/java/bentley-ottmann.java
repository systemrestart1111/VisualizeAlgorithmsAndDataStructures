import java.util.*;

public class BentleyOttmann {
    static double[][] L;
    static double yAt(int i, double x) { return L[i][1] + (L[i][3] - L[i][1]) * (x - L[i][0]) / (L[i][2] - L[i][0]); }
    static double[] segX(int i, int j) {
        double x1 = L[i][0], y1 = L[i][1], x2 = L[i][2], y2 = L[i][3], x3 = L[j][0], y3 = L[j][1], x4 = L[j][2], y4 = L[j][3];
        double d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
        if (Math.abs(d) < 1e-12) return null;
        double u = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d, v = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
        if (u < -1e-9 || u > 1 + 1e-9 || v < -1e-9 || v > 1 + 1e-9) return null;
        return new double[]{x1 + u * (x2 - x1), y1 + u * (y2 - y1)};
    }
    static String key(double x, double y) { return Math.round(x * 1e6) + "," + Math.round(y * 1e6); }
    static int rank(int k) { return k == 0 ? 1 : k == 1 ? 0 : 2; }
    static double f3(double v) { return Math.abs(v) < 5e-4 ? 0.0 : v; }

    // 掃描線由左往右；只檢查 status 中新相鄰的一對；同點多線只回報一次
    static void run(double[][] raw) {
        int m = raw.length;
        L = new double[m][];
        List<double[]> Q = new ArrayList<>(); // {x, y, kind, s}
        double xmin = 1e18, xmax = -1e18;
        for (int i = 0; i < m; i++) {
            double[] r = raw[i];
            L[i] = r[0] < r[2] ? new double[]{r[0], r[1], r[2], r[3]} : new double[]{r[2], r[3], r[0], r[1]};
            xmin = Math.min(xmin, L[i][0]); xmax = Math.max(xmax, L[i][2]);
            Q.add(new double[]{L[i][0], L[i][1], 0, i});
            Q.add(new double[]{L[i][2], L[i][3], 2, i});
        }
        final double delta = (xmax - xmin + 2) * 1e-7;
        Comparator<double[]> cq = (p, q) -> p[0] != q[0] ? Double.compare(p[0], q[0]) : p[1] != q[1] ? Double.compare(p[1], q[1]) : rank((int) p[2]) - rank((int) q[2]);
        Q.sort(cq);
        List<Integer> status = new ArrayList<>();
        Set<String> queued = new HashSet<>();
        List<double[]> foundPt = new ArrayList<>();
        List<List<Integer>> foundSeg = new ArrayList<>();
        while (!Q.isEmpty()) {
            double[] e = Q.remove(0);
            double x = e[0], y = e[1];
            Set<String> before = new HashSet<>();
            for (int k = 0; k + 1 < status.size(); k++) before.add(Math.min(status.get(k), status.get(k + 1)) + "-" + Math.max(status.get(k), status.get(k + 1)));
            if (e[2] == 0) { status.add((int) e[3]); status.sort(Comparator.comparingDouble(i -> yAt(i, x + delta))); }
            else if (e[2] == 2) status.remove(Integer.valueOf((int) e[3]));
            else {
                List<Integer> through = new ArrayList<>();
                for (int i = 0; i < m; i++) if (L[i][0] - 1e-9 <= x && x <= L[i][2] + 1e-9 && Math.abs(yAt(i, x) - y) < 1e-7) through.add(i);
                foundPt.add(new double[]{x, y});
                foundSeg.add(through);
                status.sort(Comparator.comparingDouble(i -> yAt(i, x + delta)));
            }
            for (int k = 0; k + 1 < status.size(); k++) {
                int a = status.get(k), b = status.get(k + 1);
                if (before.contains(Math.min(a, b) + "-" + Math.max(a, b))) continue;
                double[] p = segX(a, b);
                if (p == null || p[0] < x - 1e-9 || (Math.abs(p[0] - x) <= 1e-9 && p[1] < y - 1e-9)) continue;
                if (!queued.add(key(p[0], p[1]))) continue;
                Q.add(new double[]{p[0], p[1], 1, -1});
            }
            Q.sort(cq);
        }
        Set<String> brute = new HashSet<>(), mine = new HashSet<>();
        for (int i = 0; i < m; i++) for (int j = i + 1; j < m; j++) { double[] p = segX(i, j); if (p != null) brute.add(key(p[0], p[1])); }
        for (double[] p : foundPt) mine.add(key(p[0], p[1]));
        Integer[] ord = new Integer[foundPt.size()];
        for (int i = 0; i < ord.length; i++) ord[i] = i;
        Arrays.sort(ord, (a, b) -> foundPt.get(a)[0] != foundPt.get(b)[0] ? Double.compare(foundPt.get(a)[0], foundPt.get(b)[0]) : Double.compare(foundPt.get(a)[1], foundPt.get(b)[1]));
        System.out.println(foundPt.size() + " intersections (brute force agrees " + (brute.equals(mine) ? "True" : "False") + ")");
        for (int f : ord) {
            StringBuilder sb = new StringBuilder(String.format("  (%.3f, %.3f): segments", f3(foundPt.get(f)[0]), f3(foundPt.get(f)[1])));
            for (int i : foundSeg.get(f)) sb.append(' ').append(i);
            System.out.println(sb);
        }
    }

    public static void main(String[] args) {
        run(new double[][]{{1, 2, 9, 8}, {1, 7, 8, 1}, {3, 1, 10, 6}, {2, 9, 11, 3}, {4, 5, 12, 5}, {6, 8, 12, 9}});
        run(new double[][]{{0, 0, 10, 10}, {0, 10, 10, 0}, {0, 5, 10, 5}, {2, 8, 4, 9}});
        run(new double[][]{{0, 0, 5, 5}, {5, 5, 10, 0}, {1, 4, 9, 4}});
    }
}
