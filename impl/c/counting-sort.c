#include <stdio.h>
#include <string.h>

/* 統計每個值出現的次數，再用前綴和決定每個元素的最終位置（穩定） */
void counting_sort(const int *a, int *out, int n, int k) {
    int cnt[64];
    memset(cnt, 0, sizeof cnt);
    for (int i = 0; i < n; i++) cnt[a[i]]++;
    for (int v = 1; v < k; v++) cnt[v] += cnt[v - 1];
    for (int i = n - 1; i >= 0; i--) out[--cnt[a[i]]] = a[i];
}

int main(void) {
    int a[] = {4, 2, 7, 1, 4, 9, 3, 2, 7, 0, 5, 4, 8, 1}, out[14];
    int n = sizeof a / sizeof a[0], k = 0;
    for (int i = 0; i < n; i++) if (a[i] + 1 > k) k = a[i] + 1;
    counting_sort(a, out, n, k);
    for (int i = 0; i < n; i++) printf("%d%c", out[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
