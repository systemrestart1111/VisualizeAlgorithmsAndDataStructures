#include <stdio.h>

int calls = 0;
long long memo[100];

/* 單純遞迴：同一個子問題被重複計算，呼叫次數呈指數成長 */
long long fib_naive(int n) {
    calls++;
    return n < 2 ? n : fib_naive(n - 1) + fib_naive(n - 2);
}

/* 記憶化遞迴：每個子問題只算一次（memo 初值 -1 表示尚未計算） */
long long fib_memo(int n) {
    if (n < 2) return n;
    if (memo[n] >= 0) return memo[n];
    return memo[n] = fib_memo(n - 1) + fib_memo(n - 2);
}

int main(void) {
    int n = 6;
    for (int i = 0; i < 100; i++) memo[i] = -1;
    long long a = fib_naive(n);
    printf("naive fib(%d) = %lld, calls = %d\n", n, a, calls);
    printf("memo  fib(%d) = %lld\n", n, fib_memo(n));
    /* 表格法：由小到大填表 */
    long long t[100] = {0, 1};
    for (int i = 2; i <= n; i++) t[i] = t[i - 1] + t[i - 2];
    printf("table:");
    for (int i = 0; i <= n; i++) printf(" %lld", t[i]);
    printf("\n");
    return 0;
}
