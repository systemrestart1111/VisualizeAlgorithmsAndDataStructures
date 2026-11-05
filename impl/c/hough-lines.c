#include <math.h>
#include <stdio.h>

#define N 16
#define TH 60

int main(void) {
    int E[N][N] = {{0}};
    for (int c = 1; c <= 14; c++) E[4][c] = 1;
    for (int k = 1; k <= 14; k++) E[15 - k][k] = 1;
    for (int r = 7; r <= 15; r++) E[r][12] = 1;
    const double PI = 3.14159265358979323846;
    int D = (int)ceil(hypot(N, N)), npts = 0;
    static int acc[64][TH];
    double cs[TH], sn[TH];
    for (int t = 0; t < TH; t++) { cs[t] = cos(t * 3 * PI / 180); sn[t] = sin(t * 3 * PI / 180); }
    /* 每個邊緣點對 θ = 0°, 3°, …, 177° 投票給 ρ = round(x cos θ + y sin θ) */
    for (int y = 0; y < N; y++)
        for (int x = 0; x < N; x++) {
            if (!E[y][x]) continue;
            npts++;
            for (int t = 0; t < TH; t++) acc[(int)floor(x * cs[t] + y * sn[t] + 0.5) + D][t]++;
        }
    int thrs[2] = {8, 12};
    for (int k = 0; k < 2; k++) {
        int thr = thrs[k], first = 1;
        printf("%d edge points, threshold %d: ", npts, thr);
        /* 取 5×5 鄰域內的峰值（θ 跨過 180° 時 ρ 變號） */
        for (int i = 0; i <= 2 * D; i++)
            for (int t = 0; t < TH; t++) {
                if (acc[i][t] < thr) continue;
                int ok = 1;
                for (int a = -2; a <= 2; a++)
                    for (int b = -2; b <= 2; b++) {
                        if (!a && !b) continue;
                        int y = i + a, tt = ((t + b) % TH + TH) % TH, yy = (t + b < 0 || t + b >= TH) ? 2 * D - y : y;
                        if (yy >= 0 && yy <= 2 * D && (acc[yy][tt] > acc[i][t] || (acc[yy][tt] == acc[i][t] && (a < 0 || (a == 0 && b < 0))))) ok = 0;
                    }
                if (ok) { printf("%stheta %d, rho %d, votes %d", first ? "" : "; ", t * 3, i - D, acc[i][t]); first = 0; }
            }
        printf("\n");
    }
    return 0;
}
