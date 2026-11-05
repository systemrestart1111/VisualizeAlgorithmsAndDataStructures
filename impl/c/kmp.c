#include <stdio.h>
#include <string.h>

/* lps[i] = p[0..i] 最長的「相同前綴與後綴」長度（不含整個字串） */
void prefix_function(const char *p, int m, int *lps) {
    lps[0] = 0;
    for (int i = 1, k = 0; i < m; i++) {
        while (k && p[i] != p[k]) k = lps[k - 1];
        if (p[i] == p[k]) k++;
        lps[i] = k;
    }
}

/* 失配時不回退文字指標，而是依 lps 把樣式滑到下一個可能的位置 */
int main(void) {
    const char *t = "ABABDABACDABABCABAB", *p = "ABABCABAB";
    int n = (int)strlen(t), m = (int)strlen(p), lps[64];
    prefix_function(p, m, lps);
    printf("lps:");
    for (int i = 0; i < m; i++) printf(" %d", lps[i]);
    printf("\nmatches at:");
    for (int i = 0, k = 0; i < n; i++) {
        while (k && t[i] != p[k]) k = lps[k - 1];
        if (t[i] == p[k]) k++;
        if (k == m) { printf(" %d", i - m + 1); k = lps[k - 1]; }
    }
    printf("\n");
    return 0;
}
