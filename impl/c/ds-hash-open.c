#include <stdio.h>

/* 所有鍵都放在同一個陣列；碰撞時線性探測下一格。刪除要留「墓碑」，否則會截斷後面鍵的探測路徑 */
#define M 11
#define EMPTY -1
#define DELETED -2
int slots[M];

int insert(int k) {
    int first_tomb = -1;
    for (int i = 0; i < M; i++) {
        int idx = (k + i) % M;
        if (slots[idx] == k) return idx; /* 已存在 */
        if (slots[idx] == DELETED && first_tomb < 0) first_tomb = idx; /* 先記下來，繼續往後確認 k 不存在 */
        if (slots[idx] == EMPTY) {
            int target = first_tomb >= 0 ? first_tomb : idx;
            slots[target] = k;
            return target;
        }
    }
    if (first_tomb >= 0) { slots[first_tomb] = k; return first_tomb; }
    return -1; /* 表已滿 */
}

int search(int k, int *probes) {
    *probes = 0;
    for (int i = 0; i < M; i++) {
        int idx = (k + i) % M;
        (*probes)++;
        if (slots[idx] == EMPTY) return -1;
        if (slots[idx] == k) return idx;
    }
    return -1;
}

void show(void) {
    for (int i = 0; i < M; i++) {
        if (i) printf(" ");
        if (slots[i] == EMPTY) printf(".");
        else if (slots[i] == DELETED) printf("X");
        else printf("%d", slots[i]);
    }
}

int main(void) {
    for (int i = 0; i < M; i++) slots[i] = EMPTY;
    int keys[] = {22, 1, 13, 11, 24, 33, 18}, probes;
    for (int i = 0; i < 7; i++) { int s = insert(keys[i]); printf("insert %2d -> slot %2d   [", keys[i], s); show(); printf("]\n"); }
    int idx = search(33, &probes);
    printf("search 33 -> (slot, probes) = (%d, %d)\n", idx, probes);
    idx = search(13, &probes);
    if (idx >= 0) slots[idx] = DELETED;
    printf("delete 13 -> %s   [", idx >= 0 ? "True" : "False"); show(); printf("]\n");
    idx = search(24, &probes);
    printf("search 24 -> (slot, probes) = (%d, %d) (passes the tombstone)\n", idx, probes);
    int s = insert(35);
    printf("insert 35 -> slot %2d   [", s); show(); printf("] (reuses the tombstone)\n");
    return 0;
}
