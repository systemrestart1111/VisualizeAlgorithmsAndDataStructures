#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define R 9
#define C 16
char grid[R][C + 1] = {"S.....#.........", ".####.#.#######.", ".#....#.......#.", ".#.#######.##.#.", ".#..........#...",
                       ".#######.#.###.#", ".........#...#..", "########.####.#.", "..............#E"};
int er, ec, g[R][C], par[R][C], closed[R][C];
int DR[] = {0, 1, 0, -1}, DC[] = {1, 0, -1, 0};

int h(int r, int c) { return abs(r - er) + abs(c - ec); } /* 曼哈頓距離：不會高估，因此 A* 保證最短 */

typedef struct { int f, h, r, c; } Item;
static int less(Item a, Item b) {
    if (a.f != b.f) return a.f < b.f;
    if (a.h != b.h) return a.h < b.h;
    if (a.r != b.r) return a.r < b.r;
    return a.c < b.c;
}

/* 依 f = g + h 由小到大展開（同分時比 h，再比座標）；開放串列用線性掃描取最小 */
int main(void) {
    int sr = 0, sc = 0, expanded = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (grid[r][c] == 'S') { sr = r; sc = c; }
            if (grid[r][c] == 'E') { er = r; ec = c; }
            g[r][c] = 1 << 30;
        }
    static Item open[R * C * 4];
    int n = 0;
    g[sr][sc] = 0;
    par[sr][sc] = -1;
    open[n++] = (Item){h(sr, sc), h(sr, sc), sr, sc};
    while (n) {
        int best = 0;
        for (int i = 1; i < n; i++) if (less(open[i], open[best])) best = i;
        Item u = open[best];
        open[best] = open[--n];
        if (closed[u.r][u.c]) continue;
        closed[u.r][u.c] = 1;
        expanded++;
        if (u.r == er && u.c == ec) break;
        for (int d = 0; d < 4; d++) {
            int nr = u.r + DR[d], nc = u.c + DC[d];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#') continue;
            if (g[u.r][u.c] + 1 < g[nr][nc]) {
                g[nr][nc] = g[u.r][u.c] + 1;
                par[nr][nc] = u.r * C + u.c;
                open[n++] = (Item){g[nr][nc] + h(nr, nc), h(nr, nc), nr, nc};
            }
        }
    }
    printf("path length = %d expanded = %d\n", g[er][ec], expanded);
    for (int p = par[er][ec]; p != sr * C + sc; p = par[p / C][p % C]) grid[p / C][p % C] = '*';
    for (int r = 0; r < R; r++) printf("%s\n", grid[r]);
    return 0;
}
