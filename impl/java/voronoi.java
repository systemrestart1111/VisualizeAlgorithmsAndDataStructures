import java.util.ArrayList;
import java.util.List;

public class Voronoi {
    // 保留滿足 a·x + b·y <= c 的部分（凸多邊形與半平面的交集）
    static List<double[]> clipHalfplane(List<double[]> poly, double a, double b, double c) {
        List<double[]> out = new ArrayList<>();
        for (int k = 0; k < poly.size(); k++) {
            double[] p = poly.get(k), q = poly.get((k + 1) % poly.size());
            double fp = a * p[0] + b * p[1] - c, fq = a * q[0] + b * q[1] - c;
            if (fp <= 0) out.add(p);
            if ((fp < 0 && fq > 0) || (fq < 0 && fp > 0)) {
                double t = fp / (fp - fq);
                out.add(new double[] {p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t});
            }
        }
        return out;
    }

    static double area(List<double[]> poly) {
        double s = 0;
        for (int i = 0; i < poly.size(); i++) {
            double[] p = poly.get(i), q = poly.get((i + 1) % poly.size());
            s += p[0] * q[1] - q[0] * p[1];
        }
        return Math.abs(s) / 2;
    }

    // 站點 i 的 Voronoi 區域 = 外框依序被「比站點 j 更靠近站點 i」的半平面（垂直平分線的一側）裁切後剩下的部分
    public static void main(String[] args) {
        double[][] S = {{3, 3}, {12, 4}, {7, 9}, {2, 13}, {15, 12}, {10, 16}, {17, 7}};
        double x0 = S[0][0], x1 = S[0][0], y0 = S[0][1], y1 = S[0][1];
        for (double[] s : S) { x0 = Math.min(x0, s[0]); x1 = Math.max(x1, s[0]); y0 = Math.min(y0, s[1]); y1 = Math.max(y1, s[1]); }
        x0 -= 3; x1 += 3; y0 -= 3; y1 += 3;
        double total = 0;
        for (int i = 0; i < S.length; i++) {
            List<double[]> cell = new ArrayList<>(List.of(new double[] {x0, y0}, new double[] {x1, y0}, new double[] {x1, y1}, new double[] {x0, y1}));
            for (int j = 0; j < S.length; j++) {
                if (i == j) continue;
                double sx = S[i][0], sy = S[i][1], tx = S[j][0], ty = S[j][1];
                // |P - S|² <= |P - T|²  <=>  2(T - S)·P <= |T|² - |S|²
                cell = clipHalfplane(cell, 2 * (tx - sx), 2 * (ty - sy), tx * tx + ty * ty - sx * sx - sy * sy);
            }
            total += area(cell);
            System.out.println(String.format("site %d (%.0f,%.0f): %d vertices, area = %.4f", i, S[i][0], S[i][1], cell.size(), area(cell)));
        }
        System.out.println(String.format("sum of areas = %.4f (box area = %.0f)", total, (x1 - x0) * (y1 - y0)));
    }
}
