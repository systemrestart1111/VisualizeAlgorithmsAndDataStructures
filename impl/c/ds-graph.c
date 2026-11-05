#include <stdio.h>

/* 無向加權圖，同時維護兩種表示法：鄰接矩陣 O(V²) 空間、鄰接串列 O(V + E) 空間 */
#define N 5
const char *NAMES = "ABCDE";
int matrix[N][N];
int adj[N][N][2], deg[N]; /* adj[u][k] = {鄰居, 權重}，依加入順序 */

void add_edge(int u, int v, int w) {
    matrix[u][v] = matrix[v][u] = w;
    adj[u][deg[u]][0] = v; adj[u][deg[u]++][1] = w;
    adj[v][deg[v]][0] = u; adj[v][deg[v]++][1] = w;
}

void remove_from(int u, int v) {
    int k = 0;
    for (int i = 0; i < deg[u]; i++)
        if (adj[u][i][0] != v) { adj[u][k][0] = adj[u][i][0]; adj[u][k][1] = adj[u][i][1]; k++; }
    deg[u] = k;
}

void remove_edge(int u, int v) {
    matrix[u][v] = matrix[v][u] = 0;
    remove_from(u, v);
    remove_from(v, u);
}

void bfs(int s) {
    int q[N], seen[N] = {0}, h = 0, t = 0;
    q[t++] = s; seen[s] = 1;
    printf("BFS from %c:", NAMES[s]);
    while (h < t) {
        int u = q[h++];
        printf(" %c", NAMES[u]);
        for (int i = 0; i < deg[u]; i++) {
            int v = adj[u][i][0];
            if (!seen[v]) { seen[v] = 1; q[t++] = v; }
        }
    }
    printf("\n");
}

void dfs(int u, int *seen) {
    seen[u] = 1;
    printf(" %c", NAMES[u]);
    for (int i = 0; i < deg[u]; i++) if (!seen[adj[u][i][0]]) dfs(adj[u][i][0], seen);
}

void show(void) {
    printf("matrix:  ");
    for (int i = 0; i < N; i++) printf("  %c", NAMES[i]);
    printf("\n");
    for (int i = 0; i < N; i++) {
        printf("        %c", NAMES[i]);
        for (int j = 0; j < N; j++) printf(" %2d", matrix[i][j]);
        printf("\n");
    }
    printf("list:\n");
    for (int i = 0; i < N; i++) {
        printf("  %c ->", NAMES[i]);
        if (!deg[i]) printf(" -");
        for (int k = 0; k < deg[i]; k++) printf(" %c(%d)", NAMES[adj[i][k][0]], adj[i][k][1]);
        printf("\n");
    }
}

int main(void) {
    add_edge(0, 1, 4); add_edge(0, 2, 2); add_edge(1, 3, 5); add_edge(2, 3, 8); add_edge(3, 4, 3);
    show();
    add_edge(0, 4, 6); printf("add edge A-E (6)\n");
    remove_edge(2, 3); printf("remove edge C-D\n");
    show();
    bfs(0);
    int seen[N] = {0};
    printf("DFS from A:"); dfs(0, seen); printf("\n");
    return 0;
}
