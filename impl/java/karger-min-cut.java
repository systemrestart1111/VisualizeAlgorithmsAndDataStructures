import java.util.*;

public class KargerMinCut {
    static String[] E = {"AB", "AC", "AD", "BC", "BD", "CD", "DE", "EF", "EG", "FG", "FH", "GH", "EH"};
    static final int N = 8;
    static long seed = 42;
    static int rnd(int n) { seed = seed * 48271 % 2147483647; return (int) (seed % n); }
    static int[] p = new int[N];
    static int find(int x) { while (p[x] != x) x = p[x]; return x; }

    // 隨機縮邊直到剩兩個超節點；兩者之間的邊數就是一個割
    static int trial() {
        for (int i = 0; i < N; i++) p[i] = i;
        for (int groups = N; groups > 2; groups--) {
            List<Integer> live = new ArrayList<>();
            for (int i = 0; i < E.length; i++) if (find(E[i].charAt(0) - 'A') != find(E[i].charAt(1) - 'A')) live.add(i);
            int i = live.get(rnd(live.size()));
            p[find(E[i].charAt(0) - 'A')] = find(E[i].charAt(1) - 'A');
        }
        int cut = 0;
        for (String e : E) if (find(e.charAt(0) - 'A') != find(e.charAt(1) - 'A')) cut++;
        return cut;
    }

    public static void main(String[] args) {
        int best = E.length, brute = E.length;
        StringBuilder sb = new StringBuilder("cuts per trial:");
        for (int t = 0; t < 6; t++) { int c = trial(); sb.append(' ').append(c); best = Math.min(best, c); }
        for (int m = 1; m < (1 << (N - 1)); m++) {
            int c = 0;
            for (String e : E) if (((m >> (e.charAt(0) - 'A')) & 1) != ((m >> (e.charAt(1) - 'A')) & 1)) c++;
            brute = Math.min(brute, c);
        }
        System.out.println(sb);
        System.out.println("best: " + best + " | brute force: " + brute);
    }
}
