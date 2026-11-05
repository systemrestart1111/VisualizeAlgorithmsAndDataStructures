import java.util.ArrayList;
import java.util.List;

public class CycleDetection {
    static List<List<Integer>> adj = new ArrayList<>();
    static int[] color = new int[26], parent = new int[26];

    // 三色 DFS：遇到灰色（仍在遞迴堆疊上）的點就是一條回邊，代表有環
    static boolean dfs(int u) {
        color[u] = 1;
        for (int v : adj.get(u)) {
            if (color[v] == 1) {
                List<Integer> path = new ArrayList<>();
                for (int x = u; x != v; x = parent[x]) path.add(0, x);
                StringBuilder sb = new StringBuilder("cycle: ").append((char) ('A' + v));
                for (int x : path) sb.append(" -> ").append((char) ('A' + x));
                System.out.println(sb.append(" -> ").append((char) ('A' + v)));
                return true;
            }
            if (color[v] == 0) {
                parent[v] = u;
                if (dfs(v)) return true;
            }
        }
        color[u] = 2;
        return false;
    }

    public static void main(String[] args) {
        for (int i = 0; i < 26; i++) adj.add(new ArrayList<>());
        int n = 0;
        for (String e : "AB BC CD DB AE EF".split(" ")) { // 有向圖
            adj.get(e.charAt(0) - 'A').add(e.charAt(1) - 'A');
            n = Math.max(n, Math.max(e.charAt(0), e.charAt(1)) - 'A' + 1);
        }
        for (int s = 0; s < n; s++)
            if (color[s] == 0 && dfs(s)) return;
        System.out.println("no cycle");
    }
}
