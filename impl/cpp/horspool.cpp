#include <iostream>
#include <string>
#include <vector>
using namespace std;

// 只用「視窗最右端那個文字字元」決定移動量：shift[c] = 它在樣式（不含最後一字）中最後出現處到結尾的距離
int main() {
    string t = "JIM SAW ME IN A BARBERSHOP", p = "BARBER";
    int n = (int)t.size(), m = (int)p.size();
    vector<int> shift(256, m), matches, tries;
    for (int i = 0; i < m - 1; i++) shift[(unsigned char)p[i]] = m - 1 - i;
    for (int s = 0; s <= n - m; s += shift[(unsigned char)t[s + m - 1]]) {
        tries.push_back(s);
        int j = m - 1;
        while (j >= 0 && p[j] == t[s + j]) j--;
        if (j < 0) matches.push_back(s);
    }
    cout << "alignments tried:";
    for (int s : tries) cout << " " << s;
    cout << "\nmatches at:";
    for (int s : matches) cout << " " << s;
    cout << "\n";
}
