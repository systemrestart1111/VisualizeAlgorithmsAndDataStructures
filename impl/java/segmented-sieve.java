import java.util.ArrayList;
import java.util.List;

public class SegmentedSieve {
    // 先用普通篩法求出 √hi 以內的質數，再只在 [lo, hi] 這一段裡劃掉它們的倍數（記憶體只需區間長度）
    public static void main(String[] args) {
        long lo = 1000, hi = 1060;
        int lim = (int) Math.sqrt(hi);
        boolean[] comp = new boolean[lim + 1], crossed = new boolean[(int) (hi - lo + 1)];
        List<Integer> small = new ArrayList<>();
        for (int p = 2; p <= lim; p++) {
            if (comp[p]) continue;
            small.add(p);
            for (int m = p * p; m <= lim; m += p) comp[m] = true;
        }
        for (long p : small) {
            long start = Math.max(p * p, (lo + p - 1) / p * p); // 區間內第一個 p 的倍數
            for (long m = start; m <= hi; m += p) crossed[(int) (m - lo)] = true;
        }
        StringBuilder a = new StringBuilder("base primes <= sqrt(" + hi + "):"), b = new StringBuilder("primes in [" + lo + ", " + hi + "]:");
        for (int p : small) a.append(' ').append(p);
        for (int i = 0; i <= hi - lo; i++) if (!crossed[i] && lo + i >= 2) b.append(' ').append(lo + i);
        System.out.println(a + "\n" + b);
    }
}
