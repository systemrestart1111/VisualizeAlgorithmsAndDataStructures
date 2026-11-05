#include <math.h>
#include <stdio.h>

#define N 16
typedef double Img[N][N];
static Img A;

static void preset(int checker) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (checker) { A[r][c] = ((r >> 2) + (c >> 2)) % 2 ? 210 : 40; continue; }
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            A[r][c] = v;
        }
}
static int cl(int x) { return x < 0 ? 0 : x >= N ? N - 1 : x; }
static void sobel(Img a, Img gx, Img gy) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            gx[r][c] = (-a[cl(r - 1)][cl(c - 1)] + a[cl(r - 1)][cl(c + 1)] - 2 * a[r][cl(c - 1)] + 2 * a[r][cl(c + 1)] - a[cl(r + 1)][cl(c - 1)] + a[cl(r + 1)][cl(c + 1)]) / 8;
            gy[r][c] = (-a[cl(r - 1)][cl(c - 1)] - 2 * a[cl(r - 1)][c] - a[cl(r - 1)][cl(c + 1)] + a[cl(r + 1)][cl(c - 1)] + 2 * a[cl(r + 1)][c] + a[cl(r + 1)][cl(c + 1)]) / 8;
        }
}
static void blur1(Img a) {
    double k[7], s = 0;
    Img h;
    for (int i = 0; i < 7; i++) { k[i] = exp(-((i - 3) * (i - 3)) / 2.0); s += k[i]; }
    for (int i = 0; i < 7; i++) k[i] /= s;
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int j = -3; j <= 3; j++) t += k[j + 3] * a[r][cl(c + j)]; h[r][c] = t; }
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int i = -3; i <= 3; i++) t += k[i + 3] * h[cl(r + i)][c]; a[r][c] = t; }
}

/* 結構張量 M（高斯加權），R = det(M) − k·trace(M)²；R 四捨五入成整數後做 3×3 非極大值抑制 */
static void harris(const char *name, double k) {
    Img Ix, Iy, Sxx, Syy, Sxy;
    long long R[N][N], mx = -(1LL << 62), mn = 1LL << 62;
    sobel(A, Ix, Iy);
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { Sxx[r][c] = Ix[r][c] * Ix[r][c]; Syy[r][c] = Iy[r][c] * Iy[r][c]; Sxy[r][c] = Ix[r][c] * Iy[r][c]; }
    blur1(Sxx); blur1(Syy); blur1(Sxy);
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            double t = Sxx[r][c] + Syy[r][c];
            R[r][c] = (long long)floor(Sxx[r][c] * Syy[r][c] - Sxy[r][c] * Sxy[r][c] - k * t * t + 0.5);
            if (R[r][c] > mx) mx = R[r][c];
            if (R[r][c] < mn) mn = R[r][c];
        }
    int corners[64][2], nc = 0, edges = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) {
            if (R[i][j] < 0.1 * mn) edges++;
            if (R[i][j] <= 0.1 * mx) continue;
            int ok = 1;
            for (int a = -1; a <= 1; a++)
                for (int b = -1; b <= 1; b++) {
                    int y = i + a, x = j + b;
                    if ((a || b) && y >= 0 && y < N && x >= 0 && x < N && (R[y][x] > R[i][j] || (R[y][x] == R[i][j] && (a < 0 || (a == 0 && b < 0))))) ok = 0;
                }
            if (ok) { corners[nc][0] = i; corners[nc][1] = j; nc++; }
        }
    printf("%s, k = %.2f: max R = %lld, edge pixels %d, %d corners:", name, k, mx, edges, nc);
    for (int t = 0; t < nc; t++) printf(" (%d,%d)", corners[t][0], corners[t][1]);
    printf("\n");
}

int main(void) {
    preset(1); harris("checker", 0.04); harris("checker", 0.06);
    preset(0); harris("shapes", 0.04); harris("shapes", 0.06);
    return 0;
}
