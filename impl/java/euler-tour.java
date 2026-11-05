import java.util.ArrayList;
import java.util.List;

public class EulerTour {
    static List<List<Integer>> children = new ArrayList<>();
    static List<Integer> tour = new ArrayList<>();
    static int[] tin = new int[9], tout = new int[9];

    // 進入節點時記錄一次，每從一個子節點返回再記錄一次；子樹 u 對應 tour[tin[u]..tout[u]]
    static void dfs(int u) {
        tin[u] = tour.size();
        tour.add(u);
        for (int v : children.get(u)) {
            dfs(v);
            tour.add(u);
        }
        tout[u] = tour.size() - 1;
    }

    public static void main(String[] args) {
        int[][] edges = {{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {5, 7}, {6, 8}};
        for (int i = 0; i < 9; i++) children.add(new ArrayList<>());
        for (int[] e : edges) children.get(e[0]).add(e[1]);
        dfs(1);
        StringBuilder sb = new StringBuilder("tour:");
        for (int u : tour) sb.append(' ').append(u);
        System.out.println(sb);
        for (int u = 1; u <= 8; u++) System.out.println("node " + u + ": tin = " + tin[u] + ", tout = " + tout[u]);
    }
}
