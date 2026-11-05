import java.util.ArrayList;
import java.util.List;

public class LinearSieve {
    // 線性篩：每個合數只被它的「最小質因數」劃掉一次，因此總共 O(n)
    public static void main(String[] args) {
        int n = 60;
        int[] spf = new int[n + 1]; // spf[i] = i 的最小質因數
        List<Integer> primes = new ArrayList<>();
        for (int i = 2; i <= n; i++) {
            if (spf[i] == 0) { spf[i] = i; primes.add(i); }
            for (int p : primes) {
                if (p > spf[i] || i * p > n) break;
                spf[i * p] = p;
            }
        }
        StringBuilder a = new StringBuilder("primes:"), b = new StringBuilder("smallest prime factor of 2..20:");
        for (int p : primes) a.append(' ').append(p);
        for (int i = 2; i <= 20; i++) b.append(' ').append(spf[i]);
        System.out.println(a + "\n" + b);
    }
}
