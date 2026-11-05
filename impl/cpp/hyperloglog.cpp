#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;

uint64_t poly(const string &s, uint64_t base, uint64_t mod) { uint64_t h = 0; for (unsigned char c : s) h = (h * base + c) % mod; return h; }
uint32_t fmix32(uint32_t h) { h ^= h >> 16; h *= 0x85ebca6bu; h ^= h >> 13; h *= 0xc2b2ae35u; h ^= h >> 16; return h; }
int clz32(uint32_t x) { if (!x) return 32; int n = 0; while (!(x & 0x80000000u)) { x <<= 1; n++; } return n; }

struct HyperLogLog {
    int p, m;
    vector<int> R;
    HyperLogLog(int p = 4) : p(p), m(1 << p), R(1 << p) {}
    void add(const string &s) {
        uint32_t x = fmix32(uint32_t(poly(s, 31, 4294967291ull)));
        int j = x >> (32 - p);              // 前 p 位選暫存器
        uint32_t w = x << p;                // 其餘位元
        int rho = min(32 - p + 1, clz32(w) + 1);
        R[j] = max(R[j], rho);
    }
    double estimate() const {
        double z = 0;
        int v = 0;
        for (int r : R) { z += pow(2.0, -r); if (!r) v++; }
        double e = 0.673 * m * m / z;
        if (e <= 2.5 * m && v > 0) e = m * log(double(m) / v);   // 小基數：線性計數校正
        return e;
    }
};

int main() {
    for (int n : {5, 50, 1000, 20000}) {
        HyperLogLog h;
        for (int i = 1; i <= n; i++) h.add("item" + to_string(i));
        for (int i = 1; i <= n; i += 2) h.add("item" + to_string(i));
        printf("n = %d: estimate %.2f, registers", n, h.estimate());
        for (int r : h.R) printf(" %d", r);
        printf("\n");
    }
}
