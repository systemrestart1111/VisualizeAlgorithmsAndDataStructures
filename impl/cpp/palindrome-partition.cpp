#include <iostream>
#include <string>
#include <vector>
using namespace std;

// isPal 預算回文區間；cut[j] = 0（整段回文）或 min(cut[i−1] + 1)
void solve(const string &s) {
    int n = s.size();
    if (!n) { cout << "'': 0 cuts \n"; return; }
    vector<vector<bool>> P(n, vector<bool>(n));
    for (int len = 1; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) { int j = i + len - 1; P[i][j] = s[i] == s[j] && (len < 3 || P[i + 1][j - 1]); }
    vector<int> cut(n), prev(n);
    for (int j = 0; j < n; j++) {
        if (P[0][j]) { cut[j] = 0; prev[j] = 0; continue; }
        cut[j] = n;
        for (int i = 1; i <= j; i++) if (P[i][j] && cut[i - 1] + 1 < cut[j]) { cut[j] = cut[i - 1] + 1; prev[j] = i; }
    }
    vector<string> parts;
    for (int j = n - 1; j >= 0; j = prev[j] - 1) parts.insert(parts.begin(), s.substr(prev[j], j - prev[j] + 1));
    cout << "'" << s << "': " << cut[n - 1] << " cuts ";
    for (size_t i = 0; i < parts.size(); i++) cout << (i ? " | " : "") << parts[i];
    cout << "\n";
}

int main() {
    for (string s : {"aabbcbbdd", "aab", "racecar", "abcde", ""}) solve(s);
}
