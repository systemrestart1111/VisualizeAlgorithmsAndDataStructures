#include <stdio.h>

int adjv[26][26], adje[26][26], deg[26], used[64], ptr[26], n, m;

int main(void) {
    const char *E = "AB BC CA CD DE EC BD AD";
    for (const char *p = E; *p; p += p[2] ? 3 : 2, m++) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adjv[a][deg[a]] = b; adje[a][deg[a]++] = m; /* adjv：鄰居，adje：邊編號 */
        adjv[b][deg[b]] = a; adje[b][deg[b]++] = m;
        if (a + 1 > n) n = a + 1;
        if (b + 1 > n) n = b + 1;
    }
    int start = 0, first = 1;
    printf("odd vertices:");
    for (int v = n - 1; v >= 0; v--) if (deg[v] % 2) start = v; /* 有兩個奇點時必須從奇點出發 */
    for (int v = 0; v < n; v++) if (deg[v] % 2) printf(" %c", 'A' + v);
    printf("\n");
    /* 沿著未用過的邊一直走，走不動時把該點加入路徑並回退；最後路徑反轉即為歐拉路徑 */
    int stack[64], top = 0, path[64], np = 0;
    stack[top++] = start;
    while (top) {
        int u = stack[top - 1];
        while (ptr[u] < deg[u] && used[adje[u][ptr[u]]]) ptr[u]++;
        if (ptr[u] == deg[u]) path[np++] = stack[--top];
        else {
            used[adje[u][ptr[u]]] = 1;
            stack[top++] = adjv[u][ptr[u]];
        }
    }
    printf("euler path:");
    for (int i = np - 1; i >= 0; i--) { printf(first ? " %c" : " -> %c", 'A' + path[i]); first = 0; }
    printf("\n");
    return 0;
}
