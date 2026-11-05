import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;

public class GraphDemo {
    static final String NAMES = "ABCDE";

    // 無向加權圖，同時維護兩種表示法：鄰接矩陣 O(V²) 空間、鄰接串列 O(V + E) 空間
    static int[][] matrix = new int[5][5];
    static List<List<int[]>> adj = new ArrayList<>(); // 每項為 {鄰居, 權重}

    static void addEdge(int u, int v, int w) {
        matrix[u][v] = matrix[v][u] = w;
        adj.get(u).add(new int[] {v, w});
        adj.get(v).add(new int[] {u, w});
    }

    static void removeEdge(int u, int v) {
        matrix[u][v] = matrix[v][u] = 0;
        adj.get(u).removeIf(e -> e[0] == v);
        adj.get(v).removeIf(e -> e[0] == u);
    }

    static List<Integer> bfs(int s) {
        boolean[] seen = new boolean[5];
        List<Integer> order = new ArrayList<>();
        ArrayDeque<Integer> q = new ArrayDeque<>();
        q.add(s); seen[s] = true;
        while (!q.isEmpty()) {
            int u = q.poll();
            order.add(u);
            for (int[] e : adj.get(u)) if (!seen[e[0]]) { seen[e[0]] = true; q.add(e[0]); }
        }
        return order;
    }

    static void dfs(int u, boolean[] seen, List<Integer> order) {
        seen[u] = true;
        order.add(u);
        for (int[] e : adj.get(u)) if (!seen[e[0]]) dfs(e[0], seen, order);
    }

    static void show() {
        StringBuilder sb = new StringBuilder("matrix:  ");
        for (int i = 0; i < 5; i++) sb.append("  ").append(NAMES.charAt(i));
        System.out.println(sb);
        for (int i = 0; i < 5; i++) {
            sb = new StringBuilder("        " + NAMES.charAt(i));
            for (int w : matrix[i]) sb.append(String.format(" %2d", w));
            System.out.println(sb);
        }
        System.out.println("list:");
        for (int i = 0; i < 5; i++) {
            sb = new StringBuilder("  " + NAMES.charAt(i) + " ->");
            if (adj.get(i).isEmpty()) sb.append(" -");
            for (int[] e : adj.get(i)) sb.append(' ').append(NAMES.charAt(e[0])).append('(').append(e[1]).append(')');
            System.out.println(sb);
        }
    }

    static void printOrder(String label, List<Integer> order) {
        StringBuilder sb = new StringBuilder(label);
        for (int u : order) sb.append(' ').append(NAMES.charAt(u));
        System.out.println(sb);
    }

    public static void main(String[] args) {
        for (int i = 0; i < 5; i++) adj.add(new ArrayList<>());
        addEdge(0, 1, 4); addEdge(0, 2, 2); addEdge(1, 3, 5); addEdge(2, 3, 8); addEdge(3, 4, 3);
        show();
        addEdge(0, 4, 6); System.out.println("add edge A-E (6)");
        removeEdge(2, 3); System.out.println("remove edge C-D");
        show();
        printOrder("BFS from A:", bfs(0));
        List<Integer> order = new ArrayList<>();
        dfs(0, new boolean[5], order);
        printOrder("DFS from A:", order);
    }
}
