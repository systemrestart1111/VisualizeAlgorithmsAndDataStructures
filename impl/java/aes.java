public class Aes {
    static int[] SBOX = new int[256], INV = new int[256];
    static int xt(int a) { return ((a << 1) & 0xff) ^ ((a & 0x80) != 0 ? 0x1b : 0); }
    static int gm(int a, int b) { int p = 0; for (int i = 0; i < 8; i++) { if ((b & 1) != 0) p ^= a; a = xt(a); b >>= 1; } return p; }

    // S-box：GF(2^8) 反元素後做仿射轉換
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
    static int[][] expand(int[] key) {
        int[][] w = new int[44][4];
        for (int i = 0; i < 4; i++) for (int j = 0; j < 4; j++) w[i][j] = key[4 * i + j];
        int rc = 1;
        for (int i = 4; i < 44; i++) {
            int[] t = w[i - 1].clone();
            if (i % 4 == 0) { t = new int[]{SBOX[t[1]] ^ rc, SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]}; rc = xt(rc); }
            for (int j = 0; j < 4; j++) w[i][j] = w[i - 4][j] ^ t[j];
        }
        int[][] rk = new int[11][16];
        for (int r = 0; r < 11; r++) for (int i = 0; i < 16; i++) rk[r][i] = w[4 * r + i / 4][i % 4];
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
    static int[] encrypt(int[] in, int[][] rk) {
        int[] s = new int[16];
        for (int i = 0; i < 16; i++) s[i] = in[i] ^ rk[0][i];
        for (int r = 1; r <= 10; r++) {
            int[] t = new int[16];
            for (int i = 0; i < 16; i++) s[i] = SBOX[s[i]];                                   // SubBytes
            for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 + i % 4) % 4)];          // ShiftRows
            s = r < 10 ? mix(t, MIX) : t;                                                     // MixColumns
            for (int i = 0; i < 16; i++) s[i] ^= rk[r][i];                                    // AddRoundKey
        }
        return s;
    }
    static int[] decrypt(int[] in, int[][] rk) {
        int[] s = new int[16];
        for (int i = 0; i < 16; i++) s[i] = in[i] ^ rk[10][i];
        for (int r = 9; r >= 0; r--) {
            int[] t = new int[16];
            for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 - i % 4 + 4) % 4)];
            for (int i = 0; i < 16; i++) s[i] = INV[t[i]] ^ rk[r][i];
            if (r > 0) s = mix(s, INV_MIX);
        }
        return s;
    }
    static int[] parse(String h) { int[] b = new int[16]; for (int i = 0; i < 16; i++) b[i] = Integer.parseInt(h.substring(2 * i, 2 * i + 2), 16); return b; }
    static String hex(int[] b) { StringBuilder sb = new StringBuilder(); for (int x : b) sb.append(String.format("%02x", x)); return sb.toString(); }

    public static void main(String[] args) {
        String[][] tests = {{"000102030405060708090a0b0c0d0e0f", "00112233445566778899aabbccddeeff"}, {"2b7e151628aed2a6abf7158809cf4f3c", "6bc1bee22e409f96e93d7e117393172a"}};
        for (String[] t : tests) {
            int[][] rk = expand(parse(t[0]));
            int[] ct = encrypt(parse(t[1]), rk);
            System.out.println("key  : " + t[0]);
            System.out.println("rk10 : " + hex(rk[10]));
            System.out.println("ct   : " + hex(ct));
            System.out.println("back : " + hex(decrypt(ct, rk)));
        }
    }
}
