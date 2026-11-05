public class Hyperloglog {
    static long poly(String s, long base, long mod) { long h = 0; for (char c : s.toCharArray()) h = (h * base + c) % mod; return h; }
    static int fmix32(int h) { h ^= h >>> 16; h *= 0x85ebca6b; h ^= h >>> 13; h *= 0xc2b2ae35; h ^= h >>> 16; return h; }

    static final int P = 4, M = 1 << P;
    static int[] R = new int[M];

    static void add(String s) {
        int x = fmix32((int) poly(s, 31, 4294967291L));
        int j = x >>> (32 - P);                 // 前 p 位選暫存器
        int w = x << P;                         // 其餘位元
        int rho = Math.min(32 - P + 1, Integer.numberOfLeadingZeros(w) + 1);
        R[j] = Math.max(R[j], rho);
    }
    static double estimate() {
        double z = 0;
        int v = 0;
        for (int r : R) { z += Math.pow(2.0, -r); if (r == 0) v++; }
        double e = 0.673 * M * M / z;
        if (e <= 2.5 * M && v > 0) e = M * Math.log((double) M / v);   // 小基數：線性計數校正
        return e;
    }

    public static void main(String[] args) {
        for (int n : new int[]{5, 50, 1000, 20000}) {
            R = new int[M];
            for (int i = 1; i <= n; i++) add("item" + i);
            for (int i = 1; i <= n; i += 2) add("item" + i);
            StringBuilder sb = new StringBuilder(String.format("n = %d: estimate %.2f, registers", n, estimate()));
            for (int r : R) sb.append(' ').append(r);
            System.out.println(sb);
        }
    }
}
