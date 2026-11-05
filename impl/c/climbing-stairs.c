#include <stdio.h>

/* dp[i] = 爬到第 i 階的方法數 = Σ dp[i - s]（s 為每次可爬的階數） */
int main(void) {
    int n = 8, steps[] = {1, 2}, ns = 2;
    long long dp[64] = {1};
    for (int i = 1; i <= n; i++)
        for (int k = 0; k < ns; k++)
            if (i >= steps[k]) dp[i] += dp[i - steps[k]];
    printf("ways(%d) = %lld\ndp:", n, dp[n]);
    for (int i = 0; i <= n; i++) printf(" %lld", dp[i]);
    printf("\n");
    return 0;
}
