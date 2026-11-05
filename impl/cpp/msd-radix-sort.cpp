#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

// 依第 d 個字元分桶；在第 d 位已結束的字串放在最前面的結尾桶
vector<string> msd(const vector<string> &words, size_t d = 0) {
    if (words.size() <= 1) return words;
    vector<string> out;
    map<char, vector<string>> buckets;
    for (auto &w : words) {
        if (w.size() <= d) out.push_back(w);
        else buckets[w[d]].push_back(w);
    }
    for (auto &kv : buckets)
        for (auto &w : msd(kv.second, d + 1)) out.push_back(w);
    return out;
}
void show(const vector<string> &v) {
    for (size_t i = 0; i < v.size(); i++) cout << (i ? " " : "") << v[i];
    cout << "\n";
}

int main() {
    show(msd({"she", "sells", "sea", "shells", "by", "the", "sea", "shore", "app", "apple", "ape"}));
    show(msd({"b", "a", "", "ab", "abc", "aa", "a"}));
}
