#include <stdio.h>

static void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }

/* 把 a[i] 往下沉，直到它比兩個子節點都大（最大堆積） */
void sift_down(int *a, int i, int n) {
    for (;;) {
        int big = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && a[l] > a[big]) big = l;
        if (r < n && a[r] > a[big]) big = r;
        if (big == i) return;
        swap(&a[i], &a[big]);
        i = big;
    }
}

void heap_sort(int *a, int n) {
    for (int i = n / 2 - 1; i >= 0; i--) sift_down(a, i, n); /* 由下往上建堆 */
    for (int end = n - 1; end > 0; end--) {                  /* 每次把最大值換到尾端 */
        swap(&a[0], &a[end]);
        sift_down(a, 0, end);
    }
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    int n = sizeof a / sizeof a[0];
    heap_sort(a, n);
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
