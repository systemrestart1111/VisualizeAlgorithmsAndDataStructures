#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>
using namespace std;

// 依結束時間排序，每次選最早結束、且不與已選區間重疊的活動
int main() {
    vector<pair<int, int>> iv = {{1, 4}, {3, 5}, {0, 6}, {5, 7}, {3, 9}, {5, 9}, {6, 10}, {8, 11}, {8, 12}, {2, 14}, {12, 16}};
    stable_sort(iv.begin(), iv.end(), [](const pair<int, int>& a, const pair<int, int>& b) { return a.second < b.second; });
    int end = INT_MIN, cnt = 0;
    cout << "selected:";
    for (auto& p : iv)
        if (p.first >= end) { cout << " [" << p.first << "," << p.second << ")"; end = p.second; cnt++; }
    cout << "\ncount = " << cnt << "\n";
}
