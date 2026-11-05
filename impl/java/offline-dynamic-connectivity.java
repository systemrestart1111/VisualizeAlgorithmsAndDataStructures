import java.util.*;

public class OfflineDynamicConnectivity {
    static String[][] ev;
    static Map<Integer, List<String[]>> seg = new HashMap<>();
    static Map<String, String> parent = new HashMap<>();
    static Map<String, Integer> size = new HashMap<>();
    static Deque<String[]> hist = new ArrayDeque<>();
    static TreeMap<Integer, Boolean> answers = new TreeMap<>();

    static void insert(int o, int l, int r, int ql, int qr, String[] e) {
        if (qr < l || r < ql || ql > qr) return;
        if (ql <= l && r <= qr) { seg.computeIfAbsent(o, k -> new ArrayList<>()).add(e); return; }
        int m = (l + r) / 2;
        insert(2 * o, l, m, ql, qr, e);
        insert(2 * o + 1, m + 1, r, ql, qr, e);
    }
    static String find(String x) { parent.putIfAbsent(x, x); size.putIfAbsent(x, 1); while (!parent.get(x).equals(x)) x = parent.get(x); return x; }
    // DFS 線段樹：合併掛在節點上的邊，葉子回答查詢，離開時回滾
    static void dfs(int o, int l, int r) {
        int before = hist.size();
        for (String[] e : seg.getOrDefault(o, List.of())) {
            String ra = find(e[0]), rb = find(e[1]);
            if (ra.equals(rb)) continue;
            if (size.get(ra) > size.get(rb)) { String t = ra; ra = rb; rb = t; }
            parent.put(ra, rb); size.put(rb, size.get(rb) + size.get(ra));
            hist.push(new String[]{ra, rb});
        }
        if (l == r) { if (ev[l][0].equals("?")) answers.put(l, find(ev[l][1]).equals(find(ev[l][2]))); }
        else { int m = (l + r) / 2; dfs(2 * o, l, m); dfs(2 * o + 1, m + 1, r); }
        while (hist.size() > before) { String[] h = hist.pop(); parent.put(h[0], h[0]); size.put(h[1], size.get(h[1]) - size.get(h[0])); }
    }

    public static void main(String[] args) {
        String text = "+ 1 2; + 2 3; ? 1 3; + 4 5; - 2 3; ? 1 3; + 3 4; ? 1 5; + 1 3; ? 2 5; - 1 2; ? 2 5";
        String[] parts = text.split("; ");
        ev = new String[parts.length][];
        for (int i = 0; i < parts.length; i++) ev[i] = parts[i].split(" ");
        int T = ev.length;
        // 每條邊的存活區間
        LinkedHashMap<String, Integer> open = new LinkedHashMap<>();
        for (int t = 0; t < T; t++) {
            String a = ev[t][1], b = ev[t][2], k = a.compareTo(b) < 0 ? a + " " + b : b + " " + a;
            if (ev[t][0].equals("+") && !open.containsKey(k)) open.put(k, t);
            else if (ev[t][0].equals("-") && open.containsKey(k)) { insert(1, 0, T - 1, open.remove(k), t - 1, k.split(" ")); }
        }
        for (Map.Entry<String, Integer> e : open.entrySet()) insert(1, 0, T - 1, e.getValue(), T - 1, e.getKey().split(" "));
        dfs(1, 0, T - 1);
        answers.forEach((t, c) -> System.out.println("t=" + t + " ? " + ev[t][1] + " " + ev[t][2] + ": " + (c ? "connected" : "not connected")));
    }
}
