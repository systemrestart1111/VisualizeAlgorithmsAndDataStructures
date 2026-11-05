#include <stdio.h>

/* dp[i][w] = 只考慮前 i 件、容量 w 時的最大價值；第 i 件「不拿」或「拿」（每件只能拿一次） */
int main(void) {
    int wt[] = {1, 3, 4, 5}, val[] = {1, 4, 5, 7}, n = 4, W = 7, dp[5][8] = {{0}};
    for (int i = 1; i <= n; i++)
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i - 1][w];
            if (w >= wt[i - 1] && dp[i - 1][w - wt[i - 1]] + val[i - 1] > dp[i][w]) dp[i][w] = dp[i - 1][w - wt[i - 1]] + val[i - 1];
        }
    int chosen[4], nc = 0, w = W;
    for (int i = n; i >= 1; i--) /* 從表格倒推：值有變化就代表拿了第 i 件 */
        if (dp[i][w] != dp[i - 1][w]) { chosen[nc++] = i; w -= wt[i - 1]; }
    printf("best value = %d\nitems (1-based):", dp[n][W]);
    for (int k = nc - 1; k >= 0; k--) printf(" %d", chosen[k]);
    printf("\nlast row:");
    for (int x = 0; x <= W; x++) printf(" %d", dp[n][x]);
    printf("\n");
    return 0;
}
