#include <stdio.h>
#include <string.h>

/* L[i][j]：兩端相同 → L[i+1][j−1] + 2；不同 → max(L[i+1][j], L[i][j−1]) */
static void lps(const char *s) {
    int n = (int)strlen(s), L[32][32] = {{0}};
    for (int i = 0; i < n; i++) L[i][i] = 1;
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            if (s[i] == s[j]) L[i][j] = (len > 2 ? L[i + 1][j - 1] : 0) + 2;
            else L[i][j] = L[i + 1][j] > L[i][j - 1] ? L[i + 1][j] : L[i][j - 1];
        }
    char left[32], right[32];
    int nl = 0, nr = 0, i = 0, j = n - 1;
    while (i <= j) {
        if (i == j) { left[nl++] = s[i]; break; }
        if (s[i] == s[j]) { left[nl++] = s[i]; right[nr++] = s[j]; i++; j--; }
        else if (L[i + 1][j] >= L[i][j - 1]) i++;
        else j--;
    }
    printf("%s: %d (", s, L[0][n - 1]);
    for (int k = 0; k < nl; k++) putchar(left[k]);
    for (int k = nr - 1; k >= 0; k--) putchar(right[k]);
    printf(")\n");
}

int main(void) {
    lps("BBABCBCAB");
    lps("CHARACTER");
    lps("AGBDBA");
    lps("X");
    return 0;
}
