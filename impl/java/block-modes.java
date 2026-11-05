import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public class BlockModes {
    // 以自行實作的 AES-128 區塊加密為基礎（同 aes.java）
    static int[] SBOX = new int[256], INV = new int[256];
    static int xt(int a) { return ((a << 1) & 0xff) ^ ((a & 0x80) != 0 ? 0x1b : 0); }
    static int gm(int a, int b) { int p = 0; for (int i = 0; i < 8; i++) { if ((b & 1) != 0) p ^= a; a = xt(a); b >>= 1; } return p; }
    static {
        for (int x = 0; x < 256; x++) {
            int v = 0;
            if (x != 0) for (int y = 1; y < 256; y++) if (gm(x, y) == 1) { v = y; break; }
            int r = v;
            for (int k = 1; k <= 4; k++) r ^= ((v << k) | (v >> (8 - k))) & 0xff;
            SBOX[x] = r ^ 0x63;
            INV[SBOX[x]] = x;
        }
    }
    static int[] expand(int[] key) {
        int[] rk = new int[176];
        System.arraycopy(key, 0, rk, 0, 16);
        int rc = 1;
        for (int i = 4; i < 44; i++) {
            int[] t = Arrays.copyOfRange(rk, 4 * i - 4, 4 * i);
            if (i % 4 == 0) { t = new int[]{SBOX[t[1]] ^ rc, SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]}; rc = xt(rc); }
            for (int j = 0; j < 4; j++) rk[4 * i + j] = rk[4 * (i - 4) + j] ^ t[j];
        }
        return rk;
    }
    static final int[][] MIX = {{2, 3, 1, 1}, {1, 2, 3, 1}, {1, 1, 2, 3}, {3, 1, 1, 2}};
    static final int[][] INV_MIX = {{14, 11, 13, 9}, {9, 14, 11, 13}, {13, 9, 14, 11}, {11, 13, 9, 14}};
    static int[] mix(int[] s, int[][] m) {
        int[] o = new int[16];
        for (int c = 0; c < 4; c++)
            for (int r = 0; r < 4; r++) o[4 * c + r] = gm(s[4 * c], m[r][0]) ^ gm(s[4 * c + 1], m[r][1]) ^ gm(s[4 * c + 2], m[r][2]) ^ gm(s[4 * c + 3], m[r][3]);
        return o;
    }
    static int[] enc(int[] in, int[] rk) {
        int[] s = new int[16];
        for (int i = 0; i < 16; i++) s[i] = in[i] ^ rk[i];
        for (int r = 1; r <= 10; r++) {
            int[] t = new int[16];
            for (int i = 0; i < 16; i++) s[i] = SBOX[s[i]];
            for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 + i % 4) % 4)];
            s = r < 10 ? mix(t, MIX) : t;
            for (int i = 0; i < 16; i++) s[i] ^= rk[16 * r + i];
        }
        return s;
    }
    static int[] dec(int[] in, int[] rk) {
        int[] s = new int[16];
        for (int i = 0; i < 16; i++) s[i] = in[i] ^ rk[160 + i];
        for (int r = 9; r >= 0; r--) {
            int[] t = new int[16];
            for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 - i % 4 + 4) % 4)];
            for (int i = 0; i < 16; i++) s[i] = INV[t[i]] ^ rk[16 * r + i];
            if (r > 0) s = mix(s, INV_MIX);
        }
        return s;
    }
    // PKCS#7 填充後，每塊先與前一個密文區塊 XOR 再加密
    static int[] cbcEncrypt(int[] pt, int[] rk, int[] iv, boolean pad) {
        int n = pt.length, k = pad ? 16 - n % 16 : 0;
        int[] buf = Arrays.copyOf(pt, n + k);
        for (int i = n; i < n + k; i++) buf[i] = k;
        int[] prev = iv.clone(), out = new int[buf.length];
        for (int i = 0; i < buf.length; i += 16) {
            for (int j = 0; j < 16; j++) prev[j] ^= buf[i + j];
            prev = enc(prev, rk);
            System.arraycopy(prev, 0, out, i, 16);
        }
        return out;
    }
    static int[] cbcDecrypt(int[] ct, int[] rk, int[] iv) {
        int[] prev = iv, out = new int[ct.length];
        for (int i = 0; i < ct.length; i += 16) {
            int[] blk = Arrays.copyOfRange(ct, i, i + 16), p = dec(blk, rk);
            for (int j = 0; j < 16; j++) out[i + j] = p[j] ^ prev[j];
            prev = blk;
        }
        return Arrays.copyOf(out, out.length - out[out.length - 1]);
    }
    // 金鑰流 = AES(nonce ∥ 計數器)，與資料 XOR；加解密相同，不需填充
    static int[] ctr(int[] in, int[] rk, int[] nonce) {
        int[] out = new int[in.length];
        for (int i = 0; i < in.length; i += 16) {
            int[] cb = new int[16];
            System.arraycopy(nonce, 0, cb, 0, 8);
            long c = i / 16;
            for (int j = 0; j < 8; j++) cb[15 - j] = (int) ((c >> (8 * j)) & 0xff);
            int[] ks = enc(cb, rk);
            for (int j = 0; j < 16 && i + j < in.length; j++) out[i + j] = in[i + j] ^ ks[j];
        }
        return out;
    }
    static int[] parse(String h) { int[] b = new int[h.length() / 2]; for (int i = 0; i < b.length; i++) b[i] = Integer.parseInt(h.substring(2 * i, 2 * i + 2), 16); return b; }
    static String hex(int[] b) { StringBuilder sb = new StringBuilder(); for (int x : b) sb.append(String.format("%02x", x)); return sb.toString(); }
    static int[] bytes(String s) { byte[] b = s.getBytes(StandardCharsets.UTF_8); int[] o = new int[b.length]; for (int i = 0; i < b.length; i++) o[i] = b[i] & 0xff; return o; }
    static String str(int[] b) { ByteArrayOutputStream o = new ByteArrayOutputStream(); for (int x : b) o.write(x); return o.toString(StandardCharsets.UTF_8); }

    public static void main(String[] args) {
        int[] rk = expand(parse("2b7e151628aed2a6abf7158809cf4f3c")), iv = parse("000102030405060708090a0b0c0d0e0f");
        System.out.println("CBC SP800-38A: " + hex(cbcEncrypt(parse("6bc1bee22e409f96e93d7e117393172a"), rk, iv, false)));
        int[] pt = bytes("Block modes chain AES blocks!");
        int[] c = cbcEncrypt(pt, rk, iv, true);
        System.out.println("CBC: " + hex(c));
        System.out.println("CBC back: " + str(cbcDecrypt(c, rk, iv)));
        c = ctr(pt, rk, iv);
        System.out.println("CTR: " + hex(c));
        System.out.println("CTR back: " + str(ctr(c, rk, iv)));
    }
}
