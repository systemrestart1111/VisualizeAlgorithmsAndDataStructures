#include <array>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;
using u8 = unsigned char;
using Block = array<u8, 16>;

u8 SBOX[256], INV[256];
u8 xt(u8 a) { return u8((a << 1) ^ (a & 0x80 ? 0x1b : 0)); }
u8 gm(u8 a, u8 b) { u8 p = 0; for (int i = 0; i < 8; i++) { if (b & 1) p ^= a; a = xt(a); b >>= 1; } return p; }

// S-box：GF(2^8) 反元素後做仿射轉換
void init() {
    for (int x = 0; x < 256; x++) {
        u8 v = 0;
        if (x) for (int y = 1; y < 256; y++) if (gm(u8(x), u8(y)) == 1) { v = u8(y); break; }
        u8 r = v;
        for (int k = 1; k <= 4; k++) r ^= u8((v << k) | (v >> (8 - k)));
        SBOX[x] = r ^ 0x63;
        INV[SBOX[x]] = u8(x);
    }
}
vector<Block> expand(const Block &key) {
    vector<array<u8, 4>> w(44);
    for (int i = 0; i < 4; i++) for (int j = 0; j < 4; j++) w[i][j] = key[4 * i + j];
    u8 rc = 1;
    for (int i = 4; i < 44; i++) {
        array<u8, 4> t = w[i - 1];
        if (i % 4 == 0) { t = {u8(SBOX[t[1]] ^ rc), SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]}; rc = xt(rc); }
        for (int j = 0; j < 4; j++) w[i][j] = w[i - 4][j] ^ t[j];
    }
    vector<Block> rk(11);
    for (int r = 0; r < 11; r++) for (int i = 0; i < 16; i++) rk[r][i] = w[4 * r + i / 4][i % 4];
    return rk;
}
Block mix(const Block &s, const int m[4][4]) {
    Block o;
    for (int c = 0; c < 4; c++)
        for (int r = 0; r < 4; r++) o[4 * c + r] = gm(s[4 * c], u8(m[r][0])) ^ gm(s[4 * c + 1], u8(m[r][1])) ^ gm(s[4 * c + 2], u8(m[r][2])) ^ gm(s[4 * c + 3], u8(m[r][3]));
    return o;
}
const int MIX[4][4] = {{2, 3, 1, 1}, {1, 2, 3, 1}, {1, 1, 2, 3}, {3, 1, 1, 2}};
const int INV_MIX[4][4] = {{14, 11, 13, 9}, {9, 14, 11, 13}, {13, 9, 14, 11}, {11, 13, 9, 14}};

Block encrypt(Block s, const vector<Block> &rk) {
    for (int i = 0; i < 16; i++) s[i] ^= rk[0][i];
    for (int r = 1; r <= 10; r++) {
        Block t;
        for (auto &b : s) b = SBOX[b];                                            // SubBytes
        for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 + i % 4) % 4)];  // ShiftRows
        s = r < 10 ? mix(t, MIX) : t;                                             // MixColumns
        for (int i = 0; i < 16; i++) s[i] ^= rk[r][i];                            // AddRoundKey
    }
    return s;
}
Block decrypt(Block s, const vector<Block> &rk) {
    for (int i = 0; i < 16; i++) s[i] ^= rk[10][i];
    for (int r = 9; r >= 0; r--) {
        Block t;
        for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 - i % 4 + 4) % 4)];
        for (int i = 0; i < 16; i++) s[i] = INV[t[i]] ^ rk[r][i];
        if (r) s = mix(s, INV_MIX);
    }
    return s;
}
Block parse(const string &h) { Block b; for (int i = 0; i < 16; i++) b[i] = u8(stoi(h.substr(2 * i, 2), nullptr, 16)); return b; }
void pr(const char *label, const Block &b) { printf("%s", label); for (u8 x : b) printf("%02x", x); printf("\n"); }

int main() {
    init();
    string tests[2][2] = {{"000102030405060708090a0b0c0d0e0f", "00112233445566778899aabbccddeeff"}, {"2b7e151628aed2a6abf7158809cf4f3c", "6bc1bee22e409f96e93d7e117393172a"}};
    for (auto &t : tests) {
        auto rk = expand(parse(t[0]));
        Block ct = encrypt(parse(t[1]), rk);
        printf("key  : %s\n", t[0].c_str());
        pr("rk10 : ", rk[10]);
        pr("ct   : ", ct);
        pr("back : ", decrypt(ct, rk));
    }
}
