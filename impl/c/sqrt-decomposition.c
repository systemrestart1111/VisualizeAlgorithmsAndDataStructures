#include <stdio.h>

#define N 16
#define B 4
static int a[N] = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3}, sums[N / B];

static void set(int i, int v) { sums[i / B] += v - a[i]; a[i] = v; }
/* 完整的塊直接用總和，兩端零散元素逐一相加 */
static int query(int l, int r) {
    int s = 0, i = l;
    while (i <= r) {
        if (i % B == 0 && i + B - 1 <= r) { s += sums[i / B]; i += B; }
        else s += a[i++];
    }
    return s;
}
static void blocks(const char *label) { printf("%s", label); for (int b = 0; b < N / B; b++) printf(" %d", sums[b]); printf("\n"); }

int main(void) {
    for (int i = 0; i < N; i++) sums[i / B] += a[i];
    blocks("blocks:");
    printf("sum[2, 13] = %d\n", query(2, 13));
    set(5, 0);
    blocks("after a[5] = 0, blocks:");
    printf("sum[4, 7] = %d | sum[0, 15] = %d | sum[9, 9] = %d\n", query(4, 7), query(0, 15), query(9, 9));
    return 0;
}
