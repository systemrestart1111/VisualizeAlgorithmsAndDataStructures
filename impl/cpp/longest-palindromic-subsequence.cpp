#include <iostream>
#include <string>
#include <vector>
using namespace std;

// L[i][j]：兩端相同 → L[i+1][j−1] + 2；不同 → max(L[i+1][j], L[i][j−1])
void lps(const string &s) {
    int n = s.size();
    vector<vector<int>> L(n, vector<int>(n));
    for (int i = 0; i < n; i++) L[i][i] = 1;
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            L[i][j] = s[i] == s[j] ? (len > 2 ? L[i + 1][j - 1] : 0) + 2 : max(L[i + 1][j], L[i][j - 1]);
        }
    string left, right;
    for (int i = 0, j = n - 1; i <= j;) {
        if (i == j) { left += s[i]; break; }
        if (s[i] == s[j]) { left += s[i]; right = s[j] + right; i++; j--; }
        else if (L[i + 1][j] >= L[i][j - 1]) i++;
        else j--;
    }
    cout << s << ": " << L[0][n - 1] << " (" << left + right << ")\n";
}

int main() {
    for (string s : {"BBABCBCAB", "CHARACTER", "AGBDBA", "X"}) lps(s);
}
