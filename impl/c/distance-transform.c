#include <stdio.h>
#include <stdlib.h>

#define N 16
typedef int Img[N][N];

static void make(int t, Img a) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (t == 0) a[r][c] = (r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5;
            else a[r][c] = (r >= 2 && r <= 6 && c >= 2 && c <= 7) || (r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96;
        }
}

int main(void) {
    int D4[4][2] = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}}, D8[8][2] = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};
    const char *names[2] = {"blobs", "shapes"};
    Img B;
    for (int t = 0; t < 2; t++) {
        make(t, B);
        for (int m = 0; m < 2; m++) {
            /* 所有背景像素同時入列的多源 BFS：4 鄰接得 L1、8 鄰接得 L∞（都不是歐氏距離） */
            int d[N][N], q[N * N][2], h = 0, tl = 0, conn = m == 0 ? 4 : 8, mx = 0;
            for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { d[r][c] = B[r][c] ? 1000000 : 0; if (!B[r][c]) { q[tl][0] = r; q[tl][1] = c; tl++; } }
            while (h < tl) {
                int r = q[h][0], c = q[h][1];
                h++;
                for (int k = 0; k < conn; k++) {
                    int y = r + (m == 0 ? D4[k][0] : D8[k][0]), x = c + (m == 0 ? D4[k][1] : D8[k][1]);
                    if (y >= 0 && y < N && x >= 0 && x < N && d[y][x] == 1000000) { d[y][x] = d[r][c] + 1; q[tl][0] = y; q[tl][1] = x; tl++; }
                }
            }
            int hist[32] = {0}, ok = 1;
            for (int r = 0; r < N; r++)
                for (int c = 0; c < N; c++) {
                    if (d[r][c] > mx) mx = d[r][c];
                    if (d[r][c]) hist[d[r][c]]++;
                    if (!B[r][c]) continue;
                    int best = 1 << 30;
                    for (int y = 0; y < N; y++) for (int x = 0; x < N; x++) if (!B[y][x]) { int dy = abs(y - r), dx = abs(x - c), v = m == 0 ? dy + dx : (dy > dx ? dy : dx); if (v < best) best = v; }
                    if (best != d[r][c]) ok = 0;
                }
            printf("%s, %s: max distance %d, pixels per distance [", names[t], m == 0 ? "L1" : "Linf", mx);
            for (int k = 1; k <= mx; k++) printf(k > 1 ? ", %d" : "%d", hist[k]);
            printf("], matches brute force %s\n", ok ? "True" : "False");
        }
    }
    return 0;
}
