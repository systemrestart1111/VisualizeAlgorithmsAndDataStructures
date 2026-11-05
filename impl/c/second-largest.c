#include <stdio.h>

/* 一次掃描維護 first 與 second；distinct=1 求第二大相異值。不存在回傳 0，否則把答案寫入 *out 並回傳 1 */
int second_largest(const int *a, int n, int distinct, int *out) {
    int has1 = 0, has2 = 0, first = 0, second = 0;
    for (int i = 0; i < n; i++) {
        int x = a[i];
        if (!has1 || x > first) { if (has1) { second = first; has2 = 1; } first = x; has1 = 1; }
        else if (x == first) { if (!distinct) { second = x; has2 = 1; } }
        else if (!has2 || x > second) { second = x; has2 = 1; }
    }
    *out = second;
    return has2;
}

void run(const int *a, int n) {
    int d, r, hd = second_largest(a, n, 1, &d), hr = second_largest(a, n, 0, &r);
    printf("[");
    for (int i = 0; i < n; i++) printf(i ? ", %d" : "%d", a[i]);
    printf("] distinct: ");
    if (hd) printf("%d", d); else printf("none");
    printf(" rank: ");
    if (hr) printf("%d\n", r); else printf("none\n");
}

int main(void) {
    int a[] = {12, 35, 1, 10, 34, 35, 1}, b[] = {5, 5, 3}, c[] = {7, 7, 7}, d[] = {4};
    run(a, 7); run(b, 3); run(c, 3); run(d, 1);
    return 0;
}
