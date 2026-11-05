#include <math.h>
#include <stdio.h>

static void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }

static void insertion_sort(int *a, int lo, int hi) {
    for (int i = lo + 1; i <= hi; i++) {
        int key = a[i], j = i - 1;
        while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}

static void sift(int *a, int i, int size) {
    for (;;) {
        int big = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < size && a[l] > a[big]) big = l;
        if (r < size && a[r] > a[big]) big = r;
        if (big == i) return;
        swap(&a[i], &a[big]);
        i = big;
    }
}

static void heap_sort_range(int *a, int lo, int hi) {
    int *b = a + lo, n = hi - lo + 1;
    for (int i = n / 2 - 1; i >= 0; i--) sift(b, i, n);
    for (int end = n - 1; end > 0; end--) { swap(&b[0], &b[end]); sift(b, 0, end); }
}

static int partition(int *a, int lo, int hi) {
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot) swap(&a[i++], &a[j]);
    swap(&a[i], &a[hi]);
    return i;
}

/* 快速排序為主；區間很小改用插入排序，遞迴太深改用堆積排序，保證 O(n log n) */
void intro(int *a, int lo, int hi, int depth, int small) {
    if (hi - lo + 1 <= small) insertion_sort(a, lo, hi);
    else if (depth == 0) heap_sort_range(a, lo, hi);
    else {
        int p = partition(a, lo, hi);
        intro(a, lo, p - 1, depth - 1, small);
        intro(a, p + 1, hi, depth - 1, small);
    }
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23, 50, 8};
    int n = sizeof a / sizeof a[0];
    intro(a, 0, n - 1, 2 * (int)log2(n), 4);
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
