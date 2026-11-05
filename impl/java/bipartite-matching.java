public class BipartiteMatching {
    static int[][] adj = {{}, {1, 2}, {1, 3}, {2, 3}, {3, 4}, {4, 5}}; // 左側 L1..L5 可以配對的右側點
    static int[] matchR = new int[6];
    static boolean[] seen;

    // 替 u 找右側點：若對方空著就直接配；若已被配走，嘗試讓原本的左側點改配別人（增廣路徑）
    static boolean tryKuhn(int u) {
        for (int v : adj[u]) {
            if (seen[v]) continue;
            seen[v] = true;
            if (matchR[v] == 0 || tryKuhn(matchR[v])) { matchR[v] = u; return true; }
        }
        return false;
    }

    public static void main(String[] args) {
        int size = 0;
        for (int u = 1; u <= 5; u++) {
            seen = new boolean[6];
            if (tryKuhn(u)) size++;
        }
        System.out.println("matching size = " + size);
        for (int u = 1; u <= 5; u++)
            for (int v = 1; v <= 5; v++) if (matchR[v] == u) System.out.println("L" + u + " - R" + v);
    }
}
