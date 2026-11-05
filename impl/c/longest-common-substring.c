#include <stdio.h>
#include <string.h>

/* 相同字元沿對角線延伸，不同就歸零；表中最大值即答案（必須連續）。L 為對照用的最長共同子序列 */
static void run(const char *a, const char *b) {
    int n = (int)strlen(a), m = (int)strlen(b), dp[32][32] = {{0}}, L[32][32] = {{0}}, best = 0, end = 0;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; if (dp[i][j] > best) { best = dp[i][j]; end = i; } }
            L[i][j] = a[i - 1] == b[j - 1] ? L[i - 1][j - 1] + 1 : (L[i - 1][j] > L[i][j - 1] ? L[i - 1][j] : L[i][j - 1]);
        }
    printf("%s / %s: substring '%.*s' (%d), subsequence length %d\n", a, b, best, a + end - best, best, L[n][m]);
}

int main(void) {
    run("ABABCABA", "BABCAACB");
    run("ABCDXYZ", "XYZABCD");
    run("ABC", "DEF");
    return 0;
}
