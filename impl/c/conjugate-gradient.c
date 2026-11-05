#include <math.h>
#include <stdio.h>

static double z(double v) { return fabs(v) < 5e-7 ? 0.0 : v; }

/* 對稱且 Cholesky 成功才是對稱正定 */
static int is_spd(double A[][3], int n) {
    double L[3][3] = {{0}};
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) if (A[i][j] != A[j][i]) return 0;
    for (int i = 0; i < n; i++)
        for (int j = 0; j <= i; j++) {
            double s = A[i][j];
            for (int k = 0; k < j; k++) s -= L[i][k] * L[j][k];
            if (i == j) { if (s <= 1e-12) return 0; L[i][i] = sqrt(s); }
            else L[i][j] = s / L[j][j];
        }
    return 1;
}

/* 方向 p 彼此 A-共軛：α = rᵀr / pᵀAp，β = r_newᵀr_new / rᵀr；至多 n 步 */
static int cg(double A[][3], const double *b, int n, double *x) {
    double r[3], p[3];
    for (int i = 0; i < n; i++) { x[i] = 0; r[i] = b[i]; p[i] = b[i]; }
    for (int k = 1; k < n + 6; k++) {
        double Ap[3], rr = 0, pAp = 0, rn[3], rnn = 0;
        for (int i = 0; i < n; i++) { Ap[i] = 0; for (int j = 0; j < n; j++) Ap[i] += A[i][j] * p[j]; }
        for (int i = 0; i < n; i++) rr += r[i] * r[i];
        for (int i = 0; i < n; i++) pAp += p[i] * Ap[i];
        double alpha = rr / pAp;
        for (int i = 0; i < n; i++) { x[i] += alpha * p[i]; rn[i] = r[i] - alpha * Ap[i]; }
        for (int i = 0; i < n; i++) rnn += rn[i] * rn[i];
        if (sqrt(rnn) < 1e-10) return k;
        double beta = rnn / rr;
        for (int i = 0; i < n; i++) { p[i] = rn[i] + beta * p[i]; r[i] = rn[i]; }
    }
    return 0;
}

static void run(double A[][3], const double *b, int n) {
    if (!is_spd(A, n)) { printf("not symmetric positive definite: CG not applicable\n"); return; }
    double x[3], res = 0;
    int k = cg(A, b, n, x);
    for (int i = 0; i < n; i++) { double s = b[i]; for (int j = 0; j < n; j++) s -= A[i][j] * x[j]; res += s * s; }
    printf("x = (");
    for (int i = 0; i < n; i++) printf(i ? ", %.6f" : "%.6f", z(x[i]));
    printf(") in %d steps (n = %d), residual small %s\n", k, n, sqrt(res) < 1e-9 ? "True" : "False");
}

int main(void) {
    double a1[3][3] = {{3, 2}, {2, 6}}, b1[3] = {2, -8};
    double a2[3][3] = {{4, 1, 0}, {1, 3, 1}, {0, 1, 2}}, b2[3] = {1, 2, 3};
    double a3[3][3] = {{4, 1}, {1, 3}}, b3[3] = {1, 2};
    double a4[3][3] = {{1, 2}, {2, 1}}, b4[3] = {1, 1};
    run(a1, b1, 2);
    run(a2, b2, 3);
    run(a3, b3, 2);
    run(a4, b4, 2);
    return 0;
}
