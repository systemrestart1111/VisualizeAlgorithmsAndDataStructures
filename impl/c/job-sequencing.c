#include <stdio.h>

/* 依利潤由高到低考慮；每份工作排進「截止前最晚的空時段」，讓前面的時段留給截止較早的工作 */
int main(void) {
    int d[] = {2, 1, 2, 1, 3, 3, 4}, p[] = {100, 19, 27, 25, 15, 40, 30}, n = 7, order[7], slot[8], total = 0, max_d = 0;
    for (int i = 0; i < n; i++) { order[i] = i; if (d[i] > max_d) max_d = d[i]; }
    for (int i = 1; i < n; i++) { /* 穩定的插入排序：依利潤遞減 */
        int k = order[i], j = i - 1;
        while (j >= 0 && p[order[j]] < p[k]) { order[j + 1] = order[j]; j--; }
        order[j + 1] = k;
    }
    for (int t = 0; t <= max_d; t++) slot[t] = -1;
    for (int k = 0; k < n; k++) {
        int i = order[k];
        for (int t = d[i]; t >= 1; t--)
            if (slot[t] < 0) { slot[t] = i; total += p[i]; break; }
    }
    for (int t = 1; t <= max_d; t++) {
        if (slot[t] >= 0) printf("slot %d: J%d (profit %d)\n", t, slot[t] + 1, p[slot[t]]);
        else printf("slot %d: -\n", t);
    }
    printf("total profit = %d\n", total);
    return 0;
}
