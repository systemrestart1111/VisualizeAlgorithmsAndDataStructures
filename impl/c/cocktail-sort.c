#include <stdio.h>

static void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }

/* 雙向氣泡排序：先由左往右把最大值推到右端，再由右往左把最小值推到左端 */
void cocktail_sort(int *a, int n) {
    int lo = 0, hi = n - 1, swapped = 1;
    while (swapped && lo < hi) {
        swapped = 0;
        for (int i = lo; i < hi; i++)
            if (a[i] > a[i + 1]) { swap(&a[i], &a[i + 1]); swapped = 1; }
        hi--;
        for (int i = hi; i > lo; i--)
            if (a[i - 1] > a[i]) { swap(&a[i - 1], &a[i]); swapped = 1; }
        lo++;
    }
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    int n = sizeof a / sizeof a[0];
    cocktail_sort(a, n);
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
