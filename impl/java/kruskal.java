import java.util.Arrays;
import java.util.Comparator;

public class Kruskal {
    static int[] parent = new int[26];

    static int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }

    public static void main(String[] args) {
        String[] edges = {"AB7", "AD5", "BC8", "BD9", "BE7", "CE5", "DE15", "DF6", "EF8", "EG9", "FG11"};
        for (int i = 0; i < 26; i++) parent[i] = i;
        // Arrays.sort 對物件是穩定排序，同權重保持輸入順序
        Arrays.sort(edges, Comparator.comparingInt(e -> Integer.parseInt(e.substring(2))));
        // 邊依權重由小到大檢查；兩端不在同一棵樹（並查集）才加入，避免形成環
        int total = 0;
        for (String e : edges) {
            int ra = find(e.charAt(0) - 'A'), rb = find(e.charAt(1) - 'A'), w = Integer.parseInt(e.substring(2));
            if (ra == rb) continue;
            parent[ra] = rb;
            total += w;
            System.out.println("take " + e.charAt(0) + "-" + e.charAt(1) + " (" + w + ")");
        }
        System.out.println("total weight = " + total);
    }
}
