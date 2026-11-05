#include <stdio.h>

/* 第一個 >= t 的位置 */
int lower_bound(const int *a, int n, int t) {
    int lo = 0, hi = n;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < t) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

/* 第一個 > t 的位置 */
int upper_bound(const int *a, int n, int t) {
    int lo = 0, hi = n;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] <= t) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

int main(void) {
    int a[] = {2, 4, 4, 4, 7, 9, 9, 12, 15, 15, 15, 18};
    int n = sizeof a / sizeof a[0];
    int lb = lower_bound(a, n, 9), ub = upper_bound(a, n, 9);
    printf("lower_bound(9) = %d\n", lb);
    printf("upper_bound(9) = %d\n", ub);
    printf("count of 9 = %d\n", ub - lb);
    return 0;
}
