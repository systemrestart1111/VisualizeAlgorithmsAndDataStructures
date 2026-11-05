import java.util.*;

public class EarClipping {
    static double cross(double[] o, double[] a, double[] b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    static double area(double[][] P) { double s = 0; for (int i = 0; i < P.length; i++) { int j = (i + 1) % P.length; s += P[i][0] * P[j][1] - P[j][0] * P[i][1]; } return s / 2; }

    // 凸頂點且三角形內沒有其他頂點 → 耳朵；切下來直到剩一個三角形
    static List<int[]> earClipping(double[][] P) {
        List<Integer> idx = new ArrayList<>();
        for (int i = 0; i < P.length; i++) idx.add(i);
        if (area(P) < 0) Collections.reverse(idx);
        List<int[]> tris = new ArrayList<>();
        while (idx.size() > 3) {
            int m = idx.size();
            boolean clipped = false;
            for (int k = 0; k < m && !clipped; k++) {
                int p = idx.get((k + m - 1) % m), i = idx.get(k), q = idx.get((k + 1) % m);
                if (cross(P[p], P[i], P[q]) <= 1e-12) continue; // 凹頂點
                boolean inside = false;
                for (int j : idx) {
                    if (j == p || j == i || j == q) continue;
                    if (cross(P[p], P[i], P[j]) >= -1e-12 && cross(P[i], P[q], P[j]) >= -1e-12 && cross(P[q], P[p], P[j]) >= -1e-12) inside = true;
                }
                if (inside) continue;
                tris.add(new int[]{p, i, q});
                idx.remove(k);
                clipped = true;
            }
            if (!clipped) return null;
        }
        tris.add(new int[]{idx.get(0), idx.get(1), idx.get(2)});
        return tris;
    }

    public static void main(String[] args) {
        double[][][] polys = {{{0, 0}, {8, 0}, {8, 6}, {5, 3}, {3, 7}, {1, 4}}, {{0, 0}, {10, 0}, {10, 8}, {7, 8}, {7, 3}, {3, 3}, {3, 8}, {0, 8}}, {{1, 4}, {3, 7}, {5, 3}, {8, 6}, {8, 0}, {0, 0}}};
        for (double[][] P : polys) {
            List<int[]> tris = earClipping(P);
            double total = 0;
            StringBuilder sb = new StringBuilder(P.length + " vertices -> " + tris.size() + " triangles:");
            for (int[] t : tris) { total += Math.abs(area(new double[][]{P[t[0]], P[t[1]], P[t[2]]})); sb.append(' ').append(t[0]).append('-').append(t[1]).append('-').append(t[2]); }
            System.out.println(sb + String.format("; area sum %.2f = shoelace %.2f", total, Math.abs(area(P))));
        }
    }
}
