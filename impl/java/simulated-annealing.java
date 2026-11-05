public class SimulatedAnnealing {
    static final int NC = 8;
    static double[][] C = new double[NC][2];
    static long st;
    static long nxt() { st = st * 48271 % 2147483647; return st; }

    static double length(int[] t) {
        double s = 0;
        for (int i = 0; i < NC; i++) { int a = t[i], b = t[(i + 1) % NC]; s += Math.sqrt((C[a][0] - C[b][0]) * (C[a][0] - C[b][0]) + (C[a][1] - C[b][1]) * (C[a][1] - C[b][1])); }
        return s;
    }
    static double bestBrute = Double.MAX_VALUE;
    static void perm(int[] a, int k) {
        if (k == NC) { bestBrute = Math.min(bestBrute, length(a)); return; }
        for (int i = k; i < NC; i++) { int t = a[k]; a[k] = a[i]; a[i] = t; perm(a, k + 1); t = a[k]; a[k] = a[i]; a[i] = t; }
    }

    // 2-opt 反轉一段；變短必接受，變長以 e^(−Δ/T) 接受；T 每步乘以冷卻率
    static void anneal(long seed, int steps, double cool, double opt) {
        st = seed;
        int[] tour = new int[NC];
        for (int i = 0; i < NC; i++) tour[i] = i;
        for (int i = NC - 1; i > 0; i--) { int j = (int) (nxt() % (i + 1)), t = tour[i]; tour[i] = tour[j]; tour[j] = t; }
        double cur = length(tour), best = cur, T = 2.0;
        int worse = 0;
        for (int s = 0; s < steps; s++) {
            int i = (int) (nxt() % NC), j = (int) (nxt() % NC);
            if (i > j) { int t = i; i = j; j = t; }
            if (i == j) { T *= cool; continue; }
            int[] nt = new int[NC];
            for (int k = 0; k < NC; k++) nt[k] = k < i || k > j ? tour[k] : tour[i + j - k];
            double nl = length(nt), d = nl - cur;
            if (Math.abs(d) < 1e-9) d = 0; // 長度相同（例如整條路線反轉）時視為 0，避免不同語言的捨入差異
            if (d < 0 || nxt() / 2147483647.0 < Math.exp(-d / T)) {
                if (d > 0) worse++;
                tour = nt;
                cur = nl;
                if (cur < best - 1e-12) best = cur;
            }
            T *= cool;
        }
        System.out.println(String.format("seed %d, %d steps, cooling %s: best %.3f, gap %.2f%%, accepted %d worse moves", seed, steps, cool, best, 100 * (best - opt) / opt, worse));
    }

    public static void main(String[] args) {
        st = 21;
        for (int i = 0; i < NC; i++) { C[i][0] = (nxt() % 1000) / 100.0; C[i][1] = (nxt() % 1000) / 100.0; }
        int[] a = new int[NC];
        for (int i = 0; i < NC; i++) a[i] = i;
        perm(a, 1);
        System.out.println(String.format("8 cities, brute-force optimum %.3f", bestBrute));
        anneal(7, 2000, 0.997, bestBrute);
        anneal(7, 300, 0.99, bestBrute);
        anneal(11, 2000, 0.997, bestBrute);
        anneal(3, 8000, 0.9995, bestBrute);
    }
}
