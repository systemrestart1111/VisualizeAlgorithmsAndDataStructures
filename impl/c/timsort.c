#include <stdio.h>
#include <string.h>

static void insertion_sort(int *a, int lo, int hi) {
    for (int i = lo + 1; i < hi; i++) {
        int key = a[i], j = i - 1;
        while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}

static void merge(int *a, int *tmp, int lo, int mid, int hi) {
    int i = lo, j = mid, k = lo;
    while (i < mid && j < hi) tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    while (i < mid) tmp[k++] = a[i++];
    while (j < hi) tmp[k++] = a[j++];
    memcpy(a + lo, tmp + lo, (hi - lo) * sizeof(int));
}

/* 簡化版 TimSort：先把每段 minrun 個元素用插入排序排好，再兩兩合併、長度倍增 */
void tim_sort(int *a, int *tmp, int n, int minrun) {
    for (int lo = 0; lo < n; lo += minrun)
        insertion_sort(a, lo, lo + minrun < n ? lo + minrun : n);
    for (int size = minrun; size < n; size *= 2)
        for (int lo = 0; lo < n; lo += 2 * size) {
            int mid = lo + size < n ? lo + size : n;
            int hi = lo + 2 * size < n ? lo + 2 * size : n;
            if (mid < hi) merge(a, tmp, lo, mid, hi);
        }
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23}, tmp[18];
    int n = sizeof a / sizeof a[0];
    tim_sort(a, tmp, n, 4);
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
