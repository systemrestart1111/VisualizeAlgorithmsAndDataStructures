#include <stdio.h>

#define N 32
static int piles[N][N], len[N], np = 0;
static int heap[N][2], hn = 0;   /* (值, 牌堆編號) 的最小堆積 */

static int less(int a, int b) { return heap[a][0] < heap[b][0] || (heap[a][0] == heap[b][0] && heap[a][1] < heap[b][1]); }
static void hswap(int a, int b) { int t0 = heap[a][0], t1 = heap[a][1]; heap[a][0] = heap[b][0]; heap[a][1] = heap[b][1]; heap[b][0] = t0; heap[b][1] = t1; }
static void push(int v, int p) {
    int i = hn++;
    heap[i][0] = v; heap[i][1] = p;
    while (i && less(i, (i - 1) / 2)) { hswap(i, (i - 1) / 2); i = (i - 1) / 2; }
}
static void pop(int *v, int *p) {
    *v = heap[0][0]; *p = heap[0][1];
    hn--;
    heap[0][0] = heap[hn][0]; heap[0][1] = heap[hn][1];
    for (int i = 0;;) {
        int m = i, l = 2 * i + 1, r = l + 1;
        if (l < hn && less(l, m)) m = l;
        if (r < hn && less(r, m)) m = r;
        if (m == i) break;
        hswap(i, m); i = m;
    }
}

/* 發牌到「牌頂 ≥ x」的最左牌堆；再用最小堆積多路合併各堆牌頂 */
int patience_sort(const int *a, int n, int *out) {
    for (int k = 0; k < n; k++) {
        int lo = 0, hi = np;
        while (lo < hi) { int m = (lo + hi) / 2; if (piles[m][len[m] - 1] >= a[k]) hi = m; else lo = m + 1; }
        if (lo == np) len[np++] = 0;
        piles[lo][len[lo]++] = a[k];
    }
    for (int i = 0; i < np; i++) push(piles[i][len[i] - 1], i);
    int k = 0;
    while (hn) {
        int v, p;
        pop(&v, &p);
        out[k++] = v;
        if (--len[p]) push(piles[p][len[p] - 1], p);
    }
    return np;
}

int main(void) {
    int a[] = {6, 3, 9, 2, 8, 3, 7, 1, 5, 4, 9}, out[11];
    int k = patience_sort(a, 11, out);
    printf("piles: %d\nsorted:", k);
    for (int i = 0; i < 11; i++) printf(" %d", out[i]);
    printf("\n");
    return 0;
}
