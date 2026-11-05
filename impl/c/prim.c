#include <stdio.h>
#include <stdlib.h>

#define N 7
#define INF 1000000

int main(void) {
    const char *S[] = {"AB7", "AD5", "BC8", "BD9", "BE7", "CE5", "DE15", "DF6", "EF8", "EG9", "FG11"};
    int w[N][N] = {{0}}, key[N], parent[N], in_tree[N] = {0}, total = 0;
    for (int i = 0; i < 11; i++) {
        int a = S[i][0] - 'A', b = S[i][1] - 'A';
        w[a][b] = w[b][a] = atoi(S[i] + 2);
    }
    /* key[v] = 把 v 接到目前這棵樹的最便宜邊；每次加入 key 最小的點，再更新鄰居的 key */
    for (int v = 0; v < N; v++) { key[v] = INF; parent[v] = -1; }
    key[0] = 0;
    for (int it = 0; it < N; it++) {
        int u = -1;
        for (int v = 0; v < N; v++)
            if (!in_tree[v] && (u < 0 || key[v] < key[u])) u = v;
        in_tree[u] = 1;
        if (parent[u] >= 0) {
            total += key[u];
            printf("take %c-%c (%d)\n", 'A' + parent[u], 'A' + u, key[u]);
        }
        for (int v = 0; v < N; v++)
            if (!in_tree[v] && w[u][v] && w[u][v] < key[v]) { key[v] = w[u][v]; parent[v] = u; }
    }
    printf("total weight = %d\n", total);
    return 0;
}
