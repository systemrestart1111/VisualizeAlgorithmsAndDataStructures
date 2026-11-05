#include <math.h>
#include <stdio.h>

static double z(double v) { return fabs(v) < 5e-7 ? 0.0 : v; }

/* 化成簡化列梯形 (RREF)，判斷唯一解／無解／無限多解 */
static void gauss_jordan(double M[][5], int R, int nv) {
    int piv[5], np = 0, row = 0;
    for (int col = 0; col < nv && row < R; col++) {
        int p = row;
        for (int i = row + 1; i < R; i++) if (fabs(M[i][col]) > fabs(M[p][col])) p = i;
        if (fabs(M[p][col]) < 1e-9) continue; /* 沒有主元：自由變數 */
        for (int j = 0; j <= nv; j++) { double t = M[p][j]; M[p][j] = M[row][j]; M[row][j] = t; }
        double pv = M[row][col];
        for (int j = 0; j <= nv; j++) M[row][j] /= pv;
        for (int i = 0; i < R; i++)
            if (i != row && fabs(M[i][col]) > 1e-12) { double f = M[i][col]; for (int j = 0; j <= nv; j++) M[i][j] -= f * M[row][j]; }
        piv[np++] = col;
        row++;
    }
    for (int i = row; i < R; i++) if (fabs(M[i][nv]) > 1e-9) { printf("no solution (row 0 ... 0 | c with c != 0)\n"); return; }
    if (np < nv) {
        printf("infinitely many: rank %d < %d, free", np, nv);
        for (int j = 0; j < nv; j++) { int isp = 0; for (int k = 0; k < np; k++) if (piv[k] == j) isp = 1; if (!isp) printf(" x%d", j + 1); }
        printf("\n");
        return;
    }
    printf("unique:");
    for (int i = 0; i < nv; i++) printf(" x%d = %.6f", i + 1, z(M[i][nv]));
    printf("\n");
}

int main(void) {
    double s1[3][5] = {{2, 1, -1, 8}, {-3, -1, 2, -11}, {-2, 1, 2, -3}};
    double s2[3][5] = {{1, 2, -1, 3}, {2, 4, -2, 6}, {1, 1, 1, 4}};
    double s3[3][5] = {{1, 1, 2, 3}, {2, 2, 4, 7}, {1, -1, 0, 1}};
    double s4[2][5] = {{0, 2, 4}, {3, 1, 5}};
    gauss_jordan(s1, 3, 3);
    gauss_jordan(s2, 3, 3);
    gauss_jordan(s3, 3, 3);
    gauss_jordan(s4, 2, 2);
    return 0;
}
