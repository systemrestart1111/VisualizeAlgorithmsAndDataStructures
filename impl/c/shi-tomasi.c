#include <math.h>
#include <stdio.h>
#include <stdlib.h>

#define N 16
typedef double Img[N][N];
static Img A, lam;

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
static void blur1(Img a) {
    double k[7], s = 0;
    Img h;
    for (int i = 0; i < 7; i++) { k[i] = exp(-((i - 3) * (i - 3)) / 2.0); s += k[i]; }
    for (int i = 0; i < 7; i++) k[i] /= s;
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int j = -3; j <= 3; j++) t += k[j + 3] * a[r][cl(c + j)]; h[r][c] = t; }
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { double t = 0; for (int i = -3; i <= 3; i++) t += k[i + 3] * h[cl(r + i)][c]; a[r][c] = t; }
}
static int cmp(const void *pa, const void *pb) {
    const int *a = pa, *b = pb;
    double la = lam[a[0]][a[1]], lb = lam[b[0]][b[1]];
    if (la != lb) return la > lb ? -1 : 1;
    return a[0] != b[0] ? a[0] - b[0] : a[1] - b[1];
}

/* λmin = trace/2 − √((Sxx−Syy)²/4 + Sxy²)；依分數由大到小貪婪挑選，保持最小間距 */
static void shi_tomasi(const char *name, double q, int dist) {
    Img Sxx, Syy, Sxy;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            double ix = (-A[cl(r - 1)][cl(c - 1)] + A[cl(r - 1)][cl(c + 1)] - 2 * A[r][cl(c - 1)] + 2 * A[r][cl(c + 1)] - A[cl(r + 1)][cl(c - 1)] + A[cl(r + 1)][cl(c + 1)]) / 8;
            double iy = (-A[cl(r - 1)][cl(c - 1)] - 2 * A[cl(r - 1)][c] - A[cl(r - 1)][cl(c + 1)] + A[cl(r + 1)][cl(c - 1)] + 2 * A[cl(r + 1)][c] + A[cl(r + 1)][cl(c + 1)]) / 8;
            Sxx[r][c] = ix * ix; Syy[r][c] = iy * iy; Sxy[r][c] = ix * iy;
        }
    blur1(Sxx); blur1(Syy); blur1(Sxy);
    double mx = -1e300;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            double v = (Sxx[r][c] + Syy[r][c]) / 2 - sqrt((Sxx[r][c] - Syy[r][c]) / 2 * ((Sxx[r][c] - Syy[r][c]) / 2) + Sxy[r][c] * Sxy[r][c]);
            lam[r][c] = floor(v * 1000 + 0.5) / 1000;
            if (lam[r][c] > mx) mx = lam[r][c];
        }
    int cand[N * N][2], nc = 0, chosen[N * N][2], ns = 0;
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) if (mx > 0 && lam[r][c] >= q * mx) { cand[nc][0] = r; cand[nc][1] = c; nc++; }
    qsort(cand, nc, sizeof cand[0], cmp);
    for (int k = 0; k < nc; k++) {
        int ok = 1;
        for (int t = 0; t < ns; t++) if (hypot(cand[k][0] - chosen[t][0], cand[k][1] - chosen[t][1]) < dist) ok = 0;
        if (ok) { chosen[ns][0] = cand[k][0]; chosen[ns][1] = cand[k][1]; ns++; }
    }
    printf("%s, quality %.1f, min distance %d: %d candidates, %d chosen:", name, q, dist, nc, ns);
    for (int t = 0; t < ns; t++) printf(" (%d,%d)", chosen[t][0], chosen[t][1]);
    printf("\n");
}

int main(void) {
    preset(1); shi_tomasi("checker", 0.1, 3); shi_tomasi("checker", 0.1, 5); shi_tomasi("checker", 0.3, 3);
    preset(0); shi_tomasi("shapes", 0.1, 3);
    return 0;
}
