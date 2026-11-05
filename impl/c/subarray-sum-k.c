#include <stdio.h>

/* 以前綴和 p 結尾的子陣列個數 = 之前出現過幾次前綴和 p − k；先查詢再登錄
   前綴和範圍小，用平移後的計數陣列代替雜湊表 */
#define OFF 1000
int count_k(const int *a, int n, int k) {
    static int cnt[2 * OFF + 1];
    int p = 0, ans = 0;
    for (int i = 0; i <= 2 * OFF; i++) cnt[i] = 0;
    cnt[OFF] = 1;
    for (int i = 0; i < n; i++) {
        p += a[i];
        int q = p - k + OFF;
        if (q >= 0 && q <= 2 * OFF) ans += cnt[q];
        cnt[p + OFF]++;
    }
    return ans;
}

void run(const int *a, int n, int k) {
    int brute = 0;
    for (int i = 0; i < n; i++) { int s = 0; for (int j = i; j < n; j++) { s += a[j]; if (s == k) brute++; } }
    printf("[");
    for (int i = 0; i < n; i++) printf(i ? ", %d" : "%d", a[i]);
    printf("] k = %d -> %d brute: %d\n", k, count_k(a, n, k), brute);
}

int main(void) {
    int a[] = {1, 2, -1, 3, 0, -2, 4, 1, -3}, b[] = {0, 0, 0}, c[] = {1, -1, 1, -1}, d[] = {5};
    run(a, 9, 3); run(b, 3, 0); run(c, 4, 0); run(d, 1, 3);
    return 0;
}
