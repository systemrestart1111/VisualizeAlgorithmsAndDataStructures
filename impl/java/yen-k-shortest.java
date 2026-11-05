import java.util.*;

public class YenKShortest {
    static Object[][] E = {{'C', 'D', 3}, {'C', 'E', 2}, {'D', 'F', 4}, {'E', 'D', 1}, {'E', 'F', 2}, {'E', 'G', 3}, {'F', 'G', 2}, {'F', 'H', 1}, {'G', 'H', 2}};
    static String NODES = "CDEFGH";
    static char eu(int i) { return (Character) E[i][0]; }
    static char ev(int i) { return (Character) E[i][1]; }
    static int ew(int i) { return (Integer) E[i][2]; }
    record Path(String nodes, List<Integer> edges, int cost) {}

    // 同距離時取名稱較小的點；只有嚴格更短才更新前驅
    static Path dijkstra(char s, char t, Set<Integer> banE, Set<Character> banN) {
        Map<Character, Integer> dist = new HashMap<>(), prev = new HashMap<>();
        Set<Character> done = new HashSet<>();
        dist.put(s, 0);
        for (;;) {
            char u = 0;
            for (char v : NODES.toCharArray()) if (!done.contains(v) && dist.containsKey(v) && !banN.contains(v) && (u == 0 || dist.get(v) < dist.get(u))) u = v;
            if (u == 0) return null;
            if (u == t) break;
            done.add(u);
            List<Integer> nb = new ArrayList<>();
            for (int i = 0; i < E.length; i++) if (eu(i) == u) nb.add(i);
            nb.sort(Comparator.comparingInt(YenKShortest::ev));
            for (int i : nb) {
                char v = ev(i);
                if (!banE.contains(i) && !banN.contains(v) && (!dist.containsKey(v) || dist.get(u) + ew(i) < dist.get(v))) { dist.put(v, dist.get(u) + ew(i)); prev.put(v, i); }
            }
        }
        StringBuilder nodes = new StringBuilder().append(t);
        LinkedList<Integer> edges = new LinkedList<>();
        while (nodes.charAt(0) != s) { int i = prev.get(nodes.charAt(0)); edges.addFirst(i); nodes.insert(0, eu(i)); }
        return new Path(nodes.toString(), edges, dist.get(t));
    }

    public static void main(String[] args) {
        List<Path> A = new ArrayList<>(), B = new ArrayList<>();
        Path first = dijkstra('C', 'H', Set.of(), Set.of());
        if (first == null) return;
        A.add(first);
        for (int k = 1; k < 4; k++) {
            Path last = A.get(A.size() - 1);
            for (int i = 0; i + 1 < last.nodes().length(); i++) {
                String rootN = last.nodes().substring(0, i + 1);
                List<Integer> rootE = last.edges().subList(0, i);
                Set<Integer> banE = new HashSet<>();
                for (Path p : A) if (p.nodes().length() > i && p.nodes().substring(0, i + 1).equals(rootN)) banE.add(p.edges().get(i));
                Set<Character> banN = new HashSet<>();
                for (int j = 0; j < i; j++) banN.add(rootN.charAt(j));
                Path spur = dijkstra(last.nodes().charAt(i), 'H', banE, banN);
                if (spur == null) continue;
                int rc = 0;
                for (int e : rootE) rc += ew(e);
                List<Integer> edges = new ArrayList<>(rootE);
                edges.addAll(spur.edges());
                Path cand = new Path(rootN + spur.nodes().substring(1), edges, rc + spur.cost());
                boolean dup = false;
                for (Path p : A) dup |= p.nodes().equals(cand.nodes());
                for (Path p : B) dup |= p.nodes().equals(cand.nodes());
                if (!dup) B.add(cand);
            }
            if (B.isEmpty()) break;
            B.sort(Comparator.comparingInt(Path::cost).thenComparingInt(p -> p.nodes().length()).thenComparing(Path::nodes));
            A.add(B.remove(0));
        }
        for (int k = 0; k < A.size(); k++) System.out.println((k + 1) + ": " + String.join(" -> ", A.get(k).nodes().split("")) + " cost " + A.get(k).cost());
    }
}
