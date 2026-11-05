#include <stdio.h>

/* dp[i][s] = 前 i 個數能否湊出 s = dp[i-1][s] or dp[i-1][s - a[i]] */
int main(void) {
    int a[] = {3, 34, 4, 12, 5, 2}, n = 6, T = 9, dp[7][10] = {{0}};
    dp[0][0] = 1;
    for (int i = 1; i <= n; i++)
        for (int s = 0; s <= T; s++)
            dp[i][s] = dp[i - 1][s] || (s >= a[i - 1] && dp[i - 1][s - a[i - 1]]);
    printf("possible = %s\n", dp[n][T] ? "True" : "False");
    if (dp[n][T]) {
        int pick[6], np = 0, s = T;
        for (int i = n; i >= 1; i--) /* 若不用第 i 個就湊不出來，代表一定要用它 */
            if (!dp[i - 1][s]) { pick[np++] = a[i - 1]; s -= a[i - 1]; }
        printf("subset:");
        for (int k = np - 1; k >= 0; k--) printf(" %d", pick[k]);
        printf("\n");
    }
    return 0;
}
