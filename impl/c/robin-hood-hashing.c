#include <stdio.h>

#define M 11
static int key[M], dist[M], used[M];

/* 從理想位置往後找；遇到距離比目前小的格子，代表 x 若存在早該出現 */
static int find(int x) {
    for (int i = x % M, d = 0; d < M; i = (i + 1) % M, d++) {
        if (!used[i] || dist[i] < d) return -1;
        if (key[i] == x) return i;
    }
    return -1;
}
/* 線性探測 + 劫富濟貧：遇到探測距離比自己小的元素就交換 */
static void insert(int x) {
    if (find(x) >= 0) return;
    int ck = x, cd = 0;
    for (int i = x % M;; i = (i + 1) % M, cd++) {
        if (!used[i]) { used[i] = 1; key[i] = ck; dist[i] = cd; return; }
        if (dist[i] < cd) { int tk = key[i], td = dist[i]; key[i] = ck; dist[i] = cd; ck = tk; cd = td; }
    }
}
/* 後移刪除：後面距離 > 0 的元素往前移一格，探測鏈不會斷 */
static void del(int x) {
    int i = find(x);
    if (i < 0) return;
    used[i] = 0;
    for (int j = (i + 1) % M; used[j] && dist[j] > 0; i = j, j = (j + 1) % M) {
        used[i] = 1; key[i] = key[j]; dist[i] = dist[j] - 1; used[j] = 0;
    }
}
static void show(const char *label) {
    printf("%s", label);
    for (int i = 0; i < M; i++) { if (used[i]) printf(" %d/%d", key[i], dist[i]); else printf(" ."); }
    printf("\n");
}

int main(void) {
    int xs[] = {22, 33, 1, 12, 44, 5, 16, 27};
    for (int i = 0; i < 8; i++) insert(xs[i]);
    show("table:");
    printf("find 27: %d | find 9: %d\n", find(27), find(9));
    del(33);
    show("after delete 33:");
    printf("find 44: %d | find 27: %d\n", find(44), find(27));
    return 0;
}
