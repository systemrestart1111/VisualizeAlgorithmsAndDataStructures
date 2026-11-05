#include <stdio.h>

/* 以 i 結尾的最大和 = max(a[i], 前一個的最大和 + a[i])；同時記錄區間 */
int main(void) {
    int a[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4, 3, -2, 2};
    int n = sizeof a / sizeof a[0];
    int best = a[0], cur = a[0], start = 0, bl = 0, br = 0;
    for (int i = 1; i < n; i++) {
        if (cur < 0) { cur = a[i]; start = i; }
        else cur += a[i];
        if (cur > best) { best = cur; bl = start; br = i; }
    }
    printf("max sum = %d, range [%d, %d]\n", best, bl, br);
    return 0;
}
