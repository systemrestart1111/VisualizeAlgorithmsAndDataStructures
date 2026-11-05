#include <stdio.h>

#define N 6
int adj[N][N], color[N], m;

/* 依序替每個點試顏色 1..m，與已著色的鄰居衝突就換色；都不行就回溯到上一個點 */
int bt(int v) {
    if (v == N) return 1;
    for (int c = 1; c <= m; c++) {
        int okc = 1;
        for (int u = 0; u < N; u++)
            if (adj[v][u] && color[u] == c) okc = 0;
        if (!okc) continue;
        color[v] = c;
        if (bt(v + 1)) return 1;
        color[v] = 0;
    }
    return 0;
}

int main(void) {
    const char *E = "AB AC AD BC BE CD CE DF EF CF";
    for (const char *p = E; *p; p += p[2] ? 3 : 2) adj[p[0] - 'A'][p[1] - 'A'] = adj[p[1] - 'A'][p[0] - 'A'] = 1;
    for (m = 3; m <= 4; m++) {
        for (int v = 0; v < N; v++) color[v] = 0;
        printf("m = %d:", m);
        if (!bt(0)) printf(" no solution\n");
        else {
            for (int v = 0; v < N; v++) printf(" %c=%d", 'A' + v, color[v]);
            printf("\n");
        }
    }
    return 0;
}
