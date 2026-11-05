#include <ctype.h>
#include <stdio.h>
#include <string.h>

/* 依（字母, 欄號）穩定排序，重複字母保持出現順序（插入排序） */
static void col_order(const char *key, int *order) {
    int w = (int)strlen(key);
    for (int i = 0; i < w; i++) {
        int j = i;
        while (j > 0 && key[order[j - 1]] > key[i]) { order[j] = order[j - 1]; j--; }
        order[j] = i;
    }
}

void encrypt(const char *text, const char *key, char *out) {
    char t[256];
    int n = 0, w = (int)strlen(key), order[32], k = 0;
    for (const char *p = text; *p; p++) if (isalpha((unsigned char)*p)) t[n++] = (char)toupper((unsigned char)*p);
    while (n % w) t[n++] = 'X';
    col_order(key, order);
    for (int i = 0; i < w; i++)
        for (int r = 0; r < n / w; r++) out[k++] = t[r * w + order[i]];
    out[k] = 0;
}

void decrypt(const char *c, const char *key, char *out) {
    int n = (int)strlen(c), w = (int)strlen(key), order[32], k = 0;
    col_order(key, order);
    for (int i = 0; i < w; i++)
        for (int r = 0; r < n / w; r++) out[r * w + order[i]] = c[k++];
    out[n] = 0;
}

int main(void) {
    char c[256], p[256];
    encrypt("WE ARE DISCOVERED FLEE AT ONCE", "ZEBRAS", c);
    printf("cipher: %s\n", c);
    decrypt(c, "ZEBRAS", p);
    printf("plain : %s\n", p);
    encrypt("HELLOWORLD", "BANANA", c);
    printf("dup key: %s\n", c);
    return 0;
}
