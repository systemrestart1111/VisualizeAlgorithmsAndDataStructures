#include <stdio.h>

int s[8][8];

void paren(int i, int j) {
    if (i == j) { printf("A%d", i); return; }
    printf("(");
    paren(i, s[i][j]);
    paren(s[i][j] + 1, j);
    printf(")");
}

/* m[i][j] = 計算 A_i..A_j 的最少純量乘法數；枚舉最後一次相乘的切點 k */
int main(void) {
    long long p[] = {30, 35, 15, 5, 10, 20, 25}, m[8][8] = {{0}}; /* 矩陣 i 的大小為 p[i-1] x p[i] */
    int n = 6;
    for (int len = 2; len <= n; len++)
        for (int i = 1; i + len - 1 <= n; i++) {
            int j = i + len - 1;
            m[i][j] = -1;
            for (int k = i; k < j; k++) {
                long long cost = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j];
                if (m[i][j] < 0 || cost < m[i][j]) { m[i][j] = cost; s[i][j] = k; }
            }
        }
    printf("min multiplications = %lld\norder: ", m[1][n]);
    paren(1, n);
    printf("\n");
    return 0;
}
