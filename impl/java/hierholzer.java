import java.util.ArrayList;
import java.util.List;

public class Hierholzer {
    public static void main(String[] args) {
        String[] edges = "AB BC CA CD DE EC BD AD".split(" ");
        List<List<int[]>> adj = new ArrayList<>(); // adj[u] = {鄰居, 邊編號}
        for (int i = 0; i < 26; i++) adj.add(new ArrayList<>());
        int n = 0;
        for (int i = 0; i < edges.length; i++) {
            int a = edges[i].charAt(0) - 'A', b = edges[i].charAt(1) - 'A';
            adj.get(a).add(new int[] {b, i});
            adj.get(b).add(new int[] {a, i});
            n = Math.max(n, Math.max(a, b) + 1);
        }
        List<Integer> odd = new ArrayList<>();
        for (int v = 0; v < n; v++) if (adj.get(v).size() % 2 == 1) odd.add(v);
        int start = odd.isEmpty() ? 0 : odd.get(0); // 有兩個奇點時必須從奇點出發
        boolean[] used = new boolean[edges.length];
        int[] ptr = new int[n];
        // 沿著未用過的邊一直走，走不動時把該點加入路徑並回退；最後路徑反轉即為歐拉路徑
        List<Integer> st = new ArrayList<>(List.of(start)), path = new ArrayList<>();
        while (!st.isEmpty()) {
            int u = st.get(st.size() - 1);
            List<int[]> au = adj.get(u);
            while (ptr[u] < au.size() && used[au.get(ptr[u])[1]]) ptr[u]++;
            if (ptr[u] == au.size()) path.add(st.remove(st.size() - 1));
            else {
                used[au.get(ptr[u])[1]] = true;
                st.add(au.get(ptr[u])[0]);
            }
        }
        StringBuilder a = new StringBuilder("odd vertices:"), b = new StringBuilder("euler path:");
        for (int v : odd) a.append(' ').append((char) ('A' + v));
        for (int i = path.size() - 1; i >= 0; i--) b.append(i == path.size() - 1 ? " " : " -> ").append((char) ('A' + path.get(i)));
        System.out.println(a + "\n" + b);
    }
}
