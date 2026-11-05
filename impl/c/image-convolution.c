#include <stdio.h>

#define N 16
static int A[N][N];

static void shapes(void) {
    for (int r = 0; r < N; r++)
        for (int c = 0; c < N; c++) {
            int v = 30;
            if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
            if ((r - 10.5) * (r - 10.5) + (c - 10.5) * (c - 10.5) <= 12.96) v = 140;
            if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
            A[r][c] = v;
        }
}
static int ref(int i) { while (i < 0 || i >= N) i = i < 0 ? -i : 2 * (N - 1) - i; return i; }
/* 超出範圍時依邊界模式取值：0 補 0、1 複製邊緣、2 鏡射 */
static int at(int r, int c, int mode) {
    if (r >= 0 && r < N && c >= 0 && c < N) return A[r][c];
    if (mode == 0) return 0;
    if (mode == 1) return A[r < 0 ? 0 : r >= N ? N - 1 : r][c < 0 ? 0 : c >= N ? N - 1 : c];
    return A[ref(r)][ref(c)];
}

int main(void) {
    const char *names[3] = {"sharpen", "laplace", "emboss"}, *modes[3] = {"zero", "replicate", "reflect"};
    int K[3][3][3] = {{{0, -1, 0}, {-1, 5, -1}, {0, -1, 0}}, {{0, 1, 0}, {1, -4, 1}, {0, 1, 0}}, {{-2, -1, 0}, {-1, 1, 1}, {0, 1, 2}}};
    shapes();
    for (int k = 0; k < 3; k++)
        for (int m = 0; m < 3; m++) {
            int out[N][N], sum = 0, mn = 1 << 30, mx = -(1 << 30);
            /* 相關運算：核心中心對準像素，對應位置相乘後加總 */
            for (int r = 0; r < N; r++)
                for (int c = 0; c < N; c++) {
                    int s = 0;
                    for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) s += K[k][i + 1][j + 1] * at(r + i, c + j, m);
                    out[r][c] = s;
                    sum += s;
                    if (s < mn) mn = s;
                    if (s > mx) mx = s;
                }
            printf("%s/%s: sum %d, out(0,0) = %d, out(5,4) = %d, min %d, max %d\n", names[k], modes[m], sum, out[0][0], out[5][4], mn, mx);
        }
    return 0;
}
