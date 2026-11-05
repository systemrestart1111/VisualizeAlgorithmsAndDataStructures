#include <stdio.h>

static void reverse(int *a, int i, int j) {
    while (i < j) { int t = a[i]; a[i++] = a[j]; a[j--] = t; }
}

/* 三次反轉：整段反轉，再分別反轉前 k 個與其餘部分 */
void rotate_right(int *a, int n, int k) {
    k %= n;
    reverse(a, 0, n - 1);
    reverse(a, 0, k - 1);
    reverse(a, k, n - 1);
}

int main(void) {
    int a[] = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
    int n = sizeof a / sizeof a[0];
    rotate_right(a, n, 3);
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
