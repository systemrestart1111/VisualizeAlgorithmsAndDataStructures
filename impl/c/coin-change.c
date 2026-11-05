#include <stdio.h>

#define INF 1000000

int main(void) {
    int coins[] = {1, 3, 4}, nc = 3, A = 10, dp[11], last[11] = {0};
    long long ways[11] = {1};
    /* 最少硬幣數：dp[a] = min(dp[a - c] + 1)；記下每個金額最後用的硬幣以便還原 */
    dp[0] = 0;
    for (int a = 1; a <= A; a++) {
        dp[a] = INF;
        for (int k = 0; k < nc; k++)
            if (a >= coins[k] && dp[a - coins[k]] + 1 < dp[a]) { dp[a] = dp[a - coins[k]] + 1; last[a] = coins[k]; }
    }
    printf("min coins = %d ->", dp[A]);
    for (int a = A; a > 0; a -= last[a]) printf(" %d", last[a]);
    printf("\n");
    /* 組合數：外層跑硬幣、內層跑金額，每種組合只會以固定的硬幣順序被數到一次 */
    for (int k = 0; k < nc; k++)
        for (int a = coins[k]; a <= A; a++) ways[a] += ways[a - coins[k]];
    printf("ways = %lld\n", ways[A]);
    return 0;
}
