#include <math.h>
#include <stdio.h>

#define N 16
static double kern[7];
static int krad;

static void noisy(double a[N][N]) {
    long long s = 7;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            s = s * 48271 % 2147483647;
            int t = (int)(s % 100);
            a[r][c] = t < 5 ? 0 : t < 10 ? 255 : v;
        }
}
/* 一維高斯：半徑 ⌈3σ⌉（最多 3），正規化成總和 1 */
static void kernel(double sigma) {
    krad = (int)ceil(3 * sigma);
    if (krad > 3) krad = 3;
    double s = 0;
    for (int i = 0; i <= 2 * krad; i++) { kern[i] = exp(-((i - krad) * (i - krad)) / (2 * sigma * sigma)); s += kern[i]; }
    for (int i = 0; i <= 2 * krad; i++) kern[i] /= s;
}
static double at(double a[N][N], int r, int c, int zero) {
    if (r >= 0 && r < N && c >= 0 && c < N) return a[r][c];
    if (zero) return 0;
    return a[r < 0 ? 0 : r >= N ? N - 1 : r][c < 0 ? 0 : c >= N ? N - 1 : c];
}
/* 可分離：先水平再垂直 */
static void blur(double a[N][N], double out[N][N], double sigma, int zero) {
    double h[N][N];
    kernel(sigma);
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double s = 0; for (int j = -krad; j <= krad; j++) s += kern[j + krad] * at(a, r, c + j, zero); h[r][c] = s; }
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double s = 0; for (int i = -krad; i <= krad; i++) s += kern[i + krad] * at(h, r + i, c, zero); out[r][c] = s; }
}

int main(void) {
    double A[N][N], out[N][N], sigmas[3] = {0.6, 1.0, 2.0};
    noisy(A);
    for (int k = 0; k < 3; k++) {
        blur(A, out, sigmas[k], 0);
        printf("sigma %.1f: kernel", sigmas[k]);
        for (int i = 0; i <= 2 * krad; i++) printf(" %.6f", kern[i]);
        double sum = 0;
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) sum += out[r][c];
        printf("\n  out(5,4) = %.3f, out(8,8) = %.3f, out(0,0) = %.3f, sum = %.3f\n", out[5][4], out[8][8], out[0][0], sum);
    }
    double C[N][N];
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) C[r][c] = 120;
    for (int zero = 0; zero <= 1; zero++) {
        blur(C, out, 1.0, zero);
        double dev = 0;
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) if (fabs(out[r][c] - 120) > dev) dev = fabs(out[r][c] - 120);
        printf("constant image, border %s: max deviation %.3f\n", zero ? "zero" : "replicate", dev);
    }
    return 0;
}
