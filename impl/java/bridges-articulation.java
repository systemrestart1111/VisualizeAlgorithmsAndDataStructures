import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.TreeSet;

public class BridgesArticulation {
    static List<List<Integer>> adj = new ArrayList<>();
    static int[] tin = new int[26], low = new int[26];
    static int timer = 0;
    static List<String> bridges = new ArrayList<>();
    static TreeSet<Character> cut = new TreeSet<>();

    // low[v] > tin[u]：v 的子樹回不到 u 以上，(u, v) 是橋；low[v] >= tin[u]：u 是割點（根需有兩個以上子樹）
    static void dfs(int u, int parent) {
        tin[u] = low[u] = timer++;
        int children = 0;
        for (int v : adj.get(u)) {
            if (v == parent) continue;
            if (tin[v] >= 0) low[u] = Math.min(low[u], tin[v]);
            else {
                dfs(v, u);
                low[u] = Math.min(low[u], low[v]);
                children++;
                if (low[v] > tin[u]) bridges.add((char) ('A' + Math.min(u, v)) + "-" + (char) ('A' + Math.max(u, v)));
                if (parent >= 0 && low[v] >= tin[u]) cut.add((char) ('A' + u));
            }
        }
        if (parent < 0 && children > 1) cut.add((char) ('A' + u));
    }

    public static void main(String[] args) {
        for (int i = 0; i < 26; i++) adj.add(new ArrayList<>());
        for (String e : "AB BC CA CD DE EF FD FG GH BI".split(" ")) {
            adj.get(e.charAt(0) - 'A').add(e.charAt(1) - 'A');
            adj.get(e.charAt(1) - 'A').add(e.charAt(0) - 'A');
        }
        Arrays.fill(tin, -1);
        dfs(0, -1);
        Collections.sort(bridges);
        StringBuilder a = new StringBuilder("bridges:"), b = new StringBuilder("articulation points:");
        for (String s : bridges) a.append(' ').append(s);
        for (char c : cut) b.append(' ').append(c);
        System.out.println(a + "\n" + b);
    }
}
