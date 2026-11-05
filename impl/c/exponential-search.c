#include <stdio.h>

static int binary_search(const int *a, int t, int lo, int hi) {
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == t) return mid;
        if (a[mid] < t) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

/* 範圍以 1, 2, 4, 8… 倍增，找到包含 t 的區間後做二分搜尋 */
int exponential_search(const int *a, int n, int t) {
    if (n == 0) return -1;
    if (a[0] == t) return 0;
    int i = 1;
    while (i < n && a[i] <= t) i *= 2;
    return binary_search(a, t, i / 2, i < n - 1 ? i : n - 1);
}

int main(void) {
    int a[] = {2, 5, 8, 11, 15, 19, 24, 28, 33, 39, 44, 50, 57, 63, 70, 78, 85, 93};
    int n = sizeof a / sizeof a[0];
    printf("search 57 -> %d\n", exponential_search(a, n, 57));
    printf("search 60 -> %d\n", exponential_search(a, n, 60));
    return 0;
}
