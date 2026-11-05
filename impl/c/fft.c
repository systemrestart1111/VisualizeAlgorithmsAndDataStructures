#include <math.h>
#include <stdio.h>

typedef struct { double re, im; } Cx;
static Cx cadd(Cx a, Cx b) { return (Cx){a.re + b.re, a.im + b.im}; }
static Cx csub(Cx a, Cx b) { return (Cx){a.re - b.re, a.im - b.im}; }
static Cx cmul(Cx a, Cx b) { return (Cx){a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re}; }

/* 迭代版 Cooley–Tukey：先做位元反轉排列，再由長度 2、4、8… 逐層做蝴蝶運算，O(n log n) */
void fft(Cx *a, int n, int invert) {
    for (int i = 1, j = 0; i < n; i++) { /* 位元反轉 */
        int bit = n >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j |= bit;
        if (i < j) { Cx t = a[i]; a[i] = a[j]; a[j] = t; }
    }
    for (int len = 2; len <= n; len <<= 1) {
        double ang = 2 * acos(-1.0) / len * (invert ? 1 : -1);
        Cx wlen = {cos(ang), sin(ang)};
        for (int i = 0; i < n; i += len) {
            Cx w = {1, 0};
            for (int k = 0; k < len / 2; k++) {
                Cx u = a[i + k], v = cmul(a[i + k + len / 2], w);
                a[i + k] = cadd(u, v);
                a[i + k + len / 2] = csub(u, v);
                w = cmul(w, wlen);
            }
        }
    }
    if (invert)
        for (int i = 0; i < n; i++) { a[i].re /= n; a[i].im /= n; }
}

/* 在「點值表示」下多項式相乘只需逐點相乘：FFT → 相乘 → 逆 FFT */
int main(void) {
    double A[] = {1, 2, 3}, B[] = {4, 5, 6}; /* 係數由低次到高次 */
    int na = 3, nb = 3, n = 1;
    while (n < na + nb - 1) n <<= 1;
    Cx fa[16] = {{0}}, fb[16] = {{0}};
    for (int i = 0; i < na; i++) fa[i].re = A[i];
    for (int i = 0; i < nb; i++) fb[i].re = B[i];
    fft(fa, n, 0);
    fft(fb, n, 0);
    for (int i = 0; i < n; i++) fa[i] = cmul(fa[i], fb[i]);
    fft(fa, n, 1);
    printf("A x B =");
    for (int i = 0; i < na + nb - 1; i++) printf(" %ld", lround(fa[i].re));
    printf("\n");
    return 0;
}
