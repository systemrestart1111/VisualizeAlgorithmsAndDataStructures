#include <stdio.h>

/* a 已排序；每次與中間元素比較，捨棄一半的搜尋範圍 */
int binary_search(const int *a, int n, int t) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == t) return mid;
        if (a[mid] < t) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

int main(void) {
    int a[] = {3, 8, 12, 17, 23, 31, 38, 45, 52, 60, 67, 74, 81, 89, 95};
    int n = sizeof a / sizeof a[0];
    printf("search 67 -> %d\n", binary_search(a, n, 67));
    printf("search 50 -> %d\n", binary_search(a, n, 50));
    return 0;
}
