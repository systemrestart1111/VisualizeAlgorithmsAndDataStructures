#include <stdio.h>
#include <string.h>

#define N 6
const char *NAMES = "SACBDT";
int cap[N][N], S = 0, T = 5;

int idx(char c) { return (int)(strchr(NAMES, c) - NAMES); }

/* 用 BFS 找「邊數最少」的增廣路徑，保證總共只需 O(VE) 次增廣 */
int bfs(int *parent) {
    int q[N], head = 0, tail = 0;
    for (int v = 0; v < N; v++) parent[v] = -1;
    parent[S] = S;
    q[tail++] = S;
    while (head < tail) {
        int u = q[head++];
        for (int v = 0; v < N; v++)
            if (parent[v] < 0 && cap[u][v] > 0) { parent[v] = u; q[tail++] = v; }
    }
    return parent[T] >= 0;
}

int main(void) {
    const char *E[] = {"SA10", "SC10", "AB4", "AC2", "AD8", "CD9", "DB6", "BT10", "DT10"};
    for (int i = 0; i < 9; i++) {
        int c;
        sscanf(E[i] + 2, "%d", &c);
        cap[idx(E[i][0])][idx(E[i][1])] += c;
    }
    int flow = 0, parent[N];
    while (bfs(parent)) {
        int path[N], len = 0, b = 1 << 30;
        for (int v = T; v != S; v = parent[v]) path[len++] = v;
        path[len++] = S;
        for (int i = len - 1; i > 0; i--) if (cap[path[i]][path[i - 1]] < b) b = cap[path[i]][path[i - 1]];
        for (int i = len - 1; i > 0; i--) { cap[path[i]][path[i - 1]] -= b; cap[path[i - 1]][path[i]] += b; }
        flow += b;
        for (int i = len - 1; i >= 0; i--) printf(i == len - 1 ? "%c" : " -> %c", NAMES[path[i]]);
        printf(" (+%d)\n", b);
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
