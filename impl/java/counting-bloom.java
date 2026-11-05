public class CountingBloom {
    static long poly(String s, long base, long mod) { long h = 0; for (char ch : s.toCharArray()) h = (h * base + ch) % mod; return h; }
    static final int M = 16, K = 3, MAX = 15;
    static int[] c = new int[M];

    static int[] hashes(String s) {
        long h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1;
        int[] p = new int[K];
        for (int i = 0; i < K; i++) p[i] = (int) ((h1 + i * h2) % M);
        return p;
    }
    // 每格是 4 位元計數器（上限 15）：飽和後不再增減，避免溢位造成漏判
    static void add(String s) { for (int p : hashes(s)) if (c[p] < MAX) c[p]++; }
    static boolean query(String s) { for (int p : hashes(s)) if (c[p] == 0) return false; return true; }
    static boolean remove(String s) {
        if (!query(s)) return false; // 確定不存在：拒絕刪除
        for (int p : hashes(s)) if (c[p] < MAX) c[p]--;
        return true;
    }
    static void show(String label) { StringBuilder sb = new StringBuilder(label); for (int x : c) sb.append(' ').append(x); System.out.println(sb); }

    public static void main(String[] args) {
        for (String w : new String[]{"apple", "banana", "cherry"}) add(w);
        show("counters:");
        System.out.println("remove banana: " + (remove("banana") ? "True" : "False"));
        show("counters:");
        for (String w : new String[]{"apple", "banana", "cherry", "kiwi"}) System.out.println(w + ": " + (query(w) ? "maybe" : "no"));
        System.out.println("remove kiwi: " + (remove("kiwi") ? "True" : "False"));
        for (int i = 0; i < 20; i++) add("apple");
        show("after 20 more apple:");
    }
}
