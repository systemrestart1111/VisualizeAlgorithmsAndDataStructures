import java.util.ArrayList;
import java.util.List;

public class PrimeFactorization {
    // 試除法：從 2 開始除，能整除就一直除；試到 √n 為止，剩下的若大於 1 就是最後一個質因數
    static List<long[]> factorize(long n) {
        List<long[]> f = new ArrayList<>();
        for (long d = 2; d * d <= n; d++) {
            int e = 0;
            while (n % d == 0) { n /= d; e++; }
            if (e > 0) f.add(new long[] {d, e});
        }
        if (n > 1) f.add(new long[] {n, 1});
        return f;
    }

    public static void main(String[] args) {
        List<String> parts = new ArrayList<>();
        for (long[] pe : factorize(360360)) parts.add(pe[1] > 1 ? pe[0] + "^" + pe[1] : String.valueOf(pe[0]));
        System.out.println("360360 = " + String.join(" x ", parts));
    }
}
