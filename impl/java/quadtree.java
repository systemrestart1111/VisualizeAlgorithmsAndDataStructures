import java.util.*;

public class Quadtree {
    static final int CAP = 1, MAXD = 5;
    static class QT {
        int x0, y0, s, depth;
        List<int[]> pts = new ArrayList<>();
        QT[] kids;
        QT(int x0, int y0, int s, int d) { this.x0 = x0; this.y0 = y0; this.s = s; depth = d; }
        // 葉格滿了且未達最大深度就分成四格，原本的點往下移
        void insert(int[] p) {
            if (kids == null) {
                if (pts.size() < CAP || depth >= MAXD) { pts.add(p); return; }
                int h = s / 2;
                kids = new QT[]{new QT(x0, y0, h, depth + 1), new QT(x0 + h, y0, h, depth + 1), new QT(x0, y0 + h, h, depth + 1), new QT(x0 + h, y0 + h, h, depth + 1)};
                List<int[]> old = pts;
                pts = new ArrayList<>();
                for (int[] q : old) insert(q);
            }
            int h = s / 2, k = (p[0] >= x0 + h ? 1 : 0) + (p[1] >= y0 + h ? 2 : 0);
            kids[k].insert(p);
        }
        // 只走進與查詢矩形相交的格子；回傳拜訪的格子數
        int range(int x1, int y1, int x2, int y2, List<int[]> out) {
            if (x0 > x2 || x0 + s <= x1 || y0 > y2 || y0 + s <= y1) return 0;
            for (int[] p : pts) if (p[0] >= x1 && p[0] <= x2 && p[1] >= y1 && p[1] <= y2) out.add(p);
            int v = 1;
            if (kids != null) for (QT c : kids) v += c.range(x1, y1, x2, y2, out);
            return v;
        }
        int count() { int c = 1; if (kids != null) for (QT k : kids) c += k.count(); return c; }
    }

    public static void main(String[] args) {
        QT root = new QT(0, 0, 64, 0);
        for (int[] p : new int[][]{{10, 10}, {50, 12}, {20, 40}, {30, 35}, {55, 55}, {8, 52}, {40, 20}, {45, 22}, {45, 22}, {45, 22}}) root.insert(p);
        System.out.println("cells: " + root.count());
        for (int[] r : new int[][]{{10, 10, 40, 40}, {40, 10, 63, 30}, {0, 0, 63, 63}, {60, 0, 63, 5}}) {
            List<int[]> out = new ArrayList<>();
            int v = root.range(r[0], r[1], r[2], r[3], out);
            out.sort((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
            StringBuilder sb = new StringBuilder();
            for (int[] p : out) sb.append(sb.length() > 0 ? ", " : "").append("(").append(p[0]).append(", ").append(p[1]).append(")");
            System.out.println("range (" + r[0] + ", " + r[1] + ", " + r[2] + ", " + r[3] + "): " + out.size() + " points [" + sb + "] visited " + v);
        }
    }
}
