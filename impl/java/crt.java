public class CRT {
    static long modInverse(long a, long m) {
        long oldR = m, r = a % m, oldT = 0, t = 1;
        while (r != 0) {
            long q = oldR / r, tmp;
            tmp = r; r = oldR - q * r; oldR = tmp;
            tmp = t; t = oldT - q * t; oldT = tmp;
        }
        return Math.floorMod(oldT, m);
    }

    // x = Σ a_i · M_i · (M_i⁻¹ mod m_i)，其中 M_i = M / m_i；每一項只在自己的模數下不為 0
    public static void main(String[] args) {
        long[][] eqs = {{2, 3}, {3, 5}, {2, 7}}; // x ≡ a (mod m)，模數兩兩互質
        long M = 1, x = 0;
        for (long[] e : eqs) M *= e[1];
        for (long[] e : eqs) {
            long a = e[0], m = e[1], Mi = M / m, inv = modInverse(Mi, m);
            System.out.println("a=" + a + ", m=" + m + ": M_i = " + Mi + ", M_i^-1 mod " + m + " = " + inv + ", term = " + a * Mi * inv);
            x += a * Mi * inv;
        }
        System.out.println("x = " + x % M + " (mod " + M + ")");
    }
}
