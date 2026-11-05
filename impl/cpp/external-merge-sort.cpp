#include <algorithm>
#include <iostream>
#include <queue>
#include <tuple>
#include <vector>
using namespace std;

// 記憶體只能放 m 筆：先切成長度 m 的有序 run，再用最小堆積做 k 路合併
vector<int> externalSort(const vector<int>& data, int m) {
    vector<vector<int>> runs;
    for (size_t i = 0; i < data.size(); i += m) {
        vector<int> r(data.begin() + i, data.begin() + min(data.size(), i + m));
        sort(r.begin(), r.end());
        cout << "run " << runs.size() << ":";
        for (int x : r) cout << " " << x;
        cout << "\n";
        runs.push_back(r);
    }
    typedef tuple<int, int, int> T;  // (值, run 編號, run 內位置)
    priority_queue<T, vector<T>, greater<T>> pq;
    for (int i = 0; i < (int)runs.size(); i++) pq.emplace(runs[i][0], i, 0);
    vector<int> out;
    while (!pq.empty()) {
        int v, i, j;
        tie(v, i, j) = pq.top();
        pq.pop();
        out.push_back(v);
        if (j + 1 < (int)runs[i].size()) pq.emplace(runs[i][j + 1], i, j + 1);
    }
    return out;
}

int main() {
    vector<int> data = {41, 7, 63, 22, 88, 15, 34, 70, 2, 56, 29, 93, 11, 47, 80, 38, 5, 66};
    vector<int> s = externalSort(data, 4);
    cout << "merged:";
    for (int x : s) cout << " " << x;
    cout << "\n";
}
