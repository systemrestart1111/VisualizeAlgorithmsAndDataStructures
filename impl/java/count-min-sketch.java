import java.util.*;

public class CountMinSketch {
    static long poly(String s, long base, long mod) { long h = 0; for (char ch : s.toCharArray()) h = (h * base + ch) % mod; return h; }
    static final int D = 3, W = 8;
    static int[][] t = new int[D][W];

    static int[] cols(String s) {
        long h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1;
        int[] j = new int[D];
        for (int i = 0; i < D; i++) j[i] = (int) ((h1 + i * h2) % W);
        return j;
    }
    static void update(String s, int c) { int[] j = cols(s); for (int i = 0; i < D; i++) t[i][j[i]] += c; }
    // 查詢取 d 個計數的最小值（只會高估，不會低估）
    static int query(String s) { int[] j = cols(s); int m = Integer.MAX_VALUE; for (int i = 0; i < D; i++) m = Math.min(m, t[i][j[i]]); return m; }

    public static void main(String[] args) {
        LinkedHashMap<String, Integer> truth = new LinkedHashMap<>();
        truth.put("apple", 5); truth.put("banana", 2); truth.put("cherry", 3); truth.put("grape", 1); truth.put("lemon", 4);
        truth.forEach(CountMinSketch::update);
        for (int[] row : t) { StringBuilder sb = new StringBuilder(); for (int j = 0; j < W; j++) sb.append(j > 0 ? " " : "").append(row[j]); System.out.println(sb); }
        for (String k : new String[]{"apple", "banana", "cherry", "grape", "lemon", "kiwi"}) {
            int est = query(k), real = truth.getOrDefault(k, 0);
            System.out.println(k + ": estimate " + est + ", true " + real + ", ok " + (est >= real ? "True" : "False"));
        }
    }
}
