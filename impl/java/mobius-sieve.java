import java.util.*;

public class MobiusSieve {
    // 線性篩：質數 μ = −1；i % p == 0 時 i·p 含 p²，μ = 0；否則 μ(i·p) = −μ(i)
    static int[] sieve(int N) {
        int[] mu = new int[N + 1];
        boolean[] comp = new boolean[N + 1];
        List<Integer> primes = new ArrayList<>();
        mu[1] = 1;
        for (int i = 2; i <= N; i++) {
            if (!comp[i]) { primes.add(i); mu[i] = -1; }
            for (int p : primes) {
                if (i * p > N) break;
                comp[i * p] = true;
                if (i % p == 0) { mu[i * p] = 0; break; }
                mu[i * p] = -mu[i];
            }
        }
        return mu;
    }
    static int byFactoring(int x) {
        int k = 0;
        for (int d = 2; d * d <= x; d++)
            if (x % d == 0) { x /= d; if (x % d == 0) return 0; k++; }
        if (x > 1) k++;
        return k % 2 == 1 ? -1 : 1;
    }

    public static void main(String[] args) {
        int[] mu = sieve(30);
        StringBuilder sb = new StringBuilder("mu(1..30):");
        for (int i = 1; i <= 30; i++) sb.append(' ').append(mu[i]);
        System.out.println(sb);
        int N = 1000;
        mu = sieve(N);
        int pos = 0, neg = 0, zero = 0, sum = 0;
        boolean ok = true;
        for (int x = 1; x <= N; x++) { if (mu[x] == 1) pos++; else if (mu[x] == -1) neg++; else zero++; sum += mu[x]; if (mu[x] != byFactoring(x)) ok = false; }
        System.out.println("N=" + N + ": +1 " + pos + ", -1 " + neg + ", 0 " + zero + ", Mertens " + sum);
        System.out.println("check by factoring: " + (ok ? "True" : "False"));
    }
}
