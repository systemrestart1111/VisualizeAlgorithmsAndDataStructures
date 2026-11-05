#include <stdio.h>
#include <string.h>

/* 依序走過每一軌，收集落在該軌的位置，得到讀出順序 */
static void order_of(int n, int rails, int *order) {
    int row[256], r = 0, d = 1, k = 0;
    for (int i = 0; i < n; i++) {
        row[i] = r;
        if (rails > 1) { if (r == 0) d = 1; else if (r == rails - 1) d = -1; r += d; }
    }
    for (int rr = 0; rr < rails; rr++)
        for (int i = 0; i < n; i++) if (row[i] == rr) order[k++] = i;
}

void encrypt(const char *t, int rails, char *out) {
    int n = (int)strlen(t), order[256];
    order_of(n, rails, order);
    for (int k = 0; k < n; k++) out[k] = t[order[k]];
    out[n] = 0;
}

void decrypt(const char *c, int rails, char *out) {
    int n = (int)strlen(c), order[256];
    order_of(n, rails, order);
    for (int k = 0; k < n; k++) out[order[k]] = c[k];
    out[n] = 0;
}

int main(void) {
    char c[64], p[64];
    encrypt("WEAREDISCOVERED", 3, c);
    printf("cipher: %s\n", c);
    decrypt(c, 3, p);
    printf("plain : %s\n", p);
    encrypt("HELLO", 1, c);
    printf("1 rail: %s\n", c);
    encrypt("AB", 5, c);
    decrypt(c, 5, p);
    printf("short : %s %s\n", c, p);
    return 0;
}
