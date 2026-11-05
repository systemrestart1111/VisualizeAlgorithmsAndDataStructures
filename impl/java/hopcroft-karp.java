import java.util.ArrayDeque;
import java.util.Deque;

public class HopcroftKarp {
    static final int NL = 5, INF = 1_000_000;
    static int[][] adj = {{}, {1, 2}, {1, 3}, {2, 3}, {3, 4}, {4, 5}}; // 左側 L1..L5 可以配對的右側點
    static int[] matchL = new int[NL + 1], matchR = new int[NL + 1], dist = new int[NL + 1];

    // 從所有未配對的左側點同時 BFS，分層；回傳是否存在增廣路徑
    static boolean bfs() {
        Deque<Integer> q = new ArrayDeque<>();
        for (int u = 1; u <= NL; u++) {
            dist[u] = matchL[u] == 0 ? 0 : INF;
            if (matchL[u] == 0) q.add(u);
        }
        boolean found = false;
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : adj[u]) {
                int w = matchR[v];
                if (w == 0) found = true;
                else if (dist[w] == INF) { dist[w] = dist[u] + 1; q.add(w); }
            }
        }
        return found;
    }

    // 沿分層找一條最短增廣路徑並翻轉
    static boolean dfs(int u) {
        for (int v : adj[u]) {
            int w = matchR[v];
            if (w == 0 || (dist[w] == dist[u] + 1 && dfs(w))) { matchL[u] = v; matchR[v] = u; return true; }
        }
        dist[u] = INF;
        return false;
    }

    // 每一階段找出一組互不相交的最短增廣路徑一起翻轉，總共只需 O(√V) 階段
    public static void main(String[] args) {
        int size = 0, phases = 0;
        while (bfs()) {
            phases++;
            for (int u = 1; u <= NL; u++)
                if (matchL[u] == 0 && dfs(u)) size++;
        }
        System.out.println("phases = " + phases + " matching size = " + size);
        for (int u = 1; u <= NL; u++) System.out.println("L" + u + " - R" + matchL[u]);
    }
}
