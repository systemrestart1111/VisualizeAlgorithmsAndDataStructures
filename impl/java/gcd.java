public class GCD {
    // 輾轉相除：gcd(a, b) = gcd(b, a mod b)，直到餘數為 0
    static long gcd(long a, long b) {
        while (b != 0) {
            System.out.println(a + " = " + a / b + " x " + b + " + " + a % b);
            long r = a % b;
            a = b;
            b = r;
        }
        return a;
    }

    public static void main(String[] args) {
        System.out.println("gcd = " + gcd(252, 105));
    }
}
