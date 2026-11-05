#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

// 加上終止符 $，排序所有循環旋轉，取最後一欄
string bwt(string s) {
    s += '$';
    vector<string> rots;
    for (size_t i = 0; i < s.size(); i++) rots.push_back(s.substr(i) + s.substr(0, i));
    sort(rots.begin(), rots.end());
    string L;
    for (auto &r : rots) L += r.back();
    return L;
}
// LF 映射：L 中第 k 個 c 對應 F 中第 k 個 c；從 $ 所在列往回讀
string inverse(const string &L) {
    string F = L;
    sort(F.begin(), F.end());
    map<char, int> first, seen;
    for (int i = F.size() - 1; i >= 0; i--) first[F[i]] = i;
    vector<int> LF;
    for (char c : L) LF.push_back(first[c] + seen[c]++);
    int row = L.find('$');
    string out;
    for (size_t k = 0; k + 1 < L.size(); k++) { row = LF[row]; out = L[row] + out; }
    return out;
}

int main() {
    for (string s : {"banana", "abracadabra", "mississippi", "aaaa"}) {
        string L = bwt(s);
        cout << s << ": bwt " << L << ", inverse " << inverse(L) << "\n";
    }
}
