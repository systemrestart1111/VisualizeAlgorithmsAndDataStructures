import java.util.*;

public class BloomFilter {
    static long poly(String s, long base, long mod) { long h = 0; for (char c : s.toCharArray()) h = (h * base + c) % mod; return h; }

    static final int M = 32, K = 3;
    static int[] bits = new int[M];

    // 雙重雜湊：h_i = (h1 + i·h2) mod m
    static int[] hashes(String s) {
        long h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1;
        int[] p = new int[K];
        for (int i = 0; i < K; i++) p[i] = (int) ((h1 + i * h2) % M);
        return p;
    }
    static void add(String s) { for (int p : hashes(s)) bits[p] = 1; }
    // 有任一位元為 0 → 確定不存在；全為 1 → 可能存在
    static boolean mightContain(String s) { for (int p : hashes(s)) if (bits[p] == 0) return false; return true; }

    public static void main(String[] args) {
        List<String> ins = List.of("apple", "banana", "cherry", "grape");
        ins.forEach(BloomFilter::add);
        StringBuilder sb = new StringBuilder("bits: ");
        for (int b : bits) sb.append(b);
        System.out.println(sb);
        for (String w : new String[]{"apple", "banana", "cherry", "grape", "kiwi", "lemon", "mango", "peach", "plum", "fig"}) {
            boolean maybe = mightContain(w);
            System.out.println(w + ": " + (maybe ? "maybe" : "no") + (maybe && !ins.contains(w) ? " (false positive)" : ""));
        }
    }
}
