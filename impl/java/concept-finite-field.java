public class ConceptFiniteField {
    // GF(2^8) 乘法：逐位相加（XOR），a 每次乘 x（xtime），溢出時對 0x11B 約化
    static int gfMul(int a, int b) {
        int p = 0;
        for (int i = 0; i < 8; i++) {
            if ((b & 1) != 0) p ^= a;
            int hi = a & 0x80;
            a = (a << 1) & 0xFF;
            if (hi != 0) a ^= 0x1B;
            b >>= 1;
        }
        return p;
    }

    // a^254 = a^-1（a ≠ 0）；0 沒有反元素，回傳 -1
    static int gfInv(int a) {
        if (a == 0) return -1;
        int r = 1;
        for (int e = 254; e != 0; e >>= 1) {
            if ((e & 1) != 0) r = gfMul(r, a);
            a = gfMul(a, a);
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.printf("0x57 + 0x83 = 0x%02X%n", 0x57 ^ 0x83);
        System.out.printf("0x57 * 0x83 = 0x%02X%n", gfMul(0x57, 0x83));
        System.out.printf("0x57 * 0x13 = 0x%02X%n", gfMul(0x57, 0x13));
        int inv = gfInv(0x57);
        System.out.printf("inv(0x57) = 0x%02X, check = 0x%02X%n", inv, gfMul(0x57, inv));
        System.out.println("inv(0x00) = " + (gfInv(0) < 0 ? "none" : "?"));
    }
}
