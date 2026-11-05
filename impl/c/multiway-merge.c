#include <stdio.h>

typedef struct { int v, list, pos; } E;
static E heap[64];
static int hn;

static int less(E a, E b) { return a.v < b.v || (a.v == b.v && a.list < b.list); }
static void push(E e) {
    int i = hn++;
    heap[i] = e;
    while (i && less(heap[i], heap[(i - 1) / 2])) { E t = heap[i]; heap[i] = heap[(i - 1) / 2]; heap[(i - 1) / 2] = t; i = (i - 1) / 2; }
}
static E pop(void) {
    E top = heap[0];
    heap[0] = heap[--hn];
    for (int i = 0;;) {
        int m = i, l = 2 * i + 1, r = l + 1;
        if (l < hn && less(heap[l], heap[m])) m = l;
        if (r < hn && less(heap[r], heap[m])) m = r;
        if (m == i) break;
        E t = heap[i]; heap[i] = heap[m]; heap[m] = t; i = m;
    }
    return top;
}

/* 最小堆積放 (值, 串列編號, 位置)，每次取最小者並補上同串列的下一個 */
void kway(int k, int *lists[], int *lens) {
    hn = 0;
    for (int i = 0; i < k; i++) if (lens[i]) { E e = {lists[i][0], i, 0}; push(e); }
    int first = 1;
    while (hn) {
        E e = pop();
        printf(first ? "%d" : " %d", e.v);
        first = 0;
        if (e.pos + 1 < lens[e.list]) { E n = {lists[e.list][e.pos + 1], e.list, e.pos + 1}; push(n); }
    }
}

int main(void) {
    int a[] = {1, 4, 9, 12}, b[] = {2, 3, 10}, d[] = {5}, e[] = {6, 7, 8, 11, 13};
    int *L1[] = {a, b, NULL, d, e}, n1[] = {4, 3, 0, 1, 5};
    kway(5, L1, n1); printf("\n");
    int *L2[] = {NULL, NULL}, n2[] = {0, 0};
    kway(2, L2, n2); printf(" (empty)\n");
    int f[] = {1, 1, 2}, g[] = {1, 3};
    int *L3[] = {f, g}, n3[] = {3, 2};
    kway(2, L3, n3); printf("\n");
    return 0;
}
