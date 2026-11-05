#include <stdio.h>

#define N 6
int board[N][N], backtracks;
int DR[] = {2, 1, -1, -2, -2, -1, 1, 2}, DC[] = {1, 2, 2, 1, -1, -2, -2, -1};

int free_cell(int r, int c) { return r >= 0 && r < N && c >= 0 && c < N && board[r][c] == 0; }

/* 從 (r, c) 還能跳到幾個沒走過的格子 */
int onward(int r, int c) {
    int k = 0;
    for (int d = 0; d < 8; d++) k += free_cell(r + DR[d], c + DC[d]);
    return k;
}

/* Warnsdorff 規則：優先跳到「之後出路最少」的格子；仍走不通時回溯 */
int tour(int r, int c, int step) {
    board[r][c] = step;
    if (step == N * N) return 1;
    int cr[8], cc[8], deg[8], n = 0;
    for (int d = 0; d < 8; d++)
        if (free_cell(r + DR[d], c + DC[d])) { cr[n] = r + DR[d]; cc[n] = c + DC[d]; deg[n++] = onward(r + DR[d], c + DC[d]); }
    for (int i = 1; i < n; i++) { /* 穩定的插入排序，同分保持移動方向的順序 */
        int a = cr[i], b = cc[i], g = deg[i], j = i - 1;
        while (j >= 0 && deg[j] > g) { cr[j + 1] = cr[j]; cc[j + 1] = cc[j]; deg[j + 1] = deg[j]; j--; }
        cr[j + 1] = a; cc[j + 1] = b; deg[j + 1] = g;
    }
    for (int i = 0; i < n; i++)
        if (tour(cr[i], cc[i], step + 1)) return 1;
    board[r][c] = 0;
    backtracks++;
    return 0;
}

int main(void) {
    int found = tour(0, 0, 1);
    printf("found: %s backtracks = %d\n", found ? "True" : "False", backtracks);
    for (int r = 0; r < N; r++) {
        for (int c = 0; c < N; c++) printf("%3d", board[r][c]);
        printf("\n");
    }
    return 0;
}
