#include <stdio.h>
#include <string.h>

typedef long long Mat[2][2];

void mat_mul(Mat A, Mat B, Mat out) {
    Mat C;
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++) C[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j];
    memcpy(out, C, sizeof C);
}

/* 與快速冪相同，只是把「數字相乘」換成「矩陣相乘」 */
void mat_pow(Mat M, long long n, Mat R) {
    Mat base;
    memcpy(base, M, sizeof base);
    R[0][0] = R[1][1] = 1;
    R[0][1] = R[1][0] = 0;
    for (; n; n >>= 1) {
        if (n & 1) mat_mul(R, base, R);
        mat_mul(base, base, base);
    }
}

/* [[1,1],[1,0]]^n = [[F(n+1), F(n)], [F(n), F(n-1)]]，O(log n) 求出第 n 項費氏數 */
int main(void) {
    Mat M = {{1, 1}, {1, 0}}, R;
    int n = 25;
    mat_pow(M, n, R);
    printf("M^%d = [[%lld, %lld], [%lld, %lld]]\nF(%d) = %lld\n", n, R[0][0], R[0][1], R[1][0], R[1][1], n, R[0][1]);
    return 0;
}
