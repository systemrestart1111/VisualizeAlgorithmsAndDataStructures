#include <stdio.h>

/* 單調遞減雙端佇列（存索引）：隊首永遠是視窗內最大值的位置 */
int main(void) {
    int a[] = {1, 3, -1, -3, 5, 3, 6, 7, 2, 4, 1}, dq[16], head = 0, tail = 0, k = 3;
    int n = sizeof a / sizeof a[0], first = 1;
    for (int i = 0; i < n; i++) {
        while (tail > head && a[dq[tail - 1]] <= a[i]) tail--; /* 比 a[i] 小的元素再也不會成為最大值 */
        dq[tail++] = i;
        if (dq[head] <= i - k) head++;                        /* 隊首已離開視窗 */
        if (i >= k - 1) { printf(first ? "%d" : " %d", a[dq[head]]); first = 0; }
    }
    printf("\n");
    return 0;
}
