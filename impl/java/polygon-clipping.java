import java.util.ArrayList;
import java.util.List;

public class PolygonClipping {
    static double cross(double[] o, double[] a, double[] b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }

    // 線段 pq 與直線 ab 的交點
    static double[] intersect(double[] p, double[] q, double[] a, double[] b) {
        double t = cross(a, b, p) / (cross(a, b, p) - cross(a, b, q));
        return new double[] {p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t};
    }

    // Sutherland–Hodgman：依序用裁切窗的每一條邊去裁多邊形，只保留在邊左側（內側）的部分
    static List<double[]> clip(List<double[]> out, double[][] win) {
        for (int i = 0; i < win.length; i++) {
            double[] a = win[i], b = win[(i + 1) % win.length];
            List<double[]> in = out;
            out = new ArrayList<>();
            for (int k = 0; k < in.size(); k++) {
                double[] p = in.get(k), q = in.get((k + 1) % in.size());
                boolean pin = cross(a, b, p) >= 0, qin = cross(a, b, q) >= 0;
                if (pin && qin) out.add(q);
                else if (pin && !qin) out.add(intersect(p, q, a, b));
                else if (!pin && qin) { out.add(intersect(p, q, a, b)); out.add(q); }
            }
        }
        return out;
    }

    public static void main(String[] args) {
        List<double[]> subj = new ArrayList<>(List.of(new double[] {1, 4}, new double[] {5, 11}, new double[] {9, 6}, new double[] {13, 10}, new double[] {12, 2}, new double[] {6, 0}));
        double[][] win = {{3, 2}, {11, 2}, {11, 8}, {3, 8}}; // 裁切窗：凸多邊形，逆時針
        List<double[]> res = clip(subj, win);
        System.out.println("clipped polygon: " + res.size() + " vertices");
        for (double[] p : res) System.out.println(String.format("  (%.4f, %.4f)", p[0], p[1]));
    }
}
