#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

// z[i] = s 與 s[i:] 的最長共同前綴長度；利用目前最右的 Z-box [l, r) 避免重複比較，O(n)
vector<int> zFunction(const string& s) {
    int n = (int)s.size();
    vector<int> z(n, 0);
    for (int i = 1, l = 0, r = 0; i < n; i++) {
        if (i < r) z[i] = min(r - i, z[i - l]);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    return z;
}

int main() {
    string s = "aab$baabaaab";
    vector<int> z = zFunction(s);
    int m = (int)s.find('$');  // 把「樣式$文字」接起來，z[i] == len(樣式) 就是一次匹配
    cout << "z:";
    for (int x : z) cout << " " << x;
    cout << "\npattern " << s.substr(0, m) << " found in text at:";
    for (int i = 0; i < (int)s.size(); i++) if (z[i] == m) cout << " " << i - m - 1;
    cout << "\n";
}
