#include <stdio.h>

/* 以陣列存放的完全二元樹：i 的子節點在 2i+1、2i+2，父節點在 (i-1)/2；堆頂永遠是最小值 */
typedef struct { int a[64], n; } MinHeap;

void swap(int *x, int *y) { int t = *x; *x = *y; *y = t; }

void sift_down(MinHeap *h, int i) {
    for (;;) {
        int s = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < h->n && h->a[l] < h->a[s]) s = l;
        if (r < h->n && h->a[r] < h->a[s]) s = r;
        if (s == i) return;
        swap(&h->a[i], &h->a[s]);
        i = s;
    }
}

void push(MinHeap *h, int v) {
    int i = h->n++;
    h->a[i] = v;
    while (i > 0 && h->a[(i - 1) / 2] > h->a[i]) { /* 上浮 */
        swap(&h->a[i], &h->a[(i - 1) / 2]);
        i = (i - 1) / 2;
    }
}

int pop(MinHeap *h) {
    int top = h->a[0];
    h->a[0] = h->a[--h->n];
    sift_down(h, 0);
    return top;
}

void build(MinHeap *h, const int *items, int n) {
    h->n = n;
    for (int i = 0; i < n; i++) h->a[i] = items[i];
    for (int i = n / 2 - 1; i >= 0; i--) sift_down(h, i); /* 自底向上建堆，O(n) */
}

void show(const MinHeap *h) {
    printf("[");
    for (int i = 0; i < h->n; i++) printf(i ? " %d" : "%d", h->a[i]);
    printf("]\n");
}

int main(void) {
    MinHeap h = {{0}, 0};
    int vals[] = {35, 12, 48, 7, 20, 3, 41};
    for (int i = 0; i < 7; i++) { push(&h, vals[i]); printf("push %2d: ", vals[i]); show(&h); }
    printf("peek -> %d\n", h.a[0]);
    for (int i = 0; i < 3; i++) { int top = pop(&h); printf("pop -> %2d: ", top); show(&h); }
    MinHeap b;
    int items[] = {9, 4, 7, 1, 8, 2, 6};
    build(&b, items, 7);
    printf("build [9 4 7 1 8 2 6] -> "); show(&b);
    printf("heap sort:");
    for (int i = 0; i < 7; i++) printf(" %d", pop(&b));
    printf("\n");
    return 0;
}
