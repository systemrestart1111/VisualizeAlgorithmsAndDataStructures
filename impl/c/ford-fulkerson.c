#include <stdio.h>
#include <string.h>

#define N 6
const char *NAMES = "SACBDT";
int cap[N][N], S = 0, T = 5, path[N], plen;

int idx(char c) { return (int)(strchr(NAMES, c) - NAMES); }

/* 在殘餘網路上用 DFS 找一條 S→T 的增廣路徑 */
int dfs(int u, int *seen) {
    if (u == T) return 1;
    seen[u] = 1;
    for (int v = 0; v < N; v++)
        if (!seen[v] && cap[u][v] > 0) {
            path[plen++] = v;
            if (dfs(v, seen)) return 1;
            plen--;
        }
    return 0;
}

int main(void) {
    const char *E[] = {"SA10", "SC10", "AB4", "AC2", "AD8", "CD9", "DB6", "BT10", "DT10"};
    for (int i = 0; i < 9; i++) {
        int c;
        sscanf(E[i] + 2, "%d", &c);
        cap[idx(E[i][0])][idx(E[i][1])] += c; /* 殘餘容量 */
    }
    int flow = 0;
    for (;;) {
        int seen[N] = {0};
        plen = 0;
        path[plen++] = S;
        if (!dfs(S, seen)) break;
        int b = 1 << 30;
        for (int i = 0; i + 1 < plen; i++) if (cap[path[i]][path[i + 1]] < b) b = cap[path[i]][path[i + 1]]; /* 瓶頸 */
        for (int i = 0; i + 1 < plen; i++) {
            cap[path[i]][path[i + 1]] -= b;
            cap[path[i + 1]][path[i]] += b; /* 反向邊讓之後可以「退回」流量 */
        }
        flow += b;
        for (int i = 0; i < plen; i++) printf(i ? " -> %c" : "%c", NAMES[path[i]]);
        printf(" (+%d)\n", b);
    }
    printf("max flow = %d\n", flow);
    /* 最後在殘餘網路上從 S 能到達的點就是最小割的 S 側 */
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
