#include <stdio.h>
#include <string.h>

/* LSD 基數排序：從個位數開始，每一位做一次穩定的計數排序 */
void radix_sort(int *a, int n) {
    int out[64], mx = a[0];
    for (int i = 1; i < n; i++) if (a[i] > mx) mx = a[i];
    for (int exp = 1; mx / exp > 0; exp *= 10) {
        int cnt[10] = {0};
        for (int i = 0; i < n; i++) cnt[a[i] / exp % 10]++;
        for (int d = 1; d < 10; d++) cnt[d] += cnt[d - 1];
        for (int i = n - 1; i >= 0; i--) out[--cnt[a[i] / exp % 10]] = a[i];
        memcpy(a, out, n * sizeof(int));
        printf("digit %d:", exp);
        for (int i = 0; i < n; i++) printf(" %d", a[i]);
        printf("\n");
    }
}

int main(void) {
    int a[] = {170, 45, 75, 90, 802, 24, 2, 66, 431, 318, 59, 7};
    int n = sizeof a / sizeof a[0];
    radix_sort(a, n);
    printf("sorted:");
    for (int i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
    return 0;
}
