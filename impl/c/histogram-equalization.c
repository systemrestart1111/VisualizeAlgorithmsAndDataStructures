#include <math.h>
#include <stdio.h>

#define N 16
static int A[N][N];

static void preset(const char *name) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            if (name[0] == 'l') v = 95 + (int)floor((v - 30) / 170.0 * 35 + 0.5) + (r / 4) * 3;
            else if (name[0] == 'f') v = 120;
            A[r][c] = v;
        }
}

int main(void) {
    const char *names[3] = {"lowcontrast", "shapes", "flat"};
    for (int k = 0; k < 3; k++) {
        preset(names[k]);
        int hist[256] = {0}, cdf[256], s = 0, cmin = -1;
        for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) hist[A[r][c]]++;
        for (int v = 0; v < 256; v++) { s += hist[v]; cdf[v] = s; if (cmin < 0 && s > 0) cmin = s; }
        /* map[v] = round((CDF[v] − CDF_min) / (N − CDF_min) × 255)；常數影像原樣輸出 */
        if (cmin == N * N) { printf("%s: constant image, unchanged\n", names[k]); continue; }
        printf("%s:", names[k]);
        for (int v = 0; v < 256; v++) if (hist[v]) printf(" %d->%d", v, (int)floor((cdf[v] - cmin) * 255.0 / (N * N - cmin) + 0.5));
        printf("\n");
    }
    return 0;
}
