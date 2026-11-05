#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

// 字典預先放入所有單一字元（0..255）；持續延長 w，遇到不在字典裡的 w+c 就輸出 w 的編號並把 w+c 加入字典
int main() {
    string s = "TOBEORNOTTOBEORTOBEORNOT", w;
    map<string, int> dict;
    vector<string> added;
    for (int i = 0; i < 256; i++) dict[string(1, (char)i)] = i;
    vector<int> codes;
    for (char ch : s) {
        if (dict.count(w + ch)) { w += ch; continue; }
        codes.push_back(dict[w]);
        dict[w + ch] = 256 + (int)added.size();
        added.push_back(w + ch);
        w = string(1, ch);
    }
    if (!w.empty()) codes.push_back(dict[w]);
    cout << "codes:";
    for (int c : codes) cout << " " << c;
    cout << "\nnew entries:";
    for (size_t i = 0; i < added.size(); i++) cout << " " << 256 + i << ":" << added[i];
    // 解碼：特殊情況是編號剛好是正要建立的那一個
    vector<string> inv(256);
    for (int i = 0; i < 256; i++) inv[i] = string(1, (char)i);
    string prev = inv[codes[0]], out = prev;
    for (size_t i = 1; i < codes.size(); i++) {
        string entry = codes[i] < (int)inv.size() ? inv[codes[i]] : prev + prev[0];
        out += entry;
        inv.push_back(prev + entry[0]);
        prev = entry;
    }
    cout << "\n" << s.size() << " chars -> " << codes.size() << " codes, decode ok: " << (out == s ? "True" : "False") << "\n";
}
