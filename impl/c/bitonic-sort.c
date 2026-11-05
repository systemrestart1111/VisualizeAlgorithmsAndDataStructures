#include <stdio.h>

/* 雙調排序（n 為 2 的冪）：比較網路，每一層的比較互不相依，適合平行硬體 */
void bitonic_sort(int *a, int n) {
    for (int k = 2; k <= n; k *= 2)
        for (int j = k / 2; j > 0; j /= 2)
            for (int i = 0; i < n; i++) {
                int p = i ^ j;
                if (p > i) {
                    int up = (i & k) == 0;
                    if ((a[i] > a[p]) == up) { int t = a[i]; a[i] = a[p]; a[p] = t; }
                }
            }
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14};
    int n = sizeof a / sizeof a[0];
    bitonic_sort(a, n);
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
