#include <stdio.h>

static void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }

/* 荷蘭國旗：lt 左邊 < p，gt 右邊 > p，中間 = p；一次掃描完成 */
int main(void) {
    int a[] = {2, 0, 1, 2, 1, 0, 0, 2, 1, 1, 0, 2, 1, 0}, p = 1;
    int n = sizeof a / sizeof a[0], lt = 0, i = 0, gt = n - 1;
    while (i <= gt) {
        if (a[i] < p) swap(&a[lt++], &a[i++]);
        else if (a[i] > p) swap(&a[i], &a[gt--]);
        else i++;
    }
    for (int k = 0; k < n; k++) printf("%d%c", a[k], k + 1 < n ? ' ' : '\n');
    printf("< p: [0, %d), = p: [%d, %d], > p: (%d, %d)\n", lt, lt, gt, gt, n);
    return 0;
}
