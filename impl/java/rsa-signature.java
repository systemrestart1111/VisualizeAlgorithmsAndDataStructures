import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;

public class RsaSignature {
    // 教學用 512 位元金鑰（實務至少 2048 位元）
    static final BigInteger N = new BigInteger("a65f7b022bd33ee0c5644be19caed71c0e691cc10d8a6f57576deda07e66082f64fe2af43a24e28ccbf95a14c9494a5182f48935586db21639efb855e79237fb", 16);
    static final BigInteger D = new BigInteger("5cadfbbc2de5b3b54ac0a074c1efb3ecf12a24d6765093cdb7ea88e14b0853ae0cf5f81b24b065ad8f8f4ab699525cc9f1d1bda8ed9d743d33bd50f22191bc61", 16);
    static final BigInteger N_OTHER = new BigInteger("b0d12b4fc3f44629d53fa2ea439095d3efee1a84c32ce57e0a9c921f42c935e9473b1c9f37efbe3b3e8ca504b8536e9123de2d6a38b71ee7092fb5cfb91af663", 16);
    static final BigInteger E = BigInteger.valueOf(65537);
    static final int EM_LEN = 64, H_LEN = 32, S_LEN = 16, PS_LEN = EM_LEN - S_LEN - H_LEN - 2;

    static byte[] sha(byte[]... parts) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        for (byte[] p : parts) md.update(p);
        return md.digest();
    }
    static byte[] mgf1(byte[] seed, int n) throws Exception {
        byte[] out = new byte[n];
        for (int c = 0, k = 0; k < n; c++) {
            byte[] h = sha(seed, new byte[]{(byte) (c >>> 24), (byte) (c >>> 16), (byte) (c >>> 8), (byte) c});
            for (int i = 0; i < 32 && k < n; i++) out[k++] = h[i];
        }
        return out;
    }
    // H = SHA256(0^8 ∥ SHA256(M) ∥ salt)；EM = (DB ⊕ MGF1(H)) ∥ H ∥ 0xbc
    static byte[] pssEncode(byte[] msg, byte[] salt) throws Exception {
        byte[] h = sha(new byte[8], sha(msg), salt), db = new byte[EM_LEN - H_LEN - 1], mask = mgf1(h, db.length), em = new byte[EM_LEN];
        db[PS_LEN] = 1;
        System.arraycopy(salt, 0, db, PS_LEN + 1, S_LEN);
        for (int i = 0; i < db.length; i++) em[i] = (byte) (db[i] ^ mask[i]);
        em[0] &= 0x7f;
        System.arraycopy(h, 0, em, db.length, H_LEN);
        em[EM_LEN - 1] = (byte) 0xbc;
        return em;
    }
    static byte[] toBytes(BigInteger x, int n) {
        byte[] raw = x.toByteArray(), out = new byte[n];
        int copy = Math.min(raw.length, n);
        System.arraycopy(raw, raw.length - copy, out, n - copy, copy);
        return out;
    }
    static boolean verify(byte[] msg, BigInteger s, BigInteger n) throws Exception {
        if (s.compareTo(n) >= 0) return false;
        byte[] em = toBytes(s.modPow(E, n), EM_LEN);
        if ((em[EM_LEN - 1] & 0xff) != 0xbc || (em[0] & 0x80) != 0) return false;
        byte[] h = Arrays.copyOfRange(em, EM_LEN - H_LEN - 1, EM_LEN - 1), db = Arrays.copyOfRange(em, 0, EM_LEN - H_LEN - 1), mask = mgf1(h, db.length);
        for (int i = 0; i < db.length; i++) db[i] ^= mask[i];
        db[0] &= 0x7f;
        for (int i = 0; i < PS_LEN; i++) if (db[i] != 0) return false;
        if (db[PS_LEN] != 1) return false;
        return Arrays.equals(sha(new byte[8], sha(msg), Arrays.copyOfRange(db, db.length - S_LEN, db.length)), h);
    }
    static String hex(byte[] b) { StringBuilder sb = new StringBuilder(); for (byte x : b) sb.append(String.format("%02x", x)); return sb.toString(); }

    public static void main(String[] args) throws Exception {
        byte[] salt = new byte[S_LEN];
        long seed = 42;
        for (int i = 0; i < S_LEN; i++) { seed = seed * 48271 % 2147483647; salt[i] = (byte) (seed % 256); }
        byte[] msg = "Pay Bob 100 coins".getBytes(StandardCharsets.UTF_8);
        byte[] em = pssEncode(msg, salt);
        BigInteger sig = new BigInteger(1, em).modPow(D, N);
        System.out.println("mHash: " + hex(sha(msg)));
        System.out.println("salt : " + hex(salt));
        System.out.println("EM   : " + hex(em));
        System.out.println("sig  : " + String.format("%0128x", sig));
        System.out.println("verify original : " + (verify(msg, sig, N) ? "True" : "False"));
        System.out.println("verify tampered : " + (verify("Pay Bob 900 coins".getBytes(StandardCharsets.UTF_8), sig, N) ? "True" : "False"));
        System.out.println("verify wrong key: " + (verify(msg, sig, N_OTHER) ? "True" : "False"));
    }
}
