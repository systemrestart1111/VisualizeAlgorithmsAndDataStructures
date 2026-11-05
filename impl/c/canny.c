#include <math.h>
#include <stdio.h>

#define N 16
typedef double Img[N][N];
static Img A;

static void preset(const char *name) {
    long long s = 7;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (name[1] == 't') { A[r][c] = (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0); continue; }
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            if (name[0] == 'n') { s = s * 48271 % 2147483647; int t = (int)(s % 100); v = t < 5 ? 0 : t < 10 ? 255 : v; }
            A[r][c] = v;
        }
}
static int cl(int x) { return x < 0 ? 0 : x >= N ? N - 1 : x; }

/* 高斯模糊 → Sobel → 沿梯度方向細化 → 雙門檻 → 從強邊 BFS 連結弱邊 */
static void canny(const char *name, double lo, double hi) {
    double k[7], s = 0;
    Img h, B, gx, gy, M, thin;
    for (int i = 0; i < 7; i++) { k[i] = exp(-((i - 3) * (i - 3)) / 2.0); s += k[i]; }
    for (int i = 0; i < 7; i++) k[i] /= s;
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int j = -3; j <= 3; j++) t += k[j + 3] * A[r][cl(c + j)]; h[r][c] = t; }
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int i = -3; i <= 3; i++) t += k[i + 3] * h[cl(r + i)][c]; B[r][c] = t; }
    double mx = 0;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            gx[r][c] = -B[cl(r - 1)][cl(c - 1)] + B[cl(r - 1)][cl(c + 1)] - 2 * B[r][cl(c - 1)] + 2 * B[r][cl(c + 1)] - B[cl(r + 1)][cl(c - 1)] + B[cl(r + 1)][cl(c + 1)];
            gy[r][c] = -B[cl(r - 1)][cl(c - 1)] - 2 * B[cl(r - 1)][c] - B[cl(r - 1)][cl(c + 1)] + B[cl(r + 1)][cl(c - 1)] + 2 * B[cl(r + 1)][c] + B[cl(r + 1)][cl(c + 1)];
            M[r][c] = floor(hypot(gx[r][c], gy[r][c]) * 10000 + 0.5) / 10000;
            if (M[r][c] > mx) mx = M[r][c];
        }
    if (mx == 0) mx = 1;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            double ang = atan2(gy[r][c], gx[r][c]) * 180 / 3.14159265358979323846;
            if (ang < 0) ang += 180;
            int di, dj;
            if (ang < 22.5 || ang >= 157.5) { di = 0; dj = 1; } else if (ang < 67.5) { di = 1; dj = 1; } else if (ang < 112.5) { di = 1; dj = 0; } else { di = 1; dj = -1; }
            double n1 = (r + di >= 0 && r + di < N && c + dj >= 0 && c + dj < N) ? M[r + di][c + dj] : 0;
            double n2 = (r - di >= 0 && r - di < N && c - dj >= 0 && c - dj < N) ? M[r - di][c - dj] : 0;
            thin[r][c] = M[r][c] >= n1 && M[r][c] >= n2 ? M[r][c] : 0;
        }
    int lab[N][N], strong = 0, weak = 0, promoted = 0, edges = 0, q[N * N][2], qh = 0, qt = 0;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            lab[r][c] = thin[r][c] >= hi * mx ? 2 : thin[r][c] >= lo * mx ? 1 : 0;
            if (lab[r][c] == 2) { strong++; q[qt][0] = r; q[qt][1] = c; qt++; }
            if (lab[r][c] == 1) weak++;
        }
    while (qh < qt) {
        int r = q[qh][0], c = q[qh][1];
        qh++;
        for (int a = -1; a <= 1; a++)
            for (int b = -1; b <= 1; b++) {
                int y = r + a, x = c + b;
                if (y >= 0 && y < N && x >= 0 && x < N && lab[y][x] == 1) { lab[y][x] = 2; promoted++; q[qt][0] = y; q[qt][1] = x; qt++; }
            }
    }
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) edges += lab[r][c] == 2;
    printf("%s, low %g high %g: strong %d, weak %d, promoted %d, dropped %d, edge pixels %d\n", name, lo, hi, strong, weak, promoted, weak - promoted, edges);
}

int main(void) {
    const char *names[3] = {"shapes", "noisy", "step"};
    for (int t = 0; t < 3; t++) { preset(names[t]); canny(names[t], 0.15, 0.4); canny(names[t], 0.1, 0.3); }
    return 0;
}
