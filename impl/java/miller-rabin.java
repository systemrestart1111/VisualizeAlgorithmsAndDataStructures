public class MillerRabin {
    static long witness;

    // n < 2^31 時 a·b < 2^62，long 不會溢位
    static long modPow(long a, long e, long n) {
        long r = 1;
        for (a %= n; e > 0; e >>= 1, a = a * a % n) if ((e & 1) == 1) r = r * a % n;
        return r;
    }

    // 寫成 n-1 = d·2^s；對每個底數 a，若 a^d ≢ 1 且平方 s 次都沒出現 -1，a 就是「合數的證人」
    static boolean isProbablePrime(long n) {
        if (n < 2) return false;
        if (n % 2 == 0) { witness = 2; return n == 2; }
        long d = n - 1;
        int s = 0;
        while (d % 2 == 0) { d /= 2; s++; }
        for (long a : new long[] {2, 3, 5, 7, 11, 13, 17}) {
            if (a % n == 0) continue;
            long x = modPow(a, d, n);
            if (x == 1 || x == n - 1) continue;
            boolean ok = false;
            for (int r = 1; r < s && !ok; r++) {
                x = x * x % n;
                if (x == n - 1) ok = true;
            }
            if (!ok) { witness = a; return false; }
        }
        return true;
    }

    public static void main(String[] args) {
        for (long n : new long[] {561, 7919, 1000003, 25326001, 2147483647})
            System.out.println(isProbablePrime(n) ? n + ": prime" : n + ": composite (witness " + witness + ")");
    }
}
