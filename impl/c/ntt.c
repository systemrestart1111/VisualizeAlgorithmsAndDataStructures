#include <stdio.h>

typedef long long ll;
static ll pw(ll b, ll e, ll m) { ll r = 1; b %= m; while (e) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; } return r; }

/* 位元反轉 + 蝴蝶；單位根 w = g^((p−1)/len)，逆轉換用 w⁻¹ 並乘 n⁻¹ */
static void ntt(ll *a, int n, int invert, ll p, ll g) {
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j |= bit;
        if (i < j) { ll t = a[i]; a[i] = a[j]; a[j] = t; }
    }
    for (int len = 2; len <= n; len <<= 1) {
        ll w = pw(g, (p - 1) / len, p);
        if (invert) w = pw(w, p - 2, p);
        for (int i = 0; i < n; i += len) {
            ll wj = 1;
            for (int k = 0; k < len / 2; k++) {
                ll u = a[i + k], v = a[i + k + len / 2] * wj % p;
                a[i + k] = (u + v) % p;
                a[i + k + len / 2] = (u - v + p) % p;
                wj = wj * w % p;
            }
        }
    }
    if (invert) { ll ninv = pw(n, p - 2, p); for (int i = 0; i < n; i++) a[i] = a[i] * ninv % p; }
}

static void run(const ll *x, int nx, const ll *y, int ny, ll p, ll g) {
    int n = 1, len = nx + ny - 1;
    while (n < len) n <<= 1;
    if ((p - 1) % n) { printf("mod %lld: length %d padded size does not divide p-1, cannot transform\n", p, len); return; }
    ll A[64] = {0}, B[64] = {0}, C[64], N[64] = {0};
    for (int i = 0; i < nx; i++) A[i] = (x[i] % p + p) % p;
    for (int i = 0; i < ny; i++) B[i] = (y[i] % p + p) % p;
    ntt(A, n, 0, p, g);
    ntt(B, n, 0, p, g);
    for (int i = 0; i < n; i++) C[i] = A[i] * B[i] % p;
    ntt(C, n, 1, p, g);
    for (int i = 0; i < nx; i++) for (int j = 0; j < ny; j++) N[i + j] = (N[i + j] + ((x[i] % p + p) % p) * ((y[j] % p + p) % p)) % p;
    int same = 1;
    printf("mod %lld:", p);
    for (int i = 0; i < len; i++) { printf(" %lld", C[i]); if (C[i] != N[i]) same = 0; }
    printf(" (naive match %s)\n", same ? "True" : "False");
}

int main(void) {
    ll s = 2024, big1[10], big2[7], ones[10];
    for (int i = 0; i < 10; i++) { s = s * 48271 % 2147483647; big1[i] = s % 998244353; }
    for (int i = 0; i < 7; i++) { s = s * 48271 % 2147483647; big2[i] = s % 998244353; }
    for (int i = 0; i < 10; i++) ones[i] = 1;
    ll a1[4] = {1, 2, 3, 4}, b1[3] = {5, 6, 7}, a3[3] = {3, -1, 4}, b3[5] = {1, 5, 9, 2, 6};
    run(a1, 4, b1, 3, 998244353, 3);
    run(a1, 4, b1, 3, 17, 3);
    run(a3, 3, b3, 5, 97, 5);
    run(big1, 10, big2, 7, 998244353, 3);
    run(ones, 10, ones, 10, 17, 3);
    return 0;
}
