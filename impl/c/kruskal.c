#include <stdio.h>
#include <stdlib.h>

typedef struct { int a, b, w, id; } Edge;
int parent[26];

int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
}

/* 權重相同時依輸入順序，讓結果與穩定排序一致 */
static int cmp(const void *x, const void *y) {
    const Edge *p = x, *q = y;
    return p->w != q->w ? p->w - q->w : p->id - q->id;
}

int main(void) {
    const char *S[] = {"AB7", "AD5", "BC8", "BD9", "BE7", "CE5", "DE15", "DF6", "EF8", "EG9", "FG11"};
    int m = 11, total = 0;
    Edge e[11];
    for (int i = 0; i < m; i++) e[i] = (Edge){S[i][0] - 'A', S[i][1] - 'A', atoi(S[i] + 2), i};
    for (int i = 0; i < 26; i++) parent[i] = i;
    qsort(e, m, sizeof(Edge), cmp);
    /* 邊依權重由小到大檢查；兩端不在同一棵樹（並查集）才加入，避免形成環 */
    for (int i = 0; i < m; i++) {
        int ra = find(e[i].a), rb = find(e[i].b);
        if (ra == rb) continue;
        parent[ra] = rb;
        total += e[i].w;
        printf("take %c-%c (%d)\n", 'A' + e[i].a, 'A' + e[i].b, e[i].w);
    }
    printf("total weight = %d\n", total);
    return 0;
}
