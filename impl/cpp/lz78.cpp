#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

// 字典從空開始：找出字典中最長的前綴 w，輸出 (w 的編號, 下一個字元)，並把 w+字元 加入字典
int main() {
    string s = "ABBCBCABABCAABCAAB", w;
    map<string, int> dict;
    vector<string> order;
    cout << "output:";
    for (char ch : s) {
        if (dict.count(w + ch)) { w += ch; continue; }
        cout << " (" << (w.empty() ? 0 : dict[w]) << "," << ch << ")";
        dict[w + ch] = (int)order.size() + 1;
        order.push_back(w + ch);
        w.clear();
    }
    if (!w.empty()) cout << " (" << dict[w] << ",)";
    cout << "\ndictionary:";
    for (size_t i = 0; i < order.size(); i++) cout << " " << i + 1 << ":" << order[i];
    cout << "\n";
}
