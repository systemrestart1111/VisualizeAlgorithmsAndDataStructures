#include <stdio.h>
#include <string.h>

int gcd(int a, int b) { return b ? gcd(b, a % b) : a; }
int inv26(int a) { for (int x = 1; x < 26; x++) if (a * x % 26 == 1) return x; return -1; }

/* E(x) = (a·x + b) mod 26；D(y) = a⁻¹·(y − b) mod 26；a 必須與 26 互質，否則回傳 0 */
int affine(const char *in, int a, int b, int decrypt, char *out) {
    if (gcd(a, 26) != 1) return 0;
    int ai = inv26(a);
    size_t n = strlen(in);
    for (size_t i = 0; i < n; i++) {
        char ch = in[i];
        int up = ch >= 'A' && ch <= 'Z', low = ch >= 'a' && ch <= 'z';
        if (!up && !low) { out[i] = ch; continue; }
        char base = up ? 'A' : 'a';
        int x = ch - base;
        int y = decrypt ? ((ai * (x - b)) % 26 + 26) % 26 : (a * x + b) % 26;
        out[i] = (char)(base + y);
    }
    out[n] = 0;
    return 1;
}

int main(void) {
    char c[64], p[64];
    affine("AFFINE CIPHER", 5, 8, 0, c);
    printf("cipher: %s\n", c);
    affine(c, 5, 8, 1, p);
    printf("plain : %s\n", p);
    if (!affine("TEST", 13, 1, 0, c)) printf("a=13 rejected\n");
    return 0;
}
