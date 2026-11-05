#include <stdio.h>

/* 依數值範圍把元素分進 k 個桶，各桶內排序（插入排序）後依序串接 */
void bucket_sort(int *a, int n, int k) {
    int b[10][64], sz[10] = {0}, lo = a[0], hi = a[0], m = 0;
    for (int i = 1; i < n; i++) {
        if (a[i] < lo) lo = a[i];
        if (a[i] > hi) hi = a[i];
    }
    for (int i = 0; i < n; i++) {
        int id = (a[i] - lo) * k / (hi - lo + 1);
        b[id][sz[id]++] = a[i];
    }
    for (int i = 0; i < k; i++) {
        for (int p = 1; p < sz[i]; p++) {
            int key = b[i][p], q = p - 1;
            while (q >= 0 && b[i][q] > key) { b[i][q + 1] = b[i][q]; q--; }
            b[i][q + 1] = key;
        }
        printf("bucket %d:", i);
        for (int p = 0; p < sz[i]; p++) { printf(" %d", b[i][p]); a[m++] = b[i][p]; }
        printf("\n");
    }
}

int main(void) {
    int a[] = {29, 25, 3, 49, 9, 37, 21, 43, 12, 33, 6, 41, 17, 48};
    int n = sizeof a / sizeof a[0];
    bucket_sort(a, n, 5);
    printf("sorted:");
    for (int i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
    return 0;
}
