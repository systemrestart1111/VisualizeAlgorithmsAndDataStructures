#include <stdio.h>

#define R 6
#define C 10
static const char *G[R] = {"S....#....", ".##..#.##.", "....#....S", ".#.....#..", ".#.##.....", "...#...S.."};

int main(void) {
    int dist[R][C], q[R * C][2], head = 0, tail = 0, best = 0;
    /* 所有起點同時入佇列、距離 0，第一次碰到某格時就是到最近起點的距離 */
    for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) {
        dist[i][j] = -1;
        if (G[i][j] == 'S') { dist[i][j] = 0; q[tail][0] = i; q[tail][1] = j; tail++; }
    }
    int D[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
    while (head < tail) {
        int i = q[head][0], j = q[head][1];
        head++;
        for (int k = 0; k < 4; k++) {
            int a = i + D[k][0], b = j + D[k][1];
            if (a < 0 || b < 0 || a >= R || b >= C || G[a][b] == '#' || dist[a][b] >= 0) continue;
            dist[a][b] = dist[i][j] + 1;
            q[tail][0] = a; q[tail][1] = b; tail++;
        }
    }
    for (int i = 0; i < R; i++) {
        for (int j = 0; j < C; j++) {
            if (j) printf(" ");
            if (G[i][j] == '#') printf(" #"); else if (dist[i][j] < 0) printf(" ."); else printf("%2d", dist[i][j]);
            if (dist[i][j] > best) best = dist[i][j];
        }
        printf("\n");
    }
    printf("farthest cell distance: %d\n", best);
    return 0;
}
