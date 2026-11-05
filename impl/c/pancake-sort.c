#include <stdio.h>

void flip(int *a, int k) { for (int i = 0, j = k; i < j; i++, j--) { int t = a[i]; a[i] = a[j]; a[j] = t; } }

/* 只用前綴翻轉：最大值先翻到最前面，再翻到未排序部分的底部。回傳翻轉次數 */
int pancake_sort(int *a, int n, int *flips) {
    int k = 0;
    for (int size = n; size > 1; size--) {
        int m = 0;
        for (int i = 1; i < size; i++) if (a[i] > a[m]) m = i;
        if (m == size - 1) continue;
        if (m != 0) { flip(a, m); flips[k++] = m; }
        flip(a, size - 1);
        flips[k++] = size - 1;
    }
    return k;
}

int main(void) {
    int a[] = {3, 6, 1, 8, 4, 9, 2, 7, 5}, f[32];
    int k = pancake_sort(a, 9, f);
    printf("sorted:");
    for (int i = 0; i < 9; i++) printf(" %d", a[i]);
    printf("\nflips: %d prefix lengths:", k);
    for (int i = 0; i < k; i++) printf(" %d", f[i] + 1);
    printf("\n");
    return 0;
}
