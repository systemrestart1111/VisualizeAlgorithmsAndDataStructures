#include <math.h>
#include <stdio.h>
#include <stdlib.h>

static int a[12] = {1, 2, 1, 3, 2, 2, 4, 1, 5, 3, 4, 4}, Q[6][2] = {{0, 4}, {2, 7}, {5, 11}, {1, 3}, {6, 9}, {0, 11}};
static int B, cnt[16], distinct, moves;

static int cmp(const void *x, const void *y) {
    int i = *(const int *)x, j = *(const int *)y;
    if (Q[i][0] / B != Q[j][0] / B) return Q[i][0] / B - Q[j][0] / B;
    if (Q[i][1] != Q[j][1]) return Q[i][1] - Q[j][1];
    return i - j;
}
static void add(int x) { if (++cnt[x] == 1) distinct++; moves++; }
static void rem(int x) { if (--cnt[x] == 0) distinct--; moves++; }

int main(void) {
    int n = 12, nq = 6, order[6], ans[6], L = 0, R = -1;
    B = (int)ceil(sqrt((double)n));
    /* 查詢依 (l 所在塊, r) 排序，左右指標逐格移動並維護相異數 */
    for (int i = 0; i < nq; i++) order[i] = i;
    qsort(order, nq, sizeof(int), cmp);
    for (int k = 0; k < nq; k++) {
        int i = order[k], l = Q[i][0], r = Q[i][1];
        while (R < r) add(a[++R]);
        while (L > l) add(a[--L]);
        while (R > r) rem(a[R--]);
        while (L < l) rem(a[L++]);
        ans[i] = distinct;
    }
    for (int i = 0; i < nq; i++) {
        int seen[16] = {0}, b = 0;
        for (int j = Q[i][0]; j <= Q[i][1]; j++) if (!seen[a[j]]++) b++;
        printf("distinct[%d, %d] = %d (brute %d)\n", Q[i][0], Q[i][1], ans[i], b);
    }
    printf("pointer moves: %d\n", moves);
    return 0;
}
