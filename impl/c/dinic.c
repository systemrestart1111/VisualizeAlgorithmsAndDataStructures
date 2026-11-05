#include <stdio.h>
#include <string.h>

#define N 6
const char *NAMES = "SACBDT";
int cap[N][N], level[N], it[N], S = 0, T = 5;

int idx(char c) { return (int)(strchr(NAMES, c) - NAMES); }

/* 建立層次圖：level[v] = S 到 v 的最少邊數 */
int bfs_level(void) {
    int q[N], head = 0, tail = 0;
    for (int v = 0; v < N; v++) level[v] = -1;
    level[S] = 0;
    q[tail++] = S;
    while (head < tail) {
        int u = q[head++];
        for (int v = 0; v < N; v++)
            if (level[v] < 0 && cap[u][v] > 0) { level[v] = level[u] + 1; q[tail++] = v; }
    }
    return level[T] >= 0;
}

/* 只沿 level 加一的邊前進（阻塞流）；it[u] 記錄 u 下一條要試的邊，走不通的邊不再重試 */
int dfs(int u, int pushed) {
    if (u == T) return pushed;
    for (; it[u] < N; it[u]++) {
        int v = it[u];
        if (cap[u][v] > 0 && level[v] == level[u] + 1) {
            int d = dfs(v, pushed < cap[u][v] ? pushed : cap[u][v]);
            if (d) { cap[u][v] -= d; cap[v][u] += d; return d; }
        }
    }
    return 0;
}

int main(void) {
    const char *E[] = {"SA10", "SC10", "AB4", "AC2", "AD8", "CD9", "DB6", "BT10", "DT10"};
    for (int i = 0; i < 9; i++) {
        int c;
        sscanf(E[i] + 2, "%d", &c);
        cap[idx(E[i][0])][idx(E[i][1])] += c;
    }
    int flow = 0, phase = 0;
    while (bfs_level()) {
        int got = 0, d;
        memset(it, 0, sizeof it);
        while ((d = dfs(S, 1 << 30))) got += d;
        flow += got;
        printf("phase %d: levels", ++phase);
        for (int v = 0; v < N; v++) if (level[v] >= 0) printf(" %c=%d", NAMES[v], level[v]);
        printf(" blocking flow +%d\n", got);
    }
    printf("max flow = %d\n", flow);
    int reach[N] = {0}, st[N], top = 0;
    reach[S] = 1;
    st[top++] = S;
    while (top) {
        int u = st[--top];
        for (int v = 0; v < N; v++) if (cap[u][v] > 0 && !reach[v]) { reach[v] = 1; st[top++] = v; }
    }
    printf("min cut S-side:");
    for (int v = 0; v < N; v++) if (reach[v]) printf(" %c", NAMES[v]);
    printf("\n");
    return 0;
}
