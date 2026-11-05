#include <stdio.h>

#define N 4
#define INF 1000000000

int popcount(int x) { int c = 0; while (x) { c += x & 1; x >>= 1; } return c; }

/* dp[mask] = mask 這些工作已分配給前 popcount(mask) 位工人時的最小成本 */
int main(void) {
    int cost[N][N] = {{9, 2, 7, 8}, {6, 4, 3, 7}, {5, 8, 1, 8}, {7, 6, 9, 4}}; /* cost[工人][工作] */
    int dp[1 << N], choice[1 << N];
    for (int m = 0; m < (1 << N); m++) { dp[m] = INF; choice[m] = -1; }
    dp[0] = 0;
    for (int mask = 0; mask < (1 << N); mask++) {
        if (dp[mask] == INF) continue;
        int k = popcount(mask); /* 下一位要分配的工人 */
        if (k == N) continue;
        for (int j = 0; j < N; j++)
            if (!(mask >> j & 1)) {
                int nm = mask | 1 << j;
                if (dp[mask] + cost[k][j] < dp[nm]) { dp[nm] = dp[mask] + cost[k][j]; choice[nm] = j; }
            }
    }
    int full = (1 << N) - 1, assign[N], mask = full;
    for (int k = N - 1; k >= 0; k--) { assign[k] = choice[mask]; mask ^= 1 << choice[mask]; } /* 倒推每位工人分到的工作 */
    for (int k = 0; k < N; k++) printf("worker %d -> job %d (cost %d)\n", k, assign[k], cost[k][assign[k]]);
    printf("min total cost = %d\n", dp[full]);
    return 0;
}
