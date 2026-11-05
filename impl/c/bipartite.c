#include <stdio.h>
#include <string.h>

int adj[26][26], deg[26], color[26], n;

/* BFS 二著色：相鄰點必須不同色；若遇到同色的鄰居就不是二分圖 */
int bipartite(void) {
    int q[26];
    memset(color, -1, sizeof color);
    for (int s = 0; s < n; s++) {
        if (color[s] >= 0) continue;
        int head = 0, tail = 0;
        color[s] = 0;
        q[tail++] = s;
        while (head < tail) {
            int u = q[head++];
            for (int k = 0; k < deg[u]; k++) {
                int v = adj[u][k];
                if (color[v] < 0) { color[v] = 1 - color[u]; q[tail++] = v; }
                else if (color[v] == color[u]) return 0;
            }
        }
    }
    return 1;
}

int main(void) {
    const char *E = "AB AD BC CD CF EF EB GH DG";
    for (const char *p = E; *p; p += p[2] ? 3 : 2) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adj[a][deg[a]++] = b;
        adj[b][deg[b]++] = a;
        if (a + 1 > n) n = a + 1;
        if (b + 1 > n) n = b + 1;
    }
    if (!bipartite()) { printf("not bipartite\n"); return 0; }
    for (int c = 0; c < 2; c++) {
        printf("set %d:", c);
        for (int v = 0; v < n; v++) if (color[v] == c) printf(" %c", 'A' + v);
        printf("\n");
    }
    return 0;
}
