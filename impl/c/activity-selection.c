#include <stdio.h>
#include <stdlib.h>

typedef struct { int s, e, id; } Iv;
static int cmp(const void *a, const void *b) {
    const Iv *x = a, *y = b;
    return x->e != y->e ? x->e - y->e : x->id - y->id;
}

/* 依結束時間排序，每次選最早結束、且不與已選區間重疊的活動 */
int main(void) {
    int raw[][2] = {{1, 4}, {3, 5}, {0, 6}, {5, 7}, {3, 9}, {5, 9}, {6, 10}, {8, 11}, {8, 12}, {2, 14}, {12, 16}};
    int n = 11, end = -1000000, cnt = 0;
    Iv iv[11];
    for (int i = 0; i < n; i++) iv[i] = (Iv){raw[i][0], raw[i][1], i};
    qsort(iv, n, sizeof(Iv), cmp);
    printf("selected:");
    for (int i = 0; i < n; i++)
        if (iv[i].s >= end) { printf(" [%d,%d)", iv[i].s, iv[i].e); end = iv[i].e; cnt++; }
    printf("\ncount = %d\n", cnt);
    return 0;
}
