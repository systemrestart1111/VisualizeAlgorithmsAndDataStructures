#include <stdio.h>
#include <string.h>

/* 關鍵字字母決定位移；非字母原樣輸出且不消耗關鍵字位置 */
void vigenere(const char *in, const char *key, int decrypt, char *out) {
    int kl = (int)strlen(key), j = 0;
    size_t n = strlen(in);
    for (size_t i = 0; i < n; i++) {
        char ch = in[i];
        int isU = ch >= 'A' && ch <= 'Z', isL = ch >= 'a' && ch <= 'z';
        if (!isU && !isL) { out[i] = ch; continue; }
        char kc = key[j % kl];
        int k = (kc >= 'a' ? kc - 'a' : kc - 'A');
        if (decrypt) k = 26 - k;
        char base = isU ? 'A' : 'a';
        out[i] = (char)(base + (ch - base + k) % 26);
        j++;
    }
    out[n] = 0;
}

int main(void) {
    char c[64], p[64];
    vigenere("ATTACK AT DAWN!", "LEMON", 0, c);
    printf("cipher: %s\n", c);
    vigenere(c, "LEMON", 1, p);
    printf("plain : %s\n", p);
    vigenere("Hello, World", "key", 0, c);
    printf("mixed : %s\n", c);
    return 0;
}
