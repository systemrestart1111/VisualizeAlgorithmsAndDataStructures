import java.util.ArrayList;
import java.util.List;

public class Sieve {
    // 埃拉托斯特尼篩法：從每個質數 p 的 p² 開始，把它的倍數全部劃掉
    static List<Integer> sieve(int n) {
        boolean[] composite = new boolean[n + 1];
        for (int p = 2; p * p <= n; p++)
            if (!composite[p])
                for (int m = p * p; m <= n; m += p) composite[m] = true;
        List<Integer> primes = new ArrayList<>();
        for (int i = 2; i <= n; i++) if (!composite[i]) primes.add(i);
        return primes;
    }

    public static void main(String[] args) {
        List<Integer> primes = sieve(100);
        StringBuilder sb = new StringBuilder("primes <= 100:");
        for (int p : primes) sb.append(' ').append(p);
        System.out.println(sb + "\ncount = " + primes.size());
    }
}
