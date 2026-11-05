#include <stdio.h>

int main(void) {
    int p[] = {1, 5, 8, 9, 10, 17, 17, 20}, n = 8, dp[9] = {0}, cut[9] = {0};
    /* dp[i] = max(p[k] + dp[i − k])，cut[i] 記錄最佳的第一段長度 */
    for (int i = 1; i <= n; i++) {
        dp[i] = -1;
        for (int k = 1; k <= i; k++) if (p[k - 1] + dp[i - k] > dp[i]) { dp[i] = p[k - 1] + dp[i - k]; cut[i] = k; }
    }
    printf("dp:");
    for (int i = 0; i <= n; i++) printf(" %d", dp[i]);
    printf("\nbest: %d cut into ", dp[n]);
    for (int m = n, first = 1; m; m -= cut[m], first = 0) printf(first ? "%d" : " + %d", cut[m]);
    int brute = 0;
    for (int mask = 0; mask < 1 << (n - 1); mask++) {
        int s = 0, len = 1;
        for (int i = 0; i < n - 1; i++) { if (mask >> i & 1) { s += p[len - 1]; len = 1; } else len++; }
        s += p[len - 1];
        if (s > brute) brute = s;
    }
    printf("\nbrute force: %d\n", brute);
    return 0;
}
