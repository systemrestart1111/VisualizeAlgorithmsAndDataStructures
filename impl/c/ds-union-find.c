#include <stdio.h>

/* 並查集：路徑壓縮 + 依秩合併，單次操作均攤接近 O(1)（反阿克曼函數） */
#define N 10
int p[N], rnk[N];

int find(int x) {
    int root = x;
    while (p[root] != root) root = p[root];
    while (p[x] != root) { int nx = p[x]; p[x] = root; x = nx; } /* 路徑壓縮：沿路的節點都直接接到根 */
    return root;
}

int unite(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return 0;
    if (rnk[ra] < rnk[rb]) { int t = ra; ra = rb; rb = t; }
    p[rb] = ra; /* rank 較小的根接到較大的底下 */
    if (rnk[ra] == rnk[rb]) rnk[ra]++;
    return 1;
}

void show_parent(void) {
    printf("parent =");
    for (int i = 0; i < N; i++) printf(" %d", p[i]);
}

const char *b(int x) { return x ? "True" : "False"; }

int main(void) {
    for (int i = 0; i < N; i++) p[i] = i;
    int pairs[][2] = {{1, 2}, {3, 4}, {2, 4}, {5, 6}, {7, 8}, {8, 9}};
    for (int i = 0; i < 6; i++) {
        unite(pairs[i][0], pairs[i][1]);
        printf("union(%d, %d): ", pairs[i][0], pairs[i][1]); show_parent(); printf("\n");
    }
    int r = find(4);
    printf("find(4) = %d  ", r); show_parent(); printf("\n");
    printf("same(1, 3) -> %s  same(1, 5) -> %s\n", b(find(1) == find(3)), b(find(1) == find(5)));
    printf("union(2, 3) -> %s (already together)\n", b(unite(2, 3)));
    printf("sets:");
    for (int root = 0; root < N; root++) {
        if (find(root) != root) continue;
        printf(" {");
        int first = 1;
        for (int i = 0; i < N; i++) if (find(i) == root) { printf(first ? "%d" : ",%d", i); first = 0; }
        printf("}");
    }
    printf("\n");
    return 0;
}
