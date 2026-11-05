#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

// 發牌到「牌頂 ≥ x」的最左牌堆；再用最小堆積多路合併各堆牌頂
pair<vector<int>, int> patienceSort(const vector<int> &a) {
    vector<vector<int>> piles;
    vector<int> tops;
    for (int x : a) {
        size_t i = lower_bound(tops.begin(), tops.end(), x) - tops.begin();
        if (i == piles.size()) { piles.push_back({x}); tops.push_back(x); }
        else { piles[i].push_back(x); tops[i] = x; }
    }
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    for (size_t i = 0; i < piles.size(); i++) pq.push({piles[i].back(), (int)i});
    vector<int> out;
    while (!pq.empty()) {
        int x = pq.top().first, i = pq.top().second;
        pq.pop();
        out.push_back(x);
        piles[i].pop_back();
        if (!piles[i].empty()) pq.push({piles[i].back(), i});
    }
    return {out, (int)tops.size()};
}

int main() {
    auto r = patienceSort({6, 3, 9, 2, 8, 3, 7, 1, 5, 4, 9});
    cout << "piles: " << r.second << "\nsorted:";
    for (int x : r.first) cout << " " << x;
    cout << "\n";
}
