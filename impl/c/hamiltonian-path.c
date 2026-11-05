#include <stdio.h>

int adj[26][26], deg[26], seen[26], path[26], len, n = 9;

/* 從起點延伸路徑，每次只走沒去過的鄰居；走不下去就退回（回溯），長度達到 n 即成功 */
int bt(void) {
    if (len == n) return 1;
    int u = path[len - 1];
    for (int k = 0; k < deg[u]; k++) {
        int v = adj[u][k];
        if (seen[v]) continue;
        path[len++] = v;
        seen[v] = 1;
        if (bt()) return 1;
        len--;
        seen[v] = 0;
    }
    return 0;
}

int main(void) {
    const char *E = "AB AD BC BE CF DE EF DG EH FI GH HI";
    for (const char *p = E; *p; p += p[2] ? 3 : 2) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adj[a][deg[a]++] = b;
        adj[b][deg[b]++] = a;
    }
    path[len++] = 0;
    seen[0] = 1;
    printf("Hamiltonian path:");
    if (!bt()) printf(" none\n");
    else {
        for (int i = 0; i < len; i++) printf(i ? " -> %c" : " %c", 'A' + path[i]);
        printf("\n");
    }
    return 0;
}
