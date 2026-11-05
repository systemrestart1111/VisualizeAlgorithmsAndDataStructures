#include <stdio.h>

/* a 已排序且分布均勻；依數值比例估計位置，而不是取中間 */
int interpolation_search(const int *a, int n, int t) {
    int lo = 0, hi = n - 1;
    while (lo <= hi && a[lo] <= t && t <= a[hi]) {
        int pos = a[hi] == a[lo] ? lo : lo + (int)((long long)(t - a[lo]) * (hi - lo) / (a[hi] - a[lo]));
        if (a[pos] == t) return pos;
        if (a[pos] < t) lo = pos + 1;
        else hi = pos - 1;
    }
    return -1;
}

int main(void) {
    int a[] = {10, 14, 19, 26, 27, 31, 33, 35, 42, 44, 51, 58, 63, 70, 77, 85};
    int n = sizeof a / sizeof a[0];
    printf("search 58 -> %d\n", interpolation_search(a, n, 58));
    printf("search 40 -> %d\n", interpolation_search(a, n, 40));
    return 0;
}
