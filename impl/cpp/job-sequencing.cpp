#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 依利潤由高到低考慮；每份工作排進「截止前最晚的空時段」，讓前面的時段留給截止較早的工作
int main() {
    vector<pair<int, int>> jobs = {{2, 100}, {1, 19}, {2, 27}, {1, 25}, {3, 15}, {3, 40}, {4, 30}};  // (截止時間, 利潤)
    int n = (int)jobs.size(), maxD = 0, total = 0;
    for (auto& j : jobs) maxD = max(maxD, j.first);
    vector<int> order(n), slot(maxD + 1, -1);
    for (int i = 0; i < n; i++) order[i] = i;
    stable_sort(order.begin(), order.end(), [&](int a, int b) { return jobs[a].second > jobs[b].second; });
    for (int i : order)
        for (int t = jobs[i].first; t >= 1; t--)
            if (slot[t] < 0) { slot[t] = i; total += jobs[i].second; break; }
    for (int t = 1; t <= maxD; t++) {
        if (slot[t] >= 0) cout << "slot " << t << ": J" << slot[t] + 1 << " (profit " << jobs[slot[t]].second << ")\n";
        else cout << "slot " << t << ": -\n";
    }
    cout << "total profit = " << total << "\n";
}
