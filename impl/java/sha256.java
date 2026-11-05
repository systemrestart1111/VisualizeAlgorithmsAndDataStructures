import java.nio.charset.StandardCharsets;

public class Sha256 {
    static final int[] K = {
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2};

    static String sha256(byte[] msg) {
        // 補位：附加 0x80，補 0 到 ≡ 56 (mod 64)，最後 8 位元組是位元長度
        int L = ((msg.length + 9 + 63) / 64) * 64;
        byte[] p = new byte[L];
        System.arraycopy(msg, 0, p, 0, msg.length);
        p[msg.length] = (byte) 0x80;
        long bits = (long) msg.length * 8;
        for (int i = 0; i < 8; i++) p[L - 1 - i] = (byte) (bits >>> (8 * i));
        int[] H = {0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19};
        for (int off = 0; off < L; off += 64) {
            int[] W = new int[64];
            for (int t = 0; t < 16; t++) W[t] = (p[off + 4 * t] & 0xff) << 24 | (p[off + 4 * t + 1] & 0xff) << 16 | (p[off + 4 * t + 2] & 0xff) << 8 | (p[off + 4 * t + 3] & 0xff);
            for (int t = 16; t < 64; t++)
                W[t] = W[t - 16] + (Integer.rotateRight(W[t - 15], 7) ^ Integer.rotateRight(W[t - 15], 18) ^ (W[t - 15] >>> 3)) + W[t - 7] + (Integer.rotateRight(W[t - 2], 17) ^ Integer.rotateRight(W[t - 2], 19) ^ (W[t - 2] >>> 10));
            int a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
            for (int t = 0; t < 64; t++) {
                int t1 = h + (Integer.rotateRight(e, 6) ^ Integer.rotateRight(e, 11) ^ Integer.rotateRight(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + W[t];
                int t2 = (Integer.rotateRight(a, 2) ^ Integer.rotateRight(a, 13) ^ Integer.rotateRight(a, 22)) + ((a & b) ^ (a & c) ^ (b & c));
                h = g; g = f; f = e; e = d + t1; d = c; c = b; b = a; a = t1 + t2;
            }
            H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
        }
        StringBuilder sb = new StringBuilder();
        for (int x : H) sb.append(String.format("%08x", x));
        return sb.toString();
    }

    public static void main(String[] args) {
        String[] msgs = {"", "abc", "The quick brown fox jumps over the lazy dog", "a".repeat(100)};
        for (String m : msgs) {
            String shown = "'" + m.substring(0, Math.min(20, m.length())) + "'" + (m.length() > 20 ? "..." : "");
            System.out.println("sha256(" + shown + ") = " + sha256(m.getBytes(StandardCharsets.UTF_8)));
        }
    }
}
