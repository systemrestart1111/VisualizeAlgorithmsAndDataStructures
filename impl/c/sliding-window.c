#include <stdio.h>

/* 固定長度 k：加入右邊新元素、減去左邊離開的元素 */
int max_window_sum(const int *a, int n, int k, int *at) {
    int s = 0;
    for (int i = 0; i < k; i++) s += a[i];
    int best = s;
    *at = 0;
    for (int i = k; i < n; i++) { s += a[i] - a[i - k]; if (s > best) { best = s; *at = i - k + 1; } }
    return best;
}

/* 可變視窗：只適用於元素皆為正；有非正數回傳 -1，不存在回傳 0 */
int min_len_at_least(const int *a, int n, int S) {
    for (int i = 0; i < n; i++) if (a[i] <= 0) return -1;
    int l = 0, s = 0, best = n + 1;
    for (int r = 0; r < n; r++) {
        s += a[r];
        while (s >= S) { if (r - l + 1 < best) best = r - l + 1; s -= a[l++]; }
    }
    return best > n ? 0 : best;
}

int main(void) {
    int a[] = {4, 2, 12, 1, 7, 9, 3, 2, 8, 5}, at, neg[] = {3, -1, 4};
    int best = max_window_sum(a, 10, 3, &at);
    printf("max sum of length 3: %d at %d\n", best, at);
    printf("shortest with sum >= 18: %d\n", min_len_at_least(a, 10, 18));
    printf("shortest with sum >= 100: %d\n", min_len_at_least(a, 10, 100));
    int r = min_len_at_least(neg, 3, 5);
    if (r < 0) printf("with negatives: not applicable\n"); else printf("with negatives: %d\n", r);
    return 0;
}
