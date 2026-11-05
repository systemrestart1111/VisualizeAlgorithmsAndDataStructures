#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Knuth 的 Algorithm X：挑候選最少的欄，逐一嘗試涵蓋它的列；選了某列就移除它的所有欄與衝突的列，失敗再還原
// （舞蹈鏈 Dancing Links 是用雙向環狀鏈結串列讓「移除／還原」變成 O(1) 的實作方式，搜尋邏輯相同）
const int NC = 7;
vector<string> names = {"A", "B", "C", "D", "E", "F"};
vector<vector<int>> sets = {{1, 4, 7}, {1, 4}, {4, 5, 7}, {3, 5, 6}, {2, 3, 6, 7}, {2, 7}};
vector<bool> active(6, true), covered(NC + 1, false);
vector<int> sol;
int total = 0;

bool has(int r, int c) { return find(sets[r].begin(), sets[r].end(), c) != sets[r].end(); }

void search() {
    int col = -1, best = 1 << 30;
    for (int c = 1; c <= NC; c++) {
        if (covered[c]) continue;
        int k = 0;
        for (int r = 0; r < 6; r++) k += active[r] && has(r, c);
        if (k < best) { best = k; col = c; }  // 同數量時取編號小的欄
    }
    if (col < 0) {
        vector<int> s = sol;
        sort(s.begin(), s.end());
        cout << "solution: {";
        for (size_t i = 0; i < s.size(); i++) cout << (i ? " " : "") << names[s[i]];
        cout << "}\n";
        total++;
        return;
    }
    for (int r = 0; r < 6; r++) {
        if (!active[r] || !has(r, col)) continue;
        sol.push_back(r);
        vector<int> removed;
        for (int r2 = 0; r2 < 6; r2++) {
            if (!active[r2]) continue;
            for (int c : sets[r])
                if (has(r2, c)) { removed.push_back(r2); break; }
        }
        for (int c : sets[r]) covered[c] = true;
        for (int r2 : removed) active[r2] = false;
        search();
        for (int r2 : removed) active[r2] = true;  // 還原
        for (int c : sets[r]) covered[c] = false;
        sol.pop_back();
    }
}

int main() {
    search();
    cout << "total solutions = " << total << "\n";
}
