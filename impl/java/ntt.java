import java.util.*;

public class Ntt {
    static long pw(long b, long e, long m) { long r = 1; b %= m; while (e > 0) { if ((e & 1) == 1) r = r * b % m; b = b * b % m; e >>= 1; } return r; }

    // 位元反轉 + 蝴蝶；單位根 w = g^((p−1)/len)，逆轉換用 w⁻¹ 並乘 n⁻¹
    static void ntt(long[] a, boolean invert, long p, long g) {
        int n = a.length;
        for (int i = 1, j = 0; i < n; i++) {
            int bit = n >> 1;
            for (; (j & bit) != 0; bit >>= 1) j ^= bit;
            j |= bit;
            if (i < j) { long t = a[i]; a[i] = a[j]; a[j] = t; }
        }
        for (int len = 2; len <= n; len <<= 1) {
            long w = pw(g, (p - 1) / len, p);
            if (invert) w = pw(w, p - 2, p);
            for (int i = 0; i < n; i += len) {
                long wj = 1;
                for (int k = 0; k < len / 2; k++) {
                    long u = a[i + k], v = a[i + k + len / 2] * wj % p;
                    a[i + k] = (u + v) % p;
                    a[i + k + len / 2] = (u - v + p) % p;
                    wj = wj * w % p;
                }
            }
        }
        if (invert) { long ninv = pw(n, p - 2, p); for (int i = 0; i < n; i++) a[i] = a[i] * ninv % p; }
    }

    static void run(long[] x, long[] y, long p, long g) {
        int len = x.length + y.length - 1, n = 1;
        while (n < len) n <<= 1;
        if ((p - 1) % n != 0) { System.out.println("mod " + p + ": length " + len + " padded size does not divide p-1, cannot transform"); return; }
        long[] A = new long[n], B = new long[n], N = new long[len], C = new long[n];
        for (int i = 0; i < x.length; i++) A[i] = (x[i] % p + p) % p;
        for (int i = 0; i < y.length; i++) B[i] = (y[i] % p + p) % p;
        ntt(A, false, p, g);
        ntt(B, false, p, g);
        for (int i = 0; i < n; i++) C[i] = A[i] * B[i] % p;
        ntt(C, true, p, g);
        for (int i = 0; i < x.length; i++) for (int j = 0; j < y.length; j++) N[i + j] = (N[i + j] + ((x[i] % p + p) % p) * ((y[j] % p + p) % p)) % p;
        boolean same = true;
        StringBuilder sb = new StringBuilder("mod " + p + ":");
        for (int i = 0; i < len; i++) { sb.append(' ').append(C[i]); if (C[i] != N[i]) same = false; }
        System.out.println(sb + " (naive match " + (same ? "True" : "False") + ")");
    }

    public static void main(String[] args) {
        long s = 2024;
        long[] big1 = new long[10], big2 = new long[7], ones = new long[10];
        for (int i = 0; i < 10; i++) { s = s * 48271 % 2147483647; big1[i] = s % 998244353; }
        for (int i = 0; i < 7; i++) { s = s * 48271 % 2147483647; big2[i] = s % 998244353; }
        Arrays.fill(ones, 1);
        run(new long[]{1, 2, 3, 4}, new long[]{5, 6, 7}, 998244353, 3);
        run(new long[]{1, 2, 3, 4}, new long[]{5, 6, 7}, 17, 3);
        run(new long[]{3, -1, 4}, new long[]{1, 5, 9, 2, 6}, 97, 5);
        run(big1, big2, 998244353, 3);
        run(ones, ones, 17, 3);
    }
}
