#include <stdio.h>

#define N 4
#define INF 1000000000

/* 匈牙利演算法 O(n^3)：以位能 u、v 維持「縮減成本 >= 0」，每次加入一列並沿零成本邊找增廣路徑 */
int main(void) {
    int a[N][N] = {{9, 2, 7, 8}, {6, 4, 3, 7}, {5, 8, 1, 8}, {7, 6, 9, 4}};
    int u[N + 1] = {0}, v[N + 1] = {0}, p[N + 1] = {0}, way[N + 1] = {0}; /* p[j] = 第 j 欄配到的列（1 起算） */
    for (int i = 1; i <= N; i++) {
        int minv[N + 1], used[N + 1], j0 = 0;
        p[0] = i;
        for (int j = 0; j <= N; j++) { minv[j] = INF; used[j] = 0; }
        do {
            used[j0] = 1;
            int i0 = p[j0], delta = INF, j1 = 0;
            for (int j = 1; j <= N; j++)
                if (!used[j]) {
                    int cur = a[i0 - 1][j - 1] - u[i0] - v[j];
                    if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
                    if (minv[j] < delta) { delta = minv[j]; j1 = j; }
                }
            for (int j = 0; j <= N; j++) {
                if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
                else minv[j] -= delta;
            }
            j0 = j1;
        } while (p[j0] != 0);
        do { /* 沿 way 回溯翻轉 */
            int j1 = way[j0];
            p[j0] = p[j1];
            j0 = j1;
        } while (j0);
    }
    int assign[N], total = 0;
    for (int j = 1; j <= N; j++) assign[p[j] - 1] = j - 1;
    for (int i = 0; i < N; i++) {
        printf("row %d -> col %d (cost %d)\n", i, assign[i], a[i][assign[i]]);
        total += a[i][assign[i]];
    }
    printf("total cost = %d\n", total);
    return 0;
}
