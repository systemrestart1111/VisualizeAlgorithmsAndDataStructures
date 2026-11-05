#include <math.h>
#include <stdio.h>
#include <stdlib.h>

#define N 16
static int clean[N][N], A[N][N];

static void build(void) {
    long long s = 7;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            clean[r][c] = v;
            s = s * 48271 % 2147483647;
            int t = (int)(s % 100);
            A[r][c] = t < 5 ? 0 : t < 10 ? 255 : v;
        }
}
static int cmp(const void *a, const void *b) { return *(const int *)a - *(const int *)b; }
static int clampi(int x) { return x < 0 ? 0 : x >= N ? N - 1 : x; }

int main(void) {
    build();
    int noise = 0, bad = 0;
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { noise += A[r][c] == 0 || A[r][c] == 255; bad += abs(A[r][c] - clean[r][c]) > 40; }
    printf("input: %d impulse pixels, %d pixels off by > 40\n", noise, bad);
    for (int rad = 1; rad <= 2; rad++) {
        int k = 2 * rad + 1, mn = 0, mb = 0, ab = 0, sum = 0;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                /* 每個像素換成視窗內的中位數（邊界複製）；對照平均濾波 */
                int w[25], n = 0;
                double mean = 0;
                for (int i = -rad; i <= rad; i++) for (int j = -rad; j <= rad; j++) { w[n] = A[clampi(r + i)][clampi(c + j)]; mean += w[n]; n++; }
                qsort(w, n, sizeof(int), cmp);
                int m = w[n / 2];
                mean /= n;
                sum += m;
                mn += m == 0 || m == 255;
                mb += abs(m - clean[r][c]) > 40;
                ab += fabs(mean - clean[r][c]) > 40;
            }
        printf("%dx%d: median leaves %d impulses, %d off by > 40 (sum %d); mean filter %d off by > 40\n", k, k, mn, mb, sum, ab);
    }
    return 0;
}
