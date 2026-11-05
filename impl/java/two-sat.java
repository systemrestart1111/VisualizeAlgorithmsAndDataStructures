import java.util.*;

public class TwoSat {
    static String neg(String x) { return x.startsWith("!") ? x.substring(1) : "!" + x; }
    static Map<String, List<String>> adj;
    static Map<String, Integer> idx, low, comp;
    static Deque<String> st;
    static Set<String> on;
    static int t, c;

    static void dfs(String u) {
        idx.put(u, t); low.put(u, t); t++;
        st.push(u); on.add(u);
        for (String v : adj.get(u)) {
            if (!idx.containsKey(v)) { dfs(v); low.put(u, Math.min(low.get(u), low.get(v))); }
            else if (on.contains(v)) low.put(u, Math.min(low.get(u), idx.get(v)));
        }
        if (low.get(u).equals(idx.get(u))) { String x; do { x = st.pop(); on.remove(x); comp.put(x, c); } while (!x.equals(u)); c++; }
    }

    // (a ∨ b) ⇔ ¬a → b 且 ¬b → a；Tarjan 求 SCC，x 與 ¬x 同分量則無解
    static void solve(String text) {
        List<String[]> cl = new ArrayList<>();
        TreeSet<String> vs = new TreeSet<>();
        for (String p : text.split(";")) {
            String[] ab = p.trim().split("\\|");
            cl.add(ab);
            for (String x : ab) vs.add(x.replace("!", ""));
        }
        List<String> nodes = new ArrayList<>();
        for (String v : vs) { nodes.add(v); nodes.add("!" + v); }
        adj = new HashMap<>();
        for (String x : nodes) adj.put(x, new ArrayList<>());
        for (String[] ab : cl) { adj.get(neg(ab[0])).add(ab[1]); adj.get(neg(ab[1])).add(ab[0]); }
        for (List<String> l : adj.values()) Collections.sort(l);
        idx = new HashMap<>(); low = new HashMap<>(); comp = new HashMap<>(); st = new ArrayDeque<>(); on = new HashSet<>();
        t = 0; c = 0;
        for (String u : nodes) if (!idx.containsKey(u)) dfs(u);
        for (String v : vs) if (comp.get(v).equals(comp.get("!" + v))) { System.out.println(text + " => unsatisfiable"); return; }
        Map<String, Boolean> val = new HashMap<>();
        StringBuilder sb = new StringBuilder(text + " =>");
        for (String v : vs) { val.put(v, comp.get(v) < comp.get("!" + v)); sb.append(' ').append(v).append('=').append(val.get(v) ? 'T' : 'F'); }
        boolean ok = true;
        for (String[] ab : cl) {
            boolean h0 = ab[0].startsWith("!") ? !val.get(ab[0].substring(1)) : val.get(ab[0]);
            boolean h1 = ab[1].startsWith("!") ? !val.get(ab[1].substring(1)) : val.get(ab[1]);
            ok &= h0 || h1;
        }
        System.out.println(sb + " | verified " + (ok ? "True" : "False"));
    }

    public static void main(String[] args) {
        solve("a|b; !a|c; !b|!c; c|d; !d|!a");
        solve("a|b; a|!b; !a|b; !a|!b");
        solve("x|y; !x|y; !y|z");
    }
}
