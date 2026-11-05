public class ExtendedGCD {
    // 同時維護係數：每一列都滿足 r = a·s + b·t；最後非零的 r 就是 gcd
    public static void main(String[] args) {
        long a = 240, b = 46, oldR = a, r = b, oldS = 1, s = 0, oldT = 0, t = 1;
        System.out.println(String.format("%4s %5s %5s %5s", "q", "r", "s", "t"));
        System.out.println(String.format("%4s %5d %5d %5d", "", oldR, oldS, oldT));
        while (r != 0) {
            long q = oldR / r, tmp;
            tmp = r; r = oldR - q * r; oldR = tmp;
            tmp = s; s = oldS - q * s; oldS = tmp;
            tmp = t; t = oldT - q * t; oldT = tmp;
            System.out.println(String.format("%4d %5d %5d %5d", q, oldR, oldS, oldT));
        }
        System.out.println("gcd = " + oldR + ", 240 x (" + oldS + ") + 46 x (" + oldT + ") = " + (a * oldS + b * oldT));
    }
}
