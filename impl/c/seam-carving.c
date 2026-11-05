#include <stdio.h>
#include <stdlib.h>

#define N 16
static int A[N][N], W;

static void preset(int step) {
    W = N;
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            if (step) { A[r][c] = (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0); continue; }
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            A[r][c] = v;
        }
}
static int g(int r, int c) { return A[r < 0 ? 0 : r >= N ? N - 1 : r][c < 0 ? 0 : c >= W ? W - 1 : c]; }

/* e = |Gx| + |Gy|；M[r][c] = e + min(M[r−1][c−1..c+1])；最後一列取最小，再往上追溯 */
static int find_seam(int *seam) {
    int M[N][N];
    for (int r = 0; r < N; r++)
        for (int c = 0; c < W; c++) {
            int gx = g(r - 1, c + 1) + 2 * g(r, c + 1) + g(r + 1, c + 1) - g(r - 1, c - 1) - 2 * g(r, c - 1) - g(r + 1, c - 1);
            int gy = g(r + 1, c - 1) + 2 * g(r + 1, c) + g(r + 1, c + 1) - g(r - 1, c - 1) - 2 * g(r - 1, c) - g(r - 1, c + 1);
            M[r][c] = abs(gx) + abs(gy);
        }
    for (int r = 1; r < N; r++)
        for (int c = 0; c < W; c++) {
            int m = M[r - 1][c];
            if (c > 0 && M[r - 1][c - 1] < m) m = M[r - 1][c - 1];
            if (c < W - 1 && M[r - 1][c + 1] < m) m = M[r - 1][c + 1];
            M[r][c] += m;
        }
    int best = 0;
    for (int c = 1; c < W; c++) if (M[N - 1][c] < M[N - 1][best]) best = c;
    seam[N - 1] = best;
    for (int r = N - 2; r >= 0; r--) {
        int b = seam[r + 1];
        if (seam[r + 1] - 1 >= 0 && M[r][seam[r + 1] - 1] < M[r][b]) b = seam[r + 1] - 1;
        if (seam[r + 1] + 1 < W && M[r][seam[r + 1] + 1] < M[r][b]) b = seam[r + 1] + 1;
        seam[r] = b;
    }
    return M[N - 1][seam[N - 1]];
}

int main(void) {
    for (int t = 0; t < 2; t++) {
        const char *name = t ? "step" : "shapes";
        preset(t);
        for (int s = 1; s <= 3; s++) {
            int seam[N], cost = find_seam(seam), ok = 1;
            for (int r = 1; r < N; r++) if (abs(seam[r] - seam[r - 1]) > 1) ok = 0;
            printf("%s seam %d: cost %d, columns", name, s, cost);
            for (int r = 0; r < N; r++) printf(" %d", seam[r]);
            printf(", connected %s\n", ok ? "True" : "False");
            for (int r = 0; r < N; r++) for (int c = seam[r]; c < W - 1; c++) A[r][c] = A[r][c + 1];
            W--;
        }
        int sum = 0;
        for (int r = 0; r < N; r++) for (int c = 0; c < W; c++) sum += A[r][c];
        printf("%s: width now %d, pixel sum %d\n", name, W, sum);
    }
    return 0;
}
