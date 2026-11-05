#include <cctype>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
using M = vector<vector<int>>;

int m26(int x) { return ((x % 26) + 26) % 26; }

// 2×2 金鑰在 mod 26 的反矩陣；det 與 26 不互質時回傳空矩陣
M inverseKey(const M &K) {
    int d = m26(K[0][0] * K[1][1] - K[0][1] * K[1][0]), di = -1;
    for (int x = 1; x < 26; x++) if (d * x % 26 == 1) di = x;
    if (di < 0) return {};
    return {{m26(K[1][1] * di), m26(-K[0][1] * di)}, {m26(-K[1][0] * di), m26(K[0][0] * di)}};
}
string hill(const string &text, const M &K) {
    vector<int> t;
    for (char ch : text) if (isalpha((unsigned char)ch)) t.push_back(toupper((unsigned char)ch) - 'A');
    if (t.size() % 2) t.push_back(23);  // 補 X
    string out;
    for (size_t i = 0; i < t.size(); i += 2)
        for (int r = 0; r < 2; r++) out += char('A' + m26(K[r][0] * t[i] + K[r][1] * t[i + 1]));
    return out;
}

int main() {
    M K = {{3, 3}, {2, 5}}, Ki = inverseKey(K);
    cout << "K^-1 = [[" << Ki[0][0] << ", " << Ki[0][1] << "], [" << Ki[1][0] << ", " << Ki[1][1] << "]]\n";
    string c = hill("HELP ME", K);
    cout << "cipher: " << c << "\n";
    cout << "plain : " << hill(c, Ki) << "\n";
    cout << "key [[2,4],[6,8]] invertible: " << (inverseKey({{2, 4}, {6, 8}}).empty() ? "False" : "True") << "\n";
}
