#include <stdio.h>

/* 已排序陣列：和太小移左指標、太大移右指標；找到回傳 1 */
int two_sum_sorted(const int *a, int n, int t, int *li, int *ri) {
    int l = 0, r = n - 1;
    while (l < r) {
        int s = a[l] + a[r];
        if (s == t) { *li = l; *ri = r; return 1; }
        if (s < t) l++; else r--;
    }
    return 0;
}

int main(void) {
    int a[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91}, ts[] = {61, 100, 4, 163}, n = 10;
    for (int k = 0; k < 4; k++) {
        int t = ts[k], l, r, brute = 0;
        for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) if (a[i] + a[j] == t) brute = 1;
        printf("t = %d: ", t);
        if (two_sum_sorted(a, n, t, &l, &r)) printf("a[%d] + a[%d] = %d + %d", l, r, a[l], a[r]); else printf("none");
        printf(" | brute: %s\n", brute ? "True" : "False");
    }
    return 0;
}
