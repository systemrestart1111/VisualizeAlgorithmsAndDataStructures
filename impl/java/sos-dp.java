import java.util.Arrays;

public class SosDp {
    // 一次處理一個位元：含第 b 位的 mask 加上「去掉第 b 位」的值
    static int[] sos(int[] a) {
        int[] F = a.clone();
        for (int b = 0; (1 << b) < F.length; b++)
            for (int m = 0; m < F.length; m++) if ((m >> b & 1) == 1) F[m] += F[m ^ (1 << b)];
        return F;
    }
    static int[] brute(int[] a) {
        int[] out = new int[a.length];
        for (int m = 0; m < a.length; m++) for (int sub = m;; sub = (sub - 1) & m) { out[m] += a[sub]; if (sub == 0) break; }
        return out;
    }
    static String join(int[] v) { StringBuilder sb = new StringBuilder(); for (int x : v) sb.append(' ').append(x); return sb.toString(); }

    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9, 2, 6}, b = new int[16];
        int[] F = sos(a);
        System.out.println("F:" + join(F));
        System.out.println("matches brute force: " + (Arrays.equals(F, brute(a)) ? "True" : "False"));
        for (int i = 0; i < 16; i++) b[i] = i + 1;
        int[] G = sos(b);
        System.out.println("F (16):" + join(G) + " | ok: " + (Arrays.equals(G, brute(b)) ? "True" : "False"));
    }
}
