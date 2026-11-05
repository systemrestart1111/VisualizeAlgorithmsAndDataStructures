#include <math.h>
#include <stdio.h>

static double z(double v) { return fabs(v) < 5e-7 ? 0.0 : v; }

/* x ← Ax / ‖Ax‖；Rayleigh 商 xᵀAx 估計主特徵值；方向不再改變（含正負號翻轉）即收斂。回傳步數，0 為不收斂 */
static int power_iteration(double A[][3], int n, double *x, double *lam) {
    double nx = 0;
    for (int i = 0; i < n; i++) nx += x[i] * x[i];
    nx = sqrt(nx);
    for (int i = 0; i < n; i++) x[i] /= nx;
    for (int k = 1; k <= 60; k++) {
        double y[3], ny = 0, l = 0, dm = 0, dp = 0;
        for (int i = 0; i < n; i++) { y[i] = 0; for (int j = 0; j < n; j++) y[i] += A[i][j] * x[j]; }
        for (int i = 0; i < n; i++) l += x[i] * y[i];
        for (int i = 0; i < n; i++) ny += y[i] * y[i];
        ny = sqrt(ny);
        for (int i = 0; i < n; i++) { double v = y[i] / ny; dm += (v - x[i]) * (v - x[i]); dp += (v + x[i]) * (v + x[i]); x[i] = v; }
        *lam = l;
        if (fmin(sqrt(dm), sqrt(dp)) < 1e-10) return k;
    }
    return 0;
}

static void run(double A[][3], int n, double *x0) {
    double lam;
    int k = power_iteration(A, n, x0, &lam);
    if (!k) { printf("no convergence in 60 steps (|lambda1| = |lambda2|?)\n"); return; }
    printf("lambda = %.6f, x = (", z(lam));
    for (int i = 0; i < n; i++) printf(i ? ", %.6f" : "%.6f", z(x0[i]));
    printf("), steps %d\n", k);
}

int main(void) {
    double a1[3][3] = {{2, 1}, {1, 3}}, x1[3] = {1, 0};
    double a2[3][3] = {{2, 0, 0}, {0, 1, 0}, {0, 0, 3}}, x2[3] = {1, 1, 1};
    double a3[3][3] = {{4, 1}, {2, 3}}, x3[3] = {1, 1};
    double a4[3][3] = {{0, 1}, {1, 0}}, x4[3] = {1, 0};
    run(a1, 2, x1);
    run(a2, 3, x2);
    run(a3, 2, x3);
    run(a4, 2, x4);
    return 0;
}
