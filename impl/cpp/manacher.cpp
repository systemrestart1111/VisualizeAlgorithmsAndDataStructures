#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

// 在字元間插入 #，奇偶長度回文統一處理；利用目前最右回文的對稱性，p[i] 可從鏡像位置繼承，O(n)
int main() {
    string s = "babcbabcbaccba", t = "#";
    for (char ch : s) { t += ch; t += '#'; }
    int n = (int)t.size();
    vector<int> p(n, 0);  // p[i] = 以 i 為中心的回文半徑（不含中心）
    for (int i = 0, c = 0, r = 0; i < n; i++) {
        if (i < r) p[i] = min(r - i, p[2 * c - i]);
        while (i - p[i] - 1 >= 0 && i + p[i] + 1 < n && t[i - p[i] - 1] == t[i + p[i] + 1]) p[i]++;
        if (i + p[i] > r) { c = i; r = i + p[i]; }
    }
    int best = (int)(max_element(p.begin(), p.end()) - p.begin());  // 同長度取最先出現的
    int start = (best - p[best]) / 2;
    cout << "longest palindrome = " << s.substr(start, p[best]) << "\nstart = " << start << " length = " << p[best] << "\n";
}
