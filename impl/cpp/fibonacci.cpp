#include <iostream>
#include <vector>
using namespace std;

int calls = 0;
vector<long long> memo(100, -1);

// 單純遞迴：同一個子問題被重複計算，呼叫次數呈指數成長
long long fibNaive(int n) {
    calls++;
    return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2);
}

// 記憶化遞迴：每個子問題只算一次
long long fibMemo(int n) {
    if (n < 2) return n;
    if (memo[n] >= 0) return memo[n];
    return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
}

int main() {
    int n = 6;
    long long a = fibNaive(n);
    cout << "naive fib(" << n << ") = " << a << ", calls = " << calls << "\n";
    cout << "memo  fib(" << n << ") = " << fibMemo(n) << "\n";
    // 表格法：由小到大填表
    vector<long long> t(n + 1, 0);
    if (n >= 1) t[1] = 1;
    for (int i = 2; i <= n; i++) t[i] = t[i - 1] + t[i - 2];
    cout << "table:";
    for (long long x : t) cout << " " << x;
    cout << "\n";
}
