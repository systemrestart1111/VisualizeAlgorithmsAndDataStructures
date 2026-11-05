#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

// 以前綴和 p 結尾的子陣列個數 = 之前出現過幾次前綴和 p − k；先查詢再登錄
int countK(const vector<int> &a, int k) {
    unordered_map<int, int> cnt{{0, 1}};
    int p = 0, ans = 0;
    for (int x : a) {
        p += x;
        auto it = cnt.find(p - k);
        if (it != cnt.end()) ans += it->second;
        cnt[p]++;
    }
    return ans;
}

int main() {
    vector<pair<vector<int>, int>> tests = {{{1, 2, -1, 3, 0, -2, 4, 1, -3}, 3}, {{0, 0, 0}, 0}, {{1, -1, 1, -1}, 0}, {{5}, 3}};
    for (auto &t : tests) {
        auto &a = t.first;
        int brute = 0;
        for (size_t i = 0; i < a.size(); i++) { int s = 0; for (size_t j = i; j < a.size(); j++) { s += a[j]; if (s == t.second) brute++; } }
        cout << "[";
        for (size_t i = 0; i < a.size(); i++) cout << (i ? ", " : "") << a[i];
        cout << "] k = " << t.second << " -> " << countK(a, t.second) << " brute: " << brute << "\n";
    }
}
