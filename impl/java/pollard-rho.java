import java.util.*;

public class PollardRho {
    // 俄羅斯農夫乘法避免溢位：n < 2^62 時 a + b 不會溢位
    static long mulmod(long a, long b, long m) {
        long r = 0;
        a %= m;
        while (b > 0) { if ((b & 1) == 1) r = (r + a) % m; a = (a + a) % m; b >>= 1; }
        return r;
    }
    static long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }
    static boolean isPrime(long n) {
        if (n < 2) return false;
        for (long d = 2; d * d <= n; d++) if (n % d == 0) return false;
        return true;
    }
    // f(x) = x² + c；龜兔賽跑找 gcd(|x − y|, n) > 1；d == n 時換 c 重試
    static long rho(long n, List<String> log) {
        for (long c = 1;; c++) {
            long x = 2, y = 2, d = 1;
            int steps = 0;
            while (d == 1) {
                x = (mulmod(x, x, n) + c) % n;
                y = (mulmod(y, y, n) + c) % n;
                y = (mulmod(y, y, n) + c) % n;
                d = gcd(Math.abs(x - y), n);
                steps++;
            }
            if (log != null) log.add("c=" + c + " steps=" + steps + " d=" + d + (d == n ? " (failed, retry)" : ""));
            if (d != n) return d;
        }
    }
    static void factor(long n, List<Long> out) {
        if (n == 1) return;
        if (isPrime(n)) out.add(n);
        else if (n % 2 == 0) { out.add(2L); factor(n / 2, out); }
        else { long d = rho(n, null); factor(d, out); factor(n / d, out); }
    }

    public static void main(String[] args) {
        for (long n : new long[]{8051, 25}) {
            List<String> log = new ArrayList<>();
            rho(n, log);
            System.out.println("rho(" + n + "): " + String.join("; ", log));
        }
        for (long n : new long[]{1, 8051, 201275, 10403, 1022117, 1000003, 600851475143L, 999985999949L}) {
            List<Long> fs = new ArrayList<>();
            factor(n, fs);
            Collections.sort(fs);
            long prod = 1;
            StringBuilder sb = new StringBuilder();
            for (long p : fs) { sb.append(sb.length() > 0 ? " * " : "").append(p); prod *= p; }
            System.out.println(n + " = " + (fs.isEmpty() ? "1" : sb) + " (product ok " + (prod == n ? "True" : "False") + ")");
        }
    }
}
