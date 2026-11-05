#include <stdio.h>

#define N 5
static int KEYS[N] = {10, 20, 30, 40, 50}, P[N] = {15, 10, 5, 10, 20}, Q[N + 1] = {5, 10, 5, 5, 5, 10};
static int e[N + 2][N + 1], w[N + 2][N + 1], root[N + 1][N + 1];

static void preorder(int i, int j) {
    if (i > j) return;
    int r = root[i][j];
    printf(" %d", KEYS[r - 1]);
    preorder(i, r - 1);
    preorder(r + 1, j);
}

int main(void) {
    for (int i = 1; i <= N + 1; i++) e[i][i - 1] = w[i][i - 1] = Q[i - 1];
    for (int len = 1; len <= N; len++)
        for (int i = 1; i + len - 1 <= N; i++) {
            int j = i + len - 1;
            w[i][j] = w[i][j - 1] + P[j - 1] + Q[j];
            e[i][j] = 1 << 30;
            /* 枚舉根 */
            for (int r = i; r <= j; r++) { int t = e[i][r - 1] + e[r + 1][j] + w[i][j]; if (t < e[i][j]) { e[i][j] = t; root[i][j] = r; } }
        }
    printf("min expected cost: %d\nroot: %d | preorder:", e[1][N], KEYS[root[1][N] - 1]);
    preorder(1, N);
    printf("\n");
    return 0;
}
