#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int n, k, rnk[64], tmp[64];

static int cmp_key(int a, int b) {
    if (rnk[a] != rnk[b]) return rnk[a] - rnk[b];
    int ra = a + k < n ? rnk[a + k] : -1, rb = b + k < n ? rnk[b + k] : -1;
    return ra - rb;
}
static int cmp(const void *x, const void *y) { return cmp_key(*(const int *)x, *(const int *)y); }

/* 倍增法：先依第 1 個字元排名，之後每輪用 (前 k 字元排名, 接下來 k 字元排名) 排序，比較長度每輪加倍 */
int main(void) {
    const char *s = "banana$";
    int sa[64];
    n = (int)strlen(s);
    for (int i = 0; i < n; i++) { sa[i] = i; rnk[i] = (unsigned char)s[i]; }
    for (k = 1;; k *= 2) {
        qsort(sa, n, sizeof(int), cmp);
        tmp[sa[0]] = 0;
        for (int j = 1; j < n; j++) tmp[sa[j]] = tmp[sa[j - 1]] + (cmp_key(sa[j - 1], sa[j]) != 0);
        memcpy(rnk, tmp, n * sizeof(int));
        printf("k=%d: ranks", k);
        for (int i = 0; i < n; i++) printf(" %d", rnk[i]);
        printf("\n");
        if (rnk[sa[n - 1]] == n - 1) break; /* 排名全部不同就完成 */
    }
    printf("SA:");
    for (int i = 0; i < n; i++) printf(" %d", sa[i]);
    printf("\n");
    for (int i = 0; i < n; i++) printf("%2d %s\n", sa[i], s + sa[i]);
    return 0;
}
