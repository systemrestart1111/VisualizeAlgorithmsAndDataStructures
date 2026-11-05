import java.util.ArrayList;
import java.util.List;

public class TopoDFS {
    static List<List<Integer>> adj = new ArrayList<>();
    static boolean[] seen = new boolean[26];
    static List<Integer> post = new ArrayList<>();

    // 一個點在它所有後繼都處理完後才加入 post；post 反過來就是拓撲順序
    static void dfs(int u) {
        seen[u] = true;
        for (int v : adj.get(u))
            if (!seen[v]) dfs(v);
        post.add(u);
    }

    public static void main(String[] args) {
        for (int i = 0; i < 26; i++) adj.add(new ArrayList<>());
        int n = 0;
        for (String e : "AC BC BD CE DF EF EG FH GH".split(" ")) {
            adj.get(e.charAt(0) - 'A').add(e.charAt(1) - 'A');
            n = Math.max(n, Math.max(e.charAt(0), e.charAt(1)) - 'A' + 1);
        }
        for (int v = 0; v < n; v++) if (!seen[v]) dfs(v);
        StringBuilder a = new StringBuilder("post-order:"), b = new StringBuilder("topological:");
        for (int v : post) a.append(' ').append((char) ('A' + v));
        for (int i = post.size() - 1; i >= 0; i--) b.append(' ').append((char) ('A' + post.get(i)));
        System.out.println(a + "\n" + b);
    }
}
