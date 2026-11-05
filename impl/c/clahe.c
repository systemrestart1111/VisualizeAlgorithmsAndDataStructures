#include <math.h>
#include <stdio.h>
#include <stdlib.h>

#define N 16
static int A[N][N];

static void preset(int low) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            if (low) v = 95 + (int)floor((v - 30) / 170.0 * 35 + 0.5) + (r / 4) * 3;
            A[r][c] = v;
        }
}
static int rnd(double x) { return x >= 0 ? (int)(x + 0.5) : -(int)(-x + 0.5); }

/* 每格直方圖裁切上限後平均分回（總數不變），各自求對應表，再以雙線性內插消除接縫 */
static void clahe(const char *name, int T, int clip) {
    static int maps[4][4][256];
    int ts = N / T, P = ts * ts, limit = (clip * P + 255) / 256, ok = 1;
    if (limit < 1) limit = 1;
    for (int ti = 0; ti < T; ti++)
        for (int tj = 0; tj < T; tj++) {
            int h[256] = {0}, excess = 0, tot = 0, s = 0;
            for (int i = 0; i < ts; i++) for (int j = 0; j < ts; j++) h[A[ti * ts + i][tj * ts + j]]++;
            for (int v = 0; v < 256; v++) if (h[v] > limit) { excess += h[v] - limit; h[v] = limit; }
            for (int v = 0; v < 256; v++) { h[v] += excess / 256 + (v < excess % 256 ? 1 : 0); tot += h[v]; }
            if (tot != P) ok = 0;
            for (int v = 0; v < 256; v++) { s += h[v]; maps[ti][tj][v] = rnd(s * 255.0 / P); }
        }
    int no[N][N], out[N][N], sum = 0;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v = A[r][c];
            no[r][c] = maps[r / ts][c / ts][v];
            double fy = (r + 0.5) / ts - 0.5, fx = (c + 0.5) / ts - 0.5;
            int y0 = (int)floor(fy), x0 = (int)floor(fx);
            y0 = y0 < 0 ? 0 : y0 > T - 1 ? T - 1 : y0;
            x0 = x0 < 0 ? 0 : x0 > T - 1 ? T - 1 : x0;
            int y1 = y0 + 1 > T - 1 ? T - 1 : y0 + 1, x1 = x0 + 1 > T - 1 ? T - 1 : x0 + 1;
            double wy = fy - y0, wx = fx - x0;
            wy = wy < 0 ? 0 : wy > 1 ? 1 : wy;
            wx = wx < 0 ? 0 : wx > 1 ? 1 : wx;
            out[r][c] = rnd((1 - wy) * ((1 - wx) * maps[y0][x0][v] + wx * maps[y0][x1][v]) + wy * ((1 - wx) * maps[y1][x0][v] + wx * maps[y1][x1][v]));
            sum += out[r][c];
        }
    int s1 = 0, s2 = 0;
    for (int k = 1; k < T; k++)
        for (int i = 0; i < N; i++) {
            s1 += abs(no[i][k * ts] - no[i][k * ts - 1]) + abs(no[k * ts][i] - no[k * ts - 1][i]);
            s2 += abs(out[i][k * ts] - out[i][k * ts - 1]) + abs(out[k * ts][i] - out[k * ts - 1][i]);
        }
    printf("%s, %dx%d tiles, clip %d: limit %d, totals preserved %s, seam without/with interpolation %d/%d, output sum %d\n", name, T, T, clip, limit, ok ? "True" : "False", s1, s2, sum);
}

int main(void) {
    int cfg[3][2] = {{2, 8}, {4, 4}, {2, 32}};
    preset(1); for (int k = 0; k < 3; k++) clahe("lowcontrast", cfg[k][0], cfg[k][1]);
    preset(0); for (int k = 0; k < 3; k++) clahe("shapes", cfg[k][0], cfg[k][1]);
    return 0;
}
