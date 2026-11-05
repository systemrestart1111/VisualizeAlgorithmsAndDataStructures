#include <math.h>
#include <stdio.h>
#include <string.h>

#define EPS 1e-9
static double T[8][16];
static int basis[8], R, N, pivots;

static double z(double v) { return fabs(v) < 5e-7 ? 0.0 : v; }
static void pivot(int pr, int pc) {
    double pv = T[pr][pc];
    for (int j = 0; j <= N; j++) T[pr][j] /= pv;
    for (int i = 0; i < R; i++)
        if (i != pr && fabs(T[i][pc]) > 1e-15) { double f = T[i][pc]; for (int j = 0; j <= N; j++) T[i][j] -= f * T[pr][j]; }
    basis[pr] = pc;
}
static int in_basis(int j) { for (int i = 0; i < R; i++) if (basis[i] == j) return 1; return 0; }
/* 單純形迭代，入基／出基都用 Bland 法則（編號最小者）避免退化循環；回傳 1 最優、0 無界 */
static int solve(const double *cost, int allowed) {
    for (;;) {
        int e = -1;
        for (int j = 0; j < allowed && e < 0; j++) {
            if (in_basis(j)) continue;
            double red = 0;
            for (int i = 0; i < R; i++) red += cost[basis[i]] * T[i][j];
            if (red - cost[j] < -EPS) e = j;
        }
        if (e < 0) return 1;
        int l = -1;
        double best = INFINITY;
        for (int i = 0; i < R; i++)
            if (T[i][e] > EPS) {
                double q = T[i][N] / T[i][e];
                if (q < best - 1e-12 || (fabs(q - best) <= 1e-12 && basis[i] < basis[l])) { best = q; l = i; }
            }
        if (l < 0) return 0;
        pivot(l, e);
        pivots++;
    }
}

/* 兩階段單純形法；ops[i] 為 1 代表 >=，否則 <= */
static void simplex(const char *name, int n, int m, const double *c0, const double A[][4], const int *ops, const double *b0, int is_min) {
    double a[8][4], b[8], c[4], cost[16];
    int art[8], K = 0;
    for (int j = 0; j < n; j++) c[j] = is_min ? -c0[j] : c0[j];
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) a[i][j] = ops[i] ? -A[i][j] : A[i][j];
        b[i] = ops[i] ? -b0[i] : b0[i];
        art[i] = b[i] < 0 ? K++ : -1;
    }
    R = m; N = n + m + K; pivots = 0;
    memset(T, 0, sizeof T);
    for (int i = 0; i < m; i++) {
        double sg = b[i] < 0 ? -1 : 1;
        for (int j = 0; j < n; j++) T[i][j] = sg * a[i][j];
        T[i][n + i] = sg;
        T[i][N] = sg * b[i];
        if (art[i] >= 0) { T[i][n + m + art[i]] = 1; basis[i] = n + m + art[i]; } else basis[i] = n + i;
    }
    printf("%s: ", name);
    if (K) {
        for (int j = 0; j < N; j++) cost[j] = j >= n + m ? -1 : 0;
        solve(cost, N);
        double z1 = 0;
        for (int i = 0; i < R; i++) z1 += cost[basis[i]] * T[i][N];
        if (z1 < -1e-7) { printf("infeasible\n"); return; }
        for (int i = R - 1; i >= 0; i--) {
            if (basis[i] < n + m) continue;
            int j = -1;
            for (int k = 0; k < n + m; k++) if (fabs(T[i][k]) > EPS) { j = k; break; }
            if (j < 0) { for (int r = i; r < R - 1; r++) { memcpy(T[r], T[r + 1], sizeof T[r]); basis[r] = basis[r + 1]; } R--; }
            else pivot(i, j);
        }
    }
    for (int j = 0; j < N; j++) cost[j] = j < n ? c[j] : 0;
    if (!solve(cost, n + m)) { printf("unbounded\n"); return; }
    double x[4] = {0}, zz = 0;
    for (int i = 0; i < R; i++) if (basis[i] < n) x[basis[i]] = T[i][N];
    for (int j = 0; j < n; j++) zz += c0[j] * x[j];
    printf("optimal %s = %.6f at x = (", is_min ? "min" : "max", z(zz));
    for (int j = 0; j < n; j++) printf(j ? ", %.6f" : "%.6f", z(x[j]));
    printf("), %d pivots\n", pivots);
}

int main(void) {
    { double c[] = {3, 5}, A[][4] = {{1, 0}, {0, 2}, {3, 2}}, b[] = {4, 12, 18}; int o[] = {0, 0, 0}; simplex("classic", 2, 3, c, A, o, b, 0); }
    { double c[] = {1, 1}, A[][4] = {{1, -1}, {-1, 1}}, b[] = {2, 3}; int o[] = {0, 0}; simplex("unbounded", 2, 2, c, A, o, b, 0); }
    { double c[] = {1, 1}, A[][4] = {{1, 1}, {1, 1}}, b[] = {2, 5}; int o[] = {0, 1}; simplex("infeasible", 2, 2, c, A, o, b, 0); }
    { double c[] = {2, 3}, A[][4] = {{1, 1}, {1, 3}, {1, 0}}, b[] = {4, 6, 5}; int o[] = {1, 1, 0}; simplex("min with >=", 2, 3, c, A, o, b, 1); }
    { double c[] = {2, 1}, A[][4] = {{1, 1}, {1, 0}, {2, 1}}, b[] = {4, 2, 6}; int o[] = {0, 0, 0}; simplex("degenerate", 2, 3, c, A, o, b, 0); }
    { double c[] = {0.75, -20, 0.5, -6}, A[][4] = {{0.25, -8, -1, 9}, {0.5, -12, -0.5, 3}, {0, 0, 1, 0}}, b[] = {0, 0, 1}; int o[] = {0, 0, 0}; simplex("Beale cycling", 4, 3, c, A, o, b, 0); }
    return 0;
}
