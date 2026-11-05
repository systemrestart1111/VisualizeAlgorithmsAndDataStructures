#include <stdio.h>
#include <string.h>

#define R 9
#define C 16
const char *grid[R] = {"S.....#.........", ".####.#.#######.", ".#....#.......#.", ".#.#######.##.#.", ".#..........#...",
                       ".#######.#.###.#", ".........#...#..", "########.####.#.", "..............#E"};
int DR[] = {0, 1, 0, -1}, DC[] = {1, 0, -1, 0};
int ds[R * C], de[R * C], best_len, best_cell;

/* 把一側展開一整層；若碰到另一側已拜訪的格子，記下最短的接合點 */
int expand(int *frontier, int n, int *dist, int *other) {
    int nxt[R * C], m = 0;
    best_len = -1;
    for (int i = 0; i < n; i++) {
        int u = frontier[i], r = u / C, c = u % C;
        for (int d = 0; d < 4; d++) {
            int nr = r + DR[d], nc = c + DC[d], v = nr * C + nc;
            if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#') continue;
            if (other[v] >= 0) {
                int cand = dist[u] + 1 + other[v];
                if (best_len < 0 || cand < best_len) { best_len = cand; best_cell = v; }
            }
            if (dist[v] < 0) { dist[v] = dist[u] + 1; nxt[m++] = v; }
        }
    }
    memcpy(frontier, nxt, m * sizeof(int));
    return m;
}

/* 從起點與終點同時做 BFS，每次展開較小的那一側；兩邊相遇時即得最短路徑 */
int main(void) {
    int fs[R * C], fe[R * C], ns = 1, ne = 1;
    memset(ds, -1, sizeof ds);
    memset(de, -1, sizeof de);
    for (int r = 0; r < R; r++)
        for (int c = 0; c < C; c++) {
            if (grid[r][c] == 'S') { fs[0] = r * C + c; ds[r * C + c] = 0; }
            if (grid[r][c] == 'E') { fe[0] = r * C + c; de[r * C + c] = 0; }
        }
    best_len = -1;
    while (ns && ne) {
        if (ns <= ne) ns = expand(fs, ns, ds, de);
        else ne = expand(fe, ne, de, ds);
        if (best_len >= 0) break;
    }
    int visited = 0;
    for (int i = 0; i < R * C; i++) visited += (ds[i] >= 0) + (de[i] >= 0);
    printf("path length = %d\nmeet at (%d, %d)\nvisited cells = %d\n", best_len, best_cell / C, best_cell % C, visited);
    return 0;
}
