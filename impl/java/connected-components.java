import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class ConnectedComponents {
    static int[] parent = new int[10];

    static int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } // 路徑壓縮
        return x;
    }

    public static void main(String[] args) {
        int n = 10; // A..J，J 是孤立點
        for (int i = 0; i < n; i++) parent[i] = i;
        // 用並查集合併每條邊的兩端，最後同一個根的點屬於同一個連通分量
        for (String e : "AB BC CA DE FG GH HF FI".split(" ")) parent[find(e.charAt(0) - 'A')] = find(e.charAt(1) - 'A');
        Map<Integer, List<Character>> groups = new LinkedHashMap<>();
        for (int v = 0; v < n; v++) groups.computeIfAbsent(find(v), k -> new ArrayList<>()).add((char) ('A' + v));
        System.out.println("components: " + groups.size());
        for (List<Character> g : groups.values()) {
            StringBuilder sb = new StringBuilder(" ");
            for (char c : g) sb.append(' ').append(c);
            System.out.println(sb);
        }
    }
}
