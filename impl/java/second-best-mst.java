import java.util.*;

public class SecondBestMst {
    static Object[][] E = {{'A', 'B', 4}, {'A', 'C', 3}, {'B', 'C', 1}, {'B', 'D', 2}, {'C', 'D', 4}, {'C', 'E', 5}, {'D', 'E', 6}, {'D', 'F', 7}, {'E', 'F', 3}};
    static char u(int i) { return (Character) E[i][0]; }
    static char v(int i) { return (Character) E[i][1]; }
    static int w(int i) { return (Integer) E[i][2]; }

    // 樹上 a 到 b 的路徑（回傳邊的編號）
    static List<Integer> pathEdges(List<Integer> tree, char a, char b) {
        Map<Character, int[]> prev = new HashMap<>();
        prev.put(a, new int[]{0, -1});
        ArrayDeque<Character> q = new ArrayDeque<>(List.of(a));
        while (!q.isEmpty()) {
            char x = q.poll();
            for (int i : tree) {
                char y = u(i) == x ? v(i) : v(i) == x ? u(i) : 0;
                if (y != 0 && !prev.containsKey(y)) { prev.put(y, new int[]{x, i}); q.add(y); }
            }
        }
        List<Integer> out = new ArrayList<>();
        for (char x = b; x != a; x = (char) prev.get(x)[0]) out.add(prev.get(x)[1]);
        return out;
    }

    public static void main(String[] args) {
        Map<Character, Character> p = new HashMap<>();
        for (int i = 0; i < E.length; i++) { p.put(u(i), u(i)); p.put(v(i), v(i)); }
        Integer[] order = new Integer[E.length];
        for (int i = 0; i < E.length; i++) order[i] = i;
        Arrays.sort(order, Comparator.comparingInt(SecondBestMst::w));
        List<Integer> tree = new ArrayList<>();
        int W = 0;
        for (int i : order) {
            char a = u(i), b = v(i);
            while (p.get(a) != a) a = p.get(a);
            while (p.get(b) != b) b = p.get(b);
            if (a != b) { p.put(a, b); tree.add(i); W += w(i); }
        }
        StringBuilder sb = new StringBuilder("MST weight: " + W + " edges:");
        for (int i : tree) sb.append(' ').append(u(i)).append(v(i));
        System.out.println(sb);
        for (boolean strict : new boolean[]{false, true}) {
            int best = -1;
            for (int i = 0; i < E.length; i++) {
                if (tree.contains(i)) continue;
                int m = -1;
                for (int j : pathEdges(tree, u(i), v(i))) if ((!strict || w(j) < w(i)) && w(j) > m) m = w(j);
                if (m >= 0 && (best < 0 || W - m + w(i) < best)) best = W - m + w(i);
            }
            System.out.println((strict ? "strict" : "allow equal") + " second best: " + best);
        }
    }
}
