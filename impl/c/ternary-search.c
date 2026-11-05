#include <stdio.h>

/* a 先升後降（單峰）；每次取兩個三等分點，捨棄不可能含峰值的那一段 */
int ternary_search_peak(const int *a, int n) {
    int lo = 0, hi = n - 1;
    while (hi - lo > 2) {
        int m1 = lo + (hi - lo) / 3;
        int m2 = hi - (hi - lo) / 3;
        if (a[m1] < a[m2]) lo = m1 + 1;
        else hi = m2 - 1;
    }
    int best = lo;
    for (int i = lo + 1; i <= hi; i++)
        if (a[i] > a[best]) best = i;
    return best;
}

int main(void) {
    int a[] = {3, 9, 14, 22, 31, 40, 52, 47, 38, 26, 17, 11, 5};
    int p = ternary_search_peak(a, sizeof a / sizeof a[0]);
    printf("peak index = %d value = %d\n", p, a[p]);
    return 0;
}
