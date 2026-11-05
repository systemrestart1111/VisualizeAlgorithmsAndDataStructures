import java.math.BigInteger;

public class AffineCipher {
    // E(x) = (a·x + b) mod 26；D(y) = a⁻¹·(y − b) mod 26；a 必須與 26 互質
    static String affine(String text, int a, int b, boolean decrypt) {
        if (BigInteger.valueOf(a).gcd(BigInteger.valueOf(26)).intValue() != 1) throw new IllegalArgumentException("a 與 26 不互質");
        int ai = BigInteger.valueOf(a).modInverse(BigInteger.valueOf(26)).intValue();
        StringBuilder sb = new StringBuilder();
        for (char ch : text.toCharArray()) {
            boolean up = ch >= 'A' && ch <= 'Z', low = ch >= 'a' && ch <= 'z';
            if (!up && !low) { sb.append(ch); continue; }
            char base = up ? 'A' : 'a';
            int x = ch - base;
            int y = decrypt ? Math.floorMod(ai * (x - b), 26) : (a * x + b) % 26;
            sb.append((char) (base + y));
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        String c = affine("AFFINE CIPHER", 5, 8, false);
        System.out.println("cipher: " + c);
        System.out.println("plain : " + affine(c, 5, 8, true));
        try { affine("TEST", 13, 1, false); } catch (IllegalArgumentException e) { System.out.println("a=13 rejected"); }
    }
}
