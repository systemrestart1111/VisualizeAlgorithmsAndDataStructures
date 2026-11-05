#include <stdio.h>

/* p[i] = a[0] + … + a[i-1]；區間和 a[l..r] = p[r+1] - p[l]，查詢 O(1) */
int main(void) {
    int a[] = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3}, p[11] = {0};
    int n = sizeof a / sizeof a[0];
    for (int i = 0; i < n; i++) p[i + 1] = p[i] + a[i];
    printf("prefix:");
    for (int i = 0; i <= n; i++) printf(" %d", p[i]);
    printf("\nsum[2..6] = %d\n", p[7] - p[2]);
    return 0;
}
