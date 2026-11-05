import java.util.*;

public class DiscreteLogBsgs {
    static long pw(long b, long e, long m) { long r = 1; b %= m; while (e > 0) { if ((e & 1) == 1) r = r * b % m; b = b * b % m; e >>= 1; } return r; }
    static long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }

    // a^x ≡ b (mod M)：小步存 a^j，大步檢查 b·a^(−s·i)；需要 gcd(a, M) = 1。回傳 −1 無解、−2 不互質
    static long bsgs(long a, long b, long M) {
        if (gcd(a % M, M) != 1) return -2;
        a %= M; b %= M;
        long s = 1;
        while (s * s < M) s++;
        Map<Long, Long> table = new HashMap<>();
        long cur = 1;
        for (long j = 0; j < s; j++) { table.putIfAbsent(cur, j); cur = cur * a % M; }
        long factor = java.math.BigInteger.valueOf(pw(a, s, M)).modInverse(java.math.BigInteger.valueOf(M)).longValue(), gamma = b;
        for (long i = 0; i < s; i++) {
            if (table.containsKey(gamma)) return i * s + table.get(gamma);
            gamma = gamma * factor % M;
        }
        return -1;
    }

    public static void main(String[] args) {
        long[][] tests = {{3, 13, 101}, {2, 3, 7}, {5, 1, 23}, {2, 1000, 1000003}, {7, 123456, 1000000007}, {6, 4, 10}, {3, 13, 17}};
        for (long[] t : tests) {
            long a = t[0], b = t[1], M = t[2], x = bsgs(a, b, M);
            String head = a + "^x = " + b + " mod " + M + ": ";
            if (x == -2) System.out.println(head + "gcd(a, M) != 1, basic BSGS not applicable");
            else if (x == -1) System.out.println(head + "no solution");
            else System.out.println(head + "x = " + x + " (check " + pw(a, x, M) + ")");
        }
    }
}
