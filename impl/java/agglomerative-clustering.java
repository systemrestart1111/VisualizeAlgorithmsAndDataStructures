import java.util.*;

public class AgglomerativeClustering {
    static double[][] P = {{1.8, 2.5}, {3.1, 3.4}, {2.2, 4.0}, {3.0, 2.1}, {6.4, 7.0}, {7.6, 8.1}, {7.2, 6.6}, {6.6, 8.4}, {8.1, 2.9}, {7.0, 2.0}, {7.9, 1.6}};
    static double d(int i, int j) { double dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1]; return Math.sqrt(dx * dx + dy * dy); }
    static String setStr(List<Integer> v) { List<Integer> s = new ArrayList<>(v); Collections.sort(s); StringBuilder b = new StringBuilder("{"); for (int i = 0; i < s.size(); i++) b.append(i > 0 ? "," : "").append(s.get(i)); return b + "}"; }

    // 最小堆存所有群對距離；取出時若有一群已被合併就略過（延遲刪除）
    static void run(String linkage) {
        int n = P.length;
        Map<Integer, List<Integer>> clusters = new TreeMap<>();
        for (int i = 0; i < n; i++) clusters.put(i, new ArrayList<>(List.of(i)));
        java.util.function.BiFunction<List<Integer>, List<Integer>, Double> link = (A, B) -> {
            double mn = 1e18, mx = -1, sum = 0;
            for (int i : A) for (int j : B) { double v = d(i, j); mn = Math.min(mn, v); mx = Math.max(mx, v); sum += v; }
            return linkage.equals("single") ? mn : linkage.equals("complete") ? mx : sum / (A.size() * B.size());
        };
        PriorityQueue<double[]> pq = new PriorityQueue<>((x, y) -> x[0] != y[0] ? Double.compare(x[0], y[0]) : x[1] != y[1] ? Double.compare(x[1], y[1]) : Double.compare(x[2], y[2]));
        for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) pq.add(new double[]{link.apply(List.of(i), List.of(j)), i, j});
        int nxt = n;
        List<int[]> hist = new ArrayList<>();
        StringBuilder sb = new StringBuilder(linkage + ":");
        while (clusters.size() > 1) {
            double[] it = pq.poll();
            int a = (int) it[1], b = (int) it[2];
            if (!clusters.containsKey(a) || !clusters.containsKey(b)) continue;
            List<Integer> A = clusters.remove(a), B = clusters.remove(b);
            sb.append(' ').append(setStr(A)).append('+').append(setStr(B)).append(String.format("@%.3f", it[0]));
            hist.add(new int[]{a, b});
            List<Integer> AB = new ArrayList<>(A);
            AB.addAll(B);
            clusters.put(nxt, AB);
            for (Map.Entry<Integer, List<Integer>> e : clusters.entrySet()) if (e.getKey() != nxt) pq.add(new double[]{link.apply(e.getValue(), AB), Math.min(e.getKey(), nxt), Math.max(e.getKey(), nxt)});
            nxt++;
        }
        System.out.println(sb);
        Map<Integer, List<Integer>> groups = new HashMap<>();
        for (int i = 0; i < n; i++) groups.put(i, new ArrayList<>(List.of(i)));
        for (int s = 0; s < n - 3; s++) {
            List<Integer> g = groups.remove(hist.get(s)[0]);
            g.addAll(groups.remove(hist.get(s)[1]));
            groups.put(n + s, g);
        }
        List<List<Integer>> gs = new ArrayList<>();
        for (List<Integer> g : groups.values()) { List<Integer> v = new ArrayList<>(g); Collections.sort(v); gs.add(v); }
        gs.sort(Comparator.comparingInt(v -> v.get(0)));
        StringBuilder out = new StringBuilder("  3 clusters:");
        for (List<Integer> g : gs) out.append(' ').append(setStr(g));
        System.out.println(out);
    }

    public static void main(String[] args) {
        run("single");
        run("complete");
        run("average");
    }
}
