import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class UnionFindDemo {
    // 並查集：路徑壓縮 + 依秩合併，單次操作均攤接近 O(1)（反阿克曼函數）
    static int[] p = new int[10], rank = new int[10];

    static int find(int x) {
        int root = x;
        while (p[root] != root) root = p[root];
        while (p[x] != root) { int nx = p[x]; p[x] = root; x = nx; } // 路徑壓縮：沿路的節點都直接接到根
        return root;
    }

    static boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
        p[rb] = ra; // rank 較小的根接到較大的底下
        if (rank[ra] == rank[rb]) rank[ra]++;
        return true;
    }

    static String parents() {
        StringBuilder sb = new StringBuilder("parent =");
        for (int v : p) sb.append(' ').append(v);
        return sb.toString();
    }

    static String b(boolean x) { return x ? "True" : "False"; }

    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) p[i] = i;
        int[][] pairs = {{1, 2}, {3, 4}, {2, 4}, {5, 6}, {7, 8}, {8, 9}};
        for (int[] pr : pairs) {
            union(pr[0], pr[1]);
            System.out.println("union(" + pr[0] + ", " + pr[1] + "): " + parents());
        }
        int r = find(4);
        System.out.println("find(4) = " + r + "  " + parents());
        System.out.println("same(1, 3) -> " + b(find(1) == find(3)) + "  same(1, 5) -> " + b(find(1) == find(5)));
        System.out.println("union(2, 3) -> " + b(union(2, 3)) + " (already together)");
        Map<Integer, List<String>> groups = new TreeMap<>();
        for (int i = 0; i < 10; i++) groups.computeIfAbsent(find(i), k -> new ArrayList<>()).add(String.valueOf(i));
        StringBuilder sb = new StringBuilder("sets:");
        for (List<String> g : groups.values()) sb.append(" {").append(String.join(",", g)).append("}");
        System.out.println(sb);
    }
}
