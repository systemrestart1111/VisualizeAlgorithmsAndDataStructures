#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;

// 試除法：從 2 開始除，能整除就一直除；試到 √n 為止，剩下的若大於 1 就是最後一個質因數
vector<pair<long long, int>> factorize(long long n) {
    vector<pair<long long, int>> f;
    for (long long d = 2; d * d <= n; d++) {
        int e = 0;
        while (n % d == 0) { n /= d; e++; }
        if (e) f.push_back({d, e});
    }
    if (n > 1) f.push_back({n, 1});
    return f;
}

int main() {
    auto f = factorize(360360);
    cout << "360360 =";
    for (size_t i = 0; i < f.size(); i++) {
        cout << (i ? " x " : " ") << f[i].first;
        if (f[i].second > 1) cout << "^" << f[i].second;
    }
    cout << "\n";
}
