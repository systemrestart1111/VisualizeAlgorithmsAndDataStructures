import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

public class TopoKahn {
    public static void main(String[] args) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < 26; i++) adj.add(new ArrayList<>());
        int[] indeg = new int[26];
        int n = 0;
        for (String e : "AC BC BD CE DF EF EG FH GH".split(" ")) { // 有向無環圖
            adj.get(e.charAt(0) - 'A').add(e.charAt(1) - 'A');
            indeg[e.charAt(1) - 'A']++;
            n = Math.max(n, Math.max(e.charAt(0), e.charAt(1)) - 'A' + 1);
        }
        // 反覆取出入度為 0 的點，並把它的出邊刪掉（讓鄰居入度減 1）
        Queue<Integer> q = new ArrayDeque<>();
        for (int v = 0; v < n; v++) if (indeg[v] == 0) q.add(v);
        StringBuilder sb = new StringBuilder("order:");
        int cnt = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            sb.append(' ').append((char) ('A' + u));
            cnt++;
            for (int v : adj.get(u)) if (--indeg[v] == 0) q.add(v);
        }
        System.out.println(cnt == n ? sb.toString() : "graph has a cycle");
    }
}
