import java.math.BigInteger;
import java.util.*;

public class RsaCipher {
    // 平方乘法：由高位到低位
    static long modPow(long b, long e, long m) {
        long r = 1;
        for (int i = 62; i >= 0; i--) {
            r = r * r % m;
            if (((e >> i) & 1) == 1) r = r * b % m;
        }
        return r;
    }

    public static void main(String[] args) {
        long p = 61, q = 53, e = 17, n = p * q, phi = (p - 1) * (q - 1);
        long d = BigInteger.valueOf(e).modInverse(BigInteger.valueOf(phi)).longValue();
        System.out.println("n = " + n + ", phi = " + phi + ", e = " + e + ", d = " + d);
        List<Long> cs = new ArrayList<>(), back = new ArrayList<>();
        for (long m : new long[]{65, 66, 67}) cs.add(modPow(m, e, n));
        for (long c : cs) back.add(modPow(c, d, n));
        System.out.println("cipher: " + cs);
        System.out.println("plain : " + back);
    }
}
