import java.util.*;

public class StoerWagner {
    public static void main(String[] args) {
        int[][] E = {{1, 2, 2}, {1, 5, 3}, {2, 3, 3}, {2, 5, 2}, {2, 6, 2}, {3, 4, 4}, {3, 7, 2}, {4, 7, 2}, {4, 8, 2}, {5, 6, 3}, {6, 7, 1}, {7, 8, 3}};
        List<Integer> nodes = new ArrayList<>();
        for (int[] e : E) for (int k = 0; k < 2; k++) if (!nodes.contains(e[k])) nodes.add(e[k]);
        int n = nodes.size();
        int[][] W = new int[n][n];
        for (int[] e : E) { int a = nodes.indexOf(e[0]), b = nodes.indexOf(e[1]); W[a][b] += e[2]; W[b][a] += e[2]; }
        List<List<Integer>> members = new ArrayList<>();
        for (int x : nodes) members.add(new ArrayList<>(List.of(x)));
        boolean[] alive = new boolean[n];
        Arrays.fill(alive, true);
        int best = Integer.MAX_VALUE;
        List<Integer> bestSet = new ArrayList<>();
        StringBuilder sb = new StringBuilder("cut of each phase:");
        // 每階段做最大鄰接排序，切出最後加入的點，再把最後兩點合併
        for (int phase = 0; phase < n - 1; phase++) {
            List<Integer> ids = new ArrayList<>(), order = new ArrayList<>();
            for (int i = 0; i < n; i++) if (alive[i]) ids.add(i);
            int[] w = W[ids.get(0)].clone();
            boolean[] inA = new boolean[n];
            order.add(ids.get(0)); inA[ids.get(0)] = true;
            while (order.size() < ids.size()) {
                int nxt = -1;
                for (int v : ids) if (!inA[v] && (nxt < 0 || w[v] > w[nxt])) nxt = v;
                inA[nxt] = true; order.add(nxt);
                for (int v : ids) if (!inA[v]) w[v] += W[nxt][v];
            }
            int s = order.get(order.size() - 2), t = order.get(order.size() - 1), cut = 0;
            for (int v : ids) if (v != t) cut += W[t][v];
            sb.append(' ').append(cut);
            if (cut < best) { best = cut; bestSet = new ArrayList<>(members.get(t)); }
            for (int v = 0; v < n; v++) { W[s][v] += W[t][v]; W[v][s] = W[s][v]; }
            members.get(s).addAll(members.get(t));
            alive[t] = false;
        }
        Collections.sort(bestSet);
        System.out.println(sb);
        System.out.println("min cut: " + best + " side: " + bestSet);
    }
}
