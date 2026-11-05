#include <stdio.h>

/* 比較間隔 gap 的元素，gap 每輪除以 1.3；gap 縮到 1 且沒有交換時結束 */
void comb_sort(int *a, int n) {
    int gap = n, done = 0;
    while (!done) {
        gap = (int)(gap / 1.3);
        if (gap < 1) gap = 1;
        done = gap == 1;
        for (int i = 0; i + gap < n; i++)
            if (a[i] > a[i + gap]) {
                int t = a[i]; a[i] = a[i + gap]; a[i + gap] = t;
                done = 0;
            }
    }
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    int n = sizeof a / sizeof a[0];
    comb_sort(a, n);
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
