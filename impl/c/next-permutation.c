#include <stdio.h>

/* 找轉折點 i、從右邊找比 a[i] 大的最右元素交換，再反轉尾段；已是最大排列時回到最小 */
void next_permutation(int *a, int n) {
    int i = n - 2, t;
    while (i >= 0 && a[i] >= a[i + 1]) i--;
    if (i >= 0) {
        int j = n - 1;
        while (a[j] <= a[i]) j--;
        t = a[i]; a[i] = a[j]; a[j] = t;
    }
    for (int x = i + 1, y = n - 1; x < y; x++, y--) { t = a[x]; a[x] = a[y]; a[y] = t; }
}

void show(const char *label, const int *a, int n) {
    printf("%s", label);
    for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
    printf("\n");
}

int main(void) {
    int a[] = {1, 3, 5, 4, 2}, w[] = {3, 2, 1}, d[] = {1, 1, 2};
    for (int k = 0; k < 3; k++) { next_permutation(a, 5); show("", a, 5); }
    next_permutation(w, 3);
    show("wrap: ", w, 3);
    for (int k = 0; k < 3; k++) { next_permutation(d, 3); show("dup: ", d, 3); }
    return 0;
}
