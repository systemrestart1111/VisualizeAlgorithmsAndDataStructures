#include <stdio.h>

/* GF(2^8) 乘法：逐位相加（XOR），a 每次乘 x（xtime），溢出時對 0x11B 約化 */
int gf_mul(int a, int b) {
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

/* a^254 = a^-1（a ≠ 0）；0 沒有反元素，回傳 -1 */
int gf_inv(int a) {
    if (!a) return -1;
    int r = 1;
    for (int e = 254; e; e >>= 1) {
        if (e & 1) r = gf_mul(r, a);
        a = gf_mul(a, a);
    }
    return r;
}

int main(void) {
    printf("0x57 + 0x83 = 0x%02X\n", 0x57 ^ 0x83);
    printf("0x57 * 0x83 = 0x%02X\n", gf_mul(0x57, 0x83));
    printf("0x57 * 0x13 = 0x%02X\n", gf_mul(0x57, 0x13));
    int inv = gf_inv(0x57);
    printf("inv(0x57) = 0x%02X, check = 0x%02X\n", inv, gf_mul(0x57, inv));
    printf("inv(0x00) = none\n");
    return 0;
}
