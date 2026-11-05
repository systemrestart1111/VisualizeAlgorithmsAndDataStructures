#include <stdio.h>

/* opt[i][j−1] ≤ opt[i][j] ≤ opt[i+1][j]：只在這個範圍內枚舉切點 */
static void run(const int *a, int n) {
    int S[16] = {0}, dp[16][16] = {{0}}, opt[16][16] = {{0}}, nd[16][16] = {{0}}, e1 = 0, e2 = 0;
    for (int i = 0; i < n; i++) { S[i + 1] = S[i] + a[i]; opt[i][i] = i; }
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1, hi = opt[i + 1][j] < j - 1 ? opt[i + 1][j] : j - 1;
            dp[i][j] = 1 << 30;
            for (int m = opt[i][j - 1]; m <= hi; m++) { e1++; int t = dp[i][m] + dp[m + 1][j] + S[j + 1] - S[i]; if (t < dp[i][j]) { dp[i][j] = t; opt[i][j] = m; } }
            nd[i][j] = 1 << 30;
            for (int m = i; m < j; m++) { e2++; int t = nd[i][m] + nd[m + 1][j] + S[j + 1] - S[i]; if (t < nd[i][j]) nd[i][j] = t; }
        }
    printf("[");
    for (int i = 0; i < n; i++) printf(i ? ", %d" : "%d", a[i]);
    printf("]: knuth %d (%d evals), naive %d (%d evals)\n", dp[0][n - 1], e1, nd[0][n - 1], e2);
}

int main(void) {
    int a[8] = {4, 1, 7, 3, 9, 2, 6, 5}, b[12];
    run(a, 8);
    for (int i = 0; i < 12; i++) b[i] = i + 1;
    run(b, 12);
    return 0;
}
