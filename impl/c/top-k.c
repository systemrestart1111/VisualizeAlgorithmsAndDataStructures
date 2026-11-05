#include <stdio.h>

static void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }

static void sift_down(int *h, int i, int n) {
    for (;;) {
        int s = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && h[l] < h[s]) s = l;
        if (r < n && h[r] < h[s]) s = r;
        if (s == i) return;
        swap(&h[i], &h[s]);
        i = s;
    }
}

static void sift_up(int *h, int i) {
    while (i > 0 && h[(i - 1) / 2] > h[i]) { swap(&h[i], &h[(i - 1) / 2]); i = (i - 1) / 2; }
}

/* 維持大小為 k 的最小堆積：比堆頂大的元素才換進來，最後堆內就是最大的 k 個 */
int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47}, h[4], sz = 0, k = 4;
    int n = sizeof a / sizeof a[0];
    for (int i = 0; i < n; i++) {
        if (sz < k) { h[sz] = a[i]; sift_up(h, sz++); }
        else if (a[i] > h[0]) { h[0] = a[i]; sift_down(h, 0, k); }
    }
    for (int i = sz - 1; i > 0; i--) { swap(&h[0], &h[i]); sift_down(h, 0, i); } /* 堆積排序成遞減 */
    printf("top 4:");
    for (int i = 0; i < sz; i++) printf(" %d", h[i]);
    printf("\n");
    return 0;
}
