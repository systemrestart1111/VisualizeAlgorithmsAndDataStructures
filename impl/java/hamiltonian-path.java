import java.util.ArrayList;
import java.util.List;

public class HamiltonianPath {
    static List<List<Integer>> adj = new ArrayList<>();
    static List<Integer> path = new ArrayList<>();
    static boolean[] seen = new boolean[26];
    static final int n = 9;

    // 從起點延伸路徑，每次只走沒去過的鄰居；走不下去就退回（回溯），長度達到 n 即成功
    static boolean bt() {
        if (path.size() == n) return true;
        for (int v : adj.get(path.get(path.size() - 1))) {
            if (seen[v]) continue;
            path.add(v);
            seen[v] = true;
            if (bt()) return true;
            path.remove(path.size() - 1);
            seen[v] = false;
        }
        return false;
    }

    public static void main(String[] args) {
        for (int i = 0; i < 26; i++) adj.add(new ArrayList<>());
        for (String e : "AB AD BC BE CF DE EF DG EH FI GH HI".split(" ")) {
            adj.get(e.charAt(0) - 'A').add(e.charAt(1) - 'A');
            adj.get(e.charAt(1) - 'A').add(e.charAt(0) - 'A');
        }
        path.add(0);
        seen[0] = true;
        StringBuilder sb = new StringBuilder("Hamiltonian path:");
        if (!bt()) sb.append(" none");
        else for (int i = 0; i < path.size(); i++) sb.append(i > 0 ? " -> " : " ").append((char) ('A' + path.get(i)));
        System.out.println(sb);
    }
}
