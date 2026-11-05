#include <stdio.h>

#define R 5
#define C 5
int P[R + 1][C + 1];

int query(int r1, int c1, int r2, int c2) { return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]; }

int main(void) {
    int a[R][C] = {{3, 0, 1, 4, 2}, {5, 6, 3, 2, 1}, {1, 2, 0, 1, 5}, {4, 1, 0, 1, 7}, {1, 0, 3, 0, 5}};
    /* P[i][j] = 左上角 (0,0) 到 (i-1, j-1) 的總和 */
    for (int i = 1; i <= R; i++)
        for (int j = 1; j <= C; j++) P[i][j] = a[i - 1][j - 1] + P[i - 1][j] + P[i][j - 1] - P[i - 1][j - 1];
    int qs[4][4] = {{1, 1, 3, 3}, {0, 0, 4, 4}, {2, 2, 2, 2}, {0, 3, 4, 4}};
    for (int k = 0; k < 4; k++) {
        int *q = qs[k], brute = 0;
        for (int i = q[0]; i <= q[2]; i++) for (int j = q[1]; j <= q[3]; j++) brute += a[i][j];
        printf("sum(%d, %d, %d, %d) = %d (brute %d)\n", q[0], q[1], q[2], q[3], query(q[0], q[1], q[2], q[3]), brute);
    }
    return 0;
}
