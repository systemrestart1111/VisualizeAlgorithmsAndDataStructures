#include <stdio.h>
#include <string.h>

static int min3(int a, int b, int c) { int m = a < b ? a : b; return m < c ? m : c; }

/* dp[i][j] = a 前 i 字變成 b 前 j 字的最少操作數（插入、刪除、替換各算 1） */
int main(void) {
    const char *a = "kitten", *b = "sitting";
    int m = (int)strlen(a), n = (int)strlen(b), dp[16][16];
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] : 1 + min3(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    char ops[16][24];
    int k = 0, i = m, j = n;
    while (i || j) { /* 倒推出一組操作 */
        if (i && j && a[i - 1] == b[j - 1]) { i--; j--; }
        else if (i && j && dp[i][j] == dp[i - 1][j - 1] + 1) { sprintf(ops[k++], "replace %c->%c", a[i - 1], b[j - 1]); i--; j--; }
        else if (i && dp[i][j] == dp[i - 1][j] + 1) { sprintf(ops[k++], "delete %c", a[i - 1]); i--; }
        else { sprintf(ops[k++], "insert %c", b[j - 1]); j--; }
    }
    printf("distance = %d\nops:", dp[m][n]);
    for (int t = k - 1; t >= 0; t--) printf(t == k - 1 ? " %s" : ", %s", ops[t]);
    printf("\n");
    return 0;
}
