#include <stdio.h>

/* 左半最大堆積、右半最小堆積；保持 |左| = |右| 或 |右| + 1 */
static int lo[64], hi[64], nl, nh;

static void push(int *h, int *n, int x, int maxheap) {
    int i = (*n)++;
    h[i] = x;
    while (i && (maxheap ? h[i] > h[(i - 1) / 2] : h[i] < h[(i - 1) / 2])) { int t = h[i]; h[i] = h[(i - 1) / 2]; h[(i - 1) / 2] = t; i = (i - 1) / 2; }
}
static int pop(int *h, int *n, int maxheap) {
    int top = h[0];
    h[0] = h[--(*n)];
    for (int i = 0;;) {
        int m = i, l = 2 * i + 1, r = l + 1;
        if (l < *n && (maxheap ? h[l] > h[m] : h[l] < h[m])) m = l;
        if (r < *n && (maxheap ? h[r] > h[m] : h[r] < h[m])) m = r;
        if (m == i) break;
        int t = h[i]; h[i] = h[m]; h[m] = t; i = m;
    }
    return top;
}
static void add(int x) {
    if (!nl || x <= lo[0]) push(lo, &nl, x, 1); else push(hi, &nh, x, 0);
    if (nl > nh + 1) push(hi, &nh, pop(lo, &nl, 1), 0);
    else if (nh > nl) push(lo, &nl, pop(hi, &nh, 0), 1);
}
static double median(void) { return nl > nh ? lo[0] : (lo[0] + hi[0]) / 2.0; }

int main(void) {
    int xs[] = {5, 15, 1, 3, 8, 7, 9, 10, 20, -4, 7, 7};
    for (int i = 0; i < 12; i++) { add(xs[i]); printf(i ? " %d->%.1f" : "%d->%.1f", xs[i], median()); }
    printf("\n");
    return 0;
}
