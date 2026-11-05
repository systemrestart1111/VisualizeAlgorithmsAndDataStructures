#include <stdio.h>

long long state = 42;

/* Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1 */
int rand_int(int k) {
    state = state * 48271 % 2147483647;
    return (int)(state % k);
}

int main(void) {
    int a[12], n = 12;
    for (int i = 0; i < n; i++) a[i] = i + 1;
    /* 由後往前，每個位置 i 與 0..i 中隨機一格交換；每種排列出現的機率都是 1/n! */
    for (int i = n - 1; i > 0; i--) {
        int j = rand_int(i + 1), t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
    printf("shuffled:");
    for (int i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
    return 0;
}
