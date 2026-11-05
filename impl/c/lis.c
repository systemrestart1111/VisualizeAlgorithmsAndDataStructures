#include <stdio.h>

int main(void) {
    int a[] = {10, 9, 2, 5, 3, 7, 101, 18, 4, 20}, n = 10, dp[10], parent[10];
    /* O(n²)：dp[i] = 以 a[i] 結尾的最長遞增子序列長度 */
    for (int i = 0; i < n; i++) {
        dp[i] = 1; parent[i] = -1;
        for (int j = 0; j < i; j++)
            if (a[j] < a[i] && dp[j] + 1 > dp[i]) { dp[i] = dp[j] + 1; parent[i] = j; }
    }
    int end = 0;
    for (int i = 1; i < n; i++) if (dp[i] > dp[end]) end = i; /* 同長度取最先出現的結尾 */
    int seq[10], len = 0;
    for (int e = end; e >= 0; e = parent[e]) seq[len++] = a[e];
    printf("LIS length = %d\none LIS =", dp[end]);
    for (int k = len - 1; k >= 0; k--) printf(" %d", seq[k]);
    printf("\n");
    /* O(n log n)：tails[k] = 長度 k+1 的遞增子序列最小可能結尾，用二分搜尋更新 */
    int tails[10], nt = 0;
    for (int i = 0; i < n; i++) {
        int lo = 0, hi = nt;
        while (lo < hi) { int mid = (lo + hi) / 2; if (tails[mid] < a[i]) lo = mid + 1; else hi = mid; }
        tails[lo] = a[i];
        if (lo == nt) nt++;
    }
    printf("tails:");
    for (int k = 0; k < nt; k++) printf(" %d", tails[k]);
    printf("\n");
    return 0;
}
