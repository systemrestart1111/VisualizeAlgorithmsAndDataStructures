#include <stdio.h>

#define INF 1000000

int main(void) {
    const char *grid[] = {"1312", "1#14", "4213", "21#1"}; /* 只能往右或往下，# 為障礙 */
    int R = 4, C = 4, count[4][4] = {{0}}, best[4][4];
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            best[r][c] = INF;
            if (grid[r][c] == '#') continue;
            int v = grid[r][c] - '0';
            if (r == 0 && c == 0) { count[r][c] = 1; best[r][c] = v; continue; }
            int upc = r ? count[r - 1][c] : 0, upb = r ? best[r - 1][c] : INF;
            int lc = c ? count[r][c - 1] : 0, lb = c ? best[r][c - 1] : INF;
            count[r][c] = upc + lc;                    /* 路徑數：來自上方 + 來自左方 */
            best[r][c] = (upb < lb ? upb : lb) + v;    /* 最小路徑和：min(上方, 左方) + 自己 */
        }
    printf("paths = %d\nmin path sum = %d\n", count[R - 1][C - 1], best[R - 1][C - 1]);
    return 0;
}
