import java.util.*;

public class CentroidDecomposition {
    static TreeMap<Integer, List<Integer>> adj = new TreeMap<>();
    static Set<Integer> removed = new HashSet<>();
    static Map<Integer, Integer> cpar = new HashMap<>(), level = new HashMap<>();

    static List<Integer> component(int s) {
        List<Integer> order = new ArrayList<>(List.of(s));
        Set<Integer> seen = new HashSet<>(List.of(s));
        for (int i = 0; i < order.size(); i++) for (int v : adj.get(order.get(i))) if (!removed.contains(v) && seen.add(v)) order.add(v);
        return order;
    }
    // 找出塊的重心（刪除後最大塊 ≤ 一半），移除後對每一塊遞迴
    static void decompose(int start, Integer par, int lv) {
        List<Integer> order = component(start);
        Map<Integer, Integer> pr = new HashMap<>(), sz = new HashMap<>();
        pr.put(start, null);
        for (int u : order) for (int v : adj.get(u)) if (!removed.contains(v) && !pr.containsKey(v)) pr.put(v, u);
        for (int i = order.size() - 1; i >= 0; i--) {
            int u = order.get(i), s = 1;
            for (int v : adj.get(u)) if (!removed.contains(v) && Objects.equals(pr.get(v), u)) s += sz.get(v);
            sz.put(u, s);
        }
        int n = order.size(), c = start;
        for (int u : order) {
            int big = n - sz.get(u);
            for (int v : adj.get(u)) if (!removed.contains(v) && Objects.equals(pr.get(v), u)) big = Math.max(big, sz.get(v));
            if (2 * big <= n) { c = u; break; }
        }
        removed.add(c); cpar.put(c, par); level.put(c, lv);
        for (int v : adj.get(c)) if (!removed.contains(v)) decompose(v, c, lv + 1);
    }

    public static void main(String[] args) {
        for (int[] e : new int[][]{{1, 2}, {2, 3}, {3, 4}, {4, 5}, {5, 6}, {6, 7}, {4, 8}, {8, 9}, {9, 10}, {2, 11}, {6, 12}}) {
            adj.computeIfAbsent(e[0], k -> new ArrayList<>()).add(e[1]);
            adj.computeIfAbsent(e[1], k -> new ArrayList<>()).add(e[0]);
        }
        for (List<Integer> l : adj.values()) l.sort(Comparator.comparing(String::valueOf)); // 鄰居依字串排序
        decompose(1, null, 0);
        int depth = 0;
        for (int v : adj.keySet()) {
            System.out.printf("node %2d: level %d, centroid parent %s%n", v, level.get(v), cpar.get(v) == null ? "-" : cpar.get(v).toString());
            depth = Math.max(depth, level.get(v) + 1);
        }
        System.out.println("depth: " + depth);
    }
}
