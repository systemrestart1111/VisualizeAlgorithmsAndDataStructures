import java.util.*;

public class EdmondsBlossom {
    static final int N = 10;
    static List<List<Integer>> adj = new ArrayList<>();
    static int[] match = new int[N], p = new int[N], base = new int[N];
    static boolean[] used = new boolean[N];

    static int lca(int a, int b) {
        boolean[] seen = new boolean[N];
        for (;;) { a = base[a]; seen[a] = true; if (match[a] < 0) break; a = p[match[a]]; }
        for (;;) { b = base[b]; if (seen[b]) return b; b = p[match[b]]; }
    }
    static void mark(int v, int b, int child, boolean[] blossom) {
        while (base[v] != b) { blossom[base[v]] = blossom[base[match[v]]] = true; p[v] = child; child = match[v]; v = p[match[v]]; }
    }
    // BFS 交替樹；遇到奇環就把它收縮到共同的 base，找到未匹配點就沿路翻轉
    static boolean augmentFrom(int root) {
        for (int i = 0; i < N; i++) { p[i] = -1; base[i] = i; used[i] = false; }
        used[root] = true;
        ArrayDeque<Integer> q = new ArrayDeque<>(List.of(root));
        while (!q.isEmpty()) {
            int v = q.poll();
            for (int u : adj.get(v)) {
                if (base[v] == base[u] || match[v] == u) continue;
                if (u == root || (match[u] >= 0 && p[match[u]] >= 0)) {
                    int cb = lca(v, u);
                    boolean[] blossom = new boolean[N];
                    mark(v, cb, u, blossom);
                    mark(u, cb, v, blossom);
                    for (int i = 0; i < N; i++) if (blossom[base[i]]) { base[i] = cb; if (!used[i]) { used[i] = true; q.add(i); } }
                } else if (p[u] < 0) {
                    p[u] = v;
                    if (match[u] < 0) {
                        while (u >= 0) { int pv = p[u], nxt = match[pv]; match[u] = pv; match[pv] = u; u = nxt; }
                        return true;
                    }
                    used[match[u]] = true;
                    q.add(match[u]);
                }
            }
        }
        return false;
    }
    static Map<Integer, Integer> memo = new HashMap<>();
    static int brute(int mask) {
        if (memo.containsKey(mask)) return memo.get(mask);
        int i = 0;
        while (i < N && (mask >> i & 1) == 1) i++;
        if (i == N) return 0;
        int res = brute(mask | (1 << i));
        for (int u : adj.get(i)) if ((mask >> u & 1) == 0) res = Math.max(res, 1 + brute(mask | (1 << i) | (1 << u)));
        memo.put(mask, res);
        return res;
    }

    public static void main(String[] args) {
        int[][] E = {{1, 2}, {2, 3}, {3, 4}, {4, 5}, {5, 1}, {3, 6}, {6, 7}, {7, 8}, {8, 9}, {9, 6}, {5, 10}};
        for (int i = 0; i < N; i++) adj.add(new ArrayList<>());
        Set<String> es = new HashSet<>();
        for (int[] e : E) { adj.get(e[0] - 1).add(e[1] - 1); adj.get(e[1] - 1).add(e[0] - 1); es.add((e[0] - 1) + "," + (e[1] - 1)); es.add((e[1] - 1) + "," + (e[0] - 1)); }
        Arrays.fill(match, -1);
        int size = 0;
        for (int r = 0; r < N; r++) if (match[r] < 0 && augmentFrom(r)) size++;
        boolean valid = true;
        Set<Integer> usedV = new HashSet<>();
        for (int i = 0; i < N; i++) if (match[i] > i) { valid &= es.contains(i + "," + match[i]) && !usedV.contains(i) && !usedV.contains(match[i]); usedV.add(i); usedV.add(match[i]); }
        System.out.println("maximum matching: " + size + " | brute force: " + brute(0) + " | valid: " + (valid ? "True" : "False"));
    }
}
