#include <math.h>
#include <stdio.h>

static double z(double v) { return fabs(v) < 5e-7 ? 0.0 : v; }

/* PA = LU（部分樞軸）；交換列時 L 已算好的欄也要一起交換；回傳 −1 成功，否則為奇異的欄 */
static int lu(double A[][4], int n, int *perm, double L[][4], double U[][4]) {
    for (int i = 0; i < n; i++) { perm[i] = i; for (int j = 0; j < n; j++) { U[i][j] = A[i][j]; L[i][j] = i == j; } }
    for (int k = 0; k < n; k++) {
        int p = k;
        for (int i = k + 1; i < n; i++) if (fabs(U[i][k]) > fabs(U[p][k])) p = i;
        if (p != k) {
            for (int j = 0; j < n; j++) { double t = U[k][j]; U[k][j] = U[p][j]; U[p][j] = t; }
            int t = perm[k]; perm[k] = perm[p]; perm[p] = t;
            for (int j = 0; j < k; j++) { double s = L[k][j]; L[k][j] = L[p][j]; L[p][j] = s; }
        }
        if (fabs(U[k][k]) < 1e-12) return k;
        for (int i = k + 1; i < n; i++) {
            double f = U[i][k] / U[k][k];
            L[i][k] = f;
            for (int j = k; j < n; j++) U[i][j] -= f * U[k][j];
        }
    }
    return -1;
}

static void run(double A[][4], int n) {
    int perm[4];
    double L[4][4], U[4][4];
    int bad = lu(A, n, perm, L, U);
    if (bad >= 0) { printf("singular: no pivot in column %d\n", bad + 1); return; }
    printf("perm:");
    for (int i = 0; i < n; i++) printf(" %d", perm[i]);
    printf("\n");
    for (int i = 0; i < n; i++) {
        printf("L:");
        for (int j = 0; j < n; j++) printf(" %.6f", z(L[i][j]));
        printf(" | U:");
        for (int j = 0; j < n; j++) printf(" %.6f", z(U[i][j]));
        printf("\n");
    }
    double err = 0;
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) { double s = 0; for (int k = 0; k < n; k++) s += L[i][k] * U[k][j]; if (fabs(A[perm[i]][j] - s) > err) err = fabs(A[perm[i]][j] - s); }
    printf("PA = LU: %s\n", err < 1e-9 ? "True" : "False");
}

int main(void) {
    double a1[4][4] = {{2, 1, 1, 0}, {4, 3, 3, 1}, {8, 7, 9, 5}, {6, 7, 9, 8}};
    double a2[4][4] = {{1, 2, 3}, {2, 4, 6}, {1, 0, 1}};
    double a3[4][4] = {{0, 1}, {1, 0}};
    run(a1, 4);
    run(a2, 3);
    run(a3, 2);
    return 0;
}
