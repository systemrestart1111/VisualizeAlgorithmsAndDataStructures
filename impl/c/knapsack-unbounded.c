#include <stdio.h>

/* 一維 dp[w] 由小到大更新：dp[w - wi] 可能已經包含第 i 種，因此同一種能重複拿 */
int main(void) {
    int wt[] = {2, 3, 4, 5}, val[] = {3, 5, 7, 8}, n = 4, W = 11, dp[12] = {0};
    for (int w = 1; w <= W; w++)
        for (int i = 0; i < n; i++)
            if (w >= wt[i] && dp[w - wt[i]] + val[i] > dp[w]) dp[w] = dp[w - wt[i]] + val[i];
    printf("best value = %d\ndp:", dp[W]);
    for (int w = 0; w <= W; w++) printf(" %d", dp[w]);
    printf("\n");
    return 0;
}
