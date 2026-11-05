#include <math.h>
#include <stdio.h>

static long long st;
static long long nxt(void) { st = st * 48271 % 2147483647; return st; }
static double real(void) { return nxt() / 2147483647.0; }
static double P[30][2];

static void lsq(int *idx, int n, double *a, double *b) {
    double sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (int k = 0; k < n; k++) { double x = P[idx[k]][0], y = P[idx[k]][1]; sx += x; sy += y; sxx += x * x; sxy += x * y; }
    double det = n * sxx - sx * sx;
    if (det != 0) { *a = (n * sxy - sx * sy) / det; *b = (sxx * sy - sx * sxy) / det; } else { *a = 0; *b = sy / n; }
}

/* 隨機抽兩點定直線，數誤差門檻內的內點，保留最多者；最後只用內點重新擬合 */
static void ransac(long long seed, int iters, double thr) {
    int best[30], nb = -1;
    st = seed;
    for (int it = 0; it < iters; it++) {
        int i = (int)(nxt() % 30), j = (int)(nxt() % 30), tries = 0;
        while (P[i][0] == P[j][0] && P[i][1] == P[j][1] && tries < 10) { j = (int)(nxt() % 30); tries++; }
        if (P[i][0] == P[j][0] && P[i][1] == P[j][1]) continue;
        double A = P[j][1] - P[i][1], B = P[i][0] - P[j][0], C = -(A * P[i][0] + B * P[i][1]), nrm = hypot(A, B);
        int inl[30], n = 0;
        for (int k = 0; k < 30; k++) if (fabs(A * P[k][0] + B * P[k][1] + C) / nrm < thr) inl[n++] = k;
        if (n > nb) { nb = n; for (int k = 0; k < n; k++) best[k] = inl[k]; }
    }
    double a, b;
    int real_in = 0;
    lsq(best, nb, &a, &b);
    for (int k = 0; k < nb; k++) real_in += best[k] < 20;
    printf("seed %lld, %d iterations, threshold %.1f: %d inliers (%d true), refit y = %.3fx + %.3f\n", seed, iters, thr, nb, real_in, a, b);
}

int main(void) {
    st = 7;
    for (int i = 0; i < 20; i++) { double x = 0.5 + i * 9.0 / 19; P[i][0] = x; P[i][1] = 0.6 * x + 2 + (real() - 0.5) * 0.6; }
    for (int i = 20; i < 30; i++) { P[i][0] = real() * 10; P[i][1] = real() * 10; }
    int all[30];
    double a, b;
    for (int k = 0; k < 30; k++) all[k] = k;
    lsq(all, 30, &a, &b);
    printf("least squares on all 30 points: y = %.3fx + %.3f\n", a, b);
    ransac(42, 20, 0.5);
    ransac(1, 5, 0.5);
    ransac(2024, 50, 0.3);
    ransac(42, 20, 1.0);
    return 0;
}
