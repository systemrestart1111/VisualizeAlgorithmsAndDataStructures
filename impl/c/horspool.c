#include <stdio.h>
#include <string.h>

/* 只用「視窗最右端那個文字字元」決定移動量：shift[c] = 它在樣式（不含最後一字）中最後出現處到結尾的距離 */
int main(void) {
    const char *t = "JIM SAW ME IN A BARBERSHOP", *p = "BARBER";
    int n = (int)strlen(t), m = (int)strlen(p), shift[256], matches[64], nm = 0;
    for (int c = 0; c < 256; c++) shift[c] = m;
    for (int i = 0; i < m - 1; i++) shift[(unsigned char)p[i]] = m - 1 - i;
    printf("alignments tried:");
    for (int s = 0; s <= n - m; s += shift[(unsigned char)t[s + m - 1]]) {
        printf(" %d", s);
        int j = m - 1;
        while (j >= 0 && p[j] == t[s + j]) j--;
        if (j < 0) matches[nm++] = s;
    }
    printf("\nmatches at:");
    for (int i = 0; i < nm; i++) printf(" %d", matches[i]);
    printf("\n");
    return 0;
}
