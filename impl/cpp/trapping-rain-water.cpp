#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 雙指標：較矮那一側的最高牆決定該側水位
int trap(const vector<int> &h) {
    int l = 0, r = h.size() - 1, lm = 0, rm = 0, water = 0;
    while (l < r) {
        if (h[l] < h[r]) { lm = max(lm, h[l]); water += lm - h[l]; l++; }
        else { rm = max(rm, h[r]); water += rm - h[r]; r--; }
    }
    return water;
}
int baseline(const vector<int> &h) {
    int s = 0;
    for (size_t i = 0; i < h.size(); i++) s += min(*max_element(h.begin(), h.begin() + i + 1), *max_element(h.begin() + i, h.end())) - h[i];
    return s;
}

int main() {
    vector<vector<int>> tests = {{0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1}, {4, 2, 0, 3, 2, 5}, {1, 2, 3}, {5}};
    for (auto &h : tests) {
        cout << "[";
        for (size_t i = 0; i < h.size(); i++) cout << (i ? ", " : "") << h[i];
        cout << "] water: " << trap(h) << " baseline: " << baseline(h) << "\n";
    }
}
