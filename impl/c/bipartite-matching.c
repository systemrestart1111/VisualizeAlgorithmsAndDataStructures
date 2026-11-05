#include <stdio.h>
#include <string.h>

/* 左側 L1..L5 可以配對的右側點 */
int adj[6][2] = {{0}, {1, 2}, {1, 3}, {2, 3}, {3, 4}, {4, 5}}, match_r[6], seen[6];

/* 替 u 找右側點：若對方空著就直接配；若已被配走，嘗試讓原本的左側點改配別人（增廣路徑） */
int try_kuhn(int u) {
    for (int k = 0; k < 2; k++) {
        int v = adj[u][k];
        if (seen[v]) continue;
        seen[v] = 1;
        if (!match_r[v] || try_kuhn(match_r[v])) { match_r[v] = u; return 1; }
    }
    return 0;
}

int main(void) {
    int size = 0;
    for (int u = 1; u <= 5; u++) {
        memset(seen, 0, sizeof seen);
        size += try_kuhn(u);
    }
    printf("matching size = %d\n", size);
    for (int u = 1; u <= 5; u++)
        for (int v = 1; v <= 5; v++) if (match_r[v] == u) printf("L%d - R%d\n", u, v);
    return 0;
}
