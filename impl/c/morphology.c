#include <stdio.h>
#include <string.h>

#define N 16
typedef int Img[N][N];
static int D4[4][2] = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}};

static void blobs(Img a) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++)
            a[r][c] = (r - 5.5) * (r - 5.5) + (c - 5) * (c - 5) <= 16 || (r - 9) * (r - 9) + (c - 10.5) * (c - 10.5) <= 16 || (r - 13) * (r - 13) + (c - 2.5) * (c - 2.5) <= 3.5;
}
static void noisy_bin(Img a) {
    long long s = 5;
    blobs(a);
    for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) { s = s * 48271 % 2147483647; if (s % 100 < 6) a[r][c] = 1 - a[r][c]; }
}
/* 侵蝕：蓋到的全為 1 才為 1；膨脹：蓋到任一為 1 就為 1；邊界外視為 0 */
static void morph(Img a, Img out, int se[][2], int ns, int erode) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int all = 1, any = 0;
            for (int k = 0; k < ns; k++) {
                int y = r + se[k][0], x = c + se[k][1];
                int v = y >= 0 && y < N && x >= 0 && x < N ? a[y][x] : 0;
                all &= v; any |= v;
            }
            out[r][c] = erode ? all : any;
        }
}
static int count(Img a) { int s = 0; for (int r = 0; r < N; r++) for (int c = 0; c < N; c++) s += a[r][c]; return s; }
static int components(Img a) {
    int seen[N][N] = {{0}}, n = 0, st[N * N][2];
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (!a[r][c] || seen[r][c]) continue;
            n++;
            int top = 0;
            st[top][0] = r; st[top][1] = c; top++;
            seen[r][c] = 1;
            while (top) {
                top--;
                int y = st[top][0], x = st[top][1];
                for (int k = 0; k < 4; k++) {
                    int yy = y + D4[k][0], xx = x + D4[k][1];
                    if (yy >= 0 && yy < N && xx >= 0 && xx < N && a[yy][xx] && !seen[yy][xx]) { seen[yy][xx] = 1; st[top][0] = yy; st[top][1] = xx; top++; }
                }
            }
        }
    return n;
}

int main(void) {
    int sq[9][2] = {{0, 0}, {-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};
    int cr[5][2] = {{0, 0}, {-1, 0}, {0, -1}, {0, 1}, {1, 0}};
    Img A, er, di, op, cl;
    for (int t = 0; t < 2; t++) {
        if (t == 0) noisy_bin(A); else blobs(A);
        for (int s = 0; s < 2; s++) {
            int (*se)[2] = s == 0 ? sq : cr, ns = s == 0 ? 9 : 5;
            morph(A, er, se, ns, 1);
            morph(A, di, se, ns, 0);
            morph(er, op, se, ns, 0);
            morph(di, cl, se, ns, 1);
            printf("%s, %s: input %d (%d parts), erode %d, dilate %d, open %d (%d parts), close %d (%d parts)\n", t == 0 ? "noisy blobs" : "blobs", s == 0 ? "square" : "cross", count(A), components(A), count(er), count(di), count(op), components(op), count(cl), components(cl));
        }
    }
    return 0;
}
