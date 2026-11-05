import java.util.ArrayList;
import java.util.List;

public class DFS {
    static List<List<Integer>> adj = new ArrayList<>();
    static boolean[] seen = new boolean[26];
    static StringBuilder order = new StringBuilder("order:");

    // 沿著一條路一直走到底，無路可走才回溯（遞迴本身就是堆疊）
    static void dfs(int u) {
        seen[u] = true;
        order.append(' ').append((char) ('A' + u));
        for (int v : adj.get(u))
            if (!seen[v]) dfs(v);
    }

    public static void main(String[] args) {
        for (int i = 0; i < 26; i++) adj.add(new ArrayList<>());
        for (String e : "AB AC BD BE CF EF DG EG FH GH".split(" ")) {
            adj.get(e.charAt(0) - 'A').add(e.charAt(1) - 'A');
            adj.get(e.charAt(1) - 'A').add(e.charAt(0) - 'A');
        }
        dfs(0);
        System.out.println(order);
    }
}
