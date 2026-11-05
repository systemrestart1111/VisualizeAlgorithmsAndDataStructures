#include <stdio.h>

/* a[0..mid) 與 a[mid..n) 各自有序；不用額外陣列，把右段元素依序往左插入（O(n·m)） */
void inplace_merge(int *a, int n, int mid) {
    int i = 0, j = mid;
    while (i < j && j < n) {
        if (a[i] <= a[j]) i++;
        else {
            int v = a[j];
            for (int k = j; k > i; k--) a[k] = a[k - 1]; /* a[i..j-1] 整段右移一格 */
            a[i++] = v;
            j++;
        }
    }
}

int main(void) {
    int a[] = {3, 8, 15, 22, 40, 1, 9, 10, 25, 30, 45};
    int n = sizeof a / sizeof a[0];
    inplace_merge(a, n, 5);
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
