#include <stdio.h>
#include <stdlib.h>

static int cmp(const void *x, const void *y) { int a = *(const int *)x, b = *(const int *)y; return (a > b) - (a < b); }

/* 把每個值換成它在「排序後去重複」陣列中的排名；回傳相異值個數 */
int compress(const int *a, int n, int *vals, int *ranks) {
    for (int i = 0; i < n; i++) vals[i] = a[i];
    qsort(vals, n, sizeof(int), cmp);
    int m = 0;
    for (int i = 0; i < n; i++) if (!i || vals[i] != vals[i - 1]) vals[m++] = vals[i];
    for (int i = 0; i < n; i++) {
        int lo = 0, hi = m;
        while (lo < hi) { int mid = (lo + hi) / 2; if (vals[mid] < a[i]) lo = mid + 1; else hi = mid; }
        ranks[i] = lo;
    }
    return m;
}

int main(void) {
    int a[] = {1000000, 30, -5, 30, 99999, 7, -5, 2000}, n = 8, vals[8], ranks[8], ok = 1;
    int m = compress(a, n, vals, ranks);
    printf("values:");
    for (int i = 0; i < m; i++) printf(" %d", vals[i]);
    printf("\nranks :");
    for (int i = 0; i < n; i++) printf(" %d", ranks[i]);
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) ok &= ((a[i] < a[j]) == (ranks[i] < ranks[j])) && ((a[i] == a[j]) == (ranks[i] == ranks[j]));
    printf("\norder preserved: %s\n", ok ? "True" : "False");
    return 0;
}
