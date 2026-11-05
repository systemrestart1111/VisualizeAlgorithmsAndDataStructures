import java.util.*;

public class MobiusInversion {
    static int mobius(int x) {
        int k = 0;
        boolean sq = false;
        for (int d = 2; d * d <= x; d++)
            if (x % d == 0) { x /= d; k++; if (x % d == 0) sq = true; while (x % d == 0) x /= d; }
        if (x > 1) k++;
        return sq ? 0 : (k % 2 == 1 ? -1 : 1);
    }

    // g(n) = Σ_{d|n} f(d)；再以 f(n) = Σ_{d|n} μ(n/d)·g(d) 還原
    static void run(int[] f) {
        int N = f.length;
        int[] g = new int[N + 1], back = new int[N + 1];
        for (int n = 1; n <= N; n++) for (int d = 1; d <= n; d++) if (n % d == 0) g[n] += f[d - 1];
        boolean ok = true;
        for (int n = 1; n <= N; n++) { for (int d = 1; d <= n; d++) if (n % d == 0) back[n] += mobius(n / d) * g[d]; if (back[n] != f[n - 1]) ok = false; }
        StringBuilder a = new StringBuilder("g:"), b = new StringBuilder("f recovered:");
        for (int n = 1; n <= N; n++) { a.append(' ').append(g[n]); b.append(' ').append(back[n]); }
        System.out.println(a);
        System.out.println(b + " (match " + (ok ? "True" : "False") + ")");
    }

    public static void main(String[] args) {
        run(new int[]{1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4});
        run(new int[]{3, -1, 4, 1, -5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3});
        int[] ones = new int[12];
        Arrays.fill(ones, 1);
        run(ones);
    }
}
