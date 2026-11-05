#include <stdio.h>

static long long hours(const int *p, int n, int k) { long long s = 0; for (int i = 0; i < n; i++) s += (p[i] + k - 1) / k; return s; }

/* 對答案二分：hours(k) 隨 k 遞減，找最小可行的 k；h < 堆數時無解回傳 -1 */
int min_speed(const int *p, int n, int h) {
    if (h < n) return -1;
    int lo = 1, hi = 0;
    for (int i = 0; i < n; i++) if (p[i] > hi) hi = p[i];
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (hours(p, n, mid) <= h) hi = mid; else lo = mid + 1;
    }
    return lo;
}

int main(void) {
    int piles[] = {30, 11, 23, 4, 20}, hs[] = {6, 5, 10, 100, 4};
    for (int i = 0; i < 5; i++) {
        int k = min_speed(piles, 5, hs[i]);
        if (k < 0) printf("h = %d: min speed = impossible\n", hs[i]);
        else printf("h = %d: min speed = %d\n", hs[i], k);
    }
    return 0;
}
