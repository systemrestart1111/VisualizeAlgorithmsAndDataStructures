import java.math.BigInteger;

public class ModInverse {
    // 用擴展歐幾里得解 a·x + m·y = 1，x 就是 a 在模 m 下的反元素（需 gcd(a, m) = 1）
    static long modInverse(long a, long m) {
        long oldR = m, r = a, oldT = 0, t = 1;
        while (r != 0) {
            long q = oldR / r, tmp;
            tmp = r; r = oldR - q * r; oldR = tmp;
            tmp = t; t = oldT - q * t; oldT = tmp;
        }
        if (oldR != 1) return -1;
        return Math.floorMod(oldT, m);
    }

    public static void main(String[] args) {
        long a = 17, m = 43, inv = modInverse(a, m);
        System.out.println(a + "^-1 mod " + m + " = " + inv);
        System.out.println("check: " + a + " x " + inv + " mod " + m + " = " + a * inv % m);
        long fermat = BigInteger.valueOf(a).modPow(BigInteger.valueOf(m - 2), BigInteger.valueOf(m)).longValue();
        System.out.println("Fermat (m is prime): " + a + "^(" + m + "-2) mod " + m + " = " + fermat);
    }
}
