public class ConceptBits {
    static final int W = 8, MASK = (1 << W) - 1;

    static String b(int x) {
        String s = Integer.toBinaryString(x & MASK);
        return "0".repeat(W - s.length()) + s;
    }

    public static void main(String[] args) {
        int a = 182, c = 109, k = 3;
        System.out.println("a      = " + b(a) + " " + a);
        System.out.println("b      = " + b(c) + " " + c);
        System.out.println("a & b  = " + b(a & c) + " " + (a & c));
        System.out.println("a | b  = " + b(a | c) + " " + (a | c));
        System.out.println("a ^ b  = " + b(a ^ c) + " " + (a ^ c));
        System.out.println("~a     = " + b(~a) + " " + (~a & MASK));
        System.out.println("a << 3 = " + b(a << k) + " " + ((a << k) & MASK) + " (overflow bits: " + ((a << k) >> W) + " )");
        System.out.println("a >> 3 = " + b(a >> k) + " " + (a >> k));
        System.out.println("lowbit = " + b(a & -a) + " " + (a & -a));
        System.out.println("bit 3 of a = " + ((a >> k) & 1) + " ; set bit 3 -> " + (a | (1 << k)) + " ; clear bit 2 -> " + (a & ~(1 << 2) & MASK));
        System.out.println("-3 in 8 bits = " + b(-3));
    }
}
