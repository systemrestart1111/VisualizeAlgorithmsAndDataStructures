#include <cstdint>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;
using Bytes = vector<uint8_t>;

const uint32_t K[64] = {
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2};
uint32_t rotr(uint32_t x, int n) { return (x >> n) | (x << (32 - n)); }

// SHA-256（同 sha256.cpp）
Bytes sha256(Bytes p) {
    uint64_t bits = uint64_t(p.size()) * 8;
    p.push_back(0x80);
    while (p.size() % 64 != 56) p.push_back(0);
    for (int i = 7; i >= 0; i--) p.push_back(uint8_t(bits >> (8 * i)));
    uint32_t H[8] = {0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19};
    for (size_t off = 0; off < p.size(); off += 64) {
        uint32_t W[64];
        for (int t = 0; t < 16; t++) W[t] = uint32_t(p[off + 4 * t]) << 24 | uint32_t(p[off + 4 * t + 1]) << 16 | uint32_t(p[off + 4 * t + 2]) << 8 | p[off + 4 * t + 3];
        for (int t = 16; t < 64; t++) W[t] = W[t - 16] + (rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >> 3)) + W[t - 7] + (rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >> 10));
        uint32_t a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
        for (int t = 0; t < 64; t++) {
            uint32_t t1 = h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + W[t];
            uint32_t t2 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c));
            h = g; g = f; f = e; e = d + t1; d = c; c = b; b = a; a = t1 + t2;
        }
        H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
    }
    Bytes out;
    for (uint32_t x : H) for (int j = 24; j >= 0; j -= 8) out.push_back(uint8_t(x >> j));
    return out;
}
Bytes B(const string &s) { return Bytes(s.begin(), s.end()); }

// H((K0 ⊕ opad) ∥ H((K0 ⊕ ipad) ∥ m))
Bytes hmac(Bytes key, const Bytes &msg) {
    if (key.size() > 64) key = sha256(key);
    key.resize(64, 0);
    Bytes in, out;
    for (uint8_t b : key) in.push_back(b ^ 0x36);
    in.insert(in.end(), msg.begin(), msg.end());
    Bytes inner = sha256(in);
    for (uint8_t b : key) out.push_back(b ^ 0x5c);
    out.insert(out.end(), inner.begin(), inner.end());
    return sha256(out);
}

int main() {
    vector<pair<string, string>> tests = {{"key", "The quick brown fox jumps over the lazy dog"}, {"Jefe", "what do ya want for nothing?"}, {string(100, 'k'), "long key is hashed first"}};
    string known[2] = {"f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8", "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843"};
    for (size_t t = 0; t < tests.size(); t++) {
        string hex;
        char buf[3];
        for (uint8_t b : hmac(B(tests[t].first), B(tests[t].second))) { snprintf(buf, 3, "%02x", b); hex += buf; }
        if (t < 2) printf("%s known vector: %s\n", hex.c_str(), hex == known[t] ? "True" : "False");
        else printf("long key: %s\n", hex.c_str());
    }
    Bytes mac = hmac(B("key"), B("transfer 100 to bob"));
    printf("verify original: %s\n", mac == hmac(B("key"), B("transfer 100 to bob")) ? "True" : "False");
    printf("verify tampered: %s\n", mac == hmac(B("key"), B("transfer 900 to bob")) ? "True" : "False");
    printf("verify wrong key: %s\n", mac == hmac(B("kex"), B("transfer 100 to bob")) ? "True" : "False");
}
