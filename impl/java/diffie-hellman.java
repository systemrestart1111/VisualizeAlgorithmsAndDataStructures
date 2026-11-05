import java.math.BigInteger;

public class DiffieHellman {
    static long modPow(long g, long e, long p) { return BigInteger.valueOf(g).modPow(BigInteger.valueOf(e), BigInteger.valueOf(p)).longValue(); }

    public static void main(String[] args) {
        long p = 23, g = 5, a = 6, b = 15;
        long A = modPow(g, a, p), B = modPow(g, b, p), sa = modPow(B, a, p), sb = modPow(A, b, p);
        System.out.println("public: p=" + p + " g=" + g + " A=" + A + " B=" + B);
        System.out.println("Alice shared = " + sa + ", Bob shared = " + sb + ", equal = " + (sa == sb ? "True" : "False"));
        p = 2147483647; g = 7; a = 123456789; b = 987654321;
        A = modPow(g, a, p); B = modPow(g, b, p);
        System.out.println("p=" + p + ": A=" + A + " B=" + B + " shared=" + modPow(B, a, p) + " " + modPow(A, b, p));
    }
}
