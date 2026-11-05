public class EulerTotient {
    static long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }

    // φ(n) = n·∏(1 − 1/p)，以 result −= result / p 實作
    static long phi(long n) {
        long result = n;
        for (long p = 2; p * p <= n; p++)
            if (n % p == 0) {
                while (n % p == 0) n /= p;
                result -= result / p;
            }
        if (n > 1) result -= result / n;
        return result;
    }

    public static void main(String[] args) {
        for (long n : new long[]{1, 2, 36, 97, 100, 360, 1000000, 999999937, 600851475143L}) {
            if (n <= 1000) {
                int brute = 0;
                for (long x = 1; x <= n; x++) if (gcd(x, n) == 1) brute++;
                System.out.println("phi(" + n + ") = " + phi(n) + " (gcd count " + brute + ")");
            } else System.out.println("phi(" + n + ") = " + phi(n));
        }
    }
}
