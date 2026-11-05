import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

public class PageRank {
    // PR(v) = (1-d)/N + d·Σ PR(u)/出度(u)（u 指向 v）；重複套用直到收斂（冪迭代）
    public static void main(String[] args) {
        int n = 6;
        List<List<Integer>> out = new ArrayList<>();
        for (int i = 0; i < n; i++) out.add(new ArrayList<>());
        for (String e : "AB AC BC CA DC EA ED FE BD DA".split(" ")) out.get(e.charAt(0) - 'A').add(e.charAt(1) - 'A');
        double D = 0.85;
        double[] pr = new double[n];
        Arrays.fill(pr, 1.0 / n);
        for (int it = 1; it <= 20; it++) {
            double[] nw = new double[n];
            Arrays.fill(nw, (1 - D) / n);
            for (int u = 0; u < n; u++)
                for (int v : out.get(u)) nw[v] += D * pr[u] / out.get(u).size();
            pr = nw;
            if (it == 1 || it == 5 || it == 20) {
                StringBuilder sb = new StringBuilder(String.format("iteration %2d:", it));
                for (int v = 0; v < n; v++) sb.append(String.format(" %c=%.4f", 'A' + v, pr[v]));
                System.out.println(sb);
            }
        }
        final double[] f = pr;
        Integer[] order = {0, 1, 2, 3, 4, 5};
        Arrays.sort(order, Comparator.comparingDouble(v -> -f[v]));
        StringBuilder sb = new StringBuilder("ranking:");
        for (int t = 0; t < n; t++) sb.append(t > 0 ? " > " : " ").append((char) ('A' + order[t]));
        System.out.println(sb + String.format("\nsum = %.4f", Arrays.stream(pr).sum()));
    }
}
