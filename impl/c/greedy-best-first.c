#include <stdio.h>
#include <stdlib.h>

#define R 9
#define C 16
char grid[R][C + 1] = {"S.....#.........", ".####.#.#######.", ".#....#.......#.", ".#.#######.##.#.", ".#..........#...",
                       ".#######.#.###.#", ".........#...#..", "########.####.#.", "..............#E"};
int er, ec, par[R][C], seen[R][C];
int DR[] = {0, 1, 0, -1}, DC[] = {1, 0, -1, 0};

int h(int r, int c) { return abs(r - er) + abs(c - ec); }

typedef struct { int h, r, c; } Item;
static int less(Item a, Item b) {
    if (a.h != b.h) return a.h < b.h;
    if (a.r != b.r) return a.r < b.r;
    return a.c < b.c;
}

/* 只看 h（離終點多近）來決定下一步：通常很快，但不保證最短路徑 */
int main(void) {
    int sr = 0, sc = 0, expanded = 0;
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (grid[r][c] == 'S') { sr = r; sc = c; }
            if (grid[r][c] == 'E') { er = r; ec = c; }
        }
    static Item open[R * C];
    int n = 0;
    seen[sr][sc] = 1;
    open[n++] = (Item){h(sr, sc), sr, sc};
    while (n) {
        int best = 0;
        for (int i = 1; i < n; i++) if (less(open[i], open[best])) best = i;
        Item u = open[best];
        open[best] = open[--n];
        expanded++;
        if (u.r == er && u.c == ec) break;
        for (int d = 0; d < 4; d++) {
            int nr = u.r + DR[d], nc = u.c + DC[d];
            if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#' || seen[nr][nc]) continue;
            seen[nr][nc] = 1;
            par[nr][nc] = u.r * C + u.c;
            open[n++] = (Item){h(nr, nc), nr, nc};
        }
    }
    int length = 1;
    for (int p = par[er][ec]; p != sr * C + sc; p = par[p / C][p % C], length++) grid[p / C][p % C] = '*';
    printf("path length = %d expanded = %d\n", length, expanded);
    for (int r = 0; r < R; r++) printf("%s\n", grid[r]);
    return 0;
}
