#include <iostream>
#include <string>
#include <vector>
using namespace std;

// 一次掃描維護 first 與 second；distinct=true 求第二大相異值，不存在回傳 "none"
string secondLargest(const vector<int> &a, bool distinct) {
    bool has1 = false, has2 = false;
    int first = 0, second = 0;
    for (int x : a) {
        if (!has1 || x > first) { if (has1) { second = first; has2 = true; } first = x; has1 = true; }
        else if (x == first) { if (!distinct) { second = x; has2 = true; } }
        else if (!has2 || x > second) { second = x; has2 = true; }
    }
    return has2 ? to_string(second) : "none";
}

int main() {
    vector<vector<int>> tests = {{12, 35, 1, 10, 34, 35, 1}, {5, 5, 3}, {7, 7, 7}, {4}};
    for (auto &a : tests) {
        cout << "[";
        for (size_t i = 0; i < a.size(); i++) cout << (i ? ", " : "") << a[i];
        cout << "] distinct: " << secondLargest(a, true) << " rank: " << secondLargest(a, false) << "\n";
    }
}
