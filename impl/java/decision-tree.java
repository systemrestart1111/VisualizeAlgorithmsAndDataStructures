import java.util.*;

public class DecisionTree {
    static double[][] X = new double[30][2];
    static int[] Y = new int[30];
    static int K;

    static void data(String kind) {
        long s = 3;
        K = 0;
        for (int i = 0; i < 30; i++) {
            s = s * 48271 % 2147483647; double x = (s % 1000) / 100.0;
            s = s * 48271 % 2147483647; double y = (s % 1000) / 100.0;
            X[i][0] = x; X[i][1] = y;
            Y[i] = kind.equals("xor") ? ((x < 5) != (y < 5) ? 1 : 0) : kind.equals("diag") ? (x + y > 10 ? 1 : 0) : (x > 6 ? 2 : y > 5 ? 1 : 0);
            K = Math.max(K, Y[i] + 1);
        }
    }
    static double gini(List<Integer> idx) {
        if (idx.isEmpty()) return 0;
        int[] c = new int[K];
        for (int i : idx) c[Y[i]]++;
        double s = 1;
        for (int v : c) s -= ((double) v / idx.size()) * ((double) v / idx.size());
        return s;
    }
    static int majority(List<Integer> idx) {
        int[] c = new int[K];
        for (int i : idx) c[Y[i]]++;
        int best = 0;
        for (int k = 1; k < K; k++) if (c[k] > c[best]) best = k;
        return best;
    }

    // Gini 最低的切分；停止：純淨、達深度上限或樣本 < 2；平手取特徵小、門檻小
    static void build(List<Integer> idx, int depth, int maxDepth, String pad) {
        double g = gini(idx);
        if (g < 1e-12 || depth >= maxDepth || idx.size() < 2) { System.out.println(pad + "leaf class " + majority(idx) + " (n=" + idx.size() + ")"); return; }
        int bf = -1;
        double bs = 0, bt = 0;
        for (int f = 0; f < 2; f++) {
            TreeSet<Double> vs = new TreeSet<>();
            for (int i : idx) vs.add(X[i][f]);
            Double[] vals = vs.toArray(new Double[0]);
            for (int k = 0; k + 1 < vals.length; k++) {
                double t = (vals[k] + vals[k + 1]) / 2;
                List<Integer> L = new ArrayList<>(), R = new ArrayList<>();
                for (int i : idx) (X[i][f] <= t ? L : R).add(i);
                double s = (double) L.size() / idx.size() * gini(L) + (double) R.size() / idx.size() * gini(R);
                if (bf < 0 || s < bs - 1e-12) { bf = f; bs = s; bt = t; }
            }
        }
        if (bf < 0) { System.out.println(pad + "leaf class " + majority(idx) + " (n=" + idx.size() + ")"); return; }
        List<Integer> L = new ArrayList<>(), R = new ArrayList<>();
        for (int i : idx) (X[i][bf] <= bt ? L : R).add(i);
        System.out.println(String.format("%sx%d <= %.3f (n=%d, gini %.3f -> %.3f)", pad, bf + 1, bt, idx.size(), g, bs));
        build(L, depth + 1, maxDepth, pad + "  ");
        build(R, depth + 1, maxDepth, pad + "  ");
    }

    public static void main(String[] args) {
        String[] kinds = {"blocks", "xor", "xor", "diag"};
        int[] depths = {2, 2, 3, 3};
        for (int t = 0; t < 4; t++) {
            data(kinds[t]);
            List<Integer> idx = new ArrayList<>();
            for (int i = 0; i < 30; i++) idx.add(i);
            System.out.println(kinds[t] + ", max depth " + depths[t] + ":");
            build(idx, 0, depths[t], "  ");
        }
    }
}
