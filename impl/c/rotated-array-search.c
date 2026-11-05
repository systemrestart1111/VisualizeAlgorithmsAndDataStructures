#include <stdio.h>

/* 至少有一半是有序的；a[lo] = a[mid] = a[hi] 時無法判斷，兩端各縮一格 */
int search(const int *a, int n, int t) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (a[mid] == t) return mid;
        if (a[lo] == a[mid] && a[mid] == a[hi]) { lo++; hi--; }
        else if (a[lo] <= a[mid]) { if (a[lo] <= t && t < a[mid]) hi = mid - 1; else lo = mid + 1; }
        else { if (a[mid] < t && t <= a[hi]) lo = mid + 1; else hi = mid - 1; }
    }
    return -1;
}

int main(void) {
    int a[] = {45, 52, 60, 67, 74, 3, 8, 12, 17, 23, 31, 38}, ts[] = {12, 45, 38, 50};
    for (int i = 0; i < 4; i++) printf("find %d: %d\n", ts[i], search(a, 12, ts[i]));
    int d[] = {2, 2, 2, 3, 2, 2, 2};
    printf("duplicates find 3: %d\n", search(d, 7, 3));
    return 0;
}
