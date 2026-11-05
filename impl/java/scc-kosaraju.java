import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class KosarajuSCC {
    static List<List<Integer>> adj = new ArrayList<>(), radj = new ArrayList<>();
    static boolean[] seen = new boolean[26];
    static List<Integer> order = new ArrayList<>();

    static void dfs1(int u) { // 第一次 DFS：記錄完成順序
        seen[u] = true;
        for (int v : adj.get(u)) if (!seen[v]) dfs1(v);
        order.add(u);
    }

    static void dfs2(int u, List<Integer> comp) { // 第二次 DFS：在反向圖上，依完成時間由晚到早出發
        seen[u] = true;
        comp.add(u);
        for (int v : radj.get(u)) if (!seen[v]) dfs2(v, comp);
    }

    public static void main(String[] args) {
        for (int i = 0; i < 26; i++) { adj.add(new ArrayList<>()); radj.add(new ArrayList<>()); }
        int n = 0;
        for (String e : "AB BC CA BD DE EF FD GF GH HI IG IJ".split(" ")) {
            adj.get(e.charAt(0) - 'A').add(e.charAt(1) - 'A');
            radj.get(e.charAt(1) - 'A').add(e.charAt(0) - 'A'); // 反向圖
            n = Math.max(n, Math.max(e.charAt(0), e.charAt(1)) - 'A' + 1);
        }
        for (int v = 0; v < n; v++) if (!seen[v]) dfs1(v);
        Arrays.fill(seen, false);
        for (int i = order.size() - 1; i >= 0; i--) {
            if (seen[order.get(i)]) continue;
            List<Integer> comp = new ArrayList<>();
            dfs2(order.get(i), comp);
            Collections.sort(comp);
            StringBuilder sb = new StringBuilder("SCC:");
            for (int v : comp) sb.append(' ').append((char) ('A' + v));
            System.out.println(sb);
        }
    }
}
