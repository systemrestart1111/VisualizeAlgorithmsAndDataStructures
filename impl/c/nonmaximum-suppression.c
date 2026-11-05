#include <math.h>
#include <stdio.h>

#define N 16
static int S[N][N];

static void score_map(void) {
    int bumps[5][3] = {{3, 3, 100}, {3, 6, 100}, {10, 4, 80}, {8, 12, 120}, {13, 13, 60}};
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            double s = 0;
            for (int k = 0; k < 5; k++) s += bumps[k][2] * exp(-((r - bumps[k][0]) * (r - bumps[k][0]) + (c - bumps[k][1]) * (c - bumps[k][1])) / 3.0);
            S[r][c] = (int)floor(s + 0.5);
        }
    S[12][7] = S[12][8] = S[13][7] = S[13][8] = 70;
}

/* 不小於視窗內所有鄰居才保留；相等時只留光柵順序最早的 */
static void nms(int rad, int thr) {
    int kept[64][2], n = 0;
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) {
            if (S[i][j] < thr) continue;
            int ok = 1;
            for (int a = -rad; a <= rad; a++)
                for (int b = -rad; b <= rad; b++) {
                    int y = i + a, x = j + b;
                    if ((a || b) && y >= 0 && y < N && x >= 0 && x < N)
                        if (S[y][x] > S[i][j] || (S[y][x] == S[i][j] && (a < 0 || (a == 0 && b < 0)))) ok = 0;
                }
            if (ok) { kept[n][0] = i; kept[n][1] = j; n++; }
        }
    printf("window %dx%d, threshold %d: %d kept:", 2 * rad + 1, 2 * rad + 1, thr, n);
    for (int k = 0; k < n; k++) printf(" (%d,%d)=%d", kept[k][0], kept[k][1], S[kept[k][0]][kept[k][1]]);
    printf("\n");
}

int main(void) {
    score_map();
    nms(1, 30);
    nms(2, 30);
    nms(1, 80);
    return 0;
}
