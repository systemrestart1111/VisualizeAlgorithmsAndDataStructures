#include <ctype.h>
#include <stdio.h>
#include <string.h>

int m26(int x) { return ((x % 26) + 26) % 26; }

/* 2×2 金鑰在 mod 26 的反矩陣；det 與 26 不互質時回傳 0 */
int inverse_key(int K[2][2], int Ki[2][2]) {
    int d = m26(K[0][0] * K[1][1] - K[0][1] * K[1][0]), di = -1;
    for (int x = 1; x < 26; x++) if (d * x % 26 == 1) di = x;
    if (di < 0) return 0;
    Ki[0][0] = m26(K[1][1] * di); Ki[0][1] = m26(-K[0][1] * di);
    Ki[1][0] = m26(-K[1][0] * di); Ki[1][1] = m26(K[0][0] * di);
    return 1;
}

void hill(const char *text, int K[2][2], char *out) {
    int t[128], n = 0;
    for (const char *p = text; *p; p++) if (isalpha((unsigned char)*p)) t[n++] = toupper((unsigned char)*p) - 'A';
    if (n % 2) t[n++] = 23; /* 補 X */
    for (int i = 0; i < n; i += 2)
        for (int r = 0; r < 2; r++) out[i + r] = (char)('A' + m26(K[r][0] * t[i] + K[r][1] * t[i + 1]));
    out[n] = 0;
}

int main(void) {
    int K[2][2] = {{3, 3}, {2, 5}}, Ki[2][2], B[2][2] = {{2, 4}, {6, 8}}, tmp[2][2];
    char c[128], p[128];
    inverse_key(K, Ki);
    printf("K^-1 = [[%d, %d], [%d, %d]]\n", Ki[0][0], Ki[0][1], Ki[1][0], Ki[1][1]);
    hill("HELP ME", K, c);
    printf("cipher: %s\n", c);
    hill(c, Ki, p);
    printf("plain : %s\n", p);
    printf("key [[2,4],[6,8]] invertible: %s\n", inverse_key(B, tmp) ? "True" : "False");
    return 0;
}
