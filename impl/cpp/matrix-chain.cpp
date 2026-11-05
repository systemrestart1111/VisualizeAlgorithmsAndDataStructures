#include <climits>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

vector<vector<int>> s;

string paren(int i, int j) {
    if (i == j) return "A" + to_string(i);
    return "(" + paren(i, s[i][j]) + paren(s[i][j] + 1, j) + ")";
}

// m[i][j] = 計算 A_i..A_j 的最少純量乘法數；枚舉最後一次相乘的切點 k
int main() {
    vector<long long> p = {30, 35, 15, 5, 10, 20, 25};  // 矩陣 i 的大小為 p[i-1] x p[i]
    int n = (int)p.size() - 1;
    vector<vector<long long>> m(n + 1, vector<long long>(n + 1, 0));
    s.assign(n + 1, vector<int>(n + 1, 0));
    for (int len = 2; len <= n; len++)
        for (int i = 1; i + len - 1 <= n; i++) {
            int j = i + len - 1;
            m[i][j] = LLONG_MAX;
            for (int k = i; k < j; k++) {
                long long cost = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j];
                if (cost < m[i][j]) { m[i][j] = cost; s[i][j] = k; }
            }
        }
    cout << "min multiplications = " << m[1][n] << "\norder: " << paren(1, n) << "\n";
}
