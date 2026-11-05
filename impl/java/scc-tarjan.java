import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Deque;
import java.util.List;

public class TarjanSCC {
    static List<List<Integer>> adj = new ArrayList<>();
    static int[] idx = new int[26], low = new int[26];
    static boolean[] onStack = new boolean[26];
    static Deque<Integer> st = new ArrayDeque<>();
    static int counter = 0;

    // low[u] = u 經由子樹與至多一條回邊能到達的最小編號；low == 編號時，u 是一個強連通分量的根
    static void dfs(int u) {
        idx[u] = low[u] = counter++;
        st.push(u);
        onStack[u] = true;
        for (int v : adj.get(u)) {
            if (idx[v] < 0) { dfs(v); low[u] = Math.min(low[u], low[v]); }
            else if (onStack[v]) low[u] = Math.min(low[u], idx[v]);
        }
        if (low[u] == idx[u]) {
            List<Integer> comp = new ArrayList<>();
            int v;
            do { v = st.pop(); onStack[v] = false; comp.add(v); } while (v != u);
            Collections.sort(comp);
            StringBuilder sb = new StringBuilder("SCC:");
            for (int w : comp) sb.append(' ').append((char) ('A' + w));
            System.out.println(sb);
        }
    }

    public static void main(String[] args) {
        for (int i = 0; i < 26; i++) adj.add(new ArrayList<>());
        int n = 0;
        for (String e : "AB BC CA BD DE EF FD GF GH HI IG IJ".split(" ")) { // 有向圖
            adj.get(e.charAt(0) - 'A').add(e.charAt(1) - 'A');
            n = Math.max(n, Math.max(e.charAt(0), e.charAt(1)) - 'A' + 1);
        }
        Arrays.fill(idx, -1);
        for (int v = 0; v < n; v++) if (idx[v] < 0) dfs(v);
    }
}
