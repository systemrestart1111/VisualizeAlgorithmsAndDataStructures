#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

// 依開始時間處理；最小堆積存 (結束時間, 教室編號)，最早空出的教室若來得及就沿用，否則開新教室
int main() {
    vector<pair<int, int>> iv = {{0, 3}, {1, 4}, {2, 6}, {4, 7}, {5, 9}, {6, 8}, {7, 10}, {9, 12}, {8, 11}, {11, 13}};
    sort(iv.begin(), iv.end());
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> heap;
    int rooms = 0;
    for (auto& p : iv) {
        int r;
        if (!heap.empty() && heap.top().first <= p.first) { r = heap.top().second; heap.pop(); }
        else r = rooms++;
        heap.push({p.second, r});
        cout << "[" << p.first << "," << p.second << ") -> room " << r << "\n";
    }
    cout << "rooms needed = " << rooms << "\n";
}
