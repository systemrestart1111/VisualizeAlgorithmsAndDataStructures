#include <stdio.h>

/* 擴展歐幾里得求 e 在 mod φ 的反元素 */
long long inverse(long long e, long long phi) {
    long long r0 = e, r1 = phi, s0 = 1, s1 = 0;
    while (r1) {
        long long q = r0 / r1, t;
        t = r0 - q * r1; r0 = r1; r1 = t;
        t = s0 - q * s1; s0 = s1; s1 = t;
    }
    return ((s0 % phi) + phi) % phi;
}

/* 平方乘法：由高位到低位 */
long long mod_pow(long long b, long long e, long long m) {
    long long r = 1;
    int top = 62;
    while (top >= 0 && !((e >> top) & 1)) top--;
    for (int i = top; i >= 0; i--) {
        r = r * r % m;
        if ((e >> i) & 1) r = r * b % m;
    }
    return r;
}

int main(void) {
    long long p = 61, q = 53, e = 17, n = p * q, phi = (p - 1) * (q - 1), d = inverse(e, phi);
    printf("n = %lld, phi = %lld, e = %lld, d = %lld\n", n, phi, e, d);
    long long msgs[3] = {65, 66, 67}, cs[3];
    for (int i = 0; i < 3; i++) cs[i] = mod_pow(msgs[i], e, n);
    printf("cipher: [%lld, %lld, %lld]\n", cs[0], cs[1], cs[2]);
    printf("plain : [%lld, %lld, %lld]\n", mod_pow(cs[0], d, n), mod_pow(cs[1], d, n), mod_pow(cs[2], d, n));
    return 0;
}
