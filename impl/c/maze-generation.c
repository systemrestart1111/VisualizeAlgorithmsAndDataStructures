#include <stdio.h>

#define ROWS 8
#define COLS 12
long long state = 42;

/* Park–Miller 亂數產生器：五種語言用同一個公式，因此會產生同一個迷宮 */
int rand_k(int k) {
    state = state * 48271 % 2147483647;
    return (int)(state % k);
}

int main(void) {
    /* 迷宮格子 (r, c) 位於字元圖的 (2r+1, 2c+1)；一開始全是牆 */
    char grid[2 * ROWS + 1][2 * COLS + 2];
    int visited[ROWS][COLS] = {{0}}, DR[] = {-1, 0, 1, 0}, DC[] = {0, 1, 0, -1}; /* 上、右、下、左 */
    for (int r = 0; r < 2 * ROWS + 1; r++) {
        for (int c = 0; c < 2 * COLS + 1; c++) grid[r][c] = '#';
        grid[r][2 * COLS + 1] = '\0';
    }
    /* 遞迴回溯法（用堆疊實作）：從目前格子隨機走向一個沒去過的鄰格並打通中間的牆；四周都去過就退回上一格 */
    int sr[ROWS * COLS], sc[ROWS * COLS], top = 0;
    sr[top] = 0; sc[top++] = 0;
    visited[0][0] = 1;
    grid[1][1] = ' ';
    while (top) {
        int r = sr[top - 1], c = sc[top - 1], nr_[4], nc_[4], k = 0;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d];
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc]) { nr_[k] = nr; nc_[k++] = nc; }
        }
        if (!k) { top--; continue; }
        int pick = rand_k(k), nr = nr_[pick], nc = nc_[pick];
        grid[r + nr + 1][c + nc + 1] = ' '; /* 兩格中間的牆 */
        grid[2 * nr + 1][2 * nc + 1] = ' ';
        visited[nr][nc] = 1;
        sr[top] = nr; sc[top++] = nc;
    }
    for (int r = 0; r < 2 * ROWS + 1; r++) printf("%s\n", grid[r]);
    return 0;
}
