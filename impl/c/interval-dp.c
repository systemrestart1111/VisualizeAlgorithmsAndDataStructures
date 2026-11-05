#include <stdio.h>

int stones[] = {4, 1, 2, 3, 5, 2}, cut[6][6];

void show(int i, int j) {
    if (i == j) { printf("%d", stones[i]); return; }
    printf("(");
    show(i, cut[i][j]);
    printf("+");
    show(cut[i][j] + 1, j);
    printf(")");
}

/* 石子合併：每次合併相鄰兩堆，成本為兩堆重量和
   dp[i][j] = 把第 i..j 堆合成一堆的最小成本 = min(dp[i][k] + dp[k+1][j]) + sum(i..j) */
int main(void) {
    int n = 6, pre[7] = {0}, dp[6][6] = {{0}};
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + stones[i];
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = -1;
            for (int k = i; k < j; k++) {
                int v = dp[i][k] + dp[k + 1][j];
                if (dp[i][j] < 0 || v < dp[i][j]) { dp[i][j] = v; cut[i][j] = k; }
            }
            dp[i][j] += pre[j + 1] - pre[i];
        }
    printf("min cost = %d\nmerge order: ", dp[0][n - 1]);
    show(0, n - 1);
    printf("\n");
    return 0;
}
