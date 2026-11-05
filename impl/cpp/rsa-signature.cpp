#include <cstdint>
#include <cstdio>
#include <cstring>
#include <string>
#include <vector>
using namespace std;
using u8 = uint8_t;
using u32 = uint32_t;
using u64 = unsigned long long;
using Bytes = vector<u8>;

// ---------- SHA-256（同 sha256.cpp） ----------
const u32 K[64] = {
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2};
u32 rotr(u32 x, int n) { return (x >> n) | (x << (32 - n)); }
Bytes sha256(Bytes p) {
    u64 bits = u64(p.size()) * 8;
    p.push_back(0x80);
    while (p.size() % 64 != 56) p.push_back(0);
    for (int i = 7; i >= 0; i--) p.push_back(u8(bits >> (8 * i)));
    u32 H[8] = {0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19};
    for (size_t off = 0; off < p.size(); off += 64) {
        u32 W[64];
        for (int t = 0; t < 16; t++) W[t] = u32(p[off + 4 * t]) << 24 | u32(p[off + 4 * t + 1]) << 16 | u32(p[off + 4 * t + 2]) << 8 | p[off + 4 * t + 3];
        for (int t = 16; t < 64; t++) W[t] = W[t - 16] + (rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >> 3)) + W[t - 7] + (rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >> 10));
        u32 a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
        for (int t = 0; t < 64; t++) {
            u32 t1 = h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + W[t];
            u32 t2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c));
            h = g; g = f; f = e; e = d + t1; d = c; c = b; b = a; a = t1 + t2;
        }
        H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
    }
    Bytes out;
    for (u32 x : H) for (int j = 24; j >= 0; j -= 8) out.push_back(u8(x >> j));
    return out;
}
Bytes cat(Bytes a, const Bytes &b) { a.insert(a.end(), b.begin(), b.end()); return a; }

// ---------- 512 位元大數（17 個 32 位元字，低位在前） ----------
struct BN {
    static const int NL = 17;
    u32 v[NL] = {0};
    static BN hex(const string &h) {
        BN a;
        for (size_t i = 0; i < h.size(); i++) {
            char c = h[h.size() - 1 - i];
            a.v[i / 8] |= u32(c <= '9' ? c - '0' : c - 'a' + 10) << (4 * (i % 8));
        }
        return a;
    }
    static BN bytes(const Bytes &b) { BN a; for (size_t i = 0; i < b.size(); i++) a.v[i / 4] |= u32(b[b.size() - 1 - i]) << (8 * (i % 4)); return a; }
    Bytes toBytes(int n) const { Bytes b(n); for (int i = 0; i < n; i++) b[n - 1 - i] = u8(v[i / 4] >> (8 * (i % 4))); return b; }
    int cmp(const BN &o) const { for (int i = NL - 1; i >= 0; i--) if (v[i] != o.v[i]) return v[i] > o.v[i] ? 1 : -1; return 0; }
    void sub(const BN &o) { u64 br = 0; for (int i = 0; i < NL; i++) { u64 t = u64(v[i]) - o.v[i] - br; v[i] = u32(t); br = (t >> 32) & 1; } }
    void add(const BN &o) { u64 c = 0; for (int i = 0; i < NL; i++) { c += u64(v[i]) + o.v[i]; v[i] = u32(c); c >>= 32; } }
    void shl1() { for (int i = NL - 1; i > 0; i--) v[i] = (v[i] << 1) | (v[i - 1] >> 31); v[0] <<= 1; }
    int bit(int i) const { return (v[i / 32] >> (i % 32)) & 1; }
};
// a·b mod n：由高位到低位「加倍再加」，中間值始終 < 2n
BN mulmod(const BN &a, const BN &b, const BN &n) {
    BN t;
    for (int i = BN::NL * 32 - 1; i >= 0; i--) {
        t.shl1();
        if (t.cmp(n) >= 0) t.sub(n);
        if (b.bit(i)) { t.add(a); if (t.cmp(n) >= 0) t.sub(n); }
    }
    return t;
}
BN powmod(const BN &base, const BN &e, const BN &n) {
    BN x;
    x.v[0] = 1;
    int top = BN::NL * 32 - 1;
    while (top >= 0 && !e.bit(top)) top--;
    for (int i = top; i >= 0; i--) {
        x = mulmod(x, x, n);
        if (e.bit(i)) x = mulmod(x, base, n);
    }
    return x;
}

// ---------- RSA-PSS（SHA-256、MGF1、salt 16 位元組） ----------
const int EM_LEN = 64, H_LEN = 32, S_LEN = 16, PS_LEN = EM_LEN - S_LEN - H_LEN - 2;
Bytes mgf1(const Bytes &seed, int n) {
    Bytes out;
    for (u32 c = 0; (int)out.size() < n; c++) out = cat(out, sha256(cat(seed, {u8(c >> 24), u8(c >> 16), u8(c >> 8), u8(c)})));
    out.resize(n);
    return out;
}
Bytes B(const string &s) { return Bytes(s.begin(), s.end()); }
Bytes pssHash(const string &msg, const Bytes &salt) { return sha256(cat(cat(Bytes(8, 0), sha256(B(msg))), salt)); }
Bytes pssEncode(const string &msg, const Bytes &salt) {
    Bytes h = pssHash(msg, salt), db(PS_LEN, 0), mask = mgf1(h, EM_LEN - H_LEN - 1);
    db.push_back(1);
    db = cat(db, salt);
    for (size_t i = 0; i < db.size(); i++) db[i] ^= mask[i];
    db[0] &= 0x7f;
    db = cat(db, h);
    db.push_back(0xbc);
    return db;
}
bool verify(const string &msg, const BN &s, const BN &n, const BN &e) {
    if (s.cmp(n) >= 0) return false;
    Bytes em = powmod(s, e, n).toBytes(EM_LEN);
    if (em[EM_LEN - 1] != 0xbc || (em[0] & 0x80)) return false;
    Bytes h(em.begin() + EM_LEN - H_LEN - 1, em.end() - 1), mask = mgf1(h, EM_LEN - H_LEN - 1);
    Bytes db(em.begin(), em.begin() + EM_LEN - H_LEN - 1);
    for (size_t i = 0; i < db.size(); i++) db[i] ^= mask[i];
    db[0] &= 0x7f;
    for (int i = 0; i < PS_LEN; i++) if (db[i]) return false;
    if (db[PS_LEN] != 1) return false;
    return pssHash(msg, Bytes(db.end() - S_LEN, db.end())) == h;
}
void pr(const char *label, const Bytes &b) { printf("%s", label); for (u8 x : b) printf("%02x", x); printf("\n"); }

int main() {
    BN N = BN::hex("a65f7b022bd33ee0c5644be19caed71c0e691cc10d8a6f57576deda07e66082f64fe2af43a24e28ccbf95a14c9494a5182f48935586db21639efb855e79237fb");
    BN D = BN::hex("5cadfbbc2de5b3b54ac0a074c1efb3ecf12a24d6765093cdb7ea88e14b0853ae0cf5f81b24b065ad8f8f4ab699525cc9f1d1bda8ed9d743d33bd50f22191bc61");
    BN N2 = BN::hex("b0d12b4fc3f44629d53fa2ea439095d3efee1a84c32ce57e0a9c921f42c935e9473b1c9f37efbe3b3e8ca504b8536e9123de2d6a38b71ee7092fb5cfb91af663");
    BN E = BN::hex("10001");
    Bytes salt;
    u64 seed = 42;
    for (int i = 0; i < S_LEN; i++) { seed = seed * 48271 % 2147483647; salt.push_back(u8(seed % 256)); }
    string msg = "Pay Bob 100 coins";
    Bytes em = pssEncode(msg, salt);
    BN sig = powmod(BN::bytes(em), D, N);
    pr("mHash: ", sha256(B(msg)));
    pr("salt : ", salt);
    pr("EM   : ", em);
    pr("sig  : ", sig.toBytes(EM_LEN));
    printf("verify original : %s\n", verify(msg, sig, N, E) ? "True" : "False");
    printf("verify tampered : %s\n", verify("Pay Bob 900 coins", sig, N, E) ? "True" : "False");
    printf("verify wrong key: %s\n", verify(msg, sig, N2, E) ? "True" : "False");
}
