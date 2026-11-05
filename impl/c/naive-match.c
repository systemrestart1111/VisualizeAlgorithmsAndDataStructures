#include <stdio.h>
#include <string.h>

/* 每個起點都從頭逐字比較；不相符就把樣式右移一格 */
int main(void) {
    const char *t = "AABAACAADAABAABA", *p = "AABA";
    int n = (int)strlen(t), m = (int)strlen(p), comparisons = 0;
    printf("matches at:");
    for (int s = 0; s + m <= n; s++) {
        int j = 0;
        while (j < m) {
            comparisons++;
            if (t[s + j] != p[j]) break;
            j++;
        }
        if (j == m) printf(" %d", s);
    }
    printf("\ncomparisons = %d\n", comparisons);
    return 0;
}
