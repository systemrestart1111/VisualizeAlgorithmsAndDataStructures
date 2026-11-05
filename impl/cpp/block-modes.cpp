#include <cstdio>
#include <string>
#include <vector>
using namespace std;
using u8 = unsigned char;
using Bytes = vector<u8>;

// 以自行實作的 AES-128 區塊加密為基礎（同 aes.cpp）
u8 SBOX[256], INV[256];
u8 xt(u8 a) { return u8((a << 1) ^ (a & 0x80 ? 0x1b : 0)); }
u8 gm(u8 a, u8 b) { u8 p = 0; for (int i = 0; i < 8; i++) { if (b & 1) p ^= a; a = xt(a); b >>= 1; } return p; }
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
Bytes expand(const Bytes &key) {
    Bytes rk(176);
    for (int i = 0; i < 16; i++) rk[i] = key[i];
    u8 rc = 1;
    for (int i = 4; i < 44; i++) {
        u8 t[4] = {rk[4 * i - 4], rk[4 * i - 3], rk[4 * i - 2], rk[4 * i - 1]};
        if (i % 4 == 0) { u8 a = t[0]; t[0] = SBOX[t[1]] ^ rc; t[1] = SBOX[t[2]]; t[2] = SBOX[t[3]]; t[3] = SBOX[a]; rc = xt(rc); }
        for (int j = 0; j < 4; j++) rk[4 * i + j] = rk[4 * (i - 4) + j] ^ t[j];
    }
    return rk;
}
const int MIX[4][4] = {{2, 3, 1, 1}, {1, 2, 3, 1}, {1, 1, 2, 3}, {3, 1, 1, 2}};
const int INV_MIX[4][4] = {{14, 11, 13, 9}, {9, 14, 11, 13}, {13, 9, 14, 11}, {11, 13, 9, 14}};
Bytes mix(const Bytes &s, const int m[4][4]) {
    Bytes o(16);
    for (int c = 0; c < 4; c++)
        for (int r = 0; r < 4; r++) o[4 * c + r] = gm(s[4 * c], u8(m[r][0])) ^ gm(s[4 * c + 1], u8(m[r][1])) ^ gm(s[4 * c + 2], u8(m[r][2])) ^ gm(s[4 * c + 3], u8(m[r][3]));
    return o;
}
Bytes enc(Bytes s, const Bytes &rk) {
    for (int i = 0; i < 16; i++) s[i] ^= rk[i];
    for (int r = 1; r <= 10; r++) {
        Bytes t(16);
        for (auto &b : s) b = SBOX[b];
        for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 + i % 4) % 4)];
        s = r < 10 ? mix(t, MIX) : t;
        for (int i = 0; i < 16; i++) s[i] ^= rk[16 * r + i];
    }
    return s;
}
Bytes dec(Bytes s, const Bytes &rk) {
    for (int i = 0; i < 16; i++) s[i] ^= rk[160 + i];
    for (int r = 9; r >= 0; r--) {
        Bytes t(16);
        for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 - i % 4 + 4) % 4)];
        for (int i = 0; i < 16; i++) s[i] = INV[t[i]] ^ rk[16 * r + i];
        if (r) s = mix(s, INV_MIX);
    }
    return s;
}
// PKCS#7 填充後，每塊先與前一個密文區塊 XOR 再加密
Bytes cbcEncrypt(Bytes pt, const Bytes &rk, const Bytes &iv, bool pad = true) {
    if (pad) { int k = 16 - pt.size() % 16; pt.insert(pt.end(), k, u8(k)); }
    Bytes prev = iv, out;
    for (size_t i = 0; i < pt.size(); i += 16) {
        for (int j = 0; j < 16; j++) prev[j] ^= pt[i + j];
        prev = enc(prev, rk);
        out.insert(out.end(), prev.begin(), prev.end());
    }
    return out;
}
Bytes cbcDecrypt(const Bytes &ct, const Bytes &rk, const Bytes &iv) {
    Bytes prev = iv, out;
    for (size_t i = 0; i < ct.size(); i += 16) {
        Bytes blk(ct.begin() + i, ct.begin() + i + 16), p = dec(blk, rk);
        for (int j = 0; j < 16; j++) out.push_back(p[j] ^ prev[j]);
        prev = blk;
    }
    out.resize(out.size() - out.back());
    return out;
}
// 金鑰流 = AES(nonce ∥ 計數器)，與資料 XOR；加解密相同，不需填充
Bytes ctr(const Bytes &in, const Bytes &rk, const Bytes &nonce) {
    Bytes out;
    for (size_t i = 0; i < in.size(); i += 16) {
        Bytes cb(nonce.begin(), nonce.begin() + 8);
        unsigned long long c = i / 16;
        for (int j = 7; j >= 0; j--) cb.push_back(u8(c >> (8 * j)));
        Bytes ks = enc(cb, rk);
        for (size_t j = 0; j < 16 && i + j < in.size(); j++) out.push_back(in[i + j] ^ ks[j]);
    }
    return out;
}
Bytes parse(const string &h) { Bytes b; for (size_t i = 0; i < h.size(); i += 2) b.push_back(u8(stoi(h.substr(i, 2), nullptr, 16))); return b; }
void pr(const char *label, const Bytes &b) { printf("%s", label); for (u8 x : b) printf("%02x", x); printf("\n"); }

int main() {
    init();
    Bytes rk = expand(parse("2b7e151628aed2a6abf7158809cf4f3c")), iv = parse("000102030405060708090a0b0c0d0e0f");
    pr("CBC SP800-38A: ", cbcEncrypt(parse("6bc1bee22e409f96e93d7e117393172a"), rk, iv, false));
    string s = "Block modes chain AES blocks!";
    Bytes pt(s.begin(), s.end());
    Bytes c = cbcEncrypt(pt, rk, iv);
    pr("CBC: ", c);
    Bytes b = cbcDecrypt(c, rk, iv);
    printf("CBC back: %s\n", string(b.begin(), b.end()).c_str());
    c = ctr(pt, rk, iv);
    pr("CTR: ", c);
    b = ctr(c, rk, iv);
    printf("CTR back: %s\n", string(b.begin(), b.end()).c_str());
}
