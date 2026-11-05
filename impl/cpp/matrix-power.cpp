#include <array>
#include <iostream>
using namespace std;

typedef array<array<long long, 2>, 2> Mat;

Mat mul(const Mat& A, const Mat& B) {
    Mat C{};
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++) C[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j];
    return C;
}

// 與快速冪相同，只是把「數字相乘」換成「矩陣相乘」
Mat matPow(Mat M, long long n) {
    Mat R{};
    R[0][0] = R[1][1] = 1;
    for (; n; n >>= 1) {
        if (n & 1) R = mul(R, M);
        M = mul(M, M);
    }
    return R;
}

// [[1,1],[1,0]]^n = [[F(n+1), F(n)], [F(n), F(n-1)]]，O(log n) 求出第 n 項費氏數
int main() {
    int n = 25;
    Mat R = matPow(Mat{{{1, 1}, {1, 0}}}, n);
    cout << "M^" << n << " = [[" << R[0][0] << ", " << R[0][1] << "], [" << R[1][0] << ", " << R[1][1] << "]]\n";
    cout << "F(" << n << ") = " << R[0][1] << "\n";
}
