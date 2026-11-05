#include <stdio.h>

/* 奇偶換位排序：交替比較 (奇, 偶) 與 (偶, 奇) 相鄰對，直到沒有交換 */
void odd_even_sort(int *a, int n) {
    int done = 0;
    while (!done) {
        done = 1;
        for (int start = 1; start >= 0; start--)
            for (int i = start; i + 1 < n; i += 2)
                if (a[i] > a[i + 1]) {
                    int t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
                    done = 0;
                }
    }
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    int n = sizeof a / sizeof a[0];
    odd_even_sort(a, n);
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
