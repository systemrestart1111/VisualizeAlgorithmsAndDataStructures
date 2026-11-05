#include <stdio.h>
#include <stdlib.h>

#define R 5
#define C 8
#define FOUND -1
#define INF 1000000
char grid[R][C + 1] = {"S..#....", ".#.#.##.", ".#...#..", ".####.#.", "......#E"};
int er = 4, ec = 7, path[R * C], len, inpath[R][C];
int DR[] = {0, 1, 0, -1}, DC[] = {1, 0, -1, 0};

int h(int r, int c) { return abs(r - er) + abs(c - ec); }

/* 深度優先，但 f = g + h 超過門檻就剪掉；回傳被剪掉的最小 f 作為下一輪門檻 */
int search(int g, int bound) {
    int u = path[len - 1], r = u / C, c = u % C;
    int f = g + h(r, c);
    if (f > bound) return f;
    if (r == er && c == ec) return FOUND;
    int mn = INF;
    for (int d = 0; d < 4; d++) {
        int nr = r + DR[d], nc = c + DC[d];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] == '#' || inpath[nr][nc]) continue;
        path[len++] = nr * C + nc;
        inpath[nr][nc] = 1;
        int t = search(g + 1, bound);
        if (t == FOUND) return FOUND;
        if (t < mn) mn = t;
        len--;
        inpath[nr][nc] = 0;
    }
    return mn;
}

/* 疊代加深：門檻從 h(S) 開始，每輪提高到上一輪被剪掉的最小 f，記憶體只需 O(路徑長) */
int main(void) {
    int bound = h(0, 0), t;
    path[len++] = 0;
    inpath[0][0] = 1;
    printf("bounds:");
    for (;;) {
        printf(" %d", bound);
        t = search(0, bound);
        if (t == FOUND || t == INF) break;
        bound = t;
    }
    printf("\npath length = %d\n", len - 1);
    for (int i = 1; i < len - 1; i++) grid[path[i] / C][path[i] % C] = '*';
    for (int r = 0; r < R; r++) printf("%s\n", grid[r]);
    return 0;
}
