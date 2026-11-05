#include <stdio.h>

static void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }

static int partition(int *a, int lo, int hi) {
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot) swap(&a[i++], &a[j]);
    swap(&a[i], &a[hi]);
    return i;
}

/* 找第 k 小（0 起算）：分割後只往含有第 k 個位置的那一邊繼續，平均 O(n) */
int quickselect(int *a, int n, int k) {
    int lo = 0, hi = n - 1;
    for (;;) {
        int p = partition(a, lo, hi);
        if (p == k) return a[p];
        if (k < p) hi = p - 1;
        else lo = p + 1;
    }
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    printf("k = 5 -> %d\n", quickselect(a, sizeof a / sizeof a[0], 5));
    return 0;
}
