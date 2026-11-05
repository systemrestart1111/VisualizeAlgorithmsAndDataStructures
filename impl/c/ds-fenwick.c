#include <stdio.h>

/* t[i] 負責區間 (i - lowbit(i), i]；更新與前綴和都只走 O(log n) 個位置（索引從 1 開始） */
#define N 12
int t[N + 1];

void add(int i, int v) {
    for (; i <= N; i += i & -i) t[i] += v; /* 往上走到下一個也涵蓋 i 的位置 */
}

int prefix(int i) {
    int s = 0;
    for (; i > 0; i -= i & -i) s += t[i]; /* 去掉最低位的 1 */
    return s;
}

int range_sum(int l, int r) { return prefix(r) - prefix(l - 1); }

void show(void) {
    printf("t[1..12] =");
    for (int i = 1; i <= N; i++) printf(" %d", t[i]);
    printf("\n");
}

int main(void) {
    int a[N] = {3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3, 1};
    for (int i = 1; i <= N; i++) add(i, a[i - 1]);
    show();
    printf("prefix(7) = %d\n", prefix(7));
    printf("sum[3, 9] = %d\n", range_sum(3, 9));
    add(5, 4); printf("add +4 at 5\n");
    printf("prefix(7) = %d\n", prefix(7));
    printf("sum[3, 9] = %d\n", range_sum(3, 9));
    show();
    return 0;
}
