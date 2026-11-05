#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

// 好後綴規則：已比對成功的後綴，在樣式中前一次出現的位置（或與前綴重疊的部分）決定可安全移動的距離
vector<int> goodSuffixTable(const string& p) {
    int m = (int)p.size(), i = m, j = m + 1;
    vector<int> shift(m + 1, 0), border(m + 1, 0);
    border[i] = j;
    while (i > 0) {
        while (j <= m && p[i - 1] != p[j - 1]) {
            if (shift[j] == 0) shift[j] = j - i;
            j = border[j];
        }
        border[--i] = --j;
    }
    j = border[0];
    for (i = 0; i <= m; i++) {
        if (shift[i] == 0) shift[i] = j;
        if (i == j) j = border[j];
    }
    return shift;
}

// 由右往左比較；失配時取「壞字元規則」與「好後綴規則」中移得較遠的那個
int main() {
    string t = "HERE IS A SIMPLE EXAMPLE", p = "EXAMPLE";
    int n = (int)t.size(), m = (int)p.size();
    vector<int> last(256, -1), gs = goodSuffixTable(p), matches, tries;
    for (int i = 0; i < m; i++) last[(unsigned char)p[i]] = i;  // 壞字元：該字元在樣式中最後出現的位置
    for (int s = 0; s <= n - m;) {
        tries.push_back(s);
        int j = m - 1;
        while (j >= 0 && p[j] == t[s + j]) j--;
        if (j < 0) { matches.push_back(s); s += gs[0]; }
        else s += max(gs[j + 1], j - last[(unsigned char)t[s + j]]);
    }
    cout << "alignments tried:";
    for (int s : tries) cout << " " << s;
    cout << "\nmatches at:";
    for (int s : matches) cout << " " << s;
    cout << "\n";
}
