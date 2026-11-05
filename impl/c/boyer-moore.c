#include <stdio.h>
#include <string.h>

/* 好後綴規則：已比對成功的後綴，在樣式中前一次出現的位置（或與前綴重疊的部分）決定可安全移動的距離 */
void good_suffix_table(const char *p, int m, int *shift) {
    int border[64], i = m, j = m + 1;
    for (int k = 0; k <= m; k++) shift[k] = 0;
    border[i] = j;
    while (i > 0) {
        while (j <= m && p[i - 1] != p[j - 1]) {
            if (shift[j] == 0) shift[j] = j - i;
            j = border[j];
        }
        border[--i] = --j;
    }
    j = border[0];
    for (i = 0; i <= m; i++) {
        if (shift[i] == 0) shift[i] = j;
        if (i == j) j = border[j];
    }
}

/* 由右往左比較；失配時取「壞字元規則」與「好後綴規則」中移得較遠的那個 */
int main(void) {
    const char *t = "HERE IS A SIMPLE EXAMPLE", *p = "EXAMPLE";
    int n = (int)strlen(t), m = (int)strlen(p), last[256], gs[64];
    for (int c = 0; c < 256; c++) last[c] = -1;
    for (int i = 0; i < m; i++) last[(unsigned char)p[i]] = i; /* 壞字元：該字元在樣式中最後出現的位置 */
    good_suffix_table(p, m, gs);
    int matches[64], nm = 0;
    printf("alignments tried:");
    for (int s = 0; s <= n - m;) {
        printf(" %d", s);
        int j = m - 1;
        while (j >= 0 && p[j] == t[s + j]) j--;
        if (j < 0) { matches[nm++] = s; s += gs[0]; }
        else {
            int bc = j - last[(unsigned char)t[s + j]];
            s += gs[j + 1] > bc ? gs[j + 1] : bc;
        }
    }
    printf("\nmatches at:");
    for (int i = 0; i < nm; i++) printf(" %d", matches[i]);
    printf("\n");
    return 0;
}
