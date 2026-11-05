import java.util.*;

public class Quickhull {
    static List<long[]> S;
    static long cross(long[] o, long[] a, long[] b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }

    // 遞迴找離線段 PQ 最遠的點，三角形內的點丟掉
    static List<Integer> findHull(List<Integer> pts, int p, int q) {
        List<Integer> res = new ArrayList<>();
        if (pts.isEmpty()) return res;
        int f = pts.get(0);
        for (int i : pts) if (cross(S.get(p), S.get(q), S.get(i)) > cross(S.get(p), S.get(q), S.get(f))) f = i;
        List<Integer> s1 = new ArrayList<>(), s2 = new ArrayList<>();
        for (int i : pts) {
            if (cross(S.get(p), S.get(f), S.get(i)) > 0) s1.add(i);
            if (cross(S.get(f), S.get(q), S.get(i)) > 0) s2.add(i);
        }
        res.addAll(findHull(s1, p, f));
        res.add(f);
        res.addAll(findHull(s2, f, q));
        return res;
    }
    static Comparator<long[]> byXY = (a, b) -> a[0] != b[0] ? Long.compare(a[0], b[0]) : Long.compare(a[1], b[1]);
    static List<long[]> monotone(List<long[]> pts) {
        List<long[]> p = new ArrayList<>(pts);
        p.sort(byXY);
        if (p.size() < 3) return p;
        List<long[]> lo = new ArrayList<>(), up = new ArrayList<>();
        for (long[] q : p) { while (lo.size() >= 2 && cross(lo.get(lo.size() - 2), lo.get(lo.size() - 1), q) <= 0) lo.remove(lo.size() - 1); lo.add(q); }
        for (int i = p.size() - 1; i >= 0; i--) { while (up.size() >= 2 && cross(up.get(up.size() - 2), up.get(up.size() - 1), p.get(i)) <= 0) up.remove(up.size() - 1); up.add(p.get(i)); }
        lo.remove(lo.size() - 1);
        up.remove(up.size() - 1);
        lo.addAll(up);
        return lo;
    }
    static long seed = 7;
    static long rnd(int n) { seed = seed * 48271 % 2147483647; return seed % n; }

    public static void main(String[] args) {
        long[][] t3 = new long[30][];
        for (int i = 0; i < 30; i++) { long x = rnd(100); long y = rnd(100); t3[i] = new long[]{x, y}; }
        long[][][] tests = {{{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}, {5, 5}}, {{0, 0}, {4, 0}, {4, 4}, {0, 4}, {2, 0}, {2, 2}, {4, 2}, {0, 0}, {0, 2}}, t3};
        for (long[][] raw : tests) {
            S = new ArrayList<>();
            for (long[] p : raw) { boolean dup = false; for (long[] q : S) if (q[0] == p[0] && q[1] == p[1]) dup = true; if (!dup) S.add(p); }
            int n = S.size(), A = 0, B = 0;
            for (int i = 1; i < n; i++) { if (byXY.compare(S.get(i), S.get(A)) < 0) A = i; if (byXY.compare(S.get(i), S.get(B)) > 0) B = i; }
            List<Integer> up = new ArrayList<>(), down = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                if (i == A || i == B) continue;
                long c = cross(S.get(A), S.get(B), S.get(i));
                if (c > 0) up.add(i); else if (c < 0) down.add(i);
            }
            List<Integer> cw = new ArrayList<>();
            cw.add(A); cw.addAll(findHull(up, A, B)); cw.add(B); cw.addAll(findHull(down, B, A));
            List<long[]> h = new ArrayList<>();
            h.add(S.get(cw.get(0)));
            for (int i = cw.size() - 1; i >= 1; i--) h.add(S.get(cw.get(i)));
            List<long[]> hs = new ArrayList<>(h), ref = monotone(S);
            hs.sort(byXY);
            ref.sort(byXY);
            boolean same = hs.size() == ref.size();
            for (int i = 0; same && i < hs.size(); i++) if (byXY.compare(hs.get(i), ref.get(i)) != 0) same = false;
            StringBuilder sb = new StringBuilder("hull (" + h.size() + "):");
            for (long[] p : h) sb.append(" (").append(p[0]).append(',').append(p[1]).append(')');
            System.out.println(sb + "; same as monotone chain " + (same ? "True" : "False"));
        }
    }
}
