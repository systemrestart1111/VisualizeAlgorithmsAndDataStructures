#include <iostream>
#include <string>
#include <vector>
using namespace std;

// 每個起點都從頭逐字比較；不相符就把樣式右移一格
int main() {
    string t = "AABAACAADAABAABA", p = "AABA";
    int n = (int)t.size(), m = (int)p.size(), comparisons = 0;
    vector<int> matches;
    for (int s = 0; s + m <= n; s++) {
        int j = 0;
        while (j < m) {
            comparisons++;
            if (t[s + j] != p[j]) break;
            j++;
        }
        if (j == m) matches.push_back(s);
    }
    cout << "matches at:";
    for (int s : matches) cout << " " << s;
    cout << "\ncomparisons = " << comparisons << "\n";
}
