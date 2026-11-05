#include <stdio.h>

static int a[12][12];
static int D4[4][2] = {{-1, 0}, {0, -1}, {0, 1}, {1, 0}};
static int D8[8][2] = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};

/* 外框（色 2）左上角缺一格，內部只能斜著碰到外面 */
static void grid(void) {
    for (int i = 0; i < 12; i++) for (int j = 0; j < 12; j++) a[i][j] = (i >= 2 && i <= 9 && j >= 2 && j <= 9 && (i == 2 || i == 9 || j == 2 || j == 9)) ? 2 : 1;
    a[2][2] = 1;
    for (int i = 5; i <= 6; i++) for (int j = 5; j <= 6; j++) a[i][j] = 3;
}
/* BFS 把與種子相連、顏色相同的格子塗成新顏色；新舊色相同時直接結束 */
static int flood(int sr, int sc, int nw, int conn) {
    int old = a[sr][sc], q[144][2], h = 0, t = 0, count = 1;
    if (old == nw) return 0;
    a[sr][sc] = nw;
    q[t][0] = sr; q[t][1] = sc; t++;
    while (h < t) {
        int r = q[h][0], c = q[h][1];
        h++;
        for (int k = 0; k < conn; k++) {
            int y = r + (conn == 4 ? D4[k][0] : D8[k][0]), x = c + (conn == 4 ? D4[k][1] : D8[k][1]);
            if (y >= 0 && y < 12 && x >= 0 && x < 12 && a[y][x] == old) { a[y][x] = nw; count++; q[t][0] = y; q[t][1] = x; t++; }
        }
    }
    return count;
}

int main(void) {
    int tests[6][4] = {{4, 4, 4, 4}, {4, 4, 4, 8}, {0, 0, 5, 4}, {5, 5, 3, 4}, {5, 5, 1, 8}, {2, 5, 4, 4}};
    for (int k = 0; k < 6; k++) {
        grid();
        int n = flood(tests[k][0], tests[k][1], tests[k][2], tests[k][3]), sum = 0;
        for (int i = 0; i < 12; i++) for (int j = 0; j < 12; j++) sum += a[i][j];
        printf("seed (%d,%d) -> color %d, %d-connected: %d cells filled%s, grid sum %d\n", tests[k][0], tests[k][1], tests[k][2], tests[k][3], n, n == 0 ? " (same color, nothing to do)" : "", sum);
    }
    return 0;
}
