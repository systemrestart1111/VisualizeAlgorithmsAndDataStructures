#include <stdio.h>

#define R 5
#define C 6

int main(void) {
    int ops[3][5] = {{0, 0, 2, 2, 3}, {1, 2, 4, 5, 2}, {3, 0, 4, 1, -1}};
    int D[R + 1][C + 1] = {{0}}, naive[R][C] = {{0}}, out[R][C];
    for (int k = 0; k < 3; k++) {
        int r1 = ops[k][0], c1 = ops[k][1], r2 = ops[k][2], c2 = ops[k][3], v = ops[k][4];
        /* 只改四個角 */
        D[r1][c1] += v; D[r1][c2 + 1] -= v; D[r2 + 1][c1] -= v; D[r2 + 1][c2 + 1] += v;
        for (int i = r1; i <= r2; i++) for (int j = c1; j <= c2; j++) naive[i][j] += v;
    }
    /* 二維前綴和還原 */
    int same = 1;
    for (int i = 0; i < R; i++) {
        for (int j = 0; j < C; j++) {
            out[i][j] = D[i][j] + (i ? out[i - 1][j] : 0) + (j ? out[i][j - 1] : 0) - (i && j ? out[i - 1][j - 1] : 0);
            printf(j ? " %2d" : "%2d", out[i][j]);
            same &= out[i][j] == naive[i][j];
        }
        printf("\n");
    }
    printf("matches naive: %s\n", same ? "True" : "False");
    return 0;
}
