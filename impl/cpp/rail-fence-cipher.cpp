#include <algorithm>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>
using namespace std;

// 讀出順序：依（所在軌道, 原位置）排序
vector<int> orderOf(int n, int rails) {
    vector<int> row(n), order(n);
    for (int i = 0, r = 0, d = 1; i < n; i++) {
        row[i] = r;
        if (rails > 1) { if (r == 0) d = 1; else if (r == rails - 1) d = -1; r += d; }
    }
    iota(order.begin(), order.end(), 0);
    stable_sort(order.begin(), order.end(), [&](int a, int b) { return row[a] < row[b]; });
    return order;
}
string encrypt(const string &t, int rails) {
    string out;
    for (int i : orderOf((int)t.size(), rails)) out += t[i];
    return out;
}
string decrypt(const string &c, int rails) {
    string out(c.size(), ' ');
    vector<int> o = orderOf((int)c.size(), rails);
    for (size_t k = 0; k < c.size(); k++) out[o[k]] = c[k];
    return out;
}

int main() {
    string c = encrypt("WEAREDISCOVERED", 3);
    cout << "cipher: " << c << "\n";
    cout << "plain : " << decrypt(c, 3) << "\n";
    cout << "1 rail: " << encrypt("HELLO", 1) << "\n";
    cout << "short : " << encrypt("AB", 5) << " " << decrypt(encrypt("AB", 5), 5) << "\n";
}
