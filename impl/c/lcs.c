#include <stdio.h>
#include <string.h>

/* dp[i][j] = a 前 i 字與 b 前 j 字的 LCS 長度；字元相同取左上 +1，否則取上方與左方較大者 */
int main(void) {
    const char *a = "ABCBDAB", *b = "BDCABA";
    int m = (int)strlen(a), n = (int)strlen(b), dp[16][16] = {{0}};
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] + 1 : (dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1]);
    char out[16];
    int k = dp[m][n], i = m, j = n;
    out[k] = '\0';
    while (i && j) { /* 由右下角倒推還原一組 LCS */
        if (a[i - 1] == b[j - 1]) { out[--k] = a[i - 1]; i--; j--; }
        else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
        else j--;
    }
    printf("LCS length = %d\none LCS = %s\n", dp[m][n], out);
    return 0;
}
