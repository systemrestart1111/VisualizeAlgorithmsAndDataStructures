#include <stdio.h>

#define R 9
#define C 16
char grid[R][C + 1] = {"S.#.......#.....", ".##.#####.#.###.", "....#...#...#...", ".####.#.#####.#.", "......#.......#.",
                       "#######.#####.#.", "......#.#.....#.", ".####.#.#.#####.", ".#....#...#....E"};
int seen[R][C], DR[] = {0, 1, 0, -1}, DC[] = {1, 0, -1, 0}; /* 右、下、左、上 */

/* 往四個方向深入；走到死路就退回上一格換方向（回溯），到達 E 時整條路徑都還在遞迴堆疊上 */
int dfs(int r, int c) {
    if (grid[r][c] == 'E') return 1;
    seen[r][c] = 1;
    for (int d = 0; d < 4; d++) {
        int nr = r + DR[d], nc = c + DC[d];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#' || seen[nr][nc]) continue;
        if (grid[nr][nc] == '.') grid[nr][nc] = '*';
        if (dfs(nr, nc)) return 1;
        if (grid[nr][nc] == '*') grid[nr][nc] = '.';
    }
    return 0;
}

int main(void) {
    int found = dfs(0, 0), len = 1;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) len += grid[r][c] == '*';
    printf("found: %s path length = %d\n", found ? "True" : "False", len);
    for (int r = 0; r < R; r++) printf("%s\n", grid[r]);
    return 0;
}
