import java.util.*;

public class Iddfs {
    static TreeMap<Character, List<Character>> adj = new TreeMap<>();
    static List<Character> path = new ArrayList<>();
    static int visits;

    static boolean dls(char u, char t, int lim) {
        visits++;
        path.add(u);
        if (u == t) return true;
        if (lim > 0)
            for (char v : adj.get(u)) if (!path.contains(v) && dls(v, t, lim - 1)) return true;
        path.remove(path.size() - 1);
        return false;
    }

    public static void main(String[] args) {
        for (String e : new String[]{"AB", "AC", "BD", "BE", "CF", "CG", "DH", "EI", "FJ", "GK", "EF"}) {
            adj.computeIfAbsent(e.charAt(0), k -> new ArrayList<>()).add(e.charAt(1));
            adj.computeIfAbsent(e.charAt(1), k -> new ArrayList<>()).add(e.charAt(0));
        }
        adj.values().forEach(Collections::sort);
        for (char t : new char[]{'J', 'H', 'A'}) {
            List<Integer> counts = new ArrayList<>();
            boolean found = false;
            // 深度上限 0、1、2…逐一做深度受限 DFS
            for (int limit = 0; limit <= adj.size() && !found; limit++) {
                visits = 0; path.clear();
                found = dls('A', t, limit);
                counts.add(visits);
            }
            StringBuilder p = new StringBuilder();
            for (char c : path) p.append(p.length() > 0 ? " -> " : "").append(c);
            int total = counts.stream().mapToInt(Integer::intValue).sum();
            System.out.println("A -> " + t + ": depth " + (path.size() - 1) + ", path " + p + ", visits per limit " + counts + ", total " + total);
        }
    }
}
