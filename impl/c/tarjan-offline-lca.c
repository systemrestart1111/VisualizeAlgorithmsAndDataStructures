#include <stdio.h>

#define N 11
static int kids[N][N], nk[N], parent[N], ancestor[N], visited[N];
static int Q[5][2] = {{8, 9}, {4, 8}, {6, 10}, {9, 6}, {3, 3}}, ans[5], answered[5];

static int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
/* 子樹 v 完成後併入 u 的集合；u 結束時回答所有另一端已拜訪的查詢 */
static void dfs(int u) {
    ancestor[u] = u;
    for (int i = 0; i < nk[u]; i++) {
        int v = kids[u][i];
        dfs(v);
        parent[find(v)] = find(u);
        ancestor[find(u)] = u;
    }
    visited[u] = 1;
    for (int i = 0; i < 5; i++) {
        int w = Q[i][0] == u ? Q[i][1] : Q[i][1] == u ? Q[i][0] : -1;
        if (w >= 0 && visited[w] && !answered[i]) { ans[i] = ancestor[find(w)]; answered[i] = 1; }
    }
}

int main(void) {
    int E[9][2] = {{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {5, 9}, {7, 10}};
    for (int i = 0; i < N; i++) parent[i] = i;
    for (int e = 0; e < 9; e++) kids[E[e][0]][nk[E[e][0]]++] = E[e][1];
    dfs(1);
    for (int i = 0; i < 5; i++) printf("lca(%d, %d) = %d\n", Q[i][0], Q[i][1], ans[i]);
    return 0;
}
