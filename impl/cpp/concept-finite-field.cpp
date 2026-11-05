#include <cstdio>

// GF(2^8) 乘法：逐位相加（XOR），a 每次乘 x（xtime），溢出時對 0x11B 約化
int gfMul(int a, int b) {
    int p = 0;
    for (int i = 0; i < 8; i++) {
        if (b & 1) p ^= a;
        int hi = a & 0x80;
        a = (a << 1) & 0xFF;
        if (hi) a ^= 0x1B;
        b >>= 1;
    }
    return p;
}

// a^254 = a^-1（a ≠ 0）；0 沒有反元素，回傳 -1
int gfInv(int a) {
    if (!a) return -1;
    int r = 1;
    for (int e = 254; e; e >>= 1) {
        if (e & 1) r = gfMul(r, a);
        a = gfMul(a, a);
    }
    return r;
}

int main() {
    std::printf("0x57 + 0x83 = 0x%02X\n", 0x57 ^ 0x83);
    std::printf("0x57 * 0x83 = 0x%02X\n", gfMul(0x57, 0x83));
    std::printf("0x57 * 0x13 = 0x%02X\n", gfMul(0x57, 0x13));
    int inv = gfInv(0x57);
    std::printf("inv(0x57) = 0x%02X, check = 0x%02X\n", inv, gfMul(0x57, inv));
    std::printf("inv(0x00) = %s\n", gfInv(0) < 0 ? "none" : "?");
}
