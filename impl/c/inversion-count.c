#include <stdio.h>
#include <string.h>

/* 合併排序：右邊元素先被取出時，左半剩下的都比它大；相等先取左邊（不算逆序） */
long long count(int *a, int n) {
    if (n <= 1) return 0;
    int m = n / 2, tmp[64];
    long long c = count(a, m) + count(a + m, n - m);
    int i = 0, j = m, k = 0;
    while (i < m || j < n) {
        if (j == n || (i < m && a[i] <= a[j])) tmp[k++] = a[i++];
        else { c += m - i; tmp[k++] = a[j++]; }
    }
    memcpy(a, tmp, n * sizeof(int));
    return c;
}

void run(const int *src, int n) {
    int a[64], brute = 0;
    memcpy(a, src, n * sizeof(int));
    for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) if (src[i] > src[j]) brute++;
    printf("[");
    for (int i = 0; i < n; i++) printf(i ? ", %d" : "%d", src[i]);
    printf("] inversions: %lld brute: %d\n", count(a, n), brute);
}

int main(void) {
    int a[] = {8, 4, 2, 1, 7, 3, 5, 3}, b[] = {1, 2, 3}, c[] = {3, 3, 3}, d[] = {5, 4, 3, 2, 1};
    run(a, 8); run(b, 3); run(c, 3); run(d, 5);
    return 0;
}
