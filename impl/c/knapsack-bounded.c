#include <stdio.h>

/* 二進位拆分：數量 c 拆成 1, 2, 4, …, 餘數 這幾包，任意 0..c 件都能由它們組合出來，之後當成 0/1 背包 */
int main(void) {
    int items[][3] = {{2, 3, 3}, {3, 4, 2}, {4, 6, 4}}, W = 12, pw[32], pv[32], np = 0, dp[13] = {0};
    for (int i = 0; i < 3; i++) {
        int c = items[i][2];
        for (int k = 1; c > 0; k *= 2) {
            int take = k < c ? k : c;
            pw[np] = items[i][0] * take;
            pv[np++] = items[i][1] * take;
            c -= take;
        }
    }
    printf("pieces:");
    for (int p = 0; p < np; p++) printf(" (%d,%d)", pw[p], pv[p]);
    printf("\n");
    for (int p = 0; p < np; p++)
        for (int w = W; w >= pw[p]; w--) /* 0/1 背包：容量由大到小，避免同一包被用兩次 */
            if (dp[w - pw[p]] + pv[p] > dp[w]) dp[w] = dp[w - pw[p]] + pv[p];
    printf("best value = %d\n", dp[W]);
    return 0;
}
