#include <stdio.h>

int adj[26][26], deg[26], indeg[26], n;

int main(void) {
    const char *E = "AC BC BD CE DF EF EG FH GH"; /* 有向無環圖 */
    for (const char *p = E; *p; p += p[2] ? 3 : 2) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adj[a][deg[a]++] = b;
        indeg[b]++;
        if (a + 1 > n) n = a + 1;
        if (b + 1 > n) n = b + 1;
    }
    /* 反覆取出入度為 0 的點，並把它的出邊刪掉（讓鄰居入度減 1） */
    int q[26], head = 0, tail = 0;
    for (int v = 0; v < n; v++) if (indeg[v] == 0) q[tail++] = v;
    while (head < tail) {
        int u = q[head++];
        for (int k = 0; k < deg[u]; k++)
            if (--indeg[adj[u][k]] == 0) q[tail++] = adj[u][k];
    }
    if (tail < n) { printf("graph has a cycle\n"); return 0; }
    printf("order:");
    for (int i = 0; i < n; i++) printf(" %c", 'A' + q[i]);
    printf("\n");
    return 0;
}
