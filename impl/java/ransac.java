import java.util.*;

public class Ransac {
    static long st;
    static long next() { st = st * 48271 % 2147483647; return st; }
    static double real() { return next() / 2147483647.0; }
    static double[][] P = new double[30][];

    static double[] lsq(List<Integer> idx) {
        double n = idx.size(), sx = 0, sy = 0, sxx = 0, sxy = 0;
        for (int k : idx) { sx += P[k][0]; sy += P[k][1]; sxx += P[k][0] * P[k][0]; sxy += P[k][0] * P[k][1]; }
        double det = n * sxx - sx * sx;
        return det != 0 ? new double[]{(n * sxy - sx * sy) / det, (sxx * sy - sx * sxy) / det} : new double[]{0, sy / n};
    }
    // 隨機抽兩點定直線，數誤差門檻內的內點，保留最多者；最後只用內點重新擬合
    static void ransac(long seed, int iters, double thr) {
        st = seed;
        List<Integer> best = null;
        for (int it = 0; it < iters; it++) {
            int i = (int) (next() % 30), j = (int) (next() % 30), tries = 0;
            while (P[i][0] == P[j][0] && P[i][1] == P[j][1] && tries < 10) { j = (int) (next() % 30); tries++; }
            if (P[i][0] == P[j][0] && P[i][1] == P[j][1]) continue;
            double A = P[j][1] - P[i][1], B = P[i][0] - P[j][0], C = -(A * P[i][0] + B * P[i][1]), nrm = Math.hypot(A, B);
            List<Integer> inl = new ArrayList<>();
            for (int k = 0; k < 30; k++) if (Math.abs(A * P[k][0] + B * P[k][1] + C) / nrm < thr) inl.add(k);
            if (best == null || inl.size() > best.size()) best = inl;
        }
        double[] ab = lsq(best);
        int realIn = 0;
        for (int k : best) if (k < 20) realIn++;
        System.out.println(String.format("seed %d, %d iterations, threshold %.1f: %d inliers (%d true), refit y = %.3fx + %.3f", seed, iters, thr, best.size(), realIn, ab[0], ab[1]));
    }

    public static void main(String[] args) {
        st = 7;
        for (int i = 0; i < 20; i++) { double x = 0.5 + i * 9.0 / 19; P[i] = new double[]{x, 0.6 * x + 2 + (real() - 0.5) * 0.6}; }
        for (int i = 20; i < 30; i++) { double x = real() * 10; double y = real() * 10; P[i] = new double[]{x, y}; }
        List<Integer> all = new ArrayList<>();
        for (int k = 0; k < 30; k++) all.add(k);
        double[] ab = lsq(all);
        System.out.println(String.format("least squares on all 30 points: y = %.3fx + %.3f", ab[0], ab[1]));
        ransac(42, 20, 0.5);
        ransac(1, 5, 0.5);
        ransac(2024, 50, 0.3);
        ransac(42, 20, 1.0);
    }
}
