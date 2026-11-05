#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int adj[26][26], deg[26], tin[26], low[26], timer, is_cut[26], n;
char bridges[26][4];
int nb;

static int cmp(const void *a, const void *b) { return strcmp(a, b); }

/* low[v] > tin[u]：v 的子樹回不到 u 以上，(u, v) 是橋；low[v] >= tin[u]：u 是割點（根需有兩個以上子樹） */
void dfs(int u, int parent) {
    tin[u] = low[u] = timer++;
    int children = 0;
    for (int k = 0; k < deg[u]; k++) {
        int v = adj[u][k];
        if (v == parent) continue;
        if (tin[v] >= 0) { if (tin[v] < low[u]) low[u] = tin[v]; }
        else {
            dfs(v, u);
            if (low[v] < low[u]) low[u] = low[v];
            children++;
            if (low[v] > tin[u]) {
                int a = u < v ? u : v, b = u < v ? v : u;
                sprintf(bridges[nb++], "%c-%c", 'A' + a, 'A' + b);
            }
            if (parent >= 0 && low[v] >= tin[u]) is_cut[u] = 1;
        }
    }
    if (parent < 0 && children > 1) is_cut[u] = 1;
}

int main(void) {
    const char *E = "AB BC CA CD DE EF FD FG GH BI";
    for (const char *p = E; *p; p += p[2] ? 3 : 2) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adj[a][deg[a]++] = b;
        adj[b][deg[b]++] = a;
        if (a + 1 > n) n = a + 1;
        if (b + 1 > n) n = b + 1;
    }
    memset(tin, -1, sizeof tin);
    dfs(0, -1);
    qsort(bridges, nb, sizeof bridges[0], cmp);
    printf("bridges:");
    for (int i = 0; i < nb; i++) printf(" %s", bridges[i]);
    printf("\narticulation points:");
    for (int v = 0; v < n; v++) if (is_cut[v]) printf(" %c", 'A' + v);
    printf("\n");
    return 0;
}
