#include <stdio.h>

/* 依「單位重量價值」由高到低裝；最後一件裝不下就只裝一部分 */
int main(void) {
    int w[] = {10, 20, 30, 5, 15}, v[] = {60, 100, 120, 50, 45}, n = 5, cap = 50, order[5];
    for (int i = 0; i < n; i++) order[i] = i;
    for (int i = 1; i < n; i++) { /* 穩定的插入排序：依 v/w 遞減 */
        int k = order[i], j = i - 1;
        while (j >= 0 && (double)v[order[j]] / w[order[j]] < (double)v[k] / w[k]) { order[j + 1] = order[j]; j--; }
        order[j + 1] = k;
    }
    int left = cap;
    double total = 0;
    for (int t = 0; t < n && left > 0; t++) {
        int i = order[t], take = w[i] < left ? w[i] : left;
        total += (double)v[i] * take / w[i];
        left -= take;
        printf("item %d (w=%d, v=%d, ratio=%.2f): take %d/%d\n", i, w[i], v[i], (double)v[i] / w[i], take, w[i]);
    }
    printf("total value = %.2f\n", total);
    return 0;
}
