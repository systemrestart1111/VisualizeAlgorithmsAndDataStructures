#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static char S[64];
static int n;
/* 比較兩個循環旋轉 */
static int cmp(const void *a, const void *b) {
    int i = *(const int *)a, j = *(const int *)b;
    for (int k = 0; k < n; k++) { char x = S[(i + k) % n], y = S[(j + k) % n]; if (x != y) return x - y; }
    return 0;
}
/* 加上終止符 $，排序所有循環旋轉，取最後一欄 */
static void bwt(const char *s, char *L) {
    sprintf(S, "%s$", s);
    n = (int)strlen(S);
    int idx[64];
    for (int i = 0; i < n; i++) idx[i] = i;
    qsort(idx, n, sizeof(int), cmp);
    for (int i = 0; i < n; i++) L[i] = S[(idx[i] + n - 1) % n];
    L[n] = 0;
}
/* LF 映射：L 中第 k 個 c 對應 F 中第 k 個 c；從 $ 所在列往回讀 */
static void inverse(const char *L, char *out) {
    int m = (int)strlen(L), cnt[128] = {0}, first[128], seen[128] = {0}, LF[64], row = 0;
    for (int i = 0; i < m; i++) cnt[(int)L[i]]++;
    for (int c = 0, acc = 0; c < 128; c++) { first[c] = acc; acc += cnt[c]; }
    for (int i = 0; i < m; i++) { LF[i] = first[(int)L[i]] + seen[(int)L[i]]; seen[(int)L[i]]++; if (L[i] == '$') row = i; }
    for (int k = m - 2; k >= 0; k--) { row = LF[row]; out[k] = L[row]; }
    out[m - 1] = 0;
}

int main(void) {
    const char *tests[4] = {"banana", "abracadabra", "mississippi", "aaaa"};
    char L[64], back[64];
    for (int t = 0; t < 4; t++) {
        bwt(tests[t], L);
        inverse(L, back);
        printf("%s: bwt %s, inverse %s\n", tests[t], L, back);
    }
    return 0;
}
