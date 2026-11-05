#include <math.h>
#include <stdio.h>

#define N 3

/* 前向消去：每一欄選絕對值最大的列當主元（部分樞軸），再消去下方各列；最後回代求解 */
int main(void) {
    double M[N][N + 1] = {{2, 1, -1, 8}, {-3, -1, 2, -11}, {-2, 1, 2, -3}}, x[N]; /* 增廣矩陣 [A | b] */
    for (int col = 0; col < N; col++) {
        int piv = col;
        for (int r = col + 1; r < N; r++) if (fabs(M[r][col]) > fabs(M[piv][col])) piv = r;
        if (piv != col) {
            for (int c = 0; c <= N; c++) { double t = M[col][c]; M[col][c] = M[piv][c]; M[piv][c] = t; }
            printf("swap rows %d and %d\n", col, piv);
        }
        for (int r = col + 1; r < N; r++) {
            double factor = M[r][col] / M[col][col];
            for (int c = col; c <= N; c++) M[r][c] -= factor * M[col][c];
        }
    }
    for (int r = N - 1; r >= 0; r--) {
        double s = M[r][N];
        for (int c = r + 1; c < N; c++) s -= M[r][c] * x[c];
        x[r] = s / M[r][r];
    }
    printf("solution:");
    for (int i = 0; i < N; i++) printf(" x%d = %.4f", i, fabs(x[i]) < 1e-9 ? 0.0 : x[i]);
    printf("\n");
    return 0;
}
