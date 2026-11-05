import java.util.*;

public class DagLongestPath {
    // 依拓撲順序放鬆最大距離（可有負權）；有環時回傳 null
    static Object[] longestPath(String nodes, Object[][] edges, char s) {
        Map<Character, List<int[]>> adj = new TreeMap<>();
        Map<Character, Integer> indeg = new HashMap<>();
        for (char v : nodes.toCharArray()) { adj.put(v, new ArrayList<>()); indeg.put(v, 0); }
        for (Object[] e : edges) { adj.get((Character) e[0]).add(new int[]{(Character) e[1], (Integer) e[2]}); indeg.merge((Character) e[1], 1, Integer::sum); }
        for (List<int[]> l : adj.values()) l.sort(Comparator.comparingInt(a -> a[0]));
        ArrayDeque<Character> q = new ArrayDeque<>();
        for (char v : nodes.toCharArray()) if (indeg.get(v) == 0) q.add(v);
        StringBuilder order = new StringBuilder();
        while (!q.isEmpty()) { char u = q.poll(); order.append(u); for (int[] p : adj.get(u)) if (indeg.merge((char) p[0], -1, Integer::sum) == 0) q.add((char) p[0]); }
        if (order.length() != nodes.length()) return null;
        final int NEG = -1000000;
        Map<Character, Integer> dist = new LinkedHashMap<>();
        Map<Character, Character> par = new HashMap<>();
        for (char v : nodes.toCharArray()) dist.put(v, NEG);
        dist.put(s, 0);
        for (char u : order.toString().toCharArray()) {
            if (dist.get(u) == NEG) continue;
            for (int[] p : adj.get(u)) if (dist.get(u) + p[1] > dist.get((char) p[0])) { dist.put((char) p[0], dist.get(u) + p[1]); par.put((char) p[0], u); }
        }
        char end = s;
        for (char v : nodes.toCharArray()) if (dist.get(v) > dist.get(end)) end = v;
        StringBuilder path = new StringBuilder().append(end);
        while (path.charAt(0) != s) path.insert(0, par.get(path.charAt(0)));
        return new Object[]{dist, path.toString()};
    }

    @SuppressWarnings("unchecked")
    public static void main(String[] args) {
        Object[][] edges = {{'S', 'A', 3}, {'S', 'B', 2}, {'A', 'C', 4}, {'B', 'C', 1}, {'B', 'D', 5}, {'C', 'E', -2}, {'D', 'E', 3}, {'A', 'D', 1}, {'E', 'F', 2}};
        Object[] res = longestPath("SABCDEF", edges, 'S');
        Map<Character, Integer> dist = (Map<Character, Integer>) res[0];
        String path = (String) res[1];
        StringBuilder sb = new StringBuilder("dist:");
        dist.forEach((k, v) -> sb.append(' ').append(k).append('=').append(v));
        System.out.println(sb);
        System.out.println("longest: " + String.join(" -> ", path.split("")) + " length " + dist.get(path.charAt(path.length() - 1)));
        System.out.println("with cycle: " + (longestPath("XY", new Object[][]{{'X', 'Y', 1}, {'Y', 'X', 1}}, 'X') == null ? "None" : "?"));
    }
}
