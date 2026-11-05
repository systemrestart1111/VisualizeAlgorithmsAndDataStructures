#include <stdio.h>
#include <string.h>

/* 一次處理一個位元：含第 b 位的 mask 加上「去掉第 b 位」的值 */
static void sos(const int *a, int N, int *F) {
    memcpy(F, a, N * sizeof(int));
    for (int b = 0; (1 << b) < N; b++)
        for (int m = 0; m < N; m++) if (m >> b & 1) F[m] += F[m ^ (1 << b)];
}
static int ok(const int *a, int N, const int *F) {
    for (int m = 0; m < N; m++) {
        int s = 0;
        for (int sub = m;; sub = (sub - 1) & m) { s += a[sub]; if (!sub) break; }
        if (s != F[m]) return 0;
    }
    return 1;
}

int main(void) {
    int a[8] = {3, 1, 4, 1, 5, 9, 2, 6}, F[16], b[16];
    sos(a, 8, F);
    printf("F:");
    for (int i = 0; i < 8; i++) printf(" %d", F[i]);
    printf("\nmatches brute force: %s\n", ok(a, 8, F) ? "True" : "False");
    for (int i = 0; i < 16; i++) b[i] = i + 1;
    sos(b, 16, F);
    printf("F (16):");
    for (int i = 0; i < 16; i++) printf(" %d", F[i]);
    printf(" | ok: %s\n", ok(b, 16, F) ? "True" : "False");
    return 0;
}
