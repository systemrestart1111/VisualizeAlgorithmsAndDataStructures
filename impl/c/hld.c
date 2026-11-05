#include <stdio.h>

#define N 15
int child[N][N], nch[N], parent[N], depth[N], sz[N], heavy[N], head[N], pos[N], order[N], cnt;

/* 計算子樹大小；子樹最大的孩子是重兒子（相同時取先出現的） */
void dfs_size(int u) {
    sz[u] = 1;
    for (int k = 0; k < nch[u]; k++) {
        int v = child[u][k];
        parent[v] = u; depth[v] = depth[u] + 1;
        dfs_size(v);
        sz[u] += sz[v];
        if (heavy[u] == 0 || sz[v] > sz[heavy[u]]) heavy[u] = v;
    }
}

/* 沿重兒子延伸同一條重鏈（head 相同、pos 連續），輕兒子各自開新鏈 */
void decompose(int u, int h) {
    head[u] = h; pos[u] = cnt; order[cnt++] = u;
    if (heavy[u]) decompose(heavy[u], h);
    for (int k = 0; k < nch[u]; k++)
        if (child[u][k] != heavy[u]) decompose(child[u][k], child[u][k]);
}

void print_range(int lo, int hi) {
    printf(" ");
    for (int i = lo; i <= hi; i++) printf(" %d", order[i]);
    printf("\n");
}

/* 路徑 a–b 拆成 O(log n) 段，每段都是重鏈上 pos 連續的一段 */
void path_segments(int a, int b) {
    while (head[a] != head[b]) {
        if (depth[head[a]] < depth[head[b]]) { int t = a; a = b; b = t; }
        print_range(pos[head[a]], pos[a]);
        a = parent[head[a]];
    }
    if (pos[a] < pos[b]) print_range(pos[a], pos[b]);
    else print_range(pos[b], pos[a]);
}

int main(void) {
    int e[][2] = {{1, 2}, {1, 3}, {1, 4}, {2, 5}, {2, 6}, {3, 7}, {5, 8}, {5, 9}, {5, 10}, {7, 11}, {9, 12}, {4, 13}, {13, 14}};
    for (int i = 0; i < 13; i++) child[e[i][0]][nch[e[i][0]]++] = e[i][1];
    dfs_size(1);
    decompose(1, 1);
    printf("chains:\n");
    for (int i = 0; i < cnt; i++) {
        int u = order[i];
        if (head[u] != u) continue;
        printf(" ");
        for (int v = u; v; v = heavy[v]) printf(" %d", v);
        printf("\n");
    }
    printf("path(12, 14) segments:\n");
    path_segments(12, 14);
    return 0;
}
