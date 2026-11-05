public class LucasTheorem {
    static long pw(long b, long e, long m) { long r = 1; b %= m; while (e > 0) { if ((e & 1) == 1) r = r * b % m; b = b * b % m; e >>= 1; } return r; }
    static boolean isPrime(long n) { if (n < 2) return false; for (long d = 2; d * d <= n; d++) if (n % d == 0) return false; return true; }

    // C(n, k) ≡ ∏ C(nᵢ, kᵢ) (mod p)，nᵢ、kᵢ 是 p 進位的各位數
    static long lucas(long n, long k, long p) {
        long[] fact = new long[(int) p];
        fact[0] = 1;
        for (int i = 1; i < p; i++) fact[i] = fact[i - 1] * i % p;
        long res = 1;
        while (n > 0 || k > 0) {
            int ni = (int) (n % p), ki = (int) (k % p);
            if (ki > ni) return 0;
            res = res * (fact[ni] * pw(fact[ki], p - 2, p) % p * pw(fact[ni - ki], p - 2, p) % p) % p;
            n /= p; k /= p;
        }
        return res;
    }
    static long pascal(int n, int k, long p) {
        if (k > n) return 0;
        long[] row = new long[k + 1];
        row[0] = 1;
        for (int i = 1; i <= n; i++) for (int j = Math.min(i, k); j > 0; j--) row[j] = (row[j] + row[j - 1]) % p;
        return row[k];
    }

    public static void main(String[] args) {
        long[][] tests = {{1000, 300, 13}, {5, 2, 3}, {100, 50, 7}, {10, 3, 2}, {7, 9, 5}, {999, 0, 11}, {1000000000000L, 123456789, 99991}, {1000000000000000L, 100000000000000L, 7}, {6, 2, 4}};
        for (long[] t : tests) {
            long n = t[0], k = t[1], p = t[2];
            String head = "C(" + n + "," + k + ") mod " + p;
            if (!isPrime(p)) System.out.println(head + ": " + p + " is not prime");
            else if (n <= 1000) System.out.println(head + " = " + lucas(n, k, p) + " (pascal " + pascal((int) n, (int) k, p) + ")");
            else System.out.println(head + " = " + lucas(n, k, p));
        }
    }
}
