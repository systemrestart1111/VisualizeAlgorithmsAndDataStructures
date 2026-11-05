#include <stdio.h>

long long state = 42;

/* Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1 */
int rand_int(int k) {
    state = state * 48271 % 2147483647;
    return (int)(state % k);
}

static void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }

/* 隨機選 pivot，讓已排序等「最壞輸入」也只有極低機率退化成 O(n²)；期望時間 O(n) */
int quickselect(int *a, int n, int k) {
    int lo = 0, hi = n - 1;
    for (;;) {
        swap(&a[lo + rand_int(hi - lo + 1)], &a[hi]);
        int pivot = a[hi], i = lo;
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) swap(&a[i++], &a[j]);
        swap(&a[i], &a[hi]);
        printf("range [%d, %d] pivot %d -> position %d\n", lo, hi, pivot, i);
        if (i == k) return a[i];
        if (k < i) hi = i - 1;
        else lo = i + 1;
    }
}

int main(void) {
    int a[14];
    for (int i = 0; i < 14; i++) a[i] = i + 1;
    int r = quickselect(a, 14, 3);
    printf("k = 3 -> %d\n", r);
    return 0;
}
