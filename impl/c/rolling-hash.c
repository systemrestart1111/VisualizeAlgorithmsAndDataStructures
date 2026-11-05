#include <stdio.h>
#include <string.h>

#define B 131
#define M 1000003

/* 前綴雜湊：h[i] = s[0..i) 的多項式雜湊；任意子字串 s[l..r) 的雜湊 = h[r] - h[l]·B^(r-l)，O(1) 取得 */
int main(void) {
    const char *s = "banana_bandana";
    int n = (int)strlen(s), L = 3;
    long long h[64] = {0}, pw[64] = {1};
    for (int i = 0; i < n; i++) {
        h[i + 1] = (h[i] * B + (unsigned char)s[i]) % M;
        pw[i + 1] = pw[i] * B % M;
    }
    long long hv[64];
    for (int i = 0; i + L <= n; i++) hv[i] = ((h[i + L] - h[i] * pw[L]) % M + M) % M;
    printf("substrings of length %d appearing more than once:\n", L);
    int done[64] = {0};
    for (int i = 0; i + L <= n; i++) {
        if (done[i]) continue;
        int pos[64], k = 0, same = 1;
        for (int j = i; j + L <= n; j++)
            if (hv[j] == hv[i]) { pos[k++] = j; done[j] = 1; if (strncmp(s + i, s + j, L)) same = 0; } /* 再確認字串真的相同 */
        if (k > 1 && same) {
            printf("  '%.*s' hash=%lld at", L, s + i, hv[i]);
            for (int t = 0; t < k; t++) printf(" %d", pos[t]);
            printf("\n");
        }
    }
    return 0;
}
