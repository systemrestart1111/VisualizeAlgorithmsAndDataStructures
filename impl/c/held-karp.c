#include <math.h>
#include <stdio.h>

#define N 6
#define INF 1e18
/* 浮點數比較加上容許誤差：平手時固定選編號小的城市，不受各平台浮點運算細節影響 */
#define EPS 1e-9

/* dp[mask][j] = 從城市 0 出發、恰好走過 mask 中的城市、最後停在 j 的最短距離 */
int main(void) {
    double px[N] = {0, 4, 6, 3, 1, 5}, py[N] = {0, 1, 4, 6, 4, 7}, d[N][N];
    static double dp[1 << N][N];
    static int par[1 << N][N];
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) d[i][j] = sqrt((px[i] - px[j]) * (px[i] - px[j]) + (py[i] - py[j]) * (py[i] - py[j]));
    for (int m = 0; m < (1 << N); m++)
        for (int j = 0; j < N; j++) { dp[m][j] = INF; par[m][j] = -1; }
    dp[1][0] = 0;
    for (int mask = 0; mask < (1 << N); mask++) {
        if (!(mask & 1)) continue;
        for (int j = 0; j < N; j++) {
            if (dp[mask][j] >= INF || !(mask >> j & 1)) continue;
            for (int k = 0; k < N; k++) {
                if (mask >> k & 1) continue;
                int nm = mask | 1 << k;
                if (dp[mask][j] + d[j][k] < dp[nm][k] - EPS) { dp[nm][k] = dp[mask][j] + d[j][k]; par[nm][k] = j; }
            }
        }
    }
    int full = (1 << N) - 1, last = -1, tour[N + 1], len = 0;
    double best = INF;
    for (int j = 1; j < N; j++)
        if (dp[full][j] + d[j][0] < best - EPS) { best = dp[full][j] + d[j][0]; last = j; }
    for (int mask = full; last != -1;) { /* 沿 par 倒推路線 */
        int p = par[mask][last];
        tour[len++] = last;
        mask ^= 1 << last;
        last = p;
    }
    printf("tour:");
    for (int i = len - 1; i >= 0; i--) printf(i == len - 1 ? " %d" : " -> %d", tour[i]);
    printf(" -> 0\nlength = %.4f\n", best);
    return 0;
}
