import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Queue;

public class Bipartite {
    static List<List<Integer>> adj = new ArrayList<>();
    static int[] color;
    static int n = 0;

    // BFS 二著色：相鄰點必須不同色；若遇到同色的鄰居就不是二分圖
    static boolean bipartite() {
        color = new int[n];
        Arrays.fill(color, -1);
        for (int s = 0; s < n; s++) {
            if (color[s] >= 0) continue;
            color[s] = 0;
            Queue<Integer> q = new ArrayDeque<>();
            q.add(s);
            while (!q.isEmpty()) {
                int u = q.poll();
                for (int v : adj.get(u)) {
                    if (color[v] < 0) { color[v] = 1 - color[u]; q.add(v); }
                    else if (color[v] == color[u]) return false;
                }
            }
        }
        return true;
    }

    public static void main(String[] args) {
        for (int i = 0; i < 26; i++) adj.add(new ArrayList<>());
        for (String e : "AB AD BC CD CF EF EB GH DG".split(" ")) {
            int a = e.charAt(0) - 'A', b = e.charAt(1) - 'A';
            adj.get(a).add(b);
            adj.get(b).add(a);
            n = Math.max(n, Math.max(a, b) + 1);
        }
        if (!bipartite()) { System.out.println("not bipartite"); return; }
        for (int c = 0; c < 2; c++) {
            StringBuilder sb = new StringBuilder("set " + c + ":");
            for (int v = 0; v < n; v++) if (color[v] == c) sb.append(' ').append((char) ('A' + v));
            System.out.println(sb);
        }
    }
}
