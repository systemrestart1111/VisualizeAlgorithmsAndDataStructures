import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;

public class Hmac {
    static byte[] sha256(byte[] b) throws Exception { return MessageDigest.getInstance("SHA-256").digest(b); }

    // H((K0 ⊕ opad) ∥ H((K0 ⊕ ipad) ∥ m))
    static byte[] hmac(byte[] key, byte[] msg) throws Exception {
        if (key.length > 64) key = sha256(key);
        byte[] k0 = Arrays.copyOf(key, 64), in = new byte[64 + msg.length], out = new byte[96];
        for (int i = 0; i < 64; i++) { in[i] = (byte) (k0[i] ^ 0x36); out[i] = (byte) (k0[i] ^ 0x5c); }
        System.arraycopy(msg, 0, in, 64, msg.length);
        System.arraycopy(sha256(in), 0, out, 64, 32);
        return sha256(out);
    }
    static byte[] b(String s) { return s.getBytes(StandardCharsets.UTF_8); }
    static String hex(byte[] b) { StringBuilder sb = new StringBuilder(); for (byte x : b) sb.append(String.format("%02x", x)); return sb.toString(); }

    public static void main(String[] args) throws Exception {
        String[][] tests = {{"key", "The quick brown fox jumps over the lazy dog"}, {"Jefe", "what do ya want for nothing?"}, {"k".repeat(100), "long key is hashed first"}};
        String[] known = {"f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8", "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843"};
        for (int t = 0; t < 3; t++) {
            String h = hex(hmac(b(tests[t][0]), b(tests[t][1])));
            if (t < 2) System.out.println(h + " known vector: " + (h.equals(known[t]) ? "True" : "False"));
            else System.out.println("long key: " + h);
        }
        byte[] mac = hmac(b("key"), b("transfer 100 to bob"));
        System.out.println("verify original: " + (MessageDigest.isEqual(mac, hmac(b("key"), b("transfer 100 to bob"))) ? "True" : "False"));
        System.out.println("verify tampered: " + (MessageDigest.isEqual(mac, hmac(b("key"), b("transfer 900 to bob"))) ? "True" : "False"));
        System.out.println("verify wrong key: " + (MessageDigest.isEqual(mac, hmac(b("kex"), b("transfer 100 to bob"))) ? "True" : "False"));
    }
}
