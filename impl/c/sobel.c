#include <math.h>
#include <stdio.h>
#include <stdlib.h>

#define N 16
static int A[N][N];

static void preset(const char *name) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v;
            if (name[0] == 's' && name[1] == 'h') {
                v = 30;
                if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
                if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
                if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            } else if (name[0] == 's') v = (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0);
            else v = ((r >> 2) + (c >> 2)) % 2 ? 210 : 40;
            A[r][c] = v;
        }
}
static int g(int r, int c) { return A[r < 0 ? 0 : r >= N ? N - 1 : r][c < 0 ? 0 : c >= N ? N - 1 : c]; }

int main(void) {
    const char *names[3] = {"shapes", "step", "checker"};
    int KX[3][3] = {{-1, 0, 1}, {-2, 0, 2}, {-1, 0, 1}}, KY[3][3] = {{-1, -2, -1}, {0, 0, 0}, {1, 2, 1}};
    for (int t = 0; t < 3; t++) {
        preset(names[t]);
        int gx[N][N], gy[N][N], sx = 0, sy = 0, flat = 0, zero = 1;
        double mx = 0;
        for (int r = 0; r < N; r++)
            for (int c = 0; c < N; c++) {
                int a = 0, b = 0;
                for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) { a += KX[i + 1][j + 1] * g(r + i, c + j); b += KY[i + 1][j + 1] * g(r + i, c + j); }
                gx[r][c] = a; gy[r][c] = b;
                sx += abs(a); sy += abs(b);
                if (hypot(a, b) > mx) mx = hypot(a, b);
            }
        for (int r = 1; r < N - 1; r++)
            for (int c = 1; c < N - 1; c++) {
                int same = 1;
                for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) if (A[r + i][c + j] != A[r][c]) same = 0;
                if (same) { flat++; if (gx[r][c] || gy[r][c]) zero = 0; }
            }
        printf("%s: sum|Gx| = %d, sum|Gy| = %d, Gx(5,7) = %d, Gy(6,4) = %d, max magnitude %.2f, %d flat pixels all zero %s\n", names[t], sx, sy, gx[5][7], gy[6][4], mx, flat, zero ? "True" : "False");
    }
    return 0;
}
