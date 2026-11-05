#include <stdio.h>
#include <stdlib.h>

static int cmp(const void *x, const void *y) { return *(const int *)x - *(const int *)y; }

/* BFPRT：每 5 個一組取中位數，再遞迴取「中位數的中位數」當 pivot，保證最壞 O(n) */
int select_k(const int *a, int n, int k) {
    if (n <= 5) {
        int b[5];
        for (int i = 0; i < n; i++) b[i] = a[i];
        qsort(b, n, sizeof(int), cmp);
        return b[k];
    }
    int g = (n + 4) / 5;
    int *med = malloc(g * sizeof(int));
    for (int i = 0; i < g; i++) {
        int b[5], m = n - i * 5 < 5 ? n - i * 5 : 5;
        for (int j = 0; j < m; j++) b[j] = a[i * 5 + j];
        qsort(b, m, sizeof(int), cmp);
        med[i] = b[m / 2];
    }
    int pivot = select_k(med, g, g / 2);
    free(med);
    int *lows = malloc(n * sizeof(int)), *highs = malloc(n * sizeof(int)), nl = 0, nh = 0;
    for (int i = 0; i < n; i++) {
        if (a[i] < pivot) lows[nl++] = a[i];
        else if (a[i] > pivot) highs[nh++] = a[i];
    }
    int eq = n - nl - nh, r;
    if (k < nl) r = select_k(lows, nl, k);
    else if (k < nl + eq) r = pivot;
    else r = select_k(highs, nh, k - nl - eq);
    free(lows);
    free(highs);
    return r;
}

int main(void) {
    int a[] = {12, 3, 5, 7, 4, 19, 26, 1, 14, 8, 22, 17, 9, 30, 2, 11, 25, 6, 15, 20, 28, 10, 13};
    printf("k = 11 -> %d\n", select_k(a, sizeof a / sizeof a[0], 11));
    return 0;
}
